import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/NotificationService';

interface UseNotificationsReturn {
  isInitialized: boolean;
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  scheduleBookingReminder: (
    bookingId: string,
    clubName: string,
    date: string,
    time: string
  ) => Promise<string | null>;
  cancelBookingReminder: (bookingId: string) => Promise<void>;
  clearBadge: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    initializeNotifications();

    // Set up notification listeners
    notificationListener.current = NotificationService.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = NotificationService.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response);
      }
    );

    return () => {
      if (notificationListener.current) {
        NotificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        NotificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      const token = NotificationService.getExpoPushToken();
      setExpoPushToken(token);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'booking_reminder' && data?.bookingId) {
      // Navigate to booking details
      router.push(`/booking/${data.bookingId}`);
    } else if (data?.type === 'check_in_reminder' && data?.bookingId) {
      // Navigate to booking details or club location
      router.push(`/booking/${data.bookingId}`);
    }
  };

  const scheduleBookingReminder = async (
    bookingId: string,
    clubName: string,
    date: string,
    time: string
  ): Promise<string | null> => {
    try {
      const notificationId = await NotificationService.scheduleBookingReminder(
        bookingId,
        clubName,
        date,
        time
      );

      // Also schedule check-in reminder
      await NotificationService.scheduleCheckInReminder(
        bookingId,
        clubName,
        date,
        time
      );

      return notificationId;
    } catch (error) {
      console.error('Error scheduling booking reminder:', error);
      return null;
    }
  };

  const cancelBookingReminder = async (bookingId: string): Promise<void> => {
    try {
      await NotificationService.cancelBookingReminder(bookingId);
    } catch (error) {
      console.error('Error cancelling booking reminder:', error);
    }
  };

  const clearBadge = async (): Promise<void> => {
    try {
      await NotificationService.clearBadge();
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  };

  return {
    isInitialized,
    expoPushToken,
    notification,
    scheduleBookingReminder,
    cancelBookingReminder,
    clearBadge,
  };
}