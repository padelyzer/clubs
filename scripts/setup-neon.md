# Setup PostgreSQL con Neon (Gratis)

## Opción A: Neon (Recomendado - Sin Docker)

1. Ve a https://neon.tech
2. Crea una cuenta gratis
3. Crea un nuevo proyecto "padelyzer-dev"
4. Copia el connection string que se ve así:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

5. Actualiza tu .env.local:
   ```env
   DATABASE_URL="postgresql://[tu-connection-string]"
   DIRECT_DATABASE_URL="postgresql://[tu-connection-string]"
   ```

## Opción B: Supabase (También gratis)

1. Ve a https://supabase.com
2. Crea un proyecto nuevo
3. En Settings > Database, copia el connection string

## Opción C: Local con PostgreSQL.app (Mac)

1. Descarga https://postgresapp.com
2. Instala y ejecuta
3. Usa: `DATABASE_URL="postgresql://localhost:5432/padelyzer_dev"`