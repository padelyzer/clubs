import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/Colors';
import { useAuth } from '../../services/AuthContext';
import { Club, Location as LocationType } from '../../types';
import ApiService from '../../services/api';
import ClubCard from '../../components/ClubCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [nearbyClubs, setNearbyClubs] = useState<Club[]>([]);
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);

  useEffect(() => {
    loadData();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de ubicación',
          'Para mostrar clubes cercanos, necesitamos acceso a tu ubicación.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load featured clubs
      const featuredResponse = await ApiService.get<Club[]>('/api/public/clubs', {
        featured: true,
        limit: 5,
      });
      
      if (featuredResponse.success && featuredResponse.data) {
        setFeaturedClubs(featuredResponse.data);
      }

      // Load nearby clubs if location is available
      if (userLocation) {
        const nearbyResponse = await ApiService.get<Club[]>('/api/public/clubs', {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10, // 10km radius
          limit: 8,
        });
        
        if (nearbyResponse.success && nearbyResponse.data) {
          setNearbyClubs(nearbyResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los clubes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const navigateToClub = (clubId: string) => {
    router.push(`/club/${clubId}`);
  };

  const navigateToSearch = () => {
    router.push('/(tabs)/search');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.name || 'Jugador'}</Text>
            <Text style={styles.subtitle}>¿Listo para jugar?</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={navigateToSearch}>
            <Ionicons name="search" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={navigateToSearch}>
            <Ionicons name="location" size={20} color={Colors.primary.main} />
            <Text style={styles.quickActionText}>Cerca de mí</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/bookings')}>
            <Ionicons name="calendar" size={20} color={Colors.primary.main} />
            <Text style={styles.quickActionText}>Mis reservas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={navigateToSearch}>
            <Ionicons name="star" size={20} color={Colors.primary.main} />
            <Text style={styles.quickActionText}>Mejor valorados</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Clubs */}
        {nearbyClubs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cerca de ti</Text>
              <TouchableOpacity onPress={navigateToSearch}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {nearbyClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onPress={() => navigateToClub(club.id)}
                  style={styles.clubCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Clubs */}
        {featuredClubs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Destacados</Text>
              <TouchableOpacity onPress={navigateToSearch}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.featuredGrid}>
              {featuredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onPress={() => navigateToClub(club.id)}
                  style={styles.featuredClubCard}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {nearbyClubs.length === 0 && featuredClubs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={Colors.text.disabled} />
            <Text style={styles.emptyStateTitle}>No hay clubes disponibles</Text>
            <Text style={styles.emptyStateText}>
              Intenta buscar clubes en tu área o revisa tu conexión a internet
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  searchButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: FontSizes.md,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
  },
  clubCard: {
    marginRight: Spacing.md,
    width: 280,
  },
  featuredGrid: {
    paddingHorizontal: Spacing.lg,
  },
  featuredClubCard: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    fontSize: FontSizes.md,
    color: Colors.text.white,
    fontWeight: '600',
  },
});