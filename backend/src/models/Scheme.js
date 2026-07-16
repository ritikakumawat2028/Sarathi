import mongoose from 'mongoose';

const SchemeSchema = new mongoose.Schema(
  {
    numericId: { type: Number, index: true },
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    benefits: { type: String },
    eligibility: [{ type: String }],
    incomeLimit: { type: Number, default: 0 }, // 0 means no limit or not specified
    ageLimitMin: { type: Number, default: 0 },
    ageLimitMax: { type: Number, default: 100 },
    gender: {
      type: String,
      enum: ['all', 'male', 'female', 'transgender'],
      default: 'all',
      index: true
    },
    occupation: [{ type: String, index: true }], // e.g. ['student', 'farmer', 'business', 'unemployed', 'all']
    category: { type: String, required: true, index: true }, // e.g. agriculture, education, health, business, housing, social_security
    subcategory: { type: String, default: 'General' },
    state: { type: String, default: 'Central', index: true }, // 'Central' or specific Indian State name
    documents: [{ type: String }],
    officialLink: { type: String },
    applicationLink: { type: String },
    applicationMode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Online'
    },
    processingTime: { type: String, default: '15-30 Days' },
    lastUpdated: { type: Date, default: Date.now },
    tags: [{ type: String, index: true }],
    ministry: { type: String, default: 'Government of India' },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

// Full text search index on name, description, category, tags
SchemeSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

export const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);
