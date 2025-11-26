
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { BrandingSettings } from '../types';
import { applyPalette, generateColorPalette } from '../utils/colorUtils';

interface BrandingContextType {
  branding: BrandingSettings;
  setBranding: (settings: BrandingSettings) => void;
}

export const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const defaultBranding: BrandingSettings = {
    companyName: 'SGA+',
    slogan: 'Gestão de Ativos Inteligente',
    logoUrl: '',
    primaryColor: '#4f46e5',
    institutionalMessage: 'Relatório confidencial gerado pelo Sistema de Gestão de Ativos.',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
    },
    bankInfo: {
        bankName: '',
        agency: '',
        accountNumber: '',
        pixKey: ''
    }
};

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [branding, setBrandingState] = useState<BrandingSettings>(() => {
        try {
            const savedBranding = localStorage.getItem('branding');
            return savedBranding ? JSON.parse(savedBranding) : defaultBranding;
        } catch (error) {
            return defaultBranding;
        }
    });

    useEffect(() => {
        const palette = generateColorPalette(branding.primaryColor);
        applyPalette(palette);
    }, [branding.primaryColor]);

    const setBranding = (newBranding: BrandingSettings) => {
        localStorage.setItem('branding', JSON.stringify(newBranding));
        setBrandingState(newBranding);
    };

    return (
        <BrandingContext.Provider value={{ branding, setBranding }}>
            {children}
        </BrandingContext.Provider>
    );
};
