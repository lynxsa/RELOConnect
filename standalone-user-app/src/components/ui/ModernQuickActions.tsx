import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface QuickActionItem {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  onPress: () => void;
}

interface ModernQuickActionsProps {
  title?: string;
  actions: QuickActionItem[];
  columns?: number;
}

export const ModernQuickActions: React.FC<ModernQuickActionsProps> = ({
  title = "Quick Actions",
  actions,
  columns = 2,
}) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionItem,
              { width: `${100 / columns - 2}%` }
            ]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[action.color, action.color + '80']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name={action.icon} size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
});
