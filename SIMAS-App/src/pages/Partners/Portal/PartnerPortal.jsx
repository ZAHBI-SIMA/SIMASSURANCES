import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    DollarSign,
    MessageCircle,
    FileCheck,
    ShoppingBag,
    Award,
    Star,
    Target
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { useNavigate, useOutletContext } from 'react-router-dom';

const PartnerPortal = () => {
    const navigate = useNavigate();
    const { partnerType } = useOutletContext(); // 'Prestataire' or 'Distributeur'
    const [loading, setLoading] = useState(true);

    // Stats State
    const [stats, setStats] = useState({
        activeItems: 0, // Missions or Contracts
        pendingItems: 0, // Invoices or Quotes
        pendingValue: 0,
        totalRevenue: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                let allActivities = [];
                let revenueSource = [];
                let activeCount = 0;
                let pendingCount = 0;
                let pendingVal = 0;
                let revenueVal = 0;

                if (partnerType === 'Prestataire') {
                    // --- PRESTATAIRE LOGIC (Missions, Invoices, Payments) ---
                    const missionsSnap = await getDocs(query(collection(db, 'missions'), orderBy('createdAt', 'desc')));
                    const invoicesSnap = await getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')));
                    const paymentsSnap = await getDocs(query(collection(db, 'payments'), orderBy('date', 'desc')));

                    const missions = missionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'mission' }));
                    const invoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'invoice' }));
                    const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'payment' }));

                    activeCount = missions.filter(m => m.status === 'new' || m.status === 'pending').length;

                    const pendingInvoices = invoices.filter(i => i.status === 'pending');
                    pendingCount = pendingInvoices.length;
                    pendingVal = pendingInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

                    revenueSource = payments.filter(p => p.status === 'completed');
                    revenueVal = revenueSource.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

                    allActivities = [
                        ...missions.map(m => ({
                            id: m.id,
                            type: 'mission',
                            text: `Mission ${m.status === 'new' ? 'attribuée' : 'mise à jour'}: ${m.client}`,
                            time: new Date(m.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString(),
                            timestamp: m.createdAt?.seconds || 0,
                            status: m.status === 'new' ? 'new' : m.status === 'completed' ? 'success' : 'info'
                        })),
                        ...invoices.map(i => ({
                            id: i.id,
                            type: 'invoice',
                            text: `Facture ${i.number} (${i.amount}FCFA) ${i.status === 'paid' ? 'réglée' : 'soumise'}`,
                            time: new Date(i.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString(),
                            timestamp: i.createdAt?.seconds || 0,
                            status: i.status === 'paid' ? 'success' : 'pending'
                        })),
                        ...payments.map(p => ({
                            id: p.id,
                            type: 'payment',
                            text: `Paiement reçu: ${p.amount}FCFA (${p.method})`,
                            time: p.date,
                            timestamp: new Date(p.date).getTime() / 1000,
                            status: 'success'
                        }))
                    ];

                } else {
                    // --- DISTRIBUTEUR LOGIC (Quotes, Contracts, Commissions/Payments) ---
                    const quotesSnap = await getDocs(query(collection(db, 'quotes'), orderBy('createdAt', 'desc')));
                    const contractsSnap = await getDocs(query(collection(db, 'contracts'), orderBy('createdAt', 'desc')));
                    // Payments/Commissions: Assuming 'payments' collection also stores distributor commissions
                    const paymentsSnap = await getDocs(query(collection(db, 'payments'), orderBy('date', 'desc')));

                    const quotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'quote' }));
                    const contracts = contractsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'contract' }));
                    const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'payment' }));

                    activeCount = contracts.filter(c => c.status === 'Active').length;

                    const pendingQuotes = quotes.filter(q => q.status === 'Draft');
                    pendingCount = pendingQuotes.length;
                    // Estimated potential value from drafts
                    pendingVal = pendingQuotes.reduce((sum, q) => sum + (Number(q.premium) || 0), 0);

                    revenueSource = payments.filter(p => p.status === 'completed');
                    revenueVal = revenueSource.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

                    allActivities = [
                        ...quotes.map(q => ({
                            id: q.id,
                            type: 'quote',
                            text: `Devis créé: ${q.clientName} (${q.productName})`,
                            time: new Date(q.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString(),
                            timestamp: q.createdAt?.seconds || 0,
                            status: q.status === 'Converted' ? 'success' : 'pending'
                        })),
                        ...contracts.map(c => ({
                            id: c.id,
                            type: 'contract',
                            text: `Contrat validé pour ${c.clientName}`,
                            time: new Date(c.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString(),
                            timestamp: c.createdAt?.seconds || 0,
                            status: 'success'
                        })),
                        ...payments.map(p => ({
                            id: p.id,
                            type: 'payment',
                            text: `Commission reçue: ${p.amount}FCFA`,
                            time: p.date,
                            timestamp: new Date(p.date).getTime() / 1000,
                            status: 'success'
                        }))
                    ];
                }

                // --- Common Processing ---
                setStats({
                    activeItems: activeCount,
                    pendingItems: pendingCount,
                    pendingValue: pendingVal,
                    totalRevenue: revenueVal,
                });

                const sortedActivities = allActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
                setRecentActivities(sortedActivities);

                // --- Generate Chart Data ---
                const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                const currentMonthIndex = new Date().getMonth();
                const last6Months = [];

                for (let i = 5; i >= 0; i--) {
                    let mIndex = currentMonthIndex - i;
                    if (mIndex < 0) mIndex += 12;
                    last6Months.push({ name: months[mIndex], revenue: 0 });
                }

                revenueSource.forEach(p => {
                    const pDate = new Date(p.date || Date.now());
                    const pMonth = months[pDate.getMonth()];
                    const monthData = last6Months.find(d => d.name === pMonth);
                    if (monthData) {
                        monthData.revenue += Number(p.amount);
                    }
                });

                setChartData(last6Months);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [partnerType]);

    // UI Configuration based on metrics
    const isPrestatoire = partnerType === 'Prestataire';
    const statConfig = isPrestatoire ? {
        active: { title: 'Missions en cours', icon: Briefcase, color: 'blue', label: 'À traiter' },
        pending: { title: 'Factures en attente', icon: FileText, color: 'orange', label: 'En cours' },
        revenue: { title: 'Chiffre d\'affaires', icon: DollarSign, color: 'green', label: 'Total Encaissé' }
    } : {
        active: { title: 'Contrats Actifs', icon: FileCheck, color: 'blue', label: 'En portefeuille' },
        pending: { title: 'Devis en cours', icon: FileText, color: 'orange', label: 'Potentiel' },
        revenue: { title: 'Commissions', icon: DollarSign, color: 'green', label: 'Gains Totaux' }
    };

    const statCards = [
        {
            title: statConfig.active.title,
            value: stats.activeItems,
            icon: statConfig.active.icon,
            color: statConfig.active.color,
            change: statConfig.active.label
        },
        {
            title: statConfig.pending.title,
            value: stats.pendingItems,
            icon: statConfig.pending.icon,
            color: statConfig.pending.color,
            change: `${stats.pendingValue.toLocaleString()} FCFA`
        },
        {
            title: statConfig.revenue.title,
            value: `${stats.totalRevenue.toLocaleString()} FCFA`,
            icon: statConfig.revenue.icon,
            color: statConfig.revenue.color,
            change: statConfig.revenue.label
        },
        {
            title: 'Qualité de Service',
            value: '4.9/5',
            icon: TrendingUp,
            color: 'purple',
            change: 'Top 5%'
        },
    ];

    return (
        <div className="portal-container">
            <header className="portal-header">
                <div>
                    <h1>Tableau de Bord</h1>
                    <p className="subtitle">Bienvenue sur votre espace <strong>{partnerType}</strong></p>
                </div>
                <div className="current-date">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className="glass-panel stat-card">
                        <div className="stat-header">
                            <span className={`icon-box ${stat.color}`}>
                                <stat.icon size={20} />
                            </span>
                            <span className="stat-change">{stat.change}</span>
                        </div>
                        <h3 className="stat-value">{stat.value}</h3>
                        <p className="stat-title">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Gamification Widget */}
            {!isPrestatoire && (
                <div className="glass-panel gamification-widget">
                    <div className="gamer-profile">
                        <div className="avatar-ring">
                            <span className="level-badge">LVL 3</span>
                            <div className="avatar">JD</div>
                        </div>
                        <div className="gamer-info">
                            <h3>Jean Dupont</h3>
                            <span className="rank-title">Agent "Silver"</span>
                        </div>
                    </div>
                    <div className="gamer-stats">
                        <div className="xp-bar-container">
                            <div className="xp-info">
                                <span>Progression (Vers Gold)</span>
                                <span>1250 / 2000 XP</span>
                            </div>
                            <div className="xp-track">
                                <div className="xp-fill" style={{ width: '62%' }}></div>
                            </div>
                        </div>
                        <div className="points-display">
                            <Star size={18} fill="gold" className="star-icon" />
                            <span className="points-val">450 pts</span>
                        </div>
                    </div>
                    <div className="active-challenge">
                        <div className="challenge-icon"><Target size={20} /></div>
                        <div className="challenge-content">
                            <h4>Challenge Hebdo: "Sprint Auto"</h4>
                            <p>Vendez 5 contrats Auto avant Dimanche (+50€)</p>
                            <div className="challenge-progress">3 / 5 Contrats</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                {/* Main Chart Section */}
                <div className="glass-panel main-chart-section">
                    <div className="section-header">
                        <h2>Revenus (6 derniers mois)</h2>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="glass-panel activity-section">
                    <div className="section-header">
                        <h2>Dernières Activités</h2>
                    </div>
                    <div className="activity-list">
                        {recentActivities.length === 0 ? (
                            <p className="no-activity">Aucune activité récente.</p>
                        ) : (
                            recentActivities.map((item, idx) => (
                                <div key={idx} className="activity-item">
                                    <div className={`activity-icon ${item.status === 'success' ? 'success' : item.status === 'new' ? 'new' : 'info'}`}>
                                        {item.status === 'new' && <AlertCircle size={16} />}
                                        {item.status === 'success' && <CheckCircle size={16} />}
                                        {(item.status === 'info' || item.status === 'pending') && <Clock size={16} />}
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-text">{item.text}</p>
                                        <span className="activity-time">{item.time}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="quick-actions">
                        <h3>Actions Rapides</h3>
                        <div className="action-buttons">
                            {isPrestatoire ? (
                                <>
                                    <button className="action-btn" onClick={() => navigate('/partner-portal/invoices')}>
                                        <FileText size={16} style={{ marginRight: '8px' }} />
                                        Nouvelle Facture
                                    </button>
                                    <button className="action-btn outline" onClick={() => navigate('/partner-portal/missions')}>
                                        <Briefcase size={16} style={{ marginRight: '8px' }} />
                                        Voir les Missions
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="action-btn" onClick={() => navigate('/partner-portal/products')}>
                                        <ShoppingBag size={16} style={{ marginRight: '8px' }} />
                                        Nouveau Contrat
                                    </button>
                                    <button className="action-btn outline" onClick={() => navigate('/partner-portal/quotes')}>
                                        <FileText size={16} style={{ marginRight: '8px' }} />
                                        Mes Devis
                                    </button>
                                </>
                            )}
                            <button className="action-btn outline" onClick={() => window.location.href = 'mailto:gestion@simas.com'}>
                                <MessageCircle size={16} style={{ marginRight: '8px' }} />
                                Contacter le gestionnaire
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .portal-container { padding: 1rem 2rem; max-width: 1400px; margin: 0 auto; }
                
                /* Header */
                .portal-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
                .portal-header h1 { font-size: 2rem; color: var(--color-primary); margin: 0 0 0.5rem 0; font-weight: 800; }
                .subtitle { color: var(--color-text-muted); font-size: 1.1rem; margin: 0; }
                .current-date { font-weight: 500; color: var(--color-text-muted); background: white; padding: 0.5rem 1rem; border-radius: 99px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }

                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
                @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } }

                .stat-card { padding: 1.25rem; transition: transform 0.2s; position: relative; overflow: hidden; }
                .stat-card:hover { transform: translateY(-5px); }
                .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
                .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .icon-box.blue { background: hsla(210, 90%, 50%, 0.1); color: #2563eb; }
                .icon-box.orange { background: hsla(30, 90%, 50%, 0.1); color: #ea580c; }
                .icon-box.green { background: hsla(140, 70%, 40%, 0.1); color: #16a34a; }
                .icon-box.purple { background: hsla(270, 70%, 50%, 0.1); color: #9333ea; }
                
                .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--color-text); margin: 0; line-height: 1.2; }
                .stat-title { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.25rem; font-weight: 500; }
                .stat-change { font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 6px; background: rgba(0,0,0,0.03); color: var(--color-text); }

                /* Dashboard Content */
                .dashboard-content { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
                @media (max-width: 1024px) { .dashboard-content { grid-template-columns: 1fr; } }

                .main-chart-section { padding: 2rem; display: flex; flex-direction: column; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .section-header h2 { font-size: 1.2rem; margin: 0; color: var(--color-text); }

                /* Activity Section */
                .activity-section { padding: 1.5rem; display: flex; flex-direction: column; height: 100%; }
                
                .activity-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; flex: 1; }
                .activity-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 12px; transition: background 0.2s; cursor: pointer; }
                .activity-item:hover { background: rgba(255, 255, 255, 0.5); }
                .no-activity { color: var(--color-text-muted); text-align: center; margin-top: 1rem; font-style: italic; }
                
                .activity-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .activity-icon.new { background: #e0f2fe; color: #0284c7; }
                .activity-icon.success { background: #dcfce7; color: #16a34a; }
                .activity-icon.info { background: #f3e8ff; color: #9333ea; }
                
                .activity-details { flex: 1; }
                .activity-text { margin: 0; font-size: 0.9rem; font-weight: 500; color: var(--color-text); line-height: 1.4; }
                .activity-time { font-size: 0.75rem; color: var(--color-text-muted); }

                /* Quick Actions */
                .quick-actions { padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.06); }
                .quick-actions h3 { font-size: 0.95rem; margin: 0 0 1rem 0; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .action-buttons { display: grid; gap: 0.75rem; }
                .action-btn { padding: 0.8rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; }
                .action-btn:not(.outline) { background: var(--color-primary); color: white; box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3); }
                .action-btn:not(.outline):hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(var(--color-primary-rgb), 0.4); }
                .action-btn.outline { background: white; border: 1px solid var(--glass-border); color: var(--color-text); }
                .action-btn.outline:hover { border-color: var(--color-primary); color: var(--color-primary); }

                /* Gamification Widget */
                .gamification-widget { margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, white 0%, #f0f9ff 100%); border: 1px solid rgba(255,255,255,0.6); gap: 2rem; flex-wrap: wrap; }
                .gamer-profile { display: flex; align-items: center; gap: 1rem; }
                .avatar-ring { position: relative; width: 60px; height: 60px; border-radius: 50%; border: 3px solid var(--color-primary); padding: 3px; }
                .avatar { width: 100%; height: 100%; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; }
                .level-badge { position: absolute; bottom: -5px; right: -5px; background: #fbbf24; color: #78350f; font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 99px; border: 2px solid white; }
                .rank-title { font-size: 0.85rem; color: var(--color-primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(37,99,235,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; }
                
                .gamer-stats { flex: 1; min-width: 250px; }
                .xp-bar-container { margin-bottom: 0.5rem; }
                .xp-info { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem; font-weight: 600; color: #64748b; }
                .xp-track { height: 8px; background: rgba(0,0,0,0.05); border-radius: 99px; overflow: hidden; }
                .xp-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), #60a5fa); border-radius: 99px; }
                .points-display { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #d97706; }
                .star-icon { color: #fbbf24; }

                .active-challenge { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.8); padding: 0.75rem 1rem; border-radius: 12px; border: 1px dashed var(--color-primary); }
                .challenge-icon { width: 40px; height: 40px; background: #e0f2fe; color: var(--color-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .challenge-content h4 { margin: 0; font-size: 0.9rem; color: var(--color-text); }
                .challenge-content p { margin: 0.2rem 0; font-size: 0.8rem; color: var(--color-text-muted); }
                .challenge-progress { font-size: 0.75rem; font-weight: 700; color: var(--color-success); }

                @media (max-width: 768px) {
                    .gamification-widget { flex-direction: column; align-items: stretch; gap: 1.5rem; text-align: center; }
                    .gamer-profile { flex-direction: column; }
                    .active-challenge { flex-direction: column; text-align: center; }
                }
            `}</style>
        </div>
    );
};

export default PartnerPortal;
