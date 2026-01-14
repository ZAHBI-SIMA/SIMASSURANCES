import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Search,
    Plus,
    Tag,
    Layers,
    MoreHorizontal,
    Image as ImageIcon
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const ProductList = () => {
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
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div className="page-header-actions">
                <div>
                    <h1>Produits</h1>
                    <p className="subtitle">Catalogue des offres d'assurance</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/products/new')}>
                    <Plus size={18} />
                    Nouveau Produit
                </button>
            </div>

            <div className="glass-panel filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-panel table-container">
                {loading ? (
                    <div className="loading-state">Chargement des produits...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">Aucun produit trouvé. Créez-en un nouveau !</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Catégorie</th>
                                <th>Code</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="clickable-row">
                                    <td className="font-bold">
                                        <div className="flex-cell">
                                            <div className="product-thumb">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" />
                                                ) : (
                                                    <Box size={16} className="text-muted" />
                                                )}
                                            </div>
                                            {product.name}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge">
                                            {product.category || 'Général'}
                                        </span>
                                    </td>
                                    <td className="font-mono">{product.code || '-'}</td>
                                    <td>
                                        <span className={`status-dot ${product.active ? 'active' : 'inactive'}`}></span>
                                        {product.active ? 'Actif' : 'Inactif'}
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={() => navigate(`/products/${product.id}`)}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .page-header-actions { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .filters-bar { padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
        .search-input-wrapper { position: relative; width: 300px; }
        
        .table-container { overflow: hidden; min-height: 200px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 1rem; background: rgba(0,0,0,0.02); color: var(--color-text-muted); font-size: 0.8rem; }
        .data-table td { padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.02); }
        .clickable-row:hover { background: rgba(0,0,0,0.02); }
        
        .flex-cell { display: flex; align-items: center; gap: 0.75rem; }
        .product-thumb { width: 32px; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .text-muted { color: var(--color-text-muted); }
        .font-bold { font-weight: 600; }
        .font-mono { font-family: monospace; font-size: 0.9rem; }
        
        .badge { background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
        
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .status-dot.active { background: var(--color-success); }
        .status-dot.inactive { background: var(--color-text-muted); }
        
        .btn-icon { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 4px; border-radius: 4px; }
        .btn-icon:hover { background: rgba(0,0,0,0.05); color: var(--color-text); }
        
        .loading-state, .empty-state { padding: 3rem; text-align: center; color: var(--color-text-muted); }
      `}</style>
        </div>
    );
};

export default ProductList;
