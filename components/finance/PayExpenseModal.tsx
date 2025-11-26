
import React, { useState, useEffect } from 'react';
import { Expense } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PayExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  onPay: (expenseId: string, amount: number, method: string, date: string) => Promise<void>;
}

const PayExpenseModal: React.FC<PayExpenseModalProps> = ({ isOpen, onClose, expense, onPay }) => {
    const [amount, setAmount] = useState(expense.remainingValue);
    const [method, setMethod] = useState(expense.paymentMethod || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setAmount(expense.remainingValue);
        setMethod(expense.paymentMethod || '');
    }, [expense]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // RULE 1: Cannot pay without method
        if (!method) {
            setError("Regra 2.1.1: Obrigatório selecionar uma forma de pagamento para baixar o título.");
            return;
        }
        if (amount <= 0 || amount > expense.remainingValue) {
            setError("Valor inválido.");
            return;
        }

        setIsSaving(true);
        try {
            await onPay(expense.id, amount, method, date);
            onClose();
        } catch (err) {
            setError("Erro ao processar pagamento.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Baixar Título</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{expense.description} - Venc: {new Date(expense.dueDate).toLocaleDateString('pt-BR')}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-100 p-3 rounded text-red-700 text-sm">{error}</div>}
                    
                    <div>
                        <label className="dark:text-gray-300">Valor a Pagar (R$)</label>
                        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} max={expense.remainingValue} step="0.01" className="input-style font-bold"/>
                        <p className="text-xs text-gray-500 mt-1">Restante atual: {formatCurrency(expense.remainingValue)}</p>
                    </div>

                    <div>
                        <label className="dark:text-gray-300">Forma de Pagamento</label>
                        <select value={method} onChange={e => setMethod(e.target.value)} required className="input-style">
                            <option value="">Selecione...</option>
                            <option value="Boleto">Boleto Bancário</option>
                            <option value="PIX">PIX</option>
                            <option value="Transferência">Transferência</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                            <option value="Dinheiro">Dinheiro</option>
                        </select>
                    </div>

                    <div>
                        <label className="dark:text-gray-300">Data do Pagamento</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-style"/>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="btn-primary bg-green-600 hover:bg-green-700">{isSaving ? 'Processando...' : 'Confirmar Baixa'}</button>
                    </div>
                </form>
                <style>{`.input-style{width:100%;padding:0.5rem;border-radius:0.5rem;border:1px solid #ccc;}.dark .input-style{background-color:#374151;border-color:#4B5563;color:white;}.btn-primary{color:white;padding:0.5rem 1rem;border-radius:0.5rem;}.btn-secondary{background-color:#e5e7eb;color:#333;padding:0.5rem 1rem;border-radius:0.5rem;}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb;}`}</style>
            </div>
        </div>
    );
};

export default PayExpenseModal;
