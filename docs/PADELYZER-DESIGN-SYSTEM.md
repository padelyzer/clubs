# 🎾 Padelyzer Design System
## La Identidad Visual del Padel Mexicano

### 🎯 Principios de Diseño

#### 1. **Confianza Mexicana**
- Colores cálidos que evocan México
- Comunicación directa y sin complicaciones  
- Emojis para hacer la experiencia más humana

#### 2. **Simplicidad Operativa**
- Interfaces que cualquier recepcionista pueda usar
- Información crítica siempre visible
- Flujos de 3 clicks máximo

#### 3. **Diferenciación Premium**
- Sutil elegancia que compita con Playtomic
- Detalles que muestren calidad profesional
- Upgrade path visible pero no agresivo

---

## 🎨 Paleta de Colores
*Inspirada en Cardano Foundation con identidad mexicana*

### Colores Primarios
```css
/* Verde Padel - Sofisticado y natural */
--green-50: #f0fdf9     /* Más suave */
--green-100: #e6fffa
--green-400: #34d399    /* Verde vibrante */
--green-500: #10b981    /* Verde principal */
--green-600: #059669    /* Verde hover */
--green-700: #047857    /* Verde dark */
--green-800: #065f46    /* Verde profundo */
--green-900: #064e3b    /* Verde texto */

/* Azul Profundo - Confianza y tecnología */
--blue-50: #f0f9ff
--blue-100: #e0f2fe
--blue-400: #38bdf8
--blue-500: #0ea5e9     /* Azul principal */
--blue-600: #0284c7     /* Azul hover */
--blue-700: #0369a1     /* Azul dark */
--blue-800: #075985     /* Azul profundo */
--blue-900: #0c4a6e     /* Azul texto */

/* Índigo Premium - Sofisticación */
--indigo-50: #eef2ff
--indigo-100: #e0e7ff
--indigo-500: #6366f1    /* Índigo principal */
--indigo-600: #4f46e5    /* Índigo hover */
--indigo-700: #4338ca    /* Índigo dark */

/* Naranja Energía - Accent mexicano */
--orange-50: #fff7ed
--orange-100: #ffedd5
--orange-400: #fb923c
--orange-500: #f97316    /* Naranja accent */
--orange-600: #ea580c    /* Naranja hover */
```

### Gradientes Profesionales
```css
/* Gradiente Principal - Verde a Azul */
--gradient-primary: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);

/* Gradiente Premium - Índigo a Azul */
--gradient-premium: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);

/* Gradiente Energía - Verde a Naranja */
--gradient-energy: linear-gradient(135deg, #10b981 0%, #f97316 100%);

/* Gradiente Sutil - Para backgrounds */
--gradient-subtle: linear-gradient(135deg, #f0fdf9 0%, #f0f9ff 100%);
```

### Colores de Estado
```css
/* Success */
--success-bg: #f0fdf4
--success-border: #bbf7d0
--success-text: #166534

/* Warning */
--warning-bg: #fffbeb
--warning-border: #fed7aa
--warning-text: #92400e

/* Error */
--error-bg: #fef2f2
--error-border: #fecaca
--error-text: #991b1b

/* Info */
--info-bg: #eff6ff
--info-border: #bfdbfe
--info-text: #1e40af
```

### Grises Neutros
```css
--gray-50: #f9fafb      /* Backgrounds */
--gray-100: #f3f4f6     /* Cards */
--gray-200: #e5e7eb     /* Borders */
--gray-300: #d1d5db     /* Disabled */
--gray-500: #6b7280     /* Text secondary */
--gray-700: #374151     /* Text primary */
--gray-900: #111827     /* Headers */
```

---

## 📝 Tipografía
*Sistema tipográfico profesional inspirado en Cardano*

### Font Stack
```css
/* Primary: Inter Variable - Perfección tipográfica */
--font-primary: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display: Para títulos grandes */
--font-display: 'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace: Para códigos y números */
--font-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace;
```

