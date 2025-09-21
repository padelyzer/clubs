import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PushNotification } from '../types';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<void> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notificaciones deshabilitadas',
          'Para recibir recordatorios de tus reservas, habilita las notificaciones en Configuración.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      // Store token for API registration
      await AsyncStorage.setItem('expo_push_token', token);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1a4d3e',
        });
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async scheduleBookingReminder(
    bookingId: string,
    clubName: string,
    date: string,
    time: string
  ): Promise<string | null> {
    try {
      const bookingDate = new Date(`${date}T${time}`);
      const reminderDate = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
      
      // Don't schedule if the reminder time has already passed
      if (reminderDate <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de reserva',
          body: `Tu reserva en ${clubName} es en 2 horas (${time})`,
          data: {
            bookingId,
            type: 'booking_reminder',
          },
          sound: true,
        },
        trigger: {
          type: 'date' as const,
          date: reminderDate,
        },
      });

      // Store notification ID for potential cancellation
      await AsyncStorage.setItem(`notification_${bookingId}`, notificationId);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling booking reminder:', error);
      return null;
    }
  }

  async cancelBookingReminder(bookingId: string): Promise<void> {
    try {
      const notificationId = await AsyncStorage.getItem(`notification_${bookingId}`);
      
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await AsyncStorage.removeItem(`notification_${bookingId}`);
      }
    } catch (error) {
      console.error('Error cancelling booking reminder:', error);
    }
  }

  async scheduleCheckInReminder(
    bookingId: string,
    clubName: string,
    date: string,
    time: string
  ): Promise<string | null> {
    try {
      const bookingDate = new Date(`${date}T${time}`);
      const checkInDate = new Date(bookingDate.getTime() - 15 * 60 * 1000); // 15 minutes before
      
      // Don't schedule if the check-in time has already passed
      if (checkInDate <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora de ir al club',
          body: `Tu reserva en ${clubName} comienza en 15 minutos. ¡Es hora de ir!`,
          data: {
            bookingId,
            type: 'check_in_reminder',
          },
          sound: true,
        },
        trigger: {
          type: 'date' as const,
          date: checkInDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling check-in reminder:', error);
      return null;
    }
  }

  async sendLocalNotification(notification: PushNotification): Promise<void> {
    try {
      await Notifications.presentNotificationAsync({
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notification.sound !== false,
        badge: notification.badge,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  removeNotificationSubscription(subscription: Notifications.Subscription): void {
    Notifications.removeNotificationSubscription(subscription);
  }
}

export default new NotificationService();