#!/bin/bash

# KoData DAO Local Setup Script
# This script helps set up the development environment locally

set -e

echo "🚀 KoData DAO Local Setup Script"
echo "================================="

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        echo "   $2"
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "📋 Checking prerequisites..."
check_command "node" "Visit https://nodejs.org/"
check_command "pnpm" "Run: npm install -g pnpm"
check_command "psql" "Install PostgreSQL from https://postgresql.org/"
check_command "redis-cli" "Install Redis from https://redis.io/"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version $(node -v) is compatible"

# Install dependencies
echo "📦 Installing dependencies..."
echo "Installing frontend dependencies..."
pnpm install

echo "Installing backend dependencies..."
cd backend
pnpm install
cd ..

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from template..."
    cp backend/env.example backend/.env
    echo "📝 Please edit backend/.env with your configuration"
else
    echo "✅ backend/.env already exists"
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your configuration"
else
    echo "✅ .env.local already exists"
fi

# Database setup
echo "🗄️  Setting up database..."

# Check if database exists
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w kodata | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "Creating database and user..."
    psql -U postgres -c "CREATE DATABASE kodata;"
    psql -U postgres -c "CREATE USER kodata WITH PASSWORD 'kodata_password';"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kodata TO kodata;"
    echo "✅ Database 'kodata' created"
else
    echo "✅ Database 'kodata' already exists"
fi

# Redis check
echo "🔴 Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Please start Redis:"
    echo "   macOS: brew services start redis"
    echo "   Linux: sudo systemctl start redis-server"
    exit 1
fi

# Generate Prisma client and push schema
echo "🔧 Setting up Prisma..."
cd backend
pnpm run db:generate
pnpm run db:push
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your blockchain credentials"
echo "2. Edit .env.local with your frontend configuration"
echo "3. Start the development servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend && pnpm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   pnpm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For detailed instructions, see LOCAL_SETUP.md"
