/**
 * Moving Items Database
 * Comprehensive list of moving items categorized by room and property type
 * with volume calculations for intelligent vehicle recommendations
 */

export interface MovingItem {
  id: string;
  name: string;
  category: string;
  room: string;
  averageVolume: number; // in cubic meters
  weight: number; // in kg
  fragile: boolean;
  disassemblyRequired: boolean;
  specialHandling: boolean;
  commonSizes?: {
    small?: { volume: number; weight: number; description: string };
    medium?: { volume: number; weight: number; description: string };
    large?: { volume: number; weight: number; description: string };
  };
  packingMaterial?: string[];
  icon: string;
}

export const PROPERTY_TYPES = [
  { id: 'studio', name: 'Studio Apartment', rooms: 1, avgItems: 15 },
  { id: '1bedroom', name: '1 Bedroom Apartment', rooms: 2, avgItems: 25 },
  { id: '2bedroom', name: '2 Bedroom Apartment', rooms: 4, avgItems: 40 },
  { id: '3bedroom', name: '3 Bedroom House', rooms: 6, avgItems: 60 },
  { id: '4bedroom', name: '4 Bedroom House', rooms: 8, avgItems: 80 },
  { id: '5bedroom', name: '5+ Bedroom House', rooms: 10, avgItems: 100 },
  { id: 'office', name: 'Office Space', rooms: 3, avgItems: 30 },
  { id: 'custom', name: 'Custom Selection', rooms: 0, avgItems: 0 },
];

