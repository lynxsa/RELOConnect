import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStore } from '../../store';
import { Button, Card } from '../../components/ui';

export default function BookingConfirmationScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { bookingHistory } = useBookingStore();

  // Get the latest booking
  const latestBooking = bookingHistory[bookingHistory.length - 1];

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking' as never);
  };

  const handleGoHome = () => {
    navigation.navigate('Home' as never);
  };

  const handleViewBookings = () => {
    navigation.navigate('BookingHistory' as never);
  };

  if (!latestBooking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            No booking found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.successIcon}
          >
            <Ionicons name="checkmark" size={48} color="white" />
          </LinearGradient>
          
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Booking Confirmed!
          </Text>
          
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your relocation has been successfully booked. A driver will be assigned shortly.
          </Text>
        </View>

        {/* Booking Details */}
        <Card style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <Text style={[styles.bookingId, { color: colors.textSecondary }]}>
              Booking ID
            </Text>
            <Text style={[styles.bookingIdValue, { color: colors.text }]}>
              {latestBooking.id?.substring(8)}
            </Text>
          </View>

          <View style={styles.locationSection}>
            <View style={styles.locationItem}>
              <View style={styles.locationDot} />
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                  Pickup
                </Text>
                <Text style={[styles.locationAddress, { color: colors.text }]}>
                  {latestBooking.pickupLocation.address}
                </Text>
              </View>
            </View>

            <View style={styles.locationLine} />

            <View style={styles.locationItem}>
              <View style={[styles.locationDot, { backgroundColor: colors.secondary }]} />
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                  Drop-off
                </Text>
                <Text style={[styles.locationAddress, { color: colors.text }]}>
                  {latestBooking.dropoffLocation.address}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Price Summary */}
        <Card style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <Text style={[styles.priceTitle, { color: colors.text }]}>
              Payment Summary
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Total Paid
            </Text>
            <Text style={[styles.totalPaid, { color: colors.primary }]}>
              R{latestBooking.totalPrice.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentMethod}>
            <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
              Payment Method
            </Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>
              {latestBooking.paymentMethod === 'card' ? 'Credit/Debit Card' : 
               latestBooking.paymentMethod === 'yoco' ? 'Yoco' :
               latestBooking.paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
            </Text>
          </View>
        </Card>

        {/* Next Steps */}
        <Card style={styles.stepsCard}>
          <Text style={[styles.stepsTitle, { color: colors.text }]}>
            What's Next?
          </Text>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Driver Assignment
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                We're finding the best driver for your move
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                SMS Confirmation
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                You'll receive driver details via SMS
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                Live Tracking
              </Text>
              <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                Track your driver in real-time
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Track My Order"
            onPress={handleTrackOrder}
            style={styles.trackButton}
          />
          
          <Button
            title="View All Bookings"
            onPress={handleViewBookings}
            variant="outline"
            style={styles.historyButton}
          />
          
          <Button
            title="Back to Home"
            onPress={handleGoHome}
            variant="ghost"
            style={styles.homeButton}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bookingCard: {
    marginBottom: 16,
    padding: 20,
  },
  bookingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bookingId: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookingIdValue: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  locationSection: {
    marginTop: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0057FF',
    marginTop: 4,
    marginRight: 16,
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceCard: {
    marginBottom: 16,
    padding: 20,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
  },
  totalPaid: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepsCard: {
    marginBottom: 24,
    padding: 20,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  trackButton: {
    marginBottom: 8,
  },
  historyButton: {
    marginBottom: 8,
  },
  homeButton: {
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});
