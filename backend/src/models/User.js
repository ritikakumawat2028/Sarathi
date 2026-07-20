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
  id: { type: String, default: () => Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7) },
  type: { type: String, default: 'career' },
  module: { type: String, default: 'Career Guidance' },
  title: { type: String, required: true },
  detail: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: 'completed' },
  timestamp: { type: Date, default: Date.now },
});

const careerReviewSchema = new mongoose.Schema({
  id: { type: String, default: () => Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7) },
  type: { type: String, required: true }, // 'github' | 'portfolio' | 'ats'
  url: { type: String, default: '' },
  score: { type: Number, default: 0 },
  previousScore: { type: Number, default: 0 },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  recommendations: [{ type: String }],
  recruiterImpression: { type: String, default: '' },
  careerImpact: { type: String, default: '' },
  rawAnalysis: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
}, { timestamps: true });

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

const notificationSchema = new mongoose.Schema({
  id: { type: String, default: () => Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7) },
  title: { type: String, required: true },
  category: { type: String, default: 'Career & System Alert' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  content: { type: String, required: true },
  unread: { type: Boolean, default: true },
  actionUrl: { type: String, default: '/career' },
  actionText: { type: String, default: 'View Details' },
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

  // Notifications (citizen alerts & career updates)
  notifications: [notificationSchema],

  // Career Profile & Setup (Task 3)
  careerProfile: {
    targetJobRole: { type: String, default: '' },
    experienceLevel: { type: String, default: 'Fresher' },
    preferredIndustry: { type: String, default: 'Technology & IT' },
    degree: { type: String, default: '' },
    college: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    setupCompleted: { type: Boolean, default: false }
  },
  // Career Skills Self-Rating (1-10) (Task 3 & 4)
  careerSkills: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  // Career Analytics & Progress (Task 1, 5, 6, 7)
  careerAnalytics: { type: mongoose.Schema.Types.Mixed, default: () => null },
  // Career Goals (Task 14)
  careerGoals: [{
    title: { type: String, required: true },
    target: { type: String, default: '100%' },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  // Career Achievements (Task 15)
  careerAchievements: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Award' },
    unlockedAt: { type: Date, default: Date.now }
  }],
  // Career Reviews (GitHub, Portfolio, ATS history)
  careerReviews: [careerReviewSchema],
  // Career Roadmap
  careerRoadmap: { type: mongoose.Schema.Types.Mixed, default: () => null },
  // Resume Builder Data & ATS history
  resumeData: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
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
    activityLog: this.activityLog,
    notifications: this.notifications,
    careerProfile: this.careerProfile,
    careerSkills: this.careerSkills,
    careerAnalytics: this.careerAnalytics,
    careerGoals: this.careerGoals,
    careerAchievements: this.careerAchievements,
    careerReviews: this.careerReviews,
    careerRoadmap: this.careerRoadmap,
    resumeData: this.resumeData,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
