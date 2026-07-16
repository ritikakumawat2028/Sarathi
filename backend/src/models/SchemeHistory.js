import mongoose from 'mongoose';

const SchemeHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: false },
    sessionId: { type: String, index: true }, // For non-logged in or local session tracking
    type: {
      type: String,
      enum: ['view', 'search', 'recommendation'],
      required: true,
      index: true
    },
    title: { type: String, required: true },
    detail: { type: String },
    schemeId: { type: Number }, // Present if type === 'view'
    query: { type: String },    // Present if type === 'search'
    profileData: { type: mongoose.Schema.Types.Mixed }, // Present if type === 'recommendation'
    resultsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const SchemeHistory = mongoose.models.SchemeHistory || mongoose.model('SchemeHistory', SchemeHistorySchema);
