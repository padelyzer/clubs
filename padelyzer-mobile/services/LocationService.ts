import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Location as LocationType, LocationPermission } from '../types';

class LocationService {
  private currentLocation: LocationType | null = null;
  private watchId: Location.LocationSubscription | null = null;

  async requestPermission(): Promise<LocationPermission> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const permission = await this.requestPermission();
      
      if (!permission.granted) {
        if (permission.canAskAgain) {
          Alert.alert(
            'Ubicación requerida',
            'Para mostrar clubes cerca de ti, necesitamos acceso a tu ubicación.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Permitir', onPress: () => this.getCurrentLocation() },
            ]
          );
        } else {
          Alert.alert(
            'Ubicación deshabilitada',
            'Para habilitar la ubicación, ve a Configuración > Privacidad > Ubicación.',
            [{ text: 'OK' }]
          );
        }
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
      return null;
    }
  }

  async watchLocation(callback: (location: LocationType) => void): Promise<void> {
    try {
      const permission = await this.requestPermission();
      
      if (!permission.granted) {
        return;
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Update every 100 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          this.currentLocation = newLocation;
          callback(newLocation);
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
    }
  }

  stopWatchingLocation(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  getCachedLocation(): LocationType | null {
    return this.currentLocation;
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const address = result[0];
        const parts = [
          address.streetNumber,
          address.street,
          address.district,
          address.city,
          address.region,
        ].filter(Boolean);
        
        return parts.join(', ');
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async geocode(address: string): Promise<LocationType | null> {
    try {
      const result = await Location.geocodeAsync(address);
      
      if (result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }
}

export default new LocationService();