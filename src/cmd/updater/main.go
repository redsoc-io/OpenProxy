package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"openproxy/src/updater"
	"openproxy/src/updater/health"
	"openproxy/src/updater/logger"
)

func main() {
	log := logger.GetLogger()

	log.Info("Initializing OpenProxy updater service")
	
	syncService, err := updater.NewUpdateSync()
	if err != nil {
		log.WithError(err).Fatal("Failed to initialize updater")
	}

	// Set up signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	shutdown := make(chan struct{})

	// Start health check server
	healthServer := health.NewServer(8080)
	go func() {
		if err := healthServer.Start(); err != nil && err != http.ErrServerClosed {
			log.WithError(err).Error("Health check server error")
		}
	}()

	// Start the updater in a goroutine
	go syncService.Run(shutdown)

	// Wait for shutdown signal
	sig := <-sigChan
	log.WithField("signal", sig).Info("Received shutdown signal")

	// Signal the updater to stop
	close(shutdown)

	// Shutdown health check server
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := healthServer.Shutdown(ctx); err != nil {
		log.WithError(err).Error("Health check server shutdown error")
	}

	// Cleanup updater
	if err := syncService.Cleanup(); err != nil {
		log.WithError(err).Error("Error during cleanup")
	}

	log.Info("Updater service shutdown complete")
}
