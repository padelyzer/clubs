# ADR-002: Database Architecture

## Status
Accepted

## Context
The Padelyzer application requires a database solution that supports:
- Multi-tenant SaaS architecture with data isolation
- Scalable performance for multiple clubs
- ACID compliance for booking systems
- Real-time features and complex queries
- Cost-effective horizontal scaling

## Decision
We will use **PostgreSQL with Row Level Security (RLS)** as our primary database solution.

## Rationale

### PostgreSQL + RLS Benefits
- **Data Isolation**: Automatic tenant separation at database level
- **Performance**: Single database with optimized queries
- **Simplicity**: One database to manage and monitor
- **ACID Compliance**: Critical for booking conflicts
- **Cost Effective**: No database multiplication costs
- **Security**: Database-enforced access control

### Rejected Alternatives

**Separate Database per Club**
- ❌ Management complexity (hundreds of databases)
- ❌ Cost multiplication (database instances)
- ❌ Backup/maintenance overhead
- ❌ Cross-tenant analytics impossible
- ❌ Schema migration complexity

**MongoDB**
- ❌ Less mature multi-tenancy patterns
- ❌ No ACID transactions across documents
- ❌ Schema flexibility not needed for our use case
- ❌ Team expertise in PostgreSQL

**MySQL**
- ❌ Less advanced RLS capabilities
- ❌ Weaker JSON support
- ❌ Team preference for PostgreSQL

## Implementation Details

### RLS Policy Structure
```sql
-- Enable RLS on all tenant tables
ALTER TABLE club ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user ENABLE ROW LEVEL SECURITY;

-- Function to get current club context
CREATE OR REPLACE FUNCTION current_club_id() 
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_club_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for club isolation
CREATE POLICY "club_access" ON booking
  FOR ALL 
  USING (club_id = current_club_id());
```

### Multi-Tenant Data Model
```sql
-- Core tenant table
CREATE TABLE club (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- All tenant data references club
CREATE TABLE booking (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES club(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  -- other fields...
);
```

### Application Integration
```typescript
// Automatic club context setting
export const createPrismaClient = (clubId?: string) => {
  const client = new PrismaClient()
  
  if (clubId) {
    // Set RLS context for all queries
    client.$executeRawUnsafe(
      `SET LOCAL app.current_club_id = '${clubId}'`
    )
  }
  
  return client
}
```

## Security Model

### Access Patterns
1. **Club Owners**: Full access to their club data only
2. **Super Admins**: Cross-club access with special flag
3. **Users**: Limited access based on club membership
4. **Public API**: No direct database access

### RLS Policies
- **Default Deny**: No access without explicit policy
- **Club Isolation**: Automatic filtering by club_id
- **Role-Based**: Additional restrictions by user role
- **Audit Trail**: All access logged with club context

## Performance Considerations

### Optimization Strategies
- **Indexes**: Composite indexes on (club_id, frequently_queried_field)
- **Partitioning**: Consider partitioning by club_id for large tables
- **Connection Pooling**: Optimized pool sizes per environment
- **Query Optimization**: Use Prisma query optimization

### Monitoring
- **Query Performance**: Track slow queries by club
- **RLS Overhead**: Monitor policy evaluation cost
- **Connection Usage**: Track connection pool utilization
- **Data Growth**: Monitor per-club data growth patterns

## Scalability Plan

### Horizontal Scaling
- **Read Replicas**: For analytics and reporting
- **Connection Pooling**: PgBouncer for connection management
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets and computed data

### Vertical Scaling
- **Resource Monitoring**: CPU, memory, disk I/O
- **Index Optimization**: Regular index analysis
- **Query Optimization**: Continuous query performance tuning

## Backup & Recovery

### Strategy
- **Daily Backups**: Automated with point-in-time recovery
- **Cross-Region**: Backup replication for disaster recovery
- **Testing**: Regular restore testing
- **Club-Level**: Ability to restore individual club data

## Migration Strategy

### From SQLite (Current)
1. **Schema Migration**: Convert SQLite schema to PostgreSQL
2. **Data Migration**: Migrate existing club data with RLS setup
3. **Application Updates**: Update Prisma client configuration
4. **Testing**: Comprehensive testing of RLS policies
5. **Rollback Plan**: Ability to revert if issues arise

### Future Migrations
- **Schema Versioning**: All changes through Prisma migrations
- **RLS Updates**: Version control for policy changes
- **Zero Downtime**: Use PostgreSQL features for live migrations

## Consequences

### Positive
- ✅ Strong data isolation and security
- ✅ Single database to manage and monitor
- ✅ Cost-effective scaling
- ✅ ACID compliance for bookings
- ✅ Rich PostgreSQL feature set
- ✅ Excellent tooling ecosystem

### Negative
- ❌ RLS complexity for developers
- ❌ Single point of failure
- ❌ PostgreSQL-specific features (vendor lock-in)

### Mitigation Strategies
- **RLS Complexity**: Comprehensive documentation and helper functions
- **Single Point of Failure**: High availability setup with replicas
- **Vendor Lock-in**: Use Prisma for database abstraction layer

## Related ADRs
- ADR-001: Authentication Strategy (Lucia + PostgreSQL)
- ADR-003: Rate Limiting Strategy
- ADR-004: Caching Strategy

## Date
2024-01-01