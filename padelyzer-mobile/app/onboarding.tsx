import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Encuentra clubes cerca de ti',
    subtitle: 'Descubre los mejores clubes de padel en tu área con solo un toque',
    image: require('../assets/images/onboarding-1.png'),
  },
  {
    id: 2,
    title: 'Reserva fácil y rápido',
    subtitle: 'Reserva tu cancha favorita en segundos y confirma tu pago de forma segura',
    image: require('../assets/images/onboarding-2.png'),
  },
  {
    id: 3,
    title: 'Gestiona tus reservas',
    subtitle: 'Mantén el control de todas tus reservas y comparte con tus amigos',
    image: require('../assets/images/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      translateX.value = withTiming(-nextIndex * width);
    } else {
      router.replace('/auth/login');
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      translateX.value = withTiming(-prevIndex * width);
    }
  };

  const skipOnboarding = () => {
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.slidesContainer, animatedStyle]}>
          {onboardingData.map((item, index) => (
            <View key={item.id} style={styles.slide}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={goToPrevious}>
              <Text style={styles.previousButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Comenzar' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: Spacing.lg,
    zIndex: 1,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  slidesContainer: {
    flexDirection: 'row',
    width: width * onboardingData.length,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  image: {
    width: 280,
    height: 280,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.subtitle,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border.light,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary.main,
    width: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  previousButton: {
    padding: Spacing.md,
  },
  previousButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: FontSizes.lg,
    color: Colors.text.white,
    fontWeight: '600',
  },
});