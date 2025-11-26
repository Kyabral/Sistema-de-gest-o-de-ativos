
import React from 'react';
import { Asset, AssetStatus, DocumentType, ApprovalStatus } from '../../types';
import { ChevronUpDownIcon, ArrowUpIcon, ArrowDownIcon, ExclamationTriangleIcon } from '../common/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import HealthIndicator from '../common/HealthIndicator';
import { useApp } from '../../hooks/useApp';
import Pagination from '../common/Pagination';
import Badge from '../common/Badge';

type SortableKeys = 'name' | 'purchaseDate' | 'healthScore';

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  paginate: (pageNumber: number) => void;
}

interface AssetTableProps {
    assets: Asset[];
    onEdit: (asset: Asset) => void;
    onAddMaintenance: (asset: Asset) => void;
    onDelete: (assetId: string) => void;
    requestSort: (key: SortableKeys) => void;
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    pagination: PaginationProps;
}

const AssetTable: React.FC<AssetTableProps> = ({ assets, onEdit, onAddMaintenance, onDelete, requestSort, sortConfig, pagination }) => {
    const { suppliers } = useApp();

    const getSupplierName = (supplierId?: string) => {
        if (!supplierId) return 'N/A';
        return suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
    };
    
    const getWarrantyStatusIcon = (asset: Asset) => {
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

        const parseDateAsUTC = (dateString: string): Date => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
        };

        const soonestWarranty = asset.documents
            ?.filter(doc => doc.type === DocumentType.WARRANTY && doc.expiryDate)
            .map(doc => {
                const expiration = parseDateAsUTC(doc.expiryDate!);
                const diffTime = expiration.getTime() - todayUTC.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
                return { ...doc, diffDays };
            })
            .sort((a, b) => a.diffDays - b.diffDays)[0];

        if (!soonestWarranty) return null;
        if (soonestWarranty.diffDays < 0) return <ExclamationTriangleIcon className="w-5 h-5 ml-2 text-red-500" title="Garantia expirada!" />;
        if (soonestWarranty.diffDays <= 30) return <ExclamationTriangleIcon className="w-5 h-5 ml-2 text-yellow-500" title={`Garantia expira em ${soonestWarranty.diffDays} dia(s)!`} />;
        return null;
    };

    const renderSortIcon = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronUpDownIcon className="w-4 h-4 ml-1.5 text-gray-400 group-hover:text-gray-500" />;
        return sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-4 h-4 ml-1.5 text-primary-600" /> : <ArrowDownIcon className="w-4 h-4 ml-1.5 text-primary-600" />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inventário de Ativos</h3>
                <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{pagination.totalItems} itens</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold"><button onClick={() => requestSort('name')} className="flex items-center group hover:text-gray-700">Nome do Ativo {renderSortIcon('name')}</button></th>
                            <th scope="col" className="px-6 py-4 font-semibold">Tipo</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Fornecedor</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center"><button onClick={() => requestSort('healthScore')} className="flex items-center group justify-center hover:text-gray-700">Saúde {renderSortIcon('healthScore')}</button></th>
                            <th scope="col" className="px-6 py-4 font-semibold"><button onClick={() => requestSort('purchaseDate')} className="flex items-center group hover:text-gray-700">Compra {renderSortIcon('purchaseDate')}</button></th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Valor</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {assets.map(asset => (
                            <tr key={asset.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center mr-3 text-xs font-bold">
                                            {asset.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm">{asset.name}</p>
                                            {getWarrantyStatusIcon(asset) && <span className="text-xs text-red-500 flex items-center mt-0.5">Garantia expirando</span>}
                                        </div>
                                    </div>
                                </th>
                                <td className="px-6 py-4">{asset.type}</td>
                                <td className="px-6 py-4 text-gray-500">{getSupplierName(asset.supplierId)}</td>
                                <td className="px-6 py-4 text-center"><HealthIndicator score={asset.healthScore} /></td>
                                <td className="px-6 py-4 text-gray-500">{formatDate(asset.purchaseDate)}</td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(asset.purchaseValue)}</td>
                                <td className="px-6 py-4 text-center">
                                    <Badge status={asset.status} type="asset" />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-3">
                                        {!asset.isConsumable && (
                                            <button onClick={() => onAddMaintenance(asset)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Manutenção">
                                                <WrenchIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => onEdit(asset)} className="text-gray-400 hover:text-yellow-600 transition-colors" title="Editar">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDelete(asset.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Excluir">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {assets.length === 0 && pagination.totalItems > 0 && (<div className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum ativo para exibir nesta página.</div>)}
                 {pagination.totalItems === 0 && (<div className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum ativo encontrado.</div>)}
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <Pagination {...pagination} />
            </div>
        </div>
    );
};

// Simple icons locally defined to avoid changing icons.tsx heavily if not needed, or better, update icons.tsx
const WrenchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.474-4.474c-.047-.58-.188-1.193-.332-1.743L14 12l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c-.55-.164-1.163-.188-1.743-.14a4.5 4.5 0 00-4.474-4.474c-.047-.58-.188-1.193-.332-1.743L14 12" clipRule="evenodd" />
    </svg>
);
const PencilIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
    </svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.56 12.57c-.04.962-.81 1.733-1.771 1.733H6.544c-.96 0-1.731-.77-1.771-1.734l-.56-12.57a48.829 48.829 0 013.878-.512V4.478c0-.69.527-1.26 1.215-1.337a48.963 48.963 0 016.196 0c.688.077 1.215.647 1.215 1.337zM15 6.75a.75.75 0 10-1.5 0v8.25a.75.75 0 101.5 0v-8.25zm-4.5 0a.75.75 0 10-1.5 0v8.25a.75.75 0 101.5 0v-8.25z" clipRule="evenodd" />
    </svg>
);

export default AssetTable;
