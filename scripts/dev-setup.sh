#!/bin/bash

# Development Setup Script for Padelyzer
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Setting up Padelyzer development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version check passed: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
print_status "Dependencies installed"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_status ".env.local created from .env.example"
        print_warning "Please edit .env.local with your configuration before continuing"
    else
        print_error ".env.example not found. Please create .env.local manually"
        exit 1
    fi
else
    print_status ".env.local already exists"
fi

# Database setup options
echo ""
echo "🗄️  Database Setup Options:"
echo "1. Docker (recommended for local development)"
echo "2. Cloud database (Neon/Supabase)"
echo "3. Skip database setup (already configured)"

read -p "Choose an option (1-3): " db_option

case $db_option in
    1)
        echo "🐳 Setting up PostgreSQL with Docker..."
        
        # Check if Docker is running
        if ! docker info &> /dev/null; then
            print_error "Docker is not running. Please start Docker first."
            exit 1
        fi
        
        # Start PostgreSQL with Docker Compose
        docker-compose up -d postgres
        print_status "PostgreSQL container started"
        
        # Wait for PostgreSQL to be ready
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Set database URL
        export DATABASE_URL="postgresql://padelyzer:padelyzer_dev_2024@localhost:5432/padelyzer_dev"
        echo "DATABASE_URL=\"postgresql://padelyzer:padelyzer_dev_2024@localhost:5432/padelyzer_dev\"" >> .env.local
        ;;
    2)
        print_warning "Please set your DATABASE_URL in .env.local"
        print_warning "Example: DATABASE_URL=\"postgresql://user:pass@host:5432/database\""
        read -p "Press Enter when DATABASE_URL is configured..."
        ;;
    3)
        print_status "Skipping database setup"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# Run database setup
if [ "$db_option" != "3" ]; then
    echo "🔧 Setting up database schema..."
    
    # Generate Prisma client
    npm run db:generate
    print_status "Prisma client generated"
    
    # Run migrations
    npm run db:migrate
    print_status "Database migrations completed"
    
    # Setup RLS policies (if PostgreSQL)
    if [ "$db_option" = "1" ] || [ "$db_option" = "2" ]; then
        echo "🔒 Setting up Row Level Security policies..."
        npm run db:setup-rls 2>/dev/null || print_warning "RLS setup failed (this is normal for first run)"
    fi
fi

# Install Playwright browsers (optional)
read -p "Install Playwright browsers for E2E testing? (y/n): " install_playwright
if [ "$install_playwright" = "y" ] || [ "$install_playwright" = "Y" ]; then
    echo "🎭 Installing Playwright browsers..."
    npx playwright install
    print_status "Playwright browsers installed"
fi

# Final setup
echo "🔧 Running final setup checks..."

# Type checking
npm run type-check
print_status "TypeScript compilation successful"

# Linting
npm run lint --fix 2>/dev/null || print_warning "Linting issues found (some may be auto-fixed)"

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.local with your configuration"
echo "2. Start the development server: npm run dev"
echo "3. Run tests: npm run test"
echo "4. Open http://localhost:3002 in your browser"
echo ""
print_status "Happy coding! 🚀"