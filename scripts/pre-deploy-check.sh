#!/bin/bash

# 🚀 Pre-Deployment Check Script
# Verifica que todo esté listo para deployment a producción

echo "=================================================="
echo "🚀 PRE-DEPLOYMENT CHECK - TORNEOS V2"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. CHECK GIT STATUS
echo "1. Checking Git status..."
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
else
    echo -e "${YELLOW}⚠ Warning: You have uncommitted changes${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo ""
    git status --short
    echo ""
fi

# 2. CHECK CURRENT BRANCH
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo ""
echo "2. Current branch: $BRANCH"
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠ Warning: Not on main/master branch${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 3. CHECK NODE MODULES
echo ""
echo "3. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules exists${NC}"
else
    echo -e "${RED}✗ Error: node_modules not found. Run 'npm install'${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. CHECK PRISMA SCHEMA
echo ""
echo "4. Checking Prisma schema..."
if npx prisma validate > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Prisma schema is valid${NC}"
else
    echo -e "${RED}✗ Error: Prisma schema has errors${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 5. CHECK MIGRATIONS
echo ""
echo "5. Checking migration status..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✓ All migrations applied${NC}"
elif echo "$MIGRATION_STATUS" | grep -q "have not yet been applied"; then
    echo -e "${YELLOW}⚠ Warning: Pending migrations detected${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo ""
    echo "$MIGRATION_STATUS" | grep "have not yet been applied" -A 5
    echo ""
    echo "Run: npx prisma migrate deploy"
else
    echo -e "${YELLOW}⚠ Could not verify migration status${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. CHECK ENV VARIABLES
echo ""
echo "6. Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"

    # Check critical vars
    if grep -q "DATABASE_URL=" .env.local; then
        echo -e "${GREEN}  ✓ DATABASE_URL is set${NC}"
    else
        echo -e "${RED}  ✗ DATABASE_URL not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi

    if grep -q "NEXTAUTH_SECRET=" .env.local; then
        echo -e "${GREEN}  ✓ NEXTAUTH_SECRET is set${NC}"
    else
        echo -e "${RED}  ✗ NEXTAUTH_SECRET not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ Error: .env.local not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 7. CHECK TYPESCRIPT
echo ""
echo "7. Checking TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠ Warning: TypeScript errors detected${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo ""
    npx tsc --noEmit | head -20
    echo ""
fi

# 8. CHECK LINTING
echo ""
echo "8. Checking ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No linting errors${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Linting errors detected${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 9. CHECK BUILD
echo ""
echo "9. Checking build (this may take a while)..."
if npm run build > build.log 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    rm build.log
else
    echo -e "${RED}✗ Error: Build failed${NC}"
    ERRORS=$((ERRORS + 1))
    echo ""
    echo "Last 30 lines of build output:"
    tail -30 build.log
    echo ""
    echo "Full build log saved to: build.log"
fi

# 10. CHECK SECURITY VULNERABILITIES
echo ""
echo "10. Checking npm security..."
AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1)
if echo "$AUDIT_OUTPUT" | grep -q "found 0"; then
    echo -e "${GREEN}✓ No high/critical vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Security vulnerabilities detected${NC}"
    WARNINGS=$((WARNINGS + 1))
    echo ""
    npm audit --audit-level=high | head -20
    echo ""
fi

# SUMMARY
echo ""
echo "=================================================="
echo "SUMMARY"
echo "=================================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. git push origin $BRANCH"
    echo "2. vercel --prod"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Warnings detected but no critical errors.${NC}"
    echo "Review warnings before deploying."
    exit 0
else
    echo -e "${RED}✗ Critical errors detected. Fix errors before deploying.${NC}"
    exit 1
fi
