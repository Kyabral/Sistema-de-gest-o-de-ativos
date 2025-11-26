import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from '../types';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Type assertion to provide more specific user type
  return context as Omit<typeof context, 'user'> & { user: User | null };
};