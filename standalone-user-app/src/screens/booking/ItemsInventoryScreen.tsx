import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  MOVING_ITEMS, 
  PROPERTY_TYPES, 
  PROPERTY_DEFAULTS,
  VEHICLE_CAPACITIES,
  MovingItem,
  getItemById,
  getItemsByRoom,
  getItemsByCategory,
  calculateVehicleRequirement
} from '../../data/movingItems';

const { width } = Dimensions.get('window');

interface SelectedItem {
  itemId: string;
  quantity: number;
  size?: string;
  customName?: string;
  notes?: string;
  images?: string[];
  estimatedVolume: number;
  estimatedWeight: number;
}

interface ItemsInventoryScreenProps {
  onComplete: (items: SelectedItem[], recommendedVehicle: string) => void;
  onBack: () => void;
}

const ItemsInventoryScreen: React.FC<ItemsInventoryScreenProps> = ({ onComplete, onBack }) => {
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [currentRoom, setCurrentRoom] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MovingItem | null>(null);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const rooms = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Office', 'Laundry', 'General'];

  useEffect(() => {
    // Request camera permissions
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permissions are required to upload images.');
      }
    })();
  }, []);

  const loadPropertyDefaults = (propertyType: string) => {
    setIsLoading(true);
    setSelectedPropertyType(propertyType);
    
    if (propertyType === 'custom') {
      setSelectedItems([]);
      setIsLoading(false);
      return;
    }

    const defaults = PROPERTY_DEFAULTS[propertyType as keyof typeof PROPERTY_DEFAULTS] || [];
    const newSelectedItems: SelectedItem[] = defaults.map(defaultItem => {
      const item = getItemById(defaultItem.itemId);
      if (!item) return null;

      let volume = item.averageVolume;
      let weight = item.weight;

      if (defaultItem.size && item.commonSizes?.[defaultItem.size as keyof typeof item.commonSizes]) {
        const sizeData = item.commonSizes[defaultItem.size as keyof typeof item.commonSizes];
        if (sizeData) {
          volume = sizeData.volume;
          weight = sizeData.weight;
        }
      }

      return {
        itemId: defaultItem.itemId,
        quantity: defaultItem.quantity,
        size: defaultItem.size,
        estimatedVolume: volume * defaultItem.quantity,
        estimatedWeight: weight * defaultItem.quantity,
      };
    }).filter(Boolean) as SelectedItem[];

    setSelectedItems(newSelectedItems);
    setIsLoading(false);
  };

  const getFilteredItems = () => {
    let items = MOVING_ITEMS;

    if (currentRoom !== 'All') {
      items = getItemsByRoom(currentRoom);
    }

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const handleItemPress = (item: MovingItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const addItemToSelection = (item: MovingItem, quantity: number, size?: string, notes?: string) => {
    const existingIndex = selectedItems.findIndex(si => si.itemId === item.id && si.size === size);
    
    let volume = item.averageVolume;
    let weight = item.weight;

    if (size && item.commonSizes?.[size as keyof typeof item.commonSizes]) {
      const sizeData = item.commonSizes[size as keyof typeof item.commonSizes];
      if (sizeData) {
        volume = sizeData.volume;
        weight = sizeData.weight;
      }
    }

    const newItem: SelectedItem = {
      itemId: item.id,
      quantity,
      size,
      notes,
      estimatedVolume: volume * quantity,
      estimatedWeight: weight * quantity,
    };

    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].estimatedVolume += volume * quantity;
      updated[existingIndex].estimatedWeight += weight * quantity;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, newItem]);
    }

    setShowItemModal(false);
  };

  const removeItem = (itemId: string, size?: string) => {
    setSelectedItems(selectedItems.filter(item => 
      !(item.itemId === itemId && item.size === size)
    ));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number, size?: string) => {
    if (newQuantity <= 0) {
      removeItem(itemId, size);
      return;
    }

    const item = getItemById(itemId);
    if (!item) return;

    let volume = item.averageVolume;
    let weight = item.weight;

    if (size && item.commonSizes?.[size as keyof typeof item.commonSizes]) {
      const sizeData = item.commonSizes[size as keyof typeof item.commonSizes];
      if (sizeData) {
        volume = sizeData.volume;
        weight = sizeData.weight;
      }
    }

    setSelectedItems(selectedItems.map(selectedItem =>
      selectedItem.itemId === itemId && selectedItem.size === size
        ? {
            ...selectedItem,
            quantity: newQuantity,
            estimatedVolume: volume * newQuantity,
            estimatedWeight: weight * newQuantity,
          }
        : selectedItem
    ));
  };

  const addCustomItem = (name: string, volume: number, weight: number, quantity: number, notes?: string) => {
    const customItem: SelectedItem = {
      itemId: `custom_${Date.now()}`,
      quantity,
      customName: name,
      notes,
      estimatedVolume: volume * quantity,
      estimatedWeight: weight * quantity,
    };

    setSelectedItems([...selectedItems, customItem]);
    setShowCustomItemModal(false);
  };

  const pickImage = async (itemId: string, size?: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.cancelled && result.uri) {
      const imageUri = result.uri;
      setSelectedItems(selectedItems.map(item =>
        item.itemId === itemId && item.size === size
          ? { ...item, images: [...(item.images || []), imageUri] }
          : item
      ));
    }
  };

  const calculateTotals = () => {
    const totalVolume = selectedItems.reduce((sum, item) => sum + item.estimatedVolume, 0);
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.estimatedWeight, 0);
    const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

    return { totalVolume, totalWeight, totalItems };
  };

  const getRecommendedVehicle = () => {
    const itemsForCalculation = selectedItems.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      size: item.size,
    }));

    return calculateVehicleRequirement(itemsForCalculation);
  };

  const handleComplete = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No items selected', 'Please add some items to your inventory before continuing.');
      return;
    }

    const recommendedVehicle = getRecommendedVehicle();
    onComplete(selectedItems, recommendedVehicle);
  };

  const { totalVolume, totalWeight, totalItems } = calculateTotals();
  const recommendedVehicle = getRecommendedVehicle();
  const vehicleInfo = VEHICLE_CAPACITIES[recommendedVehicle as keyof typeof VEHICLE_CAPACITIES];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#0057FF', '#00B2FF']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Items Inventory</Text>
            <Text style={styles.headerSubtitle}>Add your moving items</Text>
          </View>
          <TouchableOpacity
            style={styles.summaryButton}
            onPress={() => setShowSummaryModal(true)}
          >
            <Ionicons name="list" size={24} color="white" />
            <Text style={styles.summaryBadge}>{totalItems}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Property Type Selection */}
      {!selectedPropertyType && (
        <View style={styles.propertySelection}>
          <Text style={styles.sectionTitle}>What type of property are you moving from?</Text>
          <Text style={styles.sectionSubtitle}>We'll suggest common items to speed up your inventory</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertyScroll}>
            {PROPERTY_TYPES.map(property => (
              <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => loadPropertyDefaults(property.id)}
              >
                <Ionicons 
                  name={property.id === 'office' ? 'business' : 'home'} 
                  size={32} 
                  color="#0057FF" 
                />
                <Text style={styles.propertyName}>{property.name}</Text>
                <Text style={styles.propertyDetails}>~{property.avgItems} typical items</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0057FF" />
          <Text style={styles.loadingText}>Setting up your inventory...</Text>
        </View>
      )}

      {/* Main Content */}
      {selectedPropertyType && !isLoading && (
        <>
          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.customButton}
              onPress={() => setShowCustomItemModal(true)}
            >
              <Ionicons name="add" size={20} color="#0057FF" />
            </TouchableOpacity>
          </View>

          {/* Room Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomFilter}>
            {rooms.map(room => (
              <TouchableOpacity
                key={room}
                style={[styles.roomButton, currentRoom === room && styles.activeRoomButton]}
                onPress={() => setCurrentRoom(room)}
              >
                <Text style={[styles.roomText, currentRoom === room && styles.activeRoomText]}>
                  {room}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Items Grid */}
          <FlatList
            data={getFilteredItems()}
            renderItem={({ item }) => {
              const selectedItem = selectedItems.find(si => si.itemId === item.id);
              const totalQuantity = selectedItems
                .filter(si => si.itemId === item.id)
                .reduce((sum, si) => sum + si.quantity, 0);

              return (
                <TouchableOpacity
                  style={[styles.itemCard, totalQuantity > 0 && styles.selectedItemCard]}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.itemHeader}>
                    <Ionicons name={item.icon as any} size={24} color="#0057FF" />
                    {totalQuantity > 0 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>{totalQuantity}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <View style={styles.itemTags}>
                    {item.fragile && <Text style={styles.tag}>Fragile</Text>}
                    {item.specialHandling && <Text style={styles.tag}>Special</Text>}
                    {item.disassemblyRequired && <Text style={styles.tag}>Assembly</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.itemsGrid}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary Bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Items: {totalItems}</Text>
              <Text style={styles.summaryLabel}>
                Vehicle: {vehicleInfo?.name || 'Multiple Trucks'}
              </Text>
            </View>
            <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Item Details Modal */}
      <Modal
        visible={showItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ItemDetailsModal
          item={selectedItem}
          onAdd={addItemToSelection}
          onClose={() => setShowItemModal(false)}
        />
      </Modal>

      {/* Custom Item Modal */}
      <Modal
        visible={showCustomItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <CustomItemModal
          onAdd={addCustomItem}
          onClose={() => setShowCustomItemModal(false)}
        />
      </Modal>

      {/* Summary Modal */}
      <Modal
        visible={showSummaryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SummaryModal
          selectedItems={selectedItems}
          totals={{ totalVolume, totalWeight, totalItems }}
          recommendedVehicle={recommendedVehicle}
          onUpdateQuantity={updateItemQuantity}
          onRemoveItem={removeItem}
          onAddImage={pickImage}
          onClose={() => setShowSummaryModal(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

// Item Details Modal Component
const ItemDetailsModal: React.FC<{
  item: MovingItem | null;
  onAdd: (item: MovingItem, quantity: number, size?: string, notes?: string) => void;
  onClose: () => void;
}> = ({ item, onAdd, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const handleAdd = () => {
    onAdd(item, quantity, selectedSize, notes);
    setQuantity(1);
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{item.name}</Text>
        <TouchableOpacity onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <View style={styles.itemInfo}>
          <Ionicons name={item.icon as any} size={48} color="#0057FF" />
          <Text style={styles.itemDescription}>{item.category} • {item.room}</Text>
          
          {item.fragile && (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={16} color="#FF9500" />
              <Text style={styles.warningText}>Fragile item - requires special handling</Text>
            </View>
          )}
        </View>

        {/* Size Selection */}
        {item.commonSizes && (
          <View style={styles.sizeSection}>
            <Text style={styles.sectionLabel}>Size</Text>
            {Object.entries(item.commonSizes).map(([size, data]) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeOption, selectedSize === size && styles.selectedSizeOption]}
                onPress={() => setSelectedSize(size)}
              >
                <View>
                  <Text style={styles.sizeTitle}>{size.charAt(0).toUpperCase() + size.slice(1)}</Text>
                  <Text style={styles.sizeDescription}>{data.description}</Text>
                </View>
                <Text style={styles.sizeDetails}>{data.weight}kg • {data.volume}m³</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quantity Selection */}
        <View style={styles.quantitySection}>
          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color="#0057FF" />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#0057FF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any special notes about this item..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Packing Materials */}
        {item.packingMaterial && (
          <View style={styles.packingSection}>
            <Text style={styles.sectionLabel}>Recommended Packing</Text>
            {item.packingMaterial.map((material, index) => (
              <Text key={index} style={styles.packingItem}>• {material}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Custom Item Modal Component
const CustomItemModal: React.FC<{
  onAdd: (name: string, volume: number, weight: number, quantity: number, notes?: string) => void;
  onClose: () => void;
}> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [volume, setVolume] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!name || !volume || !weight) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    onAdd(name, parseFloat(volume), parseFloat(weight), quantity, notes);
    setName('');
    setVolume('');
    setWeight('');
    setQuantity(1);
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Add Custom Item</Text>
        <TouchableOpacity onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Item Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Antique Cabinet"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.sectionLabel}>Volume (m³) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.5"
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.sectionLabel}>Weight (kg) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="25"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color="#0057FF" />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#0057FF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Special handling requirements, condition, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Summary Modal Component
const SummaryModal: React.FC<{
  selectedItems: SelectedItem[];
  totals: { totalVolume: number; totalWeight: number; totalItems: number };
  recommendedVehicle: string;
  onUpdateQuantity: (itemId: string, newQuantity: number, size?: string) => void;
  onRemoveItem: (itemId: string, size?: string) => void;
  onAddImage: (itemId: string, size?: string) => void;
  onClose: () => void;
}> = ({ selectedItems, totals, recommendedVehicle, onUpdateQuantity, onRemoveItem, onAddImage, onClose }) => {
  const vehicleInfo = VEHICLE_CAPACITIES[recommendedVehicle as keyof typeof VEHICLE_CAPACITIES];

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#8E8E93" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Inventory Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Vehicle Recommendation */}
        <View style={styles.vehicleRecommendation}>
          <Text style={styles.sectionLabel}>Recommended Vehicle</Text>
          <View style={styles.vehicleCard}>
            <Ionicons name="car" size={32} color="#0057FF" />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicleInfo?.name || 'Multiple Trucks'}</Text>
              <Text style={styles.vehicleDescription}>
                {vehicleInfo?.description || 'Multiple vehicles required for this move'}
              </Text>
            </View>
          </View>
          
          <View style={styles.capacityInfo}>
            <View style={styles.capacityItem}>
              <Text style={styles.capacityLabel}>Volume</Text>
              <Text style={styles.capacityValue}>
                {totals.totalVolume.toFixed(1)}m³ / {vehicleInfo?.maxVolume || '∞'}m³
              </Text>
            </View>
            <View style={styles.capacityItem}>
              <Text style={styles.capacityLabel}>Weight</Text>
              <Text style={styles.capacityValue}>
                {totals.totalWeight.toFixed(0)}kg / {vehicleInfo?.maxWeight || '∞'}kg
              </Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsList}>
          <Text style={styles.sectionLabel}>Selected Items ({totals.totalItems})</Text>
          {selectedItems.map((selectedItem, index) => {
            const item = getItemById(selectedItem.itemId);
            const displayName = selectedItem.customName || (item ? item.name : "Custom Item");
            
            return (
              <View key={`${selectedItem.itemId}-${selectedItem.size}-${index}`} style={styles.summaryItemCard}>
                <View style={styles.summaryItemHeader}>
                  <Ionicons name={item?.icon as any || 'cube'} size={20} color="#0057FF" />
                  <View style={styles.summaryItemInfo}>
                    <Text style={styles.summaryItemName}>{displayName}</Text>
                    {selectedItem.size && (
                      <Text style={styles.summaryItemSize}>Size: {selectedItem.size}</Text>
                    )}
                    <Text style={styles.summaryItemDetails}>
                      {selectedItem.estimatedVolume.toFixed(2)}m³ • {selectedItem.estimatedWeight}kg
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => onRemoveItem(selectedItem.itemId, selectedItem.size)}
                  >
                    <Ionicons name="trash" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.summaryItemControls}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => onUpdateQuantity(selectedItem.itemId, selectedItem.quantity - 1, selectedItem.size)}
                    >
                      <Ionicons name="remove" size={16} color="#0057FF" />
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{selectedItem.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => onUpdateQuantity(selectedItem.itemId, selectedItem.quantity + 1, selectedItem.size)}
                    >
                      <Ionicons name="add" size={16} color="#0057FF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={() => onAddImage(selectedItem.itemId, selectedItem.size)}
                  >
                    <Ionicons name="camera" size={16} color="#0057FF" />
                    <Text style={styles.imageButtonText}>Add Photo</Text>
                  </TouchableOpacity>
                </View>

                {selectedItem.images && selectedItem.images.length > 0 && (
                  <ScrollView horizontal style={styles.imagesList}>
                    {selectedItem.images.map((image, imgIndex) => (
                      <Image key={imgIndex} source={{ uri: image }} style={styles.itemImage} />
                    ))}
                  </ScrollView>
                )}

                {selectedItem.notes && (
                  <Text style={styles.itemNotes}>Note: {selectedItem.notes}</Text>
                )}
              </View>
            );
          })}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryButton: {
    position: 'relative',
    padding: 8,
  },
  summaryBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  propertySelection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  propertyScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  propertyCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginTop: 8,
  },
  propertyDetails: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1D1D1F',
  },
  customButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  roomFilter: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  roomButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 8,
  },
  activeRoomButton: {
    backgroundColor: '#0057FF',
  },
  roomText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeRoomText: {
    color: 'white',
  },
  itemsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  itemCard: {
    width: (width - 52) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedItemCard: {
    borderWidth: 2,
    borderColor: '#0057FF',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityBadge: {
    backgroundColor: '#0057FF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    fontSize: 10,
    color: '#0057FF',
    backgroundColor: 'rgba(0, 87, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0057FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  itemInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  itemDescription: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 8,
  },
  sizeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  sizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedSizeOption: {
    borderColor: '#0057FF',
    backgroundColor: 'rgba(0, 87, 255, 0.05)',
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  sizeDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  sizeDetails: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    minWidth: 40,
    textAlign: 'center',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    color: '#1D1D1F',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  packingSection: {
    marginBottom: 24,
  },
  packingItem: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: 16,
    color: '#1D1D1F',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  vehicleRecommendation: {
    marginBottom: 24,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  vehicleDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  capacityInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  capacityItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  capacityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  itemsList: {
    marginBottom: 24,
  },
  summaryItemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  summaryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  summaryItemSize: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  summaryItemDetails: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  summaryItemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 87, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  imageButtonText: {
    fontSize: 12,
    color: '#0057FF',
    fontWeight: '500',
  },
  imagesList: {
    marginTop: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  itemNotes: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default ItemsInventoryScreen;
