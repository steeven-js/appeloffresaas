---
stepsCompleted: [1, 2, 3, 4, 5, 6]
workflowComplete: true
inputDocuments:
  - brainstorming-session-2026-01-16.md
  - problematique-ao-administratifs.md
date: 2026-01-16
author: Steeven
---

# Product Brief: appeloffresaas

## Executive Summary

**appeloffresaas** est une application web d'accompagnement IA qui transforme la réponse aux appels d'offres publics d'un processus administratif chronophage en une expérience fluide et guidée. Destinée aux PME et consultants indépendants, la plateforme réduit de 75% le temps de préparation grâce à un agent conversationnel intelligent qui collecte les données, réutilise les informations existantes, et génère des dossiers conformes prêts à soumettre.

**Proposition de valeur :** Passer de 30-50 heures par AO à 7-11 heures, tout en éliminant le risque d'élimination pour oubli administratif.

---

## Core Vision

### Problem Statement

Les appels d'offres publics représentent un **goulot d'étranglement administratif** qui empêche les PME et consultants indépendants de compétir efficacement. Le problème n'est pas technique — ces professionnels ont les compétences requises — mais **administratif** : parsing manuel de règlements de 150+ pages, collecte répétitive des mêmes documents éparpillés, risque d'élimination pour un simple oubli de pièce, et stress chronique des deadlines immuables.

**Situation typique :** Un consultant découvre un AO parfait pour son expertise. Délai : 15 jours. Le règlement fait 147 pages. Il passe 3 heures à lister les 30+ documents requis, 12 heures à les collecter, 25 heures à rédiger... pour réaliser à J-1 qu'il manque l'attestation URSSAF. Dossier éliminé d'office.

### Problem Impact

| Dimension         | Impact mesuré                                                        |
| ----------------- | -------------------------------------------------------------------- |
| **Financier**     | 150k€ - 1M€ d'opportunités perdues par an pour cause administrative  |
| **Temps**         | 30-50 heures par AO, dont 80% sur des tâches répétitives             |
| **Psychologique** | Abandon préventif d'AO intéressants par peur de ne pas terminer      |
| **Concurrentiel** | Désavantage structurel face aux grands groupes avec équipes dédiées  |
| **Croissance**    | Capacité limitée à 4-6 AO/an vs potentiel de 15-20 avec optimisation |

### Why Existing Solutions Fall Short

| Solution actuelle              | Limite principale                                             |
| ------------------------------ | ------------------------------------------------------------- |
| **Word + Templates**           | Copier-coller = incohérences, données obsolètes non détectées |
| **Excel checklist**            | Manuelle = oublis fréquents, pas d'alertes automatiques       |
| **Cabinet conseil (3-8k€/AO)** | Budget inaccessible PME, délai intervention long              |
| **ERP avec module AO**         | 500-2000€/mois, surdimensionné, pas spécifique AO publics     |
| **Email comme "mémoire"**      | Recherche chronophage, pas de structure                       |

**Verdict :** Aucune solution n'offre à la fois la réutilisation intelligente des données, le parsing automatique du règlement, et l'accompagnement conversationnel adapté aux PME.

### Proposed Solution

Une application web avec **agent IA conversationnel** qui :

1. **Parse automatiquement le règlement** de consultation et extrait la liste des pièces exigées
2. **Mémorise le profil entreprise** (Kbis, attestations, références) et ne redemande jamais ce qu'il connaît
3. **Guide la rédaction** par questions adaptatives — hybride entre structure et flexibilité
4. **Génère un dossier conforme** avec preview interactive et co-pilote actif
5. **Exporte en PDF/Word/ZIP** prêt à soumettre sur les plateformes de marchés publics
6. **Alerte proactivement** sur les documents expirés ou manquants

**Interface :** Layout 3 colonnes (chat IA | zone centrale adaptative | modules de progression) inspiré des meilleures apps modernes (ChatGPT, Notion).

### Key Differentiators

| Différenciateur                  | Pourquoi c'est unique                                           |
| -------------------------------- | --------------------------------------------------------------- |
| **Parsing Règlement AO**         | Aucun outil ne génère automatiquement la checklist depuis le RC |
| **Mémoire Entreprise Évolutive** | Valeur croissante à chaque utilisation — ROI cumulatif          |
| **Co-pilote Non-Intrusif**       | Suggestions contextuelles sans popup bloquant                   |
| **Focus AO Publics**             | Spécialisation = expertise perçue vs outils généralistes        |
| **Prix accessible PME**          | Alternative aux cabinets à 3-8k€/AO                             |
| **Timing IA**                    | Maturité de l'IA conversationnelle + adoption PME en 2025-2026  |

