# Wizard de Rédaction IA - Package Complet

**Date de création:** 2026-01-18
**Session:** Brainstorming avec Steeven
**Statut:** Spécifications complètes, prêt pour implémentation

---

## 📋 Résumé Exécutif

Ce package contient les spécifications complètes pour transformer l'interaction chat actuelle en un **Wizard de rédaction guidé** qui :

- **Guide l'utilisateur** étape par étape avec des questions précises
- **Propose des options** plutôt que des champs ouverts
- **Assemble automatiquement** les réponses en texte professionnel
- **Sauvegarde en temps réel** chaque réponse
- **Adapte les livrables** selon le type de besoin

---

## 📁 Contenu du Package

| Fichier | Description |
|---------|-------------|
| `01-specifications-techniques.md` | Architecture, flux, types de questions, schéma DB |
| `02-structure-fichiers.md` | Fichiers à créer/modifier, code de référence |
| `03-questions-completes.yaml` | Configuration complète des 5 modules avec toutes les questions |
| `04-wireframes.md` | Maquettes ASCII détaillées de tous les écrans |

---

## 🎯 Décisions Clés

| Aspect | Choix |
|--------|-------|
| **Structure** | Modules avec sous-étapes (hybride) |
| **Navigation** | Sidebar cliquable (libre) |
| **Questions** | Fragmentées → Assemblage IA |
| **Progression** | Barre linéaire + pourcentage |
| **Réponses** | Cards validées avec bouton edit |
| **Preview** | Temps réel (colonne droite) |
| **Validation** | Fin de module avec modal |
| **Sauvegarde** | Auto-save à chaque réponse |
| **Données** | Réponses individuelles + texte final |
| **Livrables** | Format adaptatif par type de besoin |

---

## 🚀 Plan d'Implémentation

### Phase 1: Foundation (Backend) - ~2-3 jours
- [ ] Modifier `schema.ts` (wizardState, answers)
- [ ] Créer `wizard-types.ts`
- [ ] Créer `wizard-config.ts`
- [ ] Créer `wizard.ts` router
- [ ] Ajouter au root router

### Phase 2: Core UI - ~3-4 jours
- [ ] Créer `wizard-container.tsx`
- [ ] Créer `wizard-sidebar.tsx`
- [ ] Créer `wizard-progress-bar.tsx`
- [ ] Créer `wizard-question.tsx`
- [ ] Créer `use-wizard.ts` hook

### Phase 3: Question Components - ~2-3 jours
- [ ] `question-text.tsx`
- [ ] `question-textarea.tsx`
- [ ] `question-radio.tsx`
- [ ] `question-checkbox.tsx`
- [ ] `question-select.tsx`
- [ ] `question-number.tsx`
- [ ] `question-date.tsx`

### Phase 4: Preview & Validation - ~2-3 jours
- [ ] `wizard-preview.tsx`
- [ ] `wizard-answer-card.tsx`
- [ ] `wizard-module-complete.tsx`
- [ ] `wizard-prompts.ts`

### Phase 5: Integration - ~2-3 jours
- [ ] Modifier page `demandes/[id]`
- [ ] Modifier `create-demand-dialog`
- [ ] Tests E2E
- [ ] Polish & bugfixes

**Estimation totale:** 11-16 jours de développement

---

## 📊 Métriques de Succès

| Métrique | Objectif |
|----------|----------|
| Taux de complétion | > 80% |
| Temps moyen | < 15 min |
| Qualité perçue | > 4/5 |
| Régénérations | < 2/module |
| Modifications post-IA | < 20% |

---

## 🔗 Prochaines Étapes

1. **Review** des spécifications avec l'équipe
2. **Création d'un epic** dans le backlog
3. **Découpage en stories** selon les phases
4. **Démarrage Phase 1** (backend)

---

*Package généré lors de la session de brainstorming du 2026-01-18*
