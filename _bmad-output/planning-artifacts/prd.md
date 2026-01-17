---
stepsCompleted:
  [
    step-01-init,
    step-02-discovery,
    step-03-success,
    step-04-journeys,
    step-05-domain-skipped,
    step-06-innovation,
    step-07-project-type,
    step-08-scoping,
    step-09-functional,
    step-10-nonfunctional,
    step-11-polish,
    step-12-complete,
  ]
workflowComplete: true
completedAt: 2026-01-16
inputDocuments:
  - product-brief-appeloffresaas-2026-01-16.md
  - brainstorming-session-2026-01-16.md
  - problematique-ao-administratifs.md
workflowType: "prd"
documentCounts:
  briefs: 1
  brainstorming: 1
  research: 0
  projectDocs: 0
projectType: greenfield
classification:
  projectType: saas_b2b
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - appeloffresaas

**Author:** Steeven
**Date:** 2026-01-16

---

## Executive Summary

### Vision

**appeloffresaas** est un agent IA conversationnel qui transforme la préparation des appels d'offres publics pour les PME et consultants indépendants en France. En automatisant le parsing des règlements de consultation, en mémorisant les données entreprise et en guidant la rédaction, la plateforme réduit le temps de préparation de 75% (de 30-50h à 7-11h par AO).

### Différenciateur Principal

Aucune solution existante ne combine :

1. **Parsing automatique** des règlements de consultation (RC) pour générer une checklist des pièces requises
2. **Mémoire entreprise évolutive** qui s'enrichit à chaque AO et ne redemande jamais ce qu'elle sait
3. **Agent IA spécialisé** dans le vocabulaire et les processus des marchés publics français

### Utilisateurs Cibles

| Persona                | Profil                     | Volume AO   |
| ---------------------- | -------------------------- | ----------- |
| Consultant indépendant | 1 personne, CA 80-200k€    | 6-10 AO/an  |
| PME                    | 5-50 salariés, CA 500k-5M€ | 15-40 AO/an |
| Cabinet conseil        | Équipe dédiée AO           | 30-50 AO/an |

### Métriques Clés

- **North Star :** 25 heures économisées par utilisateur actif par mois
- **MVP Success :** 50 users actifs M3, <12h/AO, 0% élimination administrative
- **Business M12 :** 1000 users, 30k€ MRR, <5% churn

---

## Success Criteria

### User Success

**Métrique Principale : Temps Économisé par AO**

| Indicateur                     | Avant  | Objectif MVP | Objectif V2 |
| ------------------------------ | ------ | ------------ | ----------- |
| Temps total par AO             | 30-50h | 7-11h        | 5-8h        |
| Parsing règlement consultation | 3-5h   | 5 min        | 2 min       |
| Collecte documents             | 8-12h  | 1-2h         | 30 min      |
| Rédaction/adaptation           | 15-25h | 5-8h         | 4-6h        |
| Vérification conformité        | 3-5h   | 15 min       | 10 min      |

**Indicateur de succès :** Un utilisateur complète son 2ème AO en moins de 10 heures.

**Élimination des Erreurs Administratives**

| Indicateur                            | Baseline   | Objectif |
| ------------------------------------- | ---------- | -------- |
| Dossiers rejetés pour pièce manquante | 15-20%     | 0%       |
| Documents expirés non détectés        | Fréquent   | 0        |
| Incohérences dans le dossier          | Régulières | 0        |

**Réutilisation des Données**

| Indicateur                    | M3  | M12 |
| ----------------------------- | --- | --- |
| Taux de pré-remplissage moyen | 40% | 70% |
| Profil entreprise complété    | 60% | 90% |
| Documents dans coffre-fort    | 5+  | 15+ |

### Business Success

**Phase 1 : Validation (M1-M3)**

| Objectif           | Cible                  |
| ------------------ | ---------------------- |
| Early Adopters     | 50 utilisateurs actifs |
| Rétention M1→M2    | 60%                    |
| NPS                | > 40                   |
| Temps moyen par AO | < 12h                  |

**Phase 2 : Croissance (M4-M12)**

| Objectif              | M6     | M12     |
| --------------------- | ------ | ------- |
| Utilisateurs actifs   | 200    | 1 000   |
| AO complétés/mois     | 100    | 800     |
| MRR                   | 5 000€ | 30 000€ |
| Conversion trial→paid | 15%    | 25%     |
| Churn mensuel         | <8%    | <5%     |

**Phase 3 : Scale (Année 2)**

| Objectif                       | Cible    |
| ------------------------------ | -------- |
| Utilisateurs actifs            | 5 000    |
| ARR                            | 500 000€ |
| Part de marché PME/Consultants | 5%       |

### Technical Success

| KPI                  | Définition                      | Cible      |
| -------------------- | ------------------------------- | ---------- |
| Uptime               | Disponibilité plateforme        | > 99.5%    |
| Temps réponse IA     | Latence moyenne chat            | < 3s       |
| Précision parsing RC | Pièces correctement identifiées | > 95%      |
| Tickets support/user | Demandes aide par user actif    | < 0.5/mois |

### Measurable Outcomes

**North Star Metric : "Heures économisées par utilisateur par mois"**

Cette métrique capture :

