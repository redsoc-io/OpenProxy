package health

import (
"context"
"encoding/json"
"fmt"
"log"
"net/http"
"time"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string    `json:"status"`
	Uptime    string    `json:"uptime"`
	StartTime time.Time `json:"startTime"`
}

// Server represents the health check HTTP server
type Server struct {
	startTime time.Time
	port      int
	server    *http.Server
}

// NewServer creates a new health check server instance
func NewServer(port int) *Server {
	return &Server{
		startTime: time.Now(),
		port:      port,
	}
}

// Start begins listening for HTTP requests
func (s *Server) Start() error {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", s.handleHealth)

	s.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.port),
		Handler: mux,
	}

	log.Printf("Starting health check server on port %d", s.port)
	return s.server.ListenAndServe()
}

// Shutdown gracefully stops the server
func (s *Server) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}

// handleHealth handles health check requests
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Uptime:    time.Since(s.startTime).Round(time.Second).String(),
		StartTime: s.startTime,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
