import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, Camera, Upload, CheckCircle, Clock, AlertTriangle, User, MessageSquare, Save, Edit, Trash2, X
} from 'lucide-react';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

const ClaimDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [isEditing, setIsEditing] = useState(isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        client: '',
        contractNumber: '',
        type: 'Auto', // Auto, Habitation, RC Pro
        category: '',
        date: new Date().toISOString().split('T')[0],
        status: 'En cours',
        amount: '',
        description: '',
        location: '',
        franchise: 0,
        claimNumber: '',
        images: [] // Array of {url, name}
    });

    useEffect(() => {
        if (!isNew && id) {
            const fetchClaim = async () => {
                try {
                    const docRef = doc(db, "claims", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({ ...data, images: data.images || [] });
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error getting document:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchClaim();
        }
    }, [id, isNew]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Create a reference to 'claims/{claimId}/{fileName}'
            const storagePath = `claims/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), { url: downloadURL, name: file.name }]
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Erreur lors de l'upload de l'image.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: new Date()
            };

            if (isNew) {
                if (!dataToSave.claimNumber) {
                    dataToSave.claimNumber = `SIN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
                }
                dataToSave.createdAt = new Date();
                const docRef = await addDoc(collection(db, "claims"), dataToSave);
                navigate(`/claims/${docRef.id}`);
            } else {
                await updateDoc(doc(db, "claims", id), dataToSave);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error saving claim:", error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    // Placeholder steps logic based on status
    const getSteps = (status) => {
        const steps = [
            { label: 'Déclaration', status: 'completed' },
            { label: 'Instruction', status: ['En cours', 'Expertise', 'Indemnisation', 'Clôturé'].includes(status) ? 'completed' : 'pending' },
            { label: 'Expertise', status: ['Expertise', 'Indemnisation', 'Clôturé'].includes(status) ? 'completed' : (status === 'Expertise' ? 'current' : 'pending') },
            { label: 'Indemnisation', status: ['Indemnisation', 'Clôturé', 'Remboursé'].includes(status) ? 'completed' : (status === 'Indemnisation' ? 'current' : 'pending') },
            { label: 'Clôture', status: status === 'Clôturé' ? 'completed' : 'pending' },
        ];
        return steps;
    };

    const steps = getSteps(formData.status);

    if (loading) return <div className="p-4 text-center">Chargement...</div>;

    if (isEditing) {
        return (
            <div className="page-container">
                <button className="back-btn" onClick={() => isNew ? navigate('/claims') : setIsEditing(false)}>
                    <ArrowLeft size={18} /> Retour
                </button>

                <div className="glass-panel form-container">
                    <div className="form-header">
                        <h1>{isNew ? 'Déclarer un Sinistre' : `Éditer Dossier ${formData.claimNumber}`}</h1>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>

                    <div className="form-content">
                        {/* ... Existing Fields ... */}
                        <div className="form-group">
                            <label>Client</label>
                            <input type="text" name="client" value={formData.client} onChange={handleChange} className="form-input" placeholder="Nom du Client" />
                        </div>
                        <div className="form-group">
                            <label>Contrat Concerné</label>
                            <input type="text" name="contractNumber" value={formData.contractNumber} onChange={handleChange} className="form-input" placeholder="Numéro de contrat" />
                        </div>

                        <div className="form-group">
                            <label>Type de Sinistre</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                                <option>Auto</option>
                                <option>Habitation</option>
                                <option>RC Pro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Catégorie / Cause</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="form-input" placeholder="Ex: Accident, Vol..." />
                        </div>

                        <div className="form-group">
                            <label>Date du Sinistre</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label>Lieu</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="Adresse ou Ville" />
                        </div>

                        <div className="form-group">
                            <label>Statut</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                                <option>En cours</option>
                                <option>Expertise</option>
                                <option>Indemnisation</option>
                                <option>Clôturé</option>
                                <option>Remboursé</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Montant Estimé (FCFA)</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label>Franchise (FCFA)</label>
                            <input type="number" name="franchise" value={formData.franchise} onChange={handleChange} className="form-input" />
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows="4"></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label>Photos & Documents (JPG, PNG)</label>
                            <div className="photos-grid">
                                {(formData.images || []).map((img, index) => (
                                    <div key={index} className="photo-preview">
                                        <img src={img.url} alt={img.name} />
                                        <button className="delete-btn" onClick={() => handleRemoveImage(index)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label className="upload-btn">
                                    {uploading ? <Clock size={24} className="spin" /> : <Upload size={24} />}
                                    <span>{uploading ? '...' : 'Ajouter'}</span>
                                    <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                                </label>
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
                    .form-group.full-width { grid-column: span 2; }
                    .form-group label { font-size: 0.9rem; font-weight: 500; color: var(--color-text-muted); }
                    .form-input { padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; font-family: var(--font-sans); }
                    .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                    
                    .photos-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
                    .photo-preview { width: 100px; height: 100px; position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #ddd; }
                    .photo-preview img { width: 100%; height: 100%; object-fit: cover; }
                    .delete-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                    .upload-btn { width: 100px; height: 100px; border: 2px dashed var(--color-primary); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--color-primary); cursor: pointer; background: hsla(220, 70%, 50%, 0.05); }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page-container">
            <button className="back-btn" onClick={() => navigate('/claims')}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="claim-header glass-panel">
                <div className="header-info">
                    <div className="badge-row">
                        <span className="badge">{formData.type}</span>
                        <span className="badge">{formData.category}</span>
                    </div>
                    <h1>Dossier {formData.claimNumber || id}</h1>
                    <p className="subtitle">Client : {formData.client || 'Inconnu'} • Contrat {formData.contractNumber || 'N/A'}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setIsEditing(true)}><Edit size={16} /> Modifier</button>
                    <button className="btn-secondary"><MessageSquare size={16} /> Contacter Client</button>
                </div>
            </div>

            <div className="progress-section glass-panel">
                {/* ... Steps ... */}
                <div className="steps-container">
                    {steps.map((step, index) => (
                        <div key={index} className={`step-item ${step.status}`}>
                            <div className="step-circle">
                                {step.status === 'completed' ? <CheckCircle size={16} /> : (index + 1)}
                            </div>
                            <div className="step-label">{step.label}</div>
                            {index < steps.length - 1 && <div className="step-line"></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="content-layout">
                <div className="main-area">
                    <div className="glass-panel section">
                        <h3>Description du Sinistre</h3>
                        <p className="description-text">
                            {formData.description || "Aucune description fournie."}
                        </p>
                        <div className="meta-info">
                            <div className="meta-item"><strong>Lieu :</strong> {formData.location || '-'}</div>
                            <div className="meta-item"><strong>Date :</strong> {formData.date}</div>
                        </div>
                    </div>

                    <div className="glass-panel section">
                        <h3><Camera size={18} /> Photos & Documents</h3>
                        {(formData.images || []).length === 0 ? (
                            <div className="empty-photos">Aucun document joint.</div>
                        ) : (
                            <div className="photos-grid">
                                {(formData.images || []).map((img, index) => (
                                    <a key={index} href={img.url} target="_blank" rel="noopener noreferrer" className="photo-view">
                                        <img src={img.url} alt={img.name} />
                                    </a>
                                ))}
                            </div>
                        )}
                        <br />
                        <button className="btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
                            <Upload size={14} /> Ajouter des photos
                        </button>
                    </div>
                </div>

                <div className="side-area">
                    {/* ... Side Panel ... */}
                    <div className="glass-panel section">
                        <h3>Intervenants</h3>
                        <p className="small-text">Aucun intervenant assigné pour le moment.</p>
                    </div>

                    <div className="glass-panel section warning-box">
                        <h3><AlertTriangle size={18} /> Franchise</h3>
                        <div className="franchise-val">{formData.franchise || 0} FCFA</div>
                        <p className="small-text">À déduire de l'indemnisation finale.</p>
                        {formData.amount && (
                            <div style={{ marginTop: '1rem' }}>
                                <strong>Est. Dommages:</strong> {formData.amount} FCFA
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .page-container { padding: 1rem 2rem; }
        .back-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--color-text-muted); }
        
        .claim-header { padding: 2rem; display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem; }
        .badge-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .badge { background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
        .claim-header h1 { margin-bottom: 0.25rem; font-size: 1.8rem; }
        
        .btn-secondary { background: white; border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 8px; display: flex; gap: 0.5rem; align-items: center; cursor: pointer; color: var(--color-text); }
        .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; alignItems: center; gap: 0.5rem; }
        .header-actions { display: flex; gap: 0.75rem; }

        .progress-section { padding: 2rem; margin-bottom: 1.5rem; }
        .steps-container { display: flex; justify-content: space-between; position: relative; }
        .step-item { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; z-index: 1; }
        
        .step-circle { width: 32px; height: 32px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #999; margin-bottom: 0.5rem; border: 2px solid #ddd; transition: all 0.3s; }
        .step-line { position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; background: #eee; z-index: -1; }
        
        .step-item.completed .step-circle { background: var(--color-success); border-color: var(--color-success); color: white; }
        .step-item.completed .step-line { background: var(--color-success); }
        
        .step-item.current .step-circle { background: var(--color-primary); border-color: var(--color-primary); color: white; box-shadow: 0 0 0 4px rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.2); }
        
        .step-label { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; }

        .content-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        .section { padding: 1.5rem; margin-bottom: 1.5rem; }
        .section h3 { margin-bottom: 1rem; color: var(--color-primary); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.5rem; }
        
        .description-text { line-height: 1.6; color: var(--color-text); margin-bottom: 1.5rem; }
        .meta-info { display: flex; gap: 2rem; background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 8px; }
        
        .photos-grid { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .photo-view { width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd; display: block; }
        .photo-view img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
        .photo-view:hover img { transform: scale(1.05); }
        .empty-photos { color: var(--color-text-muted); font-style: italic; }
        .btn-sm { font-size: 0.8rem; padding: 0.4rem 0.8rem; }

        .warning-box { border-left: 4px solid orange; }
        .franchise-val { font-size: 2rem; font-weight: 700; color: var(--color-text); margin: 0.5rem 0; }
        .small-text { font-size: 0.8rem; color: var(--color-text-muted); }
      `}</style>
        </div>
    );
};

export default ClaimDetail;
