#!/bin/bash

# Stop all RELOConnect services and applications
echo "🛑 Stopping all RELOConnect applications..."

# Kill all processes on our ports
lsof -ti:3001,3002,3003,3000,8081,8082 | xargs kill -9 2>/dev/null || true

echo "✅ All applications stopped"
echo ""
echo "To restart all applications, run:"
echo "  cd /path/to/RELOConnect"
echo "  ./start-all.sh"
