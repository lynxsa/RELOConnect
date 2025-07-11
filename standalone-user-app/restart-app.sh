#!/bin/bash

# Kill any existing expo processes
pkill -f "expo"
pkill -f "node.*expo"

# Clear any expo cache
rm -rf ~/.expo
rm -rf .expo/

# Clear node_modules and reinstall
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies..."
npm install

echo "Starting app..."
npm start
