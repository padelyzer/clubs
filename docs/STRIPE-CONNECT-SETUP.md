# Configuración de Stripe Connect para Padelyzer

Este documento explica cómo configurar y usar el sistema completo de pagos con Stripe Connect implementado en Padelyzer.

## Características Implementadas

### 1. Onboarding de Stripe Connect
- Página de configuración para clubes (`/dashboard/payments`)
- Flujo OAuth completo con Stripe
- Verificación de estado de cuenta en tiempo real
- Dashboard de métricas de pagos

### 2. Procesamiento de Pagos
- **Tarjetas de crédito/débito**: Visa, MasterCard, AMEX
- **OXXO**: Pagos en efectivo con código de barras
- **SPEI**: Transferencias bancarias mexicanas
- Pagos divididos entre jugadores
- Confirmación automática via webhooks

### 3. Sistema de Comisiones
- Comisión configurable por club (default: 2.5%)
- Cálculo automático de fees de Stripe
- Transferencias automáticas a cuentas conectadas
- Reportes detallados de comisiones

### 4. Seguridad y Compliance
- Verificación de webhooks con firma
- Manejo seguro de Payment Intents
- Prevención de doble cobro
- Logs de auditoría completos

## Configuración Inicial

### 1. Configurar Stripe Dashboard

1. **Crear cuenta de Stripe**:
   - Ir a https://dashboard.stripe.com
   - Crear cuenta y completar verificación

2. **Habilitar Stripe Connect**:
   ```
   Dashboard → Settings → Connect → Get started
   ```

3. **Configurar webhooks**:
   ```
   Dashboard → Developers → Webhooks → Add endpoint
   URL: https://tu-dominio.com/api/stripe/webhook
   Eventos: payment_intent.succeeded, payment_intent.payment_failed, 
            account.updated, charge.succeeded, transfer.created
   ```

4. **Obtener claves API**:
   ```
   Dashboard → Developers → API keys
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
   - Webhook signing secret (whsec_...)
   ```

### 2. Variables de Entorno

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXTAUTH_URL="https://tu-dominio.com"
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

### 3. Configurar Base de Datos

```bash
npx prisma generate
npx prisma db push
```

## Flujo de Uso

### Para Clubes

1. **Configurar Pagos**:
   - Ir a Dashboard → Pagos
   - Hacer click en "Conectar con Stripe"
   - Completar onboarding de Stripe Connect
   - Verificar que la cuenta esté activa

2. **Recibir Pagos**:
   - Los pagos se procesan automáticamente
   - Comisiones se deducen automáticamente
   - Fondos se transfieren a cuenta bancaria del club

3. **Dashboard de Pagos**:
   - Ver estadísticas en tiempo real
   - Exportar reportes de transacciones
   - Acceder al dashboard de Stripe

### Para Jugadores

1. **Pago Completo**:
   ```
   URL: /pay/{bookingId}
   ```

2. **Pago Dividido**:
   ```
   URL: /pay/{bookingId}?split={splitPaymentId}
   ```

3. **Métodos Disponibles**:
   - Tarjeta (inmediato)
   - OXXO (24 horas para pagar)
   - SPEI (72 horas para pagar)

## APIs Implementadas

### Stripe Connect
```
POST /api/stripe/connect              # Iniciar onboarding
GET  /api/stripe/connect/callback     # Callback OAuth
POST /api/stripe/connect/refresh      # Refrescar onboarding
GET  /api/stripe/connect/status       # Estado de cuenta
POST /api/stripe/connect/dashboard    # Link al dashboard
```

### Procesamiento de Pagos
```
POST /api/stripe/payments/create-intent  # Crear Payment Intent
POST /api/stripe/payments/confirm        # Confirmar pago
POST /api/stripe/payments/oxxo          # Pago OXXO
POST /api/stripe/payments/spei          # Pago SPEI
GET  /api/stripe/payments/{id}/status   # Estado del pago
```

### Webhooks
```
POST /api/stripe/webhook              # Procesar eventos de Stripe
```

