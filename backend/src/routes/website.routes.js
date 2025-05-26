const express = require('express');
const { body, validationResult } = require('express-validator');
const Website = require('../models/website.model');
const { auth, subscriptionCheck } = require('../middleware/auth.middleware');
const { generateVerificationCode } = require('../utils/verification');
const normalizeUrl = require('normalize-url');

const router = express.Router();

// Get all websites for current user
router.get('/', auth, async (req, res) => {
  try {
    const websites = await Website.find({ owner: req.user._id });
    res.json({ websites });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching websites' });
  }
});

// Add new website
router.post('/',
  auth,
  subscriptionCheck,
  [
    body('url').isURL().customSanitizer(value => normalizeUrl(value)),
    body('name').trim().notEmpty(),
    body('platform').isIn(['custom', 'shopify', 'woocommerce', 'wordpress', 'magento'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check website limit based on subscription
      const websiteCount = await Website.countDocuments({ owner: req.user._id });
      if (websiteCount >= req.user.maxWebsites) {
        return res.status(403).json({
          error: 'Website limit reached for your subscription plan'
        });
      }

      const { url, name, platform } = req.body;

      // Check if website already exists for user
      const existingWebsite = await Website.findOne({
        url,
        owner: req.user._id
      });

      if (existingWebsite) {
        return res.status(400).json({ error: 'Website already added' });
      }

      // Generate verification code
      const verificationCode = generateVerificationCode();

      const website = new Website({
        url,
        name,
        platform,
        owner: req.user._id,
        authentication: {
          verificationCode,
          verificationMethod: 'meta_tag'
        }
      });

      await website.save();

      res.status(201).json({ website });
    } catch (error) {
      res.status(500).json({ error: 'Error adding website' });
    }
  }
);

// Get website details
router.get('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({ website });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching website' });
  }
});

// Update website settings
router.patch('/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('settings.autoFix').optional().isBoolean(),
    body('settings.notificationEmail').optional().isEmail(),
    body('settings.auditFrequency').optional().isIn(['daily', 'weekly', 'monthly'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const website = await Website.findOne({
        _id: req.params.id,
        owner: req.user._id
      });

      if (!website) {
        return res.status(404).json({ error: 'Website not found' });
      }

      const updates = Object.keys(req.body);
      const allowedUpdates = ['name', 'settings'];
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
      }

      updates.forEach(update => {
        if (update === 'settings') {
          website.settings = {
            ...website.settings,
            ...req.body.settings
          };
        } else {
          website[update] = req.body[update];
        }
      });

      await website.save();
      res.json({ website });
    } catch (error) {
      res.status(400).json({ error: 'Error updating website' });
    }
  }
);

// Delete website
router.delete('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting website' });
  }
});

// Verify website ownership
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // TODO: Implement verification logic based on the verification method
    // This would involve checking for the meta tag, file, or DNS record

    website.authentication.status = 'verified';
    website.authentication.verificationDate = new Date();
    await website.save();

    res.json({ message: 'Website verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying website' });
  }
});

module.exports = router; 