# Scénario Data 02 : Service - Prestation Conseil Architecture IT

**Type de besoin:** Prestation de service
**Titre:** Mission d'accompagnement à la modernisation du système d'information

---

## Données Utilisateur à Fournir

### MODULE 1 : Informations Générales

```
Titre : Mission d'accompagnement à la modernisation du système d'information
Service : Direction des Systèmes d'Information
Responsable : Thomas Durand
Email : thomas.durand@metropole-exemple.fr
Type : Service
Urgence : Haute
```

---

### MODULE 2 : Contexte & Justification

**Données à communiquer à l'IA :**

```
Notre métropole a un SI qui date de plus de 15 ans avec beaucoup d'applications
legacy. On a 3 gros applicatifs en COBOL sur mainframe qui gèrent les finances,
les RH et les marchés publics. Ces systèmes sont critiques mais plus personne
en interne ne maîtrise vraiment le COBOL et les experts partent à la retraite.

Le nouveau schéma directeur prévoit une modernisation complète sur 3 ans mais
on a besoin d'aide pour définir la cible et le plan de migration.

Les enjeux sont énormes :
- Risque de continuité de service si les experts COBOL partent sans transfert
- Les citoyens veulent des services en ligne modernes, nos applis ne suivent plus
- On paye une fortune en maintenance de mainframe (800K€/an)
- L'État nous pousse vers la dématérialisation totale d'ici 2027
- On veut pouvoir intégrer de l'IA dans nos processus mais c'est impossible actuellement
- Les agents sont frustrés par des outils vieillissants

On a quelques idées mais rien de formalisé :
- Migrer vers du cloud hybride (cloud souverain pour le régalien)
- Passer sur des progiciels du marché (finances, RH)
- Développer un portail citoyen moderne
- Mettre en place des API pour l'interopérabilité
On a besoin d'un regard extérieur expert pour valider ces orientations
et définir un plan de route réaliste.
```

---

### MODULE 3 : Description du Besoin

**Données à communiquer à l'IA :**

```
Mission en 4 phases :

1. Audit de l'existant :
   - Cartographier nos applis, les flux, les technos
   - Évaluer la dette technique
   - Interviews des utilisateurs clés

2. Définition de la cible :
   - Proposer une architecture modernisée
   - Plusieurs scénarios à comparer
   - Principes d'urbanisation

3. Plan de migration :
   - Définir le séquencement, les priorités, les dépendances
   - Estimer les charges et coûts
   - Définir les KPIs

4. Accompagnement au choix :
   - Benchmark des solutions du marché (ERP, SIRH, GRC)
   - Aide à la rédaction des cahiers des charges

Durée totale : 6 mois
Charge estimée : environ 150 jours/homme

Livrables attendus :
- Rapport d'audit complet avec cartographie applicative
- Document d'architecture cible avec schémas
- Analyse comparative des scénarios (coûts, risques, délais)
- Feuille de route détaillée avec jalons et KPIs
- Benchmark des solutions du marché
- Recommandations de gouvernance du projet
- Présentation au CODIR et aux élus

Équipe projet côté prestataire :
- 1 directeur de mission (pilotage global, interface CODIR)
- 1 architecte SI senior (minimum 15 ans d'expérience secteur public)
- 2 consultants senior urbanisation SI
- 1 expert legacy/modernisation (connaissance COBOL et migration)
```

---

### MODULE 4 : Contraintes

**Données à communiquer à l'IA :**

```
Exigences prestataire :
- Au moins 3 références de missions similaires dans des collectivités >100K habitants
- Certification ISO 27001 (accès à des données sensibles)
- Équipe disponible immédiatement (démarrage souhaité en février)
- Engagement sur la stabilité de l'équipe (pas de turn-over en cours de mission)
- Clause de confidentialité renforcée

Contraintes de calendrier :
- Démarrage : 1er février 2026
- Point d'étape mi-parcours fin mars pour présentation au CODIR
- Livraison finale impérative avant le 31 juillet 2026
- Présentation aux élus prévue en septembre
- Réunions de suivi hebdomadaires en présentiel
- 2-3 comités de pilotage avec élus à prévoir

Modalités d'exécution :
- Méthodologie structurée obligatoire (TOGAF ou équivalent)
- Travail sur site 3 jours/semaine minimum
- Badge et charte informatique obligatoires
- Tous les livrables en français, propriété de la Métropole
- Transfert de compétences vers l'équipe DSI
```

---

### MODULE 5 : Budget & Délais

```
Fourchette budgétaire : 150 000 - 200 000 EUR
Montant estimé : 175 000 EUR
Date de livraison : 31 juillet 2026
Budget validé : Oui

Justification urgence :
Transformation SI inscrite au schéma directeur validé par les élus.
Départs en retraite des experts COBOL prévus fin 2026.
Budget inscrit au BP 2026.
```

---

## Résumé JSON (pour tests API)

```json
{
  "title": "Mission d'accompagnement à la modernisation du système d'information",
  "departmentName": "Direction des Systèmes d'Information",
  "contactName": "Thomas Durand",
  "contactEmail": "thomas.durand@metropole-exemple.fr",
  "needType": "service",
  "urgencyLevel": "high",
  "budgetRange": "150 000 - 200 000 EUR",
  "estimatedAmount": 175000,
  "desiredDeliveryDate": "2026-07-31",
  "budgetValidated": 1
}
```
