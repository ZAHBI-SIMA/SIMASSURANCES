import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Plus,
    Filter,
    Search,
    CheckCircle,
    Clock,
    AlertCircle,
    DollarSign,
    X,
    Calendar
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const PortalInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        number: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        description: ''
    });

    // Fetch Invoices
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);
                const invoicesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setInvoices(invoicesData);
            } catch (error) {
                console.error("Error fetching invoices: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleSubmitInvoice = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'invoices'), {
                ...newInvoice,
                status: 'pending',
                amount: parseFloat(newInvoice.amount),
                createdAt: serverTimestamp()
            });
            const createdInvoice = { id: docRef.id, ...newInvoice, status: 'pending' };
            setInvoices([createdInvoice, ...invoices]);
            setIsModalOpen(false);
            setNewInvoice({
                number: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: '',
                description: ''
            });
        } catch (error) {
            console.error("Error submitting invoice: ", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="status-badge paid"><CheckCircle size={14} /> Payée</span>;
            case 'pending': return <span className="status-badge pending"><Clock size={14} /> En attente</span>;
            case 'overdue': return <span className="status-badge overdue"><AlertCircle size={14} /> En retard</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

    const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>Factures</h1>
                    <p className="subtitle">Suivi de vos facturations et paiements</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Soumettre une facture
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="glass-panel summary-card">
                    <div className="icon-box blue">
                        <FileText size={24} />
                    </div>
                    <div className="summary-info">
                        <span className="label">Total Facturé</span>
                        <span className="value">{totalAmount.toLocaleString()} FCFA</span>
                    </div>
                </div>
                <div className="glass-panel summary-card">
                    <div className="icon-box orange">
                        <Clock size={24} />
                    </div>
                    <div className="summary-info">
                        <span className="label">En Attente</span>
                        <span className="value">{pendingAmount.toLocaleString()} FCFA</span>
                    </div>
                </div>
            </div>

            <div className="glass-panel table-container">
                <div className="table-header">
                    <div className="filter-tabs">
                        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Toutes</button>
                        <button className={`tab ${filter === 'paid' ? 'active' : ''}`} onClick={() => setFilter('paid')}>Payées</button>
                        <button className={`tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>En attente</button>
                    </div>
                    <div className="search-box">
                        <Search size={16} />
                        <input type="text" placeholder="Rechercher..." />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Chargement...</div>
                ) : (
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>N° Facture</th>
                                <th>Date</th>
                                <th>Libellé</th>
                                <th>Montant</th>
                                <th>Échéance</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">Aucune facture trouvée</td>
                                </tr>
                            ) : (
                                filteredInvoices.map(invoice => (
                                    <tr key={invoice.id}>
                                        <td className="font-mono font-bold">{invoice.number}</td>
                                        <td>{invoice.date}</td>
                                        <td>{invoice.description || 'Prestation de service'}</td>
                                        <td className="amount-cell">{Number(invoice.amount).toLocaleString()} FCFA</td>
                                        <td>{invoice.dueDate || '-'}</td>
                                        <td>{getStatusBadge(invoice.status)}</td>
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
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Soumettre une facture</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitInvoice} className="invoice-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Numéro de facture</label>
                                    <input type="text" required placeholder="Ex: F-2025-001" value={newInvoice.number} onChange={e => setNewInvoice({ ...newInvoice, number: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Montant (FCFA)</label>
                                    <input type="number" required placeholder="0.00" value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date d'émission</label>
                                    <input type="date" required value={newInvoice.date} onChange={e => setNewInvoice({ ...newInvoice, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Date d'échéance</label>
                                    <input type="date" required value={newInvoice.dueDate} onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Libellé / Description</label>
                                <input type="text" placeholder="Ex: Réparation Sinistre #123" value={newInvoice.description} onChange={e => setNewInvoice({ ...newInvoice, description: e.target.value })} />
                            </div>
                            <div className="file-upload-placeholder">
                                <FileText size={24} />
                                <p>Glissez votre PDF ici ou cliquez pour parcourir</p>
                                <small>(Fonction d'upload à venir)</small>
                            </div>
                            <button type="submit" className="btn-submit">Soumettre la facture</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .page-container { padding: 1rem 2rem; max-width: 1400px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .page-header h1 { font-size: 2rem; color: var(--color-primary); margin: 0 0 0.5rem 0; font-weight: 800; }
                .subtitle { color: var(--color-text-muted); font-size: 1.1rem; margin: 0; }
                
                .btn-primary { display: flex; align-items: center; gap: 0.5rem; background: var(--color-primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

                /* Summary Cards */
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .summary-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
                .icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .icon-box.blue { background: #e0f2fe; color: #0284c7; }
                .icon-box.orange { background: #ffedd5; color: #ea580c; }
                .summary-info { display: flex; flex-direction: column; }
                .summary-info .label { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 0.25rem; }
                .summary-info .value { font-size: 1.5rem; font-weight: 700; color: var(--color-text); }

                /* Table Styles */
                .table-container { padding: 0; overflow: hidden; }
                .table-header { padding: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
                .filter-tabs { display: flex; gap: 1rem; }
                .tab { background: none; border: none; padding: 0.5rem 0; color: var(--color-text-muted); font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
                .tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
                
                .search-box { display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.03); padding: 0.5rem 1rem; border-radius: 8px; }
                .search-box input { border: none; background: none; outline: none; font-family: inherit; width: 200px; }

                .invoices-table { width: 100%; border-collapse: collapse; }
                .invoices-table th { text-align: left; padding: 1rem 1.5rem; color: var(--color-text-muted); font-weight: 600; font-size: 0.9rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .invoices-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); vertical-align: middle; }
                .invoices-table tbody tr:last-child td { border-bottom: none; }
                .invoices-table tbody tr:hover { background: rgba(0,0,0,0.01); }

                .amount-cell { font-family: monospace; font-weight: 600; font-size: 1rem; }
                .font-mono { font-family: monospace; }
                .font-bold { font-weight: 600; }
                
                .status-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; border-radius: 99px; font-size: 0.8rem; font-weight: 600; width: fit-content; }
                .status-badge.paid { background: #dcfce7; color: #16a34a; }
                .status-badge.pending { background: #ffedd5; color: #ea580c; }
                .status-badge.overdue { background: #fee2e2; color: #ef4444; }

                .icon-btn-sm { width: 32px; height: 32px; border-radius: 6px; border: none; background: rgba(0,0,0,0.03); cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .icon-btn-sm:hover { background: var(--color-primary); color: white; }
                
                .empty-state { text-align: center; color: var(--color-text-muted); padding: 3rem !important; }

                /* Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: white; width: 100%; max-width: 500px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { margin: 0; color: var(--color-primary); }
                .close-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); }

                .invoice-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.9rem; font-weight: 600; color: var(--color-text); }
                .form-group input { padding: 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-family: inherit; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                .file-upload-placeholder { border: 2px dashed #e5e7eb; border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; background: #f9fafb; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
                .file-upload-placeholder:hover { border-color: var(--color-primary); background: #eff6ff; color: var(--color-primary); }

                .btn-submit { margin-top: 1rem; background: var(--color-primary); color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-submit:hover { opacity: 0.9; }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .table-header { flex-direction: column; gap: 1rem; align-items: stretch; }
                    .filter-tabs { width: 100%; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 0.5rem; }
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default PortalInvoices;
