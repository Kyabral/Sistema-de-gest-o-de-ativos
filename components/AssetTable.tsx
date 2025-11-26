

import React from 'react';
import { Asset, AssetStatus, DocumentType, ApprovalStatus } from '../types';
import { ChevronUpDownIcon, ArrowUpIcon, ArrowDownIcon, ExclamationTriangleIcon } from './icons';

const getStatusBadge = (status: AssetStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block text-white";
    switch (status) {
        case AssetStatus.ACTIVE:
            return `${baseClasses} bg-green-500`;
        case AssetStatus.IN_REPAIR:
            return `${baseClasses} bg-orange-500`;
        case AssetStatus.DECOMMISSIONED:
            return `${baseClasses} bg-slate-600`;
        case AssetStatus.IDLE:
            return `${baseClasses} bg-blue-500`;
        default:
            return `${baseClasses} bg-gray-500`;
    }
};

const getApprovalStatusBadge = (status: ApprovalStatus) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full inline-block text-white whitespace-nowrap";
    switch (status) {
        case ApprovalStatus.APPROVED:
            return `${baseClasses} bg-teal-500`;
        case ApprovalStatus.AUTO_APPROVED:
            return `${baseClasses} bg-sky-500`;
        case ApprovalStatus.PENDING:
            return `${baseClasses} bg-amber-500`;
        case ApprovalStatus.REJECTED:
            return `${baseClasses} bg-rose-500`;
        default:
            return `${baseClasses} bg-gray-500`;
    }
};

const HealthIndicator = ({ score }: { score: number | undefined }) => {
    if (score === undefined) return <span>N/A</span>;
    const getColor = () => {
        if (score > 70) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center justify-center" title={`Saúde: ${score}%`}>
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className={`${getColor()} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${score}%` }}></div>
            </div>
            <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">{score}%</span>
        </div>
    );
};

