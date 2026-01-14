import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, FileText, AlertCircle, Clock } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';

const ClientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        contracts: 0,
        claims: 0,
        pendingPayments: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.uid) return;
            const uid = user.uid; // Ensure we use the Auth UID which links to the client doc

            try {
                // 1. Fetch Contracts
                const contractsRef = collection(db, 'contracts');
                const contractsQuery = query(
                    contractsRef,
                    where('clientId', '==', uid),
                    orderBy('createdAt', 'desc')
                );
                const contractsSnapshot = await getDocs(contractsQuery);
                const contractsData = contractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'contract' }));

                // 2. Fetch Claims
                const claimsRef = collection(db, 'claims');
                const claimsQuery = query(
                    claimsRef,
                    where('clientId', '==', uid),
                    orderBy('createdAt', 'desc')
                );
                const claimsSnapshot = await getDocs(claimsQuery);
                const claimsData = claimsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'claim' }));

                // 3. Calculate Stats
                const activeContracts = contractsData.filter(c => c.status === 'Actif' || c.status === 'active').length;
                const activeClaims = claimsData.filter(c => c.status !== 'Clôturé' && c.status !== 'Rejeté' && c.status !== 'closed' && c.status !== 'rejected').length;

                setStats({
                    contracts: activeContracts, // Or total count: contractsData.length
                    claims: activeClaims,
                    pendingPayments: 0 // Placeholder until invoices module is ready
                });

                // 4. Activity Feed
                const allActivity = [...contractsData, ...claimsData]
                    .sort((a, b) => {
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                        return dateB - dateA;
                    })
                    .slice(0, 5)
                    .map(item => {
                        const dateObj = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
                        const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

                        let text = '';
                        if (item.type === 'contract') {
                            text = `Nouveau contrat : ${item.policyNumber || 'Assurance'} (${item.category || 'Auto'})`;
                        } else {
                            text = `Sinistre déclaré : ${item.claimNumber || 'Dossier'} - ${item.status || 'En cours'}`;
                        }

                        return {
                            id: item.id,
                            type: item.type,
                            text: text,
                            date: formattedDate
                        };
                    });

                setRecentActivity(allActivity);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchStats();
    }, [user]);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold font-display text-slate-800">
                    Bonjour, {user?.firstName}
                </h1>
                <p className="text-slate-500">Bienvenue sur votre espace personnel.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Contrats actifs</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.contracts}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Sinistres en cours</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.claims}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Paiements à venir</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.pendingPayments}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Activité récente</h2>
                <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'contract' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {item.type === 'contract' ? <FileText size={18} /> : <AlertCircle size={18} />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{item.text}</p>
                                    <p className="text-xs text-slate-400">{item.date}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm">Aucune activité récente.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
