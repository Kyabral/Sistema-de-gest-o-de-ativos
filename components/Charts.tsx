import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Asset, AssetStatus } from '../types';

const STATUS_COLORS: { [key in AssetStatus]: string } = {
  [AssetStatus.ACTIVE]: '#22c55e', // green-500
  [AssetStatus.IN_REPAIR]: '#f97316', // orange-500
  [AssetStatus.DECOMMISSIONED]: '#64748b', // slate-500
  [AssetStatus.IDLE]: '#3b82f6', // blue-500
};

interface AssetStatusChartProps {
  assets: Asset[];
}

export const AssetStatusChart: React.FC<AssetStatusChartProps> = ({ assets }) => {
  const data = useMemo(() => {
    const statusCounts = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<AssetStatus, number>);
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ativos por Status</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as AssetStatus]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} ativo(s)`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MaintenanceCostChartProps {
    assets: Asset[];
}

export const MaintenanceCostChart: React.FC<MaintenanceCostChartProps> = ({ assets }) => {
    const data = useMemo(() => {
        const costsByMonth: { [key: string]: number } = {};
        assets.forEach(asset => {
            asset.maintenanceHistory.forEach(record => {
                if (!record.date) return;
                // Use 'YYYY-MM' format for keys to make sorting chronological and simple
                const [year, month] = record.date.split('-').map(Number);
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                costsByMonth[monthKey] = (costsByMonth[monthKey] || 0) + record.cost;
            });
        });

        // The 'YYYY-MM' keys can be sorted lexicographically, ensuring chronological order
        const sortedMonthKeys = Object.keys(costsByMonth).sort();

        return sortedMonthKeys.map(key => {
            const [year, month] = key.split('-').map(Number);
            // Create a date object to format the month name for display
            const date = new Date(Date.UTC(year, month - 1, 2));
            
            const name = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
                           .replace('.', '') // Remove potential dot from month like 'jan.'
                           .replace(' de ', '/'); // Standardize format to 'Mês/Ano'
                           
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

            return {
                name: capitalizedName,
                Custo: costsByMonth[key],
            };
        });
    }, [assets]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custo de Manutenção Mensal</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value}`} />
                    <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
                    <Legend />
                    <Bar dataKey="Custo" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


interface AssetDepreciationChartProps {
    assets: Asset[];
}

const ASSET_LIFESPAN_YEARS = 5; // Padrão de 5 anos para depreciação linear

export const AssetDepreciationChart: React.FC<AssetDepreciationChartProps> = ({ assets }) => {
    const [selectedAssetId, setSelectedAssetId] = useState<string>(assets.length > 0 ? assets[0].id : '');

    const depreciationData = useMemo(() => {
        const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
        if (!selectedAsset) return [];

        const data = [];
        const yearlyDepreciation = selectedAsset.purchaseValue / ASSET_LIFESPAN_YEARS;

        for (let i = 0; i <= ASSET_LIFESPAN_YEARS; i++) {
            const currentValue = selectedAsset.purchaseValue - (yearlyDepreciation * i);
            const purchaseYear = new Date(selectedAsset.purchaseDate).getFullYear();
            data.push({
                year: purchaseYear + i,
                Valor: Math.max(0, currentValue), // Garante que o valor não seja negativo
            });
        }
        return data;
    }, [selectedAssetId, assets]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">Depreciação de Ativos</h3>
                <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-1/2 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    aria-label="Selecione um ativo para ver a depreciação"
                >
                    {assets.length === 0 ? (
                      <option value="">Nenhum ativo disponível</option>
                    ) : (
                      assets.map(asset => (
                          <option key={asset.id} value={asset.id}>{asset.name}</option>
                      ))
                    )}
                </select>
            </div>
            {selectedAssetId ? (
                 <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={depreciationData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `R$${(value as number / 1000).toFixed(0)}k`} domain={[0, 'dataMax']} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Valor" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>Selecione um ativo para ver sua curva de depreciação.</p>
                </div>
            )}
        </div>
    );
};