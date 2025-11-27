
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './Layout';
import DashboardPage from '../../pages/DashboardPage';
import AssetsPage from '../../pages/AssetsPage';
import MaintenancePage from '../../pages/MaintenancePage';
import SettingsPage from '../../pages/SettingsPage';
import SuppliersPage from '../../pages/SuppliersPage';
import StockPage from '../../pages/StockPage';
import FinancialPage from '../../pages/FinancialPage';
import DocumentsPage from '../../pages/DocumentsPage';
import PurchasingPage from '../../pages/PurchasingPage';
import UsersPage from '../../pages/UsersPage';
import CRMPage from '../../pages/CRMPage';
import ProjectsPage from '../../pages/ProjectsPage';
import HRPage from '../../pages/HumanResourcesPage';
import FiscalPage from '../../pages/FiscalPage';
import SalesPage from '../../pages/SalesPage';
import StockReconciliationPage from '../../pages/StockReconciliationPage';
import MapPage from '../../pages/MapPage';
import ReportsPage from '../../pages/ReportsPage';
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useApp';
import { getExpiringItems } from '../../utils/notificationUtils';
import * as ds from '../../styles/designSystem';

export type Page = 
  | 'dashboard' | 'assets' | 'maintenance' | 'settings' | 'suppliers' 
  | 'stock' | 'financial' | 'documents' | 'purchasing' | 'users' 
  | 'crm' | 'projects' | 'hr' | 'fiscal' | 'sales' 
  | 'stockReconciliation' | 'map' | 'reports';

// --- CONFIGURAÇÃO CENTRALIZADA DE PÁGINAS ---
const pageConfig: Record<Page, { component: React.ComponentType<any>; title: string }> = {
  dashboard: { component: DashboardPage, title: 'Visão Geral & BI' },
  assets: { component: AssetsPage, title: 'Gestão de Ativos' },
  maintenance: { component: MaintenancePage, title: 'Manutenção & Predição' },
  settings: { component: SettingsPage, title: 'Configurações do Sistema' },
  suppliers: { component: SuppliersPage, title: 'Gestão de Fornecedores' },
  stock: { component: StockPage, title: 'Controle de Estoque' },
  purchasing: { component: PurchasingPage, title: 'Gestão de Compras' },
  financial: { component: FinancialPage, title: 'Gestão Financeira' },
  documents: { component: DocumentsPage, title: 'Documentos Corporativos' },
  users: { component: UsersPage, title: 'Usuários & Permissões' },
  crm: { component: CRMPage, title: 'CRM & Pipeline de Vendas' },
  projects: { component: ProjectsPage, title: 'Gestão de Projetos' },
  hr: { component: HRPage, title: 'Recursos Humanos' },
  fiscal: { component: FiscalPage, title: 'Módulo Fiscal & Tributário' },
  sales: { component: SalesPage, title: 'Pedidos de Venda' },
  stockReconciliation: { component: StockReconciliationPage, title: 'Reconciliação de Estoque' },
  map: { component: MapPage, title: 'Mapa de Ativos' },
  reports: { component: ReportsPage, title: 'Relatórios Gerenciais' },
};

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { logOut } = useAuth();
  const { assets, stockItems } = useApp();

  const notifications = useMemo(() => {
    return getExpiringItems(assets, 30); // Exemplo de notificação
  }, [assets, stockItems]);

  // --- LÓGICA DE TRANSIÇÃO DE PÁGINA ---
  const handleSetPage = (page: Page) => {
    if (page === currentPage) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      // O ideal é que o próprio componente de página gerencie seu estado de "fadeIn"
      // Mas para simplificar, faremos o fadeIn após o render
    }, 150); // Duração do fade-out
  };

  useEffect(() => {
    if (isTransitioning) {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150); // Duração do fade-in
    }
  }, [currentPage]);

  const PageComponent = pageConfig[currentPage].component;
  const pageTitle = pageConfig[currentPage].title;

  const pageStyle: React.CSSProperties = {
    transition: 'opacity 150ms ease-in-out',
    opacity: isTransitioning ? 0 : 1,
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={handleSetPage}
      onLogout={logOut}
      notifications={notifications}
      pageTitle={pageTitle}
    >
      <div style={pageStyle}>
        <PageComponent setCurrentPage={handleSetPage} />
      </div>
    </Layout>
  );
};

export default MainLayout;
