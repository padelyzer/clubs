# 🧪 FLUJOS DE PRUEBA - PADELYZER

## 📋 Casos de Uso Críticos

### 1. FLUJO ADMIN (Super Admin)

#### 1.1 Login y Dashboard
```
✅ Acceso: admin@padelyzer.com
1. [ ] Login exitoso
2. [ ] Redirección a /admin/dashboard
3. [ ] Visualización de estadísticas globales
4. [ ] Menú con todas las opciones disponibles
```

#### 1.2 Gestión de Clubes
```
1. [ ] Ver lista de clubes
2. [ ] Aprobar club nuevo
3. [ ] Suspender/Reactivar club
4. [ ] Ver detalles del club
5. [ ] Modificar comisión de Stripe
```

#### 1.3 Finanzas Globales
```
1. [ ] Ver transacciones totales
2. [ ] Ver comisiones generadas
3. [ ] Procesar transferencias pendientes
```

---

### 2. FLUJO CLUB STAFF

#### 2.1 Configuración Inicial del Club
```
1. [ ] Login como staff del club
2. [ ] Acceso a /dashboard
3. [ ] Configuración inicial:
   - [ ] Datos del club (/dashboard/settings/club)
   - [ ] Horarios de operación
   - [ ] Zona horaria
```

#### 2.2 Gestión de Canchas
```
Ruta: /dashboard/settings/club/courts
1. [ ] Crear cancha nueva
   - Nombre
   - Tipo (Padel/Tennis)
   - Interior/Exterior
2. [ ] Editar cancha existente
3. [ ] Activar/Desactivar cancha
4. [ ] Ordenar canchas
```

#### 2.3 Configuración de Precios
```
Ruta: /dashboard/settings/club/pricing
1. [ ] Crear regla de precio
   - [ ] Configurar horarios por día
   - [ ] Establecer precios por franja horaria
   - [ ] Guardar regla
2. [ ] Editar regla existente
3. [ ] Activar/Desactivar regla
4. [ ] Verificar prioridad de reglas
```

#### 2.4 Configuración de Descuentos
```
Ruta: /dashboard/settings/club/pricing (tab Descuentos)
1. [ ] Crear descuento por frecuencia
   - Configurar número de reservas
   - Establecer porcentaje
2. [ ] Crear Happy Hour
   - Seleccionar días
   - Definir horarios
3. [ ] Crear descuento por volumen
   - Horas mínimas
   - Porcentaje de descuento
4. [ ] Activar/Desactivar descuentos
```

#### 2.5 Crear Reserva Manual
```
Ruta: /dashboard/bookings
1. [ ] Click en "Nueva Reserva"
2. [ ] Seleccionar cancha
3. [ ] Elegir fecha y hora
4. [ ] Ingresar datos del jugador:
   - Nombre
   - Teléfono (validar descuentos)
   - Email
5. [ ] Ver precio calculado con descuentos
6. [ ] Seleccionar método de pago:
   - [ ] Stripe (genera link de pago)
   - [ ] En sitio (pago al llegar)
7. [ ] Confirmar reserva
8. [ ] Verificar notificación WhatsApp enviada
```

#### 2.6 Gestión de Reservas
```
Ruta: /dashboard/bookings
1. [ ] Ver lista de reservas del día
2. [ ] Filtrar por:
   - [ ] Fecha
   - [ ] Cancha
   - [ ] Estado
3. [ ] Ver detalles de reserva
4. [ ] Marcar check-in
5. [ ] Cancelar reserva
6. [ ] Ver vista calendario (/dashboard/bookings/calendar)
```

#### 2.7 Analytics del Club
```
Ruta: /dashboard/analytics
1. [ ] Ver KPIs principales:
   - [ ] Ingresos totales
   - [ ] Número de reservas
   - [ ] Jugadores únicos
   - [ ] % Ocupación
2. [ ] Cambiar período (Semana/Mes/Año)
3. [ ] Ver gráfico de ingresos
4. [ ] Ver gráfico de reservas
5. [ ] Ver uso por cancha
6. [ ] Ver horas pico
7. [ ] Ver top jugadores
```

#### 2.8 Gestión de Torneos
```
Ruta: /dashboard/tournaments-v2
1. [ ] Crear torneo nuevo
   - [ ] Información básica
   - [ ] Fechas
   - [ ] Precio inscripción
   - [ ] Categorías
2. [ ] Ver lista de torneos
3. [ ] Gestionar inscripciones
4. [ ] Generar brackets
5. [ ] Registrar resultados
```

---

### 3. FLUJO JUGADOR (Cliente Final)

