# 🎯 GUÍA COMPLETA DE TESTING - PADELYZER MVP

## 🚀 ESTADO DEL SISTEMA

**Servidor corriendo en:** http://localhost:3002  
**Base de datos:** SQLite con datos de prueba cargados  
**Estado:** ✅ LISTO PARA TESTING

## 📝 CREDENCIALES DE ACCESO

### Super Admin
- **Email:** admin@padelyzer.com
- **Password:** admin123
- **Acceso:** Panel completo de administración

### Club Owner
- **Email:** owner@clubpadelpuebla.com
- **Password:** owner123
- **Acceso:** Dashboard del club con permisos completos

### Club Staff
- **Email:** staff@clubpadelpuebla.com
- **Password:** staff123
- **Acceso:** Dashboard operacional del club

## 🔗 URLs PRINCIPALES PARA PROBAR

### 1. PÁGINAS PÚBLICAS (Sin autenticación)

#### Landing Page
```
http://localhost:3002/
```
- Página principal con información del servicio
- Links a registro y login
- Información de características

#### Registro de Club
```
http://localhost:3002/register/club
```
- Formulario de registro para nuevos clubes
- Validación de campos
- Creación de cuenta owner

#### Login
```
http://localhost:3002/login
```
- Login para staff y owners de clubes
- Redirección según rol

#### Widget Embebible (Club Padel Puebla)
```
http://localhost:3002/widget/club-padel-puebla
http://localhost:3002/widget/club-padel-puebla?embedded=true
```
- Widget público para reservas sin registro
- Modo embedded para iframes

### 2. DASHBOARD DEL CLUB (Requiere login como owner/staff)

#### Dashboard Principal
```
http://localhost:3002/dashboard
```
- Métricas del día
- Reservas pendientes
- Accesos rápidos

#### Gestión de Reservas
```
http://localhost:3002/dashboard/bookings
```
- Calendario visual de reservas
- Crear/editar/cancelar reservas
- Filtros por fecha y cancha

#### Dashboard de Recepción
```
http://localhost:3002/dashboard/reception
```
- Vista del día actual
- Check-in rápido
- Estado de pagos

#### Configuración de Canchas
```
http://localhost:3002/dashboard/courts
```
- Gestión de canchas
- Activar/desactivar
- Configurar tipos

#### Configuración de Horarios
```
http://localhost:3002/dashboard/schedule
```
- Horarios por día
- Horarios especiales
- Días cerrados

#### Configuración de Precios
```
http://localhost:3002/dashboard/pricing
```
- Precios por horario
- Precios especiales
- Promociones

#### Sistema de Pagos
```
http://localhost:3002/dashboard/payments
```
- Configuración Stripe Connect
- Dashboard de ingresos
- Historial de transacciones

#### Notificaciones WhatsApp
```
http://localhost:3002/dashboard/notifications
```
- Configuración de mensajes
- Templates
- Historial de envíos

#### Configuración del Widget
```
http://localhost:3002/dashboard/widget
```
- Generador de código iframe
- Personalización
- Vista previa

#### Setup Wizard
```
http://localhost:3002/dashboard/setup
```
- Onboarding guiado
- Configuración inicial
- Verificación de completitud

### 3. PANEL SUPER ADMIN (Requiere login como admin)

#### Dashboard Admin
```
http://localhost:3002/admin/dashboard
```
- Métricas globales de la plataforma
- Estadísticas de clubes y usuarios
- Gráficas de crecimiento

#### Gestión de Clubes
```
http://localhost:3002/admin/clubs
```
- Lista de todos los clubes
- Aprobar/rechazar/suspender
- Ver detalles y métricas

#### Gestión de Usuarios
```
http://localhost:3002/admin/users
```
- Lista de todos los usuarios
- Filtros por rol y club
- Activar/desactivar usuarios

#### Monitor de Reservas
```
http://localhost:3002/admin/bookings
```
- Todas las reservas del sistema
- Filtros avanzados
- Gestión y resolución de problemas

