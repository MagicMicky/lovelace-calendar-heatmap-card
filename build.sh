#!/bin/bash
echo "Building calendar-heatmap-card..."
docker build -t calendar-heatmap-card .
docker run --rm -v $(pwd)/dist:/app/dist calendar-heatmap-card
echo "Build completed successfully!"
