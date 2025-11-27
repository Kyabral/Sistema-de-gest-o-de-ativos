
import React, { useState, useMemo } from 'react';
import { 
  ChartPieIcon, Cog6ToothIcon, WrenchScrewdriverIcon, ArrowLeftOnRectangleIcon, 
  CircleStackIcon, BuildingOfficeIcon, ArchiveBoxIcon, CurrencyDollarIcon, 
  FolderIcon, MapPinIcon, XMarkIcon, Bars3Icon, ShoppingCartIcon, 
  UserGroupIcon, PresentationChartLineIcon, BriefcaseIcon, TruckIcon, 
  CalculatorIcon, BanknotesIcon 
} from '../common/icons';
import { Notification } from '../../utils/notificationUtils';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { useBranding } from '../../hooks/useBranding';
import { Page } from './MainLayout';
import * as ds from '../../styles/designSystem'; // Importando o Design System

// --- TIPAGEM DOS ESTILOS ---
type Style = React.CSSProperties;

// --- GRUPOS DE NAVEGAÇÃO ---
const navGroups = [
    { title: 'Visão Geral', items: [{ page: 'dashboard', icon: <ChartPieIcon />, label: "Dashboard & BI" }] },
    { title: 'Operacional', items: [
        { page: 'assets', icon: <CircleStackIcon />, label: "Ativos & Mapa" },
        { page: 'maintenance', icon: <WrenchScrewdriverIcon />, label: "Manutenção & IA" },
        { page: 'projects', icon: <BriefcaseIcon />, label: "Projetos" },
        { page: 'stock', icon: <ArchiveBoxIcon />, label: "Estoque & Peças" },
    ]},
    { title: 'Cadeia de Suprimentos', items: [
        { page: 'purchasing', icon: <ShoppingCartIcon />, label: "Compras" },
        { page: 'suppliers', icon: <TruckIcon />, label: "Fornecedores" },
    ]},
    { title: 'Comercial', items: [
        { page: 'crm', icon: <PresentationChartLineIcon />, label: "CRM" },
        { page: 'sales', icon: <BanknotesIcon />, label: "Vendas" },
    ]},
    { title: 'Corporativo', items: [
        { page: 'financial', icon: <CurrencyDollarIcon />, label: "Financeiro" },
        { page: 'fiscal', icon: <CalculatorIcon />, label: "Fiscal" },
        { page: 'hr', icon: <UserGroupIcon />, label: "RH" },
        { page: 'documents', icon: <FolderIcon />, label: "Documentos" },
    ]},
    { title: 'Administração', items: [
        { page: 'users', icon: <UserGroupIcon />, label: "Usuários" },
        { page: 'settings', icon: <Cog6ToothIcon />, label: "Configurações" },
    ]}
];

