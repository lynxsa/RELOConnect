import { fetchVehicleClasses, fetchExtraServices, calculatePriceEstimate } from '../../src/services/pricingService';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('PricingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchVehicleClasses', () => {
    it('fetches vehicle classes successfully', async () => {
      const mockVehicleClasses = [
        {
          id: 'small-van',
          name: 'Small Van',
          description: 'Perfect for 1-2 bedroom moves',
          capacity: '3-4 cubic meters',
          baseRate: 15,
          icon: '🚐',
        },
        {
          id: 'medium-truck',
          name: 'Medium Truck',
          description: 'Ideal for 2-3 bedroom moves',
          capacity: '5-8 cubic meters',
          baseRate: 25,
          icon: '🚚',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockVehicleClasses,
      });

      const result = await fetchVehicleClasses();
      
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pricing/vehicle-classes'));
      expect(result).toEqual(mockVehicleClasses);
    });

    it('handles fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchVehicleClasses()).rejects.toThrow('Failed to fetch vehicle classes');
    });
  });

  describe('fetchExtraServices', () => {
    it('fetches extra services successfully', async () => {
      const mockExtraServices = [
        {
          id: 'loading',
          name: 'Loading Service',
          description: 'Professional loading and unloading',
          basePrice: 50,
          priceType: 'fixed',
        },
        {
          id: 'packing',
          name: 'Packing Service',
          description: 'Professional packing materials and service',
          basePrice: 100,
          priceType: 'fixed',
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExtraServices,
      });

      const result = await fetchExtraServices();
      
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/pricing/extra-services'));
      expect(result).toEqual(mockExtraServices);
    });
  });

  describe('calculatePriceEstimate', () => {
    it('calculates price estimate successfully', async () => {
      const mockPriceEstimate = {
        vehicleClass: 'small-van',
        distance: 50,
        baseFare: 750,
        extraServices: [],
        extraServicesTotal: 0,
        subtotal: 750,
        vat: 112.5,
        total: 862.5,
        breakdown: {
          baseFare: 750,
          extraServices: 0,
          vat: 112.5,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPriceEstimate,
      });

      const request = {
        distance: 50,
        vehicleClassId: 'small-van',
        extraServices: {
          loading: false,
          stairs: 0,
          packing: false,
          cleaning: false,
          express: false,
          insurance: false,
        },
      };

      const result = await calculatePriceEstimate(request);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pricing/estimate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );
      expect(result).toEqual(mockPriceEstimate);
    });

    it('handles custom quote requirement', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ requiresCustomQuote: true }),
      });

      const request = {
        distance: 1000, // Long distance
        vehicleClassId: 'large-truck',
        extraServices: {
          loading: false,
          stairs: 0,
          packing: false,
          cleaning: false,
          express: false,
          insurance: false,
        },
      };

      await expect(calculatePriceEstimate(request)).rejects.toThrow(
        'This distance requires a custom quote. Please contact our support team.'
      );
    });
  });
});
