import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Briefcase,
    PenTool,
    Save,
    Edit,
    Key,
    Users
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db, firebaseConfig } from '@/firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const PartnerDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('commissions');

    // Default form data
    const [formData, setFormData] = useState({
        name: '',
        type: 'Prestataire', // Prestataire | Distributeur
        category: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        status: 'En attente',
        commissionRate: '', // Only for Distributeur
        rating: '', // Only for Prestataire - typically read only or admin edit
        totalCommission: 0, // Read only mostly
        provisionalPassword: '', // Generated access
    });

    // Fetch existing data
    useEffect(() => {
        if (!isNew && id) {
            const fetchPartner = async () => {
                try {
                    const docRef = doc(db, "partners", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setFormData(docSnap.data());
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error getting document:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPartner();
        }
    }, [id, isNew]);

    const isDistributor = formData.type === 'Distributeur';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, provisionalPassword: password }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: new Date()
            };

            if (isNew) {
                // 1. Save to Firestore first
                dataToSave.email = dataToSave.email.trim().toLowerCase();
                dataToSave.createdAt = new Date();
                const docRef = await addDoc(collection(db, "partners"), dataToSave);

                // 2. Create Firebase Auth User (if password generated)
                if (formData.email && formData.provisionalPassword) {
                    try {
                        console.log("Attempting to create Firebase Auth user for partner...");
                        // Initialize a secondary app to avoid logging out the admin
                        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
                        const secondaryAuth = getAuth(secondaryApp);

                        await createUserWithEmailAndPassword(secondaryAuth, formData.email.trim().toLowerCase(), formData.provisionalPassword);
                        console.log("Partner Auth User created successfully.");

                    } catch (authError) {
                        console.error("Error creating Auth user:", authError);
                        alert(`Le partenaire a été enregistré, mais l'utilisateur de connexion n'a pas pu être créé (Email déjà utilisé ?). Erreur: ${authError.message}`);
                    }
                }

                navigate(`/admin/partners/${docRef.id}`);
            } else {
                await updateDoc(doc(db, "partners", id), dataToSave);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error saving partner:", error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Chargement...</div>;

    // View Mode vs Edit Mode
    if (isEditing) {
        return (
            <div className="page-container">
                <button className="back-btn" onClick={() => isNew ? navigate('/admin/partners') : setIsEditing(false)}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <div className="glass-panel form-container">
                    <div className="form-header">
                        <h1>{isNew ? 'Nouveau Partenaire' : `Éditer ${formData.name}`}</h1>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>

                    <div className="form-content">
                        <div className="form-group span-2">
                            <label>Nom du Partenaire</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Nom de l'entreprise ou du garage"
                            />
                        </div>

                        <div className="form-group">
                            <label>Type de Partenaire</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                                <option value="Prestataire">Prestataire (Garage, Expert...)</option>
                                <option value="Distributeur">Distributeur (Courtier, Apporteur...)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Catégorie</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ex: Garage, Courtier, Banquier"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Téléphone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group span-2">
                            <label>Adresse Complète</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Rue, Code Postal..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Ville</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Statut</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                                <option>Actif</option>
                                <option>En attente</option>
                                <option>Suspendu</option>
                            </select>
                        </div>

                        {formData.type === 'Distributeur' && (
                            <div className="form-group">
                                <label>Taux de Commission (%)</label>
                                <input
                                    type="number"
                                    name="commissionRate"
                                    value={formData.commissionRate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        )}
                        {formData.type === 'Prestataire' && (
                            <div className="form-group">
                                <label>Note (Optionnel)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        )}

                        <div className="form-group span-2" style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontSize: '1rem' }}>
                                <Key size={16} /> Accès Portail Partenaire (Provisoire)
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                <div className="form-group">
                                    <label>Mot de passe provisoire</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            name="provisionalPassword"
                                            value={formData.provisionalPassword || ''}
                                            onChange={handleChange}
                                            className="form-input"
                                            style={{ flex: 1 }}
                                            placeholder="Générer pour créer un accès"
                                        />
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                                            onClick={generatePassword}
                                        >
                                            Générer
                                        </button>
                                    </div>
                                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                        L'email du partenaire servira d'identifiant.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
                    .page-container { padding: 1rem 2rem; max-width: 1000px; margin: 0 auto; }
                    .back-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--color-text-muted); }
                    .glass-panel { padding: 2rem; border-radius: 16px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }
                    .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                    .form-content { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                    .form-group.span-2 { grid-column: span 2; }
                    .form-group label { font-size: 0.9rem; font-weight: 500; color: var(--color-text-muted); }
                    .form-input { padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; font-family: var(--font-sans); }
                    .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                `}</style>
            </div>
        );
    }

    // Read Mode
    return (
        <div className="page-container">
            <button className="back-btn" onClick={() => navigate('/admin/partners')}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="partner-header glass-panel">
                <div className="header-icon" style={{
                    background: isDistributor ? 'hsla(270, 70%, 50%, 0.1)' : 'hsla(38, 90%, 50%, 0.1)',
                    color: isDistributor ? 'purple' : 'orange'
                }}>
                    {isDistributor ? <Briefcase size={32} /> : <PenTool size={32} />}
                </div>
                <div className="header-info">
                    <div className="header-top-row">
                        <h1>{formData.name}</h1>
                        <button className="edit-icon-btn" onClick={() => setIsEditing(true)}>
                            <Edit size={18} />
                        </button>
                    </div>
                    <div className="badges">
                        <span className="badge">{formData.category}</span>
                        <span className="status-badge active">{formData.status}</span>
                    </div>
                    <div className="contact-row">
                        {formData.address && <span><MapPin size={14} /> {formData.address}, {formData.city}</span>}
                        {formData.email && <span><Mail size={14} /> {formData.email}</span>}
                        {formData.phone && <span><Phone size={14} /> {formData.phone}</span>}
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-box">
                        <span className="stat-label">{isDistributor ? 'Commissions (YTD)' : 'Prestations (YTD)'}</span>
                        <span className="stat-val">{(formData.totalCommission || 0).toLocaleString()} €</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">{isDistributor ? 'Taux Actuel' : 'Note Qualité'}</span>
                        <span className="stat-val">
                            {isDistributor ? (
                                `${formData.commissionRate || 0}%`
                            ) : (
                                formData.rating || '-'
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                <div className="left-panel">
                    <div className="glass-panel chart-card">
                        <h3>{isDistributor ? 'Performance Commerciale' : 'Volume de Missions'}</h3>
                        <div className="placeholder-chart">
                            <p style={{ color: 'var(--color-text-muted)' }}>Données non disponibles pour ce graphique.</p>
                        </div>
                    </div>

                    {formData.provisionalPassword && (
                        <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                <Key size={18} /> Accès Provisoire
                            </h3>
                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Identifiant :</span>
                                    <span style={{ fontWeight: '600' }}>{formData.email || 'Email manquant'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Mot de passe :</span>
                                    <span style={{ fontWeight: '600', fontFamily: 'monospace', background: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #eee' }}>
                                        {formData.provisionalPassword}
                                    </span>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                                Communiquez ces identifiants au partenaire. Il pourra changer son mot de passe lors de sa première connexion.
                            </p>
                        </div>
                    )}
                </div>

                <div className="right-panel">
                    <div className="tabs-bar">
                        <button className={`tab ${activeTab === 'commissions' ? 'active' : ''}`} onClick={() => setActiveTab('commissions')}>
                            Historique Financier
                        </button>
                        <button className={`tab ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}>
                            {isDistributor ? 'Contrats Apportés' : 'Missions Réalisées'}
                        </button>
                        {isDistributor && (
                            <button className={`tab ${activeTab === 'sub_agents' ? 'active' : ''}`} onClick={() => setActiveTab('sub_agents')}>
                                Sous-agents
                            </button>
                        )}
                    </div>

                    <div className="glass-panel tab-content">
                        {activeTab === 'sub_agents' ? (
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4>Réseau de distribution</h4>
                                    <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                        + Ajouter un sous-agent
                                    </button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nom</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ville</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Production</th>
                                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '0.75rem 0.5rem' }}><strong>Agence de Yopougon</strong></td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>Abidjan</td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>2.5M FCFA</td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}><span className="status-badge active">Actif</span></td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '0.75rem 0.5rem' }}><strong>Marcory Nord</strong></td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>Abidjan</td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>1.1M FCFA</td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}><span className="status-badge active">Actif</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                Aucune donnée récente.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .back-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--color-text-muted); }
        
        .partner-header { padding: 2rem; display: flex; gap: 2rem; align-items: center; margin-bottom: 2rem; }
        .header-icon { width: 80px; height: 80px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .header-info { flex: 1; }
        .header-top-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .header-info h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0; }
        .edit-icon-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); }
        .edit-icon-btn:hover { color: var(--color-primary); }
        
        .badges { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .badge { background: rgba(0,0,0,0.05); padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
        .contact-row { display: flex; gap: 1.5rem; color: var(--color-text-muted); font-size: 0.9rem; flex-wrap: wrap; }
        .contact-row span { display: flex; align-items: center; gap: 0.5rem; }
        
        .header-stats { display: flex; gap: 2rem; text-align: right; }
        .stat-box { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; }
        .stat-val { font-size: 1.5rem; font-weight: 700; color: var(--color-primary); }

        .content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }
        .chart-card { padding: 1.5rem; height: 100%; min-height: 300px; display: flex; flex-direction: column; }
        .placeholder-chart { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.02); border-radius: 8px; margin-top: 1rem; }
        
        .tabs-bar { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .tab { background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; color: var(--color-text-muted); font-weight: 600; border-bottom: 2px solid transparent; }
        .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
        
        .tab-content { padding: 0; overflow: hidden; min-height: 200px; }
        .status-badge.active { color: var(--color-success); background: hsla(140, 70%, 40%, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
      `}</style>
        </div>
    );
};

export default PartnerDetail;
