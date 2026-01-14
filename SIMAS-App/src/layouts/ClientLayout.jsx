import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, LayoutDashboard, FileText, AlertCircle, User, LogOut, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';

const ClientLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-30 transition-transform duration-300 ease-in-out flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white">
                        <img src={logo} alt="SIM ASSURANCES" className="h-10 w-auto object-contain bg-white rounded-lg p-1" />
                        <div>
                            <h1 className="font-display font-bold text-lg leading-tight">SIM <span className="block text-xs font-normal">ASSURANCES</span></h1>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavLink
                        to="/client"
                        end
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <LayoutDashboard size={20} />
                        Tableau de bord
                    </NavLink>

                    <NavLink
                        to="/client/contracts"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <FileText size={20} />
                        Mes Contrats
                    </NavLink>

                    <NavLink
                        to="/client/claims"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <AlertCircle size={20} />
                        Mes Sinistres
                    </NavLink>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-2">Compte</p>
                        <NavLink
                            to="/client/profile"
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <User size={20} />
                            Mon Profil
                        </NavLink>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                    {/* User profile removed from sidebar */}
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-20 px-4 h-16 flex items-center justify-between shadow-sm">
                <button onClick={toggleSidebar} className="text-white hover:bg-white/10 p-1 -ml-1 rounded-lg">
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <img src={logo} alt="SIM ASSURANCES" className="h-8 w-auto object-contain bg-white rounded-lg p-0.5" />
                    <span className="font-display font-bold text-lg text-white leading-tight">SIM <span className="text-xs font-normal block -mt-1">ASSURANCES</span></span>
                </div>

                {/* Mobile Profile Toggle */}
                <button onClick={() => navigate('/client/profile')}>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-slate-700 shadow-sm">
                        {user?.firstName?.charAt(0) || 'C'}
                    </div>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
                <div className="max-w-5xl mx-auto">

                    {/* Desktop Header */}
                    <header className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-slate-800">
                                Bienvenue, {user?.firstName}
                            </h2>
                            <p className="text-slate-500 text-sm">Gérez vos contrats et sinistres en toute simplicité</p>
                        </div>
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 px-3 rounded-full border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
                            onClick={() => navigate('/client/profile')}
                        >
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-slate-700">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                                {user?.firstName?.charAt(0) || 'C'}
                            </div>
                        </div>
                    </header>

                    <Outlet />

                    <footer className="mt-12 pt-8 border-t border-slate-200 text-slate-500 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">SIM ASSURANCES</h4>
                                <p>Votre partenaire confiance.</p>
                                <div className="mt-4 space-y-1">
                                    <p>Lot 195, Cité ATCI Rivera Faya</p>
                                    <p>Abidjan, Côte d'Ivoire</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">Nous contacter</h4>
                                <div className="space-y-1">
                                    <p>(+225) 27 24 36 46 61</p>
                                    <p>info@simassurances.com</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center pt-4 border-t border-slate-100">
                            © {new Date().getFullYear()} SIM ASSURANCES. Tous droits réservés.
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default ClientLayout;
