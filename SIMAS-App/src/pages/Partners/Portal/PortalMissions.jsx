import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Car,
    FileText,
    ArrowRight
} from 'lucide-react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

const PortalMissions = () => {
    const [filter, setFilter] = useState('all');
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Missions
    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const q = query(collection(db, 'missions'), orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);
                const missionsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMissions(missionsData);
            } catch (error) {
                console.error("Error fetching missions: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMissions();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            const missionRef = doc(db, 'missions', id);
            await updateDoc(missionRef, { status: newStatus });

            setMissions(missions.map(m =>
                m.id === id ? { ...m, status: newStatus } : m
            ));
        } catch (error) {
            console.error("Error updating status: ", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new': return <span className="status-badge new"><AlertTriangle size={14} /> À Traiter</span>;
            case 'pending': return <span className="status-badge pending"><Clock size={14} /> En Cours</span>;
            case 'completed': return <span className="status-badge completed"><CheckCircle size={14} /> Terminé</span>;
            default: return null;
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'red';
            case 'medium': return 'orange';
            default: return 'green';
        }
    };

    const filteredMissions = filter === 'all' ? missions : missions.filter(m => m.status === filter);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1>Missions</h1>
                    <p className="subtitle">Gérez vos ordres de mission et expertises</p>
                </div>
                <div className="header-actions">
                    <div className="filter-group">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Toutes</button>
                        <button className={`filter-btn ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>À Traiter</button>
                        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>En Cours</button>
                        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Terminées</button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="loading-state">Chargement des missions...</div>
            ) : (
                <div className="missions-grid">
                    {filteredMissions.map(mission => (
                        <div key={mission.id} className="glass-panel mission-card">
                            <div className="mission-header">
                                <div className="mission-id">
                                    <FileText size={16} />
                                    {mission.id.slice(0, 8)}...
                                </div>
                                {getStatusBadge(mission.status)}
                            </div>

                            <div className="mission-content">
                                <h3 className="client-name">{mission.client}</h3>
                                <div className="vehicle-info">
                                    <Car size={16} />
                                    <span>{mission.vehicle}</span>
                                    <span className="plate">{mission.plate}</span>
                                </div>

                                <div className="info-row">
                                    <MapPin size={16} className="icon-muted" />
                                    <span>{mission.address}</span>
                                </div>

                                <div className="info-row">
                                    <Calendar size={16} className="icon-muted" />
                                    <span>{mission.date}</span>
                                    {mission.time && <span className="time-badge">{mission.time}</span>}
                                </div>

                                <div className="mission-desc">
                                    {mission.description}
                                </div>
                            </div>

                            <div className="mission-footer">
                                <div className={`urgency-indicator ${getUrgencyColor(mission.urgency)}`}>
                                    <div className="dot"></div>
                                    Urgence {mission.urgency === 'high' ? 'Haute' : mission.urgency === 'medium' ? 'Moyenne' : 'Basse'}
                                </div>

                                <div className="card-actions">
                                    {mission.status === 'new' ? (
                                        <>
                                            <button className="btn-action refuse" onClick={() => alert('Fonctionnalité de refus bientôt disponible')}>Refuser</button>
                                            <button className="btn-action accept" onClick={() => updateStatus(mission.id, 'pending')}>Accepter</button>
                                        </>
                                    ) : mission.status === 'pending' ? (
                                        <button className="btn-action view" onClick={() => updateStatus(mission.id, 'completed')}>
                                            Terminer <CheckCircle size={16} />
                                        </button>
                                    ) : (
                                        <button className="btn-action view">
                                            Voir le dossier <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .page-container { padding: 1rem 2rem; max-width: 1400px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .page-header h1 { font-size: 2rem; color: var(--color-primary); margin: 0 0 0.5rem 0; font-weight: 800; }
                .subtitle { color: var(--color-text-muted); font-size: 1.1rem; margin: 0; }
                
                .header-actions { display: flex; align-items: center; gap: 1rem; }

                .filter-group { display: flex; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 12px; gap: 4px; }
                .filter-btn { padding: 0.5rem 1rem; border: none; background: none; border-radius: 8px; font-weight: 600; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s; }
                .filter-btn.active { background: white; color: var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

                .missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
                
                .mission-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s; }
                .mission-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }

                .mission-header { padding: 1.25rem; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.4); }
                .mission-id { font-family: monospace; font-weight: 600; color: var(--color-text-muted); display: flex; align-items: center; gap: 0.5rem; }
                
                .status-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
                .status-badge.new { background: #fee2e2; color: #dc2626; }
                .status-badge.pending { background: #ffedd5; color: #ea580c; }
                .status-badge.completed { background: #dcfce7; color: #16a34a; }

                .mission-content { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
                .client-name { margin: 0; font-size: 1.2rem; color: var(--color-primary); font-weight: 700; }
                
                .vehicle-info { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--color-text); }
                .plate { background: #f3f4f6; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85rem; border: 1px solid #e5e7eb; }
                
                .info-row { display: flex; align-items: center; gap: 0.75rem; color: var(--color-text-muted); font-size: 0.95rem; }
                .icon-muted { color: #9ca3af; }
                .time-badge { background: #f3f4f6; padding: 0 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }

                .mission-desc { margin-top: 0.5rem; padding: 0.75rem; background: rgba(0,0,0,0.02); border-radius: 8px; font-size: 0.9rem; color: var(--color-text); font-style: italic; }

                .mission-footer { padding: 1rem 1.25rem; background: rgba(255,255,255,0.3); border-top: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
                
                .urgency-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; }
                .urgency-indicator .dot { width: 8px; height: 8px; border-radius: 50%; }
                .urgency-indicator.red { color: #dc2626; } .urgency-indicator.red .dot { background: #dc2626; box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2); }
                .urgency-indicator.orange { color: #ea580c; } .urgency-indicator.orange .dot { background: #ea580c; }
                .urgency-indicator.green { color: #16a34a; } .urgency-indicator.green .dot { background: #16a34a; }

                .card-actions { display: flex; gap: 0.5rem; }
                .btn-action { padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
                .btn-action.refuse { background: white; color: #ef4444; border: 1px solid #fee2e2; }
                .btn-action.refuse:hover { background: #fee2e2; }
                .btn-action.accept { background: var(--color-primary); color: white; }
                .btn-action.accept:hover { opacity: 0.9; transform: translateY(-1px); }
                .btn-action.view { background: white; color: var(--color-primary); border: 1px solid var(--glass-border); display: flex; align-items: center; gap: 0.5rem; }
                .btn-action.view:hover { border-color: var(--color-primary); }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { width: 100%; flex-direction: column; align-items: stretch; }
                    .filter-group { overflow-x: auto; }
                }
            `}</style>
        </div>
    );
};

export default PortalMissions;
