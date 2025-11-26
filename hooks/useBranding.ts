import { useContext } from 'react';
import { BrandingContext } from '../context/BrandingContext';

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
