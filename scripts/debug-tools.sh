#!/bin/bash

# Debug Tools Script for Padelyzer
# Provides various debugging utilities for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🔍 $1${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_help() {
    echo "Padelyzer Debug Tools"
    echo ""
    echo "Usage: ./scripts/debug-tools.sh [command]"
    echo ""
    echo "Commands:"
    echo "  db-status    - Check database connection and basic info"
    echo "  db-reset     - Reset database (WARNING: destroys all data)"
    echo "  logs         - Show application logs"
    echo "  health       - Run health checks"
    echo "  test-auth    - Test authentication flow"
    echo "  test-rls     - Test Row Level Security policies"
    echo "  performance  - Run performance diagnostics"
    echo "  clean        - Clean build artifacts and caches"
    echo "  help         - Show this help message"
}

check_db_status() {
    print_header "Database Status Check"
    
    echo "🔗 Testing database connection..."
    
    # Test basic connection
    if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        echo "Check your DATABASE_URL in .env.local"
        return 1
    fi
    
    # Get database info
    echo ""
    echo "📊 Database Information:"
    npx prisma db execute --stdin <<< "
        SELECT 
            current_database() as database_name,
            current_user as current_user,
            inet_server_addr() as server_address,
            inet_server_port() as server_port,
            version() as version;
    " 2>/dev/null || echo "Could not retrieve database info"
    
    # Check tables
    echo ""
    echo "📋 Tables:"
    npx prisma db execute --stdin <<< "
        SELECT schemaname, tablename, tableowner 
        FROM pg_tables 
        WHERE schemaname = 'public';
    " 2>/dev/null || echo "Could not retrieve table info"
    
    # Check RLS policies
    echo ""
    echo "🔒 RLS Policies:"
    npx prisma db execute --stdin <<< "
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
        FROM pg_policies 
        WHERE schemaname = 'public';
    " 2>/dev/null || echo "No RLS policies found"
}

reset_database() {
    print_header "Database Reset"
    
    print_warning "This will destroy ALL data in the database!"
    read -p "Are you sure? (type 'yes' to confirm): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Database reset cancelled"
        return 0
    fi
    
    echo "🗑️  Resetting database..."
    
    # Reset database
    npx prisma migrate reset --force
    print_success "Database reset complete"
    
    # Regenerate client
    npm run db:generate
    print_success "Prisma client regenerated"
    
    # Setup RLS
    npm run db:setup-rls
    print_success "RLS policies applied"
}

show_logs() {
    print_header "Application Logs"
    
    echo "📝 Recent logs:"
    echo ""
    
    # Check for log files
    if [ -f "logs/app.log" ]; then
        tail -n 50 logs/app.log
    elif [ -f ".next/trace" ]; then
        echo "Next.js trace logs:"
        cat .next/trace
    else
        print_warning "No log files found"
        echo "Run the application to generate logs"
    fi
}

run_health_checks() {
    print_header "System Health Checks"
    
    # Check Node.js version
    echo "🟢 Node.js: $(node --version)"
    
    # Check npm version
    echo "📦 npm: $(npm --version)"
    
    # Check TypeScript
    if command -v tsc &> /dev/null; then
        echo "🔷 TypeScript: $(tsc --version)"
    else
        print_warning "TypeScript not found globally"
    fi
    
    # Check database connection
    echo ""
    echo "🗄️  Database:"
    if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        print_success "Database connection OK"
    else
        print_error "Database connection failed"
    fi
    
    # Check environment variables
    echo ""
    echo "🌍 Environment Variables:"
    if [ -f ".env.local" ]; then
        print_success ".env.local found"
        echo "Variables:"
        grep -v "^#" .env.local | grep "=" | cut -d'=' -f1 | sed 's/^/  - /'
    else
        print_warning ".env.local not found"
    fi
    
    # Check port availability
    echo ""
    echo "🔌 Port Check:"
    if lsof -i:3002 &> /dev/null; then
        print_warning "Port 3002 is in use"
        echo "Process using port 3002:"
        lsof -i:3002
    else
        print_success "Port 3002 is available"
    fi
}

test_auth_flow() {
    print_header "Authentication Flow Test"
    
    echo "🔐 Testing authentication functions..."
    
    # Create a test script
    cat > /tmp/auth-test.mjs << 'EOF'
import { validateRequest } from './lib/auth/lucia.js'

console.log('Testing auth validation...')
try {
    const result = await validateRequest()
    console.log('✅ Auth validation successful:', result)
} catch (error) {
    console.log('❌ Auth validation failed:', error.message)
}
EOF
    
    node /tmp/auth-test.mjs 2>/dev/null || print_warning "Auth test failed (this is normal without active session)"
    rm /tmp/auth-test.mjs
}

test_rls_policies() {
    print_header "Row Level Security Test"
    
    echo "🔒 Testing RLS policies..."
    
    # Test current_club_id function
    echo "Testing current_club_id() function:"
    npx prisma db execute --stdin <<< "SELECT current_club_id() as current_club;" 2>/dev/null || print_warning "current_club_id() function not available"
    
    # Test RLS policies exist
    echo ""
    echo "Checking RLS policies:"
    npx prisma db execute --stdin <<< "
        SELECT COUNT(*) as policy_count 
        FROM pg_policies 
        WHERE schemaname = 'public';
    " 2>/dev/null || print_warning "Could not check RLS policies"
}

run_performance_check() {
    print_header "Performance Diagnostics"
    
    echo "⚡ Running performance checks..."
    
    # Check bundle size
    if [ -d ".next" ]; then
        echo "📦 Build size:"
        du -sh .next/* 2>/dev/null | sort -hr | head -10
    else
        print_warning "No build found. Run 'npm run build' first"
    fi
    
    # Check node_modules size
    echo ""
    echo "📚 Dependencies size:"
    du -sh node_modules 2>/dev/null || print_warning "node_modules not found"
    
    # Memory usage
    echo ""
    echo "🧠 Memory usage:"
    ps aux | grep -E "(node|npm)" | grep -v grep || echo "No Node.js processes found"
}

clean_project() {
    print_header "Cleaning Project"
    
    echo "🧹 Cleaning build artifacts and caches..."
    
    # Remove build artifacts
    rm -rf .next
    print_success "Removed .next directory"
    
    # Remove Prisma generated files
    rm -rf node_modules/.prisma
    print_success "Removed Prisma cache"
    
    # Clear npm cache
    npm cache clean --force
    print_success "Cleared npm cache"
    
    # Remove test artifacts
    rm -rf coverage
    rm -rf test-results
    print_success "Removed test artifacts"
    
    echo ""
    print_success "Project cleaned successfully"
    echo "Run 'npm install' and 'npm run db:generate' to restore"
}

# Main command dispatcher
case "${1:-help}" in
    "db-status")
        check_db_status
        ;;
    "db-reset")
        reset_database
        ;;
    "logs")
        show_logs
        ;;
    "health")
        run_health_checks
        ;;
    "test-auth")
        test_auth_flow
        ;;
    "test-rls")
        test_rls_policies
        ;;
    "performance")
        run_performance_check
        ;;
    "clean")
        clean_project
        ;;
    "help"|*)
        show_help
        ;;
esac