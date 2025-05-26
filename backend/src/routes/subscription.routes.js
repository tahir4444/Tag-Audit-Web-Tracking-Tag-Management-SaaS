const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const { auth } = require('../middleware/auth.middleware');

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

// Create subscription
router.post('/create',
  auth,
  [
    body('planId').isIn(['free', 'basic', 'premium', 'enterprise']),
    body('paymentMethodId').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { planId, paymentMethodId } = req.body;

      // Handle free plan
      if (planId === 'free') {
        req.user.subscription = {
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: null
        };
        await req.user.save();
        return res.json({ subscription: req.user.subscription });
      }

      // Handle paid plans
      if (!paymentMethodId) {
        return res.status(400).json({ error: 'Payment method required for paid plans' });
      }

      // Create or get Stripe customer
      let customer;
      if (req.user.subscription.stripeCustomerId) {
        customer = await stripe.customers.retrieve(req.user.subscription.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: req.user.email,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`] }],
        expand: ['latest_invoice.payment_intent']
      });

      // Update user subscription
      req.user.subscription = {
        plan: planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(subscription.current_period_end * 1000),
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id
      };

      await req.user.save();

      res.json({ subscription: req.user.subscription });
    } catch (error) {
      res.status(500).json({ error: 'Error creating subscription' });
    }
  }
);

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    if (!req.user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription to cancel' });
    }

    // Cancel Stripe subscription
    await stripe.subscriptions.del(req.user.subscription.stripeSubscriptionId);

    // Update user subscription
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

      if (!req.user.subscription.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No active subscription to update' });
      }

      // Update Stripe subscription
      await stripe.subscriptions.update(req.user.subscription.stripeSubscriptionId, {
        items: [{ price: process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`] }]
      });

      // Update user subscription
      req.user.subscription.plan = planId;
      await req.user.save();

      res.json({ subscription: req.user.subscription });
    } catch (error) {
      res.status(500).json({ error: 'Error updating subscription' });
    }
  }
);

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    if (req.user.subscription.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        req.user.subscription.stripeSubscriptionId
      );
      req.user.subscription.status = subscription.status;
      await req.user.save();
    }

    res.json({ subscription: req.user.subscription });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subscription status' });
  }
});

module.exports = router; 