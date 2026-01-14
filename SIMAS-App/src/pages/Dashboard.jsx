import React, { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  AlertOctagon,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';

// Placeholder chart data removed - using real data


const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="glass-panel stat-card">
    <div className="stat-header">
      <div className="stat-icon" style={{ backgroundColor: `hsla(${color}, 20%)`, color: `hsl(${color})` }}>
        <Icon size={24} />
      </div>
      {/* <button className="more-btn">
                <MoreHorizontal size={20} />
            </button> */}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{title}</div>
    <div className="stat-trend">
      <ArrowUpRight size={16} className="trend-icon" />
      <span className="trend-value">{change}</span>
      <span className="trend-period">vs mois dernier</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    activeContracts: 0,
    openClaims: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Clients Count
        const clientsSnap = await getDocs(collection(db, "clients"));
        const clientsCount = clientsSnap.size;

        // 2. Fetch All Contracts for Graph & Stats
        const contractsSnap = await getDocs(collection(db, "contracts"));
        const contracts = contractsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate Active Contracts & Total Active Revenue
        const activeContracts = contracts.filter(c => c.status === 'Actif');
        const activeContractsCount = activeContracts.length;
        const revenue = activeContracts.reduce((acc, c) => acc + (parseFloat(c.premium) || 0), 0);

        // Calculate Monthly Performance (Graph)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyRevenue = new Array(12).fill(0);

        contracts.forEach(contract => {
          // Use startDate or createdAt as fallback
          let date = null;
          if (contract.startDate) {
            date = new Date(contract.startDate);
          } else if (contract.createdAt?.toDate) {
            date = contract.createdAt.toDate();
          }

          if (date && !isNaN(date.getTime()) && contract.premium) {
            const monthIndex = date.getMonth(); // 0 is Jan
            monthlyRevenue[monthIndex] += parseFloat(contract.premium);
          }
        });

        const formattedChartData = months.map((month, index) => ({
          name: month,
          ca: monthlyRevenue[index]
        }));
        setChartData(formattedChartData);

        // 3. Fetch Open Claims
        const claimsSnap = await getDocs(collection(db, "claims"));
        const openClaimsCount = claimsSnap.docs.filter(d => d.data().status !== 'Clôturé' && d.data().status !== 'Remboursé').length;

        // 4. Recent Activity (Last 5 Contracts)
        // Sort in memory since we already have all contracts
        const sortedContracts = [...contracts].sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.startDate || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.startDate || 0);
          return dateB - dateA;
        }).slice(0, 5);

        const activities = sortedContracts.map(c => ({
          id: c.id,
          type: 'Contrat',
          details: `Nouveau contrat ${c.contractNumber || c.id.substring(0, 8)}`,
          time: c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : (c.startDate || 'Récemment')
        }));
        setRecentActivity(activities);

        setStats({
          clients: clientsCount,
          activeContracts: activeContractsCount,
          openClaims: openClaimsCount,
          revenue: revenue
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Tableau de Bord</h1>
        <p className="subtitle">Bienvenue sur SIMASLOG, voici votre résumé en temps réel.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Clients Totaux"
          value={loading ? "-" : stats.clients}
          change="+2%"
          icon={Users}
          color="220, 70%, 40%" // Primary Blue
        />
        <StatCard
          title="Contrats Actifs"
          value={loading ? "-" : stats.activeContracts}
          change="+5%"
          icon={FileCheck}
          color="140, 70%, 30%" // Success Green
        />
        <StatCard
          title="Sinistres en Cours"
          value={loading ? "-" : stats.openClaims}
          change="Stable"
          icon={AlertOctagon}
          color="0, 70%, 50%" // Danger Red
        />
        <StatCard
          title="Chiffre d'Affaires (Est.)"
          value={loading ? "-" : `${stats.revenue.toLocaleString()} FCFA`}
          change="+12%"
          icon={TrendingUp}
          color="38, 90%, 45%" // Accent Gold
        />
      </div>

      <div className="content-grid">
        <div className="glass-panel chart-section">
          <h3>Performance Financière</h3>
          <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="ca" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--color-accent)' : 'var(--color-primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel recent-activity">
          <h3>Dernières Activités</h3>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="text-muted">Aucune activité récente.</p>
            ) : recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p className="activity-text"><strong>{item.type}</strong>: {item.details}</p>
                  <span className="activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding: 1rem 2rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        /* FORCE SINGLE LINE ON DESKTOP */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr); 
          gap: 1rem; /* Slightly reduced gap */
          margin-bottom: 2rem;
        }

        /* Responsive: Stack on smaller screens */
        @media (max-width: 1200px) {
           .stats-grid {
              grid-template-columns: repeat(2, 1fr);
           }
        }
        @media (max-width: 768px) {
           .stats-grid {
              grid-template-columns: 1fr;
           }
        }

        .stat-card {
          padding: 1.25rem; /* Reduced padding slightly */
          display: flex;
          flex-direction: column;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: 1.75rem; /* Slightly smaller font */
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: var(--color-text-muted);
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--color-success);
          background: hsla(140, 70%, 40%, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: var(--radius-full);
          align-self: flex-start;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .chart-section {
          padding: 1.5rem;
        }

        .recent-activity {
          padding: 1.5rem;
        }

        .activity-list {
          margin-top: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-primary);
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        .activity-text {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .activity-time {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        
        .text-muted { color: var(--color-text-muted); font-size: 0.9rem; }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
