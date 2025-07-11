import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui';

const { width } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  illustration: string; // SVG or image path
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Smart Relocation Booking',
    description: 'Book your move in minutes with our intelligent matching system that finds the perfect vehicle and driver for your needs.',
    illustration: '🚚',
  },
  {
    id: '2',
    title: 'Real-time Tracking',
    description: 'Track your belongings in real-time with live GPS monitoring and direct communication with your driver.',
    illustration: '📍',
  },
  {
    id: '3',
    title: 'Safe & Secure',
    description: 'All drivers are verified and insured. Your items are protected with comprehensive coverage options.',
    illustration: '🛡️',
  },
  {
    id: '4',
    title: 'Community Care',
    description: 'Share and donate items with RELOCare, our community-driven platform for sustainable relocations.',
    illustration: '❤️',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex });
    }
  };

  const handleGetStarted = () => {
    // Navigate to Auth screen - this would be handled by the parent navigator
    console.log('Get Started pressed');
  };

  const renderOnboardingItem = ({ item }: { item: OnboardingItem }) => (
    <View style={[styles.slideContainer, { backgroundColor: colors.background }]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>{item.illustration}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? colors.primary : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {renderPaginationDots()}

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          {currentIndex > 0 && (
            <Button
              title="Previous"
              onPress={handlePrevious}
              variant="ghost"
              style={styles.button}
            />
          )}
          
          <View style={{ flex: 1 }} />
          
          {currentIndex < onboardingData.length - 1 ? (
            <Button
              title="Next"
              onPress={handleNext}
              style={styles.button}
            />
          ) : (
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              style={styles.button}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    width,
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    fontSize: 120,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    minWidth: 120,
  },
});
