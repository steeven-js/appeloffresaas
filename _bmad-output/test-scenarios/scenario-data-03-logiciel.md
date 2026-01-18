# Scénario Data 03 : Logiciel - Acquisition Solution GRC

**Type de besoin:** Logiciel / Licence
**Titre:** Acquisition d'une solution de gestion de la relation citoyen (GRC)

---

## Données Utilisateur à Fournir

### MODULE 1 : Informations Générales

```
Titre : Acquisition d'une solution de gestion de la relation citoyen (GRC)
Service : Direction de la Relation Usagers
Responsable : Claire Moreau
Email : claire.moreau@ville-exemple.fr
Type : Logiciel
Urgence : Moyenne
```

---

### MODULE 2 : Contexte & Justification

**Données à communiquer à l'IA :**

```
Actuellement on gère les demandes des citoyens avec un mix d'outils pas adaptés :
- Excel pour suivre les réclamations (plus de 500 fichiers dispersés dans les services)
- Outlook pour les mails entrants (boîte générique contact@ville)
- Un vieux logiciel développé en interne en 2010 pour le suivi des courriers

Le tout n'est pas connecté, on perd des demandes, les citoyens se plaignent
qu'on ne leur répond jamais ou qu'on leur demande 3 fois les mêmes infos.

Problèmes quotidiens :
- On reçoit 15 000 sollicitations par an et on en perd environ 10%
- Délai moyen de réponse : 21 jours (l'objectif serait 5 jours)
- Pas de vision 360 du citoyen : quand il appelle on ne sait pas
  s'il a déjà fait une demande la semaine d'avant
- Les agents passent leur temps à ressaisir les infos d'un outil à l'autre
- Le maire reçoit des plaintes de citoyens qui se sentent ignorés
- On ne peut pas faire de statistiques fiables pour le rapport annuel

Objectifs :
- Un outil unique pour centraliser TOUTES les demandes (mail, tel, guichet, web)
- Une vue complète de l'historique de chaque citoyen
- Des workflows automatisés pour router les demandes aux bons services
- Un portail citoyen pour que les gens puissent suivre leurs demandes en ligne
- Des tableaux de bord pour piloter l'activité et mesurer les délais
- Une intégration avec notre SIG pour géolocaliser les signalements
```

---

### MODULE 3 : Description du Besoin

**Données à communiquer à l'IA :**

```
Fonctionnalités obligatoires :
- Gestion multicanal (mail, téléphone, guichet, formulaires web, réseaux sociaux)
- Création automatique de tickets depuis les mails entrants
- Base de données citoyen avec historique complet
- Workflows paramétrables par type de demande
- Affectation automatique selon des règles (territoire, thématique)
- Modèles de réponse et bibliothèque de courriers types
- Portail citoyen responsive (mobile/tablette)
- Tableaux de bord et indicateurs personnalisables
- Alertes sur dépassement de délais

Fonctionnalités souhaitées (nice to have) :
- Chatbot pour les questions fréquentes sur le portail
- Intégration calendrier pour prise de RDV en ligne
- Module de signature électronique intégré
- Analyse sémantique des mails pour catégorisation automatique
- Application mobile pour les agents terrain
- Génération de QR codes pour les signalements voirie

Volumétrie et utilisateurs :
- 45 agents utilisateurs (accueil, services techniques, état civil, urbanisme)
- 8 administrateurs fonctionnels
- 5 managers avec accès aux stats
- Volume : 15 000 sollicitations/an, objectif 20 000 avec le portail web
- Base citoyen : 85 000 habitants, environ 40 000 foyers

Exigences techniques :
- Solution SaaS obligatoire (on n'a pas l'infra pour héberger)
- Hébergement en France (données personnelles citoyens)
- Accessible depuis nos postes Windows 10/11 via navigateur web
- API REST pour intégration avec notre SIG (ArcGIS) et notre GED (Alfresco)
- SSO avec notre Active Directory
- Disponibilité 99,5% minimum
- Sauvegardes quotidiennes avec rétention 1 an
```

---

### MODULE 4 : Contraintes

**Données à communiquer à l'IA :**

```
Contraintes réglementaires :
- RGPD évidemment, c'est des données personnelles de citoyens
- Le prestataire doit pouvoir fournir un DPA (Data Processing Agreement)
- Hébergement certifié HDS serait un plus (demandes liées au CCAS)
- Accessibilité RGAA niveau AA minimum pour le portail citoyen
- Archivage légal des demandes : conservation 5 ans minimum

Contraintes de planning :
- Choix de la solution : avant fin avril 2026
- Démarrage du projet : mai 2026
- Go live portail interne : septembre 2026 (rentrée)
- Ouverture portail citoyen : janvier 2027
- Pas de go live en juillet-août (vacances) ni en décembre (période chargée)

Contraintes budgétaires et contractuelles :
- Budget total sur 3 ans : 120 000€ TTC max
- Première année (setup + licences) : 60 000€
- Années 2 et 3 (maintenance + licences) : 30 000€/an
- Contrat de 3 ans avec clause de réversibilité
- Récupération des données en format standard si sortie
- Pénalités en cas de non-respect du SLA
```

---

### MODULE 5 : Budget & Délais

```
Fourchette budgétaire : 100 000 - 120 000 EUR (sur 3 ans)
Montant estimé : 110 000 EUR
Date de livraison : 1er septembre 2026 (portail interne)
Budget validé : Oui

Justification :
Projet inscrit au plan de mandat. Budget voté au BP 2026.
Déploiement septembre = rentrée pour former les agents.
Portail citoyen janvier = annonce aux vœux du maire.
```

---

## Résumé JSON (pour tests API)

```json
{
  "title": "Acquisition d'une solution de gestion de la relation citoyen (GRC)",
  "departmentName": "Direction de la Relation Usagers",
  "contactName": "Claire Moreau",
  "contactEmail": "claire.moreau@ville-exemple.fr",
  "needType": "logiciel",
  "urgencyLevel": "medium",
  "budgetRange": "100 000 - 120 000 EUR",
  "estimatedAmount": 110000,
  "desiredDeliveryDate": "2026-09-01",
  "budgetValidated": 1
}
```