#### Gestión Financiera
```
http://localhost:3002/admin/finance
```
- Dashboard de ingresos
- Comisiones por club
- Pagos pendientes

#### Sistema de Comunicación
```
http://localhost:3002/admin/communications
```
- Envío de notificaciones masivas
- Gestión de templates
- Segmentación de audiencia

#### Configuración de Plataforma
```
http://localhost:3002/admin/settings
```
- Configuración global
- Límites del sistema
- Seguridad y API keys

#### Analytics Avanzado
```
http://localhost:3002/admin/analytics
```
- Métricas de uso detalladas
- Análisis por club
- Tendencias y predicciones

#### Logs y Auditoría
```
http://localhost:3002/admin/logs
```
- Registro de todas las acciones
- Filtros por nivel y categoría
- Exportación de logs

#### Herramientas de Soporte
```
http://localhost:3002/admin/support
```
- Gestión de tickets
- Impersonación de usuarios
- Estado del sistema

## 🧪 CASOS DE PRUEBA RECOMENDADOS

### 1. Flujo de Registro y Onboarding
1. Registrar un nuevo club en `/register/club`
2. Completar el setup wizard
3. Configurar canchas, horarios y precios
4. Generar widget embebible

### 2. Flujo de Reservas
1. Crear una reserva desde el dashboard
2. Editar la reserva
3. Hacer check-in desde recepción
4. Cancelar una reserva

### 3. Flujo de Pagos Divididos
1. Crear reserva con pago dividido
2. Ver estado de pagos parciales
3. Simular completar pagos

### 4. Flujo de Widget Público
1. Acceder al widget sin autenticación
2. Seleccionar fecha y hora
3. Completar formulario de reserva
4. Ver confirmación

### 5. Flujo de Administración
1. Login como super admin
2. Aprobar/rechazar clubes
3. Ver analytics y métricas
4. Configurar sistema global

## 🛠️ COMANDOS ÚTILES

### Ver logs del servidor
```bash
# En la terminal donde está corriendo el servidor
# Los errores aparecen en tiempo real
```

### Reiniciar base de datos con datos frescos
```bash
npx prisma migrate reset --force
npx prisma db seed
```

### Ver contenido de la base de datos
```bash
npx prisma studio
# Abre en http://localhost:5555
```

### Verificar estado del servidor
```bash
curl http://localhost:3002/api/health
```

## ⚠️ PROBLEMAS CONOCIDOS Y SOLUCIONES

### Error: "Port 3000 is in use"
El servidor está usando puerto 3002 en lugar de 3000.
Usa http://localhost:3002 para todas las URLs.

### Error al hacer login
Verifica las credenciales exactas listadas arriba.
Los passwords son case-sensitive.

### Widget no carga
Asegúrate de usar el slug correcto: `club-padel-puebla`
El club debe estar aprobado (status: APPROVED)

### Errores de Stripe
Stripe está en modo test, usa tarjetas de prueba:
- 4242 4242 4242 4242 (Visa exitosa)
- Cualquier fecha futura y CVC de 3 dígitos

## 📱 APP MÓVIL

La app móvil está en `/padelyzer-mobile`

### Iniciar app móvil
```bash
cd padelyzer-mobile
npm install
npm start
```

Escanea el código QR con Expo Go en tu teléfono.

## 📊 MÉTRICAS DE ÉXITO

### El MVP está completo cuando:
- ✅ Puedes registrar un club nuevo
- ✅ Puedes configurar canchas y horarios
- ✅ Puedes crear y gestionar reservas
- ✅ El widget embebible funciona
- ✅ Los pagos divididos se trackean
- ✅ El panel admin muestra métricas
- ✅ Las notificaciones se configuran
- ✅ El sistema es estable sin errores críticos

## 🎉 RESUMEN

El sistema Padelyzer está completamente funcional con:
- 3 usuarios de prueba creados
- 1 club configurado (Club Padel Puebla)
- 3 canchas activas
- 3 reservas de ejemplo
- 2 pagos divididos de prueba
- Todos los módulos operativos

**¡Listo para testing completo!** 🚀