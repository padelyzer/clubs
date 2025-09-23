# Guía para Sincronizar Base de Datos de Producción

## 🚨 Problema Actual

La base de datos de producción no tiene las mismas columnas que el schema de Prisma. Específicamente, falta la columna `description` en la tabla `Club`, entre otros posibles campos.

## 📋 Verificación del Estado Actual

Primero, verifica el estado actual de tu base de datos:

```bash
# En local (apuntando a producción con DATABASE_URL correcto)
npm run check-db-status
```

## 🔧 Opciones para Sincronizar

### Opción 1: Ejecutar Migraciones en Vercel (RECOMENDADO)

1. **Configurar build script en Vercel:**
   - Ve a tu proyecto en Vercel
   - Settings → General → Build & Development Settings
   - Cambia el Build Command a: `npm run vercel-build`

2. **Verificar variables de entorno:**
   - Asegúrate de que `DATABASE_URL` esté configurado correctamente en Vercel

3. **Desplegar:**
   ```bash
   git push origin main
   ```

### Opción 2: Ejecutar Migraciones Manualmente

1. **Desde tu máquina local (con DATABASE_URL de producción):**
   ```bash
   # Primero, haz un backup!
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Luego ejecuta las migraciones
   DATABASE_URL="tu-url-de-produccion" npm run prisma:migrate:prod
   ```

2. **Usando Vercel CLI:**
   ```bash
   # Instalar Vercel CLI si no la tienes
   npm i -g vercel
   
   # Login
   vercel login
   
   # Ejecutar comando en producción
   vercel env pull .env.production.local
   source .env.production.local
   npm run prisma:migrate:prod
   ```

### Opción 3: Usar Prisma Push (SOLO PARA EMERGENCIAS)

⚠️ **ADVERTENCIA**: Este método NO guarda historial de migraciones

```bash
DATABASE_URL="tu-url-de-produccion" npx prisma db push
```

## 🛡️ Medidas de Seguridad

1. **SIEMPRE haz backup antes de cualquier migración:**
   ```bash
   pg_dump $DATABASE_URL > backup_produccion_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Verifica las migraciones pendientes:**
   ```bash
   npx prisma migrate status
   ```

3. **Revisa el SQL que se ejecutará:**
   ```bash
   npx prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-migrations prisma/migrations \
     --script
   ```

## 📝 Proceso Recomendado

1. **Desarrollo:**
   - Haz cambios en `schema.prisma`
   - Crea migración: `npm run prisma:migrate:dev -- --name nombre_descriptivo`
   - Prueba localmente

2. **Staging (si tienes):**
   - Despliega a staging primero
   - Verifica que todo funcione

3. **Producción:**
   - Haz backup
   - Despliega con migraciones automáticas
   - Verifica inmediatamente

## 🚀 Configuración para Despliegues Automáticos

Ya hemos configurado el `package.json` con:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build",
    "prisma:migrate:prod": "prisma migrate deploy"
  }
}
```

Esto asegura que:
1. Se generen los tipos de Prisma
2. Se ejecuten las migraciones pendientes
3. Se construya la aplicación

## ❓ Troubleshooting

### Error: "The table `Club` does not exist"
- Las migraciones no se han ejecutado nunca
- Solución: Ejecutar todas las migraciones desde cero

### Error: "Column already exists"
- La base de datos tiene cambios manuales
- Solución: Usar `prisma db pull` para sincronizar el schema con la DB actual

### Error: "Migration already applied"
- Prisma piensa que la migración ya se aplicó
- Solución: Verificar la tabla `_prisma_migrations`

## 📞 Soporte

Si tienes dudas o problemas:
1. Revisa los logs en Vercel
2. Ejecuta el script de verificación
3. Contacta al equipo de desarrollo

---

**IMPORTANTE**: Nunca ejecutes migraciones destructivas (DROP, DELETE) sin supervisión y backup.