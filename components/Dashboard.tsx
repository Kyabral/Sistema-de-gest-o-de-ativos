

import React, { useState, useMemo } from 'react';
import { Asset, NewAssetData, AssetStatus, NewMaintenanceData, DocumentType } from '../types';
import MetricCard from './MetricCard';
import { AssetStatusChart, MaintenanceCostChart, AssetDepreciationChart } from './Charts';
import AssetTable from './AssetTable';
import AIAssistant from './AIAssistant';
import AddAssetModal from './AddAssetModal';
import EditAssetModal from './EditAssetModal';
import AddMaintenanceModal from './AddMaintenanceModal';
import ConfirmationModal from './ConfirmationModal';
import { PlusIcon, CircleStackIcon, WrenchScrewdriverIcon, BuildingOfficeIcon, ArrowDownTrayIcon, ExclamationTriangleIcon as ShieldExclamationIcon } from './icons';
import { exportAssetsToCSV } from '../utils/csvExporter';
import { calculateAssetHealth } from '../utils/assetUtils';
import { useBranding } from '../hooks/useBranding';

interface DashboardProps {
    assets: Asset[];
    onAddAsset: (assetData: NewAssetData) => Promise<void>;
    onUpdateAsset: (asset: Asset) => Promise<void>;
    onDeleteAsset: (assetId: string) => Promise<void>;
    onAddMaintenance: (maintenanceData: NewMaintenanceData) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

type SortableKeys = 'name' | 'purchaseDate' | 'healthScore';

const Dashboard: React.FC<DashboardProps> = ({ assets, onAddAsset, onUpdateAsset, onDeleteAsset, onAddMaintenance, isLoading, error }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

    // State for filtering and sorting
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'purchaseDate', direction: 'descending' });

    // FIX: Add useBranding hook to get company name for CSV export.
    const { branding } = useBranding();

    const enrichedAssets = useMemo(() => {
        return assets.map(asset => ({
            ...asset,
            healthScore: calculateAssetHealth(asset),
        }));
    }, [assets]);

    const uniqueAssetTypes = useMemo(() => {
        const types = new Set(assets.map(asset => asset.type));
        return Array.from(types).sort();
    }, [assets]);

    const filteredAndSortedAssets = useMemo(() => {
        let processableAssets = [...enrichedAssets];

        // Filtering logic
        if (statusFilter) {
            processableAssets = processableAssets.filter(asset => asset.status === statusFilter);
        }
        if (typeFilter) {
            processableAssets = processableAssets.filter(asset => asset.type === typeFilter);
        }
        if (locationFilter) {
            processableAssets = processableAssets.filter(asset =>
                asset.location.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        // Sorting logic
        if (sortConfig !== null) {
            processableAssets.sort((a, b) => {
                const valA = a[sortConfig.key] ?? 0;
                const valB = b[sortConfig.key] ?? 0;

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return processableAssets;
    }, [enrichedAssets, statusFilter, typeFilter, locationFilter, sortConfig]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const resetFilters = () => {
        setStatusFilter('');
        setTypeFilter('');
        setLocationFilter('');
    };
    
    const handleOpenEditModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsEditModalOpen(true);
    };

    const handleOpenMaintenanceModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsMaintenanceModalOpen(true);
    };
    
    const handleOpenDeleteModal = (assetId: string) => {
        setAssetToDelete(assetId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (assetToDelete) {
            await onDeleteAsset(assetToDelete);
            setIsDeleteModalOpen(false);
            setAssetToDelete(null);
        }
    };
    
    const metrics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiringWarrantiesCount = assets.reduce((count, asset) => {
            if (!asset.documents) return count;
            const hasExpiringWarranty = asset.documents.some(doc => {
                if (doc.type !== DocumentType.WARRANTY || !doc.expiryDate) return false;
                
                const [year, month, day] = doc.expiryDate.split('-').map(Number);
                const expiration = new Date(Date.UTC(year, month - 1, day));
                const diffTime = expiration.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 30;
            });
            return count + (hasExpiringWarranty ? 1 : 0);
        }, 0);

        const totalValue = assets.reduce((sum, asset) => sum + asset.purchaseValue, 0);
        const inRepairCount = assets.filter(a => a.status === AssetStatus.IN_REPAIR).length;
        const totalMaintenanceCost = assets.reduce((sum, asset) => sum + asset.maintenanceHistory.reduce((mSum, m) => mSum + m.cost, 0), 0);
        
        return { totalValue, inRepairCount, totalMaintenanceCost, expiringWarrantiesCount };
    }, [assets]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const inputClasses = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500";


    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard de Ativos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Visão geral do inventário da sua empresa.</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    {/* FIX: Pass the entire branding object to the CSV export function. */}
                    <button onClick={() => exportAssetsToCSV(assets, branding)} className="btn btn-secondary">
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Exportar CSV
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Ativo
                    </button>
                </div>
            </div>
            
             {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}
            
            {isLoading ? (
                 <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard title="Total de Ativos" value={assets.length.toString()} icon={<CircleStackIcon className="w-8 h-8 text-white"/>} color="bg-blue-500" />
                        <MetricCard title="Valor Total" value={formatCurrency(metrics.totalValue)} icon={<BuildingOfficeIcon className="w-8 h-8 text-white"/>} color="bg-green-500" />
                        <MetricCard title="Em Manutenção" value={metrics.inRepairCount.toString()} icon={<WrenchScrewdriverIcon className="w-8 h-8 text-white"/>} color="bg-orange-500" />
                        <MetricCard title="Garantias Vencendo" value={metrics.expiringWarrantiesCount.toString()} icon={<ShieldExclamationIcon className="w-8 h-8 text-white"/>} color="bg-yellow-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3">
                            <AIAssistant assets={assets} />
                        </div>
                        <div className="lg:col-span-2">
                             <AssetStatusChart assets={assets} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MaintenanceCostChart assets={assets} />
                        <AssetDepreciationChart assets={assets} />
                    </div>

                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label htmlFor="locationFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filtrar por Localização</label>
                                    <input 
                                        type="text" 
                                        id="locationFilter"
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                        className={inputClasses}
                                        placeholder="Digite a localização..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="typeFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filtrar por Tipo</label>
                                    <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputClasses}>
                                        <option value="">Todos os Tipos</option>
                                        {uniqueAssetTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="statusFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filtrar por Status</label>
                                    <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
                                        <option value="">Todos os Status</option>
                                        {Object.values(AssetStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <button onClick={resetFilters} className="w-full btn btn-secondary h-[42px]">Limpar Filtros</button>
                                </div>
                            </div>
                        </div>

                        <AssetTable
                            assets={filteredAndSortedAssets}
                            onEdit={handleOpenEditModal}
                            onAddMaintenance={handleOpenMaintenanceModal}
                            onDelete={handleOpenDeleteModal}
                            requestSort={requestSort}
                            sortConfig={sortConfig}
                        />
                    </div>
                </>
            )}
            
            {isAddModalOpen && <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={onAddAsset} />}
            
            {isEditModalOpen && selectedAsset && (
                <EditAssetModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSave={onUpdateAsset} 
                    asset={selectedAsset} 
                />
            )}
            
            {isMaintenanceModalOpen && selectedAsset && (
                 <AddMaintenanceModal 
                    isOpen={isMaintenanceModalOpen} 
                    onClose={() => setIsMaintenanceModalOpen(false)} 
                    onSave={onAddMaintenance} 
                    assetId={selectedAsset.id}
                 />
            )}

            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Confirmar Exclusão"
                    message="Tem certeza de que deseja excluir este ativo? Esta ação não pode ser desfeita."
                />
            )}
             <style>{`
              .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; font-weight: 500; border-radius: 0.5rem; transition: background-color 0.2s; }
              .btn-primary { background-color: #4f46e5; color: white; }
              .btn-primary:hover { background-color: #4338ca; }
              .btn-secondary { background-color: #e5e7eb; color: #1f2937; }
              .btn-secondary:hover { background-color: #d1d5db; }
              .dark .btn-secondary { background-color: #4b5563; color: #e5e7eb; }
              .dark .btn-secondary:hover { background-color: #6b7280; }
            `}</style>
        </div>
    );
};

export default Dashboard;