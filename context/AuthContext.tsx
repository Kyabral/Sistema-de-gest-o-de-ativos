import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../api/authService';
import { User, UserRegistrationData, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signUp: (userData: UserRegistrationData) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setAuth({ user, isLoading: false, error: null });
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (userData: UserRegistrationData) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.signUp(userData);
      // After sign up, the onAuthChange listener will automatically pick up the new user
      // and their custom claims once set by the backend function.
    } catch (error: any) {
      console.error("Sign up error:", error);
      const message = error.code === 'auth/email-already-in-use' ? 'Este e-mail já está em uso.' : 'Falha ao criar conta.';
      setAuth(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.signIn(email, password, rememberMe);
      // onAuthChange listener will handle setting the user state
    } catch (error: any) {
      console.error("Sign in error:", error);
      const message = 'E-mail ou senha inválidos. Por favor, tente novamente.';
      setAuth(prev => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  };

  const logOut = async () => {
    try {
       await authService.logOut();
    } catch (error: any) {
       console.error("Log out error:", error);
       setAuth(prev => ({...prev, error: "Falha ao sair."}))
    }
  };
  
  const value = { ...auth, signUp, signIn, logOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};