export const MOVING_ITEMS: MovingItem[] = [
  // Living Room Items
  {
    id: 'sofa_2seater',
    name: '2-Seater Sofa',
    category: 'Furniture',
    room: 'Living Room',
    averageVolume: 2.1,
    weight: 45,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    commonSizes: {
      small: { volume: 1.8, weight: 35, description: 'Compact 2-seater' },
      medium: { volume: 2.1, weight: 45, description: 'Standard 2-seater' },
      large: { volume: 2.5, weight: 60, description: 'Large 2-seater with ottoman' }
    },
    packingMaterial: ['Moving blankets', 'Plastic wrap'],
    icon: 'bed-outline'
  },
  {
    id: 'sofa_3seater',
    name: '3-Seater Sofa',
    category: 'Furniture',
    room: 'Living Room',
    averageVolume: 3.2,
    weight: 65,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    commonSizes: {
      medium: { volume: 3.2, weight: 65, description: 'Standard 3-seater' },
      large: { volume: 3.8, weight: 85, description: 'Large sectional 3-seater' }
    },
    packingMaterial: ['Moving blankets', 'Plastic wrap'],
    icon: 'bed-outline'
  },
  {
    id: 'coffee_table',
    name: 'Coffee Table',
    category: 'Furniture',
    room: 'Living Room',
    averageVolume: 0.8,
    weight: 25,
    fragile: true,
    disassemblyRequired: false,
    specialHandling: false,
    commonSizes: {
      small: { volume: 0.5, weight: 15, description: 'Small glass/wood table' },
      medium: { volume: 0.8, weight: 25, description: 'Standard coffee table' },
      large: { volume: 1.2, weight: 40, description: 'Large marble/stone table' }
    },
    packingMaterial: ['Bubble wrap', 'Corner protectors'],
    icon: 'grid-outline'
  },
  {
    id: 'tv_55inch',
    name: '55" TV',
    category: 'Electronics',
    room: 'Living Room',
    averageVolume: 0.3,
    weight: 20,
    fragile: true,
    disassemblyRequired: false,
    specialHandling: true,
    commonSizes: {
      small: { volume: 0.2, weight: 12, description: '32-43 inch TV' },
      medium: { volume: 0.3, weight: 20, description: '55-65 inch TV' },
      large: { volume: 0.5, weight: 35, description: '75+ inch TV' }
    },
    packingMaterial: ['TV box', 'Foam padding', 'Screen protector'],
    icon: 'tv-outline'
  },
  {
    id: 'tv_stand',
    name: 'TV Stand/Entertainment Unit',
    category: 'Furniture',
    room: 'Living Room',
    averageVolume: 1.5,
    weight: 35,
    fragile: false,
    disassemblyRequired: true,
    specialHandling: false,
    packingMaterial: ['Plastic wrap', 'Hardware bag'],
    icon: 'tv-outline'
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'Furniture',
    room: 'Living Room',
    averageVolume: 1.8,
    weight: 30,
    fragile: false,
    disassemblyRequired: true,
    specialHandling: false,
    commonSizes: {
      small: { volume: 1.2, weight: 20, description: '3-4 shelf unit' },
      medium: { volume: 1.8, weight: 30, description: '5-6 shelf unit' },
      large: { volume: 2.5, weight: 45, description: 'Floor-to-ceiling unit' }
    },
    packingMaterial: ['Plastic wrap', 'Hardware bag'],
    icon: 'library-outline'
  },

  // Bedroom Items
  {
    id: 'bed_queen',
    name: 'Queen Bed',
    category: 'Furniture',
    room: 'Bedroom',
    averageVolume: 2.8,
    weight: 55,
    fragile: false,
    disassemblyRequired: true,
    specialHandling: false,
    commonSizes: {
      small: { volume: 2.2, weight: 40, description: 'Double bed' },
      medium: { volume: 2.8, weight: 55, description: 'Queen bed' },
      large: { volume: 3.5, weight: 75, description: 'King bed' }
    },
    packingMaterial: ['Mattress bag', 'Hardware bag'],
    icon: 'bed-outline'
  },
  {
    id: 'mattress_queen',
    name: 'Queen Mattress',
    category: 'Bedding',
    room: 'Bedroom',
    averageVolume: 1.5,
    weight: 35,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: true,
    commonSizes: {
      small: { volume: 1.2, weight: 25, description: 'Double mattress' },
      medium: { volume: 1.5, weight: 35, description: 'Queen mattress' },
      large: { volume: 1.8, weight: 45, description: 'King mattress' }
    },
    packingMaterial: ['Mattress bag', 'Mattress tape'],
    icon: 'bed-outline'
  },
  {
    id: 'wardrobe',
    name: 'Wardrobe/Closet',
    category: 'Furniture',
    room: 'Bedroom',
    averageVolume: 4.5,
    weight: 80,
    fragile: false,
    disassemblyRequired: true,
    specialHandling: false,
    commonSizes: {
      small: { volume: 3.0, weight: 50, description: '2-door wardrobe' },
      medium: { volume: 4.5, weight: 80, description: '3-door wardrobe' },
      large: { volume: 6.0, weight: 120, description: 'Walk-in closet components' }
    },
    packingMaterial: ['Plastic wrap', 'Hardware bag', 'Garment boxes'],
    icon: 'shirt-outline'
  },
  {
    id: 'dresser',
    name: 'Dresser/Chest of Drawers',
    category: 'Furniture',
    room: 'Bedroom',
    averageVolume: 1.8,
    weight: 45,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    commonSizes: {
      small: { volume: 1.2, weight: 30, description: '4-drawer dresser' },
      medium: { volume: 1.8, weight: 45, description: '6-drawer dresser' },
      large: { volume: 2.5, weight: 65, description: '8+ drawer chest' }
    },
    packingMaterial: ['Drawer padding', 'Plastic wrap'],
    icon: 'archive-outline'
  },

  // Kitchen Items
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'Appliances',
    room: 'Kitchen',
    averageVolume: 2.2,
    weight: 125,
    fragile: true,
    disassemblyRequired: false,
    specialHandling: true,
    commonSizes: {
      small: { volume: 1.5, weight: 80, description: 'Bar fridge/mini fridge' },
      medium: { volume: 2.2, weight: 125, description: 'Standard fridge' },
      large: { volume: 3.0, weight: 180, description: 'Double door/side-by-side' }
    },
    packingMaterial: ['Appliance dolly', 'Straps', 'Blankets'],
    icon: 'nutrition-outline'
  },
  {
    id: 'washing_machine',
    name: 'Washing Machine',
    category: 'Appliances',
    room: 'Laundry',
    averageVolume: 1.8,
    weight: 85,
    fragile: true,
    disassemblyRequired: false,
    specialHandling: true,
    commonSizes: {
      small: { volume: 1.2, weight: 60, description: 'Top loader compact' },
      medium: { volume: 1.8, weight: 85, description: 'Standard front/top loader' },
      large: { volume: 2.2, weight: 110, description: 'Large capacity washer' }
    },
    packingMaterial: ['Appliance dolly', 'Transit bolts', 'Drain hose'],
    icon: 'water-outline'
  },
  {
    id: 'dishwasher',
    name: 'Dishwasher',
    category: 'Appliances',
    room: 'Kitchen',
    averageVolume: 1.5,
    weight: 65,
    fragile: true,
    disassemblyRequired: true,
    specialHandling: true,
    packingMaterial: ['Appliance dolly', 'Drain kit', 'Brackets'],
    icon: 'restaurant-outline'
  },
  {
    id: 'microwave',
    name: 'Microwave',
    category: 'Appliances',
    room: 'Kitchen',
    averageVolume: 0.08,
    weight: 15,
    fragile: true,
    disassemblyRequired: false,
    specialHandling: false,
    commonSizes: {
      small: { volume: 0.05, weight: 10, description: 'Compact microwave' },
      medium: { volume: 0.08, weight: 15, description: 'Standard microwave' },
      large: { volume: 0.12, weight: 25, description: 'Over-range microwave' }
    },
    packingMaterial: ['Original box preferred', 'Bubble wrap'],
    icon: 'radio-outline'
  },

  // Dining Room Items
  {
    id: 'dining_table_6',
    name: '6-Seater Dining Table',
    category: 'Furniture',
    room: 'Dining Room',
    averageVolume: 2.5,
    weight: 60,
    fragile: true,
    disassemblyRequired: true,
    specialHandling: false,
    commonSizes: {
      small: { volume: 1.8, weight: 40, description: '4-seater table' },
      medium: { volume: 2.5, weight: 60, description: '6-seater table' },
      large: { volume: 3.5, weight: 90, description: '8+ seater table' }
    },
    packingMaterial: ['Table pads', 'Leg brackets', 'Corner protectors'],
    icon: 'restaurant-outline'
  },
  {
    id: 'dining_chairs',
    name: 'Dining Chairs (per chair)',
    category: 'Furniture',
    room: 'Dining Room',
    averageVolume: 0.3,
    weight: 8,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    packingMaterial: ['Chair covers', 'Stacking straps'],
    icon: 'grid-outline'
  },

  // Office Items
  {
    id: 'office_desk',
    name: 'Office Desk',
    category: 'Furniture',
    room: 'Office',
    averageVolume: 1.8,
    weight: 45,
    fragile: false,
    disassemblyRequired: true,
    specialHandling: false,
    commonSizes: {
      small: { volume: 1.2, weight: 30, description: 'Small computer desk' },
      medium: { volume: 1.8, weight: 45, description: 'Standard office desk' },
      large: { volume: 2.8, weight: 70, description: 'Executive/L-shaped desk' }
    },
    packingMaterial: ['Plastic wrap', 'Hardware bag'],
    icon: 'desktop-outline'
  },
  {
    id: 'office_chair',
    name: 'Office Chair',
    category: 'Furniture',
    room: 'Office',
    averageVolume: 0.8,
    weight: 20,
    fragile: false,
    disassemblyRequired: true,
    specialHandling: false,
    packingMaterial: ['Plastic wrap', 'Hardware bag'],
    icon: 'grid-outline'
  },
  {
    id: 'filing_cabinet',
    name: 'Filing Cabinet',
    category: 'Furniture',
    room: 'Office',
    averageVolume: 0.8,
    weight: 35,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    commonSizes: {
      small: { volume: 0.5, weight: 25, description: '2-drawer cabinet' },
      medium: { volume: 0.8, weight: 35, description: '3-4 drawer cabinet' },
      large: { volume: 1.2, weight: 50, description: 'Lateral filing cabinet' }
    },
    packingMaterial: ['Drawer locks', 'Plastic wrap'],
    icon: 'folder-outline'
  },

  // Boxes and Storage
  {
    id: 'small_box',
    name: 'Small Box (Books/Heavy Items)',
    category: 'Boxes',
    room: 'General',
    averageVolume: 0.03,
    weight: 25,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    packingMaterial: ['Packing tape', 'Bubble wrap'],
    icon: 'cube-outline'
  },
  {
    id: 'medium_box',
    name: 'Medium Box (General Items)',
    category: 'Boxes',
    room: 'General',
    averageVolume: 0.06,
    weight: 20,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    packingMaterial: ['Packing tape', 'Paper padding'],
    icon: 'cube-outline'
  },
  {
    id: 'large_box',
    name: 'Large Box (Light/Bulky Items)',
    category: 'Boxes',
    room: 'General',
    averageVolume: 0.12,
    weight: 15,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    packingMaterial: ['Packing tape', 'Paper padding'],
    icon: 'cube-outline'
  },
  {
    id: 'wardrobe_box',
    name: 'Wardrobe Box (Hanging Clothes)',
    category: 'Boxes',
    room: 'General',
    averageVolume: 0.35,
    weight: 10,
    fragile: false,
    disassemblyRequired: false,
    specialHandling: false,
    packingMaterial: ['Hanging bar', 'Packing tape'],
    icon: 'shirt-outline'
  },

  // Miscellaneous Large Items
  {
    id: 'piano_upright',
    name: 'Upright Piano',
    category: 'Musical Instruments',
    room: 'Living Room',
    averageVolume: 3.5,
    weight: 250,
    fragile: true,
    disassemblyRequired: false,
    specialHandling: true,
    packingMaterial: ['Piano board', 'Straps', 'Blankets', 'Specialist crew'],
    icon: 'musical-notes-outline'
  },
  {
    id: 'treadmill',
    name: 'Treadmill/Exercise Equipment',
    category: 'Exercise Equipment',
    room: 'General',
    averageVolume: 2.2,
    weight: 120,
    fragile: true,
    disassemblyRequired: true,
    specialHandling: true,
    packingMaterial: ['Original box preferred', 'Foam padding'],
    icon: 'fitness-outline'
  },
];

