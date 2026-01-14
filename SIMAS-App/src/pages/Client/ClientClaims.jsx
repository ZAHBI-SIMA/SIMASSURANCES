import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { AlertCircle, Calendar, MapPin, ArrowRight, Plus, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientClaims = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchClaims = async () => {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, 'claims'),
                    where('clientId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const fetchedClaims = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClaims(fetchedClaims);
            } catch (error) {
                console.error("Error fetching claims:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClaims();
    }, [user]);

    const filteredClaims = claims.filter(claim =>
        claim.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.incidentType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'ouvert':
            case 'open':
            case 'en cours':
                return 'bg-blue-100 text-blue-700';
            case 'en expertise':
                return 'bg-amber-100 text-amber-700';
            case 'clôturé':
            case 'closed':
            case 'validé':
                return 'bg-green-100 text-green-700';
            case 'rejeté':
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-800">Mes Sinistres</h1>
                    <p className="text-slate-500">Suivez l'état de vos dossiers d'indemnisation.</p>
                </div>
                <button
                    onClick={() => navigate('/client/claims/new')}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    Déclarer un sinistre
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher par numéro de dossier ou type..."
                    className="flex-1 outline-none text-slate-700 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Chargement de vos sinistres...</div>
            ) : filteredClaims.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClaims.map((claim) => (
                        <div key={claim.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <AlertCircle size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(claim.status)}`}>
                                    {claim.status || 'En attente'}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">{claim.incidentType || 'Sinistre'}</h3>
                            <p className="text-slate-500 text-sm mb-4">Dossier N° {claim.claimNumber || 'PENDING'}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>Survenu le {claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'Date inconnue'}</span>
                                </div>
                                {claim.location && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="truncate">{claim.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                                <button className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                    <FileText size={16} /> Documents
                                </button>
                                <button
                                    className="p-2 rounded-lg bg-slate-50 text-primary hover:bg-primary hover:text-white transition-colors"
                                    onClick={() => navigate(`/client/claims/${claim.id}`)}
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun sinistre</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Heureusement, vous n'avez aucun sinistre déclaré pour le moment.</p>
                    <button
                        onClick={() => navigate('/client/claims/new')}
                        className="text-red-600 font-medium hover:underline"
                    >
                        Déclarer un incident
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientClaims;
