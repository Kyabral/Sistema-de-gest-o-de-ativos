import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { AppProvider } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './context/ThemeContext';
import { BrandingProvider } from './context/BrandingContext';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return user ? (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  ) : (
    <LoginPage />
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrandingProvider>
          <AppContent />
        </BrandingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
