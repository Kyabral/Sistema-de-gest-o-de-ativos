
import React, { useState, useMemo } from 'react';
import { Asset, NewAssetData, AssetStatus } from '../types';
import { useApp } from '../hooks/useApp';
import { useSort } from '../hooks/useSort';
import AssetTable from '../components/assets/AssetTable';
import AddAssetModal from '../components/assets/AddAssetModal';
import EditAssetModal from '../components/assets/EditAssetModal';
import AddMaintenanceModal from '../components/assets/AddMaintenanceModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { PlusIcon, ArrowDownTrayIcon, MapPinIcon, ListBulletIcon } from '../components/common/icons';
import { exportAssetsToCSV } from '../utils/csvExporter';
import { calculateAssetHealth } from '../utils/assetUtils';
import { useBranding } from '../hooks/useBranding';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type SortableKeys = 'name' | 'purchaseDate' | 'healthScore';
type ViewMode = 'list' | 'map';

const AssetsPage: React.FC = () => {
    const { 
        assets, suppliers, 
        addAsset, updateAsset, deleteAsset, addMaintenance, 
        isLoading, error
    } = useApp();
    const { branding } = useBranding();
    
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const enrichedAssets = useMemo(() => assets.map(asset => ({
        ...asset,
        healthScore: calculateAssetHealth(asset),
    })), [assets]);

    const filteredAssets = useMemo(() => {
        const keywords = searchQuery.toLowerCase().split(' ').filter(kw => kw.trim() !== '');
        return enrichedAssets.filter(asset => {
            const byStatus = statusFilter ? asset.status === statusFilter : true;
            const byType = typeFilter ? asset.type === typeFilter : true;
            const bySupplier = supplierFilter ? asset.supplierId === supplierFilter : true;
            const bySearch = searchQuery
                ? keywords.every(keyword => `${asset.name} ${asset.type} ${asset.location}`.toLowerCase().includes(keyword))
                : true;
            return byStatus && byType && bySearch && bySupplier;
        });
    }, [enrichedAssets, statusFilter, typeFilter, searchQuery, supplierFilter]);
    
    const { sortedItems: sortedAssets, requestSort, sortConfig } = useSort<Asset, SortableKeys>(filteredAssets, 'purchaseDate');

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssets = sortedAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber);
    };

    const uniqueAssetTypes = useMemo(() => Array.from(new Set(assets.map(a => a.type))).sort(), [assets]);

    const mapCenter: [number, number] = useMemo(() => {
        const withCoords = assets.filter(a => a.coordinates?.lat);
        if (withCoords.length > 0) return [withCoords[0].coordinates!.lat, withCoords[0].coordinates!.lng];
        return [-23.55052, -46.633308];
    }, [assets]);

    const getStatusColor = (status: AssetStatus) => {
        switch (status) {
            case AssetStatus.ACTIVE: return 'text-green-600';
            case AssetStatus.IN_REPAIR: return 'text-orange-600';
            case AssetStatus.DECOMMISSIONED: return 'text-slate-600';
            default: return 'text-gray-600';
        }
    }

    const confirmDelete = async () => {
        if (assetToDelete) {
            await deleteAsset(assetToDelete);
            setIsDeleteModalOpen(false);
            setAssetToDelete(null);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestão de Ativos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Controle total do inventário físico e digital.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 flex border dark:border-gray-700 mr-2">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'text-gray-500'}`} title="Lista"><ListBulletIcon className="w-5 h-5"/></button>
                        <button onClick={() => setViewMode('map')} className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'text-gray-500'}`} title="Mapa"><MapPinIcon className="w-5 h-5"/></button>
                    </div>
                    <button onClick={() => exportAssetsToCSV(sortedAssets, branding)} className="btn btn-secondary"><ArrowDownTrayIcon className="w-5 h-5 mr-2" />CSV</button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Novo Ativo</button>
                </div>
            </div>
            
             {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}
            
            {isLoading ? (
                 <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="lg:col-span-1"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-style w-full" placeholder="Buscar ativo..." /></div>
                                <div><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-style w-full"><option value="">Todos os Tipos</option>{uniqueAssetTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                <div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-style w-full"><option value="">Todos os Status</option>{Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="input-style w-full"><option value="">Todos Fornecedores</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            </div>
                            <AssetTable
                                assets={currentAssets}
                                onEdit={(a) => {setSelectedAsset(a); setIsEditModalOpen(true)}}
                                onAddMaintenance={(a) => {setSelectedAsset(a); setIsMaintenanceModalOpen(true)}}
                                onDelete={(id) => {setAssetToDelete(id); setIsDeleteModalOpen(true)}}
                                requestSort={requestSort}
                                sortConfig={sortConfig}
                                pagination={{ itemsPerPage, totalItems: sortedAssets.length, currentPage, paginate }}
                            />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-[calc(100vh-250px)] p-4">
                             <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
                                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {assets.filter(a => a.coordinates?.lat).map(asset => (
                                     <Marker key={asset.id} position={[asset.coordinates!.lat, asset.coordinates!.lng]}>
                                        <Popup>
                                            <div className="p-1">
                                                <h3 className="font-bold text-md mb-1 text-gray-800">{asset.name}</h3>
                                                <p className="text-sm text-gray-600"><strong>Local:</strong> {asset.location}</p>
                                                <p className="text-sm text-gray-600"><strong>Status:</strong> <span className={`font-semibold ${getStatusColor(asset.status)}`}>{asset.status}</span></p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    )}
                </>
            )}
            
            {isAddModalOpen && <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={addAsset} />}
            {isEditModalOpen && selectedAsset && <EditAssetModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={updateAsset} asset={selectedAsset} />}
            {isMaintenanceModalOpen && selectedAsset && <AddMaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} onSave={addMaintenance} assetId={selectedAsset.id} />}
            {isDeleteModalOpen && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Excluir Ativo" message="Esta ação não pode ser desfeita." />}
             <style>{`.btn {display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1rem;font-weight:500;border-radius:0.5rem;}.btn-primary {background-color:rgb(var(--color-primary-600));color:#fff}.btn-secondary {background-color:#e5e7eb;color:#1f2937}.input-style{padding:0.5rem;border-radius:0.5rem;border:1px solid #d1d5db;background-color:#f9fafb}.dark .input-style{background-color:#374151;border-color:#4b5563;color:white}`}</style>
        </div>
    );
};

export default AssetsPage;
