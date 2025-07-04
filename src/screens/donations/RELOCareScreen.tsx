import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, Input, Button } from '../../components/ui';
import { DonationItem } from '../../types';

const mockDonations: DonationItem[] = [
  {
    id: '1',
    title: 'Dining Table Set',
    description: 'Beautiful wooden dining table with 6 chairs. Great condition.',
    category: 'furniture',
    condition: 'good',
    images: ['https://via.placeholder.com/200'],
    location: {
      latitude: -26.2041,
      longitude: 28.0473,
      address: '123 Main St',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2000',
      country: 'South Africa',
    },
    donorId: 'user1',
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Samsung TV 55"',
    description: 'Smart TV in excellent condition. Moving overseas.',
    category: 'electronics',
    condition: 'like_new',
    images: ['https://via.placeholder.com/200'],
    location: {
      latitude: -26.2041,
      longitude: 28.0473,
      address: '456 Oak Ave',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2000',
      country: 'South Africa',
    },
    donorId: 'user2',
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const TAB_BROWSE = 'browse';
const TAB_MY_DONATIONS = 'my-donations';

export default function RELOCareScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-donations'>(TAB_BROWSE);
  const [searchQuery, setSearchQuery] = useState('');

  const renderDonationItem = ({ item }: { item: DonationItem }) => (
    <Card style={styles.donationCard} onPress={() => console.log('View item', item.id)}>
      <View style={styles.itemImage}>
        <Text style={styles.itemIcon}>
          {item.category === 'furniture' ? '🪑' : 
           item.category === 'electronics' ? '📺' : '📦'}
        </Text>
      </View>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemMeta}>
          <View style={styles.condition}>
            <Text style={[styles.conditionText, { color: colors.primary }]}>
              {item.condition.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          
          <Text style={[styles.location, { color: colors.textSecondary }]}>
            {item.location.city}
          </Text>
        </View>

        <Button
          title="Request Item"
          onPress={() => console.log('Request item', item.id)}
          size="small"
          style={styles.requestButton}
        />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>RELOCare</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Share & Care - Sustainable Moving
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === TAB_BROWSE && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab(TAB_BROWSE)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === TAB_BROWSE ? '#FFFFFF' : colors.text },
            ]}
          >
            Browse Items
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === TAB_MY_DONATIONS && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab(TAB_MY_DONATIONS)}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === TAB_MY_DONATIONS ? '#FFFFFF' : colors.text },
            ]}
          >
            My Donations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === TAB_BROWSE && (
          <>
            <Input
              placeholder="Search for items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
              style={styles.searchInput}
            />

            <FlatList
              data={mockDonations}
              renderItem={renderDonationItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
        
        {activeTab === TAB_MY_DONATIONS && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No donations yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start sharing items you no longer need
            </Text>
            
            <Button
              title="Add Donation"
              onPress={() => console.log('Add donation')}
              style={styles.addButton}
            />
          </View>
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => console.log('Add new donation')}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchInput: {
    marginVertical: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  donationCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 32,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  condition: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E6F2FF',
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  location: {
    fontSize: 12,
  },
  requestButton: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
