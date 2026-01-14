import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  AlertTriangle,
  CreditCard,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  UserCheck,
  UserPlus,
  Box,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import useAutomation from '../hooks/useAutomation';
import logo from '@/assets/logo.png';

const MainLayout = () => {
  useAutomation();
  const navigate = useNavigate();
  const [isRelationsOpen, setIsRelationsOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleRelations = () => {
    setIsRelationsOpen(!isRelationsOpen);
  };

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="layout-wrapper">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="mobile-overlay" onClick={closeMobileSidebar}></div>
      )}

      <aside className={clsx("sidebar", isMobileSidebarOpen && "mobile-open")}>
        <div className="sidebar-header">
          <div className="logo-area">
            <img src={logo} alt="SIM ASSURANCES Logo" className="logo-img" />
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
            <p className="nav-label">GÉNÉRAL</p>
            <NavLink to="/admin" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
              <LayoutDashboard size={20} />
              <span>Tableau de Bord</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <p className="nav-label">GESTION</p>
            <div className="nav-item-group">
              <div
                className="nav-group-label clickable"
                onClick={toggleRelations}
                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={20} />
                  <span>Gestion Relation</span>
                </div>
                <ChevronDown
                  size={16}
                  style={{
                    transform: isRelationsOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </div>
              <div className={clsx("nav-sub-items", !isRelationsOpen && "collapsed")}>
                <NavLink to="/admin/clients" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item sub-item', isActive && 'active')}>
                  <UserCheck size={18} />
                  <span>Clients</span>
                </NavLink>
                <NavLink to="/admin/prospects" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item sub-item', isActive && 'active')}>
                  <UserPlus size={18} />
                  <span>Prospects</span>
                </NavLink>
              </div>
            </div>
            <NavLink to="/admin/products" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
              <Box size={20} />
              <span>Produits</span>
            </NavLink>
            <NavLink to="/admin/partners" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
              <Handshake size={20} />
              <span>Partenaires</span>
            </NavLink>
            <NavLink to="/admin/contracts" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
              <FileText size={20} />
              <span>Contrats</span>
            </NavLink>
            <NavLink to="/admin/claims" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
              <AlertTriangle size={20} />
              <span>Sinistres</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <p className="nav-label">FINANCE</p>
            <NavLink to="/admin/finance" onClick={closeMobileSidebar} className={({ isActive }) => clsx('nav-item', isActive && 'active')}>
              <CreditCard size={20} />
              <span>Finance</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar glass-panel">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={toggleMobileSidebar}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Rechercher..." className="search-input" />
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">A</div>
              <div className="user-info">
                <span className="user-name">Admin</span>
                <span className="user-role">Administrateur</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />

          <footer className="mt-8 mx-8 py-6 border-t border-slate-200 text-slate-400 text-xs flex justify-between items-center footer-responsive">
            <div className="footer-left">
              <span className="font-semibold text-slate-600">SIM ASSURANCES Admin</span>
              <span className="mx-2 hide-mobile">·</span>
              <span className="block-mobile">Lot 195, Cité ATCI Rivera Faya</span>
            </div>
            <div className="footer-right">
              <span className="block-mobile">Support Technique: (+225) 27 24 36 46 61</span>
              <span className="mx-2 hide-mobile">·</span>
              <span className="block-mobile">info@simassurances.com</span>
            </div>
          </footer>
        </div>
      </main>

      <style>{`
        .layout-wrapper {
          display: flex;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, hsl(200, 80%, 90%) 0%, hsl(210, 80%, 85%) 100%);
          position: relative;
        }

        .sidebar {
          width: 280px;
          margin: 0;
          display: flex;
          flex-direction: column;
          border-radius: 0;
          overflow: hidden;
          background: var(--color-primary);
          color: white;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 100;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo-area {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            position: relative;
        }

        .logo-img {
            height: 40px;
            width: auto;
        }

        .logo-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .brand-text {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .brand-subtext {
          font-size: 0.6rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .nav-group {
          margin-bottom: 2rem;
        }

        .nav-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.75rem;
          padding-left: 0.75rem;
          letter-spacing: 0.5px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-md);
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 0.25rem;
        }

        .nav-item-group {
          margin-bottom: 0.5rem;
        }

        .nav-group-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .nav-sub-items {
          padding-left: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          overflow: hidden;
          transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
          max-height: 500px; /* Arbitrary large height */
          opacity: 1;
        }

        .nav-sub-items.collapsed {
          max-height: 0;
          opacity: 0;
        }

        .nav-item.sub-item {
          padding: 0.6rem 1rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .nav-item.sub-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.sub-item.active {
          background: white;
          color: var(--color-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: white;
          color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .main-content {
          flex: 1;
          margin: 1rem 1rem 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow: hidden;
          position: relative;
        }

        .topbar {
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
          border-radius: var(--radius-lg);
        }
        
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-bar {
          position: relative;
          width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          background: rgba(240, 242, 245, 0.5);
          font-family: var(--font-sans);
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          background: white;
          border-color: var(--glass-border);
          box-shadow: 0 0 0 2px rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.05);
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          color: var(--color-text);
          transition: all 0.2s;
        }

        .icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .badge-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--color-danger);
          border-radius: 50%;
          border: 2px solid white;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid var(--glass-border);
          padding-right: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-profile:hover {
          background: white;
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .page-content {
          flex: 1;
          overflow-y: auto;
          border-radius: var(--radius-lg);
          padding-bottom: 2rem;
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
            .layout-wrapper { display: flex; flex-direction: column; }
            .sidebar {
                position: fixed;
                inset: 0 auto 0 0;
                transform: translateX(-100%);
                transition: transform 0.3s ease-in-out;
                width: 260px;
                border-radius: 0;
            }
            .sidebar.mobile-open {
                transform: translateX(0);
            }
            .main-content {
                margin: 0;
                width: 100%;
                height: 100vh;
            }
            .topbar {
                padding: 0.5rem 1rem;
                height: 64px;
                border-radius: 0;
            }
            .page-content {
                border-radius: 0;
            }
            .mobile-menu-btn {
                display: block;
            }
            .mobile-close-btn {
                display: block;
            }
            .mobile-overlay {
                display: block;
            }
            .search-bar { display: none; }
            .user-info { display: none; }
            .user-profile { padding: 0.25rem; background: transparent; border: none; }
            
            .footer-responsive {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }
            .hide-mobile { display: none; }
            .block-mobile { display: block; margin-bottom: 0.25rem; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
