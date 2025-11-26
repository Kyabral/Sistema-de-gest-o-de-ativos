
import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import MetricCard from '../components/common/MetricCard';
import { FinancialOverviewChart, MaintenanceCostChart } from '../components/assets/AssetCharts';
import AIAssistant from '../components/AIAssistant';
import PredictionList from '../components/assets/PredictionList';
import { WrenchScrewdriverIcon, BuildingOfficeIcon, BanknotesIcon, ReceiptPercentIcon, BriefcaseIcon, UserGroupIcon, PresentationChartLineIcon } from '../components/common/icons';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { AssetStatus, InvoiceStatus, ContractStatus } from '../types';

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
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Bem-vindo, {user?.name?.split(' ')[0]}!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Visão executiva integrada da {branding.companyName}.
                    </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
            
             {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}
            
            {isLoading ? (
                 <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div></div>
            ) : (
                <>
                    {/* Financial & Strategic Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard title="Receita Mensal" value={formatCurrency(metrics.monthlyRevenue)} icon={<ReceiptPercentIcon className="w-6 h-6 text-white"/>} color="bg-emerald-500" />
                        <MetricCard title="Custos Fixos" value={formatCurrency(metrics.fixedCosts)} icon={<BanknotesIcon className="w-6 h-6 text-white"/>} color="bg-rose-500" />
                        <MetricCard title="Pipeline de Vendas" value={formatCurrency(metrics.salesPipeline)} icon={<PresentationChartLineIcon className="w-6 h-6 text-white"/>} color="bg-violet-500" />
                        <MetricCard title="Patrimônio (Ativos)" value={formatCurrency(metrics.totalValue)} icon={<BuildingOfficeIcon className="w-6 h-6 text-white"/>} color="bg-blue-500" />
                    </div>

                    {/* Operational Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <MetricCard title="Projetos Ativos" value={metrics.activeProjects.toString()} icon={<BriefcaseIcon className="w-6 h-6 text-white"/>} color="bg-indigo-500" />
                         <MetricCard title="Colaboradores" value={metrics.totalEmployees.toString()} icon={<UserGroupIcon className="w-6 h-6 text-white"/>} color="bg-cyan-500" />
                         <MetricCard title="Em Manutenção" value={metrics.inRepairCount.toString()} icon={<WrenchScrewdriverIcon className="w-6 h-6 text-white"/>} color="bg-amber-500" />
                    </div>

                    {/* Intelligence Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div className="lg:col-span-2 flex flex-col space-y-6">
                             {/* Financial Chart */}
                             <FinancialOverviewChart invoices={invoices} contracts={contracts} assets={assets} />
                             {/* Maintenance Chart */}
                             <MaintenanceCostChart assets={assets} />
                        </div>
                        <div className="flex flex-col space-y-6">
                            {/* AI Tools */}
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
