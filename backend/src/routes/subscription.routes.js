import express from 'express';
import { body, validationResult } from 'express-validator';
import stripe from 'stripe';
import User from '../models/user.model.js';
import { auth } from '../middleware/auth.middleware.js';

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        maxWebsites: 1,
        features: [
          'Basic tag auditing',
          'Manual fixes',
          'Weekly audits'
        ]
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 29,
        maxWebsites: 5,
        features: [
          'Advanced tag auditing',
          'Automatic fixes',
          'Daily audits',
          'Email notifications'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 99,
        maxWebsites: 20,
        features: [
          'All Basic features',
          'Priority support',
          'Custom audit schedules',
          'API access'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299,
        maxWebsites: 100,
        features: [
          'All Premium features',
          'Dedicated support',
          'Custom integrations',
          'White-label reports'
        ]
      }
    ];

    res.json({ plans });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subscription plans' });
  }
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    res.json({ subscription: req.user.subscription });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subscription status' });
  }
});

// Create subscription
router.post('/create', 
  auth,
  [
    body('planId').isIn(['free', 'basic', 'premium', 'enterprise'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { planId } = req.body;

      // Find user by ID and update subscription
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user's subscription
      user.subscription = {
        plan: planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      // Update max websites based on plan
      const maxWebsites = {
        free: 1,
        basic: 5,
        premium: 20,
        enterprise: 100
      };
      user.maxWebsites = maxWebsites[planId];

      // Save the updated user
      await user.save();

      console.log('Subscription created:', {
        userId: user._id,
        plan: planId,
        status: 'active'
      });

      res.json({ 
        message: 'Subscription created successfully',
        subscription: user.subscription 
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Error creating subscription' });
    }
  }
);

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    req.user.subscription.status = 'cancelled';
    await req.user.save();
    res.json({ subscription: req.user.subscription });
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling subscription' });
  }
});

// Update subscription
router.post('/update',
  auth,
  [
    body('planId').isIn(['free', 'basic', 'premium', 'enterprise'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { planId } = req.body;

      // Update user's subscription
      req.user.subscription = {
        ...req.user.subscription,
        plan: planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      // Update max websites based on plan
      const maxWebsites = {
        free: 1,
        basic: 5,
        premium: 20,
        enterprise: 100
      };
      req.user.maxWebsites = maxWebsites[planId];

      await req.user.save();

      res.json({ subscription: req.user.subscription });
    } catch (error) {
      res.status(500).json({ error: 'Error updating subscription' });
    }
  }
);

export default router; 