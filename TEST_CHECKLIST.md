# 📋 PADELYZER - CHECKLIST DE PRUEBAS EXHAUSTIVAS

## 🚀 PREPARACIÓN DEL ENTORNO

### Setup Inicial
```bash
# 1. Limpiar y preparar base de datos
npx tsx scripts/setup-test-environment.ts

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en navegador
http://localhost:3000
```

### Credenciales de Prueba
| Rol | Email | Password | URL |
|-----|-------|----------|-----|
| Super Admin | admin@test.com | Test123!@# | /admin |
| Club Owner | owner@test.com | Test123!@# | /dashboard |
| Club Staff | staff@test.com | Test123!@# | /dashboard |
| Player 1 | player1@test.com | Test123!@# | /login |
| Player 2 | player2@test.com | Test123!@# | /login |

---

## ✅ MÓDULO 1: AUTENTICACIÓN Y AUTORIZACIÓN

### 1.1 Login/Logout
- [ ] Login con credenciales válidas (todos los roles)
- [ ] Login con credenciales inválidas - debe mostrar error
- [ ] Logout funciona correctamente
- [ ] Sesión persiste al refrescar página
- [ ] Redirección correcta según rol después de login

### 1.2 Permisos por Rol
- [ ] Super Admin puede acceder a /admin/*
- [ ] Club Owner puede acceder a /dashboard/* pero NO a /admin
- [ ] Club Staff puede ver dashboard pero NO puede editar configuración
- [ ] Players NO pueden acceder a /dashboard ni /admin
- [ ] Usuarios no autenticados redirigen a /login

---

## ✅ MÓDULO 2: SUPER ADMIN

### 2.1 Dashboard Admin
- [ ] Estadísticas generales se muestran correctamente
- [ ] Gráficos de MRR y crecimiento funcionan
- [ ] Métricas SaaS (churn, LTV, CAC) calculadas correctamente

### 2.2 Gestión de Clubs
- [ ] Ver lista de clubs (pending, approved, rejected)
- [ ] Aprobar club pending → crea suscripción trial automáticamente
- [ ] Rechazar club con razón
- [ ] Ver detalles de club
- [ ] Suspender/Reactivar club
- [ ] Búsqueda y filtros funcionan

### 2.3 Suscripciones
- [ ] Ver todos los planes de suscripción
- [ ] Crear nuevo plan
- [ ] Editar plan existente
- [ ] Activar/Desactivar plan
- [ ] Ver suscripciones activas por club
- [ ] Cambiar plan de un club
- [ ] Cancelar suscripción

### 2.4 Facturación
- [ ] Ver facturas pendientes
- [ ] Marcar factura como pagada
- [ ] Generar nueva factura
- [ ] Exportar facturas

### 2.5 Soporte
- [ ] Ver tickets de soporte
- [ ] Responder tickets
- [ ] Cambiar estado de ticket
- [ ] Asignar ticket a admin

---

## ✅ MÓDULO 3: CLUB MANAGEMENT

### 3.1 Dashboard Club
- [ ] Estadísticas del día (reservas, ingresos)
- [ ] Calendario de reservas
- [ ] Gráficos de ocupación
- [ ] Notificaciones recientes

### 3.2 Gestión de Canchas
- [ ] Crear nueva cancha
- [ ] Editar cancha (nombre, precio, tipo)
- [ ] Activar/Desactivar cancha
- [ ] Ver disponibilidad por cancha

### 3.3 Reservas
- [ ] Ver todas las reservas
- [ ] Crear reserva manual
- [ ] Editar reserva existente
- [ ] Cancelar reserva
- [ ] Confirmar pago de reserva
- [ ] Búsqueda por fecha/jugador/cancha
- [ ] Exportar reservas

### 3.4 Configuración del Club
- [ ] Editar información básica
- [ ] Configurar horarios de operación
- [ ] Configurar precios por horario
- [ ] Configurar días festivos/bloqueados
- [ ] Configurar métodos de pago aceptados

---

## ✅ MÓDULO 4: RESERVAS Y PAGOS

### 4.1 Proceso de Reserva (Widget/Web)
- [ ] Seleccionar fecha disponible
- [ ] Seleccionar horario disponible
- [ ] Ingresar datos del jugador
- [ ] Calcular precio correctamente
- [ ] Seleccionar método de pago

### 4.2 Pagos
- [ ] Pago con tarjeta (Stripe)
- [ ] Registro de pago en efectivo
- [ ] Split payment entre jugadores
- [ ] Envío de link de pago por WhatsApp
- [ ] Validación de link de pago
- [ ] Confirmación de pago exitoso

### 4.3 WhatsApp Integration
- [ ] Opt-in para notificaciones
- [ ] Confirmación de reserva por WhatsApp
- [ ] Recordatorio de reserva (24h antes)
- [ ] Link de pago por WhatsApp
- [ ] Opt-out funciona correctamente

---

## ✅ MÓDULO 5: TORNEOS

### 5.1 Creación de Torneo
- [ ] Wizard de creación paso a paso
- [ ] Configuración de formato (Single Elimination, Round Robin, Swiss)
- [ ] Configuración de categorías
- [ ] Configuración de fechas
- [ ] Configuración de precios

### 5.2 Inscripciones
- [ ] Formulario de inscripción público
- [ ] Pago de inscripción
- [ ] Confirmación de inscripción
- [ ] Lista de inscritos
- [ ] Check-in con QR

### 5.3 Gestión del Torneo
- [ ] Generación automática de brackets
- [ ] Visualización de brackets
- [ ] Programación de partidos
- [ ] Ingreso de resultados
- [ ] Avance automático de rondas
- [ ] Notificaciones a jugadores

### 5.4 Resultados
- [ ] Envío de resultados desde cancha (QR)
- [ ] Confirmación de resultados por ambos equipos
- [ ] Resolución de conflictos
- [ ] Tabla de posiciones
- [ ] Rankings actualizados

---

## ✅ MÓDULO 6: CLASES

### 6.1 Configuración de Clases
- [ ] Crear nueva clase
- [ ] Configurar horarios semanales
- [ ] Configurar instructor
- [ ] Configurar nivel y precio
- [ ] Activar/Desactivar clase

### 6.2 Inscripciones a Clases
- [ ] Ver clases disponibles
- [ ] Inscribirse a clase
- [ ] Pagar clase
- [ ] Cancelar inscripción
- [ ] Ver lista de alumnos

### 6.3 Gestión de Clases
- [ ] Check-in de alumnos
- [ ] Cancelar clase específica
- [ ] Reprogramar clase
- [ ] Notificar cambios a alumnos

---

## ✅ MÓDULO 7: WIDGET EMBEBIBLE

### 7.1 Instalación
- [ ] Generar código de embed
- [ ] Instalar en sitio externo
- [ ] Widget se carga correctamente
- [ ] Estilos no interfieren con sitio host

### 7.2 Funcionalidad
- [ ] Muestra disponibilidad en tiempo real
- [ ] Permite hacer reservas
- [ ] Procesa pagos correctamente
- [ ] Envía confirmaciones

---

## ✅ MÓDULO 8: REPORTES Y ANALYTICS

### 8.1 Reportes Financieros
- [ ] Reporte de ingresos por período
- [ ] Reporte de reservas por cancha
- [ ] Reporte de ocupación
- [ ] Exportar a Excel/CSV

### 8.2 Analytics
- [ ] Métricas de uso del sistema
- [ ] Tendencias de reservas
- [ ] Análisis de horarios pico
- [ ] Comportamiento de usuarios

---

## ✅ MÓDULO 9: SEGURIDAD

### 9.1 Autenticación
- [ ] Passwords seguros (validación)
- [ ] Sesiones expiran correctamente
- [ ] No hay acceso sin autenticación

### 9.2 Autorización
- [ ] Validación de permisos por endpoint
- [ ] No hay escalación de privilegios
- [ ] Datos aislados por club

### 9.3 Validación de Datos
- [ ] Inputs sanitizados (XSS prevention)
- [ ] SQL injection prevention
- [ ] CSRF protection
- [ ] Rate limiting funciona

### 9.4 Auditoría
- [ ] Logs de acciones administrativas
- [ ] Logs de cambios críticos
- [ ] Logs de errores

---

## ✅ MÓDULO 10: PERFORMANCE

### 10.1 Tiempos de Carga
- [ ] Dashboard carga en < 3 segundos
- [ ] Búsquedas responden en < 1 segundo
- [ ] Paginación funciona correctamente
- [ ] Imágenes optimizadas

### 10.2 Concurrencia
- [ ] Sistema soporta múltiples usuarios simultáneos
- [ ] No hay conflictos en reservas simultáneas
- [ ] Locks de base de datos funcionan

### 10.3 Cache
- [ ] Cache de consultas frecuentes
- [ ] Invalidación de cache al actualizar
- [ ] CDN para assets estáticos

---

## ✅ MÓDULO 11: MOBILE RESPONSIVE

### 11.1 Diseño Responsive
- [ ] Dashboard adaptable a móvil
- [ ] Formularios usables en móvil
- [ ] Menús funcionan en móvil
- [ ] Tablas scrollables en móvil

### 11.2 Touch Interactions
- [ ] Botones con tamaño adecuado
- [ ] Swipe gestures donde aplique
- [ ] No hay hover-only features

---

## ✅ MÓDULO 12: INTEGRACIÓN CLUB-ADMIN

### 12.1 Flujo de Aprobación
- [ ] Club se registra → Admin recibe notificación
- [ ] Admin aprueba → Club recibe email/notificación
- [ ] Admin rechaza → Club recibe razón
- [ ] Suscripción trial se crea automáticamente

### 12.2 Límites de Suscripción
- [ ] Validación de máximo de usuarios
- [ ] Validación de máximo de canchas
- [ ] Validación de máximo de reservas
- [ ] Mensaje claro cuando se alcanza límite

### 12.3 Facturación Integrada
- [ ] Facturas se generan automáticamente
- [ ] Pagos actualizan suscripción
- [ ] Suspensión por falta de pago
- [ ] Reactivación tras pago

---

## 🐛 PRUEBAS DE ERROR

### Casos Edge
- [ ] Reservar cancha ya ocupada
- [ ] Pagar monto incorrecto
- [ ] Inscribir más del límite en torneo
- [ ] Aprobar club ya aprobado
- [ ] Cancelar reserva pasada
- [ ] Generar bracket con número impar
- [ ] Timeout en pagos
- [ ] Conexión perdida durante formulario

### Mensajes de Error
- [ ] Errores claros y en español
- [ ] Errores no exponen información sensible
- [ ] Opciones de recuperación claras
- [ ] Logging de errores para debug

---

## 📊 MÉTRICAS DE ÉXITO

### Funcionalidad
- [ ] 100% de features críticas funcionando
- [ ] 0 errores bloqueantes
- [ ] < 5 errores menores

### Performance
- [ ] Tiempo de carga < 3s
- [ ] API response < 500ms
- [ ] 0 memory leaks

### Seguridad
- [ ] 0 vulnerabilidades críticas
- [ ] Autenticación robusta
- [ ] Datos encriptados

### UX
- [ ] Flujos intuitivos
- [ ] Mobile responsive
- [ ] Mensajes claros

---

## 🚦 RESULTADO FINAL

### Resumen de Pruebas
- Total de pruebas: _____ 
- Exitosas: _____
- Fallidas: _____
- Pendientes: _____

### Veredicto
- [ ] **LISTO PARA PRODUCCIÓN** ✅
- [ ] **REQUIERE CORRECCIONES** ⚠️
- [ ] **NO APTO** ❌

### Observaciones
```
[Agregar observaciones aquí]
```

---

## 📝 NOTAS DE TESTING

### Bugs Encontrados
1. 
2. 
3. 

### Mejoras Sugeridas
1. 
2. 
3. 

### Fecha de Prueba: _____________
### Tester: _____________
### Versión: _____________