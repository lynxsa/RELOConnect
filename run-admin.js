#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting RELOConnect Admin Dashboard');
console.log('=====================================');

const adminPath = path.join(__dirname, 'apps', 'admin-dashboard');

// Change to admin dashboard directory and install dependencies
console.log('📦 Installing dependencies...');
exec(`cd "${adminPath}" && npm install`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing dependencies: ${error}`);
        return;
    }
    
    console.log('✅ Dependencies installed successfully');
    console.log('🏃‍♂️ Starting development server on port 3001...');
    
    // Start the development server
    exec(`cd "${adminPath}" && npm run dev`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting server: ${error}`);
            return;
        }
        
        console.log('✅ Admin dashboard started successfully!');
        console.log('🌐 Access at: http://localhost:3001');
    });
});
