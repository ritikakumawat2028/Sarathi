import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getToken } from '@/app/lib/api';

export interface StudentProfile {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  education: {
    currentLevel: string; // '10th', '12th', 'Undergraduate', 'Postgraduate'
    institution: string;
    grade?: string;
    fieldOfStudy?: string;
    yearOfStudy?: string;
  };
  address: {
    city?: string;
    state?: string;
    pincode?: string;
  };
  interests: string[];
  goals: string[];
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  date: Date;
  completed: boolean;
}

export interface TestResult {
  id: string;
  subject: string;
  score: number;
  totalMarks: number;
  date: Date;
}

export interface WellnessEntry {
  id: string;
  mood: number; // 1-5
  date: Date;
  note?: string;
}

interface UserDataContextType {
  studentProfile: StudentProfile | null;
  setStudentProfile: (profile: StudentProfile) => void;
  studySessions: StudySession[];
  addStudySession: (session: StudySession) => void;
  completeStudySession: (id: string) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
  wellnessEntries: WellnessEntry[];
  addWellnessEntry: (entry: WellnessEntry) => void;
  getWeeklyStudyHours: () => number;
  getWeeklyProgress: () => number;
  getAverageMood: () => number;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studentProfile, setStudentProfileState] = useState<StudentProfile | null>(null);

  // If the user is already logged in (JWT present), load their previously-saved
  // profile from the backend instead of starting from a blank slate every reload.
  useEffect(() => {
    if (!getToken()) return;
    api
      .get<{ profile: StudentProfile | null }>('/user/profile')
      .then((res) => {
        if (res.profile) setStudentProfileState(res.profile);
      })
      .catch(() => {
        // No saved profile yet, or backend unreachable — fine, keep local state.
      });
  }, []);

  const setStudentProfile = (profile: StudentProfile) => {
    setStudentProfileState(profile);
    if (getToken()) {
      api.put('/user/profile', profile).catch(() => {
        // Best-effort persistence; the UI already has the profile locally either way.
      });
    }
  };
  const [studySessions, setStudySessions] = useState<StudySession[]>([
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Algebra',
      duration: 60,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completed: true,
    },
    {
      id: '2',
      subject: 'Science',
      topic: 'Physics',
      duration: 45,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completed: true,
    },
    {
      id: '3',
      subject: 'English',
      topic: 'Grammar',
      duration: 30,
      date: new Date(),
      completed: false,
    },
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: '1',
      subject: 'Mathematics',
      score: 85,
      totalMarks: 100,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      subject: 'Science',
      score: 78,
      totalMarks: 100,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ]);
  const [wellnessEntries, setWellnessEntries] = useState<WellnessEntry[]>([
    { id: '1', mood: 4, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { id: '2', mood: 3, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: '3', mood: 5, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { id: '4', mood: 4, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: '5', mood: 3, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: '6', mood: 4, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: '7', mood: 5, date: new Date() },
  ]);

  const addStudySession = (session: StudySession) => {
    setStudySessions((prev) => [...prev, session]);
  };

  const completeStudySession = (id: string) => {
    setStudySessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, completed: true } : session
      )
    );
  };

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  const addWellnessEntry = (entry: WellnessEntry) => {
    setWellnessEntries((prev) => [...prev, entry]);
  };

  const getWeeklyStudyHours = (): number => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = studySessions.filter(
      (session) => session.completed && session.date >= oneWeekAgo
    );
    const totalMinutes = weekSessions.reduce((acc, session) => acc + session.duration, 0);
    return Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal
  };

  const getWeeklyProgress = (): number => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const completedSessions = studySessions.filter(
      (session) => session.completed && session.date >= oneWeekAgo
    ).length;
    const totalSessions = studySessions.filter((session) => session.date >= oneWeekAgo).length;
    return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  };

  const getAverageMood = (): number => {
    const recentEntries = wellnessEntries.slice(-7); // Last 7 entries
    if (recentEntries.length === 0) return 0;
    const sum = recentEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return Math.round((sum / recentEntries.length) * 10) / 10;
  };

  return (
    <UserDataContext.Provider
      value={{
        studentProfile,
        setStudentProfile,
        studySessions,
        addStudySession,
        completeStudySession,
        testResults,
        addTestResult,
        wellnessEntries,
        addWellnessEntry,
        getWeeklyStudyHours,
        getWeeklyProgress,
        getAverageMood,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};
