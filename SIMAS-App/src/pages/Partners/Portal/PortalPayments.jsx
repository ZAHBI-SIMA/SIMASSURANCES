import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    TrendingUp,
    Download,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    Calendar,
    CheckCircle,
    Clock,
    Plus,
    X
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const PortalPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mobile Money State
    const [activeTab, setActiveTab] = useState('history');
    const [mobileMoney, setMobileMoney] = useState({
        provider: 'Orange Money',
        number: '',
        name: ''
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Test data state for simulation
    const [newPayment, setNewPayment] = useState({
        reference: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Virement',
        status: 'completed',
        description: 'Règlement factures mensuelles'
    });

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const q = query(collection(db, 'payments'), orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);
                const paymentData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPayments(paymentData);
            } catch (error) {
                console.error("Error fetching payments: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const handleSimulatePayment = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'payments'), {
                ...newPayment,
                amount: parseFloat(newPayment.amount),
                createdAt: serverTimestamp()
            });
            const createdPayment = { id: docRef.id, ...newPayment, amount: parseFloat(newPayment.amount) };
            setPayments([createdPayment, ...payments]);
            setIsModalOpen(false);
            // Reset form
            setNewPayment({
                reference: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                method: 'Virement',
                status: 'completed',
                description: 'Règlement factures mensuelles'
            });
        } catch (error) {
            console.error("Error adding payment: ", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="status-badge completed"><CheckCircle size={14} /> Effectué</span>;
            case 'processing': return <span className="status-badge processing"><Clock size={14} /> En cours</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    const totalReceived = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const lastPayment = payments.length > 0 ? payments[0] : null;

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>Commissions & Paiements</h1>
                    <p className="subtitle">Gérez vos revenus et méthodes de retrait</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setIsSettingsOpen(true)}>
                        <CreditCard size={16} /> Configurer Mobile Money
                    </button>
                    <button className="btn-primary">
                        <Download size={18} /> Relevé Mensuel
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <div className="stat-icon green">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Reçu</h3>
                        <p className="stat-value">{totalReceived.toLocaleString()} FCFA</p>
                        <span className="stat-sub">Commissions payées</span>
                    </div>
                </div>

                <div className="glass-panel stat-card">
                    <div className="stat-icon blue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Compte de Retrait</h3>
                        <p className="stat-value" style={{ fontSize: '1.2rem' }}>
                            {mobileMoney.number ? `${mobileMoney.provider}` : 'Non configuré'}
                        </p>
                        <span className="stat-sub">
                            {mobileMoney.number || 'Ajoutez un numéro'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="glass-panel content-panel">
                <div className="panel-header">
                    <h2>Historique des Transactions</h2>
                    <div className="search-box">
                        <Search size={16} />
                        <input type="text" placeholder="Rechercher une transaction..." />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Chargement...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Date</th>
                                    <th>Méthode</th>
                                    <th>Description</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Preuve</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-state">Aucun paiement enregistré</td>
                                    </tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment.id}>
                                            <td className="font-mono font-bold">{payment.reference || 'VIR-???'}</td>
                                            <td>{payment.date}</td>
                                            <td>
                                                <div className="method-cell">
                                                    <CreditCard size={14} />
                                                    {payment.method}
                                                </div>
                                            </td>
                                            <td>{payment.description}</td>
                                            <td className="amount-cell positive">+{Number(payment.amount).toLocaleString()} €</td>
                                            <td>{getStatusBadge(payment.status)}</td>
                                            <td>
                                                <button className="icon-btn-sm">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Configuration Mobile Money</h2>
                            <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="payment-form">
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>
                                Renseignez le numéro sur lequel vous souhaitez recevoir vos commissions.
                            </p>
                            <div className="form-group">
                                <label>Opérateur</label>
                                <select
                                    value={mobileMoney.provider}
                                    onChange={e => setMobileMoney({ ...mobileMoney, provider: e.target.value })}
                                >
                                    <option value="Orange Money">Orange Money</option>
                                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                                    <option value="Moov Money">Moov Money</option>
                                    <option value="Wave">Wave</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    value={mobileMoney.number}
                                    onChange={e => setMobileMoney({ ...mobileMoney, number: e.target.value })}
                                    placeholder="07 00 00 00 00"
                                />
                            </div>
                            <div className="form-group">
                                <label>Nom du titulaire (Vérification)</label>
                                <input
                                    type="text"
                                    value={mobileMoney.name}
                                    onChange={e => setMobileMoney({ ...mobileMoney, name: e.target.value })}
                                    placeholder="Votre Nom Complet"
                                />
                            </div>
                            <button
                                className="btn-submit"
                                onClick={() => {
                                    alert("Moyen de paiement enregistré avec succès !");
                                    setIsSettingsOpen(false);
                                }}
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .page-container { padding: 1rem 2rem; max-width: 1400px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .page-header h1 { font-size: 2rem; color: var(--color-primary); margin: 0 0 0.5rem 0; font-weight: 800; }
                .subtitle { color: var(--color-text-muted); font-size: 1.1rem; margin: 0; }
                
                .header-actions { display: flex; align-items: center; gap: 1rem; }
                .btn-primary { display: flex; align-items: center; gap: 0.5rem; background: var(--color-primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
                .btn-secondary { display: flex; align-items: center; gap: 0.5rem; background: white; color: var(--color-text); border: 1px solid var(--glass-border); padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-secondary:hover { border-color: var(--color-primary); color: var(--color-primary); }

                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
                .stat-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-icon.green { background: #dcfce7; color: #16a34a; }
                .stat-icon.blue { background: #e0f2fe; color: #0284c7; }
                
                .stat-info h3 { margin: 0; font-size: 0.9rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; }
                .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--color-text); margin: 0.25rem 0; }
                .stat-sub { font-size: 0.85rem; color: var(--color-text-muted); }

                /* Content Panel */
                .content-panel { padding: 0; overflow: hidden; }
                .panel-header { padding: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
                .panel-header h2 { font-size: 1.2rem; margin: 0; }
                
                .search-box { display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.03); padding: 0.5rem 1rem; border-radius: 8px; }
                .search-box input { border: none; background: none; outline: none; font-family: inherit; width: 250px; }

                .payments-table { width: 100%; border-collapse: collapse; }
                .payments-table th { text-align: left; padding: 1rem 1.5rem; color: var(--color-text-muted); font-weight: 600; font-size: 0.9rem; border-bottom: 1px solid rgba(0,0,0,0.05); background: rgba(0,0,0,0.01); }
                .payments-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); vertical-align: middle; }
                .payments-table tbody tr:last-child td { border-bottom: none; }
                .payments-table tbody tr:hover { background: rgba(0,0,0,0.01); }

                .amount-cell { font-family: monospace; font-weight: 700; font-size: 1rem; }
                .amount-cell.positive { color: #16a34a; }
                .font-mono { font-family: monospace; }
                .method-cell { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text); font-weight: 500; }
                
                .status-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; border-radius: 99px; font-size: 0.8rem; font-weight: 600; width: fit-content; }
                .status-badge.completed { background: #dcfce7; color: #16a34a; }
                .status-badge.processing { background: #ffedd5; color: #ea580c; }

                .icon-btn-sm { width: 32px; height: 32px; border-radius: 6px; border: none; background: rgba(0,0,0,0.03); cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .icon-btn-sm:hover { background: var(--color-primary); color: white; }
                
                .empty-state { text-align: center; color: var(--color-text-muted); padding: 3rem !important; }

                /* Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: white; width: 100%; max-width: 500px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { margin: 0; color: var(--color-primary); }
                .close-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); }

                .payment-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.9rem; font-weight: 600; color: var(--color-text); }
                .form-group input, .form-group select { padding: 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: inherit; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                .btn-submit { margin-top: 1rem; background: var(--color-primary); color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-submit:hover { opacity: 0.9; }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { width: 100%; flex-direction: column; gap: 0.5rem; align-items: stretch; }
                    .form-row { grid-template-columns: 1fr; }
                    .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default PortalPayments;
