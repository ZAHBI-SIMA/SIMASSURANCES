import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Phone,
    Mail,
    MapPin,
    LayoutList,
    Columns
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import ProspectKanban from './ProspectKanban';

const ProspectList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Tous');
    const [prospects, setProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

    const fetchProspects = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "prospects"));
            const prospectsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProspects(prospectsData);
        } catch (error) {
            console.error("Error fetching prospects:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProspects();
    }, [fetchProspects]);

    const filteredProspects = prospects.filter(prospect =>
        (filterType === 'Tous' || prospect.type === filterType) &&
        (prospect.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prospect.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container">
            <div className="page-header-actions">
                <div>
                    <h1>Prospects</h1>
                    <p className="subtitle">Suivi des opportunités commerciales</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/prospects/new')}>
                    <Plus size={18} />
                    Nouveau Prospect
                </button>
            </div>

            <div className="glass-panel filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un prospect..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="view-toggles" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', marginRight: '1rem' }}>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="Vue Liste"
                    >
                        <LayoutList size={18} />
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                        onClick={() => setViewMode('kanban')}
                        title="Vue Pipeline"
                    >
                        <Columns size={18} />
                    </button>
                </div>

                <div className="filter-group">
                    {['Tous', 'Chaud', 'Froid'].map((type) => (
                        <button
                            key={type}
                            className={`filter-btn ${filterType === type ? 'active' : ''}`}
                            onClick={() => setFilterType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="glass-panel table-container">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chargement des prospects...</div>
                    ) : filteredProspects.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Aucun prospect trouvé.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nom / Contact</th>
                                    <th>État</th>
                                    <th>Coordonnées</th>
                                    <th>Source</th>
                                    <th>Potentiel</th>
                                    <th className="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProspects.map((prospect) => (
                                    <tr key={prospect.id} onClick={() => navigate(`/prospects/${prospect.id}`)} className="clickable-row">
                                        <td>
                                            <div className="client-name-cell">
                                                <div className="avatar-initials" style={{ backgroundColor: 'var(--color-accent)' }}>
                                                    {prospect.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{prospect.name}</div>
                                                    <div className="text-muted text-sm">{prospect.company || 'Particulier'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${prospect.status === 'Chaud' ? 'badge-orange' : 'badge-gray'}`}>
                                                {prospect.status || 'Nouveau'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <div className="contact-item"><Mail size={12} /> {prospect.email}</div>
                                                <div className="contact-item"><Phone size={12} /> {prospect.phone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            {prospect.source || '-'}
                                        </td>
                                        <td>
                                            <div className="font-bold">{prospect.potential_revenue ? `${prospect.potential_revenue} €` : '-'}</div>
                                        </td>
                                        <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                                            <button className="action-btn" title="Voir">
                                                <Eye size={16} />
                                            </button>
                                            <button className="action-btn" title="Éditer">
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <ProspectKanban prospects={filteredProspects} onProspectUpdate={fetchProspects} />
            )}

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .filters-bar { padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .search-input-wrapper { position: relative; width: 300px; }
        .filter-group { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.25rem; border-radius: var(--radius-md); }
        .filter-btn { border: none; background: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--color-text-muted); transition: all 0.2s; }
        .filter-btn.active { background: white; color: var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .view-btn { border: none; background: none; padding: 0.4rem; border-radius: 8px; cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .view-btn:hover { background: rgba(0,0,0,0.05); color: var(--color-text); }
        .view-btn.active { background: white; color: var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .table-container { overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--glass-border); }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.02); font-size: 0.95rem; }
        .clickable-row { cursor: pointer; transition: background 0.1s; }
        .clickable-row:hover { background: rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.03); }
        .client-name-cell { display: flex; align-items: center; gap: 1rem; }
        .avatar-initials { width: 40px; height: 40px; border-radius: 10px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .text-sm { font-size: 0.8rem; }
        .text-muted { color: var(--color-text-muted); }
        .font-bold { font-weight: 600; }
        .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .badge-orange { background: hsla(30, 90%, 60%, 0.1); color: #e67e22; }
        .badge-gray { background: hsla(0, 0%, 50%, 0.1); color: var(--color-text-muted); }
        .contact-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .contact-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--color-text-muted); }
        .actions-col { text-align: right; }
        .action-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 0.5rem; border-radius: 50%; transition: all 0.2s; }
        .action-btn:hover { background: rgba(0,0,0,0.05); color: var(--color-primary); }
      `}</style>
        </div>
    );
};

export default ProspectList;
