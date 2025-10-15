#!/bin/bash

# Azure VM Deployment Script for KoData DAO
# This script sets up the application on an Azure VM

set -e

echo "🚀 Starting KoData DAO deployment on Azure VM..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and log back in, then run this script again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.production.example .env
    echo "⚠️  Please edit .env file with your actual values before continuing!"
    echo "   - Set POSTGRES_PASSWORD to a secure password"
    echo "   - Set JWT_SECRET to a secure random string"
    echo "   - Set FRONTEND_URL to your Azure VM's public IP or domain"
    echo "   - Set VITE_API_URL to your Azure VM's public IP or domain"
    echo "   - Configure Starknet and Lisk credentials if needed"
    read -p "Press Enter after editing .env file..."
fi

# Pull latest images and build
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.production.yml ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.production.yml exec backend pnpm run db:push

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your application should be available at:"
echo "   Frontend: http://$(curl -s ifconfig.me):80"
echo "   Backend API: http://$(curl -s ifconfig.me):3001"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "🔄 To restart services:"
echo "   docker-compose -f docker-compose.production.yml restart"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.production.yml down"
