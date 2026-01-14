import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { Shield, CheckCircle, ArrowLeft } from 'lucide-react';

const SubscriptionPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Recap, 2: Simas, 3: Validation
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'products', productId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("Product not found");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchProduct();
    }, [productId]);

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            // Create a 'contract' or 'quote' request
            // For now, let's create a Contract directly for simplicity of the demo flow
            await addDoc(collection(db, 'contracts'), {
                clientId: user.clientId || user.uid,
                clientName: `${user.firstName} ${user.lastName}`,
                productId: product.id,
                productName: product.name,
                status: 'pending_payment', // or active
                startDate: serverTimestamp(),
                amount: product.price || 15000,
                createdAt: serverTimestamp()
            });

            // Redirect to success or contracts list
            // navigate('/client/contracts');
            // Or show success message here
            setStep(4); // Success Step
        } catch (error) {
            console.error("Subscription failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Chargement...</div>;
    if (!product) return <div className="p-12 text-center">Produit introuvable.</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary">
                <ArrowLeft size={16} className="mr-2" /> Retour
            </button>

            {/* Stepper Status (Simple) */}
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400 mb-8">
                <span className={step >= 1 ? "text-primary" : ""}>1. Offre</span>
                <span>&gt;</span>
                <span className={step >= 2 ? "text-primary" : ""}>2. Informations</span>
                <span>&gt;</span>
                <span className={step >= 3 ? "text-primary" : ""}>3. Validation</span>
            </div>

            {step === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-display text-slate-900">{product.name}</h1>
                            <p className="text-slate-500">Souscription 100% en ligne</p>
                        </div>
                    </div>

                    <div className="prose prose-slate mb-8">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p>{product.description}</p>

                        <h3 className="text-lg font-semibold mt-6 mb-2">Ce qui est inclus</h3>
                        <ul className="space-y-2 list-none pl-0">
                            {[1, 2, 3].map((_, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-600">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Garantie premium incluse</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={() => setStep(2)} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                            Continuer
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h2 className="text-xl font-bold mb-6">Vos informations</h2>
                    <div className="bg-slate-50 p-6 rounded-xl space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Prénom</label>
                                <p className="font-medium">{user.firstName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Nom</label>
                                <p className="font-medium">{user.lastName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Téléphone</label>
                                <p className="font-medium">{user.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for dynamic risk form */}
                    <div className="mb-8">
                        <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded" />
                            <span className="text-sm">Je certifie l'exactitude des informations fournies.</span>
                        </label>
                    </div>

                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="text-slate-500 font-medium hover:text-slate-800">
                            Retour
                        </button>
                        <button onClick={() => setStep(3)} className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                            Continuer vers la validation
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Récapitulatif</h2>
                    <p className="text-slate-600 mb-8">Vous êtes sur le point de souscrire à l'assurance <strong>{product.name}</strong>.</p>

                    <div className="bg-blue-50 p-6 rounded-xl mb-8 inline-block text-left w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-600">Produit</span>
                            <span className="font-bold">{product.name}</span>
                        </div>
                        <div className="border-t border-blue-200 my-2"></div>
                        <div className="flex justify-between items-center text-lg text-primary font-bold">
                            <span>Total</span>
                            <span>{product.price || 15000} FCFA</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button onClick={() => setStep(2)} className="text-slate-500 font-medium hover:text-slate-800">
                            Modifier
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                        >
                            {submitting ? 'Traitement...' : 'Confirmer et Payer'}
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Félicitations !</h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Votre demande de souscription a été enregistrée avec succès.<br />
                        Vous recevrez bientôt votre contrat par email.
                    </p>
                    <button
                        onClick={() => navigate('/client')}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                    >
                        Accéder à mon espace client
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
