package updater

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"openproxy/src/updater/discovery"
	"openproxy/src/updater/logger"
	"openproxy/src/updater/models"
	"openproxy/src/updater/redis"
	"openproxy/src/updater/repository"
	"openproxy/src/updater/worker"
)

// UpdateSync handles proxy server updates and synchronization
type UpdateSync struct {
	updateBuffer []models.Server
	ctx         context.Context
	log         *logrus.Logger
}

// NewUpdateSync creates a new UpdateSync instance
func NewUpdateSync() (*UpdateSync, error) {
	log := logger.GetLogger()

	if err := redis.Initialize(); err != nil {
		return nil, fmt.Errorf("failed to initialize redis: %w", err)
	}

	return &UpdateSync{
		updateBuffer: make([]models.Server, 0),
		ctx:         context.Background(),
		log:         log,
	}, nil
}

// FindNew finds new servers and returns the number found
func (u *UpdateSync) FindNew() error {
	discoverer := discovery.NewProxyDiscovery()
	n, err := discoverer.FindNewProxies(u.ctx)
	if err != nil {
		return fmt.Errorf("failed to discover new proxies: %w", err)
	}
	u.log.WithField("count", n).Info("Added new servers")
	return nil
}

// GetUntested gets untested servers
func (u *UpdateSync) GetUntested() error {
	servers, err := repository.GetUntestedServers(u.ctx)
	if err != nil {
		return err
	}
	u.log.WithField("count", len(servers)).Info("Scheduled untested servers")
	u.updateBuffer = append(u.updateBuffer, servers...)
	return nil
}

// GetRecentlyActive gets recently active servers
func (u *UpdateSync) GetRecentlyActive() error {
	servers, err := repository.GetRecentlyActiveServers(u.ctx)
	if err != nil {
		return err
	}
	u.log.WithField("count", len(servers)).Info("Scheduled recently active servers")
	u.updateBuffer = append(u.updateBuffer, servers...)
	return nil
}

// GetWorking gets working servers
func (u *UpdateSync) GetWorking() error {
	servers, err := repository.GetWorkingServers(u.ctx)
	if err != nil {
		return err
	}
	u.log.WithField("count", len(servers)).Info("Scheduled working servers")
	u.updateBuffer = append(u.updateBuffer, servers...)
	return nil
}

// Revalidate revalidates the servers in the update buffer
func (u *UpdateSync) Revalidate() error {
	checker := worker.NewProxyChecker()
	var wg sync.WaitGroup
	errors := make(chan error, len(u.updateBuffer))
	semaphore := make(chan struct{}, 50) // Limit concurrent validations

	for i := range u.updateBuffer {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			semaphore <- struct{}{} // Acquire semaphore
			defer func() { <-semaphore }() // Release semaphore

			server := &u.updateBuffer[i]
			working, err := checker.ValidateProxy(server.URL)
			if err != nil {
				errors <- fmt.Errorf("failed to validate server %s: %w", server.ID, err)
				return
			}

			server.Working = working
			server.Tested = true
			server.LastCheck = time.Now()

			if err := repository.UpdateServerStatus(u.ctx, server.ID, working, true); err != nil {
				errors <- fmt.Errorf("failed to update server status %s: %w", server.ID, err)
			}
		}(i)
	}

	// Wait for all validations to complete
	wg.Wait()
	close(errors)

	// Check for any errors
	var errCount int
	for err := range errors {
		errCount++
		u.log.WithError(err).Error("Validation error occurred")
	}

	if errCount > 0 {
		u.log.WithField("error_count", errCount).Error("Multiple validation errors occurred")
		return fmt.Errorf("%d validation errors occurred", errCount)
	}

	return nil
}

// GetTested gets tested servers
func (u *UpdateSync) GetTested() error {
	servers, err := repository.GetTestedServers(u.ctx)
	if err != nil {
		return err
	}
	fmt.Printf("Scheduled %d servers for retesting.\n", len(servers))
	u.updateBuffer = append(u.updateBuffer, servers...)
	return nil
}

// RemoveDuplicates removes duplicate servers from the update buffer
func (u *UpdateSync) RemoveDuplicates() {
	seen := make(map[string]bool)
	j := 0
	for i, server := range u.updateBuffer {
		if !seen[server.ID] {
			seen[server.ID] = true
			if i != j {
				u.updateBuffer[j] = u.updateBuffer[i]
			}
			j++
		}
	}
	duplicatesRemoved := len(u.updateBuffer) - j
	u.updateBuffer = u.updateBuffer[:j]
	u.log.WithField("count", duplicatesRemoved).Info("Removed duplicate servers")
}

// Update updates the servers and clears the buffer
func (u *UpdateSync) Update() error {
	for _, server := range u.updateBuffer {
		if err := repository.SaveServer(u.ctx, server); err != nil {
			return fmt.Errorf("failed to save server %s: %w", server.ID, err)
		}
	}
	u.updateBuffer = u.updateBuffer[:0]
	fmt.Println("\n**********************\n")
	return nil
}

// Processes runs all the update processes
func (u *UpdateSync) Processes() error {
	u.updateBuffer = u.updateBuffer[:0]
	
	if err := u.FindNew(); err != nil {
		return fmt.Errorf("find new error: %w", err)
	}

	// Run concurrent operations
	errCh := make(chan error, 4)
	go func() { errCh <- u.GetUntested() }()
	go func() { errCh <- u.GetTested() }()
	go func() { errCh <- u.GetRecentlyActive() }()
	go func() { errCh <- u.GetWorking() }()

	// Wait for all operations and check for errors
	for i := 0; i < 4; i++ {
		if err := <-errCh; err != nil {
			return fmt.Errorf("concurrent operation error: %w", err)
		}
	}

	u.RemoveDuplicates()
	
	if err := u.Revalidate(); err != nil {
		return fmt.Errorf("revalidate error: %w", err)
	}

	if err := u.Update(); err != nil {
		return fmt.Errorf("update error: %w", err)
	}

	return nil
}

// Run starts the update sync process
func (u *UpdateSync) Run(shutdown chan struct{}) {
	u.log.Info("Starting update process")
	for {
		select {
		case <-shutdown:
			u.log.Info("Received shutdown signal, stopping updater")
			return
		default:
			if err := u.Processes(); err != nil {
				u.log.WithError(err).Error("Process error occurred")
				// Sleep a bit longer on error to avoid rapid retries
				time.Sleep(10 * time.Second)
			} else {
				u.log.Debug("Process completed successfully")
				// Normal sleep between iterations
				time.Sleep(5 * time.Second)
			}
		}
	}
}

// Cleanup performs any necessary cleanup before shutdown
func (u *UpdateSync) Cleanup() error {
	u.log.Info("Cleaning up updater resources")
	return redis.Close()
}


