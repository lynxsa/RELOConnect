import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ReloAIChatMobile from './ReloAIChatMobile';

const { width, height } = Dimensions.get('window');

interface FloatingReloAIButtonProps {
  style?: any;
}

const FloatingReloAIButton: React.FC<FloatingReloAIButtonProps> = ({ style }) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle pulsing animation
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  const handlePress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsChatVisible(true);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {/* Pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        
        <TouchableOpacity
          onPress={handlePress}
          style={styles.button}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Ionicons name="bulb" size={28} color="white" />
            
            {/* Optional notification dot */}
            <View style={styles.notificationDot} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* ReloAI Chat Modal */}
      <ReloAIChatMobile
        isVisible={isChatVisible}
        onClose={() => setIsChatVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default FloatingReloAIButton;
