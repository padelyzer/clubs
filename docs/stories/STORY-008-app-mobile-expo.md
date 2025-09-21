# STORY-008: App Mobile con Expo

## 🎯 Objetivo
Crear la app mobile nativa con Expo que permite a jugadores de padel encontrar y reservar en TODOS los clubes de México desde una sola app. Esto crea el network effect que hace irresistible el upgrade a Pro.

## 📋 Contexto para Claude Code
La app mobile es donde ocurre la magia del marketplace. Los jugadores ven TODOS los clubes (no solo uno), pueden comparar precios/ubicación, y reservar donde quieran. Esto genera tráfico para todos los clubes y crea dependencia del ecosistema Padelyzer.

## ✅ Criterios de Aceptación
- [ ] App Expo nativa para iOS/Android
- [ ] Vista de todos los clubes activos en mapa/lista
- [ ] Reserva flow completo desde la app
- [ ] Integración con pagos Stripe (cuando esté listo)
- [ ] Historial personal de reservas
- [ ] Búsqueda por ubicación, disponibilidad, precio
- [ ] Notificaciones push para confirmaciones

## 📝 Instrucciones para Claude Code

### PASO 1: Configuración Base de Expo
```bash
# Claude, ejecuta desde la raíz del proyecto:
cd mobile

# Instalar dependencias específicas para la app
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs expo-location expo-notifications @tanstack/react-query zustand react-native-mmkv expo-secure-store expo-image expo-linking

# Dependencias de desarrollo
npm install -D @types/react-native
```

### PASO 2: Configuración de la App
```json
// mobile/app.json
{
  "expo": {
    "name": "Padelyzer",
    "slug": "padelyzer-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.padelyzer.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.padelyzer.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-location",
      "expo-notifications"
    ],
    "extra": {
      "apiUrl": "https://padelyzer.app/api/v1"
    }
  }
}
```

### PASO 3: Layout Principal con Navigation
```tsx
// mobile/App.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Screens
import DiscoverScreen from './src/screens/DiscoverScreen'
import BookingsScreen from './src/screens/BookingsScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import SearchScreen from './src/screens/SearchScreen'

// Store
import { useAuthStore } from './src/stores/authStore'

const Tab = createBottomTabNavigator()
const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

function MainNavigator() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: 'Descubrir',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🎾" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="🔍" color={color} size={size} />
          ),
        }}
      />
      {isAuthenticated && (
        <Tab.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{
            title: 'Mis Reservas',
            tabBarIcon: ({ color, size }) => (
              <TabIcon name="📅" color={color} size={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: isAuthenticated ? 'Perfil' : 'Entrar',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="👤" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return (
    <Text style={{ fontSize: size, color }}>
      {name}
    </Text>
  )
}
```

### PASO 4: Store de Autenticación
```typescript
// mobile/src/stores/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

// Custom MMKV storage adapter for Zustand
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value)
  },
  removeItem: (name: string) => {
    storage.delete(name)
  },
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  level?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  updateProfile: (userData: Partial<User>) => void
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (response.ok) {
            // Store token securely
            await SecureStore.setItemAsync('auth-token', data.token)
            
            set({
              isAuthenticated: true,
              user: data.user,
              token: data.token,
            })

            return { success: true }
          } else {
            return { success: false, error: data.error || 'Error de login' }
          }
        } catch (error) {
          return { success: false, error: 'Error de conexión' }
        }
      },

      register: async (userData: RegisterData) => {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          const data = await response.json()

          if (response.ok) {
            // Store token securely
            await SecureStore.setItemAsync('auth-token', data.token)
            
            set({
              isAuthenticated: true,
              user: data.user,
              token: data.token,
            })

            return { success: true }
          } else {
            return { success: false, error: data.error || 'Error de registro' }
          }
        } catch (error) {
          return { success: false, error: 'Error de conexión' }
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('auth-token')
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        })
      },

      updateProfile: (userData: Partial<User>) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist token in MMKV, use SecureStore instead
      }),
    }
  )
)

// Initialize token from SecureStore on app start
export const initializeAuth = async () => {
  try {
    const token = await SecureStore.getItemAsync('auth-token')
    if (token) {
      useAuthStore.setState({ token })
    }
  } catch (error) {
    console.error('Error initializing auth:', error)
  }
}
```