---

## Target Users

### Primary Users

#### Persona 1 : Marc, Consultant IT Indépendant

**Profil :**

- 42 ans, consultant en transformation digitale
- 8 ans d'expérience, travaille seul avec un réseau de sous-traitants
- CA : 120k€/an, objectif 180k€
- Répond à 6-8 AO publics par an, en gagne 1-2

**Contexte quotidien :**
Marc découvre les AO sur BOAMP et plateformes régionales. Quand un marché correspond à son expertise, il doit tout gérer seul : lecture du RC, collecte des pièces, rédaction, mise en forme. Il travaille souvent le soir et le week-end pour respecter les deadlines.

**Frustrations actuelles :**

- "Je passe 15 heures à recréer le même dossier administratif à chaque fois"
- "J'ai perdu un marché de 80k€ car j'avais oublié le RIB dans le ZIP"
- "Le RC fait 150 pages, je dois tout lire pour trouver les 30 pièces exigées"
- "Je renonce à certains AO car le délai est trop court pour tout préparer"

**Objectifs avec la solution :**

- Réduire le temps de préparation de 40h à 10h
- Ne plus jamais oublier une pièce obligatoire
- Pouvoir répondre à 2x plus d'AO avec le même effort
- Avoir une base de données de ses références réutilisable

**Moment "Aha!" attendu :**
"L'IA a parsé le RC en 30 secondes et m'a listé les 28 documents requis. Elle a pré-rempli 80% du dossier avec mes infos existantes. J'ai juste eu à adapter la méthodologie."

---

#### Persona 2 : Sophie, Dirigeante PME BTP

**Profil :**

- 38 ans, gérante d'une entreprise de 12 salariés (électricité/plomberie)
- Gère l'administratif en plus de la direction opérationnelle
- CA : 1,2M€, 40% provient des marchés publics
- Répond à 15-20 AO par an, en gagne 3-4

**Contexte quotidien :**
Sophie jongle entre les chantiers, la gestion d'équipe et l'administratif. Les AO sont cruciaux pour son activité mais chronophages. Elle délègue parfois à son assistante, mais doit tout vérifier elle-même.

**Frustrations actuelles :**

- "Mes documents sont éparpillés : Kbis chez le comptable, attestations dans les mails, références sur le serveur"
- "Chaque AO demande les mêmes infos mais dans un format différent"
- "Je ne peux pas déléguer car le risque d'erreur est trop grand"
- "Les grands groupes ont des équipes dédiées, moi je fais tout seule"

**Objectifs avec la solution :**

- Centraliser tous les documents administratifs en un seul endroit
- Avoir des alertes avant expiration des attestations
- Pouvoir déléguer la préparation initiale à son assistante
- Gagner les AO sur la qualité technique, pas les perdre sur l'administratif

**Moment "Aha!" attendu :**
"J'ai importé mes 5 derniers AO gagnés. L'IA a extrait mes références, mon profil entreprise, mes certifications. Maintenant, quand je commence un nouvel AO, 60% est déjà pré-rempli."

---

#### Persona 3 : Thomas, Responsable Commercial Cabinet Conseil

**Profil :**

- 35 ans, responsable développement dans un cabinet de 25 personnes
- Spécialisé conseil RH et formation professionnelle
- Gère 30-40 AO par an pour le cabinet
- Objectif : augmenter le taux de succès de 18% à 30%

**Contexte quotidien :**
Thomas identifie les opportunités et coordonne les réponses. Il sollicite les consultants pour le contenu technique et l'assistante pour l'administratif. Le goulet d'étranglement : lui-même, qui doit tout relire et valider.

**Frustrations actuelles :**

- "Je passe plus de temps sur l'admin que sur la stratégie de réponse"
- "Nos consultants rédigent bien, mais oublient les exigences spécifiques du RC"
- "On n'a pas de visibilité sur nos stats : taux de succès par secteur, par montant..."
- "Chaque consultant a son propre template, pas de cohérence"

**Objectifs avec la solution :**

- Standardiser le processus de réponse pour tout le cabinet
- Avoir un tableau de bord des AO en cours et des stats
- Réduire son temps de relecture/validation
- Capitaliser sur les réponses passées pour améliorer les futures

