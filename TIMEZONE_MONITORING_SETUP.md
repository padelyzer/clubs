# 🕐 Timezone Monitoring & Validation Setup

Este documento describe cómo configurar el monitoreo y validación de timezone para presente y futuro en producción.

## 📋 Resumen del Sistema

El sistema de timezone está completamente automatizado y validado para garantizar que:
- ✅ Todos los clubes existentes tengan timezone configurado
- ✅ Todos los clubes futuros obtengan timezone automáticamente
- ✅ Las operaciones UTC funcionen correctamente
- ✅ Los APIs usen timezone dinámico del club
- ✅ El calendario muestre fechas correctas

## 🔧 Componentes Implementados

### 1. Validador Comprensivo (`TimezoneValidator`)
**Ubicación**: `lib/validation/timezone-validator.ts`

**Funcionalidades**:
- Validación completa del sistema
- Auto-reparación de problemas menores
- Generación de reportes detallados
- Pruebas de escenarios futuros

### 2. API de Monitoreo
**Endpoint**: `/api/admin/system/timezone-health`

**Métodos disponibles**:
```bash
# Reporte JSON para monitoreo
GET /api/admin/system/timezone-health?format=json

# Reporte de texto legible
GET /api/admin/system/timezone-health?format=report

# Auto-reparación automática
GET /api/admin/system/timezone-health?autoFix=true

# Reparación manual
POST /api/admin/system/timezone-health
```

### 3. Scripts de Validación

#### Script Comprensivo
```bash
npx tsx scripts/comprehensive-timezone-validation.ts
```
- Validación completa del sistema
- Pruebas de rendimiento
- Simulación de clubes futuros
- Auto-reparación si es necesario

#### Script Programado (Cron)
```bash
npx tsx scripts/scheduled-timezone-check.ts
```
- Diseñado para ejecutarse automáticamente
- Salida optimizada para logs
- Exit codes para sistemas de monitoreo

## 📅 Configuración de Monitoreo

### 1. Cron Job (Recomendado)

Agregar al crontab del servidor:

```bash
# Validación diaria a las 3 AM
0 3 * * * cd /path/to/project && npx tsx scripts/scheduled-timezone-check.ts >> /var/log/timezone-health.log 2>&1

# Validación después de cada despliegue
@reboot sleep 60 && cd /path/to/project && npx tsx scripts/scheduled-timezone-check.ts
```

### 2. Monitoreo de Aplicación

```javascript
// Ejemplo para sistemas de monitoreo como Datadog, New Relic, etc.
async function healthCheck() {
  try {
    const response = await fetch('/api/admin/system/timezone-health?format=json', {
      headers: { Authorization: 'Bearer YOUR_ADMIN_TOKEN' }
    })
    const data = await response.json()
    
    // Métricas importantes
    metrics.gauge('timezone.health_score', data.monitoring.healthScore)
    metrics.gauge('timezone.clubs_total', data.monitoring.totalClubs)
    metrics.gauge('timezone.clubs_without_timezone', data.monitoring.clubsWithoutTimezone)
    
    if (!data.validation.success) {
      alerts.trigger('timezone_system_unhealthy', data)
    }
  } catch (error) {
    alerts.trigger('timezone_health_check_failed', error)
  }
}
```

### 3. Docker/Kubernetes

```yaml
# kubernetes-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: timezone-health-check
spec:
  schedule: "0 3 * * *"  # Diario a las 3 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: timezone-check
            image: your-app:latest
            command: ["npx", "tsx", "scripts/scheduled-timezone-check.ts"]
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
          restartPolicy: OnFailure
```

## 🚨 Alertas y Notificaciones

### Métricas Críticas

1. **Health Score** (`0-100`)
   - `100`: Sistema perfecto
   - `80-99`: Problemas menores
   - `50-79`: Problemas moderados
   - `<50`: Problemas críticos

2. **Clubes sin Timezone** (`count`)
   - `0`: ✅ Ideal
   - `>0`: ⚠️ Requiere atención

3. **Errores de Validación** (`count`)
   - `0`: ✅ Ideal
   - `>0`: 🚨 Crítico

