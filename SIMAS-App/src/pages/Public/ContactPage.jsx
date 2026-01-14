import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'contacts'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'new'
            });
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Une erreur est survenue, veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const googleMapsUrl = "https://maps.app.goo.gl/WXhzanwdsGVxPEKG7?g_st=ac";

    return (
        <div className="bg-slate-50 min-h-screen pt-20">
            {/* Hero Section */}
            <div className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-4xl font-display font-bold mb-4">Contactez-nous</h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    Une question ? Un besoin spécifique ? Notre équipe est à votre écoute pour vous accompagner.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">Nos Coordonnées</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-primary">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Notre Adresse</h3>
                                        <p className="text-slate-600">Lot 195, Cité ATCI Rivera Faya</p>
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary font-medium hover:underline mt-1 inline-block"
                                        >
                                            Voir sur Google Maps
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-primary">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Téléphone</h3>
                                        <p className="text-slate-600">(+225) 27 24 36 46 61</p>
                                        <p className="text-sm text-slate-500">Du Lundi au Vendredi, 8h30 - 17h30</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-primary">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Email</h3>
                                        <p className="text-slate-600">info@simassurances.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Preview Embed */}
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm h-64 w-full overflow-hidden relative group">
                            <iframe
                                title="Map Localisation"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15433.805566986622!2d-17.4676!3d14.7408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDQ0JzI2LjkiTiAxN8KwMjgnMDMuNCJX!5e0!3m2!1sen!2ssn!4v1620000000000!5m2!1sen!2ssn"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                className="rounded-lg"
                            ></iframe>
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 z-10 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <span className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold text-slate-900">
                                    Ouvrir dans Google Maps
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">Envoyez-nous un message</h2>

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                                <CheckCircle size={20} />
                                Message envoyé avec succès ! Nous vous répondrons bientôt.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="L'objet de votre demande"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Envoi...' : (
                                    <>
                                        Envoyer le message <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
