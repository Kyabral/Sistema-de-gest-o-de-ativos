

import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import FinancialDashboard from '../components/finance/FinancialDashboard';
import InvoiceTable from '../components/finance/InvoiceTable';
import ContractTable from '../components/finance/ContractTable';
import AccountsPayable from '../components/finance/AccountsPayable'; // New Component
import BankReconciliation from '../components/finance/BankReconciliation'; // New Component
import AddInvoiceModal from '../components/finance/AddInvoiceModal';
import AddContractModal from '../components/finance/AddContractModal';
import AddExpenseModal from '../components/finance/AddExpenseModal'; // New Component
import EditContractModal from '../components/finance/EditContractModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { PlusIcon } from '../components/common/icons';
import { Contract } from '../types';

type Tab = 'dashboard' | 'invoices' | 'contracts' | 'expenses' | 'reconciliation';

const FinancialPage: React.FC = () => {
  const { invoices, contracts, employees, expenses, addInvoice, addContract, updateContract, deleteContract, addExpense } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false); // New State
  const [isEditContractModalOpen, setIsEditContractModalOpen] = useState(false);
  const [isDeleteContractModalOpen, setIsDeleteContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const handleOpenEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditContractModalOpen(true);
  };
  
  const handleOpenDeleteContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDeleteContractModalOpen(true);
  };

  const confirmDeleteContract = async () => {
    if (selectedContract) {
      await deleteContract(selectedContract.id);
      setIsDeleteContractModalOpen(false);
      setSelectedContract(null);
    }
  };

  const TabButton: React.FC<{tabName: Tab; label: string;}> = ({ tabName, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`${ activeTab === tabName ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
      {label}
    </button>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <TabButton tabName="dashboard" label="Visão Geral" />
          <TabButton tabName="expenses" label="Contas a Pagar" />
          <TabButton tabName="invoices" label="Contas a Receber" />
          <TabButton tabName="contracts" label="Contratos" />
          <TabButton tabName="reconciliation" label="Conciliação" />
        </nav>
      </div>
      
      <div className="flex justify-end space-x-2">
        {activeTab === 'invoices' && (
          <button onClick={() => setIsAddInvoiceModalOpen(true)} className="btn btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Gerar Nota Fiscal</button>
        )}
        {activeTab === 'contracts' && (
          <button onClick={() => setIsAddContractModalOpen(true)} className="btn btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Adicionar Contrato</button>
        )}
        {activeTab === 'expenses' && (
          <button onClick={() => setIsAddExpenseModalOpen(true)} className="btn btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Nova Conta</button>
        )}
      </div>

      <div>
        {activeTab === 'dashboard' && <FinancialDashboard invoices={invoices} contracts={contracts} employees={employees} />}
        {activeTab === 'expenses' && <AccountsPayable expenses={expenses} />}
        {activeTab === 'invoices' && <InvoiceTable invoices={invoices} />}
        {activeTab === 'contracts' && <ContractTable contracts={contracts} onEdit={handleOpenEditContract} onDelete={handleOpenDeleteContract} />}
        {activeTab === 'reconciliation' && <BankReconciliation />}
      </div>
      
      <AddInvoiceModal isOpen={isAddInvoiceModalOpen} onClose={() => setIsAddInvoiceModalOpen(false)} onSave={addInvoice} />
      <AddContractModal isOpen={isAddContractModalOpen} onClose={() => setIsAddContractModalOpen(false)} onSave={addContract} />
      <AddExpenseModal isOpen={isAddExpenseModalOpen} onClose={() => setIsAddExpenseModalOpen(false)} onSave={addExpense} />
      
      {selectedContract && <EditContractModal isOpen={isEditContractModalOpen} onClose={() => setIsEditContractModalOpen(false)} onSave={updateContract} contract={selectedContract} />}
      {selectedContract && <ConfirmationModal isOpen={isDeleteContractModalOpen} onClose={() => setIsDeleteContractModalOpen(false)} onConfirm={confirmDeleteContract} title="Excluir Contrato" message={`Tem certeza que deseja excluir o contrato "${selectedContract.name}"?`} />}

      <style>{`.btn {display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;transition:background-color .2s}.btn-primary {background-color:rgb(var(--color-primary-600));color:#fff}.btn-primary:hover {background-color:rgb(var(--color-primary-700))}`}</style>
    </div>
  );
};

export default FinancialPage;