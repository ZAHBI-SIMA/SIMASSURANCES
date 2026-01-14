import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Search,
    Filter,
    Plus,
    Car,
    Home,
    User,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const ClaimList = () => {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('Tous');
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "claims"));
                const claimsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by date desc
                setClaims(claimsData);
            } catch (error) {
                console.error("Error fetching claims:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, []);

    const filteredClaims = claims.filter(c =>
        (filterStatus === 'Tous' || c.status === filterStatus) &&
        (c.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Auto': return <Car size={16} />;
            case 'Habitation': return <Home size={16} />;
            case 'RC Pro': return <User size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'En cours': return <span className="status-badge processing"><Clock size={12} /> {status}</span>;
            case 'Expertise': return <span className="status-badge indigo"><Search size={12} /> {status}</span>;
            case 'Clôturé':
            case 'Remboursé': return <span className="status-badge success"><CheckCircle size={12} /> {status}</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header-actions">
                <div>
                    <h1>Sinistres</h1>
                    <p className="subtitle">Suivi et gestion des déclarations</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/claims/new')}>
                    <Plus size={18} />
                    Déclarer un Sinistre
                </button>
            </div>

            <div className="glass-panel filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher par client, dossier..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    {['Tous', 'En cours', 'Expertise', 'Clôturé', 'Remboursé'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Chargement des sinistres...</div>
            ) : filteredClaims.length === 0 ? (
                <div className="empty-state">Aucun sinistre trouvé.</div>
            ) : (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Réf. Dossier</th>
                                <th>Client</th>
                                <th>Type</th>
                                <th>Cause / Catégorie</th>
                                <th>Date Déclaration</th>
                                <th>Montant (Est.)</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClaims.map((claim) => (
                                <tr key={claim.id} className="clickable-row" onClick={() => navigate(`/claims/${claim.id}`)}>
                                    <td className="font-bold">
                                        {claim.claimNumber || claim.id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td>{claim.client}</td>
                                    <td>
                                        <div className="type-cell">
                                            {getTypeIcon(claim.type)} {claim.type}
                                        </div>
                                    </td>
                                    <td>{claim.category}</td>
                                    <td>{claim.date}</td>
                                    <td className="font-mono">{claim.amount ? `${claim.amount} €` : '-'}</td>
                                    <td>{getStatusBadge(claim.status)}</td>
                                    <td>
                                        <button className="btn-sm" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/claims/${claim.id}`);
                                        }}>
                                            Gérer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .page-header-actions { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .filters-bar { padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
        
        .search-input-wrapper { position: relative; width: 300px; }
        .filter-group { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.25rem; border-radius: 8px; }
        .filter-btn { padding: 0.5rem 1rem; border: none; background: none; cursor: pointer; border-radius: 6px; font-weight: 500; color: var(--color-text-muted); }
        .filter-btn.active { background: white; color: var(--color-primary); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        
        .table-container { overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 1rem; background: rgba(0,0,0,0.02); color: var(--color-text-muted); font-size: 0.8rem; }
        .data-table td { padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.02); }
        .clickable-row { cursor: pointer; transition: background 0.1s; }
        .clickable-row:hover { background: rgba(0,0,0,0.02); }
        
        .type-cell { display: flex; align-items: center; gap: 0.5rem; }
        .font-bold { font-weight: 600; }
        .font-mono { font-family: monospace; font-size: 0.95rem; }
        
        .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-badge.processing { background: hsla(38, 90%, 50%, 0.1); color: orange; }
        .status-badge.indigo { background: hsla(220, 70%, 50%, 0.1); color: var(--color-primary); }
        .status-badge.success { background: hsla(140, 70%, 40%, 0.1); color: var(--color-success); }
        
        .btn-sm { padding: 0.4rem 0.8rem; border: 1px solid var(--glass-border); background: white; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
        .btn-sm:hover { color: var(--color-primary); border-color: var(--color-primary); }
        
        .loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--color-text-muted); }
      `}</style>
        </div>
    );
};

export default ClaimList;
