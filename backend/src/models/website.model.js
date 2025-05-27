import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['custom', 'shopify', 'woocommerce', 'wordpress', 'magento'],
    default: 'custom'
  },
  authentication: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    verificationCode: String,
    verificationMethod: {
      type: String,
      enum: ['meta_tag', 'file', 'dns'],
      default: 'meta_tag'
    },
    verificationDate: Date
  },
  settings: {
    autoFix: {
      type: Boolean,
      default: false
    },
    notificationEmail: String,
    auditFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  },
  lastAudit: {
    date: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'in_progress'],
      default: 'in_progress'
    },
    issues: [{
      type: {
        type: String,
        enum: ['missing_tag', 'duplicate_tag', 'misconfigured_tag'],
        required: true
      },
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
      },
      page: String,
      fix: {
        status: {
          type: String,
          enum: ['pending', 'applied', 'failed'],
          default: 'pending'
        },
        method: {
          type: String,
          enum: ['manual', 'automatic'],
          default: 'manual'
        },
        appliedDate: Date
      }
    }]
  },
  auditHistory: [{
    date: Date,
    status: String,
    issues: [{
      type: String,
      description: String,
      severity: String,
      page: String,
      fix: {
        status: String,
        method: String,
        appliedDate: Date
      }
    }]
  }],
  gtmContainer: {
    id: String,
    name: String,
    lastSync: Date
  },
  ga4Property: {
    id: String,
    name: String,
    lastSync: Date
  },
  clarityProject: {
    id: String,
    name: String,
    lastSync: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
websiteSchema.index({ owner: 1, url: 1 }, { unique: true });

const Website = mongoose.model('Website', websiteSchema);

export default Website; 