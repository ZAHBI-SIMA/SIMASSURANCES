import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant de Route Protégée avec vérification de rôle
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Le composant enfant à rendre
 * @param {string[]} [props.allowedRoles] - Tableau des rôles autorisés (ex: ['admin', 'partner'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Optionnel : Afficher un spinner de chargement ici si AuthProvider ne le fait pas déjà
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // 1. Si l'utilisateur n'est pas connecté, redirection vers Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si des rôles spécifiques sont requis et que l'utilisateur n'a pas le bon rôle
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            // Redirection intelligente basée sur le rôle de l'utilisateur
            if (user.role === 'partner') {
                return <Navigate to="/partner-portal" replace />;
            } else if (user.role === 'admin') {
                return <Navigate to="/" replace />;
            } else {
                // Fallback pour rôle inconnu
                return <Navigate to="/login" replace />;
            }
        }
    }

    // Si tout est bon, on affiche le contenu
    return children;
};

export default ProtectedRoute;
