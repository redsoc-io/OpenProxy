package worker

import (
	"crypto/tls"
	"net"
	"net/http"
	"net/url"
	"time"

	"github.com/sirupsen/logrus"
	"openproxy/src/updater/logger"
)

// ProxyChecker is responsible for validating proxy servers
type ProxyChecker struct {
	client *http.Client
	log    *logrus.Logger
}

// NewProxyChecker creates a new proxy checker instance
func NewProxyChecker() *ProxyChecker {
	return &ProxyChecker{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		log: logger.GetLogger(),
	}
}

// ValidateProxy checks if a proxy server is working
func (p *ProxyChecker) ValidateProxy(proxyURL string) (bool, error) {
	p.log.WithField("proxy_url", proxyURL).Debug("Starting proxy validation")
	
	proxyURLParsed, err := url.Parse(proxyURL)
	if err != nil {
		p.log.WithError(err).WithField("proxy_url", proxyURL).Error("Failed to parse proxy URL")
		return false, err
	}

	// Configure transport based on proxy type
	transport := &http.Transport{
		Proxy:           http.ProxyURL(proxyURLParsed),
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // Allow self-signed certs
		DialContext: (&net.Dialer{
			Timeout:   5 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   5 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	// Create a client with the proxy transport
	client := &http.Client{
		Transport: transport,
		Timeout:   10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return http.ErrUseLastResponse
			}
			return nil
		},
	}

	// Test URLs to try
	testURLs := []string{
		"https://www.google.com",
		"https://www.cloudflare.com",
		"https://www.example.com",
	}

	// Try each test URL
	for _, testURL := range testURLs {
		p.log.WithFields(logrus.Fields{
			"proxy_url": proxyURL,
			"test_url": testURL,
		}).Debug("Testing proxy with URL")

		req, err := http.NewRequest("GET", testURL, nil)
		if err != nil {
			p.log.WithError(err).WithFields(logrus.Fields{
				"proxy_url": proxyURL,
				"test_url": testURL,
			}).Debug("Failed to create request")
			continue
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

		resp, err := client.Do(req)
		if err != nil {
			p.log.WithError(err).WithFields(logrus.Fields{
				"proxy_url": proxyURL,
				"test_url": testURL,
			}).Debug("Failed to execute request")
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			p.log.WithFields(logrus.Fields{
				"proxy_url": proxyURL,
				"test_url": testURL,
			}).Info("Proxy validation successful")
			return true, nil
		}

		p.log.WithFields(logrus.Fields{
			"proxy_url": proxyURL,
			"test_url": testURL,
			"status_code": resp.StatusCode,
		}).Debug("Test URL returned non-200 status")
	}

	p.log.WithField("proxy_url", proxyURL).Info("Proxy validation failed - all test URLs failed")
	return false, nil
}
