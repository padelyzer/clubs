# 📘 GUÍA DE IMPLEMENTACIÓN - UI UNIFICADA

## 🚀 CÓMO MIGRAR UN MÓDULO AL NUEVO ESTÁNDAR

### Paso 1: Cambiar el Layout

```diff
- import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
+ import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'

- import { AppleButton } from '@/components/design-system/AppleButton'
- import { AppleInput } from '@/components/design-system/AppleInput'
+ import { ButtonModern } from '@/components/design-system/ButtonModern'
+ import { InputModern } from '@/components/design-system/InputModern'
```

### Paso 2: Estructura de la Página

```tsx
export default function ModulePage() {
  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador"
      userRole="Administrador"
    >
      {/* 1. Header obligatorio */}
      <PageHeader 
        title="Título del Módulo"
        description="Descripción breve del módulo"
      />
      
      {/* 2. Métricas (siempre 4) */}
      <MetricsRow metrics={metrics} />
      
      {/* 3. Contenido principal */}
      <MainContent>
        {/* Tu contenido aquí */}
      </MainContent>
      
      {/* 4. Barra de acciones */}
      <ActionsBar />
    </CleanDashboardLayout>
  )
}
```

### Paso 3: Componente MetricCard

```tsx
const MetricCard = ({ icon: Icon, label, value, change, trend, color }) => (
  <CardModern>
    <CardModernContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change && (
          <span className={`text-sm font-semibold ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </CardModernContent>
  </CardModern>
)
```

### Paso 4: Grid Responsive

```tsx
// Para métricas (siempre 4)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Para contenido principal con sidebar
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Contenido principal */}</div>
  <div>{/* Sidebar */}</div>
</div>

// Para listas o tablas
<div className="grid grid-cols-1 gap-4">
```

## 🔄 CHECKLIST DE MIGRACIÓN

### Para cada módulo:

- [ ] **1. Eliminar imports deprecados**
  - [ ] Remover DashboardWithNotifications
  - [ ] Remover componentes Apple*
  - [ ] Remover estilos inline

- [ ] **2. Agregar estructura estándar**
  - [ ] Page Header con título y descripción
  - [ ] 4 métricas principales
  - [ ] Grid responsive correcto
  - [ ] Actions bar al final

- [ ] **3. Unificar componentes**
  - [ ] Cambiar a CardModern
  - [ ] Cambiar a ButtonModern
  - [ ] Cambiar a InputModern

- [ ] **4. Aplicar colores estándar**
  - [ ] Verde primario: #628F00
  - [ ] Grises de Tailwind
  - [ ] Colores semánticos (success, warning, error)

- [ ] **5. Implementar estados**
  - [ ] Loading con Loader2
  - [ ] Empty state con icono
  - [ ] Error states

## 📝 EJEMPLO COMPLETO DE MIGRACIÓN

### ANTES (Players con DashboardWithNotifications):
```tsx
import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { AppleButton } from '@/components/design-system/AppleButton'

export default function PlayersPage() {
  return (
    <DashboardWithNotifications>
      <h1>Jugadores</h1>
      <AppleButton>Nuevo Jugador</AppleButton>
      {/* contenido */}
    </DashboardWithNotifications>
  )
}
```

### DESPUÉS (Players con estándar unificado):
```tsx
import { CleanDashboardLayout } from '@/components/layouts/CleanDashboardLayout'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern } from '@/components/design-system/CardModern'

export default function PlayersPage() {
  return (
    <CleanDashboardLayout
      clubName="Club Pádel México"
      userName="Administrador"
      userRole="Administrador"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Jugadores
        </h1>
        <p className="text-gray-600">
          Administra los clientes y jugadores del club
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          icon={Users}
          label="Total Jugadores"
          value="1,234"
          change="+5%"
          trend="up"
        />
        {/* 3 métricas más */}
      </div>

      {/* Contenido */}
      <CardModern>
        <CardModernHeader>
          <CardModernTitle>Lista de Jugadores</CardModernTitle>
          <ButtonModern>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Jugador
          </ButtonModern>
        </CardModernHeader>
        <CardModernContent>
          {/* Tabla o lista */}
        </CardModernContent>
      </CardModern>
    </CleanDashboardLayout>
  )
}
```

## 🎯 ORDEN DE MIGRACIÓN RECOMENDADO

### Fase 1 (Prioridad Alta - Esta semana)
1. **Bookings** - Cambiar DashboardWithNotifications → CleanDashboardLayout
2. **Players** - Cambiar DashboardWithNotifications → CleanDashboardLayout
3. **Courts** - Eliminar estilos inline, usar componentes Modern

### Fase 2 (Prioridad Media - Próxima semana)
4. **Classes** - Agregar métricas, simplificar
5. **Settings** - Unificar sub-secciones
6. **Finance** - Simplificar, reducir a 4 métricas principales

### Fase 3 (Mantenimiento)
7. **Admin panel** - Aplicar estándar
8. **Notifications** - Unificar con el sistema
9. **Tournaments** - Cuando se implemente

## 🧪 TESTING

### Verificar en cada módulo:
1. **Desktop** (1920x1080): Layout completo visible
2. **Tablet** (768px): 2 columnas en métricas
3. **Mobile** (375px): Todo stack vertical
4. **Loading states**: Spinner visible
5. **Empty states**: Mensaje claro
6. **Acciones**: Botones funcionando

## 📋 SCRIPT DE VALIDACIÓN

```bash
# Buscar componentes deprecados
grep -r "DashboardWithNotifications" app/
grep -r "AppleButton" app/
grep -r "AppleInput" app/
grep -r "AppleModal" app/

# Verificar uso de CleanDashboardLayout
grep -r "CleanDashboardLayout" app/

# Buscar estilos inline
grep -r "style={{" app/
```

## 🚨 ERRORES COMUNES A EVITAR

1. **NO mezclar** ButtonModern con AppleButton
2. **NO usar** más de 4 métricas principales
3. **NO crear** nuevos layouts
4. **NO usar** colores fuera de la paleta
5. **NO olvidar** estados de loading/empty
6. **NO hardcodear** textos (usar constantes)

## 📞 SOPORTE

Si tienes dudas durante la migración:
1. Revisa `/app/ui-standard-demo/page.tsx` para el ejemplo completo
2. Consulta `UI_STANDARD_SYSTEM.md` para detalles
3. Mira `bookings-unified.tsx` para ejemplo específico

---

## ✅ DEFINICIÓN DE "HECHO"

Un módulo está completamente migrado cuando:
- ✅ Usa CleanDashboardLayout
- ✅ Tiene header estándar
- ✅ Muestra 4 métricas
- ✅ Usa solo componentes Modern
- ✅ Es responsive
- ✅ Tiene loading/empty states
- ✅ Sigue la paleta de colores
- ✅ No tiene warnings en consola