import React from 'react';
import { Contract, ContractStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../hooks/useApp';

interface ContractTableProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

const getStatusBadge = (status: ContractStatus) => {
    const statusMap: Record<ContractStatus, string> = {
        [ContractStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [ContractStatus.EXPIRED]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        [ContractStatus.CANCELED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return `px-2 py-1 text-xs font-medium rounded-full inline-block ${statusMap[status]}`;
};

const ContractTable: React.FC<ContractTableProps> = ({ contracts, onEdit, onDelete }) => {
  const { suppliers } = useApp();
  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nome do Contrato</th>
              <th scope="col" className="px-6 py-3">Fornecedor</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3 text-right">Valor Mensal</th>
              <th scope="col" className="px-6 py-3">Vigência</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(contract => (
              <tr key={contract.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{contract.name}</th>
                <td className="px-6 py-4">{getSupplierName(contract.supplierId)}</td>
                <td className="px-6 py-4">{contract.category}</td>
                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(contract.monthlyValue)}</td>
                <td className="px-6 py-4">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</td>
                <td className="px-6 py-4 text-center"><span className={getStatusBadge(contract.status)}>{contract.status}</span></td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button onClick={() => onEdit(contract)} className="font-medium text-yellow-600 hover:underline">Editar</button>
                  <button onClick={() => onDelete(contract)} className="font-medium text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contracts.length === 0 && <p className="text-center py-10 text-gray-500">Nenhum contrato encontrado.</p>}
      </div>
    </div>
  );
};

export default ContractTable;
