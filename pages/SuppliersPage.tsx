import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { NewSupplierData, Supplier } from '../types';
import SupplierTable from '../components/suppliers/SupplierTable';
import AddSupplierModal from '../components/suppliers/AddSupplierModal';
import EditSupplierModal from '../components/suppliers/EditSupplierModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { PlusIcon } from '../components/common/icons';

const SuppliersPage: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, isLoading, error } = useApp();
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

    const filteredSuppliers = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(lowercasedQuery) ||
            supplier.category.toLowerCase().includes(lowercasedQuery) ||
            (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(lowercasedQuery))
        );
    }, [suppliers, searchQuery]);

    const handleOpenEditModal = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (supplierId: string) => {
        setSupplierToDelete(supplierId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (supplierToDelete) {
            await deleteSupplier(supplierToDelete);
            setIsDeleteModalOpen(false);
            setSupplierToDelete(null);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <p className="text-gray-500 dark:text-gray-400">Centralize as informações e o histórico de seus fornecedores.</p>
                <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Fornecedor
                </button>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="mb-4">
                        <label htmlFor="searchFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Buscar Fornecedor</label>
                        <input
                            type="text"
                            id="searchFilter"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Buscar por nome, categoria ou contato..."
                        />
                    </div>
                    <SupplierTable
                        suppliers={filteredSuppliers}
                        onEdit={handleOpenEditModal}
                        onDelete={handleOpenDeleteModal}
                    />
                </div>
            )}

            <AddSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={addSupplier}
            />

            {isEditModalOpen && selectedSupplier && (
                <EditSupplierModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={updateSupplier}
                    supplier={selectedSupplier}
                />
            )}

            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirmar Exclusão"
                    message="Tem certeza de que deseja excluir este fornecedor? Esta ação não pode ser desfeita."
                />
            )}
            <style>{`.btn {display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;transition:background-color .2s}.btn-primary {background-color:rgb(var(--color-primary-600));color:#fff}.btn-primary:hover {background-color:rgb(var(--color-primary-700))}`}</style>
        </div>
    );
};

export default SuppliersPage;
