import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import driverPayoutService from '../services/driverPayoutService';
import { authMiddleware } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for payout operations
const payoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many payout requests, please try again later',
});

// Rate limiting for account creation
const accountCreationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many account creation attempts, please try again later',
});

/**
 * @route POST /api/driver-payouts/create-account
 * @desc Create Stripe Connect account for driver
 * @access Private (Driver only)
 */
router.post('/create-account', 
  accountCreationLimit,
  authMiddleware,
  [
    body('email').isEmail().normalizeEmail(),
    body('country').isLength({ min: 2, max: 2 }).toUpperCase(),
    body('businessType').isIn(['individual', 'company']),
    body('bankAccount.accountNumber').notEmpty().trim(),
    body('bankAccount.currency').isLength({ min: 3, max: 3 }).toUpperCase(),
    body('personalInfo.firstName').notEmpty().trim().escape(),
    body('personalInfo.lastName').notEmpty().trim().escape(),
    body('personalInfo.dateOfBirth.day').isInt({ min: 1, max: 31 }),
    body('personalInfo.dateOfBirth.month').isInt({ min: 1, max: 12 }),
    body('personalInfo.dateOfBirth.year').isInt({ min: 1900, max: new Date().getFullYear() - 18 }),
    body('personalInfo.address.line1').notEmpty().trim().escape(),
    body('personalInfo.address.city').notEmpty().trim().escape(),
    body('personalInfo.address.state').notEmpty().trim().escape(),
    body('personalInfo.address.postalCode').notEmpty().trim(),
    body('personalInfo.address.country').isLength({ min: 2, max: 2 }).toUpperCase(),
    body('personalInfo.phone').isMobilePhone('any'),
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      // Ensure the user is a driver
      if (req.user?.role !== 'DRIVER') {
        return res.status(403).json({
          success: false,
          message: 'Only drivers can create payout accounts',
        });
      }

      const accountData = {
        driverId: req.user.id || req.user.userId,
        ...req.body,
      };

      const account = await driverPayoutService.createDriverAccount(accountData);

      return res.status(201).json({
        success: true,
        message: 'Driver account created successfully',
        data: account,
      });

    } catch (error) {
      console.error('Create driver account error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create driver account',
      });
    }
  }
);

/**
 * @route GET /api/driver-payouts/account-link  
 * @desc Generate account onboarding link for driver
 * @access Private (Driver only)
 */
router.get('/account-link',
  authMiddleware,
  async (req: any, res: any) => {
    try {
      if (req.user?.role !== 'DRIVER') {
        return res.status(403).json({
          success: false,
          message: 'Only drivers can access account links',
        });
      }

      const accountLink = await driverPayoutService.createAccountLink(req.user.id || req.user.userId);

      return res.json({
        success: true,
        message: 'Account link generated successfully',
        data: { url: accountLink },
      });

    } catch (error) {
      console.error('Create account link error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create account link',
      });
    }
  }
);

/**
 * @route POST /api/driver-payouts/request-payout
 * @desc Request a payout
 * @access Private (Driver only)
 */
router.post('/request-payout',
  payoutRateLimit,
  authMiddleware,
  [
    body('amount').isFloat({ min: 1 }).toFloat(),
    body('currency').isLength({ min: 3, max: 3 }).toUpperCase(),
    body('description').optional().trim().escape(),
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      if (req.user?.role !== 'DRIVER') {
        return res.status(403).json({
          success: false,
          message: 'Only drivers can request payouts',
        });
      }

      const payoutData = {
        driverId: req.user.id || req.user.userId,
        ...req.body,
      };

      const payout = await driverPayoutService.processPayout(payoutData);

      return res.status(201).json({
        success: true,
        message: 'Payout requested successfully',
        data: payout,
      });

    } catch (error) {
      console.error('Request payout error:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to request payout',
      });
    }
  }
);

export default router;
