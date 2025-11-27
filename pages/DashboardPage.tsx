
import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import MetricCard from '../components/common/MetricCard';
import { FinancialOverviewChart, MaintenanceCostChart } from '../components/assets/AssetCharts';
import AIAssistant from '../components/AIAssistant';
import PredictionList from '../components/assets/PredictionList';
import {
    WrenchScrewdriverIcon, BuildingOfficeIcon, BanknotesIcon, ReceiptPercentIcon, 
    BriefcaseIcon, UserGroupIcon, PresentationChartLineIcon
} from '../components/common/icons';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { AssetStatus, InvoiceStatus, ContractStatus } from '../types';
import * as ds from '../styles/designSystem'; // Importando o Design System

type Style = React.CSSProperties;

const DashboardPage: React.FC = () => {
    const { 
        assets, invoices, contracts, failurePredictions, 
        deals, projects, employees, isLoading, error
    } = useApp();
    const { user } = useAuth();
    const { branding } = useBranding();
    
    const metrics = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const totalValue = assets.reduce((sum, a) => sum + a.purchaseValue, 0);
        const inRepairCount = assets.filter(a => a.status === AssetStatus.IN_REPAIR).length;
        
        const monthlyRevenue = invoices
            .filter(inv => new Date(inv.issueDate).getMonth() === currentMonth && new Date(inv.issueDate).getFullYear() === currentYear && inv.status === InvoiceStatus.PAID)
            .reduce((sum, inv) => sum + inv.total, 0);
        const fixedCosts = contracts
            .filter(c => c.status === ContractStatus.ACTIVE)
            .reduce((sum, c) => sum + c.monthlyValue, 0);

        const activeProjects = projects.filter(p => p.status === 'Em Andamento').length;
        const totalEmployees = employees.filter(e => e.status === 'Ativo').length;
        const salesPipeline = deals.reduce((sum, d) => sum + (d.stage !== 'Fechado' ? d.value : 0), 0);
        
        return {
            totalValue,
            inRepairCount,
            monthlyRevenue,
            fixedCosts,
            activeProjects,
            totalEmployees,
            salesPipeline
        };
    }, [assets, invoices, contracts, projects, employees, deals]);

    const styles: { [key: string]: Style } = {
        page: { padding: `${ds.spacing[4]} ${ds.spacing[8]}`, display: 'flex', flexDirection: 'column', gap: ds.spacing[8] },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        title: { fontSize: ds.typography.fontSizes['2xl'], fontWeight: ds.typography.fontWeights.bold, color: ds.colors.dark.text_primary },
        subtitle: { color: ds.colors.dark.text_secondary, marginTop: ds.spacing[1] },
        dateDisplay: { color: ds.colors.dark.text_secondary, backgroundColor: ds.colors.dark.card, padding: `${ds.spacing[2]} ${ds.spacing[4]}`, borderRadius: ds.borders.radius.md, fontSize: ds.typography.fontSizes.sm },
        grid: { display: 'grid', gap: ds.spacing[6] },
        gridCols4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
        gridCols3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
        gridCols1: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
        loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '256px' },
        spinner: { width: ds.spacing[16], height: ds.spacing[16], borderTop: `2px solid ${ds.colors.primary.main}`, borderRight: `2px solid ${ds.colors.primary.main}`, borderBottom: '2px solid transparent', borderLeft: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' },
        error: { backgroundColor: ds.colors.error.light, borderLeft: `4px solid ${ds.colors.error.main}`, color: ds.colors.error.main, padding: ds.spacing[4] },
        intelligenceSection: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: ds.spacing[6] },
        chartsColumn: { display: 'flex', flexDirection: 'column', gap: ds.spacing[6] },
        aiColumn: { display: 'flex', flexDirection: 'column', gap: ds.spacing[6] },
    };
    
    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>
                        Bem-vindo, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p style={styles.subtitle}>
                        Visão executiva integrada da {branding.companyName}.
                    </p>
                </div>
                <div style={styles.dateDisplay}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
            
            {error && <div style={styles.error} role="alert"><p>{error}</p></div>}
            
            {isLoading ? (
                <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>
            ) : (
                <>
                    {/* Linha Financeira e Estratégica */}
                    <div style={{...styles.grid, ...styles.gridCols4}}>
                        <MetricCard title="Receita Mensal" value={formatCurrency(metrics.monthlyRevenue)} icon={<ReceiptPercentIcon />} colorName="success" />
                        <MetricCard title="Custos Fixos" value={formatCurrency(metrics.fixedCosts)} icon={<BanknotesIcon />} colorName="error" />
                        <MetricCard title="Pipeline de Vendas" value={formatCurrency(metrics.salesPipeline)} icon={<PresentationChartLineIcon />} colorName="secondary" />
                        <MetricCard title="Patrimônio (Ativos)" value={formatCurrency(metrics.totalValue)} icon={<BuildingOfficeIcon />} colorName="primary" />
                    </div>

                    {/* Linha Operacional */}
                    <div style={{...styles.grid, ...styles.gridCols3}}>
                         <MetricCard title="Projetos Ativos" value={metrics.activeProjects.toString()} icon={<BriefcaseIcon />} colorName="warning" />
                         <MetricCard title="Colaboradores" value={metrics.totalEmployees.toString()} icon={<UserGroupIcon />} colorName="neutral" />
                         <MetricCard title="Em Manutenção" value={metrics.inRepairCount.toString()} icon={<WrenchScrewdriverIcon />} colorName="primary" />
                    </div>

                    {/* Seção de Inteligência */}
                    <div style={styles.intelligenceSection}>
                        <div style={styles.chartsColumn}>
                             <FinancialOverviewChart invoices={invoices} contracts={contracts} assets={assets} />
                             <MaintenanceCostChart assets={assets} />
                        </div>
                        <div style={styles.aiColumn}>
                            <PredictionList predictions={failurePredictions} />
                            <AIAssistant assets={assets} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;
