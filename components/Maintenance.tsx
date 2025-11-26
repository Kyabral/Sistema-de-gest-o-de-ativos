

import React, { useMemo, useState } from 'react';
import { Asset, MaintenanceRecord, AssetStatus } from '../types';
import { useApp } from '../hooks/useApp';
import { formatCurrency, formatDate } from '../utils/formatters';

interface MaintenanceProps {
    assets: Asset[];
    onUpdateAsset: (asset: Asset) => Promise<void>;
}

interface EnrichedMaintenanceRecord extends MaintenanceRecord {
    assetId: string;
    assetName: string;
    assetStatus: AssetStatus;
}

const Maintenance: React.FC<MaintenanceProps> = ({ assets, onUpdateAsset }) => {
    const [filter, setFilter] = useState('all');
    // FIX: Get suppliers from app context to resolve supplierId to name.
    const { suppliers } = useApp();

    const getSupplierName = (supplierId?: string) => {
        if (!supplierId) return 'N/A';
        return suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
    };

    const allMaintenanceRecords: EnrichedMaintenanceRecord[] = useMemo(() => {
        return assets
            .flatMap(asset =>
                asset.maintenanceHistory.map(record => ({
                    ...record,
                    assetId: asset.id,
                    assetName: asset.name,
                    assetStatus: asset.status,
                }))
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [assets]);

    const filteredRecords = useMemo(() => {
        if (filter === 'in_repair') {
            return allMaintenanceRecords.filter(rec => rec.assetStatus === AssetStatus.IN_REPAIR);
        }
        return allMaintenanceRecords;
    }, [allMaintenanceRecords, filter]);

    const totalCost = useMemo(() => {
        return filteredRecords.reduce((sum, record) => sum + record.cost, 0);
    }, [filteredRecords]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gerenciamento de Manutenção</h1>
                    <p className="text-gray-500 dark:text-gray-400">Histórico de todas as manutenções registradas.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            Todos
                        </button>
                         <button onClick={() => setFilter('in_repair')} className={`px-3 py-1 text-sm rounded-md ${filter === 'in_repair' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            Em Reparo
                        </button>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Custo Total</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCost)}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Ativo</th>
                                <th scope="col" className="px-6 py-3">Descrição do Serviço</th>
                                <th scope="col" className="px-6 py-3">Fornecedor</th>
                                <th scope="col" className="px-6 py-3 text-right">Custo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">{formatDate(record.date)}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {record.assetName}
                                    </th>
                                    <td className="px-6 py-4">{record.description}</td>
                                    {/* FIX: Use supplierId and getSupplierName to display the supplier's name. */}
                                    <td className="px-6 py-4">{getSupplierName(record.supplierId)}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(record.cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredRecords.length === 0 && (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            Nenhum registro de manutenção encontrado para o filtro selecionado.
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default Maintenance;