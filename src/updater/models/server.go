package models

import (
	"encoding/json"
	"time"
)

// Server represents a proxy server
type Server struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	LastCheck time.Time `json:"last_check"`
	Working   bool      `json:"working"`
	Tested    bool      `json:"tested"`
}

// ServerList represents a list of servers
type ServerList struct {
	Servers []Server `json:"servers"`
}

// ToJSON converts a server to JSON string
func (s *Server) ToJSON() (string, error) {
	data, err := json.Marshal(s)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// FromJSON creates a server from JSON string
func (s *Server) FromJSON(data string) error {
	return json.Unmarshal([]byte(data), s)
}
