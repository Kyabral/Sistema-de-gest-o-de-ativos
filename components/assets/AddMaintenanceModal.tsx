import React, { useState } from 'react';
import { NewMaintenanceData } from '../../types';
import { useApp } from '../../hooks/useApp';
import DatePicker from '../common/DatePicker';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewMaintenanceData) => Promise<void>;
  assetId: string;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ isOpen, onClose, onSave, assetId }) => {
  const { suppliers } = useApp();
  const initialState = {
    description: '',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
  };

  const [maintenanceData, setMaintenanceData] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMaintenanceData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceData.description || maintenanceData.cost <= 0) {
        setError("Por favor, preencha a descrição e um custo válido.");
        return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      await onSave({ ...maintenanceData, assetId });
      handleClose();
    } catch (err) {
      console.error("Failed to save maintenance record:", err);
      setError("Falha ao salvar o registro. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClose = () => {
    setMaintenanceData(initialState);
    setError(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Registro de Manutenção</h2>
          <button onClick={handleClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
          
          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição do Serviço</label>
            <input type="text" name="description" id="description" value={maintenanceData.description} onChange={handleChange} required className="input-style" placeholder="Ex: Troca de bateria" />
          </div>
          
          <div>
            <label htmlFor="supplierId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fornecedor</label>
            <select name="supplierId" id="supplierId" value={maintenanceData.supplierId} onChange={handleChange} className="input-style">
              <option value="">Selecione um fornecedor (opcional)</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Custo (R$)</label>
              <input type="number" name="cost" id="cost" value={maintenanceData.cost} onChange={handleChange} required min="0.01" step="0.01" className="input-style" placeholder="0,00" />
            </div>
            <DatePicker
              label="Data do Serviço"
              id="date"
              name="date"
              value={maintenanceData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="images" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Anexar Imagens da Inspeção</label>
            <input type="file" name="images" id="images" multiple className="input-style file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">O upload de arquivos não está implementado nesta demonstração.</p>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 mt-6 border-t dark:border-gray-600">
            <button type="button" onClick={handleClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 flex items-center">
              {isSaving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              {isSaving ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
         <style>{`
          .input-style { background-color: #F9FAFB; border: 1px solid #D1D5DB; color: #111827; font-size: 0.875rem; border-radius: 0.5rem; display: block; width: 100%; padding: 0.625rem; }
          .dark .input-style { background-color: #374151; border-color: #4B5563; color: white; }
        `}</style>
      </div>
    </div>
  );
};

export default AddMaintenanceModal;