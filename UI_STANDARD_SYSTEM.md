# 🎨 SISTEMA UNIFICADO DE UI - PADELYZER
## Estándar Definitivo para Todos los Módulos

### ✅ DECISIONES FINALES

#### 1. LAYOUT ÚNICO
```typescript
// ✅ USAR SIEMPRE
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'

// ❌ NO USAR
import { DashboardWithNotifications } // DEPRECADO
import { SimpleDashboardLayout }      // DEPRECADO
```

#### 2. SISTEMA DE COMPONENTES
```typescript
// ✅ SISTEMA MODERN (ÚNICO PERMITIDO)
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'

// ❌ NO USAR
import { AppleButton }  // DEPRECADO
import { AppleInput }   // DEPRECADO
import { AppleModal }   // DEPRECADO
```

#### 3. ESTRUCTURA DE PÁGINA ESTÁNDAR
```typescript
// Cada página DEBE seguir esta estructura
export default function ModulePage() {
  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador"
      userRole="Administrador"
    >
      {/* 1. Header Section */}
      <PageHeader />
      
      {/* 2. Metrics Row (4 cards) */}
      <MetricsRow />
      
      {/* 3. Main Content */}
      <MainContent />
      
      {/* 4. Actions Bar */}
      <ActionsBar />
    </CleanDashboardLayout>
  )
}
```

### 📊 COMPONENTES ESTÁNDAR

#### PageHeader
```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-2">
    {título}
  </h1>
  <p className="text-gray-600">
    {descripción}
  </p>
</div>
```

#### MetricsRow (Siempre 4 métricas)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <MetricCard 
    icon={Icon}
    label="Métrica"
    value="123"
    change="+12%"
    trend="up"
  />
</div>
```

#### MainContent
```tsx
<div className="space-y-6">
  {/* Tabs si hay submódulos */}
  <TabsNavigation />
  
  {/* Content Cards */}
  <CardModern>
    <CardModernHeader>
      <CardModernTitle>{título}</CardModernTitle>
      <ButtonModern size="sm">{acción}</ButtonModern>
    </CardModernHeader>
    <CardModernContent>
      {contenido}
    </CardModernContent>
  </CardModern>
</div>
```

### 🎨 PALETA DE COLORES

#### Colores Primarios
- **Primary**: `#628F00` (Verde Padelyzer)
- **Secondary**: `#182A01` (Verde Oscuro)
- **Accent**: `#8BC34A` (Verde Claro)

#### Colores Semánticos
- **Success**: `#16a34a` (green-600)
- **Warning**: `#eab308` (yellow-500)
- **Error**: `#dc2626` (red-600)
- **Info**: `#3b82f6` (blue-500)

#### Grises
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6b7280` (gray-500)
- **Border**: `#e5e7eb` (gray-200)
- **Background**: `#f9fafb` (gray-50)

### 📏 ESPACIADO Y GRID

#### Espaciado Estándar
- `gap-4` (16px) - Entre elementos
- `gap-6` (24px) - Entre secciones
- `p-6` (24px) - Padding en cards
- `mb-8` (32px) - Entre componentes principales

#### Grid System
```tsx
// Desktop: 4 columnas
// Tablet: 2 columnas  
// Mobile: 1 columna
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Para contenido principal
className="grid grid-cols-1 lg:grid-cols-3 gap-6"
```

### 🎯 ICONOS ESTÁNDAR

#### Mapeo de Iconos por Función
```typescript
const ICON_MAP = {
  // Navegación
  dashboard: LayoutDashboard,
  bookings: Calendar,
  players: Users,
  classes: BookOpen,
  courts: Grid3x3,
  finance: DollarSign,
  settings: Settings,
  
  // Acciones
  add: Plus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  cancel: X,
  confirm: Check,
  
  // Estados
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
  
  // Métricas
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  revenue: DollarSign,
  users: Users,
  time: Clock,
  location: MapPin
}
```

### 🔄 ESTADOS Y LOADING

#### Loading State
```tsx
{loading ? (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
  </div>
) : (
  <Content />
)}
```

#### Empty State
```tsx
<div className="text-center py-12">
  <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    No hay datos
  </h3>
  <p className="text-gray-500">
    Descripción del estado vacío
  </p>
  <ButtonModern className="mt-4">
    <Plus className="w-4 h-4 mr-2" />
    Acción principal
  </ButtonModern>
</div>
```

### 📱 RESPONSIVE DESIGN

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Reglas Responsive
1. Mobile-first approach
2. Cards stack en mobile
3. Sidebar colapsa en mobile
4. Tablas scroll horizontal en mobile

### ⚡ PATRONES DE INTERACCIÓN

#### Modales
- Crear/Editar: Modal overlay
- Confirmación: Modal pequeño centrado
- Detalles: Slide-over desde derecha

#### Notificaciones
```tsx
// Usar el hook unificado
const notify = useNotify()

notify.success({
  title: 'Éxito',
  message: 'Operación completada'
})
```

#### Formularios
1. Labels encima de inputs
2. Validación en tiempo real
3. Botones: Primario (guardar) a la derecha, Secundario (cancelar) a la izquierda
4. Loading state en botón al enviar

### 🚫 PROHIBIDO

1. **NO mezclar sistemas de componentes**
2. **NO usar estilos inline** (excepto para valores dinámicos)
3. **NO crear nuevos layouts**
4. **NO usar colores fuera de la paleta**
5. **NO crear componentes duplicados**
6. **NO usar más de 2 niveles de navegación**

### ✅ CHECKLIST DE VALIDACIÓN

Antes de hacer commit, verificar:
- [ ] Usa CleanDashboardLayout
- [ ] Usa sistema Modern de componentes
- [ ] Tiene las 4 métricas principales
- [ ] Responsive en todos los breakpoints
- [ ] Loading states implementados
- [ ] Empty states cuando aplique
- [ ] Iconos del mapeo estándar
- [ ] Colores de la paleta oficial
- [ ] Sin estilos inline innecesarios
- [ ] Notificaciones con useNotify()

---

## IMPLEMENTACIÓN INMEDIATA

### Prioridad 1 (Esta semana)
1. Migrar Bookings y Players a CleanDashboardLayout
2. Eliminar componentes Apple
3. Unificar Courts (eliminar estilos inline)

### Prioridad 2 (Próxima semana)
1. Simplificar módulo Finance (reducir complejidad)
2. Agregar métricas a todos los módulos
3. Implementar loading/empty states faltantes

### Prioridad 3 (Siguiente sprint)
1. Documentación interactiva
2. Storybook con ejemplos
3. Tests de componentes