const StockLevelIndicator = ({ quantity, reorderLevel }: { quantity: number | undefined, reorderLevel: number | undefined }) => {
    if (quantity === undefined || reorderLevel === undefined || reorderLevel === 0) {
        return <span title={`Estoque: ${quantity ?? 'N/A'}`}>{quantity ?? 'N/A'}</span>;
    }

    // Define uma barra "cheia" como 2x o nível de reabastecimento para escala visual.
    const maxStock = reorderLevel * 2;
    const percentage = Math.min((quantity / maxStock) * 100, 100);

    const getColor = () => {
        if (quantity > reorderLevel) return 'bg-green-500';
        if (quantity > 0) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center justify-center space-x-2 w-full" title={`Estoque: ${quantity} | Mínimo: ${reorderLevel}`}>
            <span className="text-sm font-bold w-8 text-right tabular-nums">{quantity}</span>
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                <div 
                    className={`${getColor()} h-3 rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                ></div>
                {/* Adiciona um marcador para o nível de reabastecimento */}
                <div 
                    className="absolute top-0 h-full w-0.5 bg-red-500/70"
                    style={{ left: `50%` }} // reorderLevel é 50% de maxStock
                    title={`Nível de reabastecimento: ${reorderLevel}`}
                ></div>
            </div>
        </div>
    );
};

type SortableKeys = 'name' | 'purchaseDate' | 'healthScore';

interface AssetTableProps {
    assets: Asset[];
    onEdit: (asset: Asset) => void;
    onAddMaintenance: (asset: Asset) => void;
    onDelete: (assetId: string) => void;
    requestSort: (key: SortableKeys) => void;
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
}

const AssetTable: React.FC<AssetTableProps> = ({ assets, onEdit, onAddMaintenance, onDelete, requestSort, sortConfig }) => {
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const getExpirationRowClass = (expirationDate: string): string => {
        if (!expirationDate) return '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [year, month, day] = expirationDate.split('-').map(Number);
        const expiration = new Date(year, month - 1, day);

        const diffTime = expiration.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return 'bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60';
        }
        if (diffDays >= 0 && diffDays <= 30) {
            return 'bg-yellow-50 dark:bg-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/60';
        }

        return '';
    };

    const getWarrantyStatusIcon = (asset: Asset) => {
        if (asset.isConsumable || !asset.documents || asset.documents.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let soonestExpiryDays: number | null = null;
        let isExpired = false;

        asset.documents.forEach(doc => {
            if (doc.type === DocumentType.WARRANTY && doc.expiryDate) {
                const [year, month, day] = doc.expiryDate.split('-').map(Number);
                const expiration = new Date(Date.UTC(year, month - 1, day));
                const diffTime = expiration.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                    isExpired = true;
                } else if (diffDays <= 30) {
                    if (soonestExpiryDays === null || diffDays < soonestExpiryDays) {
                        soonestExpiryDays = diffDays;
                    }
                }
            }
        });

        if (isExpired) {
            return <ExclamationTriangleIcon className="w-5 h-5 ml-2 text-red-500" title="Garantia expirada!" />;
        }
        if (soonestExpiryDays !== null) {
            return <ExclamationTriangleIcon className="w-5 h-5 ml-2 text-yellow-500" title={`Garantia expira em ${soonestExpiryDays} dia(s)!`} />;
        }

        return null;
    };

    const renderSortIcon = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronUpDownIcon className="w-4 h-4 ml-1.5 text-gray-400 group-hover:text-gray-500" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ArrowUpIcon className="w-4 h-4 ml-1.5 text-primary-600" />;
        }
        return <ArrowDownIcon className="w-4 h-4 ml-1.5 text-primary-600" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Todos os Ativos</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <button onClick={() => requestSort('name')} className="flex items-center group w-full">
                                    Nome do Ativo
                                    {renderSortIcon('name')}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-center">
                                <button onClick={() => requestSort('healthScore')} className="flex items-center group w-full justify-center">
                                    Nível / Saúde
                                    {renderSortIcon('healthScore')}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                 <button onClick={() => requestSort('purchaseDate')} className="flex items-center group w-full">
                                    Data da Compra
                                    {renderSortIcon('purchaseDate')}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-right">Valor</th>
                            <th scope="col" className="px-6 py-3 text-center">Status do Ativo</th>
                            <th scope="col" className="px-6 py-3 text-center">Status Manutenções</th>
                            <th scope="col" className="px-6 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id} className={`border-b dark:border-gray-700 ${getExpirationRowClass(asset.expirationDate) || 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex items-center">
                                       {asset.name}
                                       {getWarrantyStatusIcon(asset)}
                                    </div>
                                </th>
                                <td className="px-6 py-4">{asset.type}</td>
                                <td className="px-6 py-4">
                                    {asset.isConsumable ? (
                                        <StockLevelIndicator quantity={asset.quantity} reorderLevel={asset.reorderLevel} />
                                    ) : (
                                        <HealthIndicator score={asset.healthScore} />
                                    )}
                                </td>
                                <td className="px-6 py-4">{formatDate(asset.purchaseDate)}</td>
                                <td className="px-6 py-4 text-right">{asset.isConsumable ? 'N/A' : formatCurrency(asset.purchaseValue)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={getStatusBadge(asset.status)}>{asset.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center space-y-1">
                                    {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
                                        asset.maintenanceHistory
                                            .slice()
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map(maint => (
                                                <span key={maint.id} className={getApprovalStatusBadge(maint.status)} title={`${maint.description} - ${formatDate(maint.date)}`}>
                                                    {maint.status}
                                                </span>
                                            ))
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                    )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    {!asset.isConsumable && (
                                    <button onClick={() => onAddMaintenance(asset)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline" title="Adicionar Manutenção">
                                        Manutenção
                                    </button>
                                    )}
                                    <button onClick={() => onEdit(asset)} className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline" title="Editar Ativo">
                                        Editar
                                    </button>
                                    <button onClick={() => onDelete(asset.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline" title="Excluir Ativo">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {assets.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        Nenhum ativo encontrado para os filtros selecionados.
                    </div>
                 )}
            </div>
        </div>
    );
};

export default AssetTable;