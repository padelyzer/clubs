# 🎾 Product Requirements Document
## Padelyzer - La Plataforma Inteligente del Padel Mexicano

### 📋 Executive Summary
Padelyzer es LA plataforma de gestión inteligente de clubes de padel en México, ofreciendo reservas 100% gratuitas forever y monetizando mediante módulos premium de competición y finanzas. Resuelve el problema crítico de los clubes que pierden 45% de revenue potencial usando Excel.

### 🎯 Problema a Resolver
Los 30 clubes de padel en Puebla (y 500+ en México) operan con Excel, causando:
- **45% revenue leakage** (no-shows, impagos, sin lista espera)
- **Dobles reservas** frecuentes
- **Cero inteligencia de negocio** 
- **Pagos divididos caóticos** con "papelitos"
- **1 FTE dedicado** a actualizar Excel

### 🏆 Solución: Padelyzer

#### Propuesta de Valor Única
> "Reservas gratis forever. Sin letras chiquitas. 
> Widget para tu website. Pagos divididos automáticos.
> Si quieres torneos, $2,000/mes."

#### Arquitectura de Producto
```
┌─────────────────────────────────────┐
│         Padelyzer Platform          │
├─────────────────────────────────────┤
│   📱 App Multi-Club (Expo)          │
│   - Todos los clubes de México      │
│   - Reservar, pagar, historial      │
├─────────────────────────────────────┤
│   💻 Dashboard Club (Next.js)       │
│   - Gestión reservas                │
│   - Check-in/cobros                 │
│   - Analytics                       │
├─────────────────────────────────────┤
│   🔧 Widget Embebible               │
│   - iframe para websites            │
│   - Branded del club                │
└─────────────────────────────────────┘
```

### 👥 Usuarios Target

#### 1. Dueño de Club (Decision Maker)
- **Pain**: Pierde 45% revenue potencial
- **Need**: Visibilidad y control
- **Solution**: Dashboard con analytics + cero costo inicial

#### 2. Recepcionista (Daily User)
- **Pain**: Excel + papelitos + WhatsApp caos
- **Need**: Sistema simple y confiable
- **Solution**: Dashboard check-in + status pagos tiempo real

#### 3. Jugador Frecuente (Power User)
- **Pain**: Llamar para reservar, no saber disponibilidad
- **Need**: Reservar rápido desde el celular
- **Solution**: App con todos los clubes + pagos divididos

#### 4. Jugador Casual (Occasional User)
- **Pain**: No quiere descargar otra app
- **Need**: Reservar rápido y ya
- **Solution**: Widget web sin registro

### 📱 MVP Padelyzer - Módulo Reservas (4 semanas)

#### Features Core

##### 1. Multi-tenant Platform
- [ ] Registro de clubes con onboarding wizard
- [ ] Configuración canchas (4-20 customizable)
- [ ] Matriz precios (día/hora)
- [ ] Horarios operación
- [ ] Logo y branding

##### 2. Sistema de Reservas
- [ ] Vista día (timeline)
- [ ] Vista semana (grid)  
- [ ] Vista mes (calendario)
- [ ] Estados: Disponible|Reservado|En juego|Bloqueado
- [ ] Reserva con/sin registro

##### 3. Pagos Divididos REVOLUCIONARIO
- [ ] Stripe Connect (cada club su cuenta)
- [ ] Opción "Dividir entre 4"
- [ ] Link único por jugador
- [ ] Status: 0/4, 1/4, 2/4, 3/4, 4/4 pagado
- [ ] Cancha bloqueada al reservar

##### 4. Widget Embebible
- [ ] Generador de código iframe
- [ ] Personalización colores
- [ ] Responsive design
- [ ] Funciona sin cuenta

##### 5. WhatsApp Notifications
- [ ] Confirmación reserva (4 jugadores)
- [ ] Recordatorio 2hrs antes
- [ ] Links pago pendiente
- [ ] Cancelaciones

##### 6. Dashboard Recepción
- [ ] Lista reservas del día
- [ ] Check-in button
- [ ] Status pagos por jugador
- [ ] Marcar no-shows
- [ ] Cobrar en efectivo/terminal

