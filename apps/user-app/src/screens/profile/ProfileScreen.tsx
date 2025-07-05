import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store';
import { useUser } from '../../contexts/UserContext';
import { Card, Button } from '../../components/ui';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();
  const { isDriverMode, toggleDriverMode, canBeDriver } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleDriverModeToggle = () => {
    if (!canBeDriver) {
      Alert.alert(
        'Driver Mode Not Available',
        'You need to complete driver verification to access driver mode. Contact support for more information.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    const newMode = !isDriverMode;
    Alert.alert(
      `Switch to ${newMode ? 'Driver' : 'User'} Mode`,
      `Are you sure you want to switch to ${newMode ? 'driver' : 'user'} mode? This will change your interface and available features.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => toggleDriverMode(), style: 'default' },
      ]
    );
  };

  const menuItems = [
    { title: 'My Bookings', icon: 'calendar-outline', onPress: () => console.log('My Bookings') },
    { title: 'Payment Methods', icon: 'card-outline', onPress: () => console.log('Payment Methods') },
    { title: 'My Donations', icon: 'heart-outline', onPress: () => console.log('My Donations') },
    { title: 'Notifications', icon: 'notifications-outline', onPress: () => console.log('Notifications') },
    { title: 'Support', icon: 'help-circle-outline', onPress: () => console.log('Support') },
    { title: 'Settings', icon: 'settings-outline', onPress: () => console.log('Settings') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        
        {/* Role Switch Section */}
        <View style={styles.roleSwitchContainer}>
          <View style={styles.currentModeContainer}>
            <Ionicons 
              name={isDriverMode ? 'car' : 'person'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.currentModeText, { color: colors.text }]}>
              Current Mode: {isDriverMode ? 'Driver' : 'User'}
            </Text>
          </View>
          
          {canBeDriver && (
            <TouchableOpacity 
              style={[styles.modeToggle, { backgroundColor: colors.surface }]}
              onPress={handleDriverModeToggle}
            >
              <Text style={[styles.modeToggleText, { color: colors.text }]}>
                Switch to {isDriverMode ? 'User' : 'Driver'} Mode
              </Text>
              <Switch 
                value={isDriverMode}
                onValueChange={handleDriverModeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </TouchableOpacity>
          )}
          
          {!canBeDriver && (
            <TouchableOpacity 
              style={[styles.becomeDriverButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Become a Driver', 'Contact support to start your driver verification process.')}
            >
              <Text style={styles.becomeDriverText}>Become a Driver</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookings</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>4.8</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Donations</Text>
          </View>
        </View>
      </Card>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon as any} size={24} color={colors.textSecondary} />
            <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={[styles.actionsTitle, { color: colors.text }]}>Quick Actions</Text>
        
        <View style={styles.actionButtons}>
          <Button
            title="Book a Move"
            onPress={() => console.log('Book a Move')}
            style={styles.actionButton}
          />
          
          <Button
            title="Become a Driver"
            onPress={() => console.log('Become a Driver')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>About RELOConnect</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Version 1.0.0{'\n'}
          Revolutionising Relocations - Smart. Safe. Seamless.
        </Text>
      </Card>

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        textStyle={{ color: colors.error }}
      />

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 20,
  },
  roleSwitchContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  currentModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentModeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  modeToggleText: {
    fontSize: 16,
    flex: 1,
  },
  becomeDriverButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  becomeDriverText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  actionsCard: {
    margin: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  infoCard: {
    margin: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});
