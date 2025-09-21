# 🌱 Scripts de Seed para Base de Datos

Esta carpeta contiene scripts para poblar la base de datos con datos de prueba para desarrollo.

## 📦 Scripts Disponibles

### `seed-production-ready.ts` - **RECOMENDADO**
Script completo y listo para producción con toda la configuración necesaria.

**Incluye:**
- ✅ Club mexicano completamente configurado
- ✅ 10 usuarios con nombres mexicanos realistas
- ✅ 5 canchas ($500/hora configurado)
- ✅ **Stripe configurado automáticamente** con claves de prueba
- ✅ **TODOS los métodos de pago activados**:
  - Stripe (tarjetas)
  - Efectivo
  - Transferencia bancaria
  - Terminal POS
- ✅ **Sistema de instructores individual** (por hora y mensual)
- ✅ Precios de clases configurados
- ✅ Transacciones de ejemplo
- ✅ Usuario administrador

### `seed-dev-complete.ts`
Script anterior, funcional pero sin configuración automática de pagos.

## 🚀 Uso

### Comando Recomendado
```bash
npm run seed:complete
```

### Comandos Alternativos
```bash
# Seed completo (recomendado)
npm run seed:complete

# Seed de desarrollo básico
npm run seed:dev

# Ejecución directa
npx tsx scripts/seed-production-ready.ts
```

## ⚠️ Importante

- **Los scripts BORRAN todos los datos existentes** antes de crear nuevos datos
- Asegúrate de que la base de datos PostgreSQL esté corriendo
- Los scripts están optimizados para desarrollo con datos mexicanos

## 🎯 Datos Creados por seed-production-ready.ts

### 🏢 Club
- **Nombre**: Club Pádel México
- **Ubicación**: Ciudad de México, CDMX
- **Configuración**: Completa con todos los métodos de pago

### 👥 Usuarios (10)
Nombres mexicanos realistas:
- María González, José Rodríguez, Ana Martínez, Carlos López
- Laura Hernández, Miguel García, Sofía Jiménez, Diego Ruiz
- Valentina Torres, Sebastián Flores

### 🎾 Canchas (5)
- **Cancha Central** (Techada)
- **Cancha Premium** (Techada) 
- **Cancha VIP** (Al aire libre)
- **Cancha Norte** (Al aire libre)
- **Cancha Sur** (Al aire libre)

### 🎓 Instructores (4)
**Por Hora:**
- Roberto Sánchez - $600/hora
- Fernando Castillo - $550/hora

**Mensual:**
- Patricia Morales - $25,000/mes
- Andrea Vázquez - $20,000/mes

### 💳 Métodos de Pago
- **Stripe**: Configurado con claves de prueba
- **Efectivo**: Activado
- **Transferencia**: BBVA México configurado
- **Terminal POS**: TERM_001_PADEL_MX

### 💰 Precios
- **Individual**: $800 MXN
- **Grupo**: $500 MXN por persona
- **Clínica**: $350 MXN por persona

### 📊 Otros Datos
- 23 transacciones de ejemplo (ingresos y gastos)
- Usuario admin: admin@clubpadel.mx
- Configuración mexicana (timezone, moneda, impuestos)

## 🔧 Configuración Técnica

### Variables de Entorno
El script usa estas variables:
- `NEXT_PUBLIC_APP_URL` (default: http://localhost:3002)
- Stripe keys están hardcoded (solo para desarrollo)

### Base de Datos
- Compatible con PostgreSQL
- Usa Prisma ORM
- Respeta foreign keys y constraints

## 🎨 Después del Seed

Una vez ejecutado el seed:

1. **Accede a la aplicación**: http://localhost:3002
2. **Prueba los métodos de pago** en reservas
3. **Crea clases** y prueba el sistema de instructores
4. **Revisa el dashboard** financiero
5. **Configura Stripe** adicional si necesario

## 🔍 Troubleshooting

### Error de Base de Datos
```bash
npm run db:reset
npm run seed:complete
```

### Error de Prisma
```bash
npx prisma generate
npm run seed:complete
```

### Error de Conexión
Verifica que PostgreSQL esté corriendo:
```bash
# Con Docker
npm run docker:up

# Local
# Verifica el servicio PostgreSQL
```

## 📝 Notas

- Los datos son **solo para desarrollo**
- Las claves de Stripe son de **prueba**
- Los usuarios no tienen contraseñas (dev auth)
- Todos los datos pueden ser modificados después del seed

---

💡 **Tip**: Usa `seed-production-ready.ts` para tener una base de datos completamente configurada en segundos.