import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema({
  level: { type: String, default: 'other' },
  institution: { type: String, default: '' },
  // 10th / 12th specific
  board: { type: String, default: '' },           // CBSE, ICSE, State Board
  stream: { type: String, default: '' },           // Science, Commerce, Arts
  yearOfPassing: { type: String, default: '' },
  percentageMarks: { type: String, default: '' },
  // Undergraduate specific
  university: { type: String, default: '' },
  degree: { type: String, default: '' },           // B.Tech, BA, BSc, B.Com...
  branch: { type: String, default: '' },           // CSE, ECE, Mechanical...
  // Postgraduate specific
  pgDegree: { type: String, default: '' },         // M.Tech, MBA, MSc...
  specialization: { type: String, default: '' },
  // Common for UG/PG
  yearOfStudy: { type: String, default: '' },      // 1st, 2nd, 3rd, 4th year
  cgpa: { type: String, default: '' },
  // Diploma specific
  trade: { type: String, default: '' },
  // Professional
  fieldOfStudy: { type: String, default: '' },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  district: { type: String, default: '' },
}, { _id: false });

const activitySchema = new mongoose.Schema({
  type: { type: String, default: 'chat' },
  title: { type: String, required: true },
  detail: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  time: { type: String, default: '' },
  subject: { type: String, default: '' },
  topic: { type: String, default: '' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const doubtSchema = new mongoose.Schema({
  question: { type: String, required: true },
  subject: { type: String, default: 'General' },
  answer: { type: String, default: '' },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const wellnessSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  note: { type: String, default: '' },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },

  // Personal info
  phone: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },

  // Socio-economic info (used for eligibility matching)
  occupation: { type: String, default: '' },
  annualIncome: { type: Number, default: 0 },
  category: { type: String, default: '' },

  // Education
  education: { type: educationSchema, default: () => ({}) },

  // Address
  address: { type: addressSchema, default: () => ({}) },

  // Profile extras
  interests: [{ type: String }],
  goals: [{ type: String }],

  // Saved schemes (array of scheme IDs)
  savedSchemes: [{ type: Number }],

  // Study plans (Custom plans created & tracked by user)
  studyPlans: [studyPlanSchema],

  // Doubts (Inline Q&A questions asked by user)
  doubts: [doubtSchema],

  // Wellness Log (mood tracking)
  wellnessLog: [wellnessSchema],

  // Activity log (last 50 entries)
  activityLog: [activitySchema],
}, {
  timestamps: true,
});

// Compare plain password against hash
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Return safe public fields (no hash)
userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    occupation: this.occupation,
    annualIncome: this.annualIncome,
    category: this.category,
    education: this.education,
    address: this.address,
    interests: this.interests,
    goals: this.goals,
    savedSchemes: this.savedSchemes,
    studyPlans: this.studyPlans,
    doubts: this.doubts,
    wellnessLog: this.wellnessLog,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
