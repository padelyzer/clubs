import { useState, useEffect } from 'react';
import { Location as LocationType } from '../types';
import LocationService from '../services/LocationService';

interface UseLocationReturn {
  location: LocationType | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get cached location on mount
    const cachedLocation = LocationService.getCachedLocation();
    if (cachedLocation) {
      setLocation(cachedLocation);
    }

    return () => {
      LocationService.stopWatchingLocation();
    };
  }, []);

  const requestLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentLocation = await LocationService.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      } else {
        setError('No se pudo obtener la ubicación');
      }
    } catch (err) {
      setError('Error al obtener la ubicación');
      console.error('Location error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startWatching = async () => {
    try {
      setError(null);
      await LocationService.watchLocation((newLocation) => {
        setLocation(newLocation);
      });
    } catch (err) {
      setError('Error al monitorear la ubicación');
      console.error('Location watching error:', err);
    }
  };

  const stopWatching = () => {
    LocationService.stopWatchingLocation();
  };

  return {
    location,
    isLoading,
    error,
    requestLocation,
    startWatching,
    stopWatching,
  };
}