import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';
import { Booking } from '../types';

class CalendarService {
  private defaultCalendarId: string | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de calendario',
          'Para agregar tus reservas al calendario, necesitamos acceso a tu calendario.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      return false;
    }
  }

  async getDefaultCalendar(): Promise<string | null> {
    try {
      if (this.defaultCalendarId) {
        return this.defaultCalendarId;
      }

      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Find the default calendar
      let defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
      
      // On iOS, prefer the local calendar if available
      if (Platform.OS === 'ios') {
        const localCalendar = calendars.find(cal => 
          cal.source?.name === 'Default' || cal.source?.type === Calendar.CalendarType.LOCAL
        );
        if (localCalendar) {
          defaultCalendar = localCalendar;
        }
      }

      this.defaultCalendarId = defaultCalendar?.id || null;
      return this.defaultCalendarId;
    } catch (error) {
      console.error('Error getting default calendar:', error);
      return null;
    }
  }

  async addBookingToCalendar(booking: Booking): Promise<string | null> {
    try {
      const calendarId = await this.getDefaultCalendar();
      if (!calendarId) {
        return null;
      }

      const startDate = new Date(`${booking.date}T${booking.startTime}`);
      const endDate = new Date(`${booking.date}T${booking.endTime}`);

      const eventDetails = {
        title: `Padel - ${booking.club.name}`,
        startDate,
        endDate,
        location: booking.club.address,
        notes: [
          `Cancha: ${booking.court.name}`,
          `Precio: $${booking.totalAmount}`,
          booking.notes ? `Notas: ${booking.notes}` : '',
        ].filter(Boolean).join('\n'),
        alarms: [
          { relativeOffset: -120 }, // 2 hours before
          { relativeOffset: -15 },  // 15 minutes before
        ],
      };

      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
      
      return eventId;
    } catch (error) {
      console.error('Error adding booking to calendar:', error);
      Alert.alert('Error', 'No se pudo agregar la reserva al calendario');
      return null;
    }
  }

  async updateBookingInCalendar(
    eventId: string,
    booking: Booking
  ): Promise<boolean> {
    try {
      const startDate = new Date(`${booking.date}T${booking.startTime}`);
      const endDate = new Date(`${booking.date}T${booking.endTime}`);

      const eventDetails = {
        title: `Padel - ${booking.club.name}`,
        startDate,
        endDate,
        location: booking.club.address,
        notes: [
          `Cancha: ${booking.court.name}`,
          `Precio: $${booking.totalAmount}`,
          booking.notes ? `Notas: ${booking.notes}` : '',
        ].filter(Boolean).join('\n'),
      };

      await Calendar.updateEventAsync(eventId, eventDetails);
      return true;
    } catch (error) {
      console.error('Error updating booking in calendar:', error);
      return false;
    }
  }

  async removeBookingFromCalendar(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error removing booking from calendar:', error);
      return false;
    }
  }

  async getAvailableCalendars(): Promise<Calendar.Calendar[]> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return [];
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      return calendars.filter(cal => cal.allowsModifications);
    } catch (error) {
      console.error('Error getting available calendars:', error);
      return [];
    }
  }

  async createPadelCalendar(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const defaultCalendarSource = calendars[0]?.source;

      if (!defaultCalendarSource) {
        return null;
      }

      const calendarId = await Calendar.createCalendarAsync({
        title: 'Padelyzer - Reservas',
        color: '#1a4d3e',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: 'padelyzer-bookings',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return calendarId;
    } catch (error) {
      console.error('Error creating Padel calendar:', error);
      return null;
    }
  }

  async getEventsForDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Calendar.Event[]> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return [];
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.map(cal => cal.id);

      const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
      return events;
    } catch (error) {
      console.error('Error getting events for date range:', error);
      return [];
    }
  }

  formatEventForSharing(booking: Booking): string {
    const startDate = new Date(`${booking.date}T${booking.startTime}`);
    const endDate = new Date(`${booking.date}T${booking.endTime}`);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `🎾 Reserva de Padel
    
📅 ${formatDate(startDate)}
⏰ ${formatTime(startDate)} - ${formatTime(endDate)}
🏟️ ${booking.club.name}
🎯 ${booking.court.name}
📍 ${booking.club.address}
💰 $${booking.totalAmount}

¡Nos vemos en la cancha! 🏆`;
  }
}

export default new CalendarService();