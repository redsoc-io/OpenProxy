package repository

import (
	"context"
	"time"

	"openproxy/src/updater/models"
	"openproxy/src/updater/redis"
)

const (
	serverSetKey       = "servers"
	workingSetKey     = "working_servers"
	untestedSetKey    = "untested_servers"
	recentActiveKey   = "recent_active_servers"
	testedSetKey      = "tested_servers"
)

// SaveServer saves a server to Redis
func SaveServer(ctx context.Context, server models.Server) error {
	client := redis.GetClient()
	
	// Convert server to JSON
	serverJSON, err := server.ToJSON()
	if err != nil {
		return err
	}

	// Save server data
	if err := client.HSet(ctx, serverSetKey, server.ID, serverJSON).Err(); err != nil {
		return err
	}

	// Update appropriate sets based on server status
	if server.Working {
		client.SAdd(ctx, workingSetKey, server.ID)
	}
	if !server.Tested {
		client.SAdd(ctx, untestedSetKey, server.ID)
	}
	if server.LastCheck.After(time.Now().Add(-24 * time.Hour)) {
		client.SAdd(ctx, recentActiveKey, server.ID)
	}
	if server.Tested {
		client.SAdd(ctx, testedSetKey, server.ID)
	}

	return nil
}

// GetServer retrieves a server from Redis
func GetServer(ctx context.Context, id string) (*models.Server, error) {
	client := redis.GetClient()
	
	serverJSON, err := client.HGet(ctx, serverSetKey, id).Result()
	if err != nil {
		return nil, err
	}

	var server models.Server
	if err := server.FromJSON(serverJSON); err != nil {
		return nil, err
	}

	return &server, nil
}

// GetServers retrieves multiple servers by their IDs
func GetServers(ctx context.Context, ids []string) ([]models.Server, error) {
	client := redis.GetClient()
	
	if len(ids) == 0 {
		return []models.Server{}, nil
	}

	// Get all servers in one call
	serversJSON, err := client.HMGet(ctx, serverSetKey, ids...).Result()
	if err != nil {
		return nil, err
	}

	servers := make([]models.Server, 0, len(ids))
	for _, serverJSON := range serversJSON {
		if serverJSON == nil {
			continue
		}

		var server models.Server
		if err := server.FromJSON(serverJSON.(string)); err != nil {
			return nil, err
		}
		servers = append(servers, server)
	}

	return servers, nil
}

// GetUntestedServers retrieves all untested servers
func GetUntestedServers(ctx context.Context) ([]models.Server, error) {
	client := redis.GetClient()
	
	ids, err := client.SMembers(ctx, untestedSetKey).Result()
	if err != nil {
		return nil, err
	}

	return GetServers(ctx, ids)
}

// GetWorkingServers retrieves all working servers
func GetWorkingServers(ctx context.Context) ([]models.Server, error) {
	client := redis.GetClient()
	
	ids, err := client.SMembers(ctx, workingSetKey).Result()
	if err != nil {
		return nil, err
	}

	return GetServers(ctx, ids)
}

// GetRecentlyActiveServers retrieves recently active servers
func GetRecentlyActiveServers(ctx context.Context) ([]models.Server, error) {
	client := redis.GetClient()
	
	ids, err := client.SMembers(ctx, recentActiveKey).Result()
	if err != nil {
		return nil, err
	}

	return GetServers(ctx, ids)
}

// GetTestedServers retrieves all tested servers
func GetTestedServers(ctx context.Context) ([]models.Server, error) {
	client := redis.GetClient()
	
	ids, err := client.SMembers(ctx, testedSetKey).Result()
	if err != nil {
		return nil, err
	}

	return GetServers(ctx, ids)
}

// UpdateServerStatus updates a server's status
func UpdateServerStatus(ctx context.Context, id string, working bool, tested bool) error {
	server, err := GetServer(ctx, id)
	if err != nil {
		return err
	}

	server.Working = working
	server.Tested = tested
	server.LastCheck = time.Now()

	return SaveServer(ctx, *server)
}
