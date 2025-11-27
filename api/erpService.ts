
import { createCallable } from './firebase';

export type ErpSystem = 'SAP' | 'Totvs' | 'Oracle';

const syncWithERPFunction = createCallable('syncWithERP');

/**
 * Sincroniza os ativos do SGA+ para o sistema ERP especificado chamando a Cloud Function.
 * @param erpSystem O sistema ERP de destino.
 */
export const syncAssetsToERP = async (erpSystem: ErpSystem) => {
  console.log(`Iniciando chamada da Cloud Function para sincronizar ativos com ${erpSystem}...`);
  try {
    const result = await syncWithERPFunction({ erpSystem, syncType: 'assets' });
    console.log('Resposta da Cloud Function (ativos):', result.data);
    return result.data; // A resposta da função já vem em result.data
  } catch (error) {
    console.error(`Erro ao chamar a Cloud Function syncWithERP (ativos) para ${erpSystem}:`, error);
    throw new Error('Falha ao sincronizar ativos com o ERP via Cloud Function.');
  }
};

/**
 * Puxa dados financeiros do sistema ERP para o SGA+ chamando a Cloud Function.
 * @param erpSystem O sistema ERP de origem.
 */
export const pullFinancialsFromERP = async (erpSystem: ErpSystem) => {
  console.log(`Iniciando chamada da Cloud Function para puxar dados de ${erpSystem}...`);
  try {
    const result = await syncWithERPFunction({ erpSystem, syncType: 'financials' });
    console.log('Resposta da Cloud Function (financeiro):', result.data);
    return result.data as { success: boolean; data?: any; message?: string };
  } catch (error) {
    console.error(`Erro ao chamar a Cloud Function syncWithERP (financeiro) para ${erpSystem}:`, error);
    throw new Error('Falha ao buscar dados financeiros do ERP via Cloud Function.');
  }
};
