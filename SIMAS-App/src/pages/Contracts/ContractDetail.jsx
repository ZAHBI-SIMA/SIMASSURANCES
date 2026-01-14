import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, User, Calendar, Shield, CreditCard, Download, Printer, Save, Edit
} from 'lucide-react';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase';

const ContractDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);

    // Default form data
    const [formData, setFormData] = useState({
        contractNumber: '',
        client: '',
        type: 'Auto',
        status: 'En attente',
        date: new Date().toISOString().split('T')[0],
        endDate: '',
        premium: 0,
        paymentFrequency: 'Mensuel',
        address: '',
    });

    useEffect(() => {
        if (!isNew && id) {
            const fetchContract = async () => {
                try {
                    const docRef = doc(db, "contracts", id);
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
            fetchContract();
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
                // Generate a pseudo contract number if not provided
                if (!dataToSave.contractNumber) {
                    dataToSave.contractNumber = `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
                }
                dataToSave.createdAt = new Date();
                const docRef = await addDoc(collection(db, "contracts"), dataToSave);
                navigate(`/contracts/${docRef.id}`);
            } else {
                await updateDoc(doc(db, "contracts", id), dataToSave);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error saving contract:", error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Chargement...</div>;

    if (isEditing) {
        return (
            <div className="page-container">
                <button className="back-btn" onClick={() => isNew ? navigate('/contracts') : setIsEditing(false)}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <div className="glass-panel form-container">
                    <div className="form-header">
                        <h1>{isNew ? 'Nouveau Contrat' : `Éditer Contrat ${formData.contractNumber || ''}`}</h1>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>

                    <div className="form-content">
                        <div className="form-group">
                            <label>Client</label>
                            <input
                                type="text"
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Nom du Client"
                            />
                        </div>

                        <div className="form-group">
                            <label>Numéro de Contrat (Auto si vide)</label>
                            <input
                                type="text"
                                name="contractNumber"
                                value={formData.contractNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="CTR-XXXX-XXXX"
                            />
                        </div>

                        <div className="form-group">
                            <label>Type de Produit</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                                <option>Auto</option>
                                <option>Habitation</option>
                                <option>Santé</option>
                                <option>Multirisque Pro</option>
                                <option>RC Pro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Statut</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                                <option>Actif</option>
                                <option>En attente</option>
                                <option>Résilié</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Date d'Effet</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Date d'Échéance</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Prime Annuelle (FCFA)</label>
                            <input
                                type="number"
                                name="premium"
                                value={formData.premium}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Fractionnement</label>
                            <select name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange} className="form-input">
                                <option>Mensuel</option>
                                <option>Trimestriel</option>
                                <option>Annuel</option>
                            </select>
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
                    .form-group label { font-size: 0.9rem; font-weight: 500; color: var(--color-text-muted); }
                    .form-input { padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; font-family: var(--font-sans); }
                    .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page-container">
            <button className="back-btn" onClick={() => navigate('/contracts')}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="contract-header glass-panel">
                <div className="header-left">
                    <div className="icon-box">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h1>Contrat {formData.contractNumber || id}</h1>
                        <div className="meta-row">
                            <span className="badge">{formData.type}</span>
                            <span className={`status-badge ${formData.status === 'Actif' ? 'active' : ''}`}>{formData.status}</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setIsEditing(true)}><Edit size={16} /> Modifier</button>
                    <button className="btn-secondary"><Printer size={16} /> Imprimer</button>
                    <button className="btn-primary"><Download size={16} /> Télécharger CP</button>
                </div>
            </div>

            <div className="content-grid">
                <div className="main-col">
                    <div className="glass-panel section-card">
                        <h3><User size={18} /> Assuré</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Nom</span>
                                <span className="value">{formData.client || 'Non renseigné'}</span>
                            </div>
                            {/* Typically would have more client details fetched */}
                        </div>
                    </div>

                    <div className="glass-panel section-card">
                        <h3><Shield size={18} /> Garanties</h3>
                        <table className="guarantees-table">
                            <thead>
                                <tr>
                                    <th>Garantie</th>
                                    <th>Franchise</th>
                                    <th>Plafond</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Static for now, could be dynamic based on type */}
                                <tr>
                                    <td>Responsabilité Civile</td>
                                    <td>0 FCFA</td>
                                    <td>Illimité</td>
                                    <td><CheckMark /></td>
                                </tr>
                                <tr>
                                    <td>Défense Pénale</td>
                                    <td>-</td>
                                    <td>20 000 FCFA</td>
                                    <td><CheckMark /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="side-col">
                    <div className="glass-panel section-card">
                        <h3><Calendar size={18} /> Dates Clés</h3>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="dot"></div>
                                <div className="content">
                                    <span className="date">{formData.date}</span>
                                    <span className="desc">Date d'effet</span>
                                </div>
                            </div>
                            {formData.endDate && (
                                <div className="timeline-item">
                                    <div className="dot"></div>
                                    <div className="content">
                                        <span className="date">{formData.endDate}</span>
                                        <span className="desc">Echéance</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel section-card">
                        <h3><CreditCard size={18} /> Prime & Paiement</h3>
                        <div className="price-box">
                            <span className="price-label">Prime TTC Annuelle</span>
                            <span className="price-val">{formData.premium} €</span>
                        </div>
                        <div className="payment-info">
                            <div className="info-row">
                                <span>Fractionnement</span>
                                <strong>{formData.paymentFrequency}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .back-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--color-text-muted); }
        
        .contract-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .header-left { display: flex; align-items: center; gap: 1rem; }
        .icon-box { width: 56px; height: 56px; background: hsla(220, 70%, 50%, 0.1); color: var(--color-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .header-left h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .meta-row { display: flex; gap: 0.5rem; }
        .badge { background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.8rem; }
        .status-badge.active { background: hsla(140, 70%, 40%, 0.1); color: var(--color-success); padding: 0.25rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.8rem; }
        
        .header-actions { display: flex; gap: 0.75rem; }
        .btn-secondary { background: white; border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 8px; display: flex; gap: 0.5rem; align-items: center; cursor: pointer; color: var(--color-text); }
        .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; display: flex; gap: 0.5rem; align-items: center; cursor: pointer; }

        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        
        .section-card { padding: 1.5rem; margin-bottom: 1.5rem; }
        .section-card h3 { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; font-size: 1.1rem; color: var(--color-primary); border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.75rem; }
        
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .label { font-size: 0.85rem; color: var(--color-text-muted); }
        .value { font-weight: 600; font-size: 1rem; }

        .guarantees-table { width: 100%; border-collapse: collapse; }
        .guarantees-table th { text-align: left; padding: 0.75rem; background: rgba(0,0,0,0.02); font-size: 0.8rem; color: var(--color-text-muted); }
        .guarantees-table td { padding: 0.75rem; border-bottom: 1px solid rgba(0,0,0,0.02); }

        .timeline { display: flex; flex-direction: column; gap: 1rem; padding-left: 0.5rem; }
        .timeline-item { display: flex; gap: 1rem; position: relative; }
        .timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 4px; top: 12px; bottom: -20px; width: 2px; background: rgba(0,0,0,0.05); }
        .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary); margin-top: 6px; flex-shrink: 0; }
        .content { display: flex; flex-direction: column; }
        .date { font-weight: 600; }
        .desc { font-size: 0.85rem; color: var(--color-text-muted); }

        .price-box { text-align: center; background: hsla(220, 70%, 50%, 0.03); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; }
        .price-label { display: block; font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0.5rem; }
        .price-val { font-size: 1.8rem; font-weight: 700; color: var(--color-primary); }
        
        .payment-info { display: flex; flex-direction: column; gap: 0.75rem; }
        .info-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
      `}</style>
        </div>
    );
};

const CheckMark = () => <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>;

export default ContractDetail;
