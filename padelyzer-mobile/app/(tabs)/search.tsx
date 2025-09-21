import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/Colors';
import { Club, ClubFilters, Location as LocationType } from '../../types';
import ApiService from '../../services/api';
import ClubCard from '../../components/ClubCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [filters, setFilters] = useState<ClubFilters>({
    sortBy: 'distance',
    sortOrder: 'asc',
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || userLocation) {
      searchClubs();
    }
  }, [searchQuery, filters, userLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const searchClubs = async (page = 1, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setCurrentPage(1);
      } else {
        setIsLoadingMore(true);
      }

      const searchFilters: ClubFilters = {
        ...filters,
        search: searchQuery.trim() || undefined,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
      };

      const response = await ApiService.getPaginated<Club>('/api/public/clubs', {
        ...searchFilters,
        page,
        limit: 10,
      });

      if (response.success && response.data) {
        const newClubs = response.data.data;
        
        if (append) {
          setClubs(prev => [...prev, ...newClubs]);
        } else {
          setClubs(newClubs);
        }
        
        setHasMore(page < response.data.pagination.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error searching clubs:', error);
      Alert.alert('Error', 'No se pudieron cargar los clubes');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      searchClubs(currentPage + 1, true);
    }
  };

  const navigateToClub = (clubId: string) => {
    router.push(`/club/${clubId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setClubs([]);
  };

  const toggleSortBy = () => {
    const newSortBy = filters.sortBy === 'distance' ? 'rating' : 'distance';
    setFilters(prev => ({ ...prev, sortBy: newSortBy }));
  };

  const renderClubItem = ({ item }: { item: Club }) => (
    <ClubCard
      club={item}
      onPress={() => navigateToClub(item.id)}
      style={styles.clubCard}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <LoadingSpinner size="small" message="Cargando más..." />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={64} color={Colors.text.disabled} />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No se encontraron clubes' : 'Busca clubes de padel'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Intenta con otros términos de búsqueda'
          : 'Escribe el nombre de un club o zona para comenzar'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.text.disabled} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar clubes..."
            placeholderTextColor={Colors.text.disabled}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={Colors.text.disabled} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortBy}>
          <Ionicons
            name={filters.sortBy === 'distance' ? 'location' : 'star'}
            size={20}
            color={Colors.primary.main}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity style={styles.filterChip}>
          <Ionicons name="options" size={16} color={Colors.primary.main} />
          <Text style={styles.filterChipText}>Filtros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Precio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Distancia</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Valoración</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner message="Buscando clubes..." />
      ) : (
        <FlatList
          data={clubs}
          renderItem={renderClubItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  sortButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    marginLeft: Spacing.xs,
  },
  listContent: {
    padding: Spacing.lg,
  },
  clubCard: {
    marginBottom: Spacing.md,
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
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
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});