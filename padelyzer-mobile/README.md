# Padelyzer Mobile App

Aplicación móvil nativa para iOS y Android de Padelyzer, desarrollada con Expo y React Native.

## 🏆 Características Principales

- **Autenticación completa**: Login, registro y recuperación de contraseña
- **Búsqueda de clubes**: Encuentra clubes por ubicación, nombre o filtros
- **Reservas fáciles**: Sistema completo de reservas con calendario
- **Geolocalización**: Clubes cercanos basados en tu ubicación
- **Notificaciones push**: Recordatorios de reservas y actualizaciones
- **Pagos seguros**: Integración con Stripe para pagos
- **Pago dividido**: Comparte el costo de la reserva con amigos
- **Integración calendario**: Agrega reservas a tu calendario
- **Modo offline**: Funcionalidad básica sin conexión

## 🚀 Stack Tecnológico

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo y build
- **TypeScript**: Tipado estático
- **Expo Router**: Navegación basada en archivos
- **Axios**: Cliente HTTP para APIs
- **AsyncStorage**: Persistencia local
- **Expo Location**: Servicios de geolocalización
- **Expo Notifications**: Notificaciones push
- **Expo Calendar**: Integración con calendario

## 📱 Estructura del Proyecto

```
padelyzer-mobile/
├── app/                    # Pantallas principales (Expo Router)
│   ├── (tabs)/            # Navegación por tabs
│   │   ├── index.tsx      # Home
│   │   ├── search.tsx     # Búsqueda
│   │   ├── bookings.tsx   # Mis reservas
│   │   └── profile.tsx    # Perfil
│   ├── auth/              # Autenticación
│   │   ├── login.tsx      # Login
│   │   └── register.tsx   # Registro
│   ├── club/              # Detalles de club
│   │   └── [id].tsx       # Club específico
│   ├── booking/           # Sistema de reservas
│   ├── _layout.tsx        # Layout principal
│   └── index.tsx          # Splash screen
├── components/            # Componentes reutilizables
│   ├── ClubCard.tsx       # Tarjeta de club
│   ├── BookingCard.tsx    # Tarjeta de reserva
│   ├── LoadingSpinner.tsx # Indicador de carga
│   ├── Button.tsx         # Botón personalizado
│   └── ErrorBoundary.tsx  # Manejo de errores
├── services/              # Servicios y APIs
│   ├── api.ts             # Cliente API principal
│   ├── AuthContext.tsx    # Contexto de autenticación
│   ├── LocationService.ts # Servicios de ubicación
│   ├── NotificationService.ts # Notificaciones
│   └── CalendarService.ts # Integración calendario
├── hooks/                 # Hooks personalizados
│   ├── useLocation.ts     # Hook de ubicación
│   └── useNotifications.ts # Hook de notificaciones
├── constants/             # Constantes y configuración
│   └── Colors.ts          # Sistema de colores
├── types/                 # Definiciones TypeScript
│   └── index.ts           # Tipos principales
├── utils/                 # Utilidades
│   └── index.ts           # Funciones helper
└── assets/                # Recursos estáticos
    ├── fonts/             # Fuentes
    └── images/            # Imágenes
```

## 🛠️ Configuración del Desarrollo

### Prerrequisitos

- Node.js 18+ y npm
- Expo CLI: `npm install -g @expo/cli`
- Para iOS: Xcode (macOS)
- Para Android: Android Studio

### Instalación

1. **Clonar e instalar dependencias**:
```bash
cd padelyzer-mobile
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Agregar fuentes e imágenes**:
   - Descargar fuentes Inter de Google Fonts → `assets/fonts/`
   - Copiar logos de Padelyzer → `assets/images/`

4. **Iniciar desarrollo**:
```bash
npm start
```

### Variables de Entorno

```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_TIMEOUT=10000
EXPO_PUBLIC_APP_NAME=Padelyzer
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_LOCATION_SERVICES=true
```

## 📱 Ejecutar la App

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en web
npm run web
```

### Builds de Producción
```bash
# Build para Android
npm run build:android

# Build para iOS
npm run build:ios

# Build para ambas plataformas
npm run build:all
```

## 🔧 Configuración de Build

### EAS Build (Recomendado)

1. **Instalar EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Configurar proyecto**:
```bash
eas build:configure
```

3. **Ejecutar build**:
```bash
eas build --platform android
eas build --platform ios
```

### Permisos Necesarios

#### iOS (Info.plist)
- `NSLocationWhenInUseUsageDescription`
- `NSCalendarsUsageDescription`
- `NSRemindersUsageDescription`

#### Android (AndroidManifest.xml)
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `WRITE_CALENDAR`
- `READ_CALENDAR`

