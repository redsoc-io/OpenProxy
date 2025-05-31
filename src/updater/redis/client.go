package redis

import (
	"context"
	"os"

	"github.com/go-redis/redis/v8"
	"openproxy/src/updater/logger"
)

var (
	ctx = context.Background()
	rdb *redis.Client
)

// Initialize creates a new Redis client
func Initialize() error {
	log := logger.GetLogger()
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	log.WithField("url", redisURL).Debug("Initializing Redis client")

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.WithError(err).Error("Failed to parse Redis URL")
		return err
	}

	rdb = redis.NewClient(opt)

	// Test the connection
	_, err = rdb.Ping(ctx).Result()
	if err != nil {
		log.WithError(err).Error("Failed to connect to Redis")
		return err
	}

	log.Info("Successfully connected to Redis")
	return nil
}

// GetClient returns the Redis client instance
func GetClient() *redis.Client {
	return rdb
}

// Close closes the Redis connection
func Close() error {
	log := logger.GetLogger()
	if err := rdb.Close(); err != nil {
		log.WithError(err).Error("Failed to close Redis connection")
		return err
	}
	log.Info("Redis connection closed successfully")
	return nil
}
