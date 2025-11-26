
import React from 'react';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useBranding } from '../../hooks/useBranding';
import { printInvoice } from '../../utils/printUtils';
import { DocumentTextIcon } from '../common/icons';

interface InvoiceTableProps {
  invoices: Invoice[];
}

const getStatusBadge = (status: InvoiceStatus) => {
    const statusMap: Record<InvoiceStatus, string> = {
        [InvoiceStatus.PAID]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [InvoiceStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        [InvoiceStatus.OVERDUE]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        [InvoiceStatus.CANCELED]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return `px-2 py-1 text-xs font-medium rounded-full inline-block ${statusMap[status]}`;
};

const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices }) => {
  const { branding } = useBranding();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nº da Nota</th>
              <th scope="col" className="px-6 py-3">Cliente</th>
              <th scope="col" className="px-6 py-3">Data de Emissão</th>
              <th scope="col" className="px-6 py-3">Data de Vencimento</th>
              <th scope="col" className="px-6 py-3 text-right">Total</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-mono">#{String(invoice.invoiceNumber).padStart(6, '0')}</td>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.clientName}</th>
                <td className="px-6 py-4">{formatDate(invoice.issueDate)}</td>
                <td className="px-6 py-4">{formatDate(invoice.dueDate)}</td>
                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(invoice.total)}</td>
                <td className="px-6 py-4 text-center"><span className={getStatusBadge(invoice.status)}>{invoice.status}</span></td>
                <td className="px-6 py-4 text-center flex justify-center space-x-2">
                    <button 
                        onClick={() => printInvoice(invoice, branding)} 
                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
                        title="Imprimir Nota Fatura"
                    >
                        <DocumentTextIcon className="w-4 h-4 mr-1"/>
                        Imprimir/PDF
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="text-center py-10 text-gray-500">Nenhuma nota fiscal encontrada.</p>}
      </div>
    </div>
  );
};

export default InvoiceTable;