// Vehicle capacity definitions based on volume and weight
export const VEHICLE_CAPACITIES = {
  'bakkie_1.5ton': {
    name: '1.5 Ton Bakkie',
    maxVolume: 8.5, // cubic meters
    maxWeight: 1500, // kg
    suitableFor: ['studio', '1bedroom'],
    description: 'Perfect for small apartments and studio moves'
  },
  'truck_3ton': {
    name: '3 Ton Truck',
    maxVolume: 18, // cubic meters
    maxWeight: 3000, // kg
    suitableFor: ['1bedroom', '2bedroom'],
    description: 'Ideal for 1-2 bedroom apartments'
  },
  'truck_5ton': {
    name: '5 Ton Truck',
    maxVolume: 28, // cubic meters
    maxWeight: 5000, // kg
    suitableFor: ['2bedroom', '3bedroom'],
    description: 'Great for 2-3 bedroom houses'
  },
  'truck_8ton': {
    name: '8 Ton Truck',
    maxVolume: 42, // cubic meters
    maxWeight: 8000, // kg
    suitableFor: ['3bedroom', '4bedroom'],
    description: 'Perfect for 3-4 bedroom houses'
  },
  'truck_10ton': {
    name: '10 Ton Truck',
    maxVolume: 55, // cubic meters
    maxWeight: 10000, // kg
    suitableFor: ['4bedroom', '5bedroom'],
    description: 'Ideal for large 4+ bedroom houses'
  },
  'multiple_trucks': {
    name: 'Multiple Trucks',
    maxVolume: 100, // cubic meters
    maxWeight: 20000, // kg
    suitableFor: ['5bedroom', 'office'],
    description: 'For very large moves requiring multiple vehicles'
  }
};

