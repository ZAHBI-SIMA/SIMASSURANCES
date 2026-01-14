import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import logo from "@/assets/logo.png";

const ClientRegister = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/client';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Auth User
            const cleanEmail = formData.email.trim().toLowerCase();
            const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
            const user = userCredential.user;

            // 2. Create Client Document in Firestore
            // Using email as ID or User UID as ID? UID is better for security/consistency.
            await setDoc(doc(db, 'clients', user.uid), {
                uid: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: cleanEmail,
                phone: formData.phone,
                role: 'client',
                createdAt: serverTimestamp(),
                status: 'active'
            });

            // 3. Redirect
            navigate(redirectUrl);

        } catch (err) {
            console.error("Registration Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Cet email est déjà utilisé.");
            } else if (err.code === 'auth/weak-password') {
                setError("Le mot de passe doit contenir au moins 6 caractères.");
            } else {
                setError("Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white rounded-2xl shadow-xl flex flex-col">
                    <div className="p-6 pb-0 text-center">
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="flex flex-row items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                                <img src={logo} alt="SIMAS Logo" className="h-14 w-auto object-contain" />
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="font-display font-bold text-3xl tracking-wide text-primary">SIM</span>
                                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-slate-500">ASSURANCES</span>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-xl font-display font-bold text-slate-800">Créer un compte</h2>
                        <p className="text-slate-500 text-xs mt-1">Rejoignez-nous pour gérer vos contrats</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nom</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="vous@exemple.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="+225..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Confirmer Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-8"
                            >
                                {loading ? 'Création...' : (
                                    <>
                                        Créer mon compte <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            Vous avez déjà un compte ? <button onClick={() => navigate('/login')} className="text-blue-600 font-medium hover:underline">Se connecter</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientRegister;
