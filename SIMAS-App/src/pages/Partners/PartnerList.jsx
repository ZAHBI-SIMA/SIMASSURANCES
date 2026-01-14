import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    MapPin,
    Phone,
    Mail,
    PenTool, // For Providers
    Briefcase, // For Distributors
    Plus,
    MoreVertical,
    Eye,
    Target,
    X,
    CheckCircle,
    Trash2,
    Power
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const PartnerList = () => {
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('Tous');
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Mission Assignment State
    const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [claims, setClaims] = useState([]);
    const [selectedClaimId, setSelectedClaimId] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Action Menu State
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "partners"));
                const partnersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPartners(partnersData);
            } catch (error) {
                console.error("Error fetching partners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    // Fetch claims when modal opens
    useEffect(() => {
        if (isMissionModalOpen) {
            const fetchClaims = async () => {
                try {
                    // Ideally filter by 'En cours' or 'Nouveau'
                    const q = query(collection(db, "claims"));
                    const querySnapshot = await getDocs(q);
                    const claimsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setClaims(claimsData);
                } catch (error) {
                    console.error("Error fetching claims:", error);
                }
            };
            fetchClaims();
        }
    }, [isMissionModalOpen]);

    const openAssignmentModal = (partner, e) => {
        e.stopPropagation();
        setActiveMenuId(null);
        setSelectedPartner(partner);
        setIsMissionModalOpen(true);
        setSuccessMessage('');
        setSelectedClaimId('');
    };

    const toggleMenu = (partnerId, e) => {
        e.stopPropagation();
        if (activeMenuId === partnerId) {
            setActiveMenuId(null);
        } else {
            setActiveMenuId(partnerId);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAssignMission = async (e) => {
        e.preventDefault();
        setAssignmentLoading(true);
        try {
            const selectedClaim = claims.find(c => c.id === selectedClaimId);
            if (!selectedClaim) return;

            await addDoc(collection(db, 'missions'), {
                partnerId: selectedPartner.id,
                partnerName: selectedPartner.name,
                claimId: selectedClaim.id,
                claimRef: selectedClaim.claimNumber || selectedClaim.id.substring(0, 8),
                client: selectedClaim.client,
                type: 'Sinistre ' + (selectedClaim.type || 'Auto'),
                address: selectedClaim.location || 'Non renseigné',
                description: `Mission d'expertise pour le dossier ${selectedClaim.claimNumber || 'Sinistre'}`,
                status: 'new',
                createdAt: serverTimestamp()
            });

            setSuccessMessage("Mission attribuée avec succès !");
            setTimeout(() => {
                setIsMissionModalOpen(false);
                setSuccessMessage('');
            }, 1500);

        } catch (error) {
            console.error("Error assigning mission: ", error);
            alert("Erreur lors de l'attribution de la mission");
        } finally {
            setAssignmentLoading(false);
        }
    };

    const handleDeletePartner = async (partnerId, e) => {
        e.stopPropagation();
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ? Cette action est irréversible.')) {
            try {
                await deleteDoc(doc(db, "partners", partnerId));
                setPartners(partners.filter(p => p.id !== partnerId));
            } catch (error) {
                console.error("Error deleting partner:", error);
                alert("Erreur lors de la suppression.");
            }
        }
    };

    const handleToggleStatus = async (partner, e) => {
        e.stopPropagation();
        const newStatus = partner.status === 'Actif' ? 'Inactif' : 'Actif';
        try {
            await updateDoc(doc(db, "partners", partner.id), { status: newStatus });
            setPartners(partners.map(p => p.id === partner.id ? { ...p, status: newStatus } : p));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    const filteredPartners = partners.filter(p =>
        (filterType === 'Tous' || p.type === filterType) &&
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-container">
            <div className="page-header-actions">
                <div>
                    <h1>Partenaires</h1>
                    <p className="subtitle">Gérez vos réseaux de Prestataires et Distributeurs</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/partners/new')}>
                    <Plus size={18} />
                    Nouveau Partenaire
                </button>
            </div>

            <div className="glass-panel filters-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher un partenaire..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    {['Tous', 'Prestataire', 'Distributeur'].map(type => (
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

            {loading ? (
                <div className="loading-state">Chargement des partenaires...</div>
            ) : filteredPartners.length === 0 ? (
                <div className="empty-state">Aucun partenaire trouvé.</div>
            ) : (
                <div className="partners-grid">
                    {filteredPartners.map(partner => (
                        <div key={partner.id} className="glass-panel partner-card" onClick={() => navigate(`/admin/partners/${partner.id}`)}>
                            <div className="partner-header">
                                <div className={`partner-icon ${partner.type === 'Distributeur' ? 'distributor' : 'provider'}`}>
                                    {partner.type === 'Distributeur' ? <Briefcase size={24} /> : <PenTool size={24} />}
                                </div>
                                <div className="header-right">
                                    <div className="partner-badges">
                                        <span className={`badge ${partner.type === 'Distributeur' ? 'badge-purple' : 'badge-orange'}`}>
                                            {partner.category}
                                        </span>
                                    </div>
                                    <button className="menu-trigger" onClick={(e) => toggleMenu(partner.id, e)}>
                                        <MoreVertical size={18} />
                                    </button>

                                    {activeMenuId === partner.id && (
                                        <div className="action-menu">
                                            <button className="menu-item" onClick={(e) => handleToggleStatus(partner, e)}>
                                                <Power size={14} className={partner.status === 'Actif' ? 'text-orange' : 'text-green'} />
                                                {partner.status === 'Actif' ? 'Désactiver' : 'Activer'}
                                            </button>
                                            <button className="menu-item text-red" onClick={(e) => handleDeletePartner(partner.id, e)}>
                                                <Trash2 size={14} />
                                                Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="partner-name">{partner.name}</h3>

                            <div className="partner-info">
                                <div className="info-item"><MapPin size={14} /> {partner.city || 'Non renseigné'}</div>
                                <div className="info-item"><span className={`status-dot ${partner.status === 'Actif' ? 'status-active' : 'status-pending'}`}>{partner.status || 'En attente'}</span></div>
                            </div>

                            <div className="partner-metrics">
                                {partner.type === 'Distributeur' ? (
                                    <div className="metric">
                                        <span className="metric-label">Commission</span>
                                        <span className="metric-value">{partner.commissionRate ? `${partner.commissionRate}%` : '-'}</span>
                                    </div>
                                ) : (
                                    <div className="metric">
                                        <span className="metric-label">Note Qualité</span>
                                        <span className="metric-value">{partner.rating ? <>{partner.rating} <span className="star">★</span></> : '-'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button className="view-btn outline" onClick={(e) => { e.stopPropagation(); navigate(`/admin/partners/${partner.id}`); }}>
                                    <Eye size={16} /> Voir
                                </button>
                                {partner.type !== 'Distributeur' && (
                                    <button className="view-btn primary" onClick={(e) => openAssignmentModal(partner, e)}>
                                        <Target size={16} /> Attribuer Mission
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Mission Assignment Modal */}
            {isMissionModalOpen && (
                <div className="modal-overlay" onClick={() => setIsMissionModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Attribuer une mission</h2>
                            <button className="close-btn" onClick={() => setIsMissionModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {successMessage ? (
                            <div className="success-message">
                                <CheckCircle size={48} />
                                <p>{successMessage}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleAssignMission}>
                                <div className="modal-body">
                                    <p className="modal-intro">
                                        Assigner une mission d'expertise à <strong>{selectedPartner?.name}</strong>.
                                    </p>

                                    <div className="form-group">
                                        <label>Sélectionner le sinistre concerné</label>
                                        <select
                                            required
                                            value={selectedClaimId}
                                            onChange={e => setSelectedClaimId(e.target.value)}
                                            className="claim-select"
                                        >
                                            <option value="">-- Choisir un dossier --</option>
                                            {claims.map(claim => (
                                                <option key={claim.id} value={claim.id}>
                                                    {claim.claimNumber || claim.id.substring(0, 8).toUpperCase()} - {claim.client} ({claim.type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mission-preview" style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        <p><strong>Type :</strong> Expertise Sinistre</p>
                                        <p><strong>Statut initial :</strong> Nouveau (New)</p>
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Le partenaire recevra une notification dans son espace portail.</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setIsMissionModalOpen(false)}>Annuler</button>
                                    <button type="submit" className="btn-primary" disabled={assignmentLoading || !selectedClaimId}>
                                        {assignmentLoading ? 'Attribution...' : 'Confirmer l\'attribution'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .page-header-actions { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .filters-bar { padding: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; }
        
        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .partner-card {
          padding: 1.5rem;
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .partner-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.05);
        }

        .partner-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .header-right { display: flex; align-items: center; gap: 0.5rem; position: relative; }
        .menu-trigger { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 4px; border-radius: 4px; }
        .menu-trigger:hover { background: rgba(0,0,0,0.05); color: var(--color-text); }
        
        .action-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid var(--glass-border);
            z-index: 10;
            min-width: 150px;
            overflow: hidden;
            animation: fadeIn 0.1s ease;
        }
        
        .menu-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1rem;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            font-size: 0.85rem;
            color: var(--color-text);
        }
        
        .menu-item:hover { background: #f9fafb; }
        .text-red { color: #ef4444; }
        .text-orange { color: #f97316; }
        .text-green { color: #22c55e; }

        .partner-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .partner-icon.distributor { background: hsla(270, 70%, 50%, 0.1); color: purple; }
        .partner-icon.provider { background: hsla(38, 90%, 50%, 0.1); color: orange; }

        .partner-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-primary);
        }

        .partner-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        .info-item { display: flex; align-items: center; gap: 0.5rem; }

        .partner-metrics {
          padding-top: 1rem;
          border-top: 1px solid var(--glass-border);
          margin-bottom: 1.5rem;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label { font-size: 0.85rem; color: var(--color-text-muted); }
        .metric-value { font-weight: 700; color: var(--color-text); }
        .star { color: orange; }
        
        .card-actions { display: grid; grid-template-columns: 1fr 1.5fr; gap: 0.5rem; margin-top: auto; }

        .view-btn {
          padding: 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        .view-btn.outline { border: 1px solid var(--glass-border); background: white; color: var(--color-text); }
        .view-btn.outline:hover { border-color: var(--color-primary); color: var(--color-primary); }
        
        .view-btn.primary { background: var(--color-primary); color: white; border: none; }
        .view-btn.primary:hover { opacity: 0.9; }
        
        .search-input-wrapper { position: relative; width: 300px; }
        .filter-group { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.25rem; border-radius: 8px; }
        .filter-btn { padding: 0.5rem 1rem; border: none; background: none; cursor: pointer; border-radius: 6px; font-weight: 500; color: var(--color-text-muted); }
        .filter-btn.active { background: white; color: var(--color-primary); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        
        .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .badge-purple { background: hsla(270, 70%, 50%, 0.1); color: purple; }
        .badge-orange { background: hsla(38, 90%, 50%, 0.1); color: orange; }
        
        .status-dot { display: inline-flex; align-items: center; }
        .status-dot::before { content: ''; width: 6px; height: 6px; border-radius: 50%; margin-right: 0.5rem; }
        .status-active::before { background: var(--color-success); }
        .status-active { color: var(--color-success); }
        
        .loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--color-text-muted); }
        
        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal-content { background: white; width: 100%; max-width: 500px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { margin: 0; color: var(--color-primary); font-size: 1.5rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); }
        
        .modal-body { margin-bottom: 2rem; }
        .modal-intro { margin-bottom: 1.5rem; color: var(--color-text); }
        
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .claim-select { width: 100%; padding: 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: inherit; font-size: 1rem; }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-secondary { background: none; border: 1px solid #e5e7eb; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-secondary:hover { background: #f9fafb; }
        
        .success-message { text-align: center; color: #16a34a; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem 0; }
        .success-message p { font-size: 1.2rem; font-weight: 600; margin: 0; }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
        </div>
    );
};

export default PartnerList;
