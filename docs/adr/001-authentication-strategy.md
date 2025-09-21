# ADR-001: Authentication Strategy

## Status
Accepted

## Context
The Padelyzer application requires a robust authentication system that supports:
- Multi-tenant architecture (club isolation)
- Session-based authentication for better security
- Integration with PostgreSQL and Row Level Security
- Production-ready security standards

## Decision
We will use **Lucia Auth** with PostgreSQL adapter for authentication.

## Rationale

### Lucia Auth Benefits
- **Session-based**: More secure than JWT for web applications
- **Framework agnostic**: Works well with Next.js App Router
- **Type-safe**: Full TypeScript support
- **PostgreSQL integration**: Native support for our database
- **Security-first**: Built with modern security practices

### Rejected Alternatives

**NextAuth.js**
- ❌ Complex configuration for custom requirements
- ❌ JWT-based by default (we prefer sessions)
- ❌ Less control over session management

**Firebase Auth**
- ❌ Vendor lock-in
- ❌ Additional external dependency
- ❌ Cost implications at scale

**Custom JWT Implementation**
- ❌ Security risks with custom implementation
- ❌ Maintenance overhead
- ❌ Token management complexity

## Implementation Details

### Database Schema
```sql
-- User sessions table
CREATE TABLE user_session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    expires_at TIMESTAMPTZ NOT NULL
);

-- User table with club relationship
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL,
    club_id TEXT REFERENCES club(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Authentication Flow
1. User submits credentials
2. Server validates with Argon2 hash verification
3. Lucia creates secure session with database storage
4. Session cookie set with secure attributes
5. Subsequent requests validated against session store

### Security Features
- **Argon2 password hashing**: Industry standard
- **Secure session cookies**: HttpOnly, Secure, SameSite
- **Session rotation**: Automatic session renewal
- **CSRF protection**: Built-in with session cookies
- **Rate limiting**: Protection against brute force

## Consequences

### Positive
- ✅ Enhanced security with session-based auth
- ✅ Better integration with RLS policies
- ✅ Type-safe authentication helpers
- ✅ Simplified session management
- ✅ Production-ready security

### Negative
- ❌ Database dependency for sessions
- ❌ Learning curve for team
- ❌ Session storage overhead

### Mitigation Strategies
- **Database dependency**: Use connection pooling and optimized queries
- **Learning curve**: Comprehensive documentation and examples
- **Storage overhead**: Regular session cleanup and monitoring

## Related ADRs
- ADR-002: Database Architecture (PostgreSQL + RLS)
- ADR-003: Rate Limiting Strategy

## Date
2024-01-01