##### 7. App Mobile (Expo)
- [ ] Ver todos los clubes
- [ ] Buscar por ubicación
- [ ] Reservar
- [ ] Historial personal
- [ ] Perfil y preferencias

#### Tech Stack Actualizado
```json
{
  "web": {
    "next": "15.0.3",
    "react": "19.0.0",
    "prisma": "6.0.1",
    "postgresql": "16.1",
    "stripe": "17.4.0",
    "tailwindcss": "3.4.17"
  },
  "mobile": {
    "expo": "~52.0.0",
    "react-native": "0.76.5",
    "expo-router": "~4.0.0",
    "nativewind": "^4.1.0"
  },
  "infra": {
    "hosting": "Vercel",
    "database": "Supabase",
    "whatsapp": "Twilio",
    "payments": "Stripe Connect"
  }
}
```

### 💰 Modelo de Negocio

#### Freemium Trustkey Strategy
| Producto | Función | Objetivo |
|----------|---------|----------|
| **Padelyzer.app** | **Trustkey gratuito** | Demostrar que funciona, crear confianza |
| **Pro.padelyzer.com** | **Solución completa** | Upgrade natural cuando validan el ROI |

#### Padelyzer.app - Trustkey Features
| Módulo | Precio | Purpose |
|--------|--------|---------|
| **Reservas** | $0 FOREVER | Hook: Eliminar Excel, probar sin riesgo |
| **Competición** | $1,999/mes | Bridge: Generar ingresos, ver potencial |
| **Path to Pro** | Upgrade automático | Natural: Cuando necesiten IA/garantías |

#### Unit Economics (Puebla)
```
Revenue (mes 3):
30 clubes × 50% conversión × $2,000 = $30,000 MXN

Costos:
- Infra: $4,000
- WhatsApp: $2,000  
- Soporte: $10,000
Total: $16,000 MXN

Profit: $14,000 MXN/mes
CAC: ~$500 (casi $0, conocemos a todos)
LTV: $24,000 (12 meses)
LTV/CAC: 48x 🚀
```

### 🚀 Go-to-Market Strategy

#### Phase 1: Puebla Domination (Mes 1-3)
```
Semana 1-2: MVP + Club Demo
Semana 3-4: 5 early adopters
Semana 5-8: 25 clubes restantes
Semana 9-12: Optimización + feedback
```

#### Phase 2: Expansión (Mes 4-12)
```
Mes 4-6: Product improvements
Mes 7-9: CDMX (300 clubes)
Mes 10-12: GDL + MTY (200 clubes)
```

### 📊 Success Metrics

#### North Star Metric
**Reservas activas mensuales** (target: 1,000+ mes 3)

#### Supporting Metrics
- Clubes activos: 30/30 Puebla
- Usuarios únicos: 500+
- Conversión a pago: 33%+
- Revenue: $20,000+/mes
- NPS: >50

### 🛡️ Competitive Moat

1. **Precio**: Gratis vs €250 Playtomic
2. **Network Effects**: LA app donde están TODOS
3. **Switching Cost**: Histórico + usuarios acostumbrados
4. **Local**: Soporte en español, precios en MXN
5. **Features Únicos**: Pagos divididos nativos

### ⚠️ Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Playtomic baja precios | Baja | Alto | Freemium es imbatible |
| Adopción lenta | Media | Medio | Conocemos a todos los dueños |
| Problemas técnicos | Media | Alto | MVP simple, tech probado |
| Competidor local | Baja | Medio | First mover + network effects |

### 🎯 Definition of Done - MVP

- [ ] 30 clubes onboarded
- [ ] 1,000+ reservas/mes
- [ ] 500+ usuarios únicos
- [ ] Widget funcionando en 10+ websites
- [ ] Pagos divididos procesando
- [ ] WhatsApp enviando
- [ ] NPS >50
- [ ] 10 clubes pagando módulo competición

### 🗓️ Timeline

```
Dic 2024: Product Discovery ✅
Ene 2025: Development Sprint 1-2
Feb 2025: Beta con 5 clubes
Mar 2025: Launch 30 clubes
Abr 2025: Optimización
May 2025: Inicio expansión CDMX
```

---

*"De Excel con papelitos a la digitalización del padel mexicano"*