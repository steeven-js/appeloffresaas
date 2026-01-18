/**
 * Demand Templates by Sector
 * Pre-defined content structures for different types of demands
 */

export interface DemandTemplate {
  id: string;
  name: string;
  description: string;
  needType: string;
  icon: string;
  context: string;
  descriptionContent: string;
  constraints: string;
}

export const demandTemplates: DemandTemplate[] = [
  {
    id: "generique",
    name: "Générique",
    description: "Template par défaut pour tout type de demande",
    needType: "autre",
    icon: "FileText",
    context: `<h2>Contexte du projet</h2>
<p>[Décrivez le contexte général de votre demande : situation actuelle, enjeux, problématique à résoudre]</p>

<h2>Objectifs</h2>
<ul>
<li>Objectif principal : [À compléter]</li>
<li>Objectifs secondaires : [À compléter]</li>
</ul>

<h2>Périmètre</h2>
<p>[Définissez le périmètre de la demande : ce qui est inclus et ce qui est exclu]</p>`,
    descriptionContent: `<h2>Description du besoin</h2>
<p>[Décrivez en détail votre besoin]</p>

<h2>Spécifications fonctionnelles</h2>
<ul>
<li>[Spécification 1]</li>
<li>[Spécification 2]</li>
<li>[Spécification 3]</li>
</ul>

<h2>Livrables attendus</h2>
<ul>
<li>[Livrable 1]</li>
<li>[Livrable 2]</li>
</ul>`,
    constraints: `<h2>Contraintes techniques</h2>
<ul>
<li>[Contrainte technique 1]</li>
<li>[Contrainte technique 2]</li>
</ul>

<h2>Contraintes organisationnelles</h2>
<ul>
<li>[Contrainte organisationnelle 1]</li>
</ul>

<h2>Contraintes réglementaires</h2>
<ul>
<li>[Le cas échéant, listez les contraintes réglementaires applicables]</li>
</ul>`,
  },
  {
    id: "logiciel",
    name: "IT / Logiciel",
    description: "Acquisition ou développement de solutions informatiques",
    needType: "logiciel",
    icon: "Monitor",
    context: `<h2>Contexte SI</h2>
<p>[Décrivez l'environnement informatique actuel et les systèmes en place]</p>

<h2>Problématique</h2>
<p>[Expliquez les limites du système actuel ou le besoin métier non couvert]</p>

<h2>Objectifs de la solution</h2>
<ul>
<li>Améliorer [processus métier concerné]</li>
<li>Automatiser [tâches à automatiser]</li>
<li>Intégrer avec [systèmes existants]</li>
</ul>

<h2>Utilisateurs cibles</h2>
<p>[Nombre d'utilisateurs, profils, fréquence d'utilisation]</p>`,
    descriptionContent: `<h2>Fonctionnalités attendues</h2>

<h3>Fonctionnalités principales</h3>
<ul>
<li>[Fonctionnalité 1 - Description détaillée]</li>
<li>[Fonctionnalité 2 - Description détaillée]</li>
<li>[Fonctionnalité 3 - Description détaillée]</li>
</ul>

<h3>Fonctionnalités secondaires</h3>
<ul>
<li>[Fonctionnalité optionnelle 1]</li>
<li>[Fonctionnalité optionnelle 2]</li>
</ul>

<h2>Interfaces et intégrations</h2>
<ul>
<li>Intégration avec : [Systèmes à intégrer]</li>
<li>APIs requises : [Liste des APIs]</li>
<li>Format d'échange : [JSON, XML, etc.]</li>
</ul>

<h2>Exigences non-fonctionnelles</h2>
<ul>
<li>Performance : [Temps de réponse, charge attendue]</li>
<li>Disponibilité : [SLA attendu]</li>
<li>Ergonomie : [Critères UX]</li>
</ul>`,
    constraints: `<h2>Contraintes techniques</h2>
<ul>
<li>Environnement technique : [Stack technique existante]</li>
<li>Compatibilité navigateurs : [Chrome, Firefox, Edge, etc.]</li>
<li>Compatibilité mobile : [Responsive / Application native]</li>
<li>Infrastructure : [On-premise / Cloud / Hybride]</li>
</ul>

<h2>Sécurité et conformité</h2>
<ul>
<li>Authentification : [SSO, LDAP, etc.]</li>
<li>RGPD : [Exigences de conformité]</li>
<li>Données sensibles : [Classification des données]</li>
</ul>

<h2>Migration et reprise de données</h2>
<ul>
<li>Volume de données à migrer : [Estimation]</li>
<li>Format source : [Format actuel des données]</li>
<li>Historique à reprendre : [Période]</li>
</ul>

<h2>Formation et documentation</h2>
<ul>
<li>Formation utilisateurs : [Nombre de sessions]</li>
<li>Documentation technique : [Exigences]</li>
<li>Manuel utilisateur : [Format souhaité]</li>
</ul>`,
  },
  {
    id: "travaux",
    name: "BTP / Travaux",
    description: "Travaux de construction, rénovation ou aménagement",
    needType: "travaux",
    icon: "Hammer",
    context: `<h2>Description du site</h2>
<p>[Adresse et localisation du chantier]</p>
<p>[Description des locaux concernés : surface, étage, accès]</p>

<h2>État des lieux</h2>
<p>[Description de l'état actuel des locaux]</p>
<p>[Contraintes d'accès et de circulation]</p>

<h2>Objectifs des travaux</h2>
<ul>
<li>[Objectif principal des travaux]</li>
<li>[Améliorations attendues]</li>
</ul>

<h2>Occupation des locaux</h2>
<p>[Les locaux seront-ils occupés pendant les travaux ?]</p>
<p>[Horaires de travail possibles]</p>`,
    descriptionContent: `<h2>Nature des travaux</h2>

<h3>Lot 1 : [Nom du lot]</h3>
<ul>
<li>[Description des travaux]</li>
<li>[Quantités estimées]</li>
</ul>

<h3>Lot 2 : [Nom du lot]</h3>
<ul>
<li>[Description des travaux]</li>
<li>[Quantités estimées]</li>
</ul>

<h2>Plans et documents techniques</h2>
<p>[Liste des plans disponibles : plans architecte, plans techniques, etc.]</p>

<h2>Coordination</h2>
<ul>
<li>Maître d'œuvre : [Le cas échéant]</li>
<li>Coordinateur SPS : [Si requis]</li>
<li>Bureau de contrôle : [Si requis]</li>
</ul>`,
    constraints: `<h2>Contraintes réglementaires</h2>
<ul>
<li>Permis de construire : [Requis / Non requis / En cours]</li>
<li>Déclaration préalable : [Requis / Non requis]</li>
<li>ERP : [Catégorie et type si applicable]</li>
<li>Accessibilité PMR : [Exigences]</li>
</ul>

<h2>Contraintes techniques</h2>
<ul>
<li>Horaires de chantier autorisés : [Plages horaires]</li>
<li>Accès livraison : [Description]</li>
<li>Stockage matériaux : [Possibilités]</li>
<li>Réseaux existants : [Électricité, eau, etc.]</li>
</ul>

<h2>Sécurité</h2>
<ul>
<li>Plan de prévention : [Exigences]</li>
<li>Habilitations requises : [Liste]</li>
<li>EPI obligatoires : [Liste]</li>
</ul>

<h2>Garanties et assurances</h2>
<ul>
<li>Garantie décennale : Obligatoire</li>
<li>Garantie de parfait achèvement : 1 an</li>
<li>Assurance responsabilité civile : [Montant minimum]</li>
</ul>`,
  },
  {
    id: "service",
    name: "Prestation de service",
    description: "Services intellectuels, conseil, assistance technique",
    needType: "service",
    icon: "Users",
    context: `<h2>Contexte de la mission</h2>
<p>[Décrivez le contexte dans lequel s'inscrit cette prestation]</p>

<h2>Enjeux</h2>
<ul>
<li>[Enjeu stratégique 1]</li>
<li>[Enjeu opérationnel 2]</li>
</ul>

<h2>Organisation actuelle</h2>
<p>[Décrivez l'organisation actuelle et les ressources internes mobilisées]</p>

<h2>Périmètre d'intervention</h2>
<p>[Sites concernés, équipes impliquées, processus impactés]</p>`,
    descriptionContent: `<h2>Description de la prestation</h2>

<h3>Phase 1 : [Nom de la phase]</h3>
<ul>
<li>Objectif : [Objectif de la phase]</li>
<li>Activités : [Liste des activités]</li>
<li>Livrables : [Documents attendus]</li>
</ul>

<h3>Phase 2 : [Nom de la phase]</h3>
<ul>
<li>Objectif : [Objectif de la phase]</li>
<li>Activités : [Liste des activités]</li>
<li>Livrables : [Documents attendus]</li>
</ul>

<h2>Profil des intervenants</h2>
<ul>
<li>Chef de projet : [Expérience requise]</li>
<li>Consultant senior : [Compétences attendues]</li>
<li>Expert technique : [Domaine d'expertise]</li>
</ul>

<h2>Gouvernance</h2>
<ul>
<li>Comité de pilotage : [Fréquence]</li>
<li>Points d'avancement : [Fréquence]</li>
<li>Reporting : [Format et fréquence]</li>
</ul>`,
    constraints: `<h2>Modalités d'exécution</h2>
<ul>
<li>Lieu d'exécution : [Sur site / À distance / Hybride]</li>
<li>Horaires : [Plages horaires de disponibilité]</li>
<li>Outils collaboratifs : [Outils à utiliser]</li>
</ul>

<h2>Confidentialité</h2>
<ul>
<li>Accord de confidentialité : Obligatoire</li>
<li>Données sensibles : [Nature des données]</li>
<li>Restrictions d'accès : [Le cas échéant]</li>
</ul>

<h2>Propriété intellectuelle</h2>
<ul>
<li>Cession des droits : [Modalités]</li>
<li>Livrables : [Propriété du client]</li>
</ul>

<h2>Références exigées</h2>
<ul>
<li>Expérience similaire : [Nombre de références]</li>
<li>Secteur d'activité : [Secteurs privilégiés]</li>
<li>Taille de projet : [Comparable à ce projet]</li>
</ul>`,
  },
  {
    id: "formation",
    name: "Formation",
    description: "Actions de formation professionnelle",
    needType: "formation",
    icon: "GraduationCap",
    context: `<h2>Contexte de la demande</h2>
<p>[Expliquez pourquoi cette formation est nécessaire]</p>

<h2>Public cible</h2>
<ul>
<li>Nombre de participants : [Nombre]</li>
<li>Profils : [Fonctions des participants]</li>
<li>Niveau initial : [Débutant / Intermédiaire / Avancé]</li>
</ul>

<h2>Objectifs pédagogiques</h2>
<ul>
<li>À l'issue de la formation, les participants seront capables de :</li>
<li>[Objectif 1]</li>
<li>[Objectif 2]</li>
<li>[Objectif 3]</li>
</ul>`,
    descriptionContent: `<h2>Programme de formation</h2>

<h3>Module 1 : [Titre du module]</h3>
<ul>
<li>Durée : [X heures]</li>
<li>Contenu : [Thèmes abordés]</li>
<li>Méthode : [Théorie / Pratique / Cas pratiques]</li>
</ul>

<h3>Module 2 : [Titre du module]</h3>
<ul>
<li>Durée : [X heures]</li>
<li>Contenu : [Thèmes abordés]</li>
<li>Méthode : [Théorie / Pratique / Cas pratiques]</li>
</ul>

<h2>Modalités pédagogiques</h2>
<ul>
<li>Format : [Présentiel / Distanciel / Blended]</li>
<li>Supports : [Documents, vidéos, exercices]</li>
<li>Évaluation : [QCM, mise en situation, etc.]</li>
</ul>

<h2>Certification</h2>
<ul>
<li>Certification visée : [Le cas échéant]</li>
<li>Attestation de formation : Obligatoire</li>
</ul>`,
    constraints: `<h2>Contraintes organisationnelles</h2>
<ul>
<li>Dates souhaitées : [Période]</li>
<li>Durée totale : [X jours]</li>
<li>Horaires : [Journée complète / Demi-journée]</li>
<li>Lieu : [Intra-entreprise / Inter-entreprises / À distance]</li>
</ul>

<h2>Logistique</h2>
<ul>
<li>Salle de formation : [Fournie par le client / À prévoir]</li>
<li>Matériel informatique : [Fourni / À prévoir]</li>
<li>Restauration : [Incluse / Non incluse]</li>
</ul>

<h2>Exigences formateur</h2>
<ul>
<li>Expérience : [Années d'expérience minimum]</li>
<li>Certifications : [Certifications requises]</li>
<li>Références : [Formations similaires réalisées]</li>
</ul>

<h2>Qualité</h2>
<ul>
<li>Certification Qualiopi : [Souhaitée / Obligatoire]</li>
<li>Évaluation à chaud : Obligatoire</li>
<li>Évaluation à froid : [Délai]</li>
</ul>`,
  },
  {
    id: "fourniture",
    name: "Fourniture / Équipement",
    description: "Achat de matériel, équipements ou fournitures",
    needType: "fourniture",
    icon: "Package",
    context: `<h2>Contexte de l'achat</h2>
<p>[Décrivez le contexte : renouvellement, nouvelle acquisition, extension]</p>

<h2>Destination</h2>
<ul>
<li>Service destinataire : [Nom du service]</li>
<li>Lieu de livraison : [Adresse complète]</li>
<li>Utilisateurs finaux : [Profils et nombre]</li>
</ul>

<h2>Besoin</h2>
<p>[Expliquez précisément le besoin à couvrir]</p>

<h2>Existant</h2>
<p>[Décrivez l'équipement actuel si renouvellement]</p>`,
    descriptionContent: `<h2>Spécifications techniques</h2>

<h3>Article 1 : [Désignation]</h3>
<ul>
<li>Quantité : [Nombre]</li>
<li>Caractéristiques : [Détail des spécifications]</li>
<li>Marque/Modèle : [Si imposé ou équivalent]</li>
</ul>

<h3>Article 2 : [Désignation]</h3>
<ul>
<li>Quantité : [Nombre]</li>
<li>Caractéristiques : [Détail des spécifications]</li>
<li>Marque/Modèle : [Si imposé ou équivalent]</li>
</ul>

<h2>Conditionnement</h2>
<ul>
<li>Conditionnement souhaité : [Unité / Lot / Palette]</li>
<li>Emballage : [Exigences particulières]</li>
</ul>

<h2>Accessoires et consommables</h2>
<ul>
<li>[Liste des accessoires à inclure]</li>
<li>[Consommables de démarrage]</li>
</ul>`,
    constraints: `<h2>Contraintes de livraison</h2>
<ul>
<li>Délai de livraison : [X jours/semaines]</li>
<li>Lieu de livraison : [Adresse précise]</li>
<li>Horaires de réception : [Plages horaires]</li>
<li>Contraintes d'accès : [Ascenseur, escalier, etc.]</li>
</ul>

<h2>Installation et mise en service</h2>
<ul>
<li>Installation : [Incluse / Non incluse]</li>
<li>Mise en service : [Incluse / Non incluse]</li>
<li>Formation à l'utilisation : [Incluse / Non incluse]</li>
</ul>

<h2>Garanties</h2>
<ul>
<li>Garantie constructeur : [Durée minimum]</li>
<li>Extension de garantie : [Souhaitée / Non]</li>
<li>SAV : [Exigences de délai d'intervention]</li>
</ul>

<h2>Normes et certifications</h2>
<ul>
<li>Normes obligatoires : [CE, NF, etc.]</li>
<li>Certifications environnementales : [Le cas échéant]</li>
<li>Fiches de données de sécurité : [Si produits chimiques]</li>
</ul>`,
  },
  {
    id: "maintenance",
    name: "Maintenance / Support",
    description: "Contrat de maintenance ou support technique",
    needType: "maintenance",
    icon: "Wrench",
    context: `<h2>Équipements concernés</h2>
<p>[Liste et description des équipements à maintenir]</p>
<ul>
<li>Type d'équipement : [Description]</li>
<li>Marque / Modèle : [Références]</li>
<li>Année d'acquisition : [Date]</li>
<li>Localisation : [Sites concernés]</li>
</ul>

<h2>Historique</h2>
<p>[Contrat actuel, prestataire précédent, problèmes rencontrés]</p>

<h2>Criticité</h2>
<p>[Impact d'une panne sur l'activité]</p>`,
    descriptionContent: `<h2>Périmètre de maintenance</h2>

<h3>Maintenance préventive</h3>
<ul>
<li>Fréquence des visites : [Mensuelle / Trimestrielle / Semestrielle]</li>
<li>Opérations incluses : [Liste des opérations]</li>
<li>Pièces d'usure : [Incluses / Non incluses]</li>
</ul>

<h3>Maintenance corrective</h3>
<ul>
<li>Délai d'intervention : [GTI - Garantie de Temps d'Intervention]</li>
<li>Délai de remise en service : [GTR - Garantie de Temps de Rétablissement]</li>
<li>Plages horaires : [24/7 / Heures ouvrées / etc.]</li>
</ul>

<h2>Pièces détachées</h2>
<ul>
<li>Stock de pièces : [Sur site / Chez le prestataire]</li>
<li>Délai d'approvisionnement : [Maximum accepté]</li>
</ul>

<h2>Reporting</h2>
<ul>
<li>Rapport d'intervention : Après chaque intervention</li>
<li>Bilan périodique : [Fréquence]</li>
<li>Indicateurs de performance : [KPIs attendus]</li>
</ul>`,
    constraints: `<h2>Niveaux de service (SLA)</h2>
<ul>
<li>Disponibilité cible : [Pourcentage]</li>
<li>GTI : [Délai maximum d'intervention]</li>
<li>GTR : [Délai maximum de remise en service]</li>
<li>Pénalités : [En cas de non-respect]</li>
</ul>

<h2>Contraintes d'intervention</h2>
<ul>
<li>Horaires d'intervention : [Plages autorisées]</li>
<li>Habilitations requises : [Liste]</li>
<li>Accès au site : [Modalités]</li>
<li>Confidentialité : [Exigences]</li>
</ul>

<h2>Exigences techniques</h2>
<ul>
<li>Certifications prestataire : [Certifications requises]</li>
<li>Proximité géographique : [Distance maximum]</li>
<li>Techniciens dédiés : [Souhaité / Non]</li>
</ul>

<h2>Durée et renouvellement</h2>
<ul>
<li>Durée du contrat : [X ans]</li>
<li>Tacite reconduction : [Oui / Non]</li>
<li>Préavis de résiliation : [Délai]</li>
</ul>`,
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DemandTemplate | undefined {
  return demandTemplates.find((t) => t.id === id);
}

/**
 * Get template by need type
 */
export function getTemplateByNeedType(needType: string): DemandTemplate {
  const template = demandTemplates.find((t) => t.needType === needType);
  return template ?? demandTemplates[0]!; // Return generic template as fallback
}

/**
 * Get all templates for selection
 */
export function getAllTemplates(): DemandTemplate[] {
  return demandTemplates;
}
