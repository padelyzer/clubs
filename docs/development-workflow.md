# Development Workflow Guide

## Overview
This guide provides comprehensive instructions for developing on the Padelyzer platform with a focus on maintaining code quality, security, and reliability.

## Quick Start

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database (choose one option)
# Option A: Docker (recommended)
docker-compose up -d

# Option B: Cloud database (Neon/Supabase)
# Set DATABASE_URL in .env.local

# Run database migrations
npm run db:migrate
npm run db:generate
```

### 2. Development Server
```bash
# Start development server with hot reload
npm run dev

# Server runs on http://localhost:3002
```

### 3. Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Debug E2E tests
npm run test:e2e:debug
```

## Development Standards

### Code Quality
- **TypeScript**: All code must be properly typed
- **ESLint**: Code must pass linting without errors
- **Prettier**: Code must be formatted consistently
- **Tests**: All new features must include tests

### Security Requirements
- **Authentication**: Use Lucia Auth for all auth flows
- **Authorization**: Implement Row Level Security (RLS) for data access
- **Rate Limiting**: All API endpoints must be rate limited
- **Input Validation**: Use Zod schemas for all user inputs
- **Error Handling**: Structured error handling with Sentry

### Database Guidelines
- **PostgreSQL with RLS**: Multi-tenant data isolation
- **Migrations**: All schema changes through Prisma migrations
- **Transactions**: Use transactions for complex operations
- **Performance**: Include indexes for frequently queried fields

## Architecture Components

### Authentication & Authorization
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │ -> │   Lucia Auth    │ -> │  RLS Policies   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Lucia Auth**: Session-based authentication
- **RLS Policies**: Database-level data isolation
- **Middleware**: Rate limiting and security headers

### Testing Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Unit Tests    │    │ Integration     │    │   E2E Tests     │
│   (Vitest)      │    │   Tests         │    │  (Playwright)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Common Development Tasks

### Adding a New Feature
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/booking-system
   ```

2. **Write Tests First (TDD)**
   ```bash
   # Create test file
   touch tests/features/booking.test.ts
   
   # Write failing tests
   npm run test:watch
   ```

3. **Implement Feature**
   - Follow existing patterns
   - Use TypeScript interfaces
   - Add proper error handling
   - Include logging

4. **Validate Implementation**
   ```bash
   # Run all tests
   npm run test:ci
   
   # Run E2E tests
   npm run test:e2e
   
   # Check linting
   npm run lint
   
   # Type checking
   npm run type-check
   ```

### Database Changes
1. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_booking_table
   ```

2. **Update RLS Policies** (if needed)
   ```sql
   -- Add to prisma/migrations/rls-policies.sql
   CREATE POLICY "booking_access" ON "Booking"
     FOR ALL 
     USING ("clubId" = current_club_id());
   ```

3. **Apply RLS Changes**
   ```bash
   npm run db:setup-rls
   ```

### API Endpoint Development
1. **Create Route Handler**
   ```typescript
   // app/api/bookings/route.ts
   import { rateLimiters } from '@/lib/rate-limit'
   import { requireClubMembership } from '@/lib/auth/lucia'
   
   export async function POST(request: Request) {
     // Rate limiting
     const { success } = await rateLimiters.booking.limit('booking')
     if (!success) {
       return Response.json({ error: 'Too many requests' }, { status: 429 })
     }
     
     // Authentication
     const { user, clubId } = await requireClubMembership()
     
     // Validation & processing...
   }
   ```

2. **Add Tests**
   ```typescript
   // tests/api/bookings.test.ts
   describe('Bookings API', () => {
     it('should create booking with valid data', async () => {
       // Test implementation
     })
   })
   ```

## Debugging & Monitoring

### Development Debugging
```bash
# Enable debug mode
DEBUG=* npm run dev

# Database debugging
npx prisma studio

# Check logs
tail -f logs/app.log
```

### Production Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Axiom**: Structured logging and analytics
- **Upstash**: Rate limiting and caching metrics

## Performance Guidelines

### Frontend Optimization
- **Next.js App Router**: Use server components where possible
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Implement dynamic imports for large components
- **Caching**: Use appropriate caching strategies

### Database Performance
- **Indexing**: Add indexes for frequently queried fields
- **Query Optimization**: Use Prisma query optimization
- **Connection Pooling**: Configure appropriate pool sizes
- **RLS Performance**: Monitor RLS policy performance

## Security Checklist

### Pre-Production Security
- [ ] All inputs validated with Zod schemas
- [ ] Rate limiting implemented on all endpoints
- [ ] RLS policies tested and verified
- [ ] Authentication flows secure
- [ ] Error messages don't leak sensitive data
- [ ] Security headers configured
- [ ] Secrets properly managed
- [ ] Audit logs implemented

### Regular Security Tasks
- [ ] Run security audit: `npm run security:audit`
- [ ] Update dependencies: `npm update`
- [ ] Review access logs
- [ ] Test authentication flows
- [ ] Verify RLS policies

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check database status
docker-compose ps

# Reset database
docker-compose down -v
docker-compose up -d
npm run db:migrate
```

**Type Errors**
```bash
# Regenerate Prisma client
npm run db:generate

# Check TypeScript
npm run type-check
```

**Test Failures**
```bash
# Clear test cache
npx vitest --run --reporter=verbose

# Reset test database
npm run test:setup
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Security audit clean
- [ ] Performance benchmarks met
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Monitoring setup verified

### Deployment Process
1. Run full test suite
2. Build application
3. Run security checks
4. Deploy to staging
5. Run E2E tests on staging
6. Deploy to production
7. Verify health checks

## Getting Help

### Resources
- **Internal Documentation**: Check `/docs` folder
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Lucia Auth**: https://lucia-auth.com

### Support Channels
- **Code Reviews**: Create PR for peer review
- **Architecture Questions**: Check ADRs in `/docs/adr`
- **Security Concerns**: Follow security reporting process