import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type ProfileScreenProps = NativeStackScreenProps<any, 'Profile'>;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  memberSince: string;
  totalBookings: number;
}

interface MenuOption {
  id: string;
  title: string;
  icon: string;
  value?: string;
  action: () => void;
  hasToggle?: boolean;
  toggleValue?: boolean;
  hasChevron?: boolean;
}

// Mock user data
const MOCK_USER: User = {
  id: 'USER001',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
  phone: '+1 (555) 987-6543',
  isVerified: true,
  memberSince: 'January 2023',
  totalBookings: 12,
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [user] = useState<User>(MOCK_USER);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleViewBookings = () => {
    // TODO: Navigate to bookings history
    Alert.alert('Booking History', 'Booking history functionality coming soon!');
  };

  const handlePaymentMethods = () => {
    // TODO: Navigate to payment methods
    Alert.alert('Payment Methods', 'Payment methods functionality coming soon!');
  };

  const handleAddresses = () => {
    // TODO: Navigate to saved addresses
    Alert.alert('Saved Addresses', 'Saved addresses functionality coming soon!');
  };

  const handleSupport = () => {
    // TODO: Navigate to support/help
    Alert.alert('Support', 'Support functionality coming soon!');
  };

  const handleRateApp = () => {
    // TODO: Open app store rating
    Alert.alert('Rate App', 'App rating functionality coming soon!');
  };

  const handleTerms = () => {
    // TODO: Open terms and conditions
    Alert.alert('Terms', 'Terms and conditions functionality coming soon!');
  };

  const handlePrivacy = () => {
    // TODO: Open privacy policy
    Alert.alert('Privacy', 'Privacy policy functionality coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      options: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          icon: 'user',
          action: handleEditProfile,
          hasChevron: true,
        },
        {
          id: 'bookings',
          title: 'Booking History',
          icon: 'clock',
          value: `${user.totalBookings} bookings`,
          action: handleViewBookings,
          hasChevron: true,
        },
        {
          id: 'payments',
          title: 'Payment Methods',
          icon: 'credit-card',
          action: handlePaymentMethods,
          hasChevron: true,
        },
        {
          id: 'addresses',
          title: 'Saved Addresses',
          icon: 'map-pin',
          action: handleAddresses,
          hasChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      options: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          icon: 'bell',
          hasToggle: true,
          toggleValue: notifications,
          action: () => setNotifications(!notifications),
        },
        {
          id: 'location',
          title: 'Location Sharing',
          icon: 'map',
          hasToggle: true,
          toggleValue: locationSharing,
          action: () => setLocationSharing(!locationSharing),
        },
        {
          id: 'biometrics',
          title: 'Biometric Login',
          icon: 'lock',
          hasToggle: true,
          toggleValue: biometrics,
          action: () => setBiometrics(!biometrics),
        },
      ],
    },
    {
      title: 'Support',
      options: [
        {
          id: 'help',
          title: 'Help & Support',
          icon: 'help-circle',
          action: handleSupport,
          hasChevron: true,
        },
        {
          id: 'rate',
          title: 'Rate RELOConnect',
          icon: 'star',
          action: handleRateApp,
          hasChevron: true,
        },
      ],
    },
    {
      title: 'Legal',
      options: [
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: 'file-text',
          action: handleTerms,
          hasChevron: true,
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield',
          action: handlePrivacy,
          hasChevron: true,
        },
      ],
    },
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </Text>
        </View>
        {user.isVerified && (
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={12} color="white" />
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userPhone}>{user.phone}</Text>
        
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.memberSince}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Feather name="edit-2" size={16} color="#0057FF" />
      </TouchableOpacity>
    </View>
  );

  const renderMenuSection = (section: any, sectionIndex: number) => (
    <View key={sectionIndex} style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.options.map((option: MenuOption, optionIndex: number) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.menuOption,
              optionIndex === section.options.length - 1 && styles.menuOptionLast,
            ]}
            onPress={option.action}
            disabled={option.hasToggle}
          >
            <View style={styles.menuOptionLeft}>
              <View style={styles.menuIcon}>
                <Feather name={option.icon as any} size={20} color="#0057FF" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                {option.value && (
                  <Text style={styles.menuValue}>{option.value}</Text>
                )}
              </View>
            </View>

            <View style={styles.menuOptionRight}>
              {option.hasToggle ? (
                <Switch
                  value={option.toggleValue}
                  onValueChange={option.action}
                  trackColor={{ false: '#e0e0e0', true: '#0057FF' }}
                  thumbColor="white"
                />
              ) : option.hasChevron ? (
                <Feather name="chevron-right" size={20} color="#ccc" />
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Menu Sections */}
        {menuSections.map(renderMenuSection)}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#DC3545" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.appVersion}>
          <Text style={styles.versionText}>RELOConnect v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0057FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  editButton: {
    position: 'absolute',
    top: 24,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionLast: {
    borderBottomWidth: 0,
  },
  menuOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuOptionRight: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC3545',
    marginLeft: 8,
  },
  appVersion: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});