### PASO 5: Pantalla de Descubrimiento (Home)
```tsx
// mobile/src/screens/DiscoverScreen.tsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import { ClubCard } from '../components/ClubCard'
import { LocationPermission } from '../components/LocationPermission'
import { apiClient } from '../services/apiClient'

export default function DiscoverScreen() {
  const navigation = useNavigation()

  const {
    data: clubs,
    isLoading,
    refetch,
    isRefreshing,
  } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => apiClient.getClubs(),
  })

  const {
    data: nearbyClubs,
  } = useQuery({
    queryKey: ['nearby-clubs'],
    queryFn: () => apiClient.getNearbyClubs(),
    enabled: false, // Enable after location permission
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎾 Padelyzer</Text>
          <Text style={styles.subtitle}>Encuentra tu cancha perfecta</Text>
        </View>

        {/* Location Permission */}
        <LocationPermission />

        {/* Featured Clubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clubes Destacados</Text>
          {isLoading ? (
            <View style={styles.loading}>
              <Text>Cargando clubes...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {clubs?.slice(0, 5).map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })}
                  horizontal
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reserva Rápida</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Search', { filter: 'available-now' })}
            >
              <Text style={styles.quickActionEmoji}>⚡</Text>
              <Text style={styles.quickActionText}>Disponible Ahora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Search', { filter: 'nearby' })}
            >
              <Text style={styles.quickActionEmoji}>📍</Text>
              <Text style={styles.quickActionText}>Cerca de Ti</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Search', { filter: 'best-price' })}
            >
              <Text style={styles.quickActionEmoji}>💰</Text>
              <Text style={styles.quickActionText}>Mejor Precio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All Clubs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todos los Clubes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>

          {clubs?.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })}
            />
          ))}
        </View>

        {/* CTA for Club Owners */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>¿Tienes un club de padel?</Text>
            <Text style={styles.ctaSubtitle}>
              Únete a Padelyzer y digitaliza tu club
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Registrar mi Club</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '500',
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  ctaSection: {
    padding: 20,
    marginTop: 32,
  },
  ctaCard: {
    backgroundColor: '#16a34a',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#bbf7d0',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 14,
  },
})
```

### PASO 6: Componente de Club Card
```tsx
// mobile/src/components/ClubCard.tsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'

const { width } = Dimensions.get('window')

interface Club {
  id: string
  name: string
  address: string
  city: string
  logo?: string
  rating?: number
  courtCount: number
  availableSlots?: number
  minPrice?: number
  distance?: number
}

interface ClubCardProps {
  club: Club
  onPress: () => void
  horizontal?: boolean
}

export function ClubCard({ club, onPress, horizontal = false }: ClubCardProps) {
  const cardStyle = horizontal ? styles.horizontalCard : styles.verticalCard

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      {/* Club Image/Logo */}
      <View style={styles.imageContainer}>
        {club.logo ? (
          <Image source={{ uri: club.logo }} style={styles.clubImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🎾</Text>
          </View>
        )}
        
        {club.availableSlots && club.availableSlots > 0 && (
          <View style={styles.availabilityBadge}>
            <Text style={styles.availabilityText}>
              {club.availableSlots} disponibles
            </Text>
          </View>
        )}
      </View>

      {/* Club Info */}
      <View style={styles.clubInfo}>
        <Text style={styles.clubName} numberOfLines={1}>
          {club.name}
        </Text>
        
        <Text style={styles.clubLocation} numberOfLines={1}>
          📍 {club.city}
        </Text>

        <View style={styles.clubDetails}>
          <Text style={styles.detail}>
            🏟️ {club.courtCount} canchas
          </Text>
          
          {club.minPrice && (
            <Text style={styles.detail}>
              💰 Desde ${club.minPrice}
            </Text>
          )}
          
          {club.distance && (
            <Text style={styles.detail}>
              📏 {club.distance.toFixed(1)} km
            </Text>
          )}
        </View>

        {club.rating && (
          <View style={styles.rating}>
            <Text style={styles.ratingText}>
              ⭐ {club.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  horizontalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  verticalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  clubImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  clubInfo: {
    padding: 12,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  clubLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  clubDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    color: '#374151',
    marginRight: 12,
    marginBottom: 2,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
})
```

### PASO 7: API Client
```typescript
// mobile/src/services/apiClient.ts
import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://padelyzer.app/api/v1'

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth-token')
    } catch {
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Clubs
  async getClubs() {
    return this.request('/clubs')
  }

  async getClub(clubId: string) {
    return this.request(`/clubs/${clubId}`)
  }

  async getNearbyClubs(lat?: number, lng?: number) {
    const params = lat && lng ? `?lat=${lat}&lng=${lng}` : ''
    return this.request(`/clubs/nearby${params}`)
  }

  async getClubAvailability(clubId: string, date: string) {
    return this.request(`/clubs/${clubId}/availability?date=${date}`)
  }

  // Bookings
  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  }

  async getUserBookings() {
    return this.request('/bookings/my')
  }

  async getBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}`)
  }

  async cancelBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    })
  }

  // Search
  async searchClubs(query: string, filters?: any) {
    const params = new URLSearchParams({ q: query, ...filters })
    return this.request(`/clubs/search?${params}`)
  }
}

export const apiClient = new ApiClient()
```

### PASO 8: Pantalla de Búsqueda
```tsx
// mobile/src/screens/SearchScreen.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { ClubCard } from '../components/ClubCard'
import { FilterModal } from '../components/FilterModal'
import { apiClient } from '../services/apiClient'