### Escala Tipográfica Refinada
```css
/* Display - Para héroes y títulos grandes */
--text-6xl: 3.75rem;    /* Hero principals */
--text-5xl: 3rem;       /* Hero secondaries */
--text-4xl: 2.25rem;    /* Page titles */

/* Headers - Jerarquía clara */
--text-3xl: 1.875rem;   /* Section titles */
--text-2xl: 1.5rem;     /* Card titles */
--text-xl: 1.25rem;     /* Subtitles */
--text-lg: 1.125rem;    /* Lead text */

/* Body - Optimizado para lectura */
--text-base: 1rem;      /* Body text - 16px */
--text-sm: 0.875rem;    /* Small text - 14px */
--text-xs: 0.75rem;     /* Labels - 12px */

/* Weights - Más sutiles */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;     /* Para destacar */
--font-semibold: 600;   /* Para títulos */
--font-bold: 700;       /* Para énfasis */
--font-extrabold: 800;  /* Para displays */

/* Line Heights - Respiración visual */
--leading-tight: 1.25;   /* Títulos */
--leading-snug: 1.375;   /* Subtítulos */
--leading-normal: 1.5;   /* Body */
--leading-relaxed: 1.625; /* Lead text */

/* Letter Spacing - Refinamiento */
--tracking-tight: -0.025em;  /* Títulos grandes */
--tracking-normal: 0em;      /* Normal */
--tracking-wide: 0.025em;    /* Labels */
```

---

## 🧩 Componentes Base
*Elegancia y funcionalidad inspirada en Cardano*

### 1. Buttons Avanzados
```css
/* Primary Button - Gradiente sofisticado */
.btn-primary {
  @apply bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold 
         hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 
         transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl
         transform hover:-translate-y-0.5;
}

/* Secondary Button - Outline elegante */
.btn-secondary {
  @apply border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold 
         hover:border-green-500 hover:text-green-600 hover:bg-green-50 
         focus:ring-4 focus:ring-green-200 transition-all duration-300
         backdrop-blur-sm;
}

/* Gradient Button - Premium */
.btn-gradient {
  @apply bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold 
         hover:from-indigo-600 hover:to-blue-600 focus:ring-4 focus:ring-indigo-200 
         transition-all duration-300 shadow-lg hover:shadow-xl
         transform hover:-translate-y-0.5;
}

/* Ghost Button - Minimalista */
.btn-ghost {
  @apply text-gray-600 px-6 py-3 rounded-xl font-semibold 
         hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-200 
         transition-all duration-300;
}

/* Destructive Button */
.btn-destructive {
  @apply bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold 
         hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-200 
         transition-all duration-300 shadow-lg hover:shadow-xl;
}

/* Button Sizes - Más opciones */
.btn-xs { @apply px-3 py-1.5 text-xs rounded-lg; }
.btn-sm { @apply px-4 py-2 text-sm rounded-lg; }
.btn-md { @apply px-6 py-3 text-base rounded-xl; }
.btn-lg { @apply px-8 py-4 text-lg rounded-xl; }
.btn-xl { @apply px-10 py-5 text-xl rounded-2xl; }

/* Button States */
.btn-loading {
  @apply opacity-70 cursor-not-allowed pointer-events-none;
}
```

### 2. Cards Sofisticadas
```css
/* Card Base - Más elegante */
.card {
  @apply bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8
         hover:shadow-xl hover:border-gray-200 transition-all duration-300;
}

/* Card Elevated - Con más presencia */
.card-elevated {
  @apply bg-white rounded-3xl shadow-2xl border border-gray-100 p-8
         hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1;
}

/* Card Gradient - Premium */
.card-gradient {
  @apply bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8
         hover:shadow-xl transition-all duration-300;
}

/* Card Glass - Efecto glassmorphism */
.card-glass {
  @apply bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 p-8
         shadow-lg hover:shadow-xl transition-all duration-300;
}
```

