package discovery

import (
	"context"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"openproxy/src/updater/logger"
	"openproxy/src/updater/models"
	"openproxy/src/updater/repository"
)

type ProxyDiscovery struct {
	client *http.Client
	log    *logrus.Logger
}

func NewProxyDiscovery() *ProxyDiscovery {
	return &ProxyDiscovery{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		log: logger.GetLogger(),
	}
}

// FindNewProxies discovers new proxy servers from various sources
func (d *ProxyDiscovery) FindNewProxies(ctx context.Context) (int, error) {
	sources := []string{
		"https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
		"https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt",
		"https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt",
		// Add more sources as needed
	}

	d.log.Info("Starting proxy discovery from sources")
	
	total := 0
	for _, source := range sources {
		d.log.WithField("source", source).Debug("Processing proxy source")
		count, err := d.processSource(ctx, source)
		if err != nil {
			d.log.WithError(err).WithField("source", source).Error("Failed to process proxy source")
			return total, err
		}
		d.log.WithFields(logrus.Fields{
			"source": source,
			"count": count,
		}).Info("Successfully processed proxy source")
		total += count
	}

	return total, nil
}

func (d *ProxyDiscovery) processSource(ctx context.Context, sourceURL string) (int, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", sourceURL, nil)
	if err != nil {
		d.log.WithError(err).WithField("source", sourceURL).Error("Failed to create request")
		return 0, err
	}

	resp, err := d.client.Do(req)
	if err != nil {
		d.log.WithError(err).WithField("source", sourceURL).Error("Failed to fetch proxy list")
		return 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		d.log.WithError(err).WithField("source", sourceURL).Error("Failed to read response body")
		return 0, err
	}

	// Process the response and save new servers
	servers := d.parseProxyList(string(body))
	count := 0

	for _, serverURL := range servers {
		server := models.Server{
			ID:        serverURL, // Using URL as ID for now
			URL:       serverURL,
			LastCheck: time.Time{}, // Zero time indicates never checked
			Working:   false,
			Tested:    false,
		}

		if err := repository.SaveServer(ctx, server); err != nil {
			d.log.WithError(err).WithField("server_url", serverURL).Error("Failed to save proxy server")
			continue
		}
		d.log.WithField("server_url", serverURL).Debug("Saved new proxy server")
		count++
	}

	d.log.WithFields(logrus.Fields{
		"source": sourceURL,
		"count": count,
	}).Debug("Completed processing source")
	return count, nil
}

func (d *ProxyDiscovery) parseProxyList(content string) []string {
	// Split content by newlines and filter out empty lines
	lines := strings.Split(content, "\n")
	proxies := make([]string, 0, len(lines))

	for _, line := range lines {
		// Trim whitespace and skip empty lines
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Add scheme if not present
		if !strings.HasPrefix(line, "http://") && !strings.HasPrefix(line, "socks://") {
			line = "http://" + line
		}

		proxies = append(proxies, line)
	}

	return proxies
}
