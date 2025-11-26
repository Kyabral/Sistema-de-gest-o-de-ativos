
import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { NewStockItemData, StockItem, NewPurchaseRequisitionData, RequisitionStatus, MovementType } from '../types';
import StockTable from '../components/stock/StockTable';
import AddStockItemModal from '../components/stock/AddStockItemModal';
import EditStockItemModal from '../components/stock/EditStockItemModal';
import StockMovementModal from '../components/stock/StockMovementModal';
import StockHistoryModal from '../components/stock/StockHistoryModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import AddRequisitionModal from '../components/purchasing/AddRequisitionModal';
import { PlusIcon, ClipboardCheckIcon, ArrowDownTrayIcon } from '../components/common/icons';
import { useAuth } from '../hooks/useAuth';
import { Page } from '../components/layout/MainLayout';
import { useBranding } from '../hooks/useBranding';
import { exportStockToCSV } from '../utils/csvExporter';

interface StockPageProps {
    setCurrentPage: (page: Page) => void;
}

const StockPage: React.FC<StockPageProps> = ({ setCurrentPage }) => {
    const { stockItems, addStockItem, updateStockItem, deleteStockItem, addPurchaseRequisition, registerStockMovement, isLoading, error } = useApp();
    const { user } = useAuth();
    const { branding } = useBranding();
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [itemForRequisition, setItemForRequisition] = useState<StockItem | null>(null);

    const filteredItems = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return stockItems.filter(item =>
            item.name.toLowerCase().includes(lowercasedQuery) ||
            item.sku.toLowerCase().includes(lowercasedQuery) ||
            item.location.toLowerCase().includes(lowercasedQuery)
        );
    }, [stockItems, searchQuery]);

    const handleOpenEditModal = (item: StockItem) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (itemId: string) => {
        setItemToDelete(itemId);
        setIsDeleteModalOpen(true);
    };
    
    const handleOpenMovementModal = (item: StockItem) => {
        setSelectedItem(item);
        setIsMovementModalOpen(true);
    };

    const handleOpenHistoryModal = (item: StockItem) => {
        setSelectedItem(item);
        setIsHistoryModalOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteStockItem(itemToDelete);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };
    
    const handleRequestPurchase = (item: StockItem) => {
        setItemForRequisition(item);
        setIsRequisitionModalOpen(true);
    };

    const handleSaveRequisition = async (items: { name: string, quantity: number }[]) => {
        if (!user?.name) return;
        const requisitionData = {
            requesterName: user.name,
            requestDate: new Date().toISOString(),
            items,
            status: RequisitionStatus.PENDING,
        };
        await addPurchaseRequisition(requisitionData);
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <p className="text-gray-500 dark:text-gray-400">Gerencie peças e consumíveis para manutenção.</p>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button onClick={() => setCurrentPage('stockReconciliation')} className="btn btn-secondary">
                        <ClipboardCheckIcon className="w-5 h-5 mr-2" />
                        Contagem
                    </button>
                    <button onClick={() => exportStockToCSV(filteredItems, branding)} className="btn btn-secondary">
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        CSV
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Item
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="mb-4">
                        <label htmlFor="searchFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Buscar Item</label>
                        <input
                            type="text"
                            id="searchFilter"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Buscar por nome, SKU ou localização..."
                        />
                    </div>
                    <StockTable
                        items={filteredItems}
                        onEdit={handleOpenEditModal}
                        onDelete={handleOpenDeleteModal}
                        onRequestPurchase={handleRequestPurchase}
                        onMove={handleOpenMovementModal}
                        onHistory={handleOpenHistoryModal}
                    />
                </div>
            )}

            <AddStockItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={addStockItem}
            />

            {isEditModalOpen && selectedItem && (
                <EditStockItemModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={updateStockItem}
                    item={selectedItem}
                />
            )}

            {isMovementModalOpen && selectedItem && (
                <StockMovementModal
                    isOpen={isMovementModalOpen}
                    onClose={() => setIsMovementModalOpen(false)}
                    item={selectedItem}
                    onConfirm={registerStockMovement}
                />
            )}

            {isHistoryModalOpen && selectedItem && (
                <StockHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    item={selectedItem}
                />
            )}

            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirmar Exclusão"
                    message="Tem certeza de que deseja excluir este item do estoque? Esta ação não pode ser desfeita."
                />
            )}

            <AddRequisitionModal
                isOpen={isRequisitionModalOpen}
                onClose={() => setIsRequisitionModalOpen(false)}
                onSave={handleSaveRequisition}
                initialItem={itemForRequisition}
            />

            <style>{`.btn{display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;transition:background-color .2s}.btn-primary{background-color:rgb(var(--color-primary-600));color:#fff}.btn-primary:hover{background-color:rgb(var(--color-primary-700))}.btn-secondary{background-color:#e5e7eb;color:#1f2937}.btn-secondary:hover{background-color:#d1d5db}.dark .btn-secondary{background-color:#4b5563;color:#e5e7eb}.dark .btn-secondary:hover{background-color:#6b7280}`}</style>
        </div>
    );
};

export default StockPage;
