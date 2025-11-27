
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BrandingSettings } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getTenantBranding, updateTenantBranding } from '../api/usersService'; 
import { applyPalette, generateColorPalette } from '../utils/colorUtils';

interface BrandingContextType {
  branding: BrandingSettings;
  setBranding: (settings: BrandingSettings) => Promise<void>;
  isBrandingLoading: boolean;
}

export const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// Configuração padrão usada como fallback inicial
const defaultBranding: BrandingSettings = {
    tenantId: 'default',
    companyName: 'SGA+',
    slogan: 'Gestão de Ativos Inteligente',
    logoUrl: '/logo_sga_light.png',
    primaryColor: '#6366f1', // Cor padrão Indigo
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
    bankInfo: { bankName: '', agency: '', accountNumber: '', pixKey: '' },
    cnpj: '',
    stateRegistration: ''
};

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [branding, setBrandingState] = useState<BrandingSettings>(defaultBranding);
    const [isBrandingLoading, setIsBrandingLoading] = useState(true);

    // Carrega as configurações de branding do backend (mock) assim que o usuário é autenticado.
    const loadBranding = useCallback(async () => {
        if (user?.tenantId) {
            setIsBrandingLoading(true);
            try {
                const serverBranding = await getTenantBranding(user.tenantId);
                if (serverBranding) {
                    // Mescla as configurações do servidor com o padrão para garantir todos os campos
                    setBrandingState(prev => ({ ...prev, ...serverBranding }));
                }
            } catch (error) {
                console.error("Falha ao carregar as configurações de branding:", error);
                // Mantém o branding padrão em caso de erro
            } finally {
                setIsBrandingLoading(false);
            }
        }
    }, [user?.tenantId]);

    useEffect(() => {
        if (!isAuthLoading) {
            loadBranding();
        }
    }, [isAuthLoading, loadBranding]);

    // Aplica a paleta de cores sempre que a cor primária for alterada.
    useEffect(() => {
        if (branding.primaryColor) {
            try {
                const palette = generateColorPalette(branding.primaryColor);
                applyPalette(palette);
            } catch (error) {
                console.error("Falha ao aplicar a paleta de cores:", error);
                // Reverte para a cor padrão se a cor customizada for inválida
                const palette = generateColorPalette(defaultBranding.primaryColor);
                applyPalette(palette);
            }
        }
    }, [branding.primaryColor]);

    // Função para atualizar e persistir as configurações de branding.
    const handleSetBranding = async (newBranding: BrandingSettings) => {
        if (!user?.tenantId) {
            throw new Error("Usuário não autenticado para salvar as configurações.");
        }
        // Atualiza o estado local imediatamente para uma UI responsiva.
        setBrandingState(newBranding);
        
        try {
            // Persiste as alterações no backend (mock).
            await updateTenantBranding(user.tenantId, newBranding);
        } catch (error) {
            console.error("Falha ao salvar as configurações de branding:", error);
            // Opcional: reverter o estado local para o estado anterior em caso de erro na API.
            loadBranding(); // Recarrega os dados do servidor para garantir consistência.
            throw error; // Propaga o erro para o componente que chamou.
        }
    };

    const value = {
        branding,
        setBranding: handleSetBranding,
        isBrandingLoading,
    };

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    );
};
