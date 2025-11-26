
import React, { useState, useMemo } from 'react';
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
import { useAuth } from '../../hooks/useAuth';
import { useApp } from '../../hooks/useApp';
import { getExpiringItems } from '../../utils/notificationUtils';

export type Page = 'dashboard' | 'assets' | 'maintenance' | 'settings' | 'suppliers' | 'stock' | 'financial' | 'documents' | 'purchasing' | 'users' | 'crm' | 'projects' | 'hr' | 'fiscal' | 'sales';

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { logOut } = useAuth();
  const { assets, stockItems } = useApp();

  const notifications = useMemo(() => {
    return getExpiringItems(assets, 30);
  }, [assets, stockItems]);

  const pageTitles: Record<Page, string> = {
    dashboard: 'Visão Geral & BI',
    assets: 'Gestão de Ativos',
    maintenance: 'Manutenção & Predição',
    settings: 'Configurações do Sistema',
    suppliers: 'Gestão de Fornecedores',
    stock: 'Controle de Estoque',
    purchasing: 'Gestão de Compras',
    financial: 'Gestão Financeira',
    documents: 'Documentos Corporativos',
    users: 'Usuários & Permissões',
    crm: 'CRM & Pipeline',
    projects: 'Gestão de Projetos',
    hr: 'Recursos Humanos',
    fiscal: 'Fiscal & Tributário',
    sales: 'Pedidos de Venda'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'assets': return <AssetsPage />;
      case 'maintenance': return <MaintenancePage />;
      case 'settings': return <SettingsPage />;
      case 'suppliers': return <SuppliersPage />;
      case 'stock': return <StockPage setCurrentPage={(p: any) => setCurrentPage(p)} />; // StockPage might request stockReconciliation locally or modal
      case 'purchasing': return <PurchasingPage />;
      case 'financial': return <FinancialPage />;
      case 'documents': return <DocumentsPage />;
      case 'users': return <UsersPage />;
      case 'crm': return <CRMPage />;
      case 'projects': return <ProjectsPage />;
      case 'hr': return <HRPage />;
      case 'fiscal': return <FiscalPage />;
      case 'sales': return <SalesPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onLogout={logOut}
      notifications={notifications}
      pageTitle={pageTitles[currentPage]}
    >
      {renderPage()}
    </Layout>
  );
};

export default MainLayout;
