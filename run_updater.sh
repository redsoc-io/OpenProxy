#!/bin/sh
cd "$(dirname "$0")"

# Create bin directory if it doesn't exist
mkdir -p bin

# Build the Go updater
go build -o bin/updater ./src/cmd/updater/

# Run the updater (it has its own internal retry loop)
./bin/updater