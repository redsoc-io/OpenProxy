#!/bin/bash

while true; do
    echo "Starting updater process..."
    npm run updater
    
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo "Process completed successfully, restarting..."
        # Allow a brief pause for any file descriptors to close
        sleep 2
    else
        echo "Process failed with exit code $EXIT_CODE, restarting in 10 seconds..."
        sleep 10
    fi
done