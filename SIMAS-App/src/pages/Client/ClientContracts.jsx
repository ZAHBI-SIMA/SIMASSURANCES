import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FileText, Calendar, Shield, ArrowRight, Download, Search } from 'lucide-react';

const ClientContracts = () => {
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchContracts = async () => {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, 'contracts'),
                    where('clientId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const fetchedContracts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setContracts(fetchedContracts);
            } catch (error) {
                console.error("Error fetching contracts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, [user]);

    const filteredContracts = contracts.filter(contract =>
        contract.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'actif':
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'en attente':
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'résilié':
            case 'terminated':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-800">Mes Contrats</h1>
                    <p className="text-slate-500">Consultez et gérez vos polices d'assurance.</p>
                </div>
                <button className="bg-primary text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary-light transition-all flex items-center gap-2">
                    <Shield size={18} />
                    Souscrire une assurance
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher par numéro de police ou catégorie..."
                    className="flex-1 outline-none text-slate-700 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Contracts List */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Chargement de vos contrats...</div>
            ) : filteredContracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContracts.map((contract) => (
                        <div key={contract.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.status)}`}>
                                    {contract.status || 'Inconnu'}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">{contract.category || 'Assurance'}</h3>
                            <p className="text-slate-500 text-sm mb-4">Police N° {contract.policyNumber}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>Du {new Date(contract.startDate).toLocaleDateString()} au {new Date(contract.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Shield size={16} className="text-slate-400" />
                                    <span>{contract.coverageType || 'Tiers Simple'}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center gap-3">
                                <button className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                    <Download size={16} /> Attestation
                                </button>
                                <button className="p-2 rounded-lg bg-slate-50 text-primary hover:bg-primary hover:text-white transition-colors">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun contrat trouvé</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Vous n'avez pas encore souscrit de contrat d'assurance chez nous.</p>
                    <button className="text-primary font-medium hover:underline">Découvrir nos offres</button>
                </div>
            )}
        </div>
    );
};

export default ClientContracts;
