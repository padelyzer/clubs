# Lista de Pruebas Críticas del Sistema

## ✅ Completadas

### 1. Tests Básicos (Smoke Tests)
- [x] Servidor responde correctamente
- [x] Página de login carga
- [x] Rutas protegidas redirigen a login
- [x] Manejo de slugs inválidos en multitenant
- [x] Link de registro funciona

## 🔄 Pruebas Pendientes Críticas

### 2. Autenticación y Autorización
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas
- [ ] Logout funciona correctamente
- [ ] Sesión persiste después de refresh
- [ ] Acceso a rutas según rol (CLUB_OWNER, ADMIN, USER)
- [ ] Cambio entre clubes (si usuario tiene múltiples)

### 3. Flujo de Configuración Inicial
- [ ] Wizard de configuración para nuevos clubes
- [ ] Guardado de configuración básica
- [ ] Configuración de horarios operativos
- [ ] Configuración de métodos de pago
- [ ] Validación de campos requeridos

### 4. Sistema de Reservas (Core Business)
- [ ] Crear nueva reserva
- [ ] Ver calendario de disponibilidad
- [ ] Cancelar reserva
- [ ] Check-in de reserva
- [ ] Cálculo correcto de precios
- [ ] Manejo de conflictos de horarios
- [ ] Reservas recurrentes

### 5. Gestión de Jugadores
- [ ] Crear nuevo jugador
- [ ] Buscar jugadores existentes
- [ ] Editar información de jugador
- [ ] Ver historial de reservas del jugador
- [ ] Estadísticas del jugador

### 6. Sistema de Pagos
- [ ] Registro de pago en efectivo
- [ ] Generación de link de pago
- [ ] Split de pagos entre jugadores
- [ ] Cálculo de comisiones
- [ ] Estado de pagos (pendiente/pagado)

### 7. Módulo Financiero
- [ ] Dashboard de ingresos
- [ ] Registro de gastos
- [ ] Reportes financieros
- [ ] Exportación de datos
- [ ] Conciliación de pagos

### 8. Gestión de Canchas
- [ ] Agregar nueva cancha
- [ ] Editar información de cancha
- [ ] Activar/desactivar cancha
- [ ] Configurar precios por cancha
- [ ] Bloqueo de horarios

### 9. Clases y Programas
- [ ] Crear nueva clase
- [ ] Inscripción de alumnos
- [ ] Control de asistencia
- [ ] Gestión de paquetes de clases
- [ ] Asignación de instructores

### 10. Torneos
- [ ] Crear nuevo torneo
- [ ] Registro de participantes
- [ ] Generación de brackets
- [ ] Registro de resultados
- [ ] Tabla de posiciones

### 11. Multitenant
- [ ] Aislamiento de datos entre clubes
- [ ] URLs específicas por club funcionan
- [ ] No se puede acceder a datos de otro club
- [ ] Cambio de contexto de club

### 12. Notificaciones WhatsApp
- [ ] Confirmación de reserva
- [ ] Recordatorio de reserva
- [ ] Notificación de cancelación
- [ ] Opt-in/opt-out de notificaciones

### 13. Rendimiento
- [ ] Carga de dashboard < 3s
- [ ] Búsqueda de jugadores < 1s
- [ ] Creación de reserva < 2s
- [ ] Navegación entre páginas fluida

### 14. Seguridad
- [ ] No exposición de datos sensibles
- [ ] Validación de permisos en API
- [ ] Rate limiting funciona
- [ ] Logs de auditoría se generan

### 15. Casos Edge
- [ ] Manejo de errores de red
- [ ] Comportamiento con datos vacíos
- [ ] Validación de formularios
- [ ] Manejo de sesiones expiradas
- [ ] Comportamiento offline

## 🎯 Prioridad de Testing

### Crítico (debe funcionar para producción):
1. Login/Logout
2. Crear y cancelar reservas
3. Registro de pagos
4. Aislamiento multitenant

### Alto (funcionalidad core):
1. Gestión de jugadores
2. Dashboard financiero
3. Configuración inicial
4. Calendario de disponibilidad

### Medio (mejora experiencia):
1. Notificaciones WhatsApp
2. Reportes y exportación
3. Clases y paquetes
4. Torneos

### Bajo (nice to have):
1. Estadísticas avanzadas
2. Integraciones externas
3. Personalización UI

## 📝 Notas de Testing

- Usar datos realistas en las pruebas
- Probar con diferentes zonas horarias
- Verificar comportamiento en móvil
- Probar con conexión lenta
- Validar con múltiples usuarios simultáneos