# 📋 Plan de Corrección TypeScript/ESLint

## Estado Actual
- TypeScript y ESLint están temporalmente deshabilitados para permitir deploys
- Se encontraron múltiples errores y warnings que necesitan corrección

## Errores TypeScript Prioritarios

### 1. Errores de Modelos Prisma (activate-all-modules.ts)
- ✅ RESUELTO: `clubModuleAccess` → `clubModule`
- ✅ RESUELTO: Campo `packageId` no existe → usar `ClubPackage`
- ✅ RESUELTO: Campo `code` en SaasPackage → usar `name`

### 2. Errores de Componentes UI
- **AppleModal**: Prop `maxWidth` no existe
  - Archivos afectados: calendar/page.tsx
  - Solución: Verificar props del componente AppleModal

- **Button variant**: `"danger"` no es válido
  - Archivo: calendar/page.tsx línea 1221
  - Solución: Cambiar a variant válido o actualizar tipos

### 3. Errores de Tipos
- `splitPaymentCount` posiblemente undefined
- `timeSlots` tiene tipo implícito any[]
- Tipos incompatibles en Booking[]

### 4. Warnings ESLint Comunes
- Variables no usadas (@typescript-eslint/no-unused-vars)
- Uso de `any` (@typescript-eslint/no-explicit-any)
- Prefer const sobre let

## Plan de Acción

### Fase 1: Correcciones Críticas (1-2 días)
1. Corregir errores de tipos que rompen el build
2. Resolver props incorrectos en componentes
3. Eliminar usos de `any` explícitos

### Fase 2: Limpieza de Warnings (2-3 días)
1. Remover variables no usadas
2. Convertir let a const donde aplique
3. Agregar tipos específicos en lugar de any

### Fase 3: Mejoras de Calidad (3-5 días)
1. Habilitar strictNullChecks gradualmente
2. Agregar validación de tipos en APIs
3. Documentar tipos complejos

## Scripts de Ayuda

### Verificar errores específicos:
```bash
# Solo errores TypeScript
npm run type-check 2>&1 | grep "error TS"

# Solo warnings ESLint
npm run lint 2>&1 | grep "Warning:"

# Errores por archivo
npm run type-check 2>&1 | grep -E "\.tsx?:" | cut -d: -f1 | sort | uniq -c
```

### Corrección gradual:
```bash
# Corregir un archivo a la vez
npx eslint --fix app/path/to/file.tsx
npx tsc --noEmit app/path/to/file.tsx
```

## Configuración Temporal

Mientras se corrigen los errores, mantener en `next.config.js`:
```javascript
eslint: {
  ignoreDuringBuilds: true, // TODO: Cambiar a false
},
typescript: {
  ignoreBuildErrors: true, // TODO: Cambiar a false
}
```

## Métricas de Progreso
- [ ] 0/9 errores TypeScript corregidos
- [ ] 0/100+ warnings ESLint resueltos
- [ ] Build pasa con verificaciones habilitadas