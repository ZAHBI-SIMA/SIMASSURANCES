import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Check } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';

const OffersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'products'));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;

        if (category !== 'All') {
            result = result.filter(p => p.category === category);
        }

        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(result);
    }, [products, searchTerm, category]);

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

    const categories = ['All', 'Auto', 'Habitation', 'Santé', 'Voyage']; // Mock categories if not in DB yet

    return (
        <div className="bg-slate-50 min-h-screen pt-20">
            {/* Header Section */}
            <div className="bg-primary pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-4xl font-display font-bold mb-4">Nos Offres d'Assurance</h1>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                    Découvrez une gamme complète de solutions conçues pour vous protéger, vous et votre famille, à chaque étape de votre vie.
                </p>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
                <div className="bg-white rounded-xl shadow-xl p-6 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${category === cat
                                            ? 'bg-blue-100 text-primary'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {cat === 'All' ? 'Toutes les offres' : cat}
                                </button>
                            ))}
                        </div>
                        <div className="w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Rechercher une offre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col h-full group">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                            <Shield size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                                        <p className="text-slate-600 mb-6 flex-grow">{product.description || "Une protection complète adaptée à vos besoins spécifiques."}</p>

                                        {/* Detailed guarantees mockup */}
                                        <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-lg">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase">Inclus :</h4>
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <Check size={16} className="text-green-500 mt-0.5" />
                                                    <span>Garantie premium {i + 1}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-slate-100">
                                            <button
                                                onClick={() => handleSubscribe(product.id)}
                                                className="w-full py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                Obtenir un devis <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                                <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">Aucune offre trouvée</h3>
                                <p className="text-slate-500">Essayez de modifier vos filtres de recherche.</p>
                                <button
                                    onClick={() => { setCategory('All'); setSearchTerm(''); }}
                                    className="mt-4 text-primary font-medium hover:underline"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OffersPage;
