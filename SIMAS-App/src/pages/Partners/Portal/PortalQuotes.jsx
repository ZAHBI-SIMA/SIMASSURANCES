import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Clock, CheckCircle } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';

const PortalQuotes = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                // In real app, filter by current partner ID
                const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setQuotes(data);
            } catch (error) {
                console.error("Error fetching quotes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotes();
    }, []);

    const handleConvert = async (quote) => {
        if (!window.confirm("Transformer ce devis en contrat ferme ?")) return;

        try {
            // 1. Create Contract
            await addDoc(collection(db, "contracts"), {
                clientName: quote.clientName,
                vehicle: quote.vehicle,
                productName: quote.productName,
                premium: quote.premium,
                status: 'Actif', // French status consistency
                startDate: new Date().toISOString().split('T')[0],
                createdAt: serverTimestamp(),
                sourceQuoteId: quote.id,
                partnerId: user?.partnerId || null, // Link contract to partner
                partnerName: user?.partnerName || null
            });

            // 2. Update Quote Status
            await updateDoc(doc(db, "quotes", quote.id), {
                status: 'Converted',
                convertedAt: serverTimestamp()
            });

            // 3. Mock Payment & Commission Logic (Simplify for Demo)
            // (In real flow, payment might happen separately)

            // Refresh local state
            setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Converted' } : q));
            alert("Contrat créé avec succès !");

        } catch (error) {
            console.error("Error converting quote:", error);
            alert("Erreur lors de la conversion.");
        }
    };

    return (
        <div className="portal-container">
            <header className="page-header">
                <div>
                    <h1>Mes Devis</h1>
                    <p className="subtitle">Suivi de vos propositions commerciales</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/partner-portal/products')}>
                    <Plus size={18} /> Nouveau Devis
                </button>
            </header>

            <div className="glass-panel">
                {loading ? (
                    <div className="p-4 text-center text-muted">Chargement...</div>
                ) : quotes.length === 0 ? (
                    <div className="p-4 text-center text-muted">Aucun devis en cours.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Client</th>
                                <th>Produit</th>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(q => (
                                <tr key={q.id}>
                                    <td className="font-mono">
                                        {q.quoteNumber || ('D-' + q.id.substring(0, 4).toUpperCase())}
                                    </td>
                                    <td>{q.clientName}</td>
                                    <td>{q.productName}</td>
                                    <td>{q.createdAt ? new Date(q.createdAt.seconds * 1000).toLocaleDateString() : '-'}</td>
                                    <td className="font-bold">{q.premium} FCFA</td>
                                    <td>
                                        <span className={`badge ${q.status?.toLowerCase() || 'draft'}`}>
                                            {q.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        {q.status !== 'Converted' && (
                                            <button className="btn-action" onClick={() => handleConvert(q)}>
                                                <CheckCircle size={14} /> Convertir
                                            </button>
                                        )}
                                        {q.status === 'Converted' && <span className="text-muted text-sm">Converti</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .portal-container { padding: 1.5rem 2rem; max-width: 1200px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .page-header h1 { margin: 0 0 0.5rem 0; font-size: 1.8rem; color: var(--color-primary); }
                .subtitle { margin: 0; color: var(--color-text-muted); }
                
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; }
                
                .glass-panel { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #f3f4f6; }
                .data-table th { background: #f9fafb; font-weight: 600; color: #6b7280; font-size: 0.85rem; }
                
                .badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
                .badge.draft { background: #f3f4f6; color: #4b5563; }
                .badge.converted { background: #dcfce7; color: #166534; }
                
                .btn-action { background: #dcfce7; color: #166534; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
                .btn-action:hover { background: #bbf7d0; }
                
                .text-muted { color: var(--color-text-muted); }
                .text-sm { font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default PortalQuotes;
