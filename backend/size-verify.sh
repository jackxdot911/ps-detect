#!/bin/bash

# Clean existing modules
rm -rf layer/**/node_modules

# Install only production deps for each layer
cd layer/tfjs-node && npm install --production --no-optional && cd ../..
cd layer/common-node && npm install --production --no-optional && cd ../..

# Remove unnecessary files
find layer -name "*.md" -delete
find layer -name "*.ts" -delete
find layer -name "*.map" -delete
find layer -name "CHANGELOG" -delete
find layer -name "LICENSE" -delete

# Remove platform-specific binaries
rm -rf layer/tfjs-node/node_modules/@tensorflow/tfjs-node/deps/lib/*
rm -rf layer/tfjs-node/node_modules/canvas/build/Release/*.a

# Verify size
du -sh layer/tfjs-node
du -sh layer/common-node