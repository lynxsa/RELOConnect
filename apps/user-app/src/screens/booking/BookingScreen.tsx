import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../types/navigation';

type Props = BottomTabScreenProps<RootTabParamList, 'Book'>;

interface BookingData {
  origin: string;
  destination: string;
  moveDate: string;
  moveSize: 'studio' | '1-bedroom' | '2-bedroom' | '3-bedroom' | '4+bedroom';
  services: string[];
}

const BookingScreen: React.FC = () => {
  const [bookingData, setBookingData] = useState<BookingData>({
    origin: '',
    destination: '',
    moveDate: '',
    moveSize: 'studio',
    services: [],
  });

  const moveSizes = [
    { id: 'studio', label: 'Studio', icon: 'home-outline' },
    { id: '1-bedroom', label: '1 Bedroom', icon: 'home' },
    { id: '2-bedroom', label: '2 Bedrooms', icon: 'business' },
    { id: '3-bedroom', label: '3 Bedrooms', icon: 'business-outline' },
    { id: '4+bedroom', label: '4+ Bedrooms', icon: 'city' },
  ];

  const additionalServices = [
    { id: 'packing', label: 'Professional Packing Service', price: 'R1,500' },
    { id: 'storage', label: 'Storage (1 month)', price: 'R800' },
    { id: 'insurance', label: 'Premium Insurance Cover', price: 'R650' },
    { id: 'cleaning', label: 'Post-Move Cleaning Service', price: 'R950' },
  ];

  const toggleService = (serviceId: string) => {
    setBookingData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleGetQuote = () => {
    if (!bookingData.origin || !bookingData.destination || !bookingData.moveDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // TODO: Navigate to quote screen or make API call
    Alert.alert('Quote Request', 'Your quote request has been submitted!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Book Your Move</Text>
          <Text style={styles.headerSubtitle}>Get a quote in minutes</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Move Details</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#0057FF" />
              <TextInput
                style={styles.input}
                placeholder="Moving from (e.g., Cape Town, Johannesburg)"
                value={bookingData.origin}
                onChangeText={(text) => setBookingData(prev => ({ ...prev, origin: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#0057FF" />
              <TextInput
                style={styles.input}
                placeholder="Moving to (e.g., Durban, Pretoria)"
                value={bookingData.destination}
                onChangeText={(text) => setBookingData(prev => ({ ...prev, destination: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color="#0057FF" />
              <TextInput
                style={styles.input}
                placeholder="Preferred move date (DD/MM/YYYY)"
                value={bookingData.moveDate}
                onChangeText={(text) => setBookingData(prev => ({ ...prev, moveDate: text }))}
              />
            </View>
          </View>

          {/* Move Size Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home Size</Text>
            <View style={styles.sizeGrid}>
              {moveSizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeCard,
                    bookingData.moveSize === size.id && styles.sizeCardSelected
                  ]}
                  onPress={() => setBookingData(prev => ({ ...prev, moveSize: size.id as any }))}
                >
                  <Ionicons
                    name={size.icon as any}
                    size={24}
                    color={bookingData.moveSize === size.id ? '#FFFFFF' : '#0057FF'}
                  />
                  <Text style={[
                    styles.sizeLabel,
                    bookingData.moveSize === size.id && styles.sizeLabelSelected
                  ]}>
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Services</Text>
            {additionalServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  bookingData.services.includes(service.id) && styles.serviceItemSelected
                ]}
                onPress={() => toggleService(service.id)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={[
                    styles.serviceLabel,
                    bookingData.services.includes(service.id) && styles.serviceLabelSelected
                  ]}>
                    {service.label}
                  </Text>
                  <Text style={[
                    styles.servicePrice,
                    bookingData.services.includes(service.id) && styles.servicePriceSelected
                  ]}>
                    {service.price}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  bookingData.services.includes(service.id) && styles.checkboxSelected
                ]}>
                  {bookingData.services.includes(service.id) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Get Quote Button */}
          <TouchableOpacity onPress={handleGetQuote} style={styles.quoteButtonContainer}>
            <LinearGradient
              colors={['#0057FF', '#00B2FF']}
              style={styles.quoteButton}
            >
              <Text style={styles.quoteButtonText}>Get My Quote</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  sizeCardSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  sizeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginTop: 8,
    textAlign: 'center',
  },
  sizeLabelSelected: {
    color: '#FFFFFF',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceItemSelected: {
    backgroundColor: '#F0F7FF',
    borderColor: '#0057FF',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  serviceLabelSelected: {
    color: '#0057FF',
  },
  servicePrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  servicePriceSelected: {
    color: '#0057FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  quoteButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  quoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  quoteButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default BookingScreen;
