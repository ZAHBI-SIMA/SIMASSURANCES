import { useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * Hook personnalisé pour gérer les tâches d'automatisation de l'application.
 * S'exécute une fois au montage du composant qui l'utilise.
 */
const useAutomation = () => {

    useEffect(() => {
        const checkAndConvertProspects = async () => {
            console.log('Automation: Vérification des prospects à convertir...');

            try {
                // 1. Récupérer tous les prospects avec le statut "Gagné"
                const q = query(collection(db, "prospects"), where("status", "==", "Gagné"));
                const querySnapshot = await getDocs(q);

                const now = new Date();
                const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

                let convertedCount = 0;

                for (const prospectDoc of querySnapshot.docs) {
                    const prospectData = prospectDoc.data();

                    // Vérifier si la date de mise à jour existe et est vieille de plus de 24h
                    // On gère le cas où updatedAt est un Timestamp Firebase ou une conversion de date
                    let updateTime;
                    if (prospectData.updatedAt?.toDate) {
                        updateTime = prospectData.updatedAt.toDate();
                    } else if (prospectData.updatedAt) {
                        updateTime = new Date(prospectData.updatedAt);
                    } else {
                        // Si pas de date, on ignore par sécurité ou on pourrait traiter différemment
                        continue;
                    }

                    const timeDiff = now.getTime() - updateTime.getTime();

                    if (timeDiff > TWENTY_FOUR_HOURS_MS) {
                        // --- CONVERSION ---

                        // 1. Préparer les données du client
                        const newClientData = {
                            name: prospectData.name || 'Inconnu',
                            email: prospectData.email || '',
                            phone: prospectData.phone || '',
                            // Si c'est une entreprise, type 'Entreprise', sinon 'Particulier' par défaut
                            type: prospectData.company ? 'Entreprise' : 'Particulier',
                            company: prospectData.company || '',
                            address: prospectData.address || '',
                            city: prospectData.city || '',
                            // Champs spécifiques client
                            status: 'Actif',
                            createdAt: Timestamp.now(),
                            convertedFromProspectId: prospectDoc.id,
                            notes: `Converti automatiquement depuis prospect le ${now.toLocaleDateString()}.\n${prospectData.notes || ''}`
                        };

                        // 2. Ajouter à la collection 'clients'
                        await addDoc(collection(db, "clients"), newClientData);

                        // 3. Supprimer de la collection 'prospects'
                        await deleteDoc(doc(db, "prospects", prospectDoc.id));

                        convertedCount++;
                        console.log(`Automation: Prospect ${prospectData.name} converti en Client.`);
                    }
                }

                if (convertedCount > 0) {
                    console.log(`Automation: ${convertedCount} prospects ont été convertis automatiquement.`);
                } else {
                    console.log('Automation: Aucun prospect à convertir pour le moment.');
                }

            } catch (error) {
                console.error("Automation Error:", error);
            }
        };

        // Exécuter la vérification immédiatement au chargement
        checkAndConvertProspects();

        // Optionnel: On pourrait mettre un intervalle si l'app reste ouverte longtemps
        // const interval = setInterval(checkAndConvertProspects, 60 * 60 * 1000); // Toutes les heures
        // return () => clearInterval(interval);

    }, []); // Tableau de dépendances vide = s'exécute une seule fois au montage

    return null; // Ce hook ne rend rien
};

export default useAutomation;
