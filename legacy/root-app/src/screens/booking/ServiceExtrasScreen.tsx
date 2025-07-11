import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStore } from '../../store';
import { Button, Card } from '../../components/ui';

interface ServiceExtra {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  price: number;
  type: 'boolean' | 'stepper';
  value?: boolean | number;
}

const serviceExtras: ServiceExtra[] = [
  {
    id: 'loading',
    name: 'Loading Assistance',
    description: 'Professional movers to help load/unload',
    icon: 'people-outline',
    price: 150,
    type: 'boolean',
  },
  {
    id: 'stairs',
    name: 'Stairs',
    description: 'Additional charge per flight of stairs',
    icon: 'walk-outline',
    price: 50,
    type: 'stepper',
  },
  {
    id: 'packing',
    name: 'Packing Service',
    description: 'Professional packing materials and service',
    icon: 'cube-outline',
    price: 200,
    type: 'boolean',
  },
  {
    id: 'cleaning',
    name: 'Cleaning Service',
    description: 'Post-move cleaning service',
    icon: 'sparkles-outline',
    price: 180,
    type: 'boolean',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority delivery within 2 hours',
    icon: 'flash-outline',
    price: 100,
    type: 'boolean',
  },
  {
    id: 'insurance',
    name: 'Premium Insurance',
    description: 'Enhanced coverage up to R50,000',
    icon: 'shield-checkmark-outline',
    price: 80,
    type: 'boolean',
  },
];

export default function ServiceExtrasScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { extraServices, updateExtraServices, estimatedPrice, setEstimatedPrice } = useBookingStore();

  const [services, setServices] = useState<Record<string, boolean | number>>({
    loading: extraServices?.loading || false,
    stairs: extraServices?.stairs || 0,
    packing: extraServices?.packing || false,
    cleaning: extraServices?.cleaning || false,
    express: extraServices?.express || false,
    insurance: extraServices?.insurance || false,
  });

  const calculateTotal = () => {
    let extraCost = 0;
    serviceExtras.forEach(extra => {
      const value = services[extra.id];
      if (extra.type === 'boolean' && value) {
        extraCost += extra.price;
      } else if (extra.type === 'stepper' && typeof value === 'number') {
        extraCost += extra.price * value;
      }
    });
    return estimatedPrice + extraCost;
  };

  const handleServiceChange = (id: string, value: boolean | number) => {
    setServices(prev => ({ ...prev, [id]: value }));
  };

  const handleContinue = () => {
    updateExtraServices({
      loading: services.loading as boolean,
      stairs: services.stairs as number,
      packing: services.packing as boolean,
      cleaning: services.cleaning as boolean,
      express: services.express as boolean,
      insurance: services.insurance as boolean,
    });
    
    navigation.navigate('BookingSummary' as never);
  };

  const renderServiceItem = (service: ServiceExtra) => {
    const value = services[service.id];

    return (
      <Card key={service.id} style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIcon}>
            <Ionicons name={service.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, { color: colors.text }]}>
              {service.name}
            </Text>
            <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
              {service.description}
            </Text>
            <Text style={[styles.servicePrice, { color: colors.primary }]}>
              R{service.price}{service.type === 'stepper' ? ' per flight' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.serviceControl}>
          {service.type === 'boolean' ? (
            <Switch
              value={value as boolean}
              onValueChange={(newValue) => handleServiceChange(service.id, newValue)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={value ? colors.primary : colors.textSecondary}
            />
          ) : (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: colors.border }]}
                onPress={() => handleServiceChange(service.id, Math.max(0, (value as number) - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: colors.text }]}>
                {value}
              </Text>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: colors.border }]}
                onPress={() => handleServiceChange(service.id, (value as number) + 1)}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Service Extras
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your move with additional services
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          {serviceExtras.map(renderServiceItem)}
        </View>
      </ScrollView>

      {/* Price Summary Footer */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.footer}
      >
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Total Cost</Text>
            <Text style={styles.totalPrice}>R{calculateTotal().toFixed(2)}</Text>
          </View>
          <Button
            title="Continue"
            onPress={handleContinue}
            style={styles.continueButton}
            variant="secondary"
          />
        </View>
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
  servicesContainer: {
    paddingBottom: 100,
  },
  serviceCard: {
    marginBottom: 16,
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceControl: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  totalPrice: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
  },
});