// --- COMPONENTE PRINCIPAL DO LAYOUT ---
interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  notifications: Notification[];
  pageTitle: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, onLogout, notifications, pageTitle }) => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // --- ESTILOS DINÂMICOS COM O DESIGN SYSTEM ---
  const styles: { [key: string]: Style } = useMemo(() => ({
    layout: { fontFamily: ds.typography.fontFamily, height: '100vh', display: 'flex', overflow: 'hidden', backgroundColor: ds.colors.dark.background },
    sidebar: { width: '280px', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: ds.colors.dark.card, borderRight: `1px solid ${ds.colors.dark.border}`, zIndex: 30 },
    sidebarHeader: { height: '80px', display: 'flex', alignItems: 'center', padding: `0 ${ds.spacing[6]}`, borderBottom: `1px solid ${ds.colors.dark.border}` },
    logoIconContainer: { width: '40px', height: '40px', borderRadius: ds.borders.radius.md, background: `linear-gradient(135deg, ${ds.colors.primary.main}, ${ds.colors.primary.dark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: ds.spacing[3], color: ds.colors.primary.contrastText, boxShadow: ds.shadows.md },
    companyName: { fontSize: ds.typography.fontSizes.lg, fontWeight: ds.typography.fontWeights.bold, color: ds.colors.dark.text_primary, lineHeight: 1.2 },
    companySubtitle: { fontSize: '10px', textTransform: 'uppercase', color: ds.colors.dark.text_secondary, fontWeight: ds.typography.fontWeights.semibold, letterSpacing: '0.05em' },
    nav: { flex: 1, padding: `${ds.spacing[4]} 0`, overflowY: 'auto' },
    navGroupTitle: { padding: `0 ${ds.spacing[5]}`, marginBottom: ds.spacing[2], fontSize: '11px', fontWeight: ds.typography.fontWeights.bold, color: ds.colors.dark.text_secondary, textTransform: 'uppercase', letterSpacing: '0.05em' },
    navItemList: { listStyle: 'none', padding: `0 ${ds.spacing[4]}`, margin: 0 },
    userFooter: { padding: ds.spacing[4], borderTop: `1px solid ${ds.colors.dark.border}` },
    userInfo: { display: 'flex', alignItems: 'center', marginBottom: ds.spacing[4], padding: `0 ${ds.spacing[2]}` },
    userAvatar: { width: '40px', height: '40px', borderRadius: ds.borders.radius.full, backgroundColor: ds.colors.neutral[800], color: ds.colors.dark.text_primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: ds.typography.fontWeights.bold, marginRight: ds.spacing[3], border: `2px solid ${ds.colors.dark.border}` },
    userName: { color: ds.colors.dark.text_primary, fontWeight: ds.typography.fontWeights.semibold, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    userRole: { color: ds.colors.dark.text_secondary, fontSize: ds.typography.fontSizes.sm, textTransform: 'capitalize' },
    logoutButton: { ...ds.componentStyles.button.secondary, backgroundColor: ds.colors.dark.background, borderColor: ds.colors.dark.border, color: ds.colors.dark.text_secondary, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s ease' },
    header: { position: 'relative', zIndex: 10, flexShrink: 0, height: '80px', backgroundColor: ds.colors.dark.card, boxShadow: ds.shadows.dark_md, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `0 ${ds.spacing[8]}` },
    pageTitle: { fontSize: ds.typography.fontSizes['2xl'], fontWeight: ds.typography.fontWeights.bold, color: ds.colors.dark.text_primary, letterSpacing: '-0.02em' },
    mainContent: { flex: 1, position: 'relative', overflowY: 'auto', focus: { outline: 'none' }, backgroundColor: ds.colors.dark.background },
    contentWrapper: { padding: ds.spacing[8], maxWidth: '1920px', margin: '0 auto' },
    mobileMenuButton: { color: ds.colors.dark.text_secondary, marginRight: ds.spacing[2] },
    mobileSidebarOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 40 },
    mobileSidebarContainer: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '280px', width: '100%', backgroundColor: ds.colors.dark.card, zIndex: 50 },
    mobileCloseButtonContainer: { position: 'absolute', top: ds.spacing[2], right: '-48px', paddingTop: ds.spacing[2] },
    mobileCloseButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: ds.borders.radius.full, color: ds.colors.neutral[100] },
  }), [ds]);

  const navItemStyle = (page: string, isActive: boolean): Style => {
    const isHovered = hoveredItem === page;
    return {
      display: 'flex',
      alignItems: 'center',
      padding: `${ds.spacing[3]} ${ds.spacing[4]}`,
      borderRadius: ds.borders.radius.md,
      width: '100%',
      textAlign: 'left',
      transition: 'all 0.2s ease-in-out',
      marginBottom: '4px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isActive ? ds.colors.primary.main : 'transparent',
      color: isActive ? ds.colors.primary.contrastText : ds.colors.dark.text_secondary,
      ...( (isHovered && !isActive) && {
        backgroundColor: ds.colors.dark.background,
        color: ds.colors.dark.text_primary
      })
    };
  };
  
  const navIconStyle = (isActive: boolean): Style => ({
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginRight: ds.spacing[4],
    transition: 'color 0.2s',
    color: isActive ? ds.colors.primary.contrastText : ds.colors.neutral[600],
  });

  const NavItem: React.FC<{ page: string; icon: React.ReactNode; label: string }> = ({ page, icon, label }) => {
    const isActive = currentPage === page;
    return (
      <li>
        <button
          onClick={() => {
            setCurrentPage(page as Page);
            setIsSidebarOpen(false);
          }}
          onMouseEnter={() => setHoveredItem(page)}
          onMouseLeave={() => setHoveredItem(null)}
          style={navItemStyle(page, isActive)}
        >
          {React.cloneElement(icon as React.ReactElement, { style: navIconStyle(isActive) })}
          <span style={{ flex: 1, whiteSpace: 'nowrap', fontSize: ds.typography.fontSizes.sm, fontWeight: ds.typography.fontWeights.medium }}>{label}</span>
        </button>
      </li>
    );
  };

  const SidebarContent = () => (
    <>
      <div style={styles.sidebarHeader}>
        <div style={styles.logoIconContainer}>
          <CircleStackIcon style={{ width: 22, height: 22 }} />
        </div>
        <div>
          <span style={styles.companyName}>{branding.companyName}</span>
          <span style={styles.companySubtitle}>SGA V2.0</span>
        </div>
      </div>
      
      <nav style={styles.nav}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: ds.spacing[6] }}>
            <h3 style={styles.navGroupTitle}>{group.title}</h3>
            <ul style={styles.navItemList}>
              {group.items.map(item => <NavItem key={item.page} {...item} />)}
            </ul>
          </div>
        ))}
      </nav>

      <div style={styles.userFooter}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{minWidth: 0, flex: 1}}>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userRole}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={styles.logoutButton}
        >
          <ArrowLeftOnRectangleIcon style={{ width: 16, height: 16, marginRight: ds.spacing[2] }} />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div style={styles.layout}>
      {/* --- Sidebar para Desktop --- */}
      <aside className="hidden lg:flex" style={styles.sidebar}>
        <SidebarContent />
      </aside>

      {/* --- Sidebar para Mobile --- */}
      <div className={`lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div style={styles.mobileSidebarOverlay} onClick={() => setIsSidebarOpen(false)}></div>
        <div style={styles.mobileSidebarContainer}>
          <div style={styles.mobileCloseButtonContainer}>
            <button type="button" style={styles.mobileCloseButton} onClick={() => setIsSidebarOpen(false)}>
              <XMarkIcon style={{ width: 24, height: 24 }} />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* --- Conteúdo Principal --- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button type="button" className="lg:hidden" style={styles.mobileMenuButton} onClick={() => setIsSidebarOpen(true)}>
              <Bars3Icon style={{ width: 24, height: 24 }} />
            </button>
            <h1 style={styles.pageTitle}>{pageTitle}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: ds.spacing[4] }}>
            <NotificationBell notifications={notifications} />
          </div>
        </header>

        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
