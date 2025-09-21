import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../services/AuthContext';
import { Colors } from '../constants/Colors';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isLoggedIn) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoggedIn, isLoading, router]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo-white.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Padelyzer</Text>
      <Text style={styles.subtitle}>Tu app de padel favorita</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.lightGray,
    textAlign: 'center',
  },
});