import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  FileText,
  CreditCard,
  ShoppingBag,
  FileCheck,
  LogOut,
  Bell,
  Search,
  Briefcase,
  User,
  Settings,
  Repeat,
  Terminal,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';
import logo from '@/assets/logo.png';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  // Determine partner type from context user
  // Default to 'Distributeur' if undefined to avoid crash, but strictly it should be set
  const partnerType = user?.partnerType || 'Distributeur';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine expected base path based on type
  const basePath = partnerType === 'Prestataire' ? '/provider' : '/distributor';

  // Redirect if visiting wrong portal
  useEffect(() => {
    if (partnerType === 'Prestataire' && !location.pathname.startsWith('/provider')) {
      navigate('/provider');
    } else if (partnerType === 'Distributeur' && !location.pathname.startsWith('/distributor')) {
      navigate('/distributor');
    }
  }, [partnerType, navigate, location]);

  const navItems = {
    // Common items
    dashboard: { to: basePath, icon: LayoutDashboard, label: "Tableau de Bord", end: true },

    // Prestataire (Provider) Items
    missions: { to: `${basePath}/missions`, icon: Target, label: "Missions" },
    invoices: { to: `${basePath}/invoices`, icon: FileText, label: "Factures" },
    payments: { to: `${basePath}/payments`, icon: CreditCard, label: "Paiements" },

    // Distributeur (Distributor) Items
    products: { to: `${basePath}/products`, icon: ShoppingBag, label: "Produits" },
    quotes: { to: `${basePath}/quotes`, icon: FileText, label: "Mes Devis" },
    contracts: { to: `${basePath}/contracts`, icon: FileCheck, label: "Mes Contrats" },
    commissions: { to: `${basePath}/commissions`, icon: CreditCard, label: "Commissions" },
  };

  const activeNav = partnerType === 'Prestataire'
    ? [navItems.dashboard, navItems.missions, navItems.invoices, navItems.payments]
    : [navItems.dashboard, navItems.products, navItems.quotes, navItems.contracts, navItems.commissions];

  return (
    <div className="layout-wrapper">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="mobile-overlay" onClick={closeMobileSidebar}></div>
      )}

      <aside className={clsx("sidebar", isMobileSidebarOpen && "mobile-open")}>
        <div className="sidebar-header">
          <div className="logo-area">
            <img src={logo} alt="SIMAS Logo" className="logo-img" />
            <div className="logo-text-group">
              <span className="brand-text">SIM</span>
              <span className="brand-subtext">ASSURANCES</span>
            </div>
            {/* Close button for mobile */}
            <button className="mobile-close-btn" onClick={closeMobileSidebar}>
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-label">ESPACE {partnerType.toUpperCase()}</p>
            {activeNav.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.to}
                end={item.end}
                onClick={closeMobileSidebar}
                className={({ isActive }) => clsx('nav-item', isActive && 'active')}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: '1rem' }}>
            {/* Dynamic Role Indicator */}
            <div className="role-indicator">
              <span className="dot"></span>
              Espace {partnerType}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">P</div>
              <div className="user-info">
                <span className="user-name">Partenaire One</span>
                <span className="user-role">{partnerType}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet context={{ partnerType }} />

          <footer className="mt-auto pt-8 px-8 pb-8 text-slate-500 text-sm border-t border-slate-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div>
                <h4 className="font-bold text-slate-700 mb-2">SIM ASSURANCES</h4>
                <p className="text-xs">Lot 195, Cité ATCI Rivera Faya, Abidjan</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-700">Support Partenaire</p>
                <p>(+225) 27 24 36 46 61 · info@simassurances.com</p>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <style>{`
        .layout-wrapper { display: flex; height: 100vh; background: #f3f4f6; font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
        
        /* Sidebar */
        .sidebar { 
          width: 260px; 
          background: var(--color-primary); 
          color: white;
          border-right: 1px solid rgba(255,255,255,0.1); 
          display: flex; 
          flex-direction: column; 
          flex-shrink: 0; 
          transition: width 0.3s; 
          box-shadow: 4px 0 24px rgba(0,0,0,0.1);
          z-index: 100;
        }
        .sidebar-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .logo-area { display: flex; align-items: center; gap: 0.75rem; position: relative; }
        .logo-img { height: 40px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 8px; }
        .logo-text-group { display: flex; flex-direction: column; line-height: 1; }
        .brand-text { font-weight: 800; font-size: 1.25rem; color: white; letter-spacing: -0.5px; }
        .brand-subtext { font-size: 0.65rem; font-weight: 600; color: white; text-transform: uppercase; letter-spacing: 2px; opacity: 1; }
        
        .sidebar-nav { padding: 1.5rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
        .nav-label { font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 1rem; padding-left: 0.75rem; letter-spacing: 0.5px; }
        .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; color: rgba(255,255,255,0.8); text-decoration: none; border-radius: 8px; font-weight: 500; transition: all 0.2s; margin-bottom: 0.25rem; }
        .nav-item:hover { background: rgba(255,255,255,0.1); color: white; transform: translateX(2px); }
        .nav-item.active { background: white; color: var(--color-primary); font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        
        .sidebar-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
        .logout-btn { width: 100%; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: none; background: none; color: rgba(255,255,255,0.7); cursor: pointer; border-radius: 8px; font-weight: 500; transition: background 0.2s; }
        .logout-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        /* Main Content */
        .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
        
        /* Topbar */
        .topbar { background: white; height: 64px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; flex-shrink: 0; }
        .topbar-left { display: flex; align-items: center; gap: 1rem; }
        .search-bar { display: flex; align-items: center; gap: 0.75rem; background: #f9fafb; padding: 0.5rem 1rem; border-radius: 99px; width: 300px; }
        .search-bar input { border: none; background: none; outline: none; width: 100%; font-size: 0.9rem; }
        .search-icon { color: var(--color-text-muted); }
        
        .topbar-actions { display: flex; align-items: center; gap: 1.5rem; }
        .icon-btn { position: relative; background: none; border: none; cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; transition: background 0.2s; }
        .icon-btn:hover { background: #f3f4f6; color: var(--color-primary); }
        .badge-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid white; }
        
        .user-profile { display: flex; align-items: center; gap: 0.75rem; padding-left: 1.5rem; border-left: 1px solid rgba(0,0,0,0.05); }
        .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1rem; }
        .user-info { display: flex; flex-direction: column; line-height: 1.2; }
        .user-name { font-weight: 600; font-size: 0.9rem; color: var(--color-text); }
        .user-role { font-size: 0.75rem; color: var(--color-text-muted); }

        .page-content { flex: 1; overflow-y: auto; padding: 0; position: relative; }

        /* Dev Tool Style */
        /* Dev Tool Style REMOVED */
        .role-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }
        .dot {
            width: 8px; 
            height: 8px; 
            background: #22c55e; 
            border-radius: 50%;
        }

        /* Mobile Specific Styles */
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            color: var(--color-text);
        }
        
        .mobile-close-btn {
            display: none;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 0.25rem;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .mobile-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 90;
            backdrop-filter: blur(2px);
        }

        @media (max-width: 1024px) {
            .search-bar { width: 200px; }
        }

        @media (max-width: 768px) {
            .sidebar { 
                position: fixed; 
                transform: translateX(-100%); 
                z-index: 100; 
                height: 100%; 
                width: 260px;
                border-radius: 0;
            }
            .sidebar.mobile-open { transform: translateX(0); }
            .topbar { padding: 0 1rem; }
            .user-info { display: none; }
            .search-bar { display: none; }
            
            .mobile-menu-btn { display: block; }
            .mobile-close-btn { display: block; }
            .mobile-overlay { display: block; }
        }
      `}</style>
    </div>
  );
};

export default PartnerLayout;
