# 🛡️ Configuración de Sentry

## Estado Actual
- ✅ Sentry ya está instalado (`@sentry/nextjs@10.10.0`)
- ✅ Archivos de configuración creados
- ⚠️ Falta configurar el DSN

## Pasos para Activar Sentry

### 1. Crear cuenta/proyecto en Sentry
1. Ve a [sentry.io](https://sentry.io)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto:
   - Platform: **Next.js**
   - Project name: **padelyzer** (o el que prefieras)

### 2. Obtener el DSN
1. En la configuración del proyecto
2. Settings > Projects > [tu-proyecto] > Client Keys (DSN)
3. Copia el DSN (formato: `https://xxxxx@xxx.ingest.sentry.io/xxxxx`)

### 3. Configurar en Vercel
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega:
   ```
   NEXT_PUBLIC_SENTRY_DSN = [tu DSN aquí]
   SENTRY_ORG = [tu organización en Sentry]
   SENTRY_PROJECT = [nombre del proyecto]
   ```

### 4. Configuración Local (opcional)
En `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxx.ingest.sentry.io/xxxxx
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=padelyzer
```

## Características Configuradas

### 1. Filtrado de Datos Sensibles
- Contraseñas, tokens y API keys se eliminan automáticamente
- Rutas de health check no se reportan

### 2. Rate de Muestreo
- Producción: 10% de transacciones
- Desarrollo: 100% de transacciones

### 3. Session Replay
- Graba sesiones cuando ocurren errores
- Enmascara todo el texto por privacidad
- Bloquea todos los medios

### 4. Errores Ignorados
- Extensiones del navegador
- Errores de ads
- Errores de red comunes

## Verificación Post-Configuración

### 1. Test Manual
```javascript
// En cualquier componente/página
throw new Error("Test Sentry Error");
```

### 2. Verificar en Dashboard
- Ve a sentry.io
- Deberías ver el error de test
- Verifica que los datos sensibles estén filtrados

### 3. Performance Monitoring
- Las transacciones de API deberían aparecer
- Verifica tiempos de respuesta
- Identifica endpoints lentos

## Uso en el Código

### Capturar Errores Manualmente
```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // código que puede fallar
} catch (error) {
  Sentry.captureException(error);
}
```

### Agregar Contexto
```typescript
Sentry.setUser({ id: userId, email: userEmail });
Sentry.setTag("feature", "bookings");
Sentry.setContext("booking", { id: bookingId, court: courtId });
```

### Breadcrumbs Personalizados
```typescript
Sentry.addBreadcrumb({
  message: "User clicked booking button",
  category: "ui",
  level: "info",
});
```

## Mejores Prácticas

1. **No loguear información PII** (Personal Identifiable Information)
2. **Usar contexto** para facilitar debugging
3. **Revisar regularmente** los errores reportados
4. **Configurar alertas** para errores críticos
5. **Usar source maps** para mejor debugging

## Próximos Pasos
1. Configurar el DSN en Vercel
2. Hacer deploy
3. Verificar que los errores se reporten correctamente
4. Configurar alertas para errores críticos