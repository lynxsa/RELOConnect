const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting RELOConnect Admin Dashboard');
console.log('=====================================');

const adminDashboardPath = path.join(__dirname, 'apps', 'admin-dashboard');

// Change to admin dashboard directory
process.chdir(adminDashboardPath);

console.log('📦 Installing dependencies...');

// Install dependencies
const install = spawn('npm', ['install'], { stdio: 'inherit' });

install.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Dependencies installed successfully');
        console.log('🏃‍♂️ Starting development server on port 3001...');
        
        // Start the development server
        const dev = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
        
        dev.on('close', (code) => {
            console.log(`Admin dashboard exited with code ${code}`);
        });
    } else {
        console.error(`Dependency installation failed with code ${code}`);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down admin dashboard...');
    process.exit(0);
});
