import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Check } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';

import homeBanner from '@/assets/home-banner-v2.jpg';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'products'));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Filter active products or limit? For now show all or top 3? 
                // Landing page usually shows highlights.
                setProducts(productsData.slice(0, 3));
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSubscribe = (productId) => {
        if (user) {
            if (user.role === 'client') {
                navigate(`/client/subscription/${productId}`);
            } else if (user.role === 'admin') {
                navigate('/admin/contracts/new');
            } else {
                navigate(`/client/subscription/${productId}`);
            }
        } else {
            navigate(`/register?redirect=/client/subscription/${productId}&message=subscribe_required`);
        }
    };

    return (
        <div className="bg-slate-50">
            {/* Hero Section */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={homeBanner}
                        alt="SIM ASSURANCES Banner"
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-slate-900/60"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                            L'assurance simplement <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">intelligente</span>
                        </h1>
                        <p className="text-lg text-slate-100 mb-10 leading-relaxed font-light">
                            Protégez ce qui compte pour vous avec SIM ASSURANCES. Des solutions sur mesure, une gestion 100% en ligne et un service client dédié.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#products" className="btn-primary flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all">
                                Voir nos offres <ChevronRight size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid - Simplified for Landing */}
            <section id="products" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold font-display text-slate-900 mb-4">Nos solutions à la une</h2>
                        <p className="text-slate-600">Découvrez nos produits phares. <br />
                            <button onClick={() => navigate('/offres')} className="text-primary font-semibold hover:underline mt-2">Voir toutes nos offres</button> (coming soon linked page)</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <div key={product.id} className="group bg-slate-50 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-xl border border-slate-100 hover:border-slate-200 cursor-pointer flex flex-col h-full">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                            <Shield size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                                        <p className="text-slate-600 mb-6 flex-grow line-clamp-3">{product.description || "Une protection complète pour vos besoins."}</p>

                                        <button
                                            onClick={() => handleSubscribe(product.id)}
                                            className="w-full py-3 rounded-lg border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
                                        >
                                            Souscrire
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <p>Aucun produit disponible pour le moment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
