# Running Database Migrations in Production

## Problem
The class module requires database tables that don't exist in production.

## Solution

### Option 1: Run migrations via Supabase UI
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the migration SQL from:
   ```
   prisma/migrations/20250924_add_class_module/migration.sql
   ```
4. Execute the SQL

### Option 2: Run migrations via script
1. Set the DIRECT_URL environment variable in Vercel:
   - Go to Vercel project settings
   - Environment Variables
   - Add DIRECT_URL with your Supabase direct connection string
   
2. Run the migration script:
   ```bash
   npm run prisma:migrate:prod
   ```

### Option 3: Manual SQL execution
Connect to your database and run:
```sql
-- The migration SQL is in:
-- prisma/migrations/20250924_add_class_module/migration.sql
```

## Verification
After running migrations, verify by checking:
- https://www.padelyzer.app/api/instructors
- The response should be successful (not 500 error)