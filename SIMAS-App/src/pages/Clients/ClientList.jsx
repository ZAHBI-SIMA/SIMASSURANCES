import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const ClientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch clients from Firestore
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    (filterType === 'Tous' || client.type === filterType) &&
    (client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header-actions">
        <div>
          <h1>Clients</h1>
          <p className="subtitle">Gérez votre portefeuille clients et prospects</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/clients/new')}>
          <Plus size={18} />
          Nouveau Client
        </button>
      </div>

      <div className="glass-panel filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['Tous', 'Particulier', 'Entreprise'].map((type) => (
            <button
              key={type}
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Chargement des clients...</div>
        ) : filteredClients.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Aucun client trouvé.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom / Raison Sociale</th>
                <th>Type</th>
                <th>Coordonnées</th>
                <th>Localisation</th>
                <th>Contrats</th>
                <th>Statut</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} onClick={() => navigate(`/clients/${client.id}`)} className="clickable-row">
                  <td>
                    <div className="client-name-cell">
                      <div className="avatar-initials" style={{ backgroundColor: client.type === 'Entreprise' ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{client.name}</div>
                        <div className="text-muted text-sm">ID: CL-{2025000 + (parseInt(client.id) || 0)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${client.type === 'Entreprise' ? 'badge-purple' : 'badge-blue'}`}>
                      {client.type}
                    </span>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item"><Mail size={12} /> {client.email}</div>
                      <div className="contact-item"><Phone size={12} /> {client.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div className="location-info">
                      <MapPin size={12} /> {client.city}
                    </div>
                  </td>
                  <td>
                    <div className="contracts-count">
                      {client.contracts ? client.contracts.length : 0}
                    </div>
                  </td>
                  <td>
                    <span className={`status-dot ${client.status === 'Actif' ? 'status-active' : client.status === 'Prospect' ? 'status-pending' : 'status-warning'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                    <button className="action-btn" title="Voir">
                      <Eye size={16} />
                    </button>
                    <button className="action-btn" title="Éditer">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .page-container { padding: 1rem 2rem; }
        .page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .filters-bar { padding: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .search-input-wrapper { position: relative; width: 300px; }
        .filter-group { display: flex; gap: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.25rem; border-radius: var(--radius-md); }
        .filter-btn { border: none; background: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--color-text-muted); transition: all 0.2s; }
        .filter-btn.active { background: white; color: var(--color-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .table-container { overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 1rem 1.5rem; font-size: 0.8rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--glass-border); }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.02); font-size: 0.95rem; }
        .clickable-row { cursor: pointer; transition: background 0.1s; }
        .clickable-row:hover { background: rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.03); }
        .client-name-cell { display: flex; align-items: center; gap: 1rem; }
        .avatar-initials { width: 40px; height: 40px; border-radius: 10px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .text-sm { font-size: 0.8rem; }
        .text-muted { color: var(--color-text-muted); }
        .font-bold { font-weight: 600; }
        .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .badge-blue { background: hsla(220, 70%, 50%, 0.1); color: var(--color-primary); }
        .badge-purple { background: hsla(270, 70%, 50%, 0.1); color: purple; }
        .contact-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .contact-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--color-text-muted); }
        .location-info { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text); }
        .contracts-count { font-weight: 600; text-align: center; width: 30px; height: 30px; background: rgba(0,0,0,0.05); border-radius: 50%; line-height: 30px; }
        .status-dot { display: inline-flex; align-items: center; }
        .status-dot::before { content: ''; width: 8px; height: 8px; border-radius: 50%; margin-right: 0.5rem; }
        .status-active::before { background: var(--color-success); }
        .status-active { color: var(--color-success); }
        .status-pending::before { background: var(--color-text-muted); }
        .status-pending { color: var(--color-text-muted); }
        .status-warning::before { background: orange; }
        .status-warning { color: orange; }
        .actions-col { text-align: right; }
        .action-btn { background: none; border: none; cursor: pointer; color: var(--color-text-muted); padding: 0.5rem; border-radius: 50%; transition: all 0.2s; }
        .action-btn:hover { background: rgba(0,0,0,0.05); color: var(--color-primary); }
      `}</style>
    </div>
  );
};

export default ClientList;
