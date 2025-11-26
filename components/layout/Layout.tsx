
import React, { useState } from 'react';
import { ChartPieIcon, Cog6ToothIcon, WrenchScrewdriverIcon, ArrowLeftOnRectangleIcon, CircleStackIcon, BuildingOfficeIcon, ArchiveBoxIcon, CurrencyDollarIcon, FolderIcon, ClipboardCheckIcon, MapPinIcon, XMarkIcon, Bars3Icon, ShoppingCartIcon, UserGroupIcon, LightBulbIcon, PresentationChartLineIcon, BriefcaseIcon, TruckIcon, CalculatorIcon, BanknotesIcon } from '../common/icons';
import { Notification } from '../../utils/notificationUtils';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { useBranding } from '../../hooks/useBranding';
import { Page } from './MainLayout';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  notifications: Notification[];
  pageTitle: string;
}

const navGroups = [
  {
    title: 'Visão Geral',
    items: [
      { page: 'dashboard', icon: <ChartPieIcon className="w-5 h-5" />, label: "Dashboard & BI" },
    ]
  },
  {
    title: 'Operacional',
    items: [
      { page: 'assets', icon: <CircleStackIcon className="w-5 h-5" />, label: "Ativos & Mapa" },
      { page: 'maintenance', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, label: "Manutenção & IA" },
      { page: 'projects', icon: <BriefcaseIcon className="w-5 h-5" />, label: "Projetos" },
      { page: 'stock', icon: <ArchiveBoxIcon className="w-5 h-5" />, label: "Estoque & Peças" },
    ]
  },
  {
    title: 'Cadeia de Suprimentos',
    items: [
      { page: 'purchasing', icon: <ShoppingCartIcon className="w-5 h-5" />, label: "Compras" },
      { page: 'suppliers', icon: <TruckIcon className="w-5 h-5" />, label: "Fornecedores" },
    ]
  },
  {
    title: 'Comercial',
    items: [
      { page: 'crm', icon: <PresentationChartLineIcon className="w-5 h-5" />, label: "CRM" },
      { page: 'sales', icon: <BanknotesIcon className="w-5 h-5" />, label: "Vendas" },
    ]
  },
  {
    title: 'Corporativo',
    items: [
      { page: 'financial', icon: <CurrencyDollarIcon className="w-5 h-5" />, label: "Financeiro" },
      { page: 'fiscal', icon: <CalculatorIcon className="w-5 h-5" />, label: "Fiscal" },
      { page: 'hr', icon: <UserGroupIcon className="w-5 h-5" />, label: "RH" },
      { page: 'documents', icon: <FolderIcon className="w-5 h-5" />, label: "Documentos" },
    ]
  },
  {
    title: 'Administração',
    items: [
      { page: 'users', icon: <UserGroupIcon className="w-5 h-5" />, label: "Usuários" },
      { page: 'settings', icon: <Cog6ToothIcon className="w-5 h-5" />, label: "Configurações" },
    ]
  }
];

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, onLogout, notifications, pageTitle }) => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const NavItem: React.FC<{ page: string; icon: React.ReactNode; label: string }> = ({ page, icon, label }) => {
    const isActive = currentPage === page;
    return (
      <li>
        <button
          onClick={() => {
            setCurrentPage(page as Page);
            setIsSidebarOpen(false);
          }}
          className={`flex items-center p-3 rounded-lg w-full text-left transition-all duration-200 mb-1 group ${
            isActive
              ? 'bg-primary-600 text-white shadow-glow'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}` })}
          <span className="ml-3 flex-1 whitespace-nowrap text-sm font-medium tracking-wide">{label}</span>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white ml-2"></div>}
        </button>
      </li>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111827] border-r border-gray-800"> {/* Slate 900 base */}
        <div className="flex items-center h-20 px-6 border-b border-gray-800 bg-[#0f172a]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mr-3 shadow-lg text-white">
                <CircleStackIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight block">{branding.companyName}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">ERP Edition</span>
            </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
            {navGroups.map((group, idx) => (
              <div key={idx}>
                <h3 className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <ul className="space-y-0.5">
                    {group.items.map(item => <NavItem key={item.page} {...item} />)}
                </ul>
              </div>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-[#0f172a]">
            <div className="flex items-center mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-bold mr-3 border-2 border-gray-600">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
                </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
              Sair
            </button>
        </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-slate-900 font-sans">
      <aside className="hidden lg:flex lg:flex-shrink-0 w-72 shadow-2xl z-30">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 flex z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#111827]">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setIsSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
        <div className="flex-shrink-0 w-14"></div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
         <header className="relative z-10 flex-shrink-0 h-20 bg-[#111827] shadow-md flex justify-between items-center px-4 sm:px-8 lg:px-12">
            <div className="flex items-center">
                <button type="button" className="px-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden mr-2" onClick={() => setIsSidebarOpen(true)}>
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                   {pageTitle}
                </h1>
            </div>
            <div className="flex items-center space-x-4">
                <NotificationBell notifications={notifications} />
            </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar bg-[#0f172a]">
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