## 🎨 Sistema de Diseño

### Colores
```typescript
Colors.primary.main    // #1a4d3e (Verde Padelyzer)
Colors.secondary.main  // #4caf50
Colors.accent.main     // #ff6b35
Colors.text.primary    // #1a1a1a
Colors.background.primary // #ffffff
```

### Espaciado
```typescript
Spacing.xs   // 4px
Spacing.sm   // 8px
Spacing.md   // 16px
Spacing.lg   // 24px
Spacing.xl   // 32px
```

### Tipografía
- **Fuente**: Inter (Regular, Medium, Bold)
- **Tamaños**: 10px - 32px

## 🔌 Integración con Backend

La app se conecta al backend Next.js mediante APIs REST:

```typescript
// Endpoints principales
GET  /api/public/clubs           # Listar clubes
GET  /api/public/clubs/:id       # Detalles de club
POST /api/bookings               # Crear reserva
GET  /api/bookings               # Mis reservas
POST /api/auth/login             # Autenticación
```

### Autenticación
- JWT tokens con refresh automático
- Persistencia en AsyncStorage
- Interceptores de Axios para manejo automático

## 📱 Funcionalidades Móviles

### Geolocalización
```typescript
import LocationService from '../services/LocationService';

// Obtener ubicación actual
const location = await LocationService.getCurrentLocation();

// Monitorear cambios de ubicación
await LocationService.watchLocation((newLocation) => {
  console.log('Nueva ubicación:', newLocation);
});
```

### Notificaciones Push
```typescript
import NotificationService from '../services/NotificationService';

// Programar recordatorio de reserva
await NotificationService.scheduleBookingReminder(
  bookingId,
  clubName,
  date,
  time
);
```

### Integración Calendario
```typescript
import CalendarService from '../services/CalendarService';

// Agregar reserva al calendario
const eventId = await CalendarService.addBookingToCalendar(booking);
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Con Detox
npm run test:e2e
```

### Testing Manual

1. **Autenticación**:
   - [ ] Login/logout funcional
   - [ ] Registro de nuevo usuario
   - [ ] Recuperación de contraseña

2. **Navegación**:
   - [ ] Tabs funcionan correctamente
   - [ ] Navegación entre pantallas
   - [ ] Botón de back funciona

3. **Funcionalidades**:
   - [ ] Búsqueda de clubes
   - [ ] Geolocalización
   - [ ] Creación de reservas
   - [ ] Notificaciones

## 🚀 Deployment

### App Store (iOS)
```bash
eas build --platform ios
eas submit --platform ios
```

### Google Play Store (Android)
```bash
eas build --platform android
eas submit --platform android
```

### Over-the-Air Updates
```bash
expo publish
```

## 🔧 Configuración Avanzada

### Deep Linking
```typescript
// app.json
{
  \"scheme\": \"padelyzer\",
  \"intentFilters\": [
    {
      \"action\": \"VIEW\",
      \"data\": { \"scheme\": \"padelyzer\" }
    }
  ]
}
```

### Push Notifications Setup
1. Configurar Firebase (Android)
2. Configurar APNs (iOS)
3. Configurar Expo push service

### Maps Integration
```bash
# Agregar Google Maps API key
EXPO_PUBLIC_MAPS_API_KEY=your_api_key_here
```

## 📊 Performance

### Optimizaciones
- Lazy loading de pantallas
- Memoización de componentes
- Imágenes optimizadas
- Cache de APIs con React Query

### Monitoreo
- Crashlytics para crashes
- Analytics para uso
- Performance monitoring

## 🔒 Seguridad

- Validación de inputs
- Sanitización de datos
- HTTPS obligatorio
- Tokens JWT seguros
- Validación de permisos

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch
3. Commit de cambios
4. Push al branch
5. Crear Pull Request

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier
- Commits descriptivos
- Tests para nuevas features

## 📚 Recursos Adicionales

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Guide](https://expo.github.io/router/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)

## 🐛 Resolución de Problemas

### Problemas Comunes

1. **Error de build**:
```bash
expo doctor
expo install --fix
```

2. **Problemas de cache**:
```bash
expo start --clear
```

3. **Problemas de dependencias**:
```bash
rm -rf node_modules package-lock.json
npm install
```

4. **Problemas de Metro**:
```bash
npx expo start --clear
```

## 📝 Changelog

### v1.0.0 (Inicial)
- ✅ Autenticación completa
- ✅ Búsqueda y listado de clubes
- ✅ Sistema de reservas
- ✅ Notificaciones push
- ✅ Geolocalización
- ✅ Integración calendario
- ✅ Diseño responsive

---

**Desarrollado con ❤️ para la comunidad de padel**