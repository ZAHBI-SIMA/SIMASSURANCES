import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    FileText,
    Plus,
    Search,
    Filter,
    Calendar,
    Download,
    CheckCircle,
    Info,
    Smartphone
} from 'lucide-react';
import { collection, getDocs, addDoc, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const FinancePage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [transactions, setTransactions] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [processingInvoice, setProcessingInvoice] = useState(null);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch transactions
                const qTx = query(collection(db, "transactions"), orderBy("date", "desc"));
                const txSnapshot = await getDocs(qTx);
                setTransactions(txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Invoices (for commissions tab)
                const qInv = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
                const invSnapshot = await getDocs(qInv);
                setInvoices(invSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching finance data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newTx = {
            date: formData.get('date'),
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            method: formData.get('method'),
            description: formData.get('description'),
            contractNumber: formData.get('contractNumber'),
            status: 'Completed',
            createdAt: serverTimestamp()
        };

        try {
            const docRef = await addDoc(collection(db, "transactions"), newTx);
            setTransactions(prev => [{ id: docRef.id, ...newTx }, ...prev]);
            setShowModal(false);
        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Erreur lors de l'ajout.");
        }
    };

    const handleValidateInvoice = async (invoice) => {
        if (!window.confirm(`Valider le paiement de ${invoice.amount}FCFA pour ${invoice.partnerName} ?`)) return;

        setProcessingInvoice(invoice.id);
        try {
            const paymentDate = new Date().toISOString().split('T')[0];

            // 1. Create Payment Record (Visible to Partner)
            await addDoc(collection(db, "payments"), {
                partnerId: invoice.partnerId,
                amount: invoice.amount,
                date: paymentDate,
                method: 'Virement',
                status: 'completed',
                invoiceId: invoice.id,
                createdAt: serverTimestamp()
            });

            // 2. Update Invoice Status
            await updateDoc(doc(db, "invoices", invoice.id), {
                status: 'paid',
                paidAt: serverTimestamp()
            });

            // 3. Log Financial Transaction (Output)
            const newTx = {
                date: paymentDate,
                amount: -parseFloat(invoice.amount), // Negative for expense
                type: 'Commission',
                method: 'Virement',
                description: `Paiement Com. Facture ${invoice.number} - ${invoice.partnerName}`,
                status: 'Completed',
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "transactions"), newTx);

            // Update local state
            setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: 'paid' } : inv));
            setTransactions(prev => [newTx, ...prev]);

        } catch (error) {
            console.error("Error validating invoice:", error);
            alert("Erreur lors de la validation du paiement.");
        } finally {
            setProcessingInvoice(null);
        }
    };

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.type === 'Premium' ? Number(t.amount) : 0), 0);
    // Calculated from real pending invoices
    const pendingCommissions = invoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + Number(i.amount), 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Finance & Comptabilité</h1>
                    <p className="subtitle">Gestion des flux financiers et commissions</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Download size={18} /> Export
                    </button>
                    <button className="btn-secondary" onClick={() => alert("Module Mobile Money en cours d'intégration (API)")}>
                        <Smartphone size={18} /> Mobile Money
                    </button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nouvelle Transaction
                    </button>
                </div>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Vue d'ensemble
                </button>
                <button
                    className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Transactions
                </button>
                <button
                    className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    Factures Partenaires
                    {pendingCommissions > 0 && <span className="tab-badge">{invoices.filter(i => i.status === 'pending').length}</span>}
                </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="overview-grid">
                    <div className="glass-panel stat-card">
                        <h3>Chiffre d'Affaires</h3>
                        <div className="big-value">{totalRevenue.toLocaleString()} FCFA</div>
                        <div className="trend positive">+12% vs N-1</div>
                    </div>
                    <div className="glass-panel stat-card">
                        <h3>Commissions à Payer</h3>
                        <div className="big-value">{pendingCommissions.toLocaleString()} FCFA</div>
                        <div className="trend">En attente</div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: TRANSACTIONS */}
            {activeTab === 'transactions' && (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Référence/Desc</th>
                                <th>Méthode</th>
                                <th>Montant</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, idx) => (
                                <tr key={tx.id || idx}>
                                    <td>{tx.date}</td>
                                    <td>
                                        <span className={`type-badge ${tx.type === 'Commission' ? 'expense' : 'income'}`}>
                                            {tx.type === 'Premium' ? 'Prime Assurance' : tx.type}
                                        </span>
                                    </td>
                                    <td>{tx.contractNumber || tx.description || '-'}</td>
                                    <td>{tx.method}</td>
                                    <td className={`font-bold ${tx.amount < 0 ? 'text-red' : 'text-green'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount} FCFA
                                    </td>
                                    <td><span className="badge success">{tx.status}</span></td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr><td colSpan="6" className="text-center p-4">Aucune transaction</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB CONTENT: PARTNER INVOICES (Real Data) */}
            {activeTab === 'invoices' && (
                <div className="glass-panel table-container">
                    <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p>Factures soumises par les partenaires via leur portail.</p>
                        <div className="filter-group">
                            <Filter size={16} />
                            {/* Filter logic could be added here */}
                        </div>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Partenaire</th>
                                <th>N° Facture</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.date}</td>
                                    <td>{inv.partnerName || 'Partenaire Inconnu'}</td>
                                    <td>{inv.number}</td>
                                    <td className="font-bold">{inv.amount} FCFA</td>
                                    <td>
                                        <span className={`badge ${inv.status === 'paid' ? 'success' : 'pending'}`}>
                                            {inv.status === 'paid' ? 'Payée' : 'En attente'}
                                        </span>
                                    </td>
                                    <td>
                                        {inv.status === 'pending' && (
                                            <button
                                                className="btn-validate"
                                                onClick={() => handleValidateInvoice(inv)}
                                                disabled={processingInvoice === inv.id}
                                            >
                                                {processingInvoice === inv.id ? '...' : <><CheckCircle size={14} /> Valider Paiement</>}
                                            </button>
                                        )}
                                        {inv.status === 'paid' && (
                                            <span className="text-muted text-sm flex items-center gap-1">
                                                <CheckCircle size={14} /> Payé le {inv.paidAt ? new Date(inv.paidAt.seconds * 1000).toLocaleDateString() : '-'}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr><td colSpan="6" className="text-center p-4">Aucune facture partenaire</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL NEW TRANSACTION */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>Nouvelle Transaction</h2>
                        <form onSubmit={handleAddTransaction} className="modal-form">
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" name="date" required className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select name="type" className="form-input">
                                    <option value="Premium">Prime Assurance</option>
                                    <option value="Fee">Frais de Dossier</option>
                                    <option value="Refund">Remboursement</option>
                                    <option value="Expense">Dépense Diverse</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Montant (FCFA)</label>
                                <input type="number" name="amount" required className="form-input" step="0.01" />
                            </div>
                            <div className="form-group">
                                <label>Méthode</label>
                                <select name="method" className="form-input">
                                    <option>Virement</option>
                                    <option>Orange Money</option>
                                    <option>MTN Mobile Money</option>
                                    <option>Carte Bancaire</option>
                                    <option>Espèces</option>
                                    <option>Chèque</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description / Référence</label>
                                <input type="text" name="description" className="form-input" placeholder="Ex: Achat fournitures" />
                            </div>
                            <div className="form-group">
                                <label>N° Contrat (Optionnel)</label>
                                <input type="text" name="contractNumber" className="form-input" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                <button type="submit" className="btn-primary">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .page-container { padding: 1rem 2rem; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .header-actions { display: flex; gap: 1rem; }
                .btn-primary { background: var(--color-primary); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                .btn-secondary { background: white; border: 1px solid var(--glass-border); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

                .tabs-container { display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.5rem; }
                .tab-btn { background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; font-weight: 500; color: var(--color-text-muted); padding-bottom: 0.75rem; border-bottom: 2px solid transparent; position: relative; }
                .tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
                .tab-badge { position: absolute; top: 0; right: 0; background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: bold; transform: translate(25%, -25%); }

                .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
                .stat-card { padding: 1.5rem; }
                .big-value { font-size: 2rem; font-weight: 700; margin: 0.5rem 0; }
                .trend.positive { color: var(--color-success); }
                .trend { color: var(--color-text-muted); font-size: 0.9rem; }

                .table-container { overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { padding: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); text-align: left; }
                
                .badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
                .badge.success { background: hsla(140, 70%, 40%, 0.1); color: var(--color-success); }
                .badge.pending { background: hsla(38, 90%, 50%, 0.1); color: #ea580c; }
                
                .type-badge { font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; font-weight: 500; }
                .type-badge.income { background: #dcfce7; color: #166534; }
                .type-badge.expense { background: #fee2e2; color: #991b1b; }
                
                .font-bold { font-weight: 600; }
                .text-red { color: #ef4444; }
                .text-green { color: #16a34a; }
                .text-muted { color: var(--color-text-muted); font-size: 0.85rem; }
                
                .btn-validate { background: var(--color-primary); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; transition: background 0.2s; }
                .btn-validate:hover { opacity: 0.9; }
                .btn-validate:disabled { opacity: 0.6; cursor: not-allowed; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(2px); }
                .modal-content { width: 400px; padding: 2rem; }
                .modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-input { padding: 0.75rem; border: 1px solid var(--glass-border); border-radius: 8px; }
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
            `}</style>
        </div>
    );
};

export default FinancePage;