// Property type defaults for quick setup
export const PROPERTY_DEFAULTS = {
  studio: [
    { itemId: 'bed_queen', quantity: 1, size: 'small' },
    { itemId: 'mattress_queen', quantity: 1, size: 'small' },
    { itemId: 'dresser', quantity: 1, size: 'small' },
    { itemId: 'tv_55inch', quantity: 1, size: 'small' },
    { itemId: 'microwave', quantity: 1, size: 'small' },
    { itemId: 'small_box', quantity: 10 },
    { itemId: 'medium_box', quantity: 5 },
    { itemId: 'wardrobe_box', quantity: 2 },
  ],
  '1bedroom': [
    { itemId: 'bed_queen', quantity: 1, size: 'medium' },
    { itemId: 'mattress_queen', quantity: 1, size: 'medium' },
    { itemId: 'wardrobe', quantity: 1, size: 'small' },
    { itemId: 'dresser', quantity: 1, size: 'medium' },
    { itemId: 'sofa_2seater', quantity: 1, size: 'medium' },
    { itemId: 'coffee_table', quantity: 1, size: 'small' },
    { itemId: 'tv_55inch', quantity: 1, size: 'medium' },
    { itemId: 'tv_stand', quantity: 1 },
    { itemId: 'refrigerator', quantity: 1, size: 'small' },
    { itemId: 'washing_machine', quantity: 1, size: 'small' },
    { itemId: 'microwave', quantity: 1, size: 'medium' },
    { itemId: 'small_box', quantity: 15 },
    { itemId: 'medium_box', quantity: 10 },
    { itemId: 'large_box', quantity: 5 },
    { itemId: 'wardrobe_box', quantity: 3 },
  ],
  '2bedroom': [
    { itemId: 'bed_queen', quantity: 2, size: 'medium' },
    { itemId: 'mattress_queen', quantity: 2, size: 'medium' },
    { itemId: 'wardrobe', quantity: 2, size: 'medium' },
    { itemId: 'dresser', quantity: 2, size: 'medium' },
    { itemId: 'sofa_3seater', quantity: 1, size: 'medium' },
    { itemId: 'coffee_table', quantity: 1, size: 'medium' },
    { itemId: 'dining_table_6', quantity: 1, size: 'small' },
    { itemId: 'dining_chairs', quantity: 4 },
    { itemId: 'tv_55inch', quantity: 1, size: 'medium' },
    { itemId: 'tv_stand', quantity: 1 },
    { itemId: 'bookshelf', quantity: 1, size: 'medium' },
    { itemId: 'refrigerator', quantity: 1, size: 'medium' },
    { itemId: 'washing_machine', quantity: 1, size: 'medium' },
    { itemId: 'dishwasher', quantity: 1 },
    { itemId: 'microwave', quantity: 1, size: 'medium' },
    { itemId: 'small_box', quantity: 20 },
    { itemId: 'medium_box', quantity: 15 },
    { itemId: 'large_box', quantity: 8 },
    { itemId: 'wardrobe_box', quantity: 4 },
  ],
  '3bedroom': [
    { itemId: 'bed_queen', quantity: 3, size: 'medium' },
    { itemId: 'mattress_queen', quantity: 3, size: 'medium' },
    { itemId: 'wardrobe', quantity: 3, size: 'medium' },
    { itemId: 'dresser', quantity: 3, size: 'medium' },
    { itemId: 'sofa_3seater', quantity: 1, size: 'large' },
    { itemId: 'sofa_2seater', quantity: 1, size: 'medium' },
    { itemId: 'coffee_table', quantity: 1, size: 'medium' },
    { itemId: 'dining_table_6', quantity: 1, size: 'medium' },
    { itemId: 'dining_chairs', quantity: 6 },
    { itemId: 'tv_55inch', quantity: 2, size: 'medium' },
    { itemId: 'tv_stand', quantity: 1 },
    { itemId: 'bookshelf', quantity: 2, size: 'medium' },
    { itemId: 'office_desk', quantity: 1, size: 'medium' },
    { itemId: 'office_chair', quantity: 1 },
    { itemId: 'refrigerator', quantity: 1, size: 'medium' },
    { itemId: 'washing_machine', quantity: 1, size: 'medium' },
    { itemId: 'dishwasher', quantity: 1 },
    { itemId: 'microwave', quantity: 1, size: 'medium' },
    { itemId: 'small_box', quantity: 30 },
    { itemId: 'medium_box', quantity: 20 },
    { itemId: 'large_box', quantity: 12 },
    { itemId: 'wardrobe_box', quantity: 6 },
  ],
  '4bedroom': [
    { itemId: 'bed_queen', quantity: 4, size: 'medium' },
    { itemId: 'mattress_queen', quantity: 4, size: 'medium' },
    { itemId: 'wardrobe', quantity: 4, size: 'large' },
    { itemId: 'dresser', quantity: 4, size: 'medium' },
    { itemId: 'sofa_3seater', quantity: 1, size: 'large' },
    { itemId: 'sofa_2seater', quantity: 2, size: 'medium' },
    { itemId: 'coffee_table', quantity: 2, size: 'medium' },
    { itemId: 'dining_table_6', quantity: 1, size: 'large' },
    { itemId: 'dining_chairs', quantity: 8 },
    { itemId: 'tv_55inch', quantity: 3, size: 'large' },
    { itemId: 'tv_stand', quantity: 2 },
    { itemId: 'bookshelf', quantity: 3, size: 'large' },
    { itemId: 'office_desk', quantity: 1, size: 'large' },
    { itemId: 'office_chair', quantity: 2 },
    { itemId: 'filing_cabinet', quantity: 1, size: 'medium' },
    { itemId: 'refrigerator', quantity: 1, size: 'large' },
    { itemId: 'washing_machine', quantity: 1, size: 'medium' },
    { itemId: 'dishwasher', quantity: 1 },
    { itemId: 'microwave', quantity: 1, size: 'medium' },
    { itemId: 'small_box', quantity: 40 },
    { itemId: 'medium_box', quantity: 25 },
    { itemId: 'large_box', quantity: 15 },
    { itemId: 'wardrobe_box', quantity: 8 },
  ],
};

