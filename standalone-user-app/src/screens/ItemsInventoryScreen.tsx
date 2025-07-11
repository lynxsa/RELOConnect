import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface InventoryItem {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  volume: number; // in cubic feet
  weight: number; // in kg
  quantity: number;
  category: string;
  fragile?: boolean;
  heavy?: boolean;
}

interface ItemCategory {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  items: InventoryItem[];
}

const ItemsInventoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);

  const categories: ItemCategory[] = [
    {
      id: 'furniture',
      name: 'Furniture',
      icon: 'home',
      items: [
        { id: 'sofa', name: 'Sofa', icon: 'home', volume: 45, weight: 40, quantity: 0, category: 'furniture', heavy: true },
        { id: 'dining_table', name: 'Dining Table', icon: 'home', volume: 30, weight: 35, quantity: 0, category: 'furniture', heavy: true },
        { id: 'bed', name: 'Bed', icon: 'home', volume: 35, weight: 30, quantity: 0, category: 'furniture', heavy: true },
        { id: 'wardrobe', name: 'Wardrobe', icon: 'home', volume: 50, weight: 45, quantity: 0, category: 'furniture', heavy: true },
        { id: 'coffee_table', name: 'Coffee Table', icon: 'home', volume: 15, weight: 15, quantity: 0, category: 'furniture' },
        { id: 'chair', name: 'Chair', icon: 'home', volume: 8, weight: 8, quantity: 0, category: 'furniture' },
        { id: 'bookshelf', name: 'Bookshelf', icon: 'home', volume: 25, weight: 20, quantity: 0, category: 'furniture' },
        { id: 'desk', name: 'Desk', icon: 'home', volume: 20, weight: 18, quantity: 0, category: 'furniture' },
      ],
    },
    {
      id: 'appliances',
      name: 'Appliances',
      icon: 'zap',
      items: [
        { id: 'refrigerator', name: 'Refrigerator', icon: 'square', volume: 35, weight: 70, quantity: 0, category: 'appliances', heavy: true },
        { id: 'washing_machine', name: 'Washing Machine', icon: 'square', volume: 25, weight: 60, quantity: 0, category: 'appliances', heavy: true },
        { id: 'tv', name: 'TV', icon: 'tv', volume: 15, weight: 25, quantity: 0, category: 'appliances', fragile: true },
        { id: 'microwave', name: 'Microwave', icon: 'square', volume: 5, weight: 15, quantity: 0, category: 'appliances' },
        { id: 'ac', name: 'Air Conditioner', icon: 'wind', volume: 20, weight: 50, quantity: 0, category: 'appliances', heavy: true },
        { id: 'oven', name: 'Oven', icon: 'square', volume: 10, weight: 20, quantity: 0, category: 'appliances' },
      ],
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: 'smartphone',
      items: [
        { id: 'laptop', name: 'Laptop', icon: 'laptop', volume: 1, weight: 2, quantity: 0, category: 'electronics', fragile: true },
        { id: 'computer', name: 'Desktop Computer', icon: 'monitor', volume: 8, weight: 10, quantity: 0, category: 'electronics', fragile: true },
        { id: 'printer', name: 'Printer', icon: 'printer', volume: 3, weight: 5, quantity: 0, category: 'electronics' },
        { id: 'speaker', name: 'Speaker', icon: 'speaker', volume: 2, weight: 3, quantity: 0, category: 'electronics' },
        { id: 'game_console', name: 'Game Console', icon: 'monitor', volume: 2, weight: 3, quantity: 0, category: 'electronics', fragile: true },
      ],
    },
    {
      id: 'boxes',
      name: 'Boxes & Storage',
      icon: 'box',
      items: [
        { id: 'large_box', name: 'Large Box', icon: 'box', volume: 6, weight: 20, quantity: 0, category: 'boxes' },
        { id: 'medium_box', name: 'Medium Box', icon: 'box', volume: 4, weight: 15, quantity: 0, category: 'boxes' },
        { id: 'small_box', name: 'Small Box', icon: 'box', volume: 2, weight: 8, quantity: 0, category: 'boxes' },
        { id: 'wardrobe_box', name: 'Wardrobe Box', icon: 'box', volume: 10, weight: 25, quantity: 0, category: 'boxes' },
        { id: 'book_box', name: 'Book Box', icon: 'box', volume: 1.5, weight: 30, quantity: 0, category: 'boxes', heavy: true },
      ],
    },
    {
      id: 'miscellaneous',
      name: 'Miscellaneous',
      icon: 'more-horizontal',
      items: [
        { id: 'plants', name: 'Plants', icon: 'heart', volume: 3, weight: 5, quantity: 0, category: 'miscellaneous', fragile: true },
        { id: 'artwork', name: 'Artwork', icon: 'image', volume: 2, weight: 3, quantity: 0, category: 'miscellaneous', fragile: true },
        { id: 'mirrors', name: 'Mirrors', icon: 'square', volume: 3, weight: 8, quantity: 0, category: 'miscellaneous', fragile: true },
        { id: 'luggage', name: 'Luggage', icon: 'briefcase', volume: 5, weight: 10, quantity: 0, category: 'miscellaneous' },
        { id: 'sports_equipment', name: 'Sports Equipment', icon: 'activity', volume: 8, weight: 15, quantity: 0, category: 'miscellaneous' },
      ],
    },
  ];

  useEffect(() => {
    calculateTotals();
  }, [selectedItems]);

  const calculateTotals = () => {
    let volume = 0;
    let weight = 0;

    categories.forEach(category => {
      category.items.forEach(item => {
        const quantity = selectedItems[item.id] || 0;
        volume += item.volume * quantity;
        weight += item.weight * quantity;
      });
    });

    setTotalVolume(volume);
    setTotalWeight(weight);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity),
    }));
  };

  const handleCategoryPress = (category: ItemCategory) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleContinue = () => {
    if (totalVolume === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to continue.');
      return;
    }

    // Navigate to vehicle selection with inventory data
    navigation.navigate('VehicleSelection' as any, {
      inventory: selectedItems,
      totalVolume,
      totalWeight,
    });
  };

  const getEstimatedTruckSize = () => {
    if (totalVolume <= 100) return 'Small Truck';
    if (totalVolume <= 300) return 'Medium Truck';
    if (totalVolume <= 500) return 'Large Truck';
    return 'Extra Large Truck';
  };

  const CategoryCard: React.FC<{ category: ItemCategory }> = ({ category }) => {
    const categoryItemCount = category.items.reduce((sum, item) => sum + (selectedItems[item.id] || 0), 0);
    
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryIcon}>
          <Feather name={category.icon} size={24} color="#0057FF" />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        {categoryItemCount > 0 && (
          <View style={styles.itemCount}>
            <Text style={styles.itemCountText}>{categoryItemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ItemRow: React.FC<{ item: InventoryItem }> = ({ item }) => {
    const quantity = selectedItems[item.id] || 0;
    
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={styles.itemIcon}>
            <Feather name={item.icon} size={20} color="#0057FF" />
          </View>
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemMeta}>
              <Text style={styles.itemMetaText}>{item.volume} cu ft</Text>
              <Text style={styles.itemMetaText}>•</Text>
              <Text style={styles.itemMetaText}>{item.weight} kg</Text>
              {item.fragile && <Text style={styles.fragileText}>Fragile</Text>}
              {item.heavy && <Text style={styles.heavyText}>Heavy</Text>}
            </View>
          </View>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(item.id, quantity - 1)}
            disabled={quantity === 0}
          >
            <Feather name="minus" size={16} color={quantity === 0 ? '#ccc' : '#0057FF'} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateItemQuantity(item.id, quantity + 1)}
          >
            <Feather name="plus" size={16} color="#0057FF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const SummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Inventory Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Volume:</Text>
        <Text style={styles.summaryValue}>{totalVolume} cu ft</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Weight:</Text>
        <Text style={styles.summaryValue}>{totalWeight} kg</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Recommended:</Text>
        <Text style={styles.summaryValue}>{getEstimatedTruckSize()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Items Inventory</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Feather name="info" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.pageTitle}>What items are you moving?</Text>
          <Text style={styles.pageDescription}>
            Select all the items you'll be moving. This helps us provide accurate pricing and ensure we bring the right truck size.
          </Text>

          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </View>

          {/* Summary Card */}
          {totalVolume > 0 && <SummaryCard />}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, totalVolume === 0 && styles.disabledButton]}
          onPress={handleContinue}
          disabled={totalVolume === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={totalVolume === 0 ? ['#E0E0E0', '#E0E0E0'] : ['#0057FF', '#00B2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={[styles.continueButtonText, totalVolume === 0 && styles.disabledButtonText]}>
              Continue to Vehicle Selection
            </Text>
            <Feather name="arrow-right" size={20} color={totalVolume === 0 ? '#999' : 'white'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedCategory?.name}</Text>
            <View style={styles.modalSpacer} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedCategory?.items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  pageDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  categoryCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  itemCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0057FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradientButton: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  disabledButtonText: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  modalSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#666',
  },
  fragileText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  heavyText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
});

export default ItemsInventoryScreen;