#### 3.1 Reserva con Pago Online
```
1. [ ] Recibir link de reserva por WhatsApp
2. [ ] Acceder a página de pago (/pay/[bookingId])
3. [ ] Ver detalles de la reserva
4. [ ] Opción de pago dividido:
   - [ ] Individual: Pagar total
   - [ ] Dividido: Pagar porción
5. [ ] Completar pago con Stripe
6. [ ] Ver confirmación
7. [ ] Recibir confirmación por WhatsApp
```

#### 3.2 Inscripción a Torneo
```
1. [ ] Acceder a link de inscripción
2. [ ] Completar formulario
3. [ ] Realizar pago
4. [ ] Recibir confirmación
```

---

## 🔄 FLUJOS DE INTEGRACIÓN

### 4. WEBHOOKS Y NOTIFICACIONES

#### 4.1 Webhook de Stripe
```
1. [ ] Pago exitoso → Actualizar estado reserva
2. [ ] Pago fallido → Mantener como pendiente
3. [ ] Split payment → Actualizar progreso
4. [ ] Verificar en base de datos:
   - [ ] booking.status = 'CONFIRMED'
   - [ ] payment.status = 'succeeded'
   - [ ] transaction creada
```

#### 4.2 Notificaciones WhatsApp
```
1. [ ] Al crear reserva:
   - [ ] Cliente recibe confirmación
   - [ ] Link de pago si aplica
2. [ ] Al confirmar pago:
   - [ ] Cliente recibe ticket
3. [ ] Recordatorio (24h antes):
   - [ ] Cliente recibe reminder
```

---

## 🐛 CASOS DE ERROR A VALIDAR

### 5. MANEJO DE ERRORES

```
1. [ ] Reserva en horario ocupado
   - Debe mostrar error de conflicto
   
2. [ ] Pago fallido
   - Estado debe quedar pendiente
   - Cliente puede reintentar
   
3. [ ] Sin configuración de precios
   - Mostrar mensaje claro
   - Dirigir a configuración
   
4. [ ] Cancha inactiva
   - No debe aparecer en opciones
   
5. [ ] Horario fuera de operación
   - Validar contra horarios del club
```

---

## 🚀 SCRIPT DE PRUEBA AUTOMATIZADA

```bash
# 1. Verificar build
npm run build

# 2. Verificar tipos
npm run type-check

# 3. Verificar lint
npm run lint

# 4. Probar en modo producción local
npm start

# 5. Verificar conexión a BD
npx prisma db push --force-reset
npx prisma db seed
```

---

## ✅ CHECKLIST PRE-PRODUCCIÓN

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada
- [ ] Stripe en modo test funcionando
- [ ] WhatsApp configurado (o deshabilitado)

### Datos de Prueba
- [ ] Club de prueba creado
- [ ] Mínimo 3 canchas configuradas
- [ ] Reglas de precio configuradas
- [ ] Al menos 1 descuento activo
- [ ] Usuario staff creado

### Flujos Críticos Probados
- [ ] Login admin
- [ ] Login staff
- [ ] Crear reserva manual
- [ ] Pago con Stripe
- [ ] Webhook procesando pagos
- [ ] Analytics mostrando datos

### Performance
- [ ] Build sin errores
- [ ] Sin errores de TypeScript
- [ ] Lint pasando
- [ ] Carga inicial < 3 segundos
- [ ] API respondiendo < 500ms

---

## 📊 MÉTRICAS DE ÉXITO

1. **Reservas**: Crear 10 reservas sin errores
2. **Pagos**: 5 pagos exitosos procesados
3. **Analytics**: Datos correctos en dashboard
4. **Uptime**: 24 horas sin caídas
5. **Errores**: 0 errores críticos en logs

---

## 🔍 COMANDOS DE DEBUGGING

```bash
# Ver logs de Prisma
DEBUG=prisma:* npm run dev

# Ver todas las queries
DEBUG=prisma:query npm run dev

# Verificar migraciones pendientes
npx prisma migrate status

# Resetear BD de desarrollo
npx prisma migrate reset

# Ver estado de la BD
npx prisma studio
```

---

## 📱 PRUEBAS RESPONSIVAS

### Desktop (1920x1080)
- [ ] Dashboard principal
- [ ] Tablas de datos
- [ ] Formularios

### Tablet (768x1024)
- [ ] Menú colapsable
- [ ] Gráficos adaptados
- [ ] Modales centrados

### Mobile (375x667)
- [ ] Menú hamburguesa
- [ ] Tablas scrolleables
- [ ] Formularios verticales
- [ ] Botones accesibles

---

## 🚨 CONTACTOS DE SOPORTE

- **Errores Críticos**: Revisar logs en consola
- **Base de Datos**: `npx prisma studio`
- **Pagos**: Dashboard de Stripe
- **WhatsApp**: Consola de Twilio