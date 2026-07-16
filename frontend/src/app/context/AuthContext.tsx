import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api, getToken, setToken } from '@/app/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  annualIncome?: number;
  category?: string;
  education?: {
    level: string;
    institution?: string;
    board?: string;
    stream?: string;
    yearOfPassing?: string;
    percentageMarks?: string;
    university?: string;
    degree?: string;
    branch?: string;
    pgDegree?: string;
    specialization?: string;
    yearOfStudy?: string;
    cgpa?: string;
    trade?: string;
    fieldOfStudy?: string;
  };
  address?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
  interests?: string[];
  goals?: string[];
  savedSchemes?: number[];
  avatar?: string;
  createdAt?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  // Education
  educationLevel?: string;
  institution?: string;
  board?: string;
  stream?: string;
  yearOfPassing?: string;
  percentageMarks?: string;
  university?: string;
  degree?: string;
  branch?: string;
  pgDegree?: string;
  specialization?: string;
  yearOfStudy?: string;
  cgpa?: string;
  trade?: string;
  fieldOfStudy?: string;
  // Socioeconomic
  occupation?: string;
  annualIncome?: string;
  category?: string;
  // Address
  city?: string;
  state?: string;
  pincode?: string;
  // Goals
  interests?: string;
  goals?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
  };

  const signup = async (payload: SignupPayload) => {
    const res = await api.post<{ token: string; user: User }>('/auth/signup', payload);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading,
        loading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
