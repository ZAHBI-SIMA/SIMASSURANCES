import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    FileText,
    AlertTriangle,
    CreditCard,
    Edit,
    Download,
    Save
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [activeTab, setActiveTab] = useState('contracts');
    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Particulier',
        email: '',
        phone: '',
        address: '',
        city: '',
        joinDate: new Date().toLocaleDateString(),
        manager: 'Admin',
        contracts: [],
        claims: []
    });

    useEffect(() => {
        if (!isNew && id) {
            const fetchClient = async () => {
                try {
                    const docRef = doc(db, "clients", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            ...data,
                            contracts: data.contracts || [],
                            claims: data.claims || []
                        });
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error getting document:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchClient();
        }
    }, [id, isNew]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: new Date()
            };

            if (isNew) {
                dataToSave.createdAt = new Date();
                dataToSave.status = 'Actif';
                await addDoc(collection(db, "clients"), dataToSave);
            } else {
                await updateDoc(doc(db, "clients", id), dataToSave);
            }

            if (isNew) {
                navigate('/clients');
            } else {
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const pieData = [
        { name: 'Auto', value: 650 },
        { name: 'Habitation', value: 320 },
    ];
    const COLORS = ['var(--color-primary)', 'var(--color-accent)'];

    if (loading) return <div className="p-4 text-center">Chargement...</div>;

    if (isEditing) {
        return (
            <div className="page-container">
                <button className="back-btn" onClick={() => isNew ? navigate('/clients') : setIsEditing(false)}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <div className="glass-panel form-container">
                    <div className="form-header">
                        <h1>{isNew ? 'Nouveau Client' : `Éditer ${formData.name}`}</h1>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>

                    <div className="form-content">
                        <div className="form-group span-2">
                            <label>Nom / Raison Sociale</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Nom complet"
                            />
                        </div>

                        <div className="form-group">
                            <label>Type de Client</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                                <option>Particulier</option>
                                <option>Entreprise</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="email@exemple.com"
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
                                placeholder="06..."
                            />
                        </div>

                        <div className="form-group span-2">
                            <label>Adresse</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Adresse complète"
                            />
                        </div>

                        <div className="form-group">
                            <label>Ville / CP</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Paris 75000"
                            />
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

    // View Mode (Dashboard)
    return (
        <div className="page-container">
            <button className="back-btn" onClick={() => navigate('/clients')}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="profile-header glass-panel">
                <div className="profile-main">
                    <div className="profile-avatar">
                        {formData.name.charAt(0) || '?'}
                    </div>
                    <div className="profile-info">
                        <div className="profile-top">
                            <h1>{formData.name}</h1>
                            <span className="badge badge-blue">{formData.type}</span>
                            <span className="status-badge active">Actif</span>
                        </div>
                        <div className="profile-meta">
                            <span><Mail size={14} /> {formData.email || 'Non renseigné'}</span>
                            <span><Phone size={14} /> {formData.phone || 'Non renseigné'}</span>
                            <span><MapPin size={14} /> {formData.city ? `${formData.address}, ${formData.city}` : (formData.address || 'Non renseigné')}</span>
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="btn-secondary" onClick={() => setIsEditing(true)}><Edit size={16} /> Modifier</button>
                    <button className="btn-primary"><FileText size={16} /> Nouveau Contrat</button>
                </div>
            </div>

            <div className="detail-grid">
                <div className="left-col">
                    <div className="glass-panel summary-card">
                        <h3>Synthèse Portefeuille</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="total-premium">
                                <span className="label">Prime Annuelle</span>
                                <span className="value">970 €</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel info-card">
                        <h3>Informations Complémentaires</h3>
                        <div className="info-row">
                            <span className="label">Date d'inscription</span>
                            <span className="value">{formData.joinDate}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Gestionnaire</span>
                            <span className="value">{formData.manager}</span>
                        </div>
                    </div>
                </div>

                <div className="right-col">
                    <div className="tabs-container">
                        <div className="tabs-header">
                            <button
                                className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('contracts')}
                            >
                                <FileText size={16} /> Contrats ({formData.contracts.length})
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
                                onClick={() => setActiveTab('claims')}
                            >
                                <AlertTriangle size={16} /> Sinistres ({formData.claims.length})
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >
                                <Download size={16} /> Documents
                            </button>
                        </div>

                        <div className="glass-panel tab-content">
                            {activeTab === 'contracts' && (
                                <div className="empty-state">
                                    <p>Liste des contrats (À implémenter)</p>
                                </div>
                            )}

                            {activeTab === 'claims' && (
                                <div className="empty-state">
                                    <p>Liste des sinistres (À implémenter)</p>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="empty-state">
                                    <p>Aucun document disponible.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .back-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: var(--color-text-muted); cursor: pointer; margin-bottom: 1rem; font-weight: 500; }
        .back-btn:hover { color: var(--color-primary); }
        .profile-header { display: flex; justify-content: space-between; padding: 2rem; margin-bottom: 2rem; align-items: flex-start; }
        .profile-main { display: flex; gap: 1.5rem; }
        .profile-avatar { width: 80px; height: 80px; border-radius: 20px; background: var(--color-primary); color: white; font-size: 2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.3); }
        .profile-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
        .profile-top h1 { margin-right: 0.5rem; }
        .profile-meta { display: flex; gap: 1.5rem; color: var(--color-text-muted); font-size: 0.9rem; }
        .profile-meta span { display: flex; align-items: center; gap: 0.5rem; }
        .profile-actions { display: flex; gap: 1rem; }
        .btn-secondary { background: white; border: 1px solid var(--glass-border); padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: var(--color-text); }
        .detail-grid { display: grid; grid-template-columns: 350px 1fr; gap: 1.5rem; }
        .summary-card { padding: 1.5rem; margin-bottom: 1.5rem; }
        .info-card { padding: 1.5rem; }
        .info-row { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .info-row:last-child { border-bottom: none; }
        .label { color: var(--color-text-muted); font-size: 0.9rem; }
        .value { font-weight: 600; }
        .total-premium { text-align: center; margin-top: 1rem; }
        .tabs-header { display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; }
        .tab-btn { background: none; border: none; padding: 0.75rem 1rem; cursor: pointer; font-weight: 600; color: var(--color-text-muted); display: flex; align-items: center; gap: 0.5rem; position: relative; }
        .tab-btn.active { color: var(--color-primary); }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -0.6rem; left: 0; width: 100%; height: 3px; background: var(--color-primary); border-radius: 3px 3px 0 0; }
        .tab-content { padding: 0; overflow: hidden; }
        .empty-state { padding: 3rem; text-align: center; color: var(--color-text-muted); }
        .p-4 { padding: 1rem; }
        .text-center { text-align: center; }
      `}</style>
        </div>
    );
};

export default ClientDetail;
