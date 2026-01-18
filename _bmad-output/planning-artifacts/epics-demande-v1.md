# Epics MVP - Dossier de Demande

> **Vision Produit V1** : Aider le CHEF à créer un dossier de demande professionnel (PDF) pour transmission à l'Administration, qui créera ensuite l'appel d'offres.

**Date** : 2026-01-17
**Statut** : Refactoring depuis MVP "Réponse AO" vers "Dossier Demande"

---

## Parcours Utilisateur Cible

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     PARCOURS CHEF - DOSSIER DE DEMANDE                       │
└──────────────────────────────────────────────────────────────────────────────┘

  CHEF                                                          ADMINISTRATION
  ────                                                          ──────────────
    │                                                                  │
    │  1. Connexion                                                    │
    │     └── Epic 1 ✅ (déjà fait)                                    │
    │                                                                  │
    │  2. Créer nouvelle demande                                       │
    │     └── Epic 3 🔄 (à refactorer)                                 │
    │                                                                  │
    │  3. Rédiger avec aide IA                                         │
    │     └── Epic 5 🔄 (à adapter)                                    │
    │                                                                  │
    │  4. Éditer & structurer                                          │
    │     └── Epic 6 🔄 (à adapter)                                    │
    │                                                                  │
    │  5. Exporter PDF                                                 │
    │     └── Epic 7 🔄 (à adapter)                                    │
    │                                                                  │
    │  📄 Dossier de Demande ─────────────────────────────────────────▶│
    │     (PDF structuré)                                              │
    │                                                                  │
    │                                                    Crée l'AO ────┘