### 3. Inputs Refinados
```css
/* Input Base - Más espacioso */
.input {
  @apply w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base
         focus:ring-4 focus:ring-green-200 focus:border-green-500 
         disabled:bg-gray-50 disabled:cursor-not-allowed
         transition-all duration-300 placeholder:text-gray-400;
}

/* Input Floating Label */
.input-floating {
  @apply w-full border-2 border-gray-200 rounded-xl px-4 pt-6 pb-2 text-base
         focus:ring-4 focus:ring-green-200 focus:border-green-500 
         transition-all duration-300 peer;
}

.input-floating-label {
  @apply absolute left-4 top-4 text-gray-500 text-sm transition-all duration-300
         peer-focus:top-2 peer-focus:text-xs peer-focus:text-green-600
         peer-valid:top-2 peer-valid:text-xs;
}

/* Input con íconos */
.input-with-icon {
  @apply pl-12;
}

.input-icon {
  @apply absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg;
}
```

### 2. Form Elements
```css
/* Input Field */
.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 
         focus:ring-green-500 focus:border-green-500 
         disabled:bg-gray-100 disabled:cursor-not-allowed;
}

/* Select */
.select {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 
         focus:ring-green-500 focus:border-green-500 
         bg-white cursor-pointer;
}

/* Checkbox */
.checkbox {
  @apply h-4 w-4 text-green-600 border-gray-300 rounded 
         focus:ring-green-500;
}

/* Label */
.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

/* Field Error */
.field-error {
  @apply text-red-600 text-sm mt-1;
}
```

### 3. Cards y Containers
```css
/* Card Base */
.card {
  @apply bg-white rounded-lg shadow border border-gray-200 p-6;
}

/* Card Header */
.card-header {
  @apply border-b border-gray-200 pb-4 mb-4;
}

/* Card Title */
.card-title {
  @apply text-xl font-semibold text-gray-900;
}

/* Alert */
.alert {
  @apply rounded-lg p-4 border;
}

.alert-success {
  @apply bg-green-50 border-green-200 text-green-800;
}

.alert-warning {
  @apply bg-yellow-50 border-yellow-200 text-yellow-800;
}

.alert-error {
  @apply bg-red-50 border-red-200 text-red-800;
}
```

---

## 🏃‍♂️ Patrones de UX

### 1. Navegación
- **Breadcrumbs** siempre visibles en dashboards
- **Sidebar** colapsable en mobile
- **Tabs** para secciones relacionadas
- **Back buttons** en flows multi-step

### 2. Feedback del Usuario
- **Loading states** con spinners + texto descriptivo
- **Success messages** con auto-dismiss en 5s
- **Error messages** persistentes hasta resolverse
- **Confirmations** para acciones destructivas

### 3. Data Display
- **Tables** con sorting y filtering
- **Status badges** con colores semánticos
- **Progress indicators** para onboarding
- **Empty states** con CTAs claros

### 4. Mobile-First
- **Touch targets** mínimo 44px
- **Sticky headers** en listas largas
- **Swipe actions** para acciones rápidas
- **Bottom navigation** en mobile

---

## 🎭 Iconografía

### Sistema de Iconos
```typescript
// Usar emojis para mejor compatibilidad cross-platform
const icons = {
  // Core Business
  padel: '🎾',
  club: '🏟️',
  calendar: '📅',
  clock: '🕐',
  money: '💰',
  
  // Actions
  add: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  send: '📤',
  
  // Status
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  pending: '⏳',
  
  // Navigation
  home: '🏠',
  dashboard: '📊',
  settings: '⚙️',
  help: '❓',
  logout: '🚪',
  
  // Communication
  phone: '📞',
  email: '✉️',
  whatsapp: '💬',
  notification: '🔔',
  
  // Features
  widget: '🔧',
  mobile: '📱',
  payment: '💳',
  split: '🤝',
  upgrade: '⬆️',
}
```

---

