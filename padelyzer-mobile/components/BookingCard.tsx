import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/Colors';
import { Booking } from '../types';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  onCancel?: () => void;
  style?: ViewStyle;
}

export default function BookingCard({ booking, onPress, onCancel, style }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.status.success;
      case 'pending':
        return Colors.status.warning;
      case 'cancelled':
        return Colors.status.error;
      case 'completed':
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds
  };

  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
  const isUpcoming = new Date(booking.date) > new Date();

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName} numberOfLines={1}>
            {booking.club.name}
          </Text>
          <Text style={styles.courtName} numberOfLines={1}>
            {booking.court.name}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.detailText}>
            {formatDate(booking.date)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.detailText}>
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={Colors.text.secondary} />
          <Text style={styles.detailText}>
            ${booking.totalAmount}
          </Text>
        </View>
      </View>

      {booking.splitPayment && booking.splitPayment.enabled && (
        <View style={styles.splitPayment}>
          <Ionicons name="people-outline" size={14} color={Colors.primary.main} />
          <Text style={styles.splitPaymentText}>
            Pago dividido ({booking.splitPayment.participants.length + 1} personas)
          </Text>
        </View>
      )}

      {canCancel && isUpcoming && onCancel && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  clubInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  clubName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  courtName: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSizes.xs,
    color: Colors.text.white,
    fontWeight: '600',
  },
  details: {
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  splitPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.light + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  splitPaymentText: {
    fontSize: FontSizes.xs,
    color: Colors.primary.main,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  cancelButton: {
    backgroundColor: Colors.status.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  cancelButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.text.white,
    fontWeight: '500',
  },
});