import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DriverProfile {
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  memberSince: string;
  vehicleType: string;
  licensePlate: string;
}

const DriverProfileScreen: React.FC = () => {
  const [profile] = useState<DriverProfile>({
    name: 'John Driver',
    email: 'john.driver@example.com',
    phone: '+27 82 123 4567',
    rating: 4.8,
    totalDeliveries: 342,
    memberSince: '2023-03-15',
    vehicleType: 'Bakkie',
    licensePlate: 'GP 123 ABC',
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [availableForOrders, setAvailableForOrders] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logging out...') },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality coming soon!');
  };

  const handleChangeVehicle = () => {
    Alert.alert('Change Vehicle', 'Vehicle management functionality coming soon!');
  };

  const handleViewDocuments = () => {
    Alert.alert('Documents', 'Document management functionality coming soon!');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact support functionality coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <LinearGradient colors={['#0057FF', '#00B2FF']} style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {profile.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {profile.rating}</Text>
                <Text style={styles.deliveries}>
                  {profile.totalDeliveries} deliveries
                </Text>
              </View>
              <Text style={styles.memberSince}>
                Member since {formatDate(profile.memberSince)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.card}>
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleRow}>
                <Ionicons name="car" size={20} color="#0057FF" />
                <Text style={styles.vehicleText}>{profile.vehicleType}</Text>
              </View>
              <View style={styles.vehicleRow}>
                <Ionicons name="document-text" size={20} color="#0057FF" />
                <Text style={styles.vehicleText}>{profile.licensePlate}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangeVehicle}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={20} color="#0057FF" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#0057FF' }}
                thumbColor="white"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="location" size={20} color="#0057FF" />
                <Text style={styles.settingText}>Location Sharing</Text>
              </View>
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: '#E5E5EA', true: '#0057FF' }}
                thumbColor="white"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.settingText}>Available for Orders</Text>
              </View>
              <Switch
                value={availableForOrders}
                onValueChange={setAvailableForOrders}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="person" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewDocuments}
            >
              <Ionicons name="document-text" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Documents</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSupport}
            >
              <Ionicons name="help-circle" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#FF3B30" />
              <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: 'white',
    marginRight: 12,
  },
  deliveries: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginLeft: 8,
  },
  changeButton: {
    backgroundColor: '#0057FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  actionText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginTop: 8,
    textAlign: 'center',
  },
  logoutText: {
    color: '#FF3B30',
  },
});

export default DriverProfileScreen;
