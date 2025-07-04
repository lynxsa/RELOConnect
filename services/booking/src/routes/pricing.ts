import express from 'express';
import { Request, Response } from 'express';
import { PricingRequest, PricingResponse, VEHICLE_CLASSES, APP_CONFIG } from '@reloconnect/shared';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * POST /pricing/calculate
 * Calculate pricing for a booking request
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { distanceKm, vehicleClassId, extraServices, scheduledDateTime }: PricingRequest = req.body;

    // Validate input
    if (!distanceKm || !vehicleClassId || !extraServices) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: distanceKm, vehicleClassId, extraServices'
      });
    }

    if (distanceKm < APP_CONFIG.MIN_BOOKING_DISTANCE || distanceKm > APP_CONFIG.MAX_BOOKING_DISTANCE) {
      return res.status(400).json({
        success: false,
        error: `Distance must be between ${APP_CONFIG.MIN_BOOKING_DISTANCE}km and ${APP_CONFIG.MAX_BOOKING_DISTANCE}km`
      });
    }

    // Get vehicle class details
    const vehicleClass = Object.values(VEHICLE_CLASSES).find(vc => vc.id === vehicleClassId);
    if (!vehicleClass) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle class ID'
      });
    }

    // Calculate base fare
    const baseFare = vehicleClass.basePrice;
    
    // Calculate distance fare
    const distanceFare = distanceKm * vehicleClass.pricePerKm;

    // Calculate extra services fees
    let extrasFees = 0;
    const extraBreakdown: Array<{ item: string; amount: number; description: string }> = [];

    if (extraServices.loading) {
      const loadingFee = 50;
      extrasFees += loadingFee;
      extraBreakdown.push({
        item: 'Loading/Unloading',
        amount: loadingFee,
        description: 'Professional loading and unloading service'
      });
    }

    if (extraServices.stairs > 0) {
      const stairsFee = extraServices.stairs * 25;
      extrasFees += stairsFee;
      extraBreakdown.push({
        item: 'Stairs',
        amount: stairsFee,
        description: `${extraServices.stairs} flights of stairs`
      });
    }

    if (extraServices.packing) {
      const packingFee = 100;
      extrasFees += packingFee;
      extraBreakdown.push({
        item: 'Packing Materials',
        amount: packingFee,
        description: 'Boxes, bubble wrap, and packing materials'
      });
    }

    if (extraServices.cleaning) {
      const cleaningFee = 150;
      extrasFees += cleaningFee;
      extraBreakdown.push({
        item: 'Post-Move Cleaning',
        amount: cleaningFee,
        description: 'Professional cleaning after move'
      });
    }

    if (extraServices.express) {
      const expressFee = Math.round((baseFare + distanceFare) * 0.25); // 25% surcharge
      extrasFees += expressFee;
      extraBreakdown.push({
        item: 'Express Service',
        amount: expressFee,
        description: 'Priority booking and faster delivery'
      });
    }

    // Calculate surge pricing for peak times
    let surgeFactor = 1;
    const bookingDate = new Date(scheduledDateTime);
    const hour = bookingDate.getHours();
    const dayOfWeek = bookingDate.getDay();

    // Peak hours: 7-9 AM and 5-7 PM on weekdays
    if ((dayOfWeek >= 1 && dayOfWeek <= 5) && 
        ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))) {
      surgeFactor = 1.2; // 20% surge
    }

    // Weekend surge
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      surgeFactor = Math.max(surgeFactor, 1.15); // 15% weekend surge
    }

    const basePlusDistance = (baseFare + distanceFare) * surgeFactor;

    // Calculate insurance (optional)
    let insurance = 0;
    if (extraServices.insurance) {
      insurance = Math.round(basePlusDistance * APP_CONFIG.INSURANCE_RATE);
    }

    // Calculate subtotal
    const subtotal = basePlusDistance + extrasFees + insurance;

    // Calculate tax
    const tax = Math.round(subtotal * APP_CONFIG.TAX_RATE);

    // Calculate total
    const total = subtotal + tax;

    // Build breakdown
    const breakdown = [
      {
        item: 'Base Fare',
        amount: Math.round(baseFare * surgeFactor),
        description: `${vehicleClass.name} base rate${surgeFactor > 1 ? ` (${Math.round((surgeFactor - 1) * 100)}% surge)` : ''}`
      },
      {
        item: 'Distance',
        amount: Math.round(distanceFare * surgeFactor),
        description: `${distanceKm}km at R${vehicleClass.pricePerKm}/km${surgeFactor > 1 ? ` (${Math.round((surgeFactor - 1) * 100)}% surge)` : ''}`
      },
      ...extraBreakdown,
    ];

    if (insurance > 0) {
      breakdown.push({
        item: 'Insurance',
        amount: insurance,
        description: `${APP_CONFIG.INSURANCE_RATE * 100}% of subtotal`
      });
    }

    breakdown.push({
      item: 'VAT',
      amount: tax,
      description: `${APP_CONFIG.TAX_RATE * 100}% tax`
    });

    const response: PricingResponse = {
      baseFare: Math.round(baseFare * surgeFactor),
      distanceFare: Math.round(distanceFare * surgeFactor),
      extrasFees,
      insurance,
      tax,
      total,
      breakdown
    };

    logger.info(`Pricing calculated for ${vehicleClassId}, ${distanceKm}km: R${total}`);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Pricing calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /pricing/vehicle-classes
 * Get available vehicle classes with pricing
 */
router.get('/vehicle-classes', (req: Request, res: Response) => {
  try {
    const vehicleClasses = Object.values(VEHICLE_CLASSES).map(vc => ({
      ...vc,
      description: `Suitable for moves up to ${vc.capacity}`,
      estimatedPrice: `From R${vc.basePrice} + R${vc.pricePerKm}/km`
    }));

    res.json({
      success: true,
      data: vehicleClasses
    });
  } catch (error) {
    logger.error('Vehicle classes fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /pricing/estimate
 * Quick pricing estimate without full booking details
 */
router.post('/estimate', (req: Request, res: Response) => {
  try {
    const { distanceKm, vehicleClassId } = req.body;

    if (!distanceKm || !vehicleClassId) {
      return res.status(400).json({
        success: false,
        error: 'Distance and vehicle class are required'
      });
    }

    const vehicleClass = Object.values(VEHICLE_CLASSES).find(vc => vc.id === vehicleClassId);
    if (!vehicleClass) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle class ID'
      });
    }

    const baseFare = vehicleClass.basePrice;
    const distanceFare = distanceKm * vehicleClass.pricePerKm;
    const subtotal = baseFare + distanceFare;
    const tax = Math.round(subtotal * APP_CONFIG.TAX_RATE);
    const total = subtotal + tax;

    res.json({
      success: true,
      data: {
        estimatedTotal: total,
        breakdown: [
          { item: 'Base fare', amount: baseFare },
          { item: 'Distance', amount: distanceFare },
          { item: 'VAT', amount: tax }
        ],
        note: 'Estimate excludes extra services and surge pricing'
      }
    });

  } catch (error) {
    logger.error('Pricing estimate error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as pricingRoutes };
