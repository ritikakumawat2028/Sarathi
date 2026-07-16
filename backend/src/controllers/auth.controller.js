import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

/**
 * POST /api/auth/signup
 * Accepts full profile data at signup so we can power eligibility checking immediately.
 */
export async function signup(req, res) {
  const {
    name, email, password,
    phone, dateOfBirth, gender,
    // Education fields
    educationLevel, institution, board, stream, yearOfPassing, percentageMarks,
    university, degree, branch, pgDegree, specialization, yearOfStudy, cgpa, trade, fieldOfStudy,
    // Socioeconomic
    occupation, annualIncome, category,
    // Address
    city, state, pincode,
    // Profile extras
    interests, goals,
  } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are all required.', 400);
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters.', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    phone: phone || '',
    dateOfBirth: dateOfBirth || '',
    gender: gender || '',
    occupation: occupation || '',
    annualIncome: !isNaN(Number(annualIncome)) ? Number(annualIncome) : 0,
    category: category || '',
    education: {
      level: educationLevel || req.body.education?.level || 'other',
      institution: institution || req.body.education?.institution || '',
      board: board || req.body.education?.board || '',
      stream: stream || req.body.education?.stream || '',
      yearOfPassing: yearOfPassing || req.body.education?.yearOfPassing || '',
      percentageMarks: percentageMarks || req.body.education?.percentageMarks || '',
      university: university || req.body.education?.university || '',
      degree: degree || req.body.education?.degree || '',
      branch: branch || req.body.education?.branch || '',
      pgDegree: pgDegree || req.body.education?.pgDegree || '',
      specialization: specialization || req.body.education?.specialization || '',
      yearOfStudy: yearOfStudy || req.body.education?.yearOfStudy || '',
      cgpa: cgpa || req.body.education?.cgpa || '',
      trade: trade || req.body.education?.trade || '',
      fieldOfStudy: fieldOfStudy || req.body.education?.fieldOfStudy || '',
    },
    address: {
      city: city || req.body.address?.city || '',
      state: state || req.body.address?.state || '',
      pincode: pincode || req.body.address?.pincode || '',
    },
    interests: Array.isArray(interests) ? interests : (interests || '').split(',').map(i => i.trim()).filter(Boolean),
    goals: Array.isArray(goals) ? goals : (goals || '').split(',').map(g => g.trim()).filter(Boolean),
    activityLog: [{
      type: 'profile',
      title: 'Account created',
      detail: `Joined Sarthi as ${occupation || 'citizen'}`,
    }],
  });

  const token = signToken({ sub: user._id.toString(), email: user.email });
  res.status(201).json({ token, user: user.toPublic() });
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Log login activity
  user.activityLog.push({ type: 'profile', title: 'Logged in', detail: '' });
  if (user.activityLog.length > 50) user.activityLog = user.activityLog.slice(-50);
  await user.save();

  const token = signToken({ sub: user._id.toString(), email: user.email });
  res.json({ token, user: user.toPublic() });
}

/**
 * GET /api/auth/me
 */
export async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('User not found.', 404);
  res.json({ user: user.toPublic() });
}
