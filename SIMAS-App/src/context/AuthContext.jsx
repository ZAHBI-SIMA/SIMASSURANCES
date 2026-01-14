import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // 0. Super Admin Override
                    if (currentUser.email === 'zahbigohore@gmail.com') {
                        setUser({
                            ...currentUser,
                            role: 'admin'
                        });
                        setLoading(false);
                        return;
                    }



                    // 1. Check if user is a defined Partner
                    const partnersRef = collection(db, 'partners');
                    const qPartner = query(partnersRef, where('email', '==', currentUser.email));
                    const partnerSnapshot = await getDocs(qPartner);

                    if (!partnerSnapshot.empty) {
                        const partnerDoc = partnerSnapshot.docs[0];
                        setUser({
                            ...currentUser,
                            role: 'partner',
                            partnerId: partnerDoc.id,
                            partnerType: partnerDoc.data().type,
                            ...partnerDoc.data()
                        });
                    } else {
                        // 2. Check if user is a Client (NEW)
                        const clientsRef = collection(db, 'clients');
                        const qClient = query(clientsRef, where('email', '==', currentUser.email));
                        const clientSnapshot = await getDocs(qClient);

                        if (!clientSnapshot.empty) {
                            const clientDoc = clientSnapshot.docs[0];
                            setUser({
                                ...currentUser,
                                role: 'client',
                                clientId: clientDoc.id,
                                ...clientDoc.data()
                            });
                        } else {
                            // 3. Assume Admin/Staff
                            setUser({
                                ...currentUser,
                                role: 'admin'
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setUser({ ...currentUser, role: 'unknown' });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        user,
        loading,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--glass-bg)',
                    color: 'var(--color-primary)'
                }}>
                    Chargement...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
