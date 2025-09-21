# 🗄️ Guía de Respaldo y Restauración de Base de Datos

## 📋 Descripción General

Este sistema de backup protege tus datos automáticamente antes de cualquier operación destructiva en la base de datos. Todos los backups se guardan en formato JSON en la carpeta `/backups`.

## 🚀 Comandos Disponibles

### 1. Crear un Backup Manual
```bash
npm run db:backup
```
- Crea un backup completo de todos los datos actuales
- Archivo guardado en `/backups/backup-YYYY-MM-DD-HH-mm-ss.json`
- Incluye metadatos sobre el backup (fecha, tamaño, cantidad de registros)

### 2. Restaurar desde un Backup
```bash
# Ver lista de backups disponibles
npm run db:restore

# Restaurar un backup específico
npm run db:restore backup-2025-08-27T00-37-53.json
```
- Lista todos los backups disponibles con sus detalles
- Solicita confirmación antes de restaurar
- **⚠️ ADVERTENCIA**: Elimina TODOS los datos actuales antes de restaurar

### 3. Reset Seguro de la Base de Datos
```bash
npm run db:reset
```
- **SIEMPRE** crea un backup automático antes del reset
- Solicita doble confirmación
- Ejecuta las migraciones después del reset
- Muestra cómo restaurar el backup si es necesario

### 4. Reset Sin Backup (NO RECOMENDADO)
```bash
npm run db:reset-unsafe
```
- Reset directo sin backup automático
- **⚠️ PELIGRO**: Se perderán todos los datos permanentemente

## 📁 Estructura de Backups

Los backups se guardan en:
```
/bmad-nextjs-app/
  /backups/
    backup-2025-08-27T00-37-53.json
    backup-metadata.json
```

### Contenido del Backup
Cada backup incluye:
- **Metadata**: Timestamp, ambiente, base de datos
- **Tablas completas**:
  - clubs
  - users
  - players
  - courts
  - bookings
  - tournaments
  - tournamentRegistrations
  - tournamentMatches
  - transactions
  - expenses
  - Y todas las demás tablas del sistema

## 🔄 Flujo de Trabajo Recomendado

### Antes de hacer cambios grandes:
```bash
# 1. Crear un backup manual
npm run db:backup

# 2. Hacer tus cambios (migraciones, seeds, etc.)
npm run db:migrate

# 3. Si algo sale mal, restaurar
npm run db:restore backup-YYYY-MM-DD-HH-mm-ss.json
```

### Para resetear y empezar con datos frescos:
```bash
# 1. Reset seguro (con backup automático)
npm run db:reset

# 2. Cargar nuevos datos de prueba
npm run seed:dev

# 3. Si necesitas los datos anteriores
npm run db:restore [archivo-backup]
```

## 📊 Ejemplo de Uso Real

```bash
$ npm run db:backup

🔄 INICIANDO BACKUP DE LA BASE DE DATOS...
================================================================================
📊 Extrayendo datos...
   ✓ clubs: 1 registros
   ✓ users: 4 registros
   ✓ players: 52 registros
   ✓ bookings: 510 registros
   ✓ tournaments: 4 registros
   ✓ transactions: 477 registros

💾 Guardando backup en: backup-2025-08-27T00-37-53.json

================================================================================
✅ BACKUP COMPLETADO EXITOSAMENTE!
================================================================================
📁 Archivo: backup-2025-08-27T00-37-53.json
📊 Tamaño: 0.88 MB
🔢 Total de registros: 1144
================================================================================
```

## 🛡️ Mejores Prácticas

1. **SIEMPRE** crea un backup antes de:
   - Ejecutar migraciones en producción
   - Resetear la base de datos
   - Actualizar el schema de Prisma
   - Ejecutar scripts de modificación masiva

2. **Guarda backups importantes** en otro lugar:
   - Los backups locales están en `.gitignore`
   - Para backups críticos, cópialos a un almacenamiento seguro

3. **Verifica los backups** periódicamente:
   - Prueba restaurar en un ambiente de desarrollo
   - Confirma que todos los datos se restauran correctamente

4. **Limpia backups antiguos** ocasionalmente:
   - El sistema mantiene metadata de los últimos 10 backups
   - Puedes eliminar manualmente archivos antiguos de `/backups`

## ⚠️ Consideraciones Importantes

- Los backups son archivos JSON que pueden ser grandes con muchos datos
- La restauración elimina TODOS los datos actuales
- Los IDs y relaciones se mantienen exactamente como estaban
- Las fechas se preservan correctamente
- No incluye archivos binarios o imágenes (solo referencias)

## 🆘 Solución de Problemas

### Error: "No hay backups disponibles"
- Ejecuta `npm run db:backup` primero
- Verifica que la carpeta `/backups` existe

### Error durante restauración
- Verifica que el archivo de backup existe
- Confirma que el archivo no está corrupto (debe ser JSON válido)
- Revisa que todas las migraciones estén aplicadas

### Backup muy grande
- Considera comprimir backups antiguos
- Limpia datos innecesarios antes del backup
- Usa herramientas de respaldo de PostgreSQL para bases de datos muy grandes

## 📝 Notas Adicionales

- Los backups son independientes del tipo de base de datos (SQLite/PostgreSQL)
- Funcionan tanto en desarrollo como en producción
- Son útiles para migrar datos entre ambientes
- Pueden usarse para análisis offline de datos