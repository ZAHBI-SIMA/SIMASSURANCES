import React, { useState } from 'react';
import { Key, Copy, Check, Terminal, ExternalLink, Shield } from 'lucide-react';

const ApiDocs = () => {
    const [apiKey, setApiKey] = useState('sk_live_51M...');
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const handleGenerateKey = () => {
        const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 24);
        setApiKey(newKey);
        setShowKey(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="page-container">
            <div className="header-section glass-panel">
                <div className="icon-badge">
                    <Terminal size={24} />
                </div>
                <div>
                    <h1>API Distributeur</h1>
                    <p className="subtitle">Intégrez nos produits d'assurance directement dans vos applications.</p>
                </div>
            </div>

            <div className="content-grid">
                <div className="main-col">
                    <div className="glass-panel section">
                        <div className="section-header">
                            <Shield size={20} className="text-primary" />
                            <h2>Clés API</h2>
                        </div>
                        <p className="desc">
                            Utilisez cette clé pour authentifier vos requêtes. Gardez-la secrète !
                            Ne la partagez jamais dans du code côté client (navigateur).
                        </p>

                        <div className="api-key-box">
                            <div className="key-display">
                                <span className={showKey ? 'key-text' : 'key-text blur'}>
                                    {apiKey}
                                </span>
                            </div>
                            <div className="key-actions">
                                <button className="btn-icon" onClick={copyToClipboard} title="Copier">
                                    {copied ? <Check size={18} color="green" /> : <Copy size={18} />}
                                </button>
                                <button className="btn-primary sm" onClick={handleGenerateKey}>
                                    {showKey ? 'Régénérer' : 'Révéler la clé'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel section">
                        <h2>Documentation Rapide</h2>
                        <div className="endpoint-list">
                            <div className="endpoint-item">
                                <span className="method get">GET</span>
                                <code className="url">/v1/products</code>
                                <span className="summary">Lister les produits disponibles</span>
                            </div>
                            <div className="endpoint-item">
                                <span className="method post">POST</span>
                                <code className="url">/v1/quotes</code>
                                <span className="summary">Créer un devis</span>
                            </div>
                            <div className="endpoint-item">
                                <span className="method get">GET</span>
                                <code className="url">/v1/contracts/{'{id}'}</code>
                                <span className="summary">Récupérer un contrat</span>
                            </div>
                        </div>
                        <div className="docs-footer">
                            <button className="btn-secondary">
                                <ExternalLink size={16} /> Documentation Complète (Swagger)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .page-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
                .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
                
                .header-section { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
                .icon-badge { width: 56px; height: 56px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header-section h1 { margin: 0; font-size: 1.8rem; color: var(--color-text); }
                .subtitle { margin: 0.5rem 0 0; color: var(--color-text-muted); }

                .content-grid { display: grid; gap: 2rem; }
                .section { margin-bottom: 2rem; }
                .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
                .section h2 { font-size: 1.2rem; margin: 0 0 1rem 0; }
                .desc { color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }

                .api-key-box { background: #1e293b; border-radius: 12px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
                .key-text { color: #e2e8f0; font-family: 'Fira Code', monospace; letter-spacing: 0.5px; }
                .key-text.blur { filter: blur(4px); user-select: none; }
                
                .key-actions { display: flex; gap: 0.5rem; }
                .btn-icon { background: rgba(255,255,255,0.1); border: none; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; transition: background 0.2s; }
                .btn-icon:hover { background: rgba(255,255,255,0.2); }
                .btn-primary.sm { padding: 0.5rem 1rem; font-size: 0.85rem; }

                .endpoint-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .endpoint-item { display: flex; align-items: center; gap: 1rem; background: white; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); }
                .method { font-size: 0.75rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; min-width: 50px; text-align: center; }
                .method.get { background: #dcfce7; color: #166534; }
                .method.post { background: #dbeafe; color: #1e40af; }
                .url { font-family: 'Fira Code', monospace; font-size: 0.9rem; color: #475569; }
                .summary { font-size: 0.9rem; color: #94a3b8; margin-left: auto; }

                .docs-footer { margin-top: 1.5rem; text-align: right; }
                .btn-secondary { background: white; border: 1px solid var(--glass-border); padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; font-size: 0.9rem; margin-left: auto; }
                
                .text-primary { color: var(--color-primary); }
            `}</style>
        </div>
    );
};

export default ApiDocs;