- Valeur créée pour l'utilisateur (temps = argent pour PME/consultants)
- Engagement produit (plus d'AO = plus d'heures économisées)
- Qualité du produit (meilleure IA = plus d'économie)
- Croissance business (plus d'heures économisées = plus de recommandations)

**Cible :** 25 heures économisées par utilisateur actif par mois

---

## Product Scope

### MVP - Minimum Viable Product

**Critères de Validation Go/No-Go pour V2 :**

| Critère                | Seuil                           | Mesure                      |
| ---------------------- | ------------------------------- | --------------------------- |
| Adoption               | 50 users actifs en 3 mois       | Comptes avec 1+ AO complété |
| Rétention              | 60% reviennent pour 2ème AO     | Cohorte M1→M2               |
| Temps économisé        | Moyenne < 12h par AO            | Tracking temps in-app       |
| Zéro élimination admin | 0% rejetés pour pièce manquante | Feedback users              |
| NPS                    | Score > 40                      | Enquête post-AO             |
| Parsing précision      | > 90% pièces identifiées        | Validation échantillon      |

**Fonctionnalités MVP (P1) :**

- Agent IA conversationnel avec chat guidé hybride
- Profil entreprise évolutif + coffre-fort documents
- Parsing règlement consultation
- Checklist conformité automatique
- Preview interactive + édition inline
- Export PDF/Word/ZIP structuré
- Interface 3 colonnes

### Growth Features (Post-MVP)

**V2 - Collaboration Client (M6-M12) :**

- Partage sécurisé avec client pour validation
- Workflow approbation section par section
- Annotations et échanges intégrés
- Historique des versions

**Fonctionnalités P2 :**

- Profondeur adaptative (expert vs novice)
- Capture intelligente post-AO
- Détection obsolescence documents
- Indicateur de confiance par section
- Import intelligent anciens AO

### Vision (Future)

**V3 - Intelligence Avancée (Année 2) :**

- IA générative pour rédaction sections complètes
- Benchmark avec AO gagnants du même secteur
- Prédiction taux de succès avant soumission

**V4 - Plateforme & Écosystème (Année 2-3) :**

- Intégration directe plateformes marchés publics (PLACE, AWS)
- API pour intégration ERP/CRM
- Marketplace templates par secteur
- Veille automatique nouveaux AO pertinents

**Vision Long Terme :**
Devenir le co-pilote indispensable de toute PME qui répond aux marchés publics en France, puis en Europe.

---

## User Journeys

### Journey 1 : Marc - Premier AO avec l'application (Happy Path)

**Persona :** Marc, 42 ans, consultant en transformation digitale. 8 ans d'expérience, travaille seul. CA 120k€, objectif 180k€. Répond à 6-8 AO/an, en gagne 1-2.

**Situation de départ :**
Marc découvre un AO de conseil en transformation digitale pour un hôpital régional. Montant estimé : 85k€. Délai : 12 jours. Il est vendredi 18h, le RC fait 142 pages. Habituellement, il renoncerait — délai trop court pour tout préparer seul.

**Le parcours :**

| Étape             | Action                                                 | Émotion             | Ce qu'il voit                             |
| ----------------- | ------------------------------------------------------ | ------------------- | ----------------------------------------- |
| Découverte        | Voit une pub LinkedIn "Gagnez 20h par AO"              | Curiosité sceptique | Landing page avec démonstration           |
| Inscription       | Crée un compte, choisit "Démarrage rapide"             | Espoir prudent      | Interface 3 colonnes épurée               |
| Upload RC         | Dépose le PDF du règlement de consultation             | Attente anxieuse    | Barre de progression du parsing           |
| Magie du parsing  | L'IA affiche la checklist des 31 pièces en 45 secondes | Surprise positive   | Liste structurée avec catégories          |
| Profil entreprise | Répond aux questions de l'IA sur son entreprise        | Flow productif      | Questions hybrides, pré-suggestions       |
| Références        | Décrit 3 missions similaires via chat guidé            | Concentration       | L'IA reformule et structure               |
| Méthodologie      | Adapte son approche au contexte hospitalier            | Créativité          | Suggestions contextuelles "secteur santé" |
| Preview live      | Voit le document se construire section par section     | Satisfaction        | Indicateurs par section                   |
| Vérification      | Checklist finale : 31/31 pièces présentes              | Soulagement         | Tout est vert, PDF prêts                  |
| Export            | Télécharge le ZIP structuré                            | Confiance           | Dossier organisé par sous-dossiers        |
| Soumission        | Dépose sur la plateforme marchés publics               | Fierté              | Samedi midi — 10h de travail total        |

**Moment "Aha!" :**
L'IA a parsé le RC en 45 secondes et listé les 31 documents requis. Elle a détecté un AO santé et suggéré d'ajouter les certifications ISO 27001. Terminé samedi midi au lieu de travailler tout le week-end.

**Résolution :**
Marc peut répondre à cet AO qu'il aurait normalement abandonné. Il gagne 75% de temps (10h au lieu de 40h). Il envisage de répondre à 2 AO de plus ce mois-ci.

---

### Journey 2 : Marc - Document manquant détecté (Edge Case)

**Situation :**
Marc prépare un AO et l'application détecte que son attestation URSSAF expire dans 8 jours — soit 2 jours après la date de soumission.

**Le parcours :**

| Étape             | Action                                 | Émotion      | Ce qu'il voit                                                 |
| ----------------- | -------------------------------------- | ------------ | ------------------------------------------------------------- |
| Alerte proactive  | Notification lors de l'upload du RC    | Inquiétude   | "Attestation URSSAF expire le 20/01, soumission le 22/01"     |
| Options proposées | L'IA suggère des actions               | Réflexion    | "1. Commander nouveau certificat 2. Vérifier délai obtention" |
| Action            | Marc commande une nouvelle attestation | Soulagement  | Rappel configuré "Vérifier réception J-5"                     |
| Réception         | Upload du nouveau document             | Confiance    | "Attestation valide jusqu'au 20/04"                           |
| Apprentissage     | L'IA met à jour le coffre-fort         | Valorisation | "Document mis à jour. Prochaine alerte : 10/04"               |

**Moment "Aha!" :**
Sans l'alerte, soumission avec un document expirant 2 jours après. Dossier rejeté, 25 heures de travail perdues. L'IA a sauvé 80k€.

---

### Journey 3 : Sophie - Utilisation avec profil enrichi (Utilisateur récurrent)

**Persona :** Sophie, 38 ans, gérante PME BTP (12 salariés). CA 1,2M€, 40% marchés publics. Répond à 15-20 AO/an, en gagne 3-4.

**Situation de départ :**
Sophie utilise l'application depuis 3 mois. Elle a complété 4 AO. Son profil entreprise est complet à 85%. Un nouvel AO de rénovation électrique d'une école apparaît.

**Le parcours :**

| Étape               | Action                                                           | Émotion           | Ce qu'il voit                         |
| ------------------- | ---------------------------------------------------------------- | ----------------- | ------------------------------------- |
| Nouvel AO           | Clique "Nouveau projet AO"                                       | Confiance         | Interface familière                   |
| Upload RC           | Dépose le règlement                                              | Routine           | Parsing en cours...                   |
| Pré-remplissage     | L'IA affiche : "72% pré-rempli depuis votre profil"              | Surprise agréable | Sections vertes déjà complètes        |
| Focus rédaction     | Ne travaille que sur méthodologie spécifique                     | Efficacité        | Questions ciblées sur le projet école |
| Référence similaire | L'IA suggère : "Votre chantier École Pasteur 2025 est similaire" | Moment "Aha!"     | Référence pré-formatée proposée       |
| Ajustements         | Adapte la méthodologie au nouveau contexte                       | Créativité        | Édition inline fluide                 |
| Export              | Télécharge le dossier complet                                    | Satisfaction      | 4h de travail total                   |

**Moment "Aha!" :**
Au 5ème AO, seule la vraie valeur ajoutée reste à faire. L'administratif est réglé. Possibilité de répondre à 2x plus d'AO sans embaucher.

**Résolution :**
Sophie passe de 15-20 AO/an avec stress à 25-30 AO/an sereinement. Son taux de succès augmente car elle a le temps de soigner la méthodologie.

---

### Journey 4 : Thomas - Gestion multi-AO cabinet conseil

**Persona :** Thomas, 35 ans, responsable commercial cabinet conseil RH (25 personnes). Gère 30-40 AO/an pour le cabinet.

**Situation de départ :**
Thomas coordonne les réponses aux AO. Il sollicite les consultants pour le contenu et l'assistante pour l'administratif. Le goulet d'étranglement : lui-même, qui doit tout relire.

**Le parcours :**

| Étape        | Action                                                        | Émotion      | Ce qu'il voit                                |
| ------------ | ------------------------------------------------------------- | ------------ | -------------------------------------------- |
| Dashboard    | Ouvre l'application le lundi matin                            | Organisation | 3 AO en cours, 2 à deadline cette semaine    |
| Dispatch     | Assigne l'AO "Formation managers" à Julie (consultante)       | Contrôle     | Statut : "En rédaction"                      |
| Suivi        | Vérifie l'avancement mercredi                                 | Surveillance | Méthodologie à 60%, Références manquantes    |
| Intervention | Chat avec l'IA : "Quelles références similaires avons-nous ?" | Efficacité   | Liste de 5 références pertinentes du cabinet |
| Relecture    | Preview du document quasi-complet                             | Satisfaction | Indicateurs de confiance par section         |
| Validation   | Approuve les sections, demande reformulation RSE              | Qualité      | Édition collaborative                        |
| Export       | Génère le dossier final                                       | Confiance    | ZIP structuré pour soumission                |

**Moment "Aha!" :**
Vue instantanée de l'état des 5 AO en cours. Plus besoin de relire 100% — les indicateurs montrent où intervenir. Temps de validation passé de 4h à 45min par AO.

---

### Journey 5 : Assistante Administrative - Collecte documents

**Persona :** Marie, 28 ans, assistante administrative chez Sophie (PME BTP).

**Situation :**
Sophie lui délègue la préparation d'un AO. Marie doit rassembler les pièces administratives.

**Le parcours :**

| Étape        | Action                                   | Émotion       | Ce qu'il voit                          |
| ------------ | ---------------------------------------- | ------------- | -------------------------------------- |
| Accès        | Se connecte avec son compte "Assistante" | Clarté        | Vue simplifiée, pas de rédaction       |
| Checklist    | Voit la liste des documents requis       | Organisation  | 28 pièces, 18 déjà dans le coffre-fort |
| Collecte     | Récupère les 10 pièces manquantes        | Méthodique    | Cases à cocher, statuts clairs         |
| Upload       | Dépose les documents récupérés           | Satisfaction  | Validation automatique des formats     |
| Notification | Sophie reçoit "Pièces admin complètes"   | Collaboration | Handoff fluide                         |

**Moment "Aha!" :**
Plus de doute sur la complétude. La checklist est générée automatiquement depuis le RC. Sophie peut se concentrer sur le contenu technique.

---

### Journey Requirements Summary

| Journey            | Capacités révélées                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Marc - Happy Path  | Parsing RC, Chat guidé, Profil entreprise, Preview live, Export ZIP, Suggestions contextuelles   |
| Marc - Edge Case   | Alertes proactives, Détection expiration, Coffre-fort documents, Rappels                         |
| Sophie - Récurrent | Pré-remplissage intelligent, Mémoire références, Réutilisation données, Score complétude         |
| Thomas - Multi-AO  | Dashboard multi-projets, Indicateurs progression, Gestion équipe (future), Historique références |
| Marie - Assistante | Rôle simplifié, Checklist claire, Upload documents, Notifications                                |

**Fonctionnalités clés identifiées par les journeys :**

- Parsing automatique du RC avec checklist générée
- Profil entreprise évolutif avec mémoire
- Alertes proactives sur documents expirés
- Interface 3 colonnes avec indicateurs visuels
- Chat IA avec suggestions contextuelles
- Preview document en temps réel
- Export ZIP structuré
- Coffre-fort documents récurrents
- Dashboard multi-AO (pour utilisateurs avancés)

---

## Innovation & Novel Patterns

### Detected Innovation Areas

#### 1. Parsing Intelligent de Documents Réglementaires

**Ce qui est nouveau :**
Aucun outil existant ne parse automatiquement les règlements de consultation (RC) des AO publics pour en extraire une checklist structurée des pièces exigées.

**Différenciation :**

- Solutions actuelles : lecture manuelle (3-5h par RC)
- Notre approche : extraction IA en <1 minute avec catégorisation automatique

**Défi technique :**

- RC sont des PDF complexes, souvent scannés, avec structures variables
- Vocabulaire juridique/administratif spécifique
- Formats différents selon donneurs d'ordre

#### 2. Agent IA Conversationnel Spécialisé Métier

**Ce qui est nouveau :**
Un agent IA qui comprend le contexte spécifique des AO publics français et guide la rédaction de manière adaptative.

**Différenciation :**

- ChatGPT/Claude génériques : pas de mémoire métier, pas de structure AO
- Notre approche : questions hybrides (structurées + adaptatives), connaissance du vocabulaire AO, suggestions contextuelles sectorielles

**Innovation clé :**
L'IA "apprend" le profil entreprise et ne redemande jamais ce qu'elle sait déjà — valeur croissante avec l'usage.

#### 3. Mémoire Entreprise Évolutive

**Ce qui est nouveau :**
Un "coffre-fort" de données entreprise qui s'enrichit automatiquement à chaque AO complété.

**Différenciation :**

- Outils classiques : saisie manuelle répétée à chaque projet
- Notre approche : capture intelligente post-AO, détection données obsolètes, alertes proactives

**Impact mesurable :**

- 1er AO : 0% pré-rempli
- 5ème AO : 60%+ pré-rempli
- Effet réseau personnel : plus on utilise, plus c'est rapide

### Market Context & Competitive Landscape

**Marché des AO publics en France :**

- ~100 000 marchés publics/an
- PME représentent 60% des attributaires
- Pas de solution SaaS spécialisée PME avec IA

**Concurrence indirecte :**

| Concurrent        | Approche            | Limite                              |
| ----------------- | ------------------- | ----------------------------------- |
| Cabinets conseil  | Humain expert       | 3-8k€/AO, délai long                |
| ERP (Cegid, Sage) | Module AO générique | Surdimensionné, pas d'IA            |
| ChatGPT/Claude    | IA généraliste      | Pas de mémoire, pas de structure AO |
| Templates Word    | Statique            | Pas d'adaptation, oublis fréquents  |

**Fenêtre d'opportunité :**

- Maturité IA conversationnelle (2024-2026)
- Adoption numérique PME accélérée post-COVID
- Aucun acteur dominant sur ce créneau

### Validation Approach

**Hypothèses à valider :**

| Hypothèse                                         | Méthode de validation                     | Critère de succès                    |
| ------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| Le parsing RC fonctionne avec >90% précision      | Tests sur 50 RC réels de secteurs variés  | >90% pièces correctement identifiées |
| Les utilisateurs acceptent l'IA conversationnelle | Beta avec 20 users, interviews            | NPS >40, >60% completion             |
| La mémoire apporte de la valeur                   | Mesure pré-remplissage AO #2 vs AO #5     | >50% pré-rempli au 5ème AO           |
| Le gain de temps est réel                         | Tracking temps in-app vs baseline déclaré | <12h en moyenne (vs 30-50h baseline) |

**MVP Validation milestones :**

1. M1 : Parsing RC fonctionnel sur 3 formats courants
2. M2 : Chat IA avec mémoire profil entreprise
3. M3 : 50 users beta, feedback qualitatif

### Risk Mitigation

| Risque                    | Impact                    | Mitigation                                                       |
| ------------------------- | ------------------------- | ---------------------------------------------------------------- |
| Parsing RC imprécis       | Users perdent confiance   | Validation manuelle facile, amélioration continue avec feedback  |
| IA donne mauvais conseils | Erreurs dans dossiers     | Indicateurs de confiance, édition humaine obligatoire            |
| Adoption lente            | Pas de product-market fit | Freemium pour réduire friction, focus valeur immédiate (parsing) |
| Concurrence rapide        | Copie par acteurs établis | Avance données (mémoire utilisateurs), spécialisation métier     |

**Fallback si innovation ne fonctionne pas :**

- Parsing : mode semi-automatique (suggestions à valider)
- IA : templates intelligents sans conversation
- Mémoire : import/export manuel structuré

---

## SaaS B2B Specific Requirements

### Project-Type Overview

**appeloffresaas** est une plateforme SaaS B2B de type "vertical SaaS" ciblant un marché de niche (PME/consultants répondant aux AO publics en France). L'architecture doit supporter une croissance de 50 à 5000 utilisateurs sur 2 ans, avec évolution vers le multi-utilisateurs par compte en V2.

### Technical Architecture Considerations

**Architecture cible :**

- Frontend : SPA moderne (React/Next.js) avec interface 3 colonnes
- Backend : API REST/GraphQL pour séparation concerns
- IA : Intégration LLM (Claude/GPT) pour chat conversationnel et parsing
- Storage : Base de données relationnelle + stockage documents (S3/équivalent)
- Infrastructure : Cloud-native, containerisé, scalable horizontalement

### Tenant Model

**MVP - Single User Architecture :**

- 1 compte = 1 utilisateur principal
- Données isolées par compte (user_id)
- Pas de partage de données entre comptes

**V2 - Multi-User Evolution :**

- 1 organisation = N utilisateurs
- Rôles : Owner, Admin, Member, Assistant (read-only)
- Données partagées au niveau organisation
- Migration transparente des comptes MVP

**Considérations techniques :**

- Schema design anticipant le multi-tenant (organization_id dès le MVP)
- Isolation des données par défaut
- Audit trail des accès

### RBAC Matrix (Permission Model)

**MVP - Rôles simplifiés :**

| Rôle           | Accès                | Actions                                 |
| -------------- | -------------------- | --------------------------------------- |
| Owner          | Tout                 | CRUD complet, export, paramètres compte |
| Assistant (V2) | Documents, Checklist | Lecture, upload docs, cocher checklist  |

**V2 - Rôles étendus :**

| Rôle      | Projets AO | Documents | Paramètres | Équipe |
| --------- | ---------- | --------- | ---------- | ------ |
| Owner     | CRUD       | CRUD      | CRUD       | CRUD   |
| Admin     | CRUD       | CRUD      | Read       | Read   |
| Member    | CRUD own   | CRUD own  | -          | -      |
| Assistant | Read       | Upload    | -          | -      |

### Subscription Tiers

**Modèle économique MVP :**

| Tier     | Prix     | Limites                                                  | Cible                    |
| -------- | -------- | -------------------------------------------------------- | ------------------------ |
| Free     | 0€       | 1 AO/mois, parsing limité                                | Découverte               |
| Pro      | 29€/mois | AO illimités, profil complet, export ZIP                 | Consultants indépendants |
| Business | 79€/mois | Multi-AO simultanés, stats avancées, support prioritaire | PME actives              |

**Métriques business :**

- Trial : 14 jours Pro gratuit
- Conversion trial→paid : 15% (M6) → 25% (M12)
- Churn cible : <5%/mois
- ARPU cible : ~30€/mois

**Features par tier (MVP) :**

| Feature               |   Free    |   Pro    |  Business   |
| --------------------- | :-------: | :------: | :---------: |
| Parsing RC            |  1/mois   | Illimité |  Illimité   |
| Profil entreprise     |  Basique  | Complet  |   Complet   |
| Coffre-fort documents |  5 docs   | 50 docs  |  Illimité   |
| Export PDF/Word       |    Oui    |   Oui    |     Oui     |
| Export ZIP structuré  |    Non    |   Oui    |     Oui     |
| Historique AO         |  3 mois   |   1 an   |  Illimité   |
| Support               | Community |  Email   | Prioritaire |

### Integration List

**MVP - Intégrations minimales :**

- Aucune intégration externe requise
- Import/export fichiers manuel (PDF, Word, ZIP)

**V2-V3 - Intégrations planifiées :**

| Intégration                    | Type     | Priorité | Objectif                   |
| ------------------------------ | -------- | -------- | -------------------------- |
| OAuth (Google/Microsoft)       | Auth     | V2       | Simplifier inscription     |
| Stockage cloud (Drive/Dropbox) | Import   | V2       | Import documents existants |
| Stripe                         | Paiement | MVP      | Facturation abonnements    |

**V4 - Intégrations avancées :**

| Intégration            | Type            | Objectif                  |
| ---------------------- | --------------- | ------------------------- |
| PLACE, AWS, Maximilien | Marchés publics | Soumission directe        |
| API publique           | Développeurs    | Intégration ERP/CRM tiers |
| Webhooks               | Événements      | Notifications externes    |

### Compliance Requirements

**RGPD (obligatoire) :**

- Consentement explicite collecte données
- Droit d'accès, rectification, suppression
- Export données utilisateur (portabilité)
- Politique de confidentialité claire
- DPA (Data Processing Agreement) pour clients B2B

**Sécurité standard :**

- Chiffrement données au repos (AES-256)
- Chiffrement en transit (TLS 1.3)
- Authentification sécurisée (bcrypt, 2FA optionnel)
- Audit logs des actions sensibles
- Backup réguliers avec rétention 30 jours

**Non requis (domaine non régulé) :**

- Pas de certification SOC2 (MVP)
- Pas de HIPAA, PCI-DSS
- Pas d'hébergement souverain obligatoire

### Implementation Considerations

**Stack technique recommandée :**

- Frontend : Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Backend : Node.js/Python, API REST ou tRPC
- Database : PostgreSQL (données structurées), Redis (cache/sessions)
- IA : Claude API ou OpenAI API pour chat et parsing
- Storage : S3-compatible pour documents
- Infra : Vercel/Railway ou AWS (ECS/Lambda)
- Monitoring : Sentry, Posthog/Mixpanel

**Priorités techniques MVP :**

1. Parsing PDF robuste (pdf.js + LLM extraction)
2. Chat IA avec contexte persistant
3. Génération documents (PDF/Word)
4. Auth simple mais sécurisée
5. Interface responsive (mobile-friendly, pas mobile-first)

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach :** Problem-Solving MVP — Résoudre le problème de temps et de conformité administrative avec le minimum viable.

**Principe directeur :** Chaque fonctionnalité MVP doit contribuer directement à :

1. Réduire le temps de préparation AO, OU
2. Éliminer le risque d'oubli/erreur administrative

**Resource Requirements MVP :**

- 1 développeur full-stack senior (Next.js + API)
- 1 développeur IA/backend (parsing + chat)
- 1 designer UX/UI (temps partiel)
- Durée estimée : 3-4 mois

### MVP Feature Set (Phase 1)

**Core User Journeys Supported :**

- Journey 1 : Marc - Premier AO (Happy Path)
- Journey 2 : Marc - Document manquant (Edge Case)
- Journey 3 partiel : Sophie - Profil enrichi (réutilisation basique)

**Must-Have Capabilities (P1) :**

| Fonctionnalité                    | Justification MVP                           |
| --------------------------------- | ------------------------------------------- |
| Parsing règlement consultation    | Différenciateur #1, gain de temps immédiat  |
| Checklist conformité auto-générée | Élimine risque d'oubli, valeur immédiate    |
| Profil entreprise basique         | Fondation pour réutilisation                |
| Chat IA guidé                     | Expérience conversationnelle différenciante |
| Preview document temps réel       | Feedback immédiat, confiance utilisateur    |
| Export PDF/Word                   | Minimum pour soumission                     |
| Export ZIP structuré              | Prêt pour plateformes marchés publics       |
| Interface 3 colonnes              | UX différenciante, productivité             |
| Coffre-fort documents basique     | Stockage pièces récurrentes                 |
| Alertes documents expirés         | Prévention erreurs critiques                |

**Explicitly Out of MVP :**

- Multi-utilisateurs par compte
- Import intelligent anciens AO
- Dashboard multi-AO
- Statistiques avancées
- Intégrations externes (sauf Stripe)
- Collaboration client

### Post-MVP Features

**Phase 2 — Growth (M4-M8) :**

| Fonctionnalité                        | Objectif                              |
| ------------------------------------- | ------------------------------------- |
| Import intelligent anciens AO         | Accélérer onboarding, enrichir profil |
| Profondeur adaptative (expert/novice) | Meilleure UX selon expérience         |
| Capture intelligente post-AO          | Enrichissement automatique profil     |
| Dashboard multi-AO                    | Vision globale pour users actifs      |
| Indicateurs de confiance par section  | Guider l'attention utilisateur        |
| Score de complétude profil            | Gamification, engagement              |
| Statistiques basiques                 | Insights sur performance AO           |

**Phase 3 — Expansion (M9-M12) :**

| Fonctionnalité                | Objectif                      |
| ----------------------------- | ----------------------------- |
| Multi-utilisateurs par compte | Ouvrir marché PME structurées |
| Rôles et permissions (RBAC)   | Support équipes               |
| Collaboration client (V2)     | Validation externe            |
| OAuth (Google/Microsoft)      | Réduire friction inscription  |
| Intégration stockage cloud    | Import simplifié              |
| API webhooks                  | Intégrations tierces          |

**Phase 4 — Vision (Année 2) :**

| Fonctionnalité                     | Objectif                 |
| ---------------------------------- | ------------------------ |
| IA générative rédaction complète   | Next-level assistance    |
| Benchmark AO gagnants              | Intelligence compétitive |
| Prédiction taux de succès          | Aide à la décision       |
| Intégration plateformes AO (PLACE) | Soumission directe       |
| API publique                       | Écosystème partenaires   |
| Marketplace templates              | Revenus additionnels     |

### Risk Mitigation Strategy

**Technical Risks :**

| Risque                       | Impact                | Mitigation                                                       |
| ---------------------------- | --------------------- | ---------------------------------------------------------------- |
| Parsing RC imprécis (<90%)   | Perte confiance users | Tests sur 50 RC réels avant launch, mode "suggestions à valider" |
| Latence IA trop élevée (>5s) | UX dégradée           | Streaming responses, cache contexte, fallback templates          |
| Complexité PDF scannés       | Parsing échoue        | OCR préalable, message clair si qualité insuffisante             |

**Market Risks :**

| Risque             | Impact            | Mitigation                                                |
| ------------------ | ----------------- | --------------------------------------------------------- |
| Adoption lente     | Pas de PMF        | Freemium, focus valeur immédiate (parsing gratuit limité) |
| Concurrence rapide | Perte avantage    | Spécialisation métier, avance données utilisateurs        |
| Prix mal calibré   | Conversion faible | A/B test tiers, ajustement rapide                         |

**Resource Risks :**

| Risque           | Impact         | Mitigation                                             |
| ---------------- | -------------- | ------------------------------------------------------ |
| Équipe réduite   | Délai MVP      | Scope minimal strict, features coupées si besoin       |
| Budget LLM élevé | Marge négative | Caching agressif, modèles optimisés, limites tier Free |
| Turnover dev     | Perte vélocité | Documentation, architecture simple, bus factor >1      |

**Contingency Plan — MVP Minimal :**
Si ressources réduites de 50%, lancer avec :

1. Parsing RC + checklist (core value)
2. Export PDF basique (pas de ZIP structuré)
3. Profil entreprise statique (pas de mémoire évolutive)
4. Pas de chat IA (formulaires guidés)

---

## Functional Requirements

### 1. User Account Management

- **FR1:** User can create an account with email and password
- **FR2:** User can authenticate using email/password credentials
- **FR3:** User can reset password via email verification
- **FR4:** User can update account information (name, email)
- **FR5:** User can delete account and all associated data
- **FR6:** User can view current subscription tier and limits
- **FR7:** User can upgrade or downgrade subscription tier

### 2. Company Profile Management

- **FR8:** User can create and edit company profile (name, SIRET, address, contact)
- **FR9:** User can add and manage company legal information (Kbis, capital, NAF code)
- **FR10:** User can add and manage financial data (CA, effectifs, bilans)
- **FR11:** User can add and manage certifications and qualifications
- **FR12:** User can add and manage team members information (CV, compétences)
- **FR13:** User can add and manage project references (description, montant, client, dates)
- **FR14:** System automatically suggests profile completion based on missing fields
- **FR15:** User can view profile completeness score

### 3. Document Vault Management

- **FR16:** User can upload documents to secure vault (PDF, Word, images)
- **FR17:** User can categorize documents by type (Kbis, attestations, certificats)
- **FR18:** User can set expiration dates on documents
- **FR19:** System automatically detects document expiration dates from content when possible
- **FR20:** User can view, download, and delete vault documents
- **FR21:** User can search documents in vault by name and category

### 4. Tender Project Management (AO)

- **FR22:** User can create a new tender project (AO)
- **FR23:** User can upload tender regulation document (RC) in PDF format
- **FR24:** User can set tender submission deadline
- **FR25:** User can view list of all tender projects with status
- **FR26:** User can archive completed tender projects
- **FR27:** User can duplicate an existing tender project as template
- **FR28:** User can delete a tender project

### 5. Regulation Parsing (RC)

- **FR29:** System can parse uploaded RC document and extract required documents list
- **FR30:** System can categorize extracted requirements (administrative, technical, financial)
- **FR31:** System can identify submission format requirements (PDF, paper, platform)
- **FR32:** System can extract submission deadline from RC
- **FR33:** User can view parsed requirements as structured checklist
- **FR34:** User can manually add, edit, or remove items from parsed checklist
- **FR35:** User can mark checklist items as complete

### 6. AI-Assisted Content Creation

- **FR36:** User can interact with AI assistant via conversational chat interface
- **FR37:** AI can ask contextual questions to gather tender-specific information
- **FR38:** AI can suggest content based on company profile and previous tenders
- **FR39:** AI can pre-fill sections using existing company profile data
- **FR40:** User can accept, modify, or reject AI suggestions
- **FR41:** AI can adapt question depth based on information already known
- **FR42:** User can skip questions and return to them later (question queue)
- **FR43:** AI can provide sector-specific suggestions based on tender context

### 7. Document Preview & Editing

- **FR44:** User can view real-time preview of generated tender document
- **FR45:** User can edit document content directly in preview (inline editing)
- **FR46:** User can request AI to reformulate specific sections
- **FR47:** User can view section completion indicators (complete, needs review, missing)
- **FR48:** System can display confidence level for AI-generated content
- **FR49:** User can navigate between document sections via sidebar
- **FR50:** User can view document in 3-column layout (chat, content, modules)

### 8. Export & Submission Preparation

- **FR51:** User can export tender document in PDF format
- **FR52:** User can export tender document in Word format
- **FR53:** User can export complete tender package as structured ZIP
- **FR54:** System organizes ZIP with standard folder structure (administrative, technical, financial)
- **FR55:** User can customize export settings (include/exclude sections)
- **FR56:** System validates all required documents are present before export
- **FR57:** User can view pre-export conformity checklist with status

### 9. Notifications & Alerts

- **FR58:** System sends alert when vault document is expiring within configurable threshold
- **FR59:** System sends alert when document will be expired at tender submission date
- **FR60:** System sends reminder notifications for approaching tender deadlines
- **FR61:** User can configure notification preferences (email, in-app)
- **FR62:** User can view notification history

### 10. Data Reuse & Intelligence

- **FR63:** System can identify reusable content from previous tenders
- **FR64:** System can suggest relevant references based on tender sector/type
- **FR65:** User can save new information captured during tender to company profile
- **FR66:** System tracks data freshness and suggests updates for stale information

---

## Non-Functional Requirements

### Performance

**NFR-P1: AI Chat Response Time**

- First token response : < 1 seconde
- Streaming completion : flux continu visible
- Full response : < 10 secondes pour réponses complexes

**NFR-P2: RC Parsing Performance**

- Documents < 50 pages : < 30 secondes
- Documents 50-200 pages : < 90 secondes
- Feedback visuel de progression obligatoire

**NFR-P3: UI Responsiveness**

- Page load initial : < 3 secondes
- Navigation entre sections : < 500ms
- Preview document update : < 1 seconde après modification

**NFR-P4: Document Generation**

- Export PDF : < 10 secondes
- Export Word : < 10 secondes
- Export ZIP complet : < 30 secondes

**NFR-P5: Concurrent Users**

- Support 100 utilisateurs simultanés minimum (MVP)
- Dégradation gracieuse si charge excessive (queue, retry)

### Security

**NFR-S1: Data Encryption**

- Données au repos : AES-256
- Données en transit : TLS 1.3 minimum
- Documents stockés chiffrés

**NFR-S2: Authentication**

- Passwords hashés avec bcrypt (cost factor >= 12)
- Session tokens avec expiration (24h default, configurable)
- Protection contre brute force (rate limiting, lockout)

**NFR-S3: Authorization**

- Isolation stricte des données par utilisateur
- Aucun accès cross-tenant possible
- Validation côté serveur de toutes les actions

**NFR-S4: RGPD Compliance**

- Consentement explicite avant collecte données
- Export données utilisateur disponible sous 72h
- Suppression complète des données sur demande sous 30 jours
- Logs d'accès aux données personnelles

**NFR-S5: Audit & Logging**

- Log de toutes les actions sensibles (login, export, delete)
- Rétention logs : 90 jours minimum
- Logs non modifiables (append-only)

**NFR-S6: API Security**

- Rate limiting par utilisateur (100 req/min default)
- Validation input stricte (injection prevention)
- CORS configuré restrictivement

### Scalability

**NFR-SC1: User Growth**

- Architecture supportant 10x croissance sans refonte majeure
- MVP : 500 utilisateurs actifs simultanés
- Target M12 : 5000 utilisateurs totaux

**NFR-SC2: Data Storage**

- Stockage documents : scalable horizontalement (S3/équivalent)
- Base de données : partitioning ready (par user_id)
- Pas de limite technique sur nombre de documents par user

**NFR-SC3: AI API Scaling**

- Queue management pour pics de demandes
- Fallback gracieux si API LLM surchargée
- Cost monitoring et alerting

### Reliability

**NFR-R1: Availability**

- Uptime cible : 99.5% (max ~44h downtime/an)
- Maintenance planifiée : hors heures bureau FR (nuit, week-end)
- Status page publique

**NFR-R2: Data Durability**

- Backup automatique quotidien
- Rétention backups : 30 jours
- Point-in-time recovery disponible
- RPO (Recovery Point Objective) : < 24h
- RTO (Recovery Time Objective) : < 4h

**NFR-R3: Error Handling**

- Erreurs utilisateur : messages clairs et actionnables
- Erreurs système : logging complet, notification équipe
- Graceful degradation si service externe indisponible

**NFR-R4: Data Integrity**

- Transactions ACID pour opérations critiques
- Validation données avant persistence
- Pas de perte de données utilisateur en cas de crash

### Accessibility

**NFR-A1: WCAG Compliance**

- Niveau AA pour fonctionnalités principales
- Navigation clavier complète
- Contraste couleurs suffisant (4.5:1 minimum)

**NFR-A2: Responsive Design**

- Desktop : optimisé (primary)
- Tablet : fonctionnel
- Mobile : consultation possible (édition limitée acceptable)

**NFR-A3: Browser Support**

- Chrome, Firefox, Safari, Edge : 2 dernières versions majeures
- Pas de support IE11

### Operational

**NFR-O1: Monitoring**

- APM (Application Performance Monitoring) actif
- Alertes automatiques si dégradation performance
- Dashboard métriques temps réel

**NFR-O2: Deployments**

- Zero-downtime deployments
- Rollback possible en < 5 minutes
- Environnement staging obligatoire

**NFR-O3: Logging**

- Logs centralisés et searchables
- Corrélation logs par request ID
- Rétention : 30 jours online, 1 an archive
