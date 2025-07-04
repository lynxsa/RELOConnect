import { API_BASE_URL } from '../utils/constants';
import { ErrorHandler, ErrorCodes } from '../utils/errorHandler';
import { 
  VehicleClass, 
  DistanceBand, 
  ExtraService, 
  PriceEstimateRequest, 
  PriceEstimateResponse
} from '../types';

/**
 * Fetch all vehicle classes
 */
export async function fetchVehicleClasses(): Promise<VehicleClass[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/vehicle-classes`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(ErrorCodes.NOT_FOUND_ERROR);
      }
      if (response.status >= 500) {
        throw new Error(ErrorCodes.SERVER_ERROR);
      }
      throw new Error('Failed to fetch vehicle classes');
    }
    
    return await response.json();
  } catch (error) {
    const appError = ErrorHandler.handleApiError(error, 'fetchVehicleClasses');
    throw new Error(appError.message);
  }
}

/**
 * Fetch all distance bands
 */
export async function fetchDistanceBands(): Promise<DistanceBand[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/distance-bands`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(ErrorCodes.NOT_FOUND_ERROR);
      }
      if (response.status >= 500) {
        throw new Error(ErrorCodes.SERVER_ERROR);
      }
      throw new Error('Failed to fetch distance bands');
    }
    
    return await response.json();
  } catch (error) {
    const appError = ErrorHandler.handleApiError(error, 'fetchDistanceBands');
    throw new Error(appError.message);
  }
}

/**
 * Fetch all extra services
 */
export async function fetchExtraServices(): Promise<ExtraService[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/extra-services`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(ErrorCodes.NOT_FOUND_ERROR);
      }
      if (response.status >= 500) {
        throw new Error(ErrorCodes.SERVER_ERROR);
      }
      throw new Error('Failed to fetch extra services');
    }
    
    return await response.json();
  } catch (error) {
    const appError = ErrorHandler.handleApiError(error, 'fetchExtraServices');
    throw new Error(appError.message);
  }
}

/**
 * Fetch the complete price table
 */
export async function fetchPriceTable(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/price-table`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price table');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching price table:', error);
    throw error;
  }
}

/**
 * Calculate a price estimate
 */
export async function calculatePriceEstimate(request: PriceEstimateRequest): Promise<PriceEstimateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle custom quote requirements
      if (errorData.requiresCustomQuote) {
        throw new Error('This distance requires a custom quote. Please contact our support team.');
      }
      
      if (response.status === 400) {
        throw new Error(ErrorCodes.VALIDATION_ERROR);
      }
      if (response.status === 404) {
        throw new Error(ErrorCodes.NOT_FOUND_ERROR);
      }
      if (response.status >= 500) {
        throw new Error(ErrorCodes.SERVER_ERROR);
      }
      
      throw new Error(errorData.error || 'Failed to calculate price estimate');
    }
    
    return await response.json();
  } catch (error) {
    const appError = ErrorHandler.handleApiError(error, 'calculatePriceEstimate');
    throw new Error(appError.message);
  }
}

/**
 * Update a pricing rate (admin only)
 */
export async function updatePricingRate(rateId: string, baseFare: number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/rates/${rateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ baseFare }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update pricing rate');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating pricing rate:', error);
    throw error;
  }
}
