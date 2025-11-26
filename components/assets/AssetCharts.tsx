import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts';
import { Asset, AssetStatus, Invoice, Contract, InvoiceStatus, ContractStatus } from '../../types';
import { calculateLinearDepreciation } from '../../utils/depreciationUtils';
import { formatCurrency } from '../../utils/formatters';

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

const TYPE_COLORS = ['#3b82f6', '#16a34a', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#f59e0b'];

interface AssetTypeChartProps {
  assets: Asset[];
}

export const AssetTypeChart: React.FC<AssetTypeChartProps> = ({ assets }) => {
  const data = useMemo(() => {
    const typeCounts = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ativos por Tipo</h3>
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
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
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
    const dataWithTrend = useMemo(() => {
        const costsByMonth: { [key: string]: number } = {};
        assets.forEach(asset => {
            asset.maintenanceHistory.forEach(record => {
                if (!record.date) return;
                const [year, month] = record.date.split('-').map(Number);
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                costsByMonth[monthKey] = (costsByMonth[monthKey] || 0) + record.cost;
            });
        });

        const sortedMonthKeys = Object.keys(costsByMonth).sort();

        const data = sortedMonthKeys.map(key => {
            const [year, month] = key.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, 2));
            const name = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace('.', '').replace(' de ', '/');
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

            return {
                name: capitalizedName,
                Custo: costsByMonth[key],
            };
        });

        if (data.length < 2) {
            return data;
        }

        // Calculate linear regression trend line
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const n = data.length;

        data.forEach((point, i) => {
            const x = i;
            const y = point.Custo;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        });

        const denominator = n * sumX2 - sumX * sumX;
        const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
        const intercept = (sumY - slope * sumX) / n;

        return data.map((point, i) => ({
            ...point,
            'Tendência': Math.max(0, slope * i + intercept), // Ensure trend isn't negative
        }));

    }, [assets]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custo de Manutenção Mensal</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataWithTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value}`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="Custo" fill="#f97316" />
                    <Line
                        type="monotone"
                        dataKey="Tendência"
                        stroke="#ff7300"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                        activeDot={{ r: 6 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface FinancialOverviewChartProps {
    invoices: Invoice[];
    contracts: Contract[];
    assets: Asset[];
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({ invoices, contracts, assets }) => {
    const chartData = useMemo(() => {
        const data: { name: string; Faturamento: number; Custos: number; Resultado: number }[] = [];
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.getMonth(), year: d.getFullYear(), name: d.toLocaleString('pt-BR', { month: 'short' }) };
        }).reverse();

        months.forEach(m => {
            const revenue = invoices
                .filter(inv => new Date(inv.issueDate).getMonth() === m.month && new Date(inv.issueDate).getFullYear() === m.year && inv.status === InvoiceStatus.PAID)
                .reduce((sum, inv) => sum + inv.total, 0);

            const fixedCosts = contracts
                .filter(c => c.status === ContractStatus.ACTIVE && new Date(c.startDate) <= new Date(m.year, m.month + 1, 0) && new Date(c.endDate) >= new Date(m.year, m.month, 1))
                .reduce((sum, c) => sum + c.monthlyValue, 0);

            const maintenanceCosts = assets
                .flatMap(a => a.maintenanceHistory)
                .filter(mh => {
                    const mhDate = new Date(mh.date);
                    return mhDate.getMonth() === m.month && mhDate.getFullYear() === m.year;
                })
                .reduce((sum, mh) => sum + mh.cost, 0);
            
            const totalCosts = fixedCosts + maintenanceCosts;
            const result = revenue - totalCosts;

            data.push({ name: m.name.charAt(0).toUpperCase() + m.name.slice(1), Faturamento: revenue, Custos: totalCosts, Resultado: result });
        });
        return data;
    }, [invoices, contracts, assets]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visão Financeira (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$${(value as number / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="Faturamento" fill="#22c55e" />
              <Bar dataKey="Custos" fill="#ef4444" />
              <Line type="monotone" dataKey="Resultado" stroke="#3b82f6" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
    );
};
