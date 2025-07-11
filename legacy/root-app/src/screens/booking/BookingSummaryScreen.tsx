import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStore } from '../../store';
import { Button, Card } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';

export default function BookingSummaryScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    pickupLocation,
    dropoffLocation,
    selectedVehicle,
    extraServices,
    estimatedPrice,
    clearBooking,
  } = useBookingStore();

  const [loading, setLoading] = useState(false);

  const calculateExtrasCost = () => {
    let extraCost = 0;
    if (extraServices?.loading) extraCost += 150;
    if (extraServices?.stairs) extraCost += extraServices.stairs * 50;
    if (extraServices?.packing) extraCost += 200;
    if (extraServices?.cleaning) extraCost += 180;
    if (extraServices?.express) extraCost += 100;
    if (extraServices?.insurance) extraCost += 80;
    return extraCost;
  };

  const totalCost = estimatedPrice + calculateExtrasCost();

  const handleConfirmBooking = async () => {
    if (!pickupLocation || !dropoffLocation || !selectedVehicle) {
      Alert.alert('Error', 'Missing booking information');
      return;
    }

    setLoading(true);
    try {
      // Navigate to payment screen
      navigation.navigate('PaymentScreen' as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to process booking');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = () => {
    navigation.goBack();
  };

  const renderLocationCard = () => (
    <Card style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Ionicons name="location-outline" size={24} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Trip Details
        </Text>
      </View>

      <View style={styles.locationItem}>
        <View style={styles.locationDot} />
        <View style={styles.locationInfo}>
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
            Pickup Location
          </Text>
          <Text style={[styles.locationAddress, { color: colors.text }]}>
            {pickupLocation?.address}
          </Text>
        </View>
      </View>

      <View style={styles.locationLine} />

      <View style={styles.locationItem}>
        <View style={[styles.locationDot, { backgroundColor: colors.secondary }]} />
        <View style={styles.locationInfo}>
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
            Drop-off Location
          </Text>
          <Text style={[styles.locationAddress, { color: colors.text }]}>
            {dropoffLocation?.address}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderVehicleCard = () => (
    <Card style={styles.vehicleCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="car-outline" size={24} color={colors.primary} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Vehicle & Service
        </Text>
      </View>

      <View style={styles.vehicleInfo}>
        <Text style={[styles.vehicleName, { color: colors.text }]}>
          {selectedVehicle?.name}
        </Text>
        <Text style={[styles.vehicleDescription, { color: colors.textSecondary }]}>
          {selectedVehicle?.description}
        </Text>
        <Text style={[styles.vehicleCapacity, { color: colors.textSecondary }]}>
          Capacity: {selectedVehicle?.capacity}m³ • Max Weight: {selectedVehicle?.maxWeight}kg
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
          Base Price
        </Text>
        <Text style={[styles.priceValue, { color: colors.text }]}>
          R{estimatedPrice.toFixed(2)}
        </Text>
      </View>
    </Card>
  );

  const renderExtrasCard = () => {
    const hasExtras = extraServices && (
      extraServices.loading ||
      extraServices.stairs > 0 ||
      extraServices.packing ||
      extraServices.cleaning ||
      extraServices.express ||
      extraServices.insurance
    );

    if (!hasExtras) return null;

    return (
      <Card style={styles.extrasCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Additional Services
          </Text>
        </View>

        {extraServices?.loading && (
          <View style={styles.extraItem}>
            <Text style={[styles.extraName, { color: colors.text }]}>
              Loading Assistance
            </Text>
            <Text style={[styles.extraPrice, { color: colors.text }]}>
              R150.00
            </Text>
          </View>
        )}

        {extraServices?.stairs > 0 && (
          <View style={styles.extraItem}>
            <Text style={[styles.extraName, { color: colors.text }]}>
              Stairs ({extraServices.stairs} flights)
            </Text>
            <Text style={[styles.extraPrice, { color: colors.text }]}>
              R{(extraServices.stairs * 50).toFixed(2)}
            </Text>
          </View>
        )}

        {extraServices?.packing && (
          <View style={styles.extraItem}>
            <Text style={[styles.extraName, { color: colors.text }]}>
              Packing Service
            </Text>
            <Text style={[styles.extraPrice, { color: colors.text }]}>
              R200.00
            </Text>
          </View>
        )}

        {extraServices?.cleaning && (
          <View style={styles.extraItem}>
            <Text style={[styles.extraName, { color: colors.text }]}>
              Cleaning Service
            </Text>
            <Text style={[styles.extraPrice, { color: colors.text }]}>
              R180.00
            </Text>
          </View>
        )}

        {extraServices?.express && (
          <View style={styles.extraItem}>
            <Text style={[styles.extraName, { color: colors.text }]}>
              Express Delivery
            </Text>
            <Text style={[styles.extraPrice, { color: colors.text }]}>
              R100.00
            </Text>
          </View>
        )}

        {extraServices?.insurance && (
          <View style={styles.extraItem}>
            <Text style={[styles.extraName, { color: colors.text }]}>
              Premium Insurance
            </Text>
            <Text style={[styles.extraPrice, { color: colors.text }]}>
              R80.00
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const renderTotalCard = () => (
    <Card style={styles.totalCard}>
      <View style={styles.totalRow}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>
          Total Cost
        </Text>
        <Text style={[styles.totalValue, { color: colors.primary }]}>
          R{totalCost.toFixed(2)}
        </Text>
      </View>
      <Text style={[styles.totalNote, { color: colors.textSecondary }]}>
        Including all fees and taxes
      </Text>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Booking Summary
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Review your booking details before confirming
          </Text>
        </View>

        {renderLocationCard()}
        {renderVehicleCard()}
        {renderExtrasCard()}
        {renderTotalCard()}

        <View style={styles.actions}>
          <Button
            title="Edit Booking"
            onPress={handleEditBooking}
            variant="outline"
            style={styles.editButton}
          />
          <Button
            title="Confirm & Pay"
            onPress={handleConfirmBooking}
            loading={loading}
            style={styles.confirmButton}
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
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationCard: {
    marginBottom: 16,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
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
  vehicleCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleInfo: {
    marginBottom: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  vehicleCapacity: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  extrasCard: {
    marginBottom: 16,
    padding: 16,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  extraName: {
    fontSize: 14,
  },
  extraPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalNote: {
    fontSize: 12,
    textAlign: 'right',
  },
  actions: {
    gap: 12,
  },
  editButton: {
    marginBottom: 8,
  },
  confirmButton: {
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});
