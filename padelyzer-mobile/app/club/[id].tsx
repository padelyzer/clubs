import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/Colors';
import { Club, Court } from '../../types';
import ApiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function ClubDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadClubDetails();
    }
  }, [id]);

  const loadClubDetails = async () => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.get<Club>(`/api/public/clubs/${id}`);
      
      if (response.success && response.data) {
        setClub(response.data);
      } else {
        Alert.alert('Error', 'No se pudo cargar la información del club');
        router.back();
      }
    } catch (error) {
      console.error('Error loading club details:', error);
      Alert.alert('Error', 'No se pudo cargar la información del club');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!club) return;
    router.push(`/booking/new?clubId=${club.id}`);
  };

  const handleCall = () => {
    if (!club?.phone) return;
    Linking.openURL(`tel:${club.phone}`);
  };

  const handleWebsite = () => {
    if (!club?.website) return;
    Linking.openURL(club.website);
  };

  const handleDirections = () => {
    if (!club) return;
    const url = `https://maps.google.com/?q=${encodeURIComponent(club.address)}`;
    Linking.openURL(url);
  };

  const renderOperatingHours = () => {
    if (!club?.operatingHours) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios</Text>
        {days.map((day, index) => {
          const hours = club.operatingHours[day];
          if (!hours) return null;

          return (
            <View key={day} style={styles.hourRow}>
              <Text style={styles.dayName}>{dayNames[index]}</Text>
              <Text style={styles.hours}>
                {hours.closed ? 'Cerrado' : `${hours.open} - ${hours.close}`}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderCourts = () => {
    if (!club?.courts || club.courts.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Canchas ({club.courts.length})</Text>
        {club.courts.map((court) => (
          <View key={court.id} style={styles.courtCard}>
            <View style={styles.courtInfo}>
              <Text style={styles.courtName}>{court.name}</Text>
              <Text style={styles.courtDetails}>
                {court.type === 'indoor' ? 'Interior' : 'Exterior'} • {court.surface}
                {court.hasLighting && ' • Con iluminación'}
              </Text>
              <Text style={styles.courtPrice}>${court.pricePerHour}/hora</Text>
            </View>
            <TouchableOpacity
              style={styles.bookCourtButton}
              onPress={() => router.push(`/booking/new?clubId=${club.id}&courtId=${court.id}`)}
            >
              <Text style={styles.bookCourtButtonText}>Reservar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando club..." />;
  }

  if (!club) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Club no encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
        </TouchableOpacity>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {club.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.clubImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {club.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {club.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Club Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.clubName}>{club.name}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={Colors.accent.main} />
              <Text style={styles.ratingText}>
                {club.rating.toFixed(1)} ({club.totalReviews} reseñas)
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{club.description}</Text>

          {/* Price Range */}
          <View style={styles.priceRange}>
            <Text style={styles.priceText}>
              ${club.priceRange.min} - ${club.priceRange.max}/hora
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.primary.main} />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
              <Ionicons name="navigate" size={20} color={Colors.primary.main} />
              <Text style={styles.actionButtonText}>Direcciones</Text>
            </TouchableOpacity>
            
            {club.website && (
              <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
                <Ionicons name="globe" size={20} color={Colors.primary.main} />
                <Text style={styles.actionButtonText}>Sitio web</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={16} color={Colors.text.secondary} />
              <Text style={styles.address}>{club.address}</Text>
            </View>
          </View>

          {/* Amenities */}
          {club.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicios</Text>
              <View style={styles.amenities}>
                {club.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Operating Hours */}
          {renderOperatingHours()}

          {/* Courts */}
          {renderCourts()}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Reservar Ahora</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    zIndex: 10,
    backgroundColor: Colors.background.modal,
    borderRadius: BorderRadius.round,
    padding: Spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  clubImage: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: Spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.modal,
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: Colors.text.white,
    width: 24,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  clubName: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  priceRange: {
    backgroundColor: Colors.primary.light + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  priceText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.primary.main,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.primary.main,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  amenityText: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  dayName: {
    fontSize: FontSizes.md,
    color: Colors.text.primary,
  },
  hours: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  courtCard: {
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  courtDetails: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  courtPrice: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  bookCourtButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  bookCourtButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.text.white,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  bookButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.text.white,
    fontWeight: '600',
  },
});