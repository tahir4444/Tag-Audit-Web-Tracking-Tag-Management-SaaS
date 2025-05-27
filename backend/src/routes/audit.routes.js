import express from 'express';
import { body, validationResult } from 'express-validator';
import Website from '../models/website.model.js';
import { auth, subscriptionCheck } from '../middleware/auth.middleware.js';
import { performAudit } from '../services/audit.service.js';

const router = express.Router();

// Get all audits for a website
router.get('/website/:websiteId', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.websiteId,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({ audits: website.lastAudit });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching audits' });
  }
});

// Start a new audit
router.post('/website/:websiteId/start',
  auth,
  subscriptionCheck,
  async (req, res) => {
    try {
      const website = await Website.findOne({
        _id: req.params.websiteId,
        owner: req.user._id
      });

      if (!website) {
        return res.status(404).json({ error: 'Website not found' });
      }

      if (website.authentication.status !== 'verified') {
        return res.status(403).json({ error: 'Website must be verified before auditing' });
      }

      // Start audit process
      const auditResult = await performAudit(website);

      // Update website with audit results
      website.lastAudit = {
        date: new Date(),
        status: 'success',
        issues: auditResult.issues
      };

      await website.save();

      res.json({ audit: website.lastAudit });
    } catch (error) {
      res.status(500).json({ error: 'Error performing audit' });
    }
  }
);

// Get audit details
router.get('/:auditId', auth, async (req, res) => {
  try {
    const website = await Website.findOne({
      'lastAudit._id': req.params.auditId,
      owner: req.user._id
    });

    if (!website) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    res.json({ audit: website.lastAudit });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching audit details' });
  }
});

// Apply fixes for audit issues
router.post('/:auditId/fix',
  auth,
  subscriptionCheck,
  [
    body('issueIds').isArray(),
    body('fixMethod').isIn(['automatic', 'manual'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const website = await Website.findOne({
        'lastAudit._id': req.params.auditId,
        owner: req.user._id
      });

      if (!website) {
        return res.status(404).json({ error: 'Audit not found' });
      }

      const { issueIds, fixMethod } = req.body;

      // Update fix status for selected issues
      website.lastAudit.issues = website.lastAudit.issues.map(issue => {
        if (issueIds.includes(issue._id.toString())) {
          return {
            ...issue,
            fix: {
              status: 'applied',
              appliedDate: new Date(),
              method: fixMethod
            }
          };
        }
        return issue;
      });

      await website.save();

      res.json({ audit: website.lastAudit });
    } catch (error) {
      res.status(500).json({ error: 'Error applying fixes' });
    }
  }
);

// Generate audit report
router.get('/:auditId/report',
  auth,
  async (req, res) => {
    try {
      const website = await Website.findOne({
        'lastAudit._id': req.params.auditId,
        owner: req.user._id
      });

      if (!website) {
        return res.status(404).json({ error: 'Audit not found' });
      }

      // TODO: Generate PDF/CSV report
      // This would involve creating a formatted report with all audit details

      res.json({
        message: 'Report generation not implemented yet',
        audit: website.lastAudit
      });
    } catch (error) {
      res.status(500).json({ error: 'Error generating report' });
    }
  }
);

export default router; 