**Moment "Aha!" attendu :**
"L'IA a détecté que notre section RSE était faible sur les 5 derniers AO perdus. Elle suggère d'enrichir cette partie avec nos certifications Qualiopi et nos engagements handicap."

---

### Secondary Users

#### Assistante Administrative

**Rôle :** Collecte des documents, mise en forme, vérification conformité
**Interaction :** Utilise l'outil pour rassembler les pièces, suit les checklists générées
**Besoin :** Interface simple, instructions claires, pas de décisions stratégiques à prendre

#### Comptable Externe

**Rôle :** Fournit bilans, attestations fiscales, données financières
**Interaction :** Reçoit des demandes automatisées de documents via l'outil
**Besoin :** Demandes claires avec dates limites, format requis spécifié

#### Client Final (V2 - Validation)

**Rôle :** Relit et valide le dossier avant soumission
**Interaction :** Accès lecture + annotations via lien sécurisé
**Besoin :** Vue épurée du document final, possibilité de commenter (reporté en V2)

---

### User Journey

#### Parcours de Marc (Consultant IT)

| Étape            | Action                                          | Émotion             | Fonctionnalité clé          |
| ---------------- | ----------------------------------------------- | ------------------- | --------------------------- |
| **Découverte**   | Voit une pub LinkedIn "Gagnez 20h par AO"       | Curiosité sceptique | Landing page avec démo      |
| **Inscription**  | Crée un compte, importe 2 anciens AO            | Espoir prudent      | Import intelligent PDF/Word |
| **Premier AO**   | Upload le RC, l'IA génère la checklist          | Surprise positive   | Parsing règlement           |
| **Rédaction**    | Chat avec l'IA, répond aux questions            | Flow productif      | Questions adaptatives       |
| **Preview**      | Voit le document se construire en temps réel    | Satisfaction        | Preview interactive         |
| **Vérification** | Checklist verte, tous documents présents        | Soulagement         | Checklist conformité        |
| **Export**       | Télécharge le ZIP structuré                     | Confiance           | Export PDF/Word/ZIP         |
| **Post-AO**      | L'IA propose de sauvegarder les nouvelles infos | Valorisation        | Capture intelligente        |
| **Résultat**     | Marque "Gagné" - stats mises à jour             | Fierté              | Feedback post-soumission    |

#### Moment de Valeur Clé

**Avant :** "Je redoute chaque nouvel AO — c'est du stress garanti."
**Après :** "Je suis presque content quand je trouve un AO intéressant — je sais que ça va être rapide."

---

## Success Metrics

### User Success Metrics

#### Métrique Principale : Temps Économisé par AO

| Indicateur                   | Baseline (Avant) | Objectif MVP | Objectif V2 |
| ---------------------------- | ---------------- | ------------ | ----------- |
| **Temps total par AO**       | 30-50 heures     | 7-11 heures  | 5-8 heures  |
| **Temps parsing RC**         | 3-5 heures       | 5 minutes    | 2 minutes   |
| **Temps collecte documents** | 8-12 heures      | 1-2 heures   | 30 minutes  |
| **Temps rédaction**          | 15-25 heures     | 5-8 heures   | 4-6 heures  |
| **Temps vérification**       | 3-5 heures       | 15 minutes   | 10 minutes  |

**Indicateur de succès :** Un utilisateur doit pouvoir compléter son 2ème AO en moins de 10 heures.

#### Métrique Secondaire : Élimination des Erreurs Administratives

| Indicateur                                | Baseline               | Objectif               |
| ----------------------------------------- | ---------------------- | ---------------------- |
| **Dossiers rejetés pour pièce manquante** | 15-20% des soumissions | 0%                     |
| **Documents expirés non détectés**        | Fréquent               | 0 (alertes proactives) |
| **Incohérences dans le dossier**          | Régulières             | 0 (validation IA)      |

**Indicateur de succès :** Zéro élimination pour motif administratif après 3 mois d'utilisation.

#### Métrique d'Engagement : Réutilisation des Données

| Indicateur                          | Objectif M3 | Objectif M12 |
| ----------------------------------- | ----------- | ------------ |
| **Taux de pré-remplissage moyen**   | 40%         | 70%          |
| **Profil entreprise complété**      | 60%         | 90%          |
| **Documents dans le coffre-fort**   | 5+          | 15+          |
| **Références clients enregistrées** | 3+          | 10+          |

