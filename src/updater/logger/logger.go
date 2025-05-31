package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

var log = logrus.New()

func init() {
	// Set default logging format to JSON for better parsing
	log.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02T15:04:05.000Z07:00",
	})

	// Output to stdout
	log.SetOutput(os.Stdout)

	// Set log level based on environment
	if os.Getenv("DEBUG") == "true" {
		log.SetLevel(logrus.DebugLevel)
	} else {
		log.SetLevel(logrus.InfoLevel)
	}
}

// GetLogger returns the configured logger instance
func GetLogger() *logrus.Logger {
	return log
}

// Fields type for structured logging
type Fields = logrus.Fields
