import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoSimas from '@/assets/logo-simas.png';

const PublicLayout = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <img src={logoSimas} alt="SIM ASSURANCES" className="h-12 w-auto" />
                        <span className="text-xl font-display font-bold text-primary">SIM ASSURANCES</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/offres" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Nos Offres</Link>
                        <Link to="/a-propos" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">À propos</Link>
                        <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Contact</Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
                        >
                            Se connecter
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Créer un compte
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={toggleMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl flex flex-col p-4 animate-in slide-in-from-top-2">
                        <nav className="flex flex-col gap-4">
                            <Link to="/" onClick={closeMenu} className="text-base font-medium text-slate-700 hover:text-primary py-2 border-b border-slate-50">Accueil</Link>
                            <Link to="/offres" onClick={closeMenu} className="text-base font-medium text-slate-700 hover:text-primary py-2 border-b border-slate-50">Nos Offres</Link>
                            <Link to="/a-propos" onClick={closeMenu} className="text-base font-medium text-slate-700 hover:text-primary py-2 border-b border-slate-50">À propos</Link>
                            <Link to="/contact" onClick={closeMenu} className="text-base font-medium text-slate-700 hover:text-primary py-2 border-b border-slate-50">Contact</Link>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <button
                                    onClick={() => { closeMenu(); navigate('/login'); }}
                                    className="text-center py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                                >
                                    Se connecter
                                </button>
                                <button
                                    onClick={() => { closeMenu(); navigate('/register'); }}
                                    className="text-center py-3 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800"
                                >
                                    Créer compte
                                </button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand & Descr */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4">SIM ASSURANCES</h4>
                        <p className="text-sm mb-4">
                            Votre partenaire confiance pour toutes vos assurances.
                            Nous nous engageons à vous offrir les meilleures protections.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4">Liens Rapides</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
                            <li><Link to="/offres" className="hover:text-white transition-colors">Nos Offres</Link></li>
                            <li><Link to="/a-propos" className="hover:text-white transition-colors">À propos</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">Espace Client</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Lot 195, Cité ATCI Rivera Faya</li>
                            <li>Abidjan, Côte d'Ivoire</li>
                            <li className="pt-2">(+225) 27 24 36 46 61</li>
                            <li>info@simassurances.com</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
                    © {new Date().getFullYear()} SIM ASSURANCES. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
