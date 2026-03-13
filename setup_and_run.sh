#!/bin/bash

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: npm install failed. Please ensure Node.js is installed and in your PATH."
    exit 1
fi

echo "Starting development server..."
npm run dev