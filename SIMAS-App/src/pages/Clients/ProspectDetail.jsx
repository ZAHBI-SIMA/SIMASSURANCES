import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    FileText,
    Save,
    Edit,
    Thermometer
} from 'lucide-react';
import { doc, getDoc, addDoc, updateDoc, collection, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

const ProspectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'Froid',
        source: 'Site Web',
        potential_revenue: '',
        notes: '',
        lastContact: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (!isNew && id) {
            const fetchProspect = async () => {
                try {
                    const docRef = doc(db, "prospects", id);
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
            fetchProspect();
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
                await addDoc(collection(db, "prospects"), dataToSave);
            } else {
                await updateDoc(doc(db, "prospects", id), dataToSave);
            }

            if (isNew) {
                navigate('/prospects');
            } else {
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error saving prospect:", error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const handleConvertToClient = async () => {
        if (!confirm("Voulez-vous vraiment convertir ce prospect en client ?")) return;

        setSaving(true);
        try {
            // 1. Prepare client data
            const newClientData = {
                name: formData.name || 'Inconnu',
                email: formData.email || '',
                phone: formData.phone || '',
                type: formData.company ? 'Entreprise' : 'Particulier',
                company: formData.company || '',
                address: '', // Prospect doesn't have address field typically, usually empty or mapped if exists
                city: '',
                status: 'Actif',
                createdAt: new Date(),
                convertedFromProspectId: id,
                notes: `Converti manuellement le ${new Date().toLocaleDateString()}.\n${formData.notes || ''}`
            };

            // 2. Add to clients
            const clientRef = await addDoc(collection(db, "clients"), newClientData);

            // 3. Delete from prospects if it exists (not new)
            if (!isNew && id) {
                await deleteDoc(doc(db, "prospects", id));
            }

            // 4. Navigate to new client
            navigate(`/clients/${clientRef.id}`);

        } catch (error) {
            console.error("Error converting prospect:", error);
            alert("Une erreur est survenue lors de la conversion.");
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Chargement...</div>;

    if (isEditing) {
        return (
            <div className="page-container">
                <button className="back-btn" onClick={() => isNew ? navigate('/prospects') : setIsEditing(false)}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <div className="glass-panel form-container">
                    <div className="form-header">
                        <h1>{isNew ? 'Nouveau Prospect' : `Éditer ${formData.name}`}</h1>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>

                    <div className="form-content">
                        <div className="form-group span-2">
                            <label>Nom du Contact</label>
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
                            <label>Entreprise (Optionnel)</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Nom de l'entreprise"
                            />
                        </div>

                        <div className="form-group">
                            <label>Statut</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                                <option>Froid</option>
                                <option>Tiède</option>
                                <option>Chaud</option>
                                <option>Gagné</option>
                                <option>Perdu</option>
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

                        <div className="form-group">
                            <label>Source</label>
                            <input
                                type="text"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ex: Site Web, Recommandation..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Potentiel (€)</label>
                            <input
                                type="number"
                                name="potential_revenue"
                                value={formData.potential_revenue}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group span-2">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="form-input"
                                rows="4"
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

    return (
        <div className="page-container">
            <button className="back-btn" onClick={() => navigate('/prospects')}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="profile-header glass-panel">
                <div className="profile-main">
                    <div className="profile-avatar" style={{ background: 'var(--color-accent)' }}>
                        {formData.name.charAt(0) || '?'}
                    </div>
                    <div className="profile-info">
                        <div className="profile-top">
                            <h1>{formData.name}</h1>
                            <span className="badge badge-orange">{formData.status}</span>
                        </div>
                        <div className="profile-meta">
                            <span><Mail size={14} /> {formData.email || 'Non renseigné'}</span>
                            <span><Phone size={14} /> {formData.phone || 'Non renseigné'}</span>
                            <span><Thermometer size={14} /> Potentiel: {formData.potential_revenue ? `${formData.potential_revenue} €` : '-'}</span>
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    <button className="btn-secondary" onClick={() => setIsEditing(true)}><Edit size={16} /> Modifier</button>
                    <button className="btn-primary" onClick={handleConvertToClient} disabled={saving}>
                        {saving ? 'Conversion...' : 'Convertir en Client'}
                    </button>
                </div>
            </div>

            <div className="glass-panel info-card">
                <h3>Notes & Suivi</h3>
                <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{formData.notes || 'Aucune note.'}</p>
            </div>

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .back-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: var(--color-text-muted); cursor: pointer; margin-bottom: 1rem; font-weight: 500; }
        .back-btn:hover { color: var(--color-primary); }
        .profile-header { display: flex; justify-content: space-between; padding: 2rem; margin-bottom: 2rem; align-items: flex-start; }
        .profile-main { display: flex; gap: 1.5rem; }
        .profile-avatar { width: 80px; height: 80px; border-radius: 20px; color: white; font-size: 2rem; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .profile-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
        .profile-meta { display: flex; gap: 1.5rem; color: var(--color-text-muted); font-size: 0.9rem; }
        .profile-meta span { display: flex; align-items: center; gap: 0.5rem; }
        .profile-actions { display: flex; gap: 1rem; }
        .btn-secondary { background: white; border: 1px solid var(--glass-border); padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; color: var(--color-text); }
        .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
        .info-card { padding: 2rem; }
        .badge-orange { background: hsla(30, 90%, 60%, 0.1); color: #e67e22; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
      `}</style>
        </div>
    );
};

export default ProspectDetail;
