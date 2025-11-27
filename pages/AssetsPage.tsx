
import React, { useState, useMemo } from 'react';
import { Asset, NewAssetData, AssetStatus } from '../types';
import { useApp } from '../hooks/useApp';
import { useSort } from '../hooks/useSort';
import { useBranding } from '../hooks/useBranding';
import * as ds from '../styles/designSystem';
import { exportAssetsToCSV } from '../utils/csvExporter';
import { calculateAssetHealth } from '../utils/assetUtils';

// Novos componentes de UI
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SegmentedControl from '../components/common/SegmentedControl';
import { PlusIcon, ArrowDownTrayIcon, MapPinIcon, ListBulletIcon } from '../components/common/icons';

// Componentes específicos da página (ainda não refatorados)
import AssetTable from '../components/assets/AssetTable';
import AddAssetModal from '../components/assets/AddAssetModal';
import EditAssetModal from '../components/assets/EditAssetModal';
import AddMaintenanceModal from '../components/assets/AddMaintenanceModal';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Mapa (Leaflet)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type SortableKeys = 'name' | 'purchaseDate' | 'healthScore';
type ViewMode = 'list' | 'map';
type Style = React.CSSProperties;

const AssetsPage: React.FC = () => {
    // Hooks e estado permanecem os mesmos
    const { assets, suppliers, addAsset, updateAsset, deleteAsset, addMaintenance, isLoading, error } = useApp();
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

    // Lógica de dados permanece a mesma
    const enrichedAssets = useMemo(() => assets.map(asset => ({ ...asset, healthScore: calculateAssetHealth(asset), searchableString: `${asset.name} ${asset.type} ${asset.location}`.toLowerCase() })), [assets]);
    const filteredAssets = useMemo(() => enrichedAssets.filter(asset => 
        (statusFilter ? asset.status === statusFilter : true) &&
        (typeFilter ? asset.type === typeFilter : true) &&
        (supplierFilter ? asset.supplierId === supplierFilter : true) &&
        (searchQuery ? searchQuery.toLowerCase().split(' ').filter(kw => kw.trim() !== '').every(keyword => asset.searchableString.includes(keyword)) : true)
    ), [enrichedAssets, statusFilter, typeFilter, searchQuery, supplierFilter]);
    const { sortedItems: sortedAssets, requestSort, sortConfig } = useSort<Asset, SortableKeys>(filteredAssets, 'purchaseDate');
    const currentAssets = sortedAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
    const uniqueAssetTypes = useMemo(() => Array.from(new Set(assets.map(a => a.type))).sort(), [assets]);
    const mapCenter: [number, number] = useMemo(() => {
        const withCoords = assets.filter(a => a.coordinates?.lat);
        if (withCoords.length > 0) return [withCoords[0].coordinates!.lat, withCoords[0].coordinates!.lng];
        return [-23.55052, -46.633308]; // Default a São Paulo
    }, [assets]);

    const confirmDelete = async () => {
        if (assetToDelete) {
            await deleteAsset(assetToDelete);
            setIsDeleteModalOpen(false);
            setAssetToDelete(null);
        }
    };
    
    // Estilos do DS
    const styles: { [key: string]: Style } = {
        page: { padding: `${ds.spacing[4]} ${ds.spacing[8]}`, display: 'flex', flexDirection: 'column', gap: ds.spacing[6] },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: ds.spacing[4] },
        title: { fontSize: ds.typography.fontSizes['2xl'], fontWeight: ds.typography.fontWeights.bold, color: ds.colors.dark.text_primary },
        subtitle: { color: ds.colors.dark.text_secondary, marginTop: ds.spacing[1] },
        actions: { display: 'flex', alignItems: 'center', gap: ds.spacing[3] },
        filterBar: { display: 'grid', gridTemplateColumns: 'repeat(1, 1fr) sm:repeat(2, 1fr) lg:repeat(4, 1fr)', gap: ds.spacing[4], marginBottom: ds.spacing[6] },
        loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' },
        spinner: { width: ds.spacing[12], height: ds.spacing[12], borderTop: `2px solid ${ds.colors.primary.main}`, borderRight: `2px solid ${ds.colors.primary.main}`, borderBottom: '2px solid transparent', borderLeft: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' },
        error: { backgroundColor: ds.colors.error.light, borderLeft: `4px solid ${ds.colors.error.main}`, color: ds.colors.error.main, padding: ds.spacing[4] },
        mapCard: { height: 'calc(100vh - 300px)', padding: ds.spacing[2] },
        mapPopup: { padding: ds.spacing[1], color: ds.colors.light.text_primary },
        mapPopupTitle: { fontSize: ds.typography.fontSizes.md, fontWeight: ds.typography.fontWeights.bold, color: ds.colors.light.text_primary, marginBottom: ds.spacing[1] }
    };

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Gestão de Ativos</h1>
                    <p style={styles.subtitle}>Controle total do inventário físico e digital.</p>
                </div>
                <div style={styles.actions}>
                    <SegmentedControl<ViewMode>
                        name="viewMode"
                        selectedValue={viewMode}
                        onValueChange={setViewMode}
                        options={[
                            { value: 'list', label: <ListBulletIcon style={{width:20, height:20}}/> },
                            { value: 'map', label: <MapPinIcon style={{width:20, height:20}}/> },
                        ]}
                    />
                    <Button variant="secondary" icon={<ArrowDownTrayIcon style={{width:20, height:20}} />} onClick={() => exportAssetsToCSV(sortedAssets, branding)}>CSV</Button>
                    <Button variant="primary" icon={<PlusIcon style={{width:20, height:20}} />} onClick={() => setIsAddModalOpen(true)}>Novo Ativo</Button>
                </div>
            </div>
            
            {error && <div style={styles.error} role="alert"><p>{error}</p></div>}
            
            {isLoading ? (
                <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>
            ) : (
                <>
                    {viewMode === 'list' ? (
                        <Card>
                            <div style={styles.filterBar}>
                                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar ativo..." />
                                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">Todos os Tipos</option>{uniqueAssetTypes.map(t => <option key={t} value={t}>{t}</option>)}</Select>
                                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">Todos os Status</option>{Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}</Select>
                                <Select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}><option value="">Todos Fornecedores</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
                            </div>
                            <AssetTable
                                assets={currentAssets}
                                onEdit={(a) => {setSelectedAsset(a); setIsEditModalOpen(true)}}
                                onAddMaintenance={(a) => {setSelectedAsset(a); setIsMaintenanceModalOpen(true)}}
                                onDelete={(id) => {setAssetToDelete(id); setIsDeleteModalOpen(true)}}
                                requestSort={requestSort}
                                sortConfig={sortConfig}
                                pagination={{ itemsPerPage, totalItems: sortedAssets.length, currentPage, paginate, totalPages }}
                            />
                        </Card>
                    ) : (
                        <Card style={styles.mapCard}>
                            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: ds.borders.radius.lg }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CartoDB' />
                                {assets.filter(a => a.coordinates?.lat).map(asset => (
                                     <Marker key={asset.id} position={[asset.coordinates!.lat, asset.coordinates!.lng]}>
                                        <Popup>
                                            <div style={styles.mapPopup}>
                                                <h3 style={styles.mapPopupTitle}>{asset.name}</h3>
                                                <p><strong>Local:</strong> {asset.location}</p>
                                                <p><strong>Status:</strong> <span style={{color: ds.getStatusColor(asset.status).main}}>{asset.status}</span></p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </Card>
                    )}
                </>
            )}
            
            {isAddModalOpen && <AddAssetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={addAsset} suppliers={suppliers} />}
            {isEditModalOpen && selectedAsset && <EditAssetModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={updateAsset} asset={selectedAsset} suppliers={suppliers} />}
            {isMaintenanceModalOpen && selectedAsset && <AddMaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} onSave={addMaintenance} assetId={selectedAsset.id} />}
            {isDeleteModalOpen && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Excluir Ativo" message="Esta ação não pode ser desfeita." />}
        </div>
    );
};

export default AssetsPage;


