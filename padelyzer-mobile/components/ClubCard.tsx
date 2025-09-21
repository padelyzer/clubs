import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { Club } from '../types';

interface ClubCardProps {
  club: Club;
  onPress: () => void;
  style?: ViewStyle;
}

export default function ClubCard({ club, onPress, style }: ClubCardProps) {
  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const formatPriceRange = (priceRange: { min: number; max: number }) => {
    return `$${priceRange.min} - $${priceRange.max}/hora`;
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: club.images[0] || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          resizeMode="cover"
        />
        {club.distance && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{formatDistance(club.distance)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {club.name}
        </Text>
        
        <Text style={styles.address} numberOfLines={1}>
          {club.address}
        </Text>

        <View style={styles.rating}>
          <Ionicons name="star" size={16} color={Colors.accent.main} />
          <Text style={styles.ratingText}>
            {club.rating.toFixed(1)} ({club.totalReviews})
          </Text>
        </View>

        <Text style={styles.price}>{formatPriceRange(club.priceRange)}</Text>

        {club.amenities.length > 0 && (
          <View style={styles.amenities}>
            {club.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {club.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{club.amenities.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.background.modal,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  distanceText: {
    fontSize: FontSizes.xs,
    color: Colors.text.white,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  address: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  price: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: Spacing.sm,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amenityTag: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  amenityText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
  },
  moreAmenities: {
    fontSize: FontSizes.xs,
    color: Colors.text.disabled,
    marginLeft: Spacing.xs,
  },
});