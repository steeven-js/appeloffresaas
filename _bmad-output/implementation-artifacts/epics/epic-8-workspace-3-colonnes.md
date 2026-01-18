# Epic 8: Refonte Workspace 3 Colonnes

## Objectif

Refondre le layout `demand-workspace` pour passer d'une interface à onglets vers une interface conversationnelle à 3 colonnes, alignée avec la vision UX du produit.

## Documents de référence

- `_bmad-output/planning-artifacts/ux-workspace-specification.md`
- `_bmad-output/planning-artifacts/ux-workspace-migration.md`
- `_bmad-output/planning-artifacts/ux-workspace-mockup.html`

## Structure cible

```
┌──────────────┬────────────────────────────────┬────────────────┐
│   SIDEBAR    │         ZONE CENTRALE          │   CO-PILOTE    │
│   (260px)    │         (flex: 1)              │   (320px)      │
│              │                                │                │
│ Complétude   │ [Vue d'ensemble] [Chat]        │ Suggestions    │
│ Modules      │ [Preview] [Split]              │ Générations    │
│ Sections     │                                │ Alertes        │
│              │ Contenu selon mode             │ Aperçu mini    │
│              │                                │ Actions        │
└──────────────┴────────────────────────────────┴────────────────┘
```

---

## Stories

### Phase 1: Fondations

#### Story 8.1: WorkspaceLayout - Structure 3 colonnes
**Priorité**: P0
**Effort**: 0.5j

**Description**:
Créer le composant `WorkspaceLayout` qui définit la structure 3 colonnes responsive.

**Fichiers**:
- `src/components/workspace/workspace-layout.tsx` (nouveau)

**Critères d'acceptation**:
- [ ] Layout 3 colonnes (260px / flex / 320px)
- [ ] Responsive: sidebar drawer sur tablet, bottom nav sur mobile
- [ ] Props: sidebar, main, copilot (React nodes)

---

#### Story 8.2: ModuleSidebar - Navigation modules
**Priorité**: P0
**Effort**: 0.75j

**Description**:
Créer la sidebar avec liste des modules, jauge de complétude, et navigation.

**Fichiers**:
- `src/components/workspace/module-sidebar.tsx` (nouveau)
- `src/components/workspace/module-item.tsx` (nouveau)
- `src/components/workspace/completion-gauge.tsx` (nouveau)

**Critères d'acceptation**:
- [ ] Liste des modules avec indicateurs (●/◐/○)
- [ ] Jauge de complétude globale avec %
- [ ] Module actif visuellement distinct
- [ ] Clic module → callback vers parent
- [ ] Bouton retour aux dossiers
- [ ] Bouton ajouter section

---

### Phase 2: Zone Centrale

#### Story 8.3: CentralZone - Container 4 modes
**Priorité**: P0
**Effort**: 0.5j

**Description**:
Créer le composant `CentralZone` avec toggle entre les 4 modes d'affichage.

**Fichiers**:
- `src/components/workspace/central-zone.tsx` (nouveau)
- `src/components/workspace/zone-mode-toggle.tsx` (nouveau)

**Critères d'acceptation**:
- [ ] Toggle: Vue d'ensemble, Chat, Preview, Split
- [ ] Mode par défaut: Vue d'ensemble
- [ ] Affichage du module actif dans le header
- [ ] Transitions fluides entre modes

---

#### Story 8.4: OverviewDashboard - Vue d'ensemble
**Priorité**: P0
**Effort**: 0.5j

**Description**:
Extraire la vue "Vue d'ensemble" actuelle en composant standalone avec cards cliquables.

**Fichiers**:
- `src/components/workspace/overview-dashboard.tsx` (nouveau)

**Critères d'acceptation**:
- [ ] Reprend le layout actuel (cards Contexte, Description, etc.)
- [ ] Cards cliquables → bascule en mode Chat sur ce module
- [ ] Rendu markdown dans les cards
- [ ] Stats rapides en haut (service, contact, budget, date)

---

#### Story 8.5: Adaptation DemandChat
**Priorité**: P0
**Effort**: 0.5j

**Description**:
Adapter `DemandChatPanel` pour être utilisable dans la zone centrale (sans conteneur fixe).

**Fichiers**:
- `src/components/demands/demand-chat-panel.tsx` (modifier)

**Critères d'acceptation**:
- [ ] Composant pur sans positionnement fixe
- [ ] Accepte prop `activeModule` pour contexte
- [ ] S'adapte à la hauteur du parent
- [ ] Conserve toutes les fonctionnalités existantes

---

### Phase 3: Panneau Co-pilote

#### Story 8.6: CopilotPanel - Panneau suggestions
**Priorité**: P0
**Effort**: 0.75j

**Description**:
Créer le panneau co-pilote toujours visible avec suggestions, alertes, et actions rapides.

**Fichiers**:
- `src/components/workspace/copilot-panel.tsx` (nouveau)
- `src/components/workspace/copilot-card.tsx` (nouveau)

**Critères d'acceptation**:
- [ ] Cards: Suggestion (💡), Génération (✅), Alerte (⚠️), Erreur (❌)
- [ ] Actions sur les cards (Appliquer, Ignorer)
- [ ] Miniature document cliquable
- [ ] Actions rapides: Export PDF, Word, ZIP
- [ ] Priorité affichage: Erreurs > Alertes > Suggestions

---

### Phase 4: Assemblage

#### Story 8.7: Assemblage DemandWorkspace v2
**Priorité**: P0
**Effort**: 1j

**Description**:
Assembler tous les composants dans le nouveau `DemandWorkspaceV2` et le connecter aux données.

**Fichiers**:
- `src/components/demands/demand-workspace-v2.tsx` (nouveau)
- `src/lib/utils/completion-calculator.ts` (nouveau)

**Critères d'acceptation**:
- [ ] Intègre WorkspaceLayout, ModuleSidebar, CentralZone, CopilotPanel
- [ ] Calcul complétude par module et global
- [ ] Gestion état: module actif, mode vue, édition
- [ ] Clic module → focus chat contextuel
- [ ] Toutes les fonctionnalités existantes préservées

---

#### Story 8.8: Bascule route et nettoyage
**Priorité**: P1
**Effort**: 0.5j

**Description**:
Basculer la route `/demandes/[id]` vers le nouveau workspace et nettoyer l'ancien code.

**Fichiers**:
- `src/app/(auth)/demandes/[id]/page.tsx` (modifier)
- `src/components/demands/demand-workspace.tsx` (supprimer après validation)

**Critères d'acceptation**:
- [ ] Route utilise DemandWorkspaceV2
- [ ] Tests manuels: toutes fonctionnalités OK
- [ ] Ancien fichier supprimé
- [ ] Renommer v2 → demand-workspace.tsx

---

## Estimation totale

| Phase | Effort |
|-------|--------|
| Phase 1: Fondations | 1.25j |
| Phase 2: Zone Centrale | 1.5j |
| Phase 3: Co-pilote | 0.75j |
| Phase 4: Assemblage | 1.5j |
| **Total** | **5j** |

---

## Dépendances

- Aucune dépendance externe
- Composants existants à adapter: `DemandChatPanel`, `DocumentPreview`

## Risques

- Régression fonctionnelle → Garder ancien code jusqu'à validation
- Performance → Lazy loading si nécessaire
- Responsive → Tester sur tous breakpoints
