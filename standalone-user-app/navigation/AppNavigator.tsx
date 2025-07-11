import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RELOCareScreen from '../screens/RELOCareScreen';
import RELONewsScreen from '../screens/RELONewsScreen';
import RELOPortsScreen from '../screens/RELOPortsScreen';
import BookingScreen from '../BookingScreen';

export type ScreenName = 'Home' | 'Booking' | 'RELOCare' | 'RELONews' | 'RELOPorts';

interface NavigationProps {
  initialScreen?: ScreenName;
}

const AppNavigator: React.FC<NavigationProps> = ({ initialScreen = 'Home' }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(initialScreen);

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as ScreenName);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'Booking':
        return <BookingScreen onBack={() => setCurrentScreen('Home')} />;
      case 'RELOCare':
        return <RELOCareScreen onBack={() => setCurrentScreen('Home')} />;
      case 'RELONews':
        return <RELONewsScreen onBack={() => setCurrentScreen('Home')} />;
      case 'RELOPorts':
        return <RELOPortsScreen onBack={() => setCurrentScreen('Home')} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const BottomTab = ({ screen, icon, label }: { screen: ScreenName; icon: string; label: string }) => (
    <TouchableOpacity
      style={[styles.tab, currentScreen === screen && styles.activeTab]}
      onPress={() => setCurrentScreen(screen)}
    >
      <Text style={[styles.tabIcon, currentScreen === screen && styles.activeTabIcon]}>{icon}</Text>
      <Text style={[styles.tabLabel, currentScreen === screen && styles.activeTabLabel]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <BottomTab screen="Home" icon="🏠" label="Home" />
        <BottomTab screen="Booking" icon="🚚" label="Book" />
        <BottomTab screen="RELOCare" icon="❤️" label="Care" />
        <BottomTab screen="RELONews" icon="📰" label="News" />
        <BottomTab screen="RELOPorts" icon="🚢" label="Ports" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default AppNavigator;
