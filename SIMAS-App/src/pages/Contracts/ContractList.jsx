import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Search,
    Filter,
    Plus,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';

const ContractList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState('Tous');
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                let q;
                // If user is a partner, only show their contracts
                if (user?.role === 'partner') {
                    // Try to filter by partnerId if it exists on contract
                    // Or filter in memory if the field is inconsistent yet
                    // For now, let's query with where clause to be efficient
                    q = query(collection(db, "contracts"), where("partnerId", "==", user.partnerId));
                } else {
                    q = collection(db, "contracts");
                }

                const querySnapshot = await getDocs(q);
                const contractsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setContracts(contractsData);
            } catch (error) {
                console.error("Error fetching contracts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchContracts();
        }
    }, [user]);

    const filteredContracts = contracts.filter(c =>
        (filterStatus === 'Tous' || c.status === filterStatus) &&
        (c.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Actif': return <span className="status-badge active"><CheckCircle size={12} /> Actif</span>;
            case 'En attente': return <span className="status-badge pending"><Clock size={12} /> En attente</span>;
            case 'Résilié': return <span className="status-badge error"><AlertCircle size={12} /> Résilié</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    const isPartner = user?.role === 'partner';

    return (
        <div className="page-container">
            <div className="page-header-actions">
                <div>
                    <h1>Contrats</h1>
                    <p className="subtitle">Gestion des polices d'assurance</p>
                </div>
                {!isPartner && (
                    <button className="btn-primary" onClick={() => navigate('/contracts/new')}>
                        <Plus size={18} />
                        Nouveau Contrat
                    </button>
                )}
            </div>

            <div className="glass-panel filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un contrat, client..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    {['Tous', 'Actif', 'En attente', 'Résilié'].map(status => (
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
                <div className="loading-state">Chargement des contrats...</div>
            ) : filteredContracts.length === 0 ? (
                <div className="empty-state">Aucun contrat trouvé.</div>
            ) : (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Réf. Contrat</th>
                                <th>Client</th>
                                <th>Type de Produit</th>
                                <th>Date d'Effet</th>
                                <th>Prime Annuelle</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContracts.map((contract) => (
                                <tr key={contract.id} className="clickable-row" onClick={() => navigate(`/contracts/${contract.id}`)}>
                                    <td className="font-medium">
                                        {contract.contractNumber || contract.id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td>{contract.client}</td>
                                    <td><span className="badge">{contract.type}</span></td>
                                    <td>{contract.date}</td>
                                    <td className="font-bold">{contract.premium ? `${contract.premium} FCFA` : '-'}</td>
                                    <td>{getStatusBadge(contract.status)}</td>
                                    <td>
                                        <button className="btn-sm" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/contracts/${contract.id}`);
                                        }}>
                                            Détails
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
        
        .badge { background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .status-badge.active { background: hsla(140, 70%, 40%, 0.1); color: var(--color-success); }
        .status-badge.pending { background: hsla(38, 90%, 50%, 0.1); color: orange; }
        .status-badge.error { background: hsla(0, 70%, 60%, 0.1); color: var(--color-danger); }
        
        .font-medium { font-weight: 500; }
        .font-bold { font-weight: 700; }
        .btn-sm { padding: 0.4rem 0.8rem; border: 1px solid var(--glass-border); background: white; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
        .btn-sm:hover { border-color: var(--color-primary); color: var(--color-primary); }
        
        .loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--color-text-muted); }
      `}</style>
        </div>
    );
};

export default ContractList;
