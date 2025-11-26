import React from 'react';
import { Supplier } from '../../types';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplierId: string) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Nome do Fornecedor</th>
            <th scope="col" className="px-6 py-3">Categoria</th>
            <th scope="col" className="px-6 py-3">Contato</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Telefone</th>
            <th scope="col" className="px-6 py-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {supplier.name}
              </th>
              <td className="px-6 py-4">{supplier.category}</td>
              <td className="px-6 py-4">{supplier.contactPerson || 'N/A'}</td>
              <td className="px-6 py-4">{supplier.email}</td>
              <td className="px-6 py-4">{supplier.phone}</td>
              <td className="px-6 py-4 text-center space-x-2">
                <button onClick={() => onEdit(supplier)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline">Editar</button>
                <button onClick={() => onDelete(supplier.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {suppliers.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          Nenhum fornecedor encontrado.
        </div>
      )}
    </div>
  );
};

export default SupplierTable;
