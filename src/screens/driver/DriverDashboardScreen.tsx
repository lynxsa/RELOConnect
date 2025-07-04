import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Card } from '../../components/ui';

interface JobRequest {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: string;
  fare: number;
  estimatedTime: string;
  vehicleType: string;
  customerName: string;
  customerRating: number;
  packageDetails: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  requestTime: Date;
}

const mockJobs: JobRequest[] = [
  {
    id: '1',
    pickupAddress: '123 Main St, Johannesburg',
    dropoffAddress: '456 Oak Ave, Sandton',
    distance: '15.2 km',
    fare: 280,
    estimatedTime: '45 min',
    vehicleType: 'van',
    customerName: 'Sarah Johnson',
    customerRating: 4.8,
    packageDetails: 'Household furniture',
    status: 'pending',
    requestTime: new Date(),
  },
  {
    id: '2',
    pickupAddress: '789 Pine Rd, Randburg',
    dropoffAddress: '321 Elm St, Rosebank',
    distance: '8.5 km',
    fare: 180,
    estimatedTime: '25 min',
    vehicleType: 'pickup',
    customerName: 'Michael Brown',
    customerRating: 4.5,
    packageDetails: 'Office equipment',
    status: 'pending',
    requestTime: new Date(),
  },
];

export default function DriverDashboardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<JobRequest[]>(mockJobs);
  const [activeJob, setActiveJob] = useState<JobRequest | null>(null);
  const [earnings, setEarnings] = useState({
    today: 520,
    week: 2840,
    month: 11600,
  });

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      Alert.alert('You\'re Online!', 'You will now receive job requests.');
    } else {
      Alert.alert('You\'re Offline', 'You won\'t receive new job requests.');
    }
  };

  const handleAcceptJob = (job: JobRequest) => {
    Alert.alert(
      'Accept Job',
      `Accept delivery from ${job.pickupAddress} to ${job.dropoffAddress} for R${job.fare}?`,
      [
        { text: 'Decline', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setActiveJob(job);
            setJobs(prev => prev.filter(j => j.id !== job.id));
            Alert.alert('Job Accepted!', 'Navigate to pickup location.');
          },
        },
      ]
    );
  };

  const handleCompleteJob = () => {
    if (activeJob) {
      Alert.alert(
        'Complete Job',
        'Mark this delivery as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => {
              setActiveJob(null);
              setEarnings(prev => ({
                ...prev,
                today: prev.today + (activeJob?.fare || 0),
              }));
              Alert.alert('Job Completed!', 'Great work! Payment will be processed.');
            },
          },
        ]
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning, James!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ready to earn some money?
          </Text>
        </View>
        
        <View style={styles.onlineToggle}>
          <Text style={[styles.onlineText, { color: colors.text }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={isOnline ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderEarnings = () => (
    <Card style={styles.earningsCard}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Today's Earnings
      </Text>
      
      <View style={styles.earningsGrid}>
        <View style={styles.earningItem}>
          <Text style={[styles.earningAmount, { color: colors.primary }]}>
            R{earnings.today}
          </Text>
          <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
        
        <View style={styles.earningItem}>
          <Text style={[styles.earningAmount, { color: colors.text }]}>
            R{earnings.week}
          </Text>
          <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>
            This Week
          </Text>
        </View>
        
        <View style={styles.earningItem}>
          <Text style={[styles.earningAmount, { color: colors.text }]}>
            R{earnings.month}
          </Text>
          <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>
            This Month
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderActiveJob = () => {
    if (!activeJob) return null;

    return (
      <Card style={styles.activeJobCard}>
        <View style={styles.activeJobHeader}>
          <Ionicons name="car" size={24} color={colors.primary} />
          <Text style={[styles.activeJobTitle, { color: colors.text }]}>
            Active Delivery
          </Text>
        </View>
        
        <View style={styles.jobInfo}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.address, { color: colors.text }]}>
              {activeJob.pickupAddress}
            </Text>
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.secondary} />
            <Text style={[styles.address, { color: colors.text }]}>
              {activeJob.dropoffAddress}
            </Text>
          </View>
          
          <View style={styles.jobMeta}>
            <Text style={[styles.fare, { color: colors.primary }]}>
              R{activeJob.fare}
            </Text>
            <Text style={[styles.distance, { color: colors.textSecondary }]}>
              {activeJob.distance} • {activeJob.estimatedTime}
            </Text>
          </View>
        </View>
        
        <View style={styles.jobActions}>
          <Button
            title="Navigate"
            onPress={() => Alert.alert('Navigation', 'Opening maps...')}
            style={styles.navigateButton}
            variant="outline"
          />
          <Button
            title="Complete"
            onPress={handleCompleteJob}
            style={styles.completeButton}
          />
        </View>
      </Card>
    );
  };

  const renderJobCard = ({ item }: { item: JobRequest }) => (
    <Card style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerName, { color: colors.text }]}>
            {item.customerName}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {item.customerRating}
            </Text>
          </View>
        </View>
        
        <View style={styles.fareContainer}>
          <Text style={[styles.jobFare, { color: colors.primary }]}>
            R{item.fare}
          </Text>
        </View>
      </View>
      
      <View style={styles.jobRoutes}>
        <View style={styles.routeItem}>
          <Ionicons name="radio-button-on" size={12} color={colors.primary} />
          <Text style={[styles.routeText, { color: colors.text }]}>
            {item.pickupAddress}
          </Text>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.routeItem}>
          <Ionicons name="location" size={12} color={colors.secondary} />
          <Text style={[styles.routeText, { color: colors.text }]}>
            {item.dropoffAddress}
          </Text>
        </View>
      </View>
      
      <View style={styles.jobFooter}>
        <Text style={[styles.jobDetails, { color: colors.textSecondary }]}>
          {item.distance} • {item.estimatedTime} • {item.packageDetails}
        </Text>
        
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAcceptJob(item)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderEarnings()}
        {renderActiveJob()}
        
        <View style={styles.jobsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isOnline ? 'Available Jobs' : 'Go online to see job requests'}
          </Text>
          
          {isOnline && (
            <FlatList
              data={jobs}
              renderItem={renderJobCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  onlineToggle: {
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  earningsCard: {
    marginBottom: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningItem: {
    alignItems: 'center',
  },
  earningAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningLabel: {
    fontSize: 12,
  },
  activeJobCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#E6F2FF',
  },
  activeJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeJobTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  jobInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  fare: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  navigateButton: {
    flex: 1,
  },
  completeButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  jobsSection: {
    marginBottom: 20,
  },
  jobCard: {
    marginBottom: 16,
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  jobFare: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  jobRoutes: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDetails: {
    fontSize: 12,
    flex: 1,
  },
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
