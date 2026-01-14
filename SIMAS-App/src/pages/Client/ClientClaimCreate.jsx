import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, Upload, X, Image as ImageIcon } from 'lucide-react';

const ClientClaimCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        contractId: '',
        incidentType: '',
        incidentDate: '',
        incidentTime: '',
        location: '',
        description: ''
    });

    // Fetch Active Contracts
    useEffect(() => {
        const fetchContracts = async () => {
            if (!user?.uid) return;
            try {
                // Only active contracts can start a claim
                const q = query(
                    collection(db, 'contracts'),
                    where('clientId', '==', user.uid),
                    where('status', 'in', ['Actif', 'active', 'Active'])
                );
                const snapshot = await getDocs(q);
                const fetchedContracts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setContracts(fetchedContracts);
            } catch (err) {
                console.error("Error fetching contracts:", err);
                setError("Impossible de charger vos contrats. Veuillez réessayer.");
            }
        };
        fetchContracts();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.contractId) {
            setError("Veuillez sélectionner un contrat concerné.");
            setLoading(false);
            return;
        }

        try {
            // Find selected contract details
            const selectedContract = contracts.find(c => c.id === formData.contractId);

            // Upload Images
            const imageUrls = [];
            if (images.length > 0) {
                for (const image of images) {
                    const storageRef = ref(storage, `claims_evidence/${user.uid}/${Date.now()}_${image.name}`);
                    const snapshot = await uploadBytes(storageRef, image);
                    const url = await getDownloadURL(snapshot.ref);
                    imageUrls.push({
                        name: image.name,
                        url: url,
                        type: image.type
                    });
                }
            }

            const claimData = {
                clientId: user.uid,
                contractId: formData.contractId,
                policyNumber: selectedContract?.policyNumber || 'UNKNOWN',
                contractCategory: selectedContract?.category || 'Unknown',

                incidentType: formData.incidentType,
                incidentDate: new Date(`${formData.incidentDate}T${formData.incidentTime || '00:00'}`).toISOString(),
                location: formData.location,
                description: formData.description,
                attachments: imageUrls,

                status: 'Ouvert',
                claimNumber: `CLM-${Date.now().toString().slice(-6)}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'claims'), claimData);

            navigate('/client/claims');

        } catch (err) {
            console.error("Error submitting claim:", err);
            setError("Une erreur est survenue lors de l'envoi de la déclaration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <header className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/client/claims')}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-800">Déclarer un sinistre</h1>
                    <p className="text-slate-500">Remplissez ce formulaire pour initier votre dossier.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contract Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Contrat concerné</label>
                        <select
                            name="contractId"
                            value={formData.contractId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50"
                        >
                            <option value="">Sélectionnez un contrat...</option>
                            {contracts.map(contract => (
                                <option key={contract.id} value={contract.id}>
                                    {contract.category} - Police N° {contract.policyNumber}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Seuls les contrats actifs apparaissent ici.</p>
                    </div>

                    {/* Incident Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Type d'incident</label>
                            <input
                                type="text"
                                name="incidentType"
                                value={formData.incidentType}
                                onChange={handleChange}
                                placeholder="Ex: Accident, Incendie, Vol..."
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lieu</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ville, Quartier, Rue..."
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                            <input
                                type="date"
                                name="incidentDate"
                                value={formData.incidentDate}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Heure (Approximative)</label>
                            <input
                                type="time"
                                name="incidentTime"
                                value={formData.incidentTime}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description détaillée</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Décrivez les circonstances de l'incident..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                        ></textarea>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Photos et Documents (Preuves)</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept="image/*,.pdf"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Upload size={24} />
                                </div>
                                <span className="text-primary font-medium">Cliquez pour ajouter des fichiers</span>
                                <span className="text-xs text-slate-400">Images (JPG, PNG) ou PDF. Max 5MB par fichier.</span>
                            </label>
                        </div>

                        {/* Selected Images Preview */}
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((file, index) => (
                                    <div key={index} className="relative group bg-slate-50 rounded-lg p-2 border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors z-10"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="h-20 w-full flex items-center justify-center overflow-hidden rounded-md bg-white mb-2">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon size={32} className="text-slate-300" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/client/claims')}
                            className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Envoi en cours...' : (
                                <>
                                    <Save size={20} />
                                    Soumettre la déclaration
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientClaimCreate;
