
import React, { useState } from 'react';
import { StockItem, MovementType } from '../../types';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string, type: MovementType, quantity: number, destination?: string) => Promise<void>;
  item: StockItem;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ isOpen, onClose, onConfirm, item }) => {
  const [type, setType] = useState<MovementType>('ENTRADA');
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (quantity <= 0) {
        setError("A quantidade deve ser maior que zero.");
        return;
    }

    // Rule 1 Check: Prevent negative stock locally for better UX
    if ((type === 'SAIDA' || type === 'TRANSFERENCIA') && item.quantity < quantity) {
        setError(`Estoque insuficiente. Disponível: ${item.quantity}`);
        return;
    }

    // Rule 3 Check: Transfers require destination
    if (type === 'TRANSFERENCIA' && !destination) {
        setError("Informe o local de destino para a transferência.");
        return;
    }

    setIsSaving(true);
    try {
      await onConfirm(item.id, type, quantity, destination);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao registrar movimentação.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Movimentar Estoque</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Item: <strong>{item.name}</strong> (Atual: {item.quantity})</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 p-3 rounded text-red-700 text-sm">{error}</div>}
          
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Movimentação</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as MovementType)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                  <option value="ENTRADA">Entrada (Abastecimento)</option>
                  <option value="SAIDA">Saída (Baixa/Consumo)</option>
                  <option value="TRANSFERENCIA">Transferência</option>
              </select>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                min="1"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
          </div>

          {type === 'TRANSFERENCIA' && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local de Destino</label>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)} 
                    placeholder="Ex: Armazém B"
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
              </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-white">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50">
                {isSaving ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;
