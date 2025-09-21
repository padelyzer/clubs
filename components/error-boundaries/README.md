# Error Boundaries System - Padelyzer

Sistema completo de manejo de errores para React con logging estructurado y recuperación automática.

## Componentes Disponibles

### 1. ErrorBoundary (Principal)
Componente base para capturar errores de React.

```tsx
import { ErrorBoundary, PageErrorBoundary, ComponentErrorBoundary, CriticalErrorBoundary } from '@/components/error-boundaries/ErrorBoundary'

// Uso básico
<ErrorBoundary level="component" context="user-profile">
  <UserProfile />
</ErrorBoundary>

// Componentes de conveniencia
<PageErrorBoundary context="dashboard">
  <Dashboard />
</PageErrorBoundary>

<ComponentErrorBoundary context="booking-form">
  <BookingForm />
</ComponentErrorBoundary>

<CriticalErrorBoundary context="payment-processing">
  <PaymentProcessor />
</CriticalErrorBoundary>
```

### 2. AsyncErrorBoundary
Para manejar errores de operaciones asíncronas y promises no manejadas.

```tsx
import { AsyncErrorBoundary, useAsyncError } from '@/components/error-boundaries/AsyncErrorBoundary'

function MyComponent() {
  const throwAsyncError = useAsyncError()

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation()
    } catch (error) {
      throwAsyncError(error) // Esto será capturado por AsyncErrorBoundary
    }
  }

  return (
    <AsyncErrorBoundary>
      <button onClick={handleAsyncOperation}>
        Operación Riesgosa
      </button>
    </AsyncErrorBoundary>
  )
}
```

### 3. RobustErrorBoundary
Combina ambos tipos de error handling.

```tsx
import { RobustErrorBoundary } from '@/components/error-boundaries/AsyncErrorBoundary'

<RobustErrorBoundary context="complex-feature" level="page">
  <ComplexFeatureWithAsyncOperations />
</RobustErrorBoundary>
```

### 4. GlobalErrorHandler
Maneja errores globales de la aplicación (network, permisos, etc.).

```tsx
import { GlobalErrorHandler, GlobalErrorUtils } from '@/components/error-boundaries/GlobalErrorHandler'

// Se incluye automáticamente en el layout principal
<GlobalErrorHandler />

// Uso programático
GlobalErrorUtils.networkError()
GlobalErrorUtils.permissionError('reservas')
GlobalErrorUtils.quotaError()
GlobalErrorUtils.genericError('Algo salió mal', () => window.location.reload())
```

## Niveles de Error Boundary

### Component Level
- Para errores en componentes individuales
- UI más compacta
- Permite que el resto de la página funcione

### Page Level
- Para errores que afectan toda la página
- UI más prominente
- Opciones de navegación y recarga

### Critical Level
- Para errores críticos del sistema
- UI de alerta máxima
- Logging prioritario

## Integración con Logging

Todos los errores son automáticamente loggeados con:

```typescript
logger.error('React Error Boundary (level)', error, {
  errorId: 'uuid',
  level: 'component|page|critical',
  context: 'user-defined-context',
  componentStack: 'react-component-stack',
  errorBoundary: true,
  category: 'react-error',
})
```

## Integración con Sentry

En producción, los errores se envían automáticamente a Sentry:

```typescript
Sentry.captureException(error, {
  contexts: {
    react: {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      level,
      context,
    },
  },
  tags: {
    errorBoundary: level,
    errorId,
  },
})
```

## Mejores Prácticas

### 1. Ubicación de Error Boundaries

```tsx
// ✅ Correcto - En el layout principal (crítico)
<CriticalErrorBoundary context="root-layout">
  <App />
</CriticalErrorBoundary>

// ✅ Correcto - En páginas individuales
<PageErrorBoundary context="dashboard">
  <DashboardContent />
</PageErrorBoundary>

// ✅ Correcto - En componentes complejos
<ComponentErrorBoundary context="booking-calendar">
  <BookingCalendar />
</ComponentErrorBoundary>

// ❌ Incorrecto - Demasiado granular
<ComponentErrorBoundary>
  <button>Click me</button>
</ComponentErrorBoundary>
```

### 2. Contexto Descriptivo

```tsx
// ✅ Correcto
<ErrorBoundary context="user-profile-editing">
  <UserProfileForm />
</ErrorBoundary>

// ❌ Incorrecto
<ErrorBoundary context="form">
  <UserProfileForm />
</ErrorBoundary>
```

### 3. Manejo de Async Errors

```tsx
// ✅ Correcto
function useBookingData() {
  const throwAsyncError = useAsyncError()

  const fetchBookings = async () => {
    try {
      return await api.getBookings()
    } catch (error) {
      throwAsyncError(error)
      throw error // Re-throw para mantener el flow normal
    }
  }

  return { fetchBookings }
}

// ❌ Incorrecto - Error no capturado
function useBookingData() {
  const fetchBookings = async () => {
    return await api.getBookings() // Error no manejado
  }

  return { fetchBookings }
}
```

### 4. Fallbacks Personalizados

```tsx
<ErrorBoundary
  fallback={
    <div className="custom-error">
      <h3>Error en el módulo de pagos</h3>
      <p>Por favor, contacta al soporte técnico</p>
    </div>
  }
>
  <PaymentModule />
</ErrorBoundary>
```

## Configuración de Producción

### Variables de Entorno

```env
# Para Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Para Axiom (logging externo)
AXIOM_TOKEN=your_axiom_token
AXIOM_DATASET=your_dataset_name
```

### Monitoring y Alertas

Los errores críticos automáticamente:

1. **Se loggean** en el sistema de logging estructurado
2. **Se envían a Sentry** para tracking y alertas
3. **Se almacenan localmente** para debugging
4. **Generan métricas** para monitoring

## Testing Error Boundaries

```tsx
// Componente de prueba para development
function ErrorBoundaryTest() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('Test error for boundary')
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Simular Error
    </button>
  )
}

// En desarrollo
<ErrorBoundary context="error-test">
  <ErrorBoundaryTest />
</ErrorBoundary>
```

## Métricas y Monitoring

El sistema automáticamente trackea:

- **Error rate** por página/componente
- **Recovery rate** (cuántos usuarios recuperan exitosamente)
- **Error patterns** (errores más comunes)
- **Performance impact** de los error boundaries

Estas métricas están disponibles en los logs estructurados y en Sentry dashboards.