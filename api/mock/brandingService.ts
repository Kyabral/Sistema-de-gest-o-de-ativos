
import { BrandingSettings } from '../../types';

const BRANDING_STORAGE_KEY = 'sga-plus-branding-settings';

// Padrão de fábrica para garantir que todos os campos existam
const getDefaultBranding = (): BrandingSettings => ({
    tenantId: 'default',
    companyName: 'SGA+',
    slogan: 'Simplificando a Gestão de Ativos',
    logoUrl: '/logo_sga_light.png',
    primaryColor: '#6366f1', // Cor padrão do sistema (Indigo)
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
    },
    cnpj: '',
    stateRegistration: ''
});

/**
 * Simula a obtenção das configurações de branding de um tenant.
 * Em um ambiente real, isso faria uma chamada para um endpoint da API.
 */
export const getTenantBranding = async (tenantId: string): Promise<BrandingSettings> => {
    console.log(`[Mock API] Obtendo branding para o tenant: ${tenantId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                const storedSettings = localStorage.getItem(BRANDING_STORAGE_KEY);
                if (storedSettings) {
                    const parsed = JSON.parse(storedSettings);
                    // Garante que o objeto retornado tenha todos os campos do padrão
                    resolve({ ...getDefaultBranding(), ...parsed, tenantId });
                } else {
                    resolve(getDefaultBranding());
                }
            } catch (error) {
                console.error("Falha ao ler branding do localStorage:", error);
                resolve(getDefaultBranding());
            }
        }, 500); // Simula latência de rede
    });
};

/**
 * Simula a atualização das configurações de branding de um tenant.
 * Em um ambiente real, isso faria uma chamada POST/PUT para um endpoint da API.
 */
export const updateTenantBranding = async (tenantId: string, settings: BrandingSettings): Promise<BrandingSettings> => {
    console.log(`[Mock API] Atualizando branding para o tenant: ${tenantId}`, settings);
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                const newSettings = { ...settings, tenantId };
                localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(newSettings));
                resolve(newSettings);
            } catch (error) {
                console.error("Falha ao salvar branding no localStorage:", error);
                // Em caso de erro, retorna as configurações originais sem salvar
                resolve(settings);
            }
        }, 500); // Simula latência de rede
    });
};