## 📱 Responsive Breakpoints

```css
/* Breakpoints */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */

/* Usage */
@media (min-width: 768px) {
  .responsive-grid {
    @apply grid-cols-2;
  }
}
```

---

## 🎪 Efectos Visuales Avanzados
*Inspirados en la sofisticación de Cardano*

### 1. Glassmorphism
```css
/* Glass Effect - Para modales y overlays */
.glass {
  @apply bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl
         shadow-xl;
}

/* Glass Dark */
.glass-dark {
  @apply bg-gray-900/20 backdrop-blur-lg border border-gray-700/30 rounded-2xl
         shadow-xl;
}
```

### 2. Gradients Sofisticados
```css
/* Hero Gradients */
.hero-gradient {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(14, 165, 233, 0.1) 50%, 
    rgba(99, 102, 241, 0.1) 100%);
}

/* Card Gradients */
.card-gradient-subtle {
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(249, 250, 251, 0.9) 100%);
}

/* Border Gradients */
.border-gradient {
  background: linear-gradient(135deg, #10b981, #0ea5e9, #6366f1);
  padding: 2px;
  border-radius: 1rem;
}

.border-gradient-inner {
  @apply bg-white rounded-xl h-full w-full;
}
```

### 3. Animaciones Fluidas
```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

/* Slide In Right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.5s ease-out;
}
```

### 4. Layout Avanzado
```css
/* Container Fluido */
.container-fluid {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Grid Adaptativo */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Section Spacing */
.section {
  @apply py-16 md:py-24 lg:py-32;
}

.section-sm {
  @apply py-8 md:py-12;
}

/* Hero Layout */
.hero-layout {
  @apply min-h-screen flex items-center justify-center relative overflow-hidden;
}

/* Sticky Header */
.header-sticky {
  @apply sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200;
}
```

---

## 🌟 Componentes Específicos de Padelyzer
*Con elegancia Cardano y funcionalidad mexicana*

### 1. Club Status Badge
```css
.club-status {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.club-status.pending {
  @apply bg-yellow-100 text-yellow-800;
}

.club-status.approved {
  @apply bg-green-100 text-green-800;
}

.club-status.rejected {
  @apply bg-red-100 text-red-800;
}
```

### 2. Booking Status
```css
.booking-status.confirmed {
  @apply bg-green-100 text-green-800 border-green-200;
}

.booking-status.pending {
  @apply bg-yellow-100 text-yellow-800 border-yellow-200;
}

.booking-status.cancelled {
  @apply bg-gray-100 text-gray-800 border-gray-200;
}
```

### 3. Payment Progress
```css
.payment-progress {
  @apply flex items-center space-x-2;
}

.payment-step {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold;
}

.payment-step.completed {
  @apply bg-green-100 text-green-800;
}

.payment-step.pending {
  @apply bg-gray-100 text-gray-600;
}
```

### 4. Upgrade CTA
```css
.upgrade-cta {
  @apply bg-gradient-to-r from-purple-600 to-blue-600 text-white 
         rounded-lg p-4 hover:opacity-90 transition-opacity;
}
```

---

## 🚀 Implementación

### 1. CSS Variables en globals.css
```css
:root {
  /* Agregar todas las variables definidas arriba */
}
```

### 2. Componentes Reutilizables
- Crear `/components/ui/` con componentes base
- Usar TypeScript para props tipadas
- Documentar con Storybook (futuro)

### 3. Utilidades Tailwind
- Extender `tailwind.config.js` con colores custom
- Crear plugins para componentes complejos

---

## ✅ Checklist de Implementación

- [ ] Implementar CSS variables en globals.css
- [ ] Crear componentes base en /components/ui/
- [ ] Actualizar páginas existentes con design system
- [ ] Crear guía de uso para el equipo
- [ ] Setup de Storybook (futuro)

---

*"Del Excel sin estilo a la experiencia premium del padel mexicano"* 🎾🇲🇽