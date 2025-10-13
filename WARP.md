# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Padelyzer** is a comprehensive platform for managing padel/tennis clubs in Mexico. Built with Next.js 15.5.2, React 19.1.0, PostgreSQL, and Prisma 5.22.0, it provides club management, court reservations, tournaments, classes, payments, and notifications.

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Start with Docker database
npm run dev:docker

# Development setup (complete environment)
npm run dev:setup
```

### Database
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Push schema changes (dev only)
npm run db:push

# Reset database safely
npm run db:reset

# Seed development data
npm run seed:dev

# Seed production-ready data
npm run seed:complete
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests with Playwright
npm run test:e2e

# Debug E2E tests
npm run test:e2e:debug
```

### Code Quality
```bash
# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Check code formatting
npm run format:check

# Security audit
npm run security:audit
```

### Production
```bash
# Build application
npm run build

# Build for Vercel
npm run vercel-build

# Start production server
npm run start

# Production deployment checks
npm run pre-deploy
```

## Architecture Overview

### Multi-Module System
The application is built around 9 core modules:
- **Authentication**: Lucia Auth 3.2.2 with session management
- **Club Management**: Multi-tenant club system with Stripe Connect
- **Court Management**: Indoor/outdoor courts with QR codes
- **Booking System**: Individual and group reservations with split payments
- **Class System**: Group/private classes with instructor management
- **Tournament System**: V3 system with brackets and court assignments
- **Player Management**: Club member database with statistics
- **Payment Processing**: Stripe integration with multiple payment methods
- **Notifications**: Multi-channel (WhatsApp, Email, SMS) with templates

### Key Technologies
- **Frontend**: Next.js 15.5.2 App Router, React 19.1.0, Tailwind CSS 4.0
- **Backend**: API Routes (migrated from Server Actions for performance)
- **Database**: PostgreSQL with Prisma ORM, Row Level Security (RLS)
- **Auth**: Lucia Auth with role-based permissions (USER, CLUB_OWNER, CLUB_STAFF, SUPER_ADMIN)
- **Payments**: Stripe Connect with webhooks
- **Monitoring**: Sentry for error tracking, Axiom for logging
- **Testing**: Vitest for unit tests, Playwright for E2E

### Database Architecture
- **Multi-tenant**: All data scoped by `clubId`
- **Row Level Security**: PostgreSQL RLS policies for data isolation
- **Audit Trails**: `createdAt`/`updatedAt` timestamps on all models
- **Soft Deletes**: Most entities support cancellation rather than deletion

## Important Configuration Files

### Database
- `prisma/schema.prisma` - Database schema with comprehensive models
- `lib/config/prisma.ts` - Prisma client configuration
- `prisma/migrations/` - Database migrations

### Authentication
- `lib/auth/lucia.ts` - Lucia Auth configuration and helpers
- `lib/middleware/auth.ts` - Authentication middleware
- `middleware.ts` - Next.js middleware for security headers

### Environment Setup
- `.env.local` - Local development environment variables
- `.env.example` - Environment variable template
- `docker-compose.yml` - Local PostgreSQL setup

## Common Development Patterns

### API Routes Standard
All API routes follow RESTful conventions:
```typescript
// Standard response format
{
  success: boolean,
  data?: any,
  error?: string,
  pagination?: {
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }
}
```

### Authentication Helpers
```typescript
// Common auth patterns in API routes
import { requireAuthAPI } from '@/lib/middleware/auth';

export async function GET(request: Request) {
  const { user, clubId } = await requireAuthAPI(request);
  // Your logic here
}
```

### Database Queries
```typescript
// Always scope queries by clubId for multi-tenancy
const bookings = await prisma.booking.findMany({
  where: { clubId: user.clubId },
  include: { Court: true, Player: true }
});
```

## Testing Strategy

### Unit Tests (`__tests__/`)
- Authentication flows
- Business logic validation
- API route handlers
- Utility functions

### E2E Tests (Playwright)
- Complete user workflows
- Payment processing
- Tournament management
- Multi-club scenarios

### Test Commands for Specific Areas
```bash
# Test specific module
npm test -- bookings

# Test auth flows
npm test -- auth

# Test tournament system
npm run test:e2e -- tournaments
```

## Deployment Notes

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret key
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `TWILIO_*` - WhatsApp/SMS credentials

### Build Process
1. Generate Prisma client (`prisma generate`)
2. Run database migrations (`prisma migrate deploy`)
3. Build Next.js application (`next build`)

### Performance Considerations
- **API Routes over Server Actions** - 95% performance improvement achieved
- **Prisma Query Optimization** - Use includes/selects carefully
- **Image Optimization** - Next.js automatic optimization enabled
- **Caching** - API routes support CDN caching unlike Server Actions

## Troubleshooting Common Issues

### TypeScript Errors
```bash
# Fix includes/create issues
./fix_includes.py
./fix_prisma_create.py

# Fix TypeScript specific errors
./fix_ts2551_auto.py
```

### Database Issues
```bash
# Reset database safely
npm run db:reset

# Check database connection
npm run dev:health

# Migrate to PostgreSQL
npm run db:migrate-postgres
```

### Auth Issues
- Check session cookies in browser dev tools
- Verify `auth-session` cookie is set
- Ensure database has proper RLS policies

### Performance Issues
- API routes should respond in <1 second
- Use `requireAuthAPI` for authenticated endpoints
- Enable pagination for large datasets

## Security Considerations

### Row Level Security (RLS)
- All database access filtered by user's `clubId`
- Run `npm run db:setup-rls` to configure policies

### API Security
- Rate limiting configured with Upstash Redis
- Security headers in `middleware.ts`
- Input validation with Zod schemas

### Authentication
- Session-based auth with Lucia (not JWT)
- Secure cookies in production
- Role-based access control

## Mobile App Integration
The system supports a React Native mobile app (`padelyzer-mobile/`) that consumes the same API endpoints. All API routes are designed to work seamlessly with both web and mobile clients.