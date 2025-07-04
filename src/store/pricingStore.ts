import { create } from 'zustand';
import { 
  VehicleClass, 
  DistanceBand, 
  ExtraService, 
  PriceBreakdown, 
  ExtraServices 
} from '../types';

interface PricingState {
  // Data
  vehicleClasses: VehicleClass[];
  distanceBands: DistanceBand[];
  extraServices: ExtraService[];
  
  // Current selection
  selectedVehicleClassId: string | null;
  distance: number | null;
  extraServiceSelections: ExtraServices;
  priceBreakdown: PriceBreakdown | null;
  
  // Loading states
  isLoadingVehicleClasses: boolean;
  isLoadingPriceEstimate: boolean;
  error: string | null;
  
  // Actions
  setVehicleClasses: (classes: VehicleClass[]) => void;
  setDistanceBands: (bands: DistanceBand[]) => void;
  setExtraServices: (services: ExtraService[]) => void;
  selectVehicleClass: (id: string) => void;
  setDistance: (distance: number) => void;
  toggleExtraService: (service: keyof ExtraServices, value?: any) => void;
  setPriceBreakdown: (breakdown: PriceBreakdown | null) => void;
  setLoadingVehicleClasses: (isLoading: boolean) => void;
  setLoadingPriceEstimate: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetPricingState: () => void;
}

const defaultExtraServices: ExtraServices = {
  loading: false,
  loadingPeople: 1,
  stairs: 0,
  packing: false,
  cleaning: false,
  express: false,
  insurance: false,
  insuranceValue: 5000,
  waitingTime: 0
};

export const usePricingStore = create<PricingState>((set) => ({
  // Initial state
  vehicleClasses: [],
  distanceBands: [],
  extraServices: [],
  selectedVehicleClassId: null,
  distance: null,
  extraServiceSelections: { ...defaultExtraServices },
  priceBreakdown: null,
  isLoadingVehicleClasses: false,
  isLoadingPriceEstimate: false,
  error: null,
  
  // Actions
  setVehicleClasses: (classes: VehicleClass[]) => set({ vehicleClasses: classes }),
  setDistanceBands: (bands: DistanceBand[]) => set({ distanceBands: bands }),
  setExtraServices: (services: ExtraService[]) => set({ extraServices: services }),
  
  selectVehicleClass: (id: string) => set({ selectedVehicleClassId: id }),
  
  setDistance: (distance: number) => set({ distance }),
  
  toggleExtraService: (service: keyof ExtraServices, value?: any) => set((state: PricingState) => {
    const newSelections = { ...state.extraServiceSelections };
    
    if (value !== undefined) {
      // TypeScript fix for indexing with keyof
      (newSelections as any)[service] = value;
    } else if (typeof (newSelections as any)[service] === 'boolean') {
      (newSelections as any)[service] = !(newSelections as any)[service];
    }
    
    return { extraServiceSelections: newSelections };
  }),
  
  setPriceBreakdown: (breakdown: PriceBreakdown | null) => set({ priceBreakdown: breakdown }),
  
  setLoadingVehicleClasses: (isLoading: boolean) => set({ isLoadingVehicleClasses: isLoading }),
  setLoadingPriceEstimate: (isLoading: boolean) => set({ isLoadingPriceEstimate: isLoading }),
  
  setError: (error: string | null) => set({ error }),
  
  resetPricingState: () => set({
    selectedVehicleClassId: null,
    distance: null,
    extraServiceSelections: { ...defaultExtraServices },
    priceBreakdown: null,
    error: null
  })
}));