### Comisiones y Transferencias
```
GET  /api/payments/commission/summary    # Resumen de comisiones
POST /api/payments/commission/update     # Actualizar tasa
GET  /api/payments/transfers/pending     # Transferencias pendientes
POST /api/payments/transfers/process     # Procesar transferencias
```

## Estructura de Comisiones

### Cálculo de Fees
```javascript
// Ejemplo para reserva de $400 MXN
const totalAmount = 40000  // cents
const platformFee = 1000   // 2.5% = $10 MXN
const stripeFee = 1740     // 3.6% + $3 = ~$17.40 MXN
const netAmount = 37260    // $372.60 MXN para el club
```

### Distribución
- **Club recibe**: Monto total - comisión Padelyzer
- **Stripe deduce**: Sus propias comisiones del monto del club
- **Padelyzer recibe**: Comisión configurada (default 2.5%)

## Métodos de Pago Mexicanos

### OXXO
- Tiempo límite: 24 horas
- Código de barras generado automáticamente
- Confirmación via webhook cuando se paga
- Ideal para usuarios sin tarjeta bancaria

### SPEI
- Tiempo límite: 72 horas  
- CLABE y referencia únicas por transacción
- Transferencia bancaria inmediata
- Sin costo adicional para el cliente

## Webhooks y Estados

### Eventos Manejados
```javascript
payment_intent.succeeded     // Pago exitoso
payment_intent.payment_failed // Pago fallido
payment_intent.canceled      // Pago cancelado
account.updated             // Cuenta Connect actualizada
charge.succeeded           // Cargo exitoso
transfer.created           // Transferencia creada
```

### Estados de Pago
```javascript
pending     // Pago iniciado
processing  // En proceso
completed   // Completado
failed      // Fallido
cancelled   // Cancelado
refunded    // Reembolsado
```

## Testing

### Tarjetas de Test
```
Éxito: 4242424242424242
Decline: 4000000000000002
Require 3DS: 4000002500003155
```

### OXXO Test
```
Usar cualquier monto en modo test
El pago se simula automáticamente
```

### SPEI Test
```
En modo test, las transferencias se procesan inmediatamente
```

## Monitoreo y Logs

### Logs de Aplicación
- Todos los eventos se registran en console
- Errores de webhook se capturan y almacenan
- Estados de pago se actualizan en tiempo real

### Dashboard de Stripe
- Acceso directo desde `/dashboard/payments`
- Métricas detalladas de transacciones
- Reportes de disputas y reembolsos

## Seguridad

### Validaciones Implementadas
- Verificación de firma de webhooks
- Validación de montos y monedas
- Prevención de doble procesamiento
- Timeouts para métodos offline

### PCI Compliance
- No almacenamos datos de tarjetas
- Stripe Elements para captura segura
- Tokenización automática de pagos

## Solución de Problemas

### Errores Comunes

1. **"El club no tiene configurados los pagos"**
   - Verificar que el onboarding esté completo
   - Comprobar stripeOnboardingCompleted = true

2. **"Webhook signature verification failed"**
   - Verificar STRIPE_WEBHOOK_SECRET
   - Comprobar que el endpoint esté configurado correctamente

3. **"Payment Intent no encontrado"**
   - Verificar que el Payment Intent existe en Stripe
   - Comprobar que se está usando la cuenta correcta

### Debug
```bash
# Ver logs de webhooks
tail -f logs/stripe-webhooks.log

# Verificar estado de cuenta Connect
curl -X GET /api/stripe/connect/status \
  -H "x-user-id: YOUR_USER_ID"
```

## Próximos Pasos

1. **Configurar en Producción**:
   - Cambiar a claves live de Stripe
   - Configurar dominio real para webhooks
   - Completar verificación de negocio

2. **Optimizaciones**:
   - Implementar retry logic para webhooks
   - Agregar notificaciones por email
   - Crear reportes avanzados

3. **Nuevas Características**:
   - Reembolsos automáticos
   - Suscripciones para membresías
   - Pagos recurrentes

---

Para más información, consultar la documentación oficial de Stripe Connect: https://stripe.com/docs/connect