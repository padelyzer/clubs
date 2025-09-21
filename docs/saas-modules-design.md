# Sistema de Módulos SaaS - Diseño

## 📋 Requerimientos Confirmados

### Módulos Disponibles:
1. **Reservas** - Escala con número de canchas
2. **Registro de Clientes** - Escala con número de canchas  
3. **Torneos** - Escala con número de canchas
4. **Clases** - Escala con número de canchas
5. **Finanzas** - Precio fijo (no escala con canchas)

### Estructura de Precios:
- **Escalones**: 1-5 canchas, 6-10 canchas, 11-20 canchas, 21+ canchas
- **Módulos escalables**: Precio por módulo varía según número de canchas
- **Módulo Finanzas**: Precio fijo independiente de canchas
- **Descuentos**: Configurables por volumen/promoción
- **Facturación**: Mensual por módulo activo

### Funcionalidad:
- **Activación**: En tiempo real
- **Desactivación**: Ocultar completamente las funciones
- **Período de gracia**: Configurable (ej: 7 días)
- **Exportación**: CSV automático al desactivar módulo
- **Datos históricos**: Se conservan pero inaccesibles

## 🗄️ Estructura de Base de Datos

### Nuevos Modelos:

#### 1. SaasModule
```prisma
model SaasModule {
  id          String @id @default(cuid())
  code        String @unique // 'bookings', 'customers', 'tournaments', 'classes', 'finance'
  name        String
  description String?
  isActive    Boolean @default(true)
  scalesWithCourts Boolean @default(true) // false para finanzas
  sortOrder   Int @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  pricingTiers ModulePricingTier[]
  clubModules  ClubModule[]
  
  @@index([isActive, sortOrder])
}
```

#### 2. ModulePricingTier  
```prisma
model ModulePricingTier {
  id          String @id @default(cuid())
  moduleId    String
  name        String // "1-5 canchas", "6-10 canchas", etc.
  minCourts   Int
  maxCourts   Int? // null = sin límite
  price       Int // Precio en centavos
  currency    String @default("MXN")
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  module SaasModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  @@index([moduleId, minCourts])
  @@index([isActive])
}
```

#### 3. ClubModule
```prisma
model ClubModule {
  id              String @id @default(cuid())
  clubId          String
  moduleId        String
  isEnabled       Boolean @default(false)
  enabledAt       DateTime?
  disabledAt      DateTime?
  gracePeriodEnd  DateTime? // Fecha hasta la cual funciona gratis
  lastExportAt    DateTime? // Última exportación de datos
  settings        Json? // Configuraciones específicas del módulo
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  club   Club @relation(fields: [clubId], references: [id], onDelete: Cascade)
  module SaasModule @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  @@unique([clubId, moduleId])
  @@index([clubId, isEnabled])
  @@index([gracePeriodEnd])
}
```

#### 4. ModuleDiscount
```prisma
model ModuleDiscount {
  id              String @id @default(cuid())
  name            String
  description     String?
  discountType    DiscountType // PERCENTAGE, FIXED_AMOUNT
  discountValue   Int // Porcentaje o monto fijo en centavos
  isActive        Boolean @default(true)
  validFrom       DateTime
  validUntil      DateTime?
  
  // Condiciones
  minCourts       Int? // Mínimo de canchas para aplicar
  moduleIds       String[] // Módulos específicos (vacío = todos)
  maxUses         Int? // Límite de usos (null = ilimitado)
  currentUses     Int @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([isActive, validFrom, validUntil])
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}
```

#### 5. ClubModuleBilling
```prisma
model ClubModuleBilling {
  id              String @id @default(cuid())
  clubId          String
  moduleId        String
  billingPeriod   DateTime // Año-Mes
  courtsCount     Int // Número de canchas en ese período
  tierUsed        String // Tier aplicado
  basePrice       Int // Precio base del tier
  discountApplied Int @default(0) // Descuento aplicado
  finalPrice      Int // Precio final
  currency        String @default("MXN")
  status          BillingStatus @default(PENDING)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  club Club @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  @@unique([clubId, moduleId, billingPeriod])
  @@index([clubId, billingPeriod])
  @@index([status])
}

enum BillingStatus {
  PENDING
  PAID
  FAILED
  CANCELLED
}
```

## 🔧 Lógica de Negocio

### Cálculo de Precios:
1. Contar canchas activas del club
2. Buscar tier correspondiente para cada módulo
3. Aplicar descuentos si existen
4. Generar facturación mensual

### Control de Acceso:
```typescript
// Middleware para verificar acceso a módulos
function hasModuleAccess(clubId: string, moduleCode: string): boolean {
  const clubModule = getClubModule(clubId, moduleCode)
  
  if (!clubModule?.isEnabled) return false
  
  // Verificar período de gracia
  if (clubModule.gracePeriodEnd && new Date() <= clubModule.gracePeriodEnd) {
    return true
  }
  
  // Verificar pago al día
  return isModulePaidUp(clubId, moduleCode)
}
```

### Exportación Automática:
- Trigger al desactivar módulo
- Genera CSV con datos relevantes
- Envía por email al admin del club
- Marca fecha de exportación

## 📊 Casos de Uso

### Ejemplo de Pricing:
**Club con 8 canchas quiere módulos Reservas + Torneos:**

- Reservas (6-10 canchas): $500 MXN/mes
- Torneos (6-10 canchas): $300 MXN/mes  
- Total: $800 MXN/mes

### Período de Gracia:
- Club desactiva Torneos el día 15
- Gracia de 7 días configurada
- Funciona hasta día 22
- Día 23: Se oculta completamente + exporta CSV