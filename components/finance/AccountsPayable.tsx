
import React, { useState } from 'react';
import { Expense, ExpenseStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import PayExpenseModal from './PayExpenseModal';
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '../common/icons';
import { useApp } from '../../hooks/useApp';

interface AccountsPayableProps {
  expenses: Expense[];
}

const AccountsPayable: React.FC<AccountsPayableProps> = ({ expenses }) => {
  const { deleteExpense, settleExpense, suppliers } = useApp();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'Fornecedor Diverso';

  const getStatusBadge = (status: ExpenseStatus, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== ExpenseStatus.PAID;
    
    if (isOverdue) {
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full inline-flex items-center bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                <ExclamationTriangleIcon className="w-3 h-3 mr-1"/> Vencido
            </span>
        );
    }

    const statusMap: Record<ExpenseStatus, string> = {
        [ExpenseStatus.PAID]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [ExpenseStatus.OPEN]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [ExpenseStatus.PARTIAL]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [ExpenseStatus.OVERDUE]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", // Fallback
    };
    
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${statusMap[status]}`}>
            {status}
        </span>
    );
  };

  const handleOpenPay = (expense: Expense) => {
      setSelectedExpense(expense);
      setIsPayModalOpen(true);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Tem certeza que deseja excluir este título?")) {
          try {
              await deleteExpense(id);
          } catch (e: any) {
              alert(e.message); // Rule 3 alert
          }
      }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contas a Pagar</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Vencimento</th>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3">Fornecedor</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3 text-right">Valor Total</th>
              <th scope="col" className="px-6 py-3 text-right">A Pagar</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-mono">{formatDate(expense.dueDate)}</td>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {expense.description}
                    {expense.totalInstallments && expense.totalInstallments > 1 && (
                        <span className="ml-2 text-xs text-gray-500">({expense.installmentNumber}/{expense.totalInstallments})</span>
                    )}
                </th>
                <td className="px-6 py-4">{getSupplierName(expense.supplierId)}</td>
                <td className="px-6 py-4">{expense.category}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(expense.totalValue)}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">{formatCurrency(expense.remainingValue)}</td>
                <td className="px-6 py-4 text-center">{getStatusBadge(expense.status, expense.dueDate)}</td>
                <td className="px-6 py-4 text-center space-x-2">
                    {expense.status !== ExpenseStatus.PAID && (
                        <button onClick={() => handleOpenPay(expense)} className="font-medium text-green-600 hover:underline">Baixar</button>
                    )}
                    <button 
                        onClick={() => handleDelete(expense.id)} 
                        className={`font-medium text-red-600 hover:underline ${expense.isReconciled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={expense.isReconciled ? "Título conciliado não pode ser excluído" : "Excluir título"}
                    >
                        Excluir
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <p className="text-center py-10 text-gray-500">Nenhuma conta a pagar cadastrada.</p>}
      </div>
      
      {selectedExpense && (
          <PayExpenseModal 
            isOpen={isPayModalOpen}
            onClose={() => setIsPayModalOpen(false)}
            expense={selectedExpense}
            onPay={settleExpense}
          />
      )}
    </div>
  );
};

export default AccountsPayable;