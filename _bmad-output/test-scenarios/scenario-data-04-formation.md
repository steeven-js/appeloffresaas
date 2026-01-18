# Scénario Data 04 : Formation - Sensibilisation Cybersécurité

**Type de besoin:** Formation
**Titre:** Programme de sensibilisation à la cybersécurité pour les agents

---

## Données Utilisateur à Fournir

### MODULE 1 : Informations Générales

```
Titre : Programme de sensibilisation à la cybersécurité pour les agents
Service : Direction des Systèmes d'Information - Cellule Sécurité
Responsable : Marc Lefebvre
Email : marc.lefebvre@departement-exemple.fr
Type : Formation
Urgence : Haute
```

---

### MODULE 2 : Contexte & Justification

**Données à communiquer à l'IA :**

```
On a eu 3 incidents de sécurité l'année dernière à cause d'erreurs humaines :
- Un agent a cliqué sur un lien de phishing et son compte a été compromis
- Un autre a branché une clé USB trouvée dans le parking
- Un responsable a envoyé des données personnelles en clair par mail
  à la mauvaise personne

L'ANSSI nous a fait un audit et recommande fortement de former tous nos agents.
Notre assurance cyber exige maintenant une preuve de sensibilisation pour
maintenir notre couverture.

Public cible : tous les agents qui utilisent un ordinateur, soit 850 personnes.
Profils très différents :
- Agents administratifs (60%) plutôt à l'aise avec l'informatique
- Travailleurs sociaux (25%) souvent sur le terrain avec des portables
- Agents techniques (15%) qui utilisent peu l'informatique mais ont un accès mail

Certains sont en télétravail partiel (2j/semaine).
On a aussi 50 élus qu'il faudrait sensibiliser (mais pas la même formation).

Objectifs pédagogiques - À la fin les agents doivent savoir :
- Reconnaître un mail de phishing et savoir quoi faire
- Créer et gérer des mots de passe robustes
- Protéger les données personnelles (RGPD)
- Réagir face à un incident (qui contacter, quoi ne pas faire)
- Sécuriser leur poste en télétravail
- Comprendre les risques des réseaux sociaux pro/perso
```

---

### MODULE 3 : Description du Besoin

**Données à communiquer à l'IA :**

```
Format de formation souhaité (dispositif mixte) :

1. Module e-learning de base (1h) que tout le monde doit suivre
   Contenu :
   - Les menaces actuelles (phishing, ransomware, ingénierie sociale)
   - Les bonnes pratiques mot de passe
   - La protection des données personnelles
   - Quiz de validation

2. Ateliers en présentiel (2h) par petits groupes de 15 personnes
   Contenu :
   - Démonstration live d'attaque de phishing
   - Atelier pratique : créer un mot de passe fort
   - Cas pratiques : que faire si...
   - Échanges et questions

3. Plateforme avec exercices de phishing simulés tous les mois
   - Emails de test envoyés chaque mois
   - Tableau de bord des résultats par direction
   - Formation de rattrapage pour ceux qui cliquent

4. Supports de communication (affiches, mémos) à diffuser dans les services

5. Session dédiée pour les élus (1h30) adaptée à leur rôle

Évaluation de l'efficacité :
- Quiz à la fin du e-learning (80% de bonnes réponses minimum)
- Attestation nominative de suivi pour chaque agent
- Taux de clic sur les campagnes de phishing (objectif : <5% à 6 mois)
- Tableau de bord mensuel pour le CODIR
- Rapport annuel pour l'assureur
```

---

### MODULE 4 : Contraintes

**Données à communiquer à l'IA :**

```
Contraintes organisationnelles :
- Les agents ne peuvent pas quitter leur poste plus de 2h d'affilée
- Certains sites sont éloignés (4 antennes territoriales à 30-50km)
- Le e-learning doit pouvoir se faire en plusieurs fois si besoin
- Période à éviter : juillet-août et vacances scolaires (effectifs réduits)
- Les ateliers doivent pouvoir se faire sur les 4 sites territoriaux

Exigences prestataire :
- Certification Qualiopi obligatoire (on a des fonds formation)
- Références dans le secteur public (au moins 3 collectivités)
- Formateurs certifiés en cybersécurité (CISSP, CEH ou équivalent)
- Plateforme e-learning et phishing propriétaire
- Support en français, réactivité sous 24h

Contraintes techniques :
- La plateforme e-learning doit fonctionner sur nos postes (pas d'install)
- Compatible avec notre proxy et nos règles de sécurité
- Authentification via notre SSO (Azure AD)
- Les données des agents (résultats, scores) restent en France
- Export des données possible pour nos propres stats

Planning souhaité :
- Déploiement plateforme : mars 2026
- Lancement e-learning : avril 2026
- Ateliers présentiels : avril - juin 2026
- Session élus : mai 2026
- Début campagnes phishing : mai 2026
- Fin de déploiement complet : 30 juin 2026
- Campagnes phishing sur 12 mois (jusqu'en avril 2027)
```

---

### MODULE 5 : Budget & Délais

```
Fourchette budgétaire : 45 000 - 60 000 EUR
Montant estimé : 52 000 EUR
Date de livraison : 30 juin 2026
Budget validé : Oui

Détail estimé :
- E-learning (850 licences + plateforme) : 15 000 €
- Ateliers présentiels (57 sessions) : 20 000 €
- Sessions élus (2 sessions) : 2 000 €
- Campagnes phishing (12 mois) : 10 000 €
- Kit communication : 5 000 €

Justification urgence :
Exigence de l'assureur pour le renouvellement de la police cyber en septembre 2026.
Audit ANSSI a identifié le facteur humain comme risque prioritaire.
Plusieurs incidents récents ont sensibilisé la Direction Générale.
```

---

## Résumé JSON (pour tests API)

```json
{
  "title": "Programme de sensibilisation à la cybersécurité pour les agents",
  "departmentName": "Direction des Systèmes d'Information - Cellule Sécurité",
  "contactName": "Marc Lefebvre",
  "contactEmail": "marc.lefebvre@departement-exemple.fr",
  "needType": "formation",
  "urgencyLevel": "high",
  "budgetRange": "45 000 - 60 000 EUR",
  "estimatedAmount": 52000,
  "desiredDeliveryDate": "2026-06-30",
  "budgetValidated": 1
}
```
