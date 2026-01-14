import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Check,
    ArrowRight,
    Search,
    Umbrella,
    Car,
    Home,
    Plane
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const PortalProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.active !== false && // Show only active
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIconForCategory = (category) => {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('auto')) return Car;
        if (cat.includes('habit')) return Home;
        if (cat.includes('voyage')) return Plane;
        return Umbrella;
    };

    return (
        <div className="portal-container">
            <header className="page-header">
                <div>
                    <h1>Catalogue Produits</h1>
                    <p className="subtitle">Sélectionnez une offre pour commencer une vente</p>
                </div>
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher une offre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="loading-state">Chargement du catalogue...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">Aucun produit disponible.</div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.map(product => {
                        const Icon = getIconForCategory(product.category);
                        return (
                            <div key={product.id} className="product-card">
                                <div className="card-image">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="product-img-cover" />
                                    ) : (
                                        <div className="icon-wrapper">
                                            <Icon size={32} />
                                        </div>
                                    )}
                                    <span className="category-badge">{product.category || 'Assurance'}</span>
                                </div>
                                <div className="card-content">
                                    <h3>{product.name}</h3>
                                    <p className="description">{product.description || 'Protection complète pour vos besoins.'}</p>

                                    <div className="price-tag" style={{ marginBottom: '1rem', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                                        {product.premium_base ? `${parseFloat(product.premium_base).toLocaleString()} FCFA` : 'Sur devis'}
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}> / mois</span>
                                    </div>

                                    <ul className="features-list">
                                        <li><Check size={14} className="check-icon" /> Souscription immédiate</li>
                                        <li><Check size={14} className="check-icon" /> Commission attractive</li>
                                    </ul>

                                    <button className="sell-btn" onClick={() => navigate('/partner-portal/quotes/new', {
                                        state: {
                                            productId: product.id,
                                            productImage: product.imageUrl,
                                            productName: product.name,
                                            category: product.category,
                                            customFields: product.customFields || [],
                                            premium: product.premium_base,
                                            commission: product.commission // Pass commission rate
                                        }
                                    })}>
                                        Vendre cette offre <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .portal-container { padding: 1.5rem 2rem; max-width: 1200px; margin: 0 auto; }
                
                .page-header { display: flex; justify-content: space-between; items-align: flex-end; margin-bottom: 2rem; }
                .page-header h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0 0 0.5rem 0; }
                .subtitle { color: var(--color-text-muted); margin: 0; }

                .search-box { position: relative; width: 300px; }
                .search-box input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.5rem; border: 1px solid var(--glass-border); border-radius: 99px; background: white; font-size: 0.95rem; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); }

                .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }

                .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.2s; border: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; }
                .product-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }

                .card-image { height: 140px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .product-img-cover { width: 100%; height: 100%; object-fit: cover; }
                .icon-wrapper { width: 64px; height: 64px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                
                .category-badge { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.9); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; color: var(--color-text); text-transform: uppercase; }

                .card-content { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
                .card-content h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: var(--color-text); }
                .description { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5; flex: 1; }

                .features-list { list-style: none; padding: 0; margin: 0 0 1.5rem 0; }
                .features-list li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--color-text); margin-bottom: 0.5rem; }
                .check-icon { color: var(--color-success); }

                .sell-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .sell-btn:hover { background: #60a5fa; }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; gap: 1rem; }
                    .search-box { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default PortalProducts;
