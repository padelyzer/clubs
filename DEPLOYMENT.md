# Padelyzer Deployment Guide

## Critical Fixes Applied

This document outlines all the critical fixes and improvements made to the Padelyzer application.

### 🔧 Fixed Issues

#### 1. Next.js 15 Compatibility
- ✅ Fixed async `params` and `searchParams` in all page components
- ✅ Updated `/app/widget/[clubId]/page.tsx`
- ✅ Updated `/app/admin/clubs/[id]/page.tsx`
- ✅ Updated all admin pages with search parameters

#### 2. Security Implementation
- ✅ Implemented JWT authentication with proper validation
- ✅ Added rate limiting middleware for all endpoints
- ✅ Implemented input validation with Zod schemas
- ✅ Added CSRF protection
- ✅ Created secure middleware with proper headers

#### 3. Stripe Integration
- ✅ Implemented comprehensive error handling
- ✅ Added retry mechanisms for failed operations
- ✅ Proper webhook signature verification
- ✅ Environment validation for production

#### 4. WhatsApp/Twilio Integration
- ✅ Removed console.log statements
- ✅ Implemented real Twilio API integration
- ✅ Added proper error handling and retry logic
- ✅ Implemented bulk messaging with rate limiting

#### 5. Mobile App Configuration
- ✅ Updated API service with configurable URLs
- ✅ Fixed authentication flow with AsyncStorage
- ✅ Updated to use port 3002 for consistency

#### 6. Database Migration Ready
- ✅ Created PostgreSQL migration script
- ✅ Updated schema for dual database support
- ✅ Backup and rollback procedures

#### 7. Testing Suite
- ✅ Implemented Jest configuration
- ✅ Created mock services for testing
- ✅ Added test coverage for critical functions
- ✅ CI/CD ready test scripts

#### 8. Technical Debt Cleanup
- ✅ Replaced console.log with professional logging
- ✅ Implemented structured logging with context
- ✅ Added proper error handling throughout
- ✅ Configured proper development/production modes

## 🚀 Deployment Instructions

### Environment Variables Required

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
PLATFORM_FEE_PERCENTAGE="2.5"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_WHATSAPP_NUMBER="+14155238886"

# Template SIDs (get from Twilio Console)
TWILIO_TEMPLATE_BOOKING_CONFIRMATION="HX..."
TWILIO_TEMPLATE_BOOKING_REMINDER="HX..."
TWILIO_TEMPLATE_PAYMENT_PENDING="HX..."
TWILIO_TEMPLATE_BOOKING_CANCELLED="HX..."
TWILIO_TEMPLATE_PAYMENT_COMPLETED="HX..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Optional: Logging
LOG_ENDPOINT="https://your-logging-service.com/api/logs"
LOG_API_KEY="your_logging_api_key"
```

### 1. Database Setup

#### Option A: SQLite (Current)
```bash
npm run db:push
npm run db:seed
```

#### Option B: PostgreSQL Migration
```bash
# Set up PostgreSQL database first
# Then run migration script
npm run db:migrate-postgres

# Or manually with connection string
DATABASE_URL="postgresql://user:pass@host:5432/db" npm run db:migrate-postgres
```

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Run tests
npm run test:ci

# Security audit
npm run security:audit

# Build application
npm run build

# Start production server
npm start
```

### 3. Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Node.js Version: 18.x or higher

### 4. Health Checks

After deployment, verify:

- [ ] Authentication works (`/login`)
- [ ] Widget loads (`/widget/[clubId]`)
- [ ] Admin panel accessible (`/admin`)
- [ ] Stripe webhook endpoint working
- [ ] WhatsApp notifications sending
- [ ] Database connections stable

## 🔧 Development Setup

```bash
# Clone repository
git clone <repository-url>
cd bmad-nextjs-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

The application will run on http://localhost:3002

### Development Scripts

```bash
# Development with hot reload
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# Database operations
npm run db:studio      # Open Prisma Studio
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database

# Code formatting
npm run format
npm run format:check

# Security
npm run security:audit
npm run security:fix
```

## 📁 Project Structure

```
├── app/                    # Next.js 15 app directory
│   ├── (auth)/            # Protected routes
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── widget/            # Public widget
│   └── ...
├── components/            # Reusable components
├── lib/                   # Utilities and services
│   ├── auth/             # Authentication logic
│   ├── config/           # Configuration files
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── validation/       # Zod schemas
│   └── ...
├── prisma/               # Database schema and migrations
├── scripts/              # Utility scripts
├── __tests__/           # Test files
├── padelyzer-mobile/    # React Native app
└── ...
```

## 🛡️ Security Features

### Implemented Security Measures

1. **Authentication**
   - JWT with proper expiration
   - Secure cookie handling
   - Token blacklisting for logout

2. **Rate Limiting**
   - Endpoint-specific limits
   - IP-based tracking
   - Exponential backoff

3. **Input Validation**
   - Zod schema validation
   - SQL injection prevention
   - XSS protection

4. **Headers**
   - CSRF protection
   - Content Security Policy
   - Security headers (HSTS, X-Frame-Options, etc.)

### Security Checklist

- [ ] All environment variables secured
- [ ] HTTPS enabled in production
- [ ] Database credentials rotated
- [ ] Webhook secrets verified
- [ ] API keys restricted by domain
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Input validation active

## 🧪 Testing

### Test Coverage

Current test coverage includes:

- JWT authentication functions
- Input validation schemas
- API endpoint mocking
- Component rendering
- Error handling

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (no watch)
npm run test:ci
```

## 📊 Monitoring and Logging

### Logging System

The application uses a professional logging system with:

- Structured logging with context
- Different log levels (ERROR, WARN, INFO, DEBUG)
- Request tracking
- User activity logging
- Performance monitoring

### Log Categories

- `authLogger` - Authentication events
- `paymentLogger` - Payment processing
- `whatsappLogger` - WhatsApp notifications
- `bookingLogger` - Booking operations
- `stripeLogger` - Stripe events
- `adminLogger` - Admin actions
- `cronLogger` - Scheduled jobs

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify DATABASE_URL format
   - Check database permissions
   - Ensure database exists

2. **Stripe Webhooks**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Monitor webhook delivery in Stripe dashboard

3. **WhatsApp Messages**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure templates are approved

4. **Authentication Issues**
   - Check JWT_SECRET configuration
   - Verify cookie settings
   - Review CORS configuration

### Support

For technical support:
1. Check application logs
2. Review error details in monitoring
3. Verify environment configuration
4. Test individual components

## 📈 Performance Optimization

### Implemented Optimizations

- Database query optimization
- Proper caching strategies
- Rate limiting to prevent abuse
- Error retry mechanisms
- Connection pooling ready

### Recommendations

1. Use CDN for static assets
2. Implement Redis for session storage
3. Set up database connection pooling
4. Monitor and optimize slow queries
5. Implement proper cache invalidation

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Production Ready