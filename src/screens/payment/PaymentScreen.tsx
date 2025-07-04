import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStore } from '../../store';
import { Button, Card, Input } from '../../components/ui';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'card' | 'yoco' | 'apple_pay' | 'google_pay';
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: 'card-outline',
    type: 'card',
  },
  {
    id: 'yoco',
    name: 'Yoco',
    description: 'Pay with Yoco payment gateway',
    icon: 'wallet-outline',
    type: 'yoco',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    description: 'Pay with Touch ID or Face ID',
    icon: 'phone-portrait-outline',
    type: 'apple_pay',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    description: 'Pay with your Google account',
    icon: 'logo-google',
    type: 'google_pay',
  },
];

export default function PaymentScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    pickupLocation,
    dropoffLocation,
    selectedVehicle,
    extraServices,
    estimatedPrice,
    clearBooking,
    addToHistory,
  } = useBookingStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

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

  const handlePayment = async () => {
    if (!pickupLocation || !dropoffLocation || !selectedVehicle) {
      Alert.alert('Error', 'Missing booking information');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create booking object
      const booking = {
        id: `booking_${Date.now()}`,
        pickupLocation,
        dropoffLocation,
        scheduledDateTime: new Date(),
        vehicleType: selectedVehicle.type,
        estimatedDistance: 15, // Mock data
        estimatedDuration: 45, // Mock data
        packageDetails: {
          description: 'Household items',
          weight: undefined,
          volume: undefined,
          fragile: false,
          valuable: false,
        },
        extraServices: extraServices || {
          loading: false,
          stairs: 0,
          packing: false,
          cleaning: false,
          express: false,
          insurance: false,
        },
        totalPrice: totalCost,
        paymentMethod: selectedPaymentMethod as 'card' | 'yoco' | 'apple_pay' | 'google_pay',
        status: 'confirmed' as const,
        userId: 'user1', // Mock user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to booking history
      addToHistory(booking);

      // Navigate to confirmation screen
      navigation.navigate('BookingConfirmation' as never);

      // Clear current booking state
      clearBooking();

      Alert.alert(
        'Payment Successful!',
        'Your booking has been confirmed. You will receive a confirmation SMS shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        {
          borderColor: selectedPaymentMethod === method.id ? colors.primary : colors.border,
          backgroundColor: selectedPaymentMethod === method.id ? colors.primary + '10' : 'transparent',
        },
      ]}
      onPress={() => setSelectedPaymentMethod(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <View style={styles.paymentMethodIcon}>
          <Ionicons name={method.icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.paymentMethodInfo}>
          <Text style={[styles.paymentMethodName, { color: colors.text }]}>
            {method.name}
          </Text>
          <Text style={[styles.paymentMethodDescription, { color: colors.textSecondary }]}>
            {method.description}
          </Text>
        </View>
        <View style={styles.radioButton}>
          {selectedPaymentMethod === method.id && (
            <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCardForm = () => {
    if (selectedPaymentMethod !== 'card') return null;

    return (
      <Card style={styles.cardForm}>
        <Text style={[styles.cardFormTitle, { color: colors.text }]}>
          Card Details
        </Text>
        
        <Input
          label="Card Number"
          value={cardDetails.number}
          onChangeText={(value) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(value) }))}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
          style={styles.cardInput}
        />
        
        <View style={styles.cardRow}>
          <Input
            label="Expiry Date"
            value={cardDetails.expiry}
            onChangeText={(value) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(value) }))}
            placeholder="MM/YY"
            keyboardType="numeric"
            maxLength={5}
            style={StyleSheet.flatten([styles.cardInput, styles.cardInputHalf])}
          />
          <Input
            label="CVV"
            value={cardDetails.cvv}
            onChangeText={(value) => setCardDetails(prev => ({ ...prev, cvv: value.replace(/[^0-9]/g, '') }))}
            placeholder="123"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            style={StyleSheet.flatten([styles.cardInput, styles.cardInputHalf])}
          />
        </View>
        
        <Input
          label="Cardholder Name"
          value={cardDetails.name}
          onChangeText={(value) => setCardDetails(prev => ({ ...prev, name: value }))}
          placeholder="John Doe"
          style={styles.cardInput}
        />
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Payment
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your preferred payment method
          </Text>
        </View>

        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Order Summary
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Trip Cost
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              R{estimatedPrice.toFixed(2)}
            </Text>
          </View>
          
          {calculateExtrasCost() > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Additional Services
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                R{calculateExtrasCost().toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              R{totalCost.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Payment Methods */}
        <View style={styles.paymentMethods}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Card Form */}
        {renderCardForm()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Pay Button */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.footer}
      >
        <Button
          title={`Pay R${totalCost.toFixed(2)}`}
          onPress={handlePayment}
          loading={loading}
          style={styles.payButton}
          variant="secondary"
        />
      </LinearGradient>
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
  summaryCard: {
    marginBottom: 24,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  paymentMethod: {
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardForm: {
    marginBottom: 24,
    padding: 16,
  },
  cardFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  cardInput: {
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardInputHalf: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
  },
  payButton: {
    backgroundColor: 'white',
  },
  bottomSpacing: {
    height: 100,
  },
});