**Indicateur de succès :** Au 5ème AO, l'utilisateur pré-remplit 60%+ automatiquement.

---

### Business Objectives

#### Phase 1 : Validation (M1-M3)

| Objectif               | Cible                  | Métrique                           |
| ---------------------- | ---------------------- | ---------------------------------- |
| **Early Adopters**     | 50 utilisateurs actifs | Comptes avec 1+ AO complété        |
| **Rétention**          | 60% M1 → M2            | Utilisateurs revenant pour 2ème AO |
| **NPS**                | > 40                   | Score Net Promoter                 |
| **Temps moyen par AO** | < 12 heures            | Moyenne sur tous les utilisateurs  |

#### Phase 2 : Croissance (M4-M12)

| Objectif                            | Cible M6 | Cible M12 |
| ----------------------------------- | -------- | --------- |
| **Utilisateurs actifs**             | 200      | 1 000     |
| **AO complétés/mois**               | 100      | 800       |
| **MRR (Monthly Recurring Revenue)** | 5 000€   | 30 000€   |
| **Taux de conversion trial → paid** | 15%      | 25%       |
| **Churn mensuel**                   | < 8%     | < 5%      |

#### Phase 3 : Scale (Année 2)

| Objectif                                      | Cible    |
| --------------------------------------------- | -------- |
| **Utilisateurs actifs**                       | 5 000    |
| **ARR (Annual Recurring Revenue)**            | 500 000€ |
| **Part de marché PME/Consultants AO publics** | 5%       |

---

### Key Performance Indicators

#### KPIs Produit (Usage)

| KPI                           | Définition                                       | Fréquence | Cible     |
| ----------------------------- | ------------------------------------------------ | --------- | --------- |
| **Taux d'activation**         | % nouveaux users qui complètent 1 AO en 14 jours | Hebdo     | > 40%     |
| **Taux de complétion AO**     | % AO démarrés qui sont exportés                  | Hebdo     | > 75%     |
| **Fonctionnalités utilisées** | Nb moyen de features utilisées par session       | Mensuel   | > 5       |
| **Temps dans l'app**          | Durée moyenne par session                        | Mensuel   | 45-90 min |
| **Parsing RC utilisé**        | % AO utilisant le parsing automatique            | Mensuel   | > 80%     |

#### KPIs Valeur Utilisateur

| KPI                       | Définition                      | Fréquence | Cible           |
| ------------------------- | ------------------------------- | --------- | --------------- |
| **Heures économisées**    | (Baseline - Temps réel) × Nb AO | Mensuel   | > 20h/user/mois |
| **Taux de conformité**    | % dossiers sans pièce manquante | Mensuel   | 100%            |
| **Satisfaction parsing**  | Note sur extraction checklist   | Par AO    | > 4.2/5         |
| **Réutilisation données** | % contenu pré-rempli au 3ème AO | Mensuel   | > 50%           |

#### KPIs Business

| KPI                               | Définition                            | Fréquence   | Cible M12 |
| --------------------------------- | ------------------------------------- | ----------- | --------- |
| **CAC (Coût Acquisition Client)** | Dépenses marketing / Nouveaux clients | Mensuel     | < 50€     |
| **LTV (Lifetime Value)**          | ARPU × Durée moyenne client           | Trimestriel | > 300€    |
| **Ratio LTV/CAC**                 | Rentabilité acquisition               | Trimestriel | > 3       |
| **Taux de recommandation**        | % clients venant du bouche-à-oreille  | Mensuel     | > 30%     |

#### KPIs Qualité

| KPI                      | Définition                            | Fréquence | Cible   |
| ------------------------ | ------------------------------------- | --------- | ------- |
| **Uptime**               | Disponibilité de la plateforme        | Continu   | > 99.5% |
| **Temps de réponse IA**  | Latence moyenne du chat               | Continu   | < 3s    |
| **Précision parsing RC** | % pièces correctement identifiées     | Par RC    | > 95%   |
| **Tickets support/user** | Demandes d'aide par utilisateur actif | Mensuel   | < 0.5   |

---

### North Star Metric

**"Heures économisées par utilisateur par mois"**

Cette métrique unique capture :

