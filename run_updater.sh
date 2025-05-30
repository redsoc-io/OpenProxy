#!/bin/bash

while true; do
    echo "Starting updater process..."
    exec npm run updater || {
        echo "Process failed, restarting in 5 seconds..."
        sleep 5
    }
done