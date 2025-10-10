@echo off
REM KoData DAO Local Setup Script for Windows
REM This script helps set up the development environment locally

echo 🚀 KoData DAO Local Setup Script
echo =================================

REM Check if required tools are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install it from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install it: npm install -g pnpm
    pause
    exit /b 1
) else (
    echo ✅ pnpm is installed
)

where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install it from https://postgresql.org/
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL is installed
)

where redis-cli >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Redis is not installed. Please install it from https://redis.io/
    pause
    exit /b 1
) else (
    echo ✅ Redis is installed
)

echo 📦 Installing dependencies...
echo Installing frontend dependencies...
pnpm install

echo Installing backend dependencies...
cd backend
pnpm install
cd ..

echo ⚙️  Setting up environment files...

if not exist "backend\.env" (
    echo Creating backend\.env from template...
    copy backend\env.example backend\.env
    echo 📝 Please edit backend\.env with your configuration
) else (
    echo ✅ backend\.env already exists
)

if not exist ".env.local" (
    echo Creating .env.local from template...
    copy env.example .env.local
    echo 📝 Please edit .env.local with your configuration
) else (
    echo ✅ .env.local already exists
)

echo 🗄️  Setting up database...
echo Please run the following commands in psql:
echo CREATE DATABASE kodata;
echo CREATE USER kodata WITH PASSWORD 'kodata_password';
echo GRANT ALL PRIVILEGES ON DATABASE kodata TO kodata;

echo 🔴 Checking Redis connection...
redis-cli ping >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Redis is not running. Please start Redis service
    pause
    exit /b 1
) else (
    echo ✅ Redis is running
)

echo 🔧 Setting up Prisma...
cd backend
pnpm run db:generate
pnpm run db:push
cd ..

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your blockchain credentials
echo 2. Edit .env.local with your frontend configuration
echo 3. Start the development servers:
echo.
echo    Terminal 1 (Backend):
echo    cd backend ^&^& pnpm run dev
echo.
echo    Terminal 2 (Frontend):
echo    pnpm run dev
echo.
echo 4. Open http://localhost:5173 in your browser
echo.
echo 📚 For detailed instructions, see LOCAL_SETUP.md
pause
