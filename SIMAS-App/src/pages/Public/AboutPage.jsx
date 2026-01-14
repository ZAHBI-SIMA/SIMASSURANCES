import React from 'react';
import { Shield, Users, Target, Award, CheckCircle } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-slate-50 min-h-screen pt-20">
            {/* Hero Section */}
            <div className="bg-slate-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-900/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Notre Engagement</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Chez SIM ASSURANCES, nous réinventons l'assurance pour la rendre plus simple, plus transparente et plus proche de vous.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">
                            Notre Mission : <br />
                            <span className="text-primary">Protéger ce qui compte vraiment</span>
                        </h2>
                        <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                            <p>
                                Depuis notre création, nous avons un objectif clair : offrir des solutions d'assurance accessibles à tous, sans compromis sur la qualité de service.
                            </p>
                            <p>
                                Nous croyons que l'assurance ne doit pas être un casse-tête administratif, mais un filet de sécurité fiable sur lequel vous pouvez compter à tout moment. C'est pourquoi nous mettons la technologie au service de l'humain pour simplifier vos démarches.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-white rounded-3xl transform rotate-3 scale-105 -z-10"></div>
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="bg-blue-100 p-3 rounded-lg text-primary">
                                    <Target size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">Simplicité</h3>
                                    <p className="text-slate-600">Des contrats clairs et une gestion 100% digitale.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="bg-blue-100 p-3 rounded-lg text-primary">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">Proximité</h3>
                                    <p className="text-slate-600">Une équipe dédiée disponible pour vous accompagner.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg text-primary">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">Confiance</h3>
                                    <p className="text-slate-600">Une solidité financière et des partenaires reconnus.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us / Values */}
            <section className="bg-white py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Pourquoi nous choisir ?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Nous nous engageons à vous fournir bien plus qu'un simple contrat d'assurance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Expertise Locale",
                                desc: "Une connaissance approfondie des réalités et besoins locaux pour des offres adaptées.",
                                icon: <Award size={32} />
                            },
                            {
                                title: "Service Rapide",
                                desc: "Souscription immédiate et gestion des sinistres accélérée grâce à notre plateforme.",
                                icon: <Target size={32} />
                            },
                            {
                                title: "Transparence Totale",
                                desc: "Pas de frais cachés ou de clauses illisibles. Vous savez exactement ce que vous payez.",
                                icon: <CheckCircle size={32} />
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-8 rounded-2xl hover:shadow-lg transition-shadow border border-slate-100">
                                <div className="text-primary mb-4">{item.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-6">Prêt à nous rejoindre ?</h2>
                    <p className="text-blue-100 mb-8 text-lg">
                        Découvrez nos offres et trouvez la protection qui vous correspond en quelques clics.
                    </p>
                    <a href="/offres" className="inline-block bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">
                        Voir nos offres
                    </a>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