- ✅ La valeur créée pour l'utilisateur (temps = argent pour PME/consultants)
- ✅ L'engagement produit (plus d'AO = plus d'heures économisées)
- ✅ La qualité du produit (meilleure IA = plus d'économie)
- ✅ La croissance business (plus d'heures économisées = plus de recommandations)

**Cible :** 25 heures économisées par utilisateur actif par mois (moyenne sur parc)

---

## MVP Scope

### Core Features

#### 1. Agent IA Conversationnel

| Fonctionnalité                  | Description                                                                         | Priorité |
| ------------------------------- | ----------------------------------------------------------------------------------- | :------: |
| **Chat guidé hybride**          | Questions adaptatives : structure de base + détours intelligents selon les réponses |    P1    |
| **Questions hybrides**          | Choix multiples d'abord, puis ouverture si "Autre" sélectionné                      |    P1    |
| **File d'attente intelligente** | Questions non répondues empilées, reproposées au moment opportun                    |    P1    |
| **Validation inline**           | L'IA reformule et demande confirmation avant d'ancrer l'information                 |    P2    |
| **Réponse assistée**            | Suggestions de démarrage pour questions ouvertes                                    |    P2    |
| **Profondeur adaptative**       | Expert → questions directes / Novice → plus d'exploration                           |    P2    |

#### 2. Intelligence Données & Réutilisation

| Fonctionnalité                 | Description                                                         | Priorité |
| ------------------------------ | ------------------------------------------------------------------- | :------: |
| **Profil entreprise évolutif** | Coffre-fort de données qui s'enrichit à chaque AO                   |    P1    |
| **Coffre-fort documents**      | Stockage sécurisé des pièces admin récurrentes (Kbis, attestations) |    P1    |
| **Templates intelligents**     | Pré-remplissage basé sur les patterns des AO passés                 |    P1    |
| **Capture post-AO**            | Proposition de sauvegarder les nouvelles infos après soumission     |    P2    |
| **Détection obsolescence**     | Alertes sur documents expirés ou données périmées                   |    P2    |
| **Score de complétude**        | Jauge visuelle du profil avec sections manquantes                   |    P3    |

#### 3. Parsing & Conformité AO

| Fonctionnalité                     | Description                                                        | Priorité |
| ---------------------------------- | ------------------------------------------------------------------ | :------: |
| **Parsing règlement consultation** | Extraction automatique de la liste des pièces exigées depuis le RC |    P1    |
| **Checklist conformité**           | Vérification automatique de toutes les pièces avant export         |    P1    |
| **Détection documents expirés**    | Alerte si un document sera périmé à la date de soumission          |    P1    |
| **Indicateur de confiance**        | Score par section : 🟢 confiant / 🟡 à vérifier / 🔴 manquant      |    P2    |

#### 4. Génération Document & Export

| Fonctionnalité            | Description                                                     | Priorité |
| ------------------------- | --------------------------------------------------------------- | :------: |
| **Preview interactive**   | Document qui se construit en temps réel pendant la conversation |    P1    |
| **Édition inline**        | Clic sur paragraphe → édition directe ou reformulation IA       |    P1    |
| **Export PDF + Word**     | Génération du dossier dans les deux formats                     |    P1    |
| **Dossier ZIP structuré** | Export complet : mémoire technique, annexes, offre financière   |    P1    |
| **Co-pilote suggestions** | Panneau latéral de suggestions contextuelles non-bloquantes     |    P2    |
| **Régénération ciblée**   | Alternatives de ton/style pour une section                      |    P3    |

#### 5. Interface 3 Colonnes

| Fonctionnalité                     | Description                                                                | Priorité |
| ---------------------------------- | -------------------------------------------------------------------------- | :------: |
| **Layout chat/contenu/modules**    | Gauche : chat IA / Centre : zone adaptative / Droite : modules progression |    P1    |
| **Indicateurs visuels section**    | 🟢 Complet / 🟡 À vérifier / 🔴 Manquant par module                        |    P1    |
| **Synchronisation chat ↔ modules** | Module surligné automatiquement selon la question en cours                 |    P2    |
| **Zone centrale adaptive**         | Contenu change selon contexte : données collectées + preview               |    P2    |
| **Fil d'ariane contextuel**        | Visualisation du parcours avec navigation rapide                           |    P3    |

#### 6. Onboarding & Archivage

| Fonctionnalité               | Description                                                          | Priorité |
| ---------------------------- | -------------------------------------------------------------------- | :------: |
| **3 modes de démarrage**     | Rapide (au fil de l'eau) / Import (anciens AO) / Manuel (formulaire) |    P1    |
| **Import intelligent**       | Extraction automatique des données depuis anciens AO PDF/Word        |    P2    |
| **Archivage intelligent**    | Sauvegarde automatique avec recherche dans l'historique              |    P2    |
| **Feedback post-soumission** | Demande du résultat (Gagné/Perdu) pour stats                         |    P3    |

---

### Out of Scope for MVP

#### Reporté en V2 : Collaboration Client

| Fonctionnalité                | Raison du report                        |
| ----------------------------- | --------------------------------------- |
| **Lien partage sécurisé**     | Complexité auth + UX secondaire         |
| **Vue client épurée**         | Dépend du système de partage            |
| **Annotations contextuelles** | Nécessite infrastructure temps réel     |
| **Statut validation visuel**  | Workflow à définir après validation MVP |
| **Notifications validation**  | Système de notifications à construire   |
| **Historique échanges**       | Stockage et UI dédiés                   |
| **Validation + signature**    | Implications légales à étudier          |
| **Comparaison versions**      | Complexité versioning                   |
| **Deadline validation**       | Scheduler et notifications              |
| **Export avec annotations**   | Format PDF complexe                     |

#### Également hors scope MVP

| Fonctionnalité                            | Raison                            |
| ----------------------------------------- | --------------------------------- |
| **Multi-utilisateurs par compte**         | Modèle 1 user = 1 compte pour MVP |
| **API publique**                          | Focus sur l'app web d'abord       |
| **Application mobile**                    | Web responsive suffisant pour MVP |
| **Intégration plateformes AO**            | Manuel (upload) pour MVP          |
| **Génération offre financière**           | Focus mémoire technique d'abord   |
| **IA générative pour rédaction complète** | Assistance, pas remplacement      |

---

### MVP Success Criteria

#### Critères de Validation (Go/No-Go pour V2)

| Critère                    | Seuil de succès                             | Méthode de mesure               |
| -------------------------- | ------------------------------------------- | ------------------------------- |
| **Adoption**               | 50 utilisateurs actifs en 3 mois            | Comptes avec 1+ AO complété     |
| **Rétention**              | 60% reviennent pour 2ème AO                 | Cohorte M1 → M2                 |
| **Temps économisé**        | Moyenne < 12h par AO                        | Tracking temps in-app           |
| **Zéro élimination admin** | 0% de dossiers rejetés pour pièce manquante | Feedback utilisateurs           |
| **NPS**                    | Score > 40                                  | Enquête post-AO                 |
| **Parsing précision**      | > 90% des pièces correctement identifiées   | Validation manuelle échantillon |

#### Signaux de Succès Qualitatifs

- Les utilisateurs recommandent spontanément l'outil (bouche-à-oreille)
- Les utilisateurs complètent plusieurs AO (pas juste un test)
- Les retours mentionnent le gain de temps comme valeur principale
- Les demandes de fonctionnalités concernent l'extension, pas les correctifs

#### Signaux d'Échec (Pivot nécessaire)

- Taux d'abandon > 50% avant premier AO complété
- Temps moyen > 20h par AO (pas de gain perçu)
- Parsing RC jugé imprécis (< 80% satisfaction)
- Utilisateurs préfèrent leur ancienne méthode

---

### Future Vision

#### V2 : Collaboration Client (M6-M12)

- Partage sécurisé avec le client pour validation
- Workflow d'approbation section par section
- Annotations et échanges intégrés
- Historique des versions et modifications

#### V3 : Intelligence Avancée (Année 2)

- IA générative pour rédaction de sections complètes
- Benchmark avec AO gagnants du même secteur
- Suggestions d'amélioration basées sur les résultats passés
- Prédiction du taux de succès avant soumission

#### V4 : Plateforme & Écosystème (Année 2-3)

- Intégration directe avec plateformes de marchés publics (PLACE, AWS, etc.)
- API pour intégration ERP/CRM
- Marketplace de templates par secteur
- Veille automatique sur nouveaux AO pertinents

#### Vision Long Terme

**"Devenir le co-pilote indispensable de toute PME qui répond aux marchés publics en France, puis en Europe."**

- Expansion géographique : Belgique, Suisse, puis UE
- Expansion sectorielle : Tous types d'AO publics
- Expansion fonctionnelle : De l'assistant rédaction à la plateforme complète de gestion des marchés publics
