import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash, Box, Upload, X, Plus, QrCode, Download } from 'lucide-react';
import { doc, getDoc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [statusText, setStatusText] = useState('Enregistrement...'); // NEW: To track progress
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'custom', 'qr'

    // Custom field creation state
    const [newField, setNewField] = useState({ name: '', type: 'text' });

    // Risk Templates based on Category
    const RISK_TEMPLATES = {
        'Assurance Auto': [
            { name: 'Immatriculation', type: 'text', value: '' },
            { name: 'Marque', type: 'text', value: '' },
            { name: 'Modèle', type: 'text', value: '' },
            { name: 'Puissance (CV)', type: 'number', value: '' },
            { name: 'Usage', type: 'text', value: 'Promenade/Trajet' }
        ],
        'Assurance Habitation': [
            { name: 'Type Habitation', type: 'text', value: 'Appartement' }, // Maison/Appart
            { name: 'Adresse du Risque', type: 'text', value: '' },
            { name: 'Code Postal', type: 'text', value: '' },
            { name: 'Surface (m²)', type: 'number', value: '' },
            { name: 'Nombre de Pièces', type: 'number', value: '' }
        ],
        'Santé / Prévoyance': [
            { name: 'Date de Naissance', type: 'date', value: '' },
            { name: 'Statut Matrimonial', type: 'text', value: '' },
            { name: 'Nombre d\'enfants', type: 'number', value: '' }
        ]
    };

    const [formData, setFormData] = useState({
        name: '',
        category: 'Assurance Auto',
        code: '',
        premium_base: '',
        commission: '15', // Default 15%
        description: '',
        active: true,
        imageUrl: '',
        customFields: [...RISK_TEMPLATES['Assurance Auto']] // Default Init
    });

    useEffect(() => {
        if (!isNew && id) {
            const fetchProduct = async () => {
                try {
                    const docRef = doc(db, "products", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            ...data,
                            customFields: data.customFields || []
                        });
                        if (data.imageUrl) setImagePreview(data.imageUrl);
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error getting document:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isNew]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-apply template if category changes
            if (name === 'category') {
                const template = RISK_TEMPLATES[value];
                if (template) {
                    // Start fresh with new template (or ask confirmation in a real app)
                    // Here we replace to ensure strict compliance with category
                    newData.customFields = [...template];
                } else {
                    newData.customFields = [];
                }
            }

            return newData;
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addCustomField = () => {
        if (newField.name.trim() === '') return;
        setFormData(prev => ({
            ...prev,
            customFields: [...prev.customFields, { ...newField, value: '' }]
        }));
        setNewField({ name: '', type: 'text' });
    };

    const removeCustomField = (index) => {
        setFormData(prev => ({
            ...prev,
            customFields: prev.customFields.filter((_, i) => i !== index)
        }));
    };

    const handleCustomFieldChange = (index, value) => {
        const updatedFields = [...formData.customFields];
        updatedFields[index].value = value;
        setFormData(prev => ({ ...prev, customFields: updatedFields }));
    };

    // Helper: Compress Image using Canvas
    const compressImage = async (file) => {
        return new Promise((resolve, reject) => {
            const maxWidth = 800; // Resize to max 800px width
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) return reject(new Error("Compression failed"));
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7); // 70% Quality
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };



    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
            return;
        }

        setSaving(true);
        setStatusText("Suppression...");

        try {
            await deleteDoc(doc(db, "products", id));
            navigate('/products');
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Erreur lors de la suppression : " + error.message);
            setSaving(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Manual Validation
        if (!formData.name || formData.name.trim() === '') {
            alert("Veuillez renseigner le nom du produit.");
            setActiveTab('general');
            return;
        }

        setSaving(true);
        setStatusText("Préparation...");

        try {
            let imageUrl = formData.imageUrl || '';

            // Upload image if selected
            if (imageFile) {
                setStatusText("Envoi Image..."); // Update status
                try {
                    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);

                    // Add 15s Timeout for upload
                    const uploadPromise = uploadBytes(storageRef, imageFile);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Upload Image")), 15000));

                    const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
                    imageUrl = await getDownloadURL(snapshot.ref);
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);

                    // FALLBACK: Base64 for small images
                    if (imageFile.size < 800000) { // Limit to ~800KB for Firestore
                        const useBase64 = window.confirm(`L'upload vers le serveur de fichiers a échoué. \n\nVoulez-vous intégrer l'image directement dans le produit (Mode Secours) ?`);
                        if (useBase64) {
                            try {
                                imageUrl = await new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve(reader.result);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(imageFile);
                                });
                            } catch (b64Error) {
                                console.error("Base64 conversion failed", b64Error);
                            }
                        } else {
                            if (!window.confirm("Continuer sans image ?")) {
                                setSaving(false);
                                return;
                            }
                        }
                    } else {
                        alert("L'upload a échoué et l'image est trop volumineuse pour être sauvegardée en interne (>800ko). Réessayez avec une image plus petite.");
                        if (!window.confirm("Continuer sans image ?")) {
                            setSaving(false);
                            return;
                        }
                    }
                }
            }

            setStatusText("Sauvegarde..."); // Update status

            // Helper to clean numbers
            const parseMoney = (val) => {
                if (!val) return 0;
                const cleanStr = val.toString().replace(/\s/g, '').replace(',', '.');
                const num = parseFloat(cleanStr);
                return isNaN(num) ? 0 : num;
            };

            // Helper to recursively remove undefined values (Firestore rejects them)
            const sanitizePayload = (obj) => {
                return JSON.parse(JSON.stringify(obj, (key, value) => {
                    return value === undefined ? null : value;
                }));
            };

            const rawData = {
                ...formData,
                premium_base: parseMoney(formData.premium_base),
                imageUrl: imageUrl || '',
                updatedAt: new Date().toISOString() // Use ISO string to be safe, though Date is supported
            };

            // Remove any potential undefineds
            const dataToSave = sanitizePayload(rawData);

            // LOG FOR DEBUGGING
            console.log("Attempting to save product:", dataToSave);

            if (isNew) {
                dataToSave.createdAt = new Date().toISOString();
                await addDoc(collection(db, "products"), dataToSave);
            } else {
                await updateDoc(doc(db, "products", id), dataToSave);
            }
            navigate('/products');
        } catch (error) {
            console.error("Error saving document: ", error);
            // Show detailed error to user
            alert(`ÉCHEC ENREGISTREMENT.\n\nErreur: ${error.message}\n\nCode: ${error.code || 'N/A'}\n\nConsultez la console (F12) pour voir les données envoyées.`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Chargement...</div>;

    return (
        <div className="page-container">
            <button className="back-btn" onClick={() => navigate('/products')}>
                <ArrowLeft size={18} /> Retour
            </button>

            <form onSubmit={handleSave}>
                <div className="page-header">
                    <div className="header-title">
                        <div className="icon-box">
                            {imagePreview ? (
                                <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                            ) : (
                                <Box size={24} />
                            )}
                        </div>
                        <h1>{isNew ? 'Nouveau Produit' : `Édition : ${formData.name}`}</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {!isNew && (
                            <button type="button" className="btn-danger-outline" onClick={handleDelete} disabled={saving}>
                                <Trash size={18} />
                                Supprimer
                            </button>
                        )}
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <Save size={18} />
                            {saving ? statusText : 'Enregistrer'}
                        </button>
                    </div>
                </div>

                <div className="content-grid">
                    <div className="main-col">
                        <div className="glass-panel form-section">
                            <div className="tabs-header">
                                <button
                                    type="button"
                                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('general')}
                                >
                                    Informations
                                </button>
                                <button
                                    type="button"
                                    className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('custom')}
                                >
                                    Champs
                                </button>
                                <button
                                    type="button"
                                    className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('qr')}
                                >
                                    QR Code
                                </button>
                            </div>

                            {activeTab === 'general' && (
                                <div className="form-grid">
                                    <div className="form-group span-2">
                                        <label>Nom du Produit</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Ex: Assurance Auto Tous Risques"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Code Produit (Ref)</label>
                                        <input
                                            type="text"
                                            name="code"
                                            className="form-input"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="PROD-001"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Catégorie</label>
                                        <select
                                            name="category"
                                            className="form-input"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            <option>Assurance Auto</option>
                                            <option>Assurance Habitation</option>
                                            <option>Responsabilité Civile</option>
                                            <option>Santé / Prévoyance</option>
                                            <option>Autre</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Prime Mensuelle (FCFA)</label>
                                        <input
                                            type="number"
                                            name="premium_base"
                                            className="form-input"
                                            value={formData.premium_base}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Commission Distributeur (%)</label>
                                        <input
                                            type="number"
                                            name="commission"
                                            className="form-input"
                                            value={formData.commission}
                                            onChange={handleChange}
                                            placeholder="15"
                                            min="0"
                                            max="100"
                                        />
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="active"
                                                checked={formData.active}
                                                onChange={handleChange}
                                            />
                                            Produit Actif (Disponible à la vente)
                                        </label>
                                    </div>

                                    <div className="form-group span-2">
                                        <label>Description & Garanties</label>
                                        <textarea
                                            name="description"
                                            className="form-input"
                                            rows="4"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Détails des garanties..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'custom' && (
                                <div className="custom-fields-section">
                                    <p className="section-desc">Ajoutez des champs dynamiques spécifiques à ce produit.</p>

                                    <div className="custom-fields-list">
                                        {formData.customFields.map((field, idx) => (
                                            <div key={idx} className="custom-field-row">
                                                <div className="field-info">
                                                    <span className="field-label">{field.name}</span>
                                                    <span className="field-type-badge">{field.type}</span>
                                                </div>
                                                <div className="field-input-area">
                                                    {field.type === 'boolean' ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value === true}
                                                            onChange={(e) => handleCustomFieldChange(idx, e.target.checked)}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                                            className="form-input sm"
                                                            value={field.value}
                                                            onChange={(e) => handleCustomFieldChange(idx, e.target.value)}
                                                            placeholder="Valeur par défaut..."
                                                        />
                                                    )}
                                                </div>
                                                <button type="button" className="btn-icon danger" onClick={() => removeCustomField(idx)}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="add-field-area">
                                        <input
                                            type="text"
                                            placeholder="Nom du champ"
                                            className="form-input"
                                            value={newField.name}
                                            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                        />
                                        <select
                                            className="form-input"
                                            value={newField.type}
                                            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                                        >
                                            <option value="text">Texte</option>
                                            <option value="number">Nombre</option>
                                            <option value="date">Date</option>
                                            <option value="boolean">Case à cocher</option>
                                        </select>
                                        <button type="button" className="btn-secondary" onClick={addCustomField}>
                                            <Plus size={16} /> Ajouter
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'qr' && (
                                <div className="qr-section">
                                    <div className="qr-display">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://simas-app.com/subscribe?product=${id}`}
                                            alt="QR Code Souscription"
                                        />
                                        <p className="qr-caption">Scannez pour souscrire directement à {formData.name}</p>
                                    </div>
                                    <div className="qr-actions">
                                        <div className="link-box">
                                            <input readOnly value={`https://simas-app.com/subscribe?product=${id}`} />
                                        </div>
                                        <button type="button" className="btn-secondary" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://simas-app.com/subscribe?product=${id}`, '_blank')}>
                                            <Download size={16} /> Télécharger
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="side-col">
                        <div className="glass-panel form-section">
                            <h3>Image du Produit</h3>
                            <div className="image-upload-area">
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button type="button" className="remove-img-btn" onClick={() => { setImagePreview(null); setImageFile(null); setFormData({ ...formData, imageUrl: '' }) }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder" onClick={() => document.getElementById('file-upload').click()}>
                                        <Upload size={32} />
                                        <span>Ajouter une image</span>
                                    </div>
                                )}
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden-input"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <p className="help-text">JPG, PNG max 2Mo</p>
                        </div>
                    </div>
                </div>
            </form >

            <style>{`
                .page-container { padding: 1rem 2rem; max-width: 1200px; margin: 0 auto; }
                .back-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--color-text-muted); }
                
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .header-title { display: flex; align-items: center; gap: 1rem; }
                .icon-box { width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                
                .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                .form-section { padding: 1.5rem; margin-bottom: 1.5rem; }
                .form-section h3 { margin-bottom: 1.5rem; color: var(--color-primary); font-size: 1.1rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.5rem; }
                .section-desc { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1rem; margin-top: -0.5rem; }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .span-2 { grid-column: span 2; }
                
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
                .form-input { width: 100%; padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; font-family: var(--font-sans); background: rgba(255,255,255,0.5); }
                .form-input:focus { outline: none; border-color: var(--color-primary); background: white; }
                .form-input.sm { padding: 0.5rem; font-size: 0.9rem; }
                
                .checkbox-group { display: flex; align-items: center; height: 100%; }
                .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin: 0; }
                input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--color-primary); }
                
                /* Custom Fields */
                .custom-fields-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
                .custom-field-row { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.5); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--glass-border); }
                .field-info { flex: 1; display: flex; flex-direction: column; }
                .field-label { font-weight: 600; font-size: 0.95rem; }
                .field-type-badge { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; }
                .field-input-area { flex: 2; }
                .btn-icon.danger { color: var(--color-danger); cursor: pointer; border: none; background: none; }
                .btn-icon:hover { background: rgba(0,0,0,0.05); border-radius: 4px; }

                .add-field-area { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.02); padding: 1rem; border-radius: 8px; align-items: center; }
                .btn-secondary { background: white; border: 1px solid var(--glass-border); color: var(--color-text); padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; display: flex; gap: 0.5rem; align-items: center; white-space: nowrap; font-weight: 500; }
                .btn-secondary:hover { background: rgba(255,255,255,0.8); }
                
                .btn-danger-outline { background: white; border: 1px solid var(--color-danger); color: var(--color-danger); padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
                .btn-danger-outline:hover { background: #fee2e2; }

                /* Image Upload */
                .image-upload-area { width: 100%; aspect-ratio: 16/9; border: 2px dashed var(--glass-border); border-radius: 12px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.3); transition: all 0.2s; }
                .image-upload-area:hover { border-color: var(--color-primary); background: rgba(255,255,255,0.5); }
                .upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--color-text-muted); cursor: pointer; width: 100%; height: 100%; justify-content: center; }
                .hidden-input { display: none; }
                .image-preview { width: 100%; height: 100%; position: relative; }
                .image-preview img { width: 100%; height: 100%; object-fit: cover; }
                .remove-img-btn { position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.6); color: white; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .help-text { font-size: 0.8rem; color: var(--color-text-muted); text-align: center; margin-top: 0.5rem; }

                .tabs-header { display: flex; gap: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 1.5rem; padding-bottom: 0.5rem; }
                .tab-btn { background: none; border: none; font-size: 0.95rem; font-weight: 500; color: var(--color-text-muted); cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s; }
                .tab-btn.active { background: var(--color-primary); color: white; }
                .tab-btn:hover:not(.active) { background: rgba(0,0,0,0.02); }
                
                .qr-section { display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 1rem; text-align: center; }
                .qr-display img { border: 8px solid white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .qr-caption { margin-top: 1rem; color: var(--color-text-muted); font-size: 0.9rem; }
                .qr-actions { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 300px; }
                .link-box input { width: 100%; padding: 0.5rem; border: 1px solid var(--glass-border); border-radius: 6px; font-size: 0.8rem; background: rgba(0,0,0,0.02); text-align: center; }

                .p-4 { padding: 1rem; }
            `}</style>
        </div >
    );
};

export default ProductDetail;
