import React from 'react';
import { 
  WrenchIcon, 
  CalendarCheckIcon, 
  UserIcon 
} from 'lucide-react';

const benefits = [
  {
    icon: WrenchIcon,
    title: 'Catalogue d\'Outils Complet',
    description: 'Parcourez une large gamme d\'outils avec des descriptions détaillées, des images et un statut de disponibilité en temps réel.',
    details: [
      'Recherchez et filtrez les outils facilement',
      'Consultez les catégories et spécifications des outils',
      'Vérifiez la disponibilité des outils instantanément'
    ]
  },
  {
    icon: CalendarCheckIcon,
    title: 'Système de Réservation Flexible',
    description: 'Réservez des outils pour des dates et heures spécifiques avec un processus de réservation convivial.',
    details: [
      'Prévenir les réservations en chevauchement',
      'Modifier ou annuler des réservations',
      'Recevoir des confirmations de réservation'
    ]
  },
  {
    icon: UserIcon,
    title: 'Gestion Sécurisée des Utilisateurs',
    description: 'Créez et gérez votre profil avec des fonctionnalités d\'authentification et de protection de la vie privée robustes.',
    details: [
      'Inscription et connexion faciles',
      'Protection sécurisée des données utilisateur',
      'Fonctionnalité de réinitialisation de mot de passe'
    ]
  }
];

export default function Benefits() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Comment la Bricothèque Aide les Résidents du Massif de Bauges
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <span className="text-blue-600 mr-4" role="img" aria-label={benefit.title}>
                  {benefit.title === 'Catalogue d\'Outils Complet' ? '🛠️' : benefit.title === 'Système de Réservation Flexible' ? '📅' : '👤'}
                </span>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{benefit.description}</p>
              <ul className="list-disc list-inside text-gray-500">
                {benefit.details.map((detail, detailIndex) => (
                  <li key={detailIndex}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