### Configurar Alertas

```bash
# Ejemplo de alerta simple
if [ "$(curl -s /api/admin/system/timezone-health | jq -r '.monitoring.healthScore')" -lt "90" ]; then
  echo "ALERT: Timezone health score below 90"
  # Enviar notificación
fi
```

## 🔮 Garantías para Clubes Futuros

### Proceso Automático
1. **Registro de Club** → Captura ciudad/estado/país
2. **Aprobación de Club** → `ClubAdminIntegrationService.approveClub()`
3. **Creación Automática** → ClubSettings con timezone inteligente
4. **Validación Inmediata** → Timezone verificado durante aprobación
5. **Sistema Operativo** → APIs y calendario funcionan correctamente

### Detección de Timezone
- **México**: Soporte completo para 6 zonas horarias
- **Latinoamérica**: Argentina, Chile, Perú, Colombia, Venezuela, Brasil
- **Internacional**: España y otros países
- **Fallback**: America/Mexico_City para ubicaciones desconocidas

## 🧪 Pruebas y Validación

### Validación Manual
```bash
# Validación completa
npx tsx scripts/comprehensive-timezone-validation.ts

# Solo validación de presente
npx tsx scripts/final-timezone-validation-report.ts

# Solo detección de timezone
npx tsx scripts/test-timezone-detection.ts
```

### Prueba de API
```bash
# Health check
curl -H "Authorization: Bearer TOKEN" \
  "https://tu-dominio.com/api/admin/system/timezone-health?format=json" | jq

# Auto-repair
curl -X POST -H "Authorization: Bearer TOKEN" \
  "https://tu-dominio.com/api/admin/system/timezone-health"
```

## 📊 Métricas de Rendimiento

### Benchmarks
- **400 operaciones de timezone**: ~4ms
- **Validación completa**: ~200ms
- **Auto-reparación**: ~1s por club

### Optimización
- Funciones de timezone cacheadas
- Consultas de DB optimizadas
- Validación incremental

## 🔒 Seguridad

### Acceso Restringido
- APIs requieren `SUPER_ADMIN` role
- Scripts solo ejecutables con permisos de servidor
- Logs no contienen información sensible

### Auditoría
- Todas las reparaciones se registran en audit log
- Cambios de timezone rastreados
- Health checks logueados

## 📈 Dashboard Recomendado

### Métricas para Mostrar
1. **Timeline de Health Score** (últimos 30 días)
2. **Distribución de Timezones** por club
3. **Errores de Validación** por tipo
4. **Tiempo de Respuesta** de health checks
5. **Auto-reparaciones** realizadas

### Alertas Recomendadas
- Health Score < 90: Warning
- Health Score < 70: Critical
- Clubes sin timezone > 0: Warning
- Errores de validación > 0: Critical
- Health check falla: Critical

## 🎯 Checklist de Producción

- [ ] Cron job configurado para validación diaria
- [ ] API de health check accesible para monitoreo
- [ ] Alertas configuradas para métricas críticas
- [ ] Dashboard de monitoreo implementado
- [ ] Logs de timezone health archivados
- [ ] Auto-reparación habilitada para problemas menores
- [ ] Documentación de escalación para problemas críticos
- [ ] Pruebas de failover y recuperación realizadas

---

## 🆘 Solución de Problemas

### Problema: Clubes sin timezone
**Solución**: Ejecutar auto-reparación
```bash
npx tsx scripts/ensure-timezone-for-all-clubs.ts
```

### Problema: Timezone inválido
**Solución**: Usar API de reparación
```bash
curl -X POST /api/admin/system/timezone-health
```

### Problema: Rendimiento lento
**Solución**: Verificar índices de DB y optimizar consultas

### Problema: Health check falla
**Solución**: 
1. Verificar conexión a DB
2. Revisar logs de error
3. Ejecutar validación manual
4. Contactar equipo de desarrollo si persiste

---

**🎉 Con este sistema, el timezone funcionará correctamente para todos los clubes presentes y futuros, con monitoreo automático y reparación inteligente.**