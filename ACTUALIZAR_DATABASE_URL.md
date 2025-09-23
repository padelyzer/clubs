# ⚠️ IMPORTANTE: Actualizar DATABASE_URL en Vercel

## Cambio Necesario

La DATABASE_URL actual usa pgbouncer que puede causar problemas con Prisma. Necesitas actualizar la variable de entorno.

### URL Actual (con pgbouncer):
```
postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### URL Nueva (conexión directa):
```
postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

## Pasos:

1. Ve a https://vercel.com
2. Entra a tu proyecto
3. Settings → Environment Variables
4. Busca `DATABASE_URL`
5. Click en los 3 puntos → Edit
6. Cambia el puerto de `6543` a `5432`
7. Quita `?pgbouncer=true` del final
8. Save

## Nota:
- Puerto 6543 = Con pgbouncer (para conexiones temporales)
- Puerto 5432 = Conexión directa (mejor para Prisma)

## Después del cambio:
La aplicación se re-desplegará automáticamente y todo debería funcionar correctamente.