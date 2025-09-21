import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/Colors';
import { Booking } from '../../types';
import ApiService from '../../services/api';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';

type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BookingFilter>('all');

  const filters: { key: BookingFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'Todas', icon: 'list' },
    { key: 'upcoming', label: 'Próximas', icon: 'calendar' },
    { key: 'past', label: 'Pasadas', icon: 'checkmark-circle' },
    { key: 'cancelled', label: 'Canceladas', icon: 'close-circle' },
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.get<Booking[]>('/api/bookings');
      
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar las reservas');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBookings();
    setIsRefreshing(false);
  };

  const filterBookings = () => {
    const now = new Date();
    let filtered = bookings;

    switch (activeFilter) {
      case 'upcoming':
        filtered = bookings.filter(
          booking => new Date(booking.date) >= now && booking.status !== 'cancelled'
        );
        break;
      case 'past':
        filtered = bookings.filter(
          booking => new Date(booking.date) < now || booking.status === 'completed'
        );
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
      default:
        filtered = bookings;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredBookings(filtered);
  };

  const navigateToBooking = (bookingId: string) => {
    router.push(`/booking/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => cancelBooking(bookingId),
        },
      ]
    );
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await ApiService.post(`/api/bookings/${bookingId}/cancel`);
      
      if (response.success) {
        Alert.alert('Éxito', 'Reserva cancelada correctamente');
        loadBookings(); // Reload bookings
      } else {
        Alert.alert('Error', response.error || 'No se pudo cancelar la reserva');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'No se pudo cancelar la reserva');
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onPress={() => navigateToBooking(item.id)}
      onCancel={() => handleCancelBooking(item.id)}
      style={styles.bookingCard}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={Colors.text.disabled} />
      <Text style={styles.emptyStateTitle}>
        {activeFilter === 'all' ? 'No tienes reservas' : `No tienes reservas ${getFilterLabel()}`}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeFilter === 'all'
          ? 'Encuentra clubes cerca de ti y haz tu primera reserva'
          : 'Cambia el filtro para ver otras reservas'
        }
      </Text>
      {activeFilter === 'all' && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Text style={styles.exploreButtonText}>Explorar clubes</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getFilterLabel = () => {
    const filter = filters.find(f => f.key === activeFilter);
    return filter?.label.toLowerCase() || '';
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando reservas..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservas</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="add" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Ionicons
              name={filter.icon as any}
              size={16}
              color={activeFilter === filter.key ? Colors.text.white : Colors.text.secondary}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  filtersContainer: {
    maxHeight: 60,
    backgroundColor: Colors.background.primary,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.main,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.text.white,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  exploreButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  exploreButtonText: {
    fontSize: FontSizes.md,
    color: Colors.text.white,
    fontWeight: '600',
  },
});