export default function SearchScreen({ route }: any) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    availableNow: false,
    courtType: 'all',
  })

  const {
    data: searchResults,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['search', searchQuery, filters],
    queryFn: () => apiClient.searchClubs(searchQuery, filters),
    enabled: searchQuery.length > 0,
  })

  const {
    data: allClubs,
  } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => apiClient.getClubs(),
  })

  const clubs = searchQuery.length > 0 ? searchResults : allClubs

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clubes, ubicación..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {Object.values(filters).some(Boolean) && (
        <ScrollView
          horizontal
          style={styles.activeFilters}
          showsHorizontalScrollIndicator={false}
        >
          {filters.city && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>📍 {filters.city}</Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, city: '' })}
              >
                <Text style={styles.removeFilter}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {filters.availableNow && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>⚡ Disponible ahora</Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, availableNow: false })}
              >
                <Text style={styles.removeFilter}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {(filters.minPrice || filters.maxPrice) && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                💰 ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
              >
                <Text style={styles.removeFilter}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Results */}
      <ScrollView style={styles.results}>
        {isLoading ? (
          <View style={styles.loading}>
            <Text>Buscando clubes...</Text>
          </View>
        ) : clubs?.length > 0 ? (
          <>
            <Text style={styles.resultsCount}>
              {clubs.length} club{clubs.length !== 1 ? 'es' : ''} encontrado{clubs.length !== 1 ? 's' : ''}
            </Text>
            {clubs.map((club: any) => (
              <ClubCard
                key={club.id}
                club={club}
                onPress={() => {/* Navigate to club detail */}}
              />
            ))}
          </>
        ) : searchQuery.length > 0 ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsTitle}>Sin resultados</Text>
            <Text style={styles.noResultsText}>
              No encontramos clubes que coincidan con tu búsqueda
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    backgroundColor: '#16a34a',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  activeFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#1e40af',
    marginRight: 6,
  },
  removeFilter: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  results: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})
```

### PASO 9: API Routes para Mobile
```typescript
// app/api/v1/clubs/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    const clubs = await prisma.club.findMany({
      where: {
        status: 'APPROVED',
        active: true,
      },
      include: {
        courts: {
          where: { active: true },
          select: { id: true }
        },
        _count: {
          select: {
            bookings: {
              where: {
                date: {
                  gte: new Date(),
                  lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                },
                status: { not: 'CANCELLED' }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const clubsWithInfo = clubs.map(club => ({
      id: club.id,
      slug: club.slug,
      name: club.name,
      address: club.address,
      city: club.city,
      logo: club.logo,
      courtCount: club.courts.length,
      // TODO: Calculate available slots for next 24 hours
      availableSlots: Math.max(0, club.courts.length * 10 - club._count.bookings),
      // TODO: Calculate min price from pricing rules
      minPrice: 400,
      // TODO: Calculate distance if lat/lng provided
      distance: lat && lng ? Math.random() * 20 : undefined,
      rating: 4.5 + Math.random() * 0.5, // Mock rating for now
    }))

    return NextResponse.json(clubsWithInfo)
  } catch (error) {
    console.error('Get clubs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/api/v1/clubs/search/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const availableNow = searchParams.get('availableNow') === 'true'

    const whereClause: any = {
      status: 'APPROVED',
      active: true,
    }

    // Text search
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ]
    }

    // City filter
    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' }
    }

    const clubs = await prisma.club.findMany({
      where: whereClause,
      include: {
        courts: {
          where: { active: true },
          select: { id: true }
        },
      },
      orderBy: { name: 'asc' }
    })

    // Transform results
    const results = clubs.map(club => ({
      id: club.id,
      slug: club.slug,
      name: club.name,
      address: club.address,
      city: club.city,
      logo: club.logo,
      courtCount: club.courts.length,
      availableSlots: Math.floor(Math.random() * 10), // Mock for now
      minPrice: 400 + Math.floor(Math.random() * 200),
      rating: 4.0 + Math.random() * 1.0,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search clubs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/api/v1/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, phone, password } = parsed.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      }
    })

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: 'PLAYER'
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

## 🔍 Verificación
```bash
# Claude, verificar la app mobile:
cd mobile
npm start

# Flow de prueba:
# 1. Abrir Expo Go app
# 2. Escanear QR code
# 3. Probar navegación entre pantallas
# 4. Probar búsqueda de clubes
# 5. Verificar que APIs responden correctamente
```

## ⚠️ NO HACER
- NO implementar geolocalización real aún
- NO agregar notificaciones push complejas
- NO crear sistema de reviews/ratings
- NO implementar chat entre jugadores

## Definition of Done
- [ ] App Expo funcional en iOS/Android
- [ ] Navegación tab funcional
- [ ] Lista de todos los clubes desde API
- [ ] Búsqueda con filtros básicos
- [ ] Registro/login de jugadores
- [ ] Arquitectura lista para reservas y pagos
- [ ] Store de estado con persistencia MMKV
- [ ] API endpoints funcionales para mobile