```

---

## Epics Conservés (déjà terminés)

| Epic | Nom | Statut | Notes |
|------|-----|--------|-------|
| 0 | Project Foundation | ✅ Done | Aucun changement |
| 1 | Authentification & Gestion Compte | ✅ Done | Aucun changement |
| 1.5 | Dashboard Shell & App Layout | ✅ Done | Aucun changement |
| 2 | Profil Entreprise & Coffre-fort | ✅ Done | Réutilisable pour infos demandeur |

---

## Epic 4 - SUPPRIMÉ

> **Raison** : Le parsing RC et la checklist conformité ne sont pas pertinents pour un dossier de DEMANDE (on crée le besoin, on ne répond pas à un AO existant).

**Code à supprimer** :
- `src/server/services/ai/rc-parser.ts`
- `src/server/services/pdf/pdf-parser.ts`
- `src/server/inngest/functions/parse-rc.ts`
- `src/server/db/schema/parsed-data.ts`
- `src/components/tenders/rc-parsing-status.tsx`
- `src/components/tenders/required-documents-list.tsx`
- `src/components/tenders/categorized-documents-list.tsx`
- `src/components/tenders/submission-format-card.tsx`
- `src/components/tenders/extracted-deadline-card.tsx`
- Routes et mutations liées au parsing RC

---

## Epic 3 : Création Dossier de Demande (REFACTORING)

> **Objectif** : Permettre au CHEF de créer et gérer ses dossiers de demande.

### Refactoring requis

| Actuel | Nouveau |
|--------|---------|
| `tender_projects` | `demand_projects` |
| `tender_documents` | `demand_documents` |
| `/projects` | `/demandes` |
| `tenderProjects` router | `demandProjects` router |
| `ProjectWorkspace` | `DemandeWorkspace` |

### Story 3.1 : Création Nouvelle Demande

**En tant que** CHEF,
**Je veux** créer un nouveau dossier de demande,
**Afin de** formaliser mon besoin pour l'Administration.

**Critères d'acceptation :**
1. Formulaire avec champs : titre, service demandeur, responsable
2. Sélection du type de besoin (fourniture, service, travaux, etc.)
3. Indication du niveau d'urgence (normal, urgent, critique)
4. Sauvegarde en brouillon automatique
5. Redirection vers le workspace de demande

**Champs du formulaire :**
- Titre de la demande (obligatoire)
- Référence interne (optionnel)
- Service demandeur (obligatoire)
- Nom du responsable (obligatoire)
- Email de contact (obligatoire)
- Type de besoin (select)
- Niveau d'urgence (select)

---

### Story 3.2 : Informations du Besoin

**En tant que** CHEF,
**Je veux** décrire mon besoin en détail,
**Afin que** l'Administration comprenne exactement ce que je demande.

**Critères d'acceptation :**
1. Section "Contexte & Justification" (pourquoi ce besoin)
2. Section "Description du besoin" (quoi exactement)
3. Section "Contraintes" (techniques, légales, délais)
4. Sauvegarde automatique à chaque modification

---

### Story 3.3 : Budget et Délais

**En tant que** CHEF,
**Je veux** indiquer le budget estimé et les délais souhaités,
**Afin que** l'Administration calibre l'appel d'offres.

**Critères d'acceptation :**
1. Champ budget estimé (montant ou fourchette)
2. Date de livraison souhaitée (datepicker)
3. Justification du délai si urgent
4. Indication si budget déjà validé ou à valider

---

### Story 3.4 : Liste des Demandes

**En tant que** CHEF,
**Je veux** voir toutes mes demandes avec leur statut,
**Afin de** suivre leur avancement.

**Critères d'acceptation :**
1. Liste avec colonnes : titre, date, statut, urgence
2. Filtres par statut
3. Recherche par titre
4. Tri par date/statut/urgence
5. Actions rapides (ouvrir, dupliquer, supprimer)

**Statuts :**
- `draft` : Brouillon
- `in_review` : En relecture
- `approved` : Validé CHEF
- `sent_to_admin` : Envoyé à l'Administration
- `converted_to_ao` : Converti en AO

---

### Story 3.5 : Duplication de Demande

**En tant que** CHEF,
**Je veux** dupliquer une demande existante,
**Afin de** réutiliser une structure pour un besoin similaire.

**Critères d'acceptation :**
1. Bouton "Dupliquer" sur chaque demande
2. Copie de tous les champs sauf titre et dates
3. Nouveau titre avec suffixe "(copie)"
4. Statut remis à "draft"

---

### Story 3.6 : Suppression de Demande

**En tant que** CHEF,
**Je veux** supprimer une demande,
**Afin de** nettoyer mes brouillons inutiles.

**Critères d'acceptation :**
1. Confirmation avant suppression
2. Suppression impossible si statut "sent_to_admin" ou "converted_to_ao"
3. Suppression des documents associés

---

### Story 3.7 : Archivage de Demande

**En tant que** CHEF,
**Je veux** archiver une demande terminée,
**Afin de** garder un historique sans encombrer ma liste active.

**Critères d'acceptation :**
1. Action "Archiver" disponible pour demandes converties
2. Vue séparée des archives
3. Possibilité de désarchiver

---

## Epic 5 : Assistant IA Rédaction (REFACTORING)

> **Objectif** : Aider le CHEF à formaliser et rédiger son dossier de demande grâce à l'IA.

### Story 5.1 : Interface Chat Conversationnelle

**En tant que** CHEF,
**Je veux** interagir avec un assistant IA via chat,
**Afin de** être guidé dans la rédaction de ma demande.

**Critères d'acceptation :**
1. Interface chat dans le workspace
2. Historique des messages persistant
3. L'IA pose des questions pour comprendre le besoin
4. Réponses sauvegardées dans les champs correspondants

---

### Story 5.2 : Génération de Brouillon

**En tant que** CHEF,
**Je veux** que l'IA génère un premier brouillon de section,
**Afin de** gagner du temps sur la rédaction.

**Critères d'acceptation :**
1. Bouton "Générer avec IA" sur chaque section
2. Brouillon basé sur les infos déjà saisies
3. Possibilité d'accepter, modifier ou rejeter
4. Indication claire que c'est une proposition IA

---

### Story 5.3 : Reformulation de Texte

**En tant que** CHEF,
**Je veux** que l'IA améliore mon texte,
**Afin de** avoir un rendu plus professionnel.

**Critères d'acceptation :**
1. Sélection de texte + bouton "Reformuler"
2. L'IA propose une version améliorée
3. Comparaison avant/après
4. Accepter ou garder l'original

---

### Story 5.4 : Questions de Relance

**En tant que** CHEF,
**Je veux** que l'IA me signale les informations manquantes,
**Afin de** compléter mon dossier.

**Critères d'acceptation :**
1. Analyse automatique des sections incomplètes
2. Questions ciblées pour chaque lacune
3. Indicateur de complétude par section
4. Notification des champs critiques manquants

---

### Story 5.5 : Import Document Existant

**En tant que** CHEF,
**Je veux** importer un ancien document de demande,
**Afin de** pré-remplir les champs automatiquement.

**Critères d'acceptation :**
1. Upload de PDF ou Word
2. L'IA extrait les informations clés
3. Mapping vers les champs du formulaire
4. Validation manuelle des données extraites

---

### Story 5.6 : Suggestions de Critères

**En tant que** CHEF,
**Je veux** que l'IA suggère des critères de sélection,
**Afin d'** aider l'Administration à définir l'AO.

**Critères d'acceptation :**
1. Section "Critères suggérés" dans le dossier
2. L'IA propose des critères basés sur le type de besoin
3. Pondérations suggérées
4. Le CHEF peut modifier/ajouter/supprimer

---

## Epic 6 : Éditeur de Demande (REFACTORING)

> **Objectif** : Permettre au CHEF d'éditer et structurer son dossier de demande de manière professionnelle.

### Story 6.1 : Éditeur Riche (TipTap)

**En tant que** CHEF,
**Je veux** un éditeur de texte riche,
**Afin de** formater mon contenu (gras, listes, titres).

**Critères d'acceptation :**
1. Éditeur TipTap intégré
2. Toolbar avec formatage de base
3. Sauvegarde automatique
4. Mode plein écran

---

### Story 6.2 : Templates par Secteur

**En tant que** CHEF,
**Je veux** choisir un template adapté à mon secteur,
**Afin d'** avoir une structure pertinente.

**Critères d'acceptation :**
1. Sélection de template à la création
2. Templates : IT/Logiciel, BTP, Services, Formation, Fournitures
3. Template générique par défaut
4. Sections pré-définies selon le template

---

### Story 6.3 : Structure Flexible

**En tant que** CHEF,
**Je veux** réorganiser les sections de mon dossier,
**Afin de** l'adapter à mon besoin spécifique.

**Critères d'acceptation :**
1. Drag & drop des sections
2. Ajout de sections personnalisées
3. Suppression de sections optionnelles
4. Renommage des sections

---

### Story 6.4 : Preview Temps Réel

**En tant que** CHEF,
**Je veux** voir un aperçu du PDF pendant la rédaction,
**Afin de** visualiser le rendu final.

**Critères d'acceptation :**
1. Panel de preview à droite ou en split
2. Mise à jour en temps réel
3. Zoom et navigation dans le preview
4. Toggle pour afficher/masquer

---

### Story 6.5 : Insertion Images et Tableaux

**En tant que** CHEF,
**Je veux** insérer des images et tableaux,
**Afin d'** illustrer mon besoin (schémas, planning).

**Critères d'acceptation :**
1. Upload d'images (drag & drop)
2. Création de tableaux simples
3. Redimensionnement des images
4. Légendes optionnelles

---

### Story 6.6 : Gestion des Annexes

**En tant que** CHEF,
**Je veux** ajouter des annexes à mon dossier,
**Afin de** joindre des documents complémentaires.

**Critères d'acceptation :**
1. Section "Annexes" dédiée
2. Upload de fichiers (PDF, images, Excel)
3. Ordre des annexes personnalisable
4. Référencement automatique dans le corps du document

---

## Epic 7 : Export PDF Demande (REFACTORING)

> **Objectif** : Générer un PDF professionnel prêt à envoyer à l'Administration.

### Story 7.1 : Export PDF Structuré

**En tant que** CHEF,
**Je veux** exporter mon dossier en PDF,
**Afin de** l'envoyer à l'Administration.

**Critères d'acceptation :**
1. Génération PDF haute qualité
2. Mise en page professionnelle
3. Polices et marges cohérentes
4. Téléchargement immédiat

---

### Story 7.2 : Page de Garde Automatique

**En tant que** CHEF,
**Je veux** une page de garde générée automatiquement,
**Afin de** présenter le dossier de manière professionnelle.

**Critères d'acceptation :**
1. Logo de l'organisation (si disponible)
2. Titre de la demande
3. Service demandeur
4. Date de création
5. Référence interne

---

### Story 7.3 : Sommaire Automatique

**En tant que** CHEF,
**Je veux** un sommaire généré automatiquement,
**Afin de** faciliter la navigation dans le document.

**Critères d'acceptation :**
1. Table des matières avec numéros de page
2. Liens cliquables (PDF interactif)
3. Mise à jour automatique selon les sections
4. Numérotation cohérente (1. / 1.1 / 1.1.1)

---

### Story 7.4 : En-têtes et Pieds de Page

**En tant que** CHEF,
**Je veux** des en-têtes et pieds de page sur chaque page,
**Afin d'** avoir un document professionnel.

**Critères d'acceptation :**
1. En-tête : titre du document ou logo
2. Pied de page : numéro de page / total
3. Date de génération
4. Référence du dossier

---

### Story 7.5 : Export Word (DOCX)

**En tant que** CHEF,
**Je veux** exporter en format Word,
**Afin de** permettre des modifications ultérieures.

**Critères d'acceptation :**
1. Export DOCX fidèle au contenu
2. Styles Word appliqués
3. Images et tableaux conservés
4. Modifiable dans Microsoft Word

---

### Story 7.6 : Nommage Automatique des Fichiers

**En tant que** CHEF,
**Je veux** que les fichiers soient nommés automatiquement,
**Afin de** respecter une convention claire.

**Critères d'acceptation :**
1. Format : `DEMANDE_[REF]_[TITRE]_[DATE].pdf`
2. Caractères spéciaux nettoyés
3. Date au format YYYYMMDD
4. Configurable dans les préférences

---

### Story 7.7 : Vérification Pré-Export

**En tant que** CHEF,
**Je veux** vérifier la complétude avant export,
**Afin de** ne pas envoyer un dossier incomplet.

**Critères d'acceptation :**
1. Checklist des champs obligatoires
2. Alerte si sections vides ou incomplètes
3. Possibilité de forcer l'export malgré les alertes
4. Rapport de complétude en pourcentage

---

### Story 7.8 : Archive ZIP Complète

**En tant que** CHEF,
**Je veux** télécharger un ZIP avec tous les fichiers,
**Afin d'** avoir le dossier complet en un clic.

**Critères d'acceptation :**
1. ZIP contenant : PDF principal, annexes, Word (optionnel)
2. Structure de dossiers claire
3. Fichier README avec liste des contenus
4. Nommage du ZIP cohérent

---

## Roadmap de Refactoring

### Sprint R1 : Base de données et Renommage (1 semaine)

- [ ] Migration : renommer `tender_projects` → `demand_projects`
- [ ] Migration : renommer `tender_documents` → `demand_documents`
- [ ] Ajouter nouveaux champs (context, constraints, urgencyLevel, etc.)
- [ ] Supprimer table `rc_parsed_data`
- [ ] Renommer routers tRPC
- [ ] Renommer routes Next.js

### Sprint R2 : Suppression Code Epic 4 (2-3 jours)

- [ ] Supprimer composants RC parsing
- [ ] Supprimer services AI/PDF parsing
- [ ] Supprimer Inngest function
- [ ] Nettoyer imports et dépendances
- [ ] Vérifier build

### Sprint R3 : Adapter Epic 3 (1 semaine)

- [ ] Story 3.1 : Nouveau formulaire création
- [ ] Story 3.2 : Section informations besoin
- [ ] Story 3.3 : Budget et délais
- [ ] Story 3.4 : Liste avec nouveaux statuts

### Sprint R4 : Epic 5 - Assistant IA (2 semaines)

- [ ] Story 5.1 : Interface chat
- [ ] Story 5.2 : Génération brouillon
- [ ] Story 5.3 : Reformulation
- [ ] Story 5.4 : Questions relance

### Sprint R5 : Epic 6 - Éditeur (1-2 semaines)

- [ ] Story 6.1 : TipTap éditeur
- [ ] Story 6.2 : Templates
- [ ] Story 6.4 : Preview temps réel

### Sprint R6 : Epic 7 - Export (1 semaine)

- [ ] Story 7.1 : Export PDF
- [ ] Story 7.2 : Page de garde
- [ ] Story 7.3 : Sommaire
- [ ] Story 7.7 : Vérification pré-export

---

## Résumé des Changements

| Aspect | Avant (AO Response) | Après (Demande) |
|--------|--------------------|-----------------|
| **Utilisateur cible** | Entreprise qui répond | CHEF qui demande |
| **Document produit** | Dossier de réponse | Dossier de demande |
| **Destinataire** | Plateforme PLACE | Administration interne |
| **Input principal** | RC à parser | Besoin à formaliser |
| **Aide IA** | Conformité checklist | Rédaction du besoin |
| **Output** | Réponse AO complète | PDF de demande |

---

*Document généré le 2026-01-17*
*Refactoring MVP : Réponse AO → Dossier de Demande*
