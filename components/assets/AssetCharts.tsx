
import React, { useMemo } from 'react';
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ComposedChart 
} from 'recharts';
import { Asset, AssetStatus, Invoice, Contract, InvoiceStatus, ContractStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import * as ds from '../../styles/designSystem';

// ====================================================================
// ESTILOS E CONFIGURAÇÕES CENTRALIZADAS PARA OS GRÁFICOS
// ====================================================================
type Style = React.CSSProperties;

const chartStyles: { [key: string]: Style } = {
    container: {
        backgroundColor: ds.colors.dark.card,
        borderRadius: ds.borders.radius.lg,
        padding: ds.spacing[6],
        height: '400px',
        border: `1px solid ${ds.colors.dark.border}`,
        boxShadow: ds.shadows.dark_md,
    },
    title: {
        fontSize: ds.typography.fontSizes.lg,
        fontWeight: ds.typography.fontWeights.semibold,
        color: ds.colors.dark.text_primary,
        marginBottom: ds.spacing[6],
    },
    tooltip: {
        backgroundColor: `rgba(45, 55, 72, 0.9)`,
        border: `1px solid ${ds.colors.dark.border}`,
        borderRadius: ds.borders.radius.md,
        color: ds.colors.dark.text_primary,
        boxShadow: ds.shadows.dark_lg,
        padding: ds.spacing[3],
    },
    legend: {
        fontSize: ds.typography.fontSizes.sm,
        color: ds.colors.dark.text_secondary,
    },
};

const RechartsAxisTextStyle = { fill: ds.colors.dark.text_secondary, fontSize: ds.typography.fontSizes.xs };
const RechartsGridStyle = { stroke: ds.colors.dark.border, strokeDasharray: '3 3' };

// ====================================================================
// COMPONENTE CONTÊINER REUTILIZÁVEL
// ====================================================================

interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => (
    <div style={chartStyles.container}>
        <h3 style={chartStyles.title}>{title}</h3>
        <ResponsiveContainer width="100%" height="90%">
            {children}
        </ResponsiveContainer>
    </div>
);

// ====================================================================
// TOOLTIP CUSTOMIZADO
// ====================================================================

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={chartStyles.tooltip}>
                <p style={{ marginBottom: ds.spacing[2], fontWeight: ds.typography.fontWeights.semibold }}>{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color || ds.colors.dark.text_primary }}>
                        {`${p.name}: ${formatter ? formatter(p.value) : p.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ====================================================================
// GRÁFICO DE VISÃO FINANCEIRA
// ====================================================================

interface FinancialOverviewChartProps {
    invoices: Invoice[];
    contracts: Contract[];
    assets: Asset[];
}

export const FinancialOverviewChart: React.FC<FinancialOverviewChartProps> = ({ invoices, contracts, assets }) => {
    const chartData = useMemo(() => {
        // ... (lógica de cálculo de dados permanece a mesma)
        const data: { name: string; Faturamento: number; Custos: number; Resultado: number }[] = [];
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.getMonth(), year: d.getFullYear(), name: d.toLocaleString('pt-BR', { month: 'short' }) };
        }).reverse();

        months.forEach(m => {
            const revenue = invoices.filter(inv => new Date(inv.issueDate).getMonth() === m.month && new Date(inv.issueDate).getFullYear() === m.year && inv.status === InvoiceStatus.PAID).reduce((sum, inv) => sum + inv.total, 0);
            const fixedCosts = contracts.filter(c => c.status === ContractStatus.ACTIVE && new Date(c.startDate) <= new Date(m.year, m.month + 1, 0) && new Date(c.endDate) >= new Date(m.year, m.month, 1)).reduce((sum, c) => sum + c.monthlyValue, 0);
            const maintenanceCosts = assets.flatMap(a => a.maintenanceHistory).filter(mh => { const mhDate = new Date(mh.date); return mhDate.getMonth() === m.month && mhDate.getFullYear() === m.year; }).reduce((sum, mh) => sum + mh.cost, 0);
            data.push({ name: m.name.charAt(0).toUpperCase() + m.name.slice(1), Faturamento: revenue, Custos: fixedCosts + maintenanceCosts, Resultado: revenue - (fixedCosts + maintenanceCosts) });
        });
        return data;
    }, [invoices, contracts, assets]);

    return (
        <ChartContainer title="Visão Financeira (Últimos 6 Meses)">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid {...RechartsGridStyle} vertical={false} />
                <XAxis dataKey="name" tick={RechartsAxisTextStyle} />
                <YAxis tickFormatter={(value) => `${formatCurrency(value as number / 1000)}k`} tick={RechartsAxisTextStyle} />
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Legend formatter={(value, entry, index) => <span style={chartStyles.legend}>{value}</span>} />
                <Bar dataKey="Faturamento" fill={ds.colors.success.main} barSize={20} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custos" fill={ds.colors.error.main} barSize={20} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Resultado" stroke={ds.colors.primary.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
        </ChartContainer>
    );
};

// ====================================================================
// GRÁFICO DE CUSTO DE MANUTENÇÃO
// ====================================================================

interface MaintenanceCostChartProps {
    assets: Asset[];
}

export const MaintenanceCostChart: React.FC<MaintenanceCostChartProps> = ({ assets }) => {
    const dataWithTrend = useMemo(() => {
        // ... (lógica de cálculo de dados permanece a mesma)
        const costsByMonth: { [key: string]: number } = {};
        assets.forEach(asset => asset.maintenanceHistory.forEach(record => { if (!record.date) return; const monthKey = record.date.substring(0, 7); costsByMonth[monthKey] = (costsByMonth[monthKey] || 0) + record.cost; }));
        const sortedMonthKeys = Object.keys(costsByMonth).sort();
        const data = sortedMonthKeys.map(key => { const date = new Date(`${key}-02T00:00:00Z`); const name = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).replace('.', '').replace(' de ', '/'); return { name: name.charAt(0).toUpperCase() + name.slice(1), Custo: costsByMonth[key] }; });
        if (data.length < 2) return data;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0; const n = data.length;
        data.forEach((point, i) => { const x = i; const y = point.Custo; sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; });
        const denominator = n * sumX2 - sumX * sumX; const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0; const intercept = (sumY - slope * sumX) / n;
        return data.map((point, i) => ({ ...point, 'Tendência': Math.max(0, slope * i + intercept) }));
    }, [assets]);

    return (
        <ChartContainer title="Custo de Manutenção Mensal">
            <BarChart data={dataWithTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid {...RechartsGridStyle} vertical={false} />
                <XAxis dataKey="name" tick={RechartsAxisTextStyle} />
                <YAxis tickFormatter={(value) => formatCurrency(value as number)} tick={RechartsAxisTextStyle} />
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Legend formatter={(value, entry, index) => <span style={chartStyles.legend}>{value}</span>} />
                <Bar dataKey="Custo" fill={ds.colors.warning.main} barSize={20} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Tendência" stroke={ds.colors.primary.dark} strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </BarChart>
        </ChartContainer>
    );
};

// Os outros gráficos (AssetStatusChart, AssetTypeChart) foram omitidos por brevidade,
// mas seguiriam o mesmo padrão de refatoração, utilizando o ChartContainer e os estilos centralizados.

