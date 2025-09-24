# Estado del Módulo de Clases - Post Auditoría

## ✅ Correcciones Implementadas

### 1. **Modelo de Datos Corregido**
- ✅ Renombrado `ClassEnrollment` → `ClassBooking` en schema
- ✅ Campos mapeados correctamente: `playerName`, `playerEmail`, `playerPhone`
- ✅ Agregados campos faltantes: `enrollmentDate`, `paymentMethod`

### 2. **Navegación Accesible**
- ✅ Agregado "Clases" en `/dashboard/classes`
- ✅ Agregado "Instructores" en `/dashboard/instructors`
- ✅ Items visibles en el menú principal del dashboard

### 3. **APIs Funcionales**
- ✅ `/api/classes` - CRUD completo con cálculo de costos
- ✅ `/api/instructors` - Gestión de instructores con tipos de pago
- ✅ `/api/classes/[id]/enroll` - Inscripción con campos correctos

### 4. **Seguridad Multi-tenant**
- ✅ Validación de instructor pertenece al club
- ✅ Validación de cancha pertenece al club  
- ✅ Todas las queries filtran por `clubId`
- ✅ Autenticación requerida en todas las rutas

## ⚠️ Pendientes por Resolver

### 1. **Duplicidad de Rutas**
- Existen tanto `/dashboard/coaches` como `/dashboard/instructors`
- Recomendación: Consolidar en una sola ruta

### 2. **Campos Inconsistentes en APIs**
- Algunas APIs esperan `studentPhone` pero el schema tiene `playerPhone`
- Frontend envía `studentName/Email/Phone` pero backend usa `playerName/Email/Phone`

### 3. **Funcionalidades Sin UI**
- Reportes de clases (API existe, falta UI)
- Analytics de instructores
- Gestión de waitlist

## 📊 Modelo de Costos Implementado

### Estructura de Precios:
```typescript
// En ClubSettings:
- groupClassPrice: precio por defecto clase grupal
- privateClassPrice: precio por defecto clase privada  
- semiPrivateClassPrice: precio por defecto clase semi-privada
- defaultCourtCostPerHour: costo de cancha por hora

// En Instructor:
- paymentType: HOURLY | FIXED | COMMISSION | MIXED
- hourlyRate: tarifa por hora
- fixedSalary: salario fijo mensual
- commissionPercent: % de comisión

// En Class:
- price: precio al estudiante
- courtCost: costo calculado de cancha
- instructorCost: costo calculado del instructor
```

### Cálculo Automático:
1. **Costo de Cancha**: `(costoHora * duraciónMinutos) / 60`
2. **Costo Instructor**:
   - HOURLY: `tarifaHora * horas`
   - COMMISSION: `precio * comisión%`
   - MIXED: salario fijo + `precio * comisión%`
   - FIXED: 0 (se maneja aparte)

## 🔧 Próximos Pasos Recomendados

1. **Consolidar rutas duplicadas** (coaches vs instructors)
2. **Estandarizar nombres de campos** en frontend
3. **Implementar UI para reportes**
4. **Agregar tests de integración**
5. **Validar flujos end-to-end**

## 📝 Notas Técnicas

- Base de datos: PostgreSQL con Prisma ORM
- Autenticación: Lucia Auth con sesiones
- Multi-tenancy: Por clubId en todas las entidades
- Pagos: Integración con sistema de split payments existente