export const getItemById = (id: string): MovingItem | undefined => {
  return MOVING_ITEMS.find(item => item.id === id);
};

export const getItemsByRoom = (room: string): MovingItem[] => {
  return MOVING_ITEMS.filter(item => item.room === room || item.room === 'General');
};

export const getItemsByCategory = (category: string): MovingItem[] => {
  return MOVING_ITEMS.filter(item => item.category === category);
};

export const calculateVehicleRequirement = (selectedItems: Array<{itemId: string, quantity: number, size?: string}>): string => {
  let totalVolume = 0;
  let totalWeight = 0;

  selectedItems.forEach(({ itemId, quantity, size }) => {
    const item = getItemById(itemId);
    if (item) {
      let itemVolume = item.averageVolume;
      let itemWeight = item.weight;

      // Adjust for size if specified
      if (size && item.commonSizes?.[size as keyof typeof item.commonSizes]) {
        const sizeData = item.commonSizes[size as keyof typeof item.commonSizes];
        if (sizeData) {
          itemVolume = sizeData.volume;
          itemWeight = sizeData.weight;
        }
      }

      totalVolume += itemVolume * quantity;
      totalWeight += itemWeight * quantity;
    }
  });

  // Find the most suitable vehicle
  for (const [vehicleId, capacity] of Object.entries(VEHICLE_CAPACITIES)) {
    if (totalVolume <= capacity.maxVolume && totalWeight <= capacity.maxWeight) {
      return vehicleId;
    }
  }

  return 'multiple_trucks';
};
