# UX Specification : Workspace 3 Colonnes

**Document** : Extension de ux-design-specification.md
**Date** : 2026-01-18
**Auteur** : Steeven + Claude (UX Facilitator)
**Statut** : Draft pour validation

---

## 1. Vue d'ensemble

### 1.1 Objectif

Refondre le layout du `demand-workspace` pour passer d'une interface à onglets vers une interface conversationnelle à 3 colonnes, alignée avec la vision UX du produit : **"Converser avec un expert IA qui construit mon dossier AO en temps réel"**.

### 1.2 Principes directeurs

1. **Conversation au centre** — L'interaction IA est le cœur de l'expérience
2. **Modules accessibles en 1 clic** — Navigation instantanée vers chaque section
3. **Co-pilote toujours présent** — Suggestions et aperçu sans action requise
4. **Progression visible** — Indicateurs visuels de complétude par module

---

## 2. Architecture du Layout

### 2.1 Structure globale

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER COMPACT (56px)                                                    │
│ ← Titre · Réf · [Badges] · Actions condensées                           │
├──────────────┬────────────────────────────────────┬─────────────────────┤
│   SIDEBAR    │         ZONE CENTRALE              │     CO-PILOTE       │
│   MODULES    │         (flex: 1)                  │     (320px)         │
│   (260px)    │                                    │                     │
│   ─────────  │  ┌──────────────────────────────┐  │  ┌───────────────┐  │
│              │  │                              │  │  │ 💡 Suggestion │  │
│  Complétude  │  │   CHAT ou PREVIEW            │  │  │ ───────────── │  │
│  ████░░ 67%  │  │   (toggleable)               │  │  │ Le RC exige   │  │
│              │  │                              │  │  │ une politique │  │
│  ─────────── │  │                              │  │  │ RSE...        │  │
│              │  │                              │  │  │               │  │
│  MODULES     │  │                              │  │  │ [Appliquer]   │  │
│  ● Infos     │  │                              │  │  └───────────────┘  │
│  ● Contexte  │  │                              │  │                     │
│  ● Descript. │  │                              │  │  ┌───────────────┐  │
│  ● Contraint │  │                              │  │  │ ✅ Génération │  │
│  ○ Budget    │  └──────────────────────────────┘  │  │ Section mise  │  │
│  ○ Documents │                                    │  │ à jour        │  │
│  ○ Sections  │  [___________________________] [▶] │  └───────────────┘  │
│              │                                    │                     │
│  ─────────── │                                    │  ┌───────────────┐  │
│  [+ Nouveau] │                                    │  │ 📄 Aperçu     │  │
│              │                                    │  │ Miniature doc │  │
└──────────────┴────────────────────────────────────┴─────────────────────┘
```

### 2.2 Dimensions et breakpoints

| Zone | Desktop ≥1440px | Laptop 1280-1439px | Tablet 1024-1279px | Mobile <1024px |
|------|-----------------|--------------------|--------------------|----------------|
| **Sidebar** | 260px fixe | 240px fixe | Drawer (hamburger) | Bottom nav |
| **Centre** | flex: 1 (min 480px) | flex: 1 | 100% - co-pilote | 100% |
| **Co-pilote** | 320px fixe | 300px fixe | 280px (overlay toggle) | Sheet bottom |

### 2.3 Comportement responsive

- **≥1440px** : 3 colonnes simultanées
- **1280-1439px** : 3 colonnes, sidebar et co-pilote légèrement réduits
- **1024-1279px** : Sidebar en drawer, co-pilote en overlay (toggle)
- **<1024px** : Navigation bottom, co-pilote en sheet

---

## 3. Sidebar Modules (Colonne Gauche)

### 3.1 Structure

```
┌─────────────────────────┐
│ ← Retour aux dossiers   │
├─────────────────────────┤
│                         │
│  COMPLÉTUDE             │
│  ┌───────────────────┐  │
│  │████████████░░░░░░░│  │
│  └───────────────────┘  │
│       67% complet       │
│   12 / 18 éléments      │
│                         │
├─────────────────────────┤
│                         │
│  MODULES                │
│                         │
│  ● Informations      →  │
│  ● Contexte          →  │
│  ● Description       →  │
│  ◐ Contraintes       →  │
│  ○ Budget & Délais   →  │
│  ○ Documents         →  │
│                         │
├─────────────────────────┤
│                         │
│  SECTIONS RÉDACTION     │
│                         │
│  ○ Méthodologie      →  │
│  ○ Références        →  │
│  ○ Équipe projet     →  │
│  ○ Offre financière  →  │
│                         │
├─────────────────────────┤
│                         │
│  [+ Ajouter section]    │
│                         │
└─────────────────────────┘
```

### 3.2 Liste des modules

| Module | Icône | Champs trackés | Calcul complétude |
|--------|-------|----------------|-------------------|
| **Informations générales** | FileText | title, reference, departmentName, contactName, contactEmail, needType | 6 champs |
| **Contexte & Justification** | MessageSquare | context (min 100 chars) | 1 champ |
| **Description du besoin** | ClipboardList | description (min 100 chars) | 1 champ |
| **Contraintes** | AlertTriangle | constraints (min 50 chars) | 1 champ |
| **Budget & Délais** | Banknote | budgetRange, estimatedAmount, desiredDeliveryDate, budgetValidated | 4 champs |
| **Documents / Annexes** | Paperclip | ≥1 document uploadé | 1 condition |
| **Sections rédaction** | Edit | sections[].content non vide | N sections |

### 3.3 Indicateurs visuels

| État | Icône | Couleur | Signification |
|------|-------|---------|---------------|
| **Complet** | ● (cercle plein) | `--success` (#22C55E) | 100% des champs remplis |
| **En cours** | ◐ (demi-cercle) | `--warning` (#F59E0B) | 1-99% des champs remplis |
| **Vide** | ○ (cercle vide) | `--muted` | 0% des champs remplis |
| **Actif** | Fond `primary/10` + bordure gauche `primary` | - | Module sélectionné |

### 3.4 Comportement au clic

Quand l'utilisateur clique sur un module :

1. **Visuel** : Le module passe en état "actif" (fond coloré + bordure)
2. **Chat contextuel** : L'IA envoie un message d'introduction pour ce module
   - Ex: "Parlons du **contexte** de votre besoin. Pourquoi ce projet est-il nécessaire ?"
3. **Zone centrale** : Si en mode "preview", bascule vers "chat"
4. **Co-pilote** : Met à jour les suggestions pour ce module

### 3.5 Jauge de complétude

```tsx
interface CompletionGaugeProps {
  percentage: number;        // 0-100
  completedItems: number;    // ex: 12
  totalItems: number;        // ex: 18
  variant: "linear" | "circular";
}
```

Calcul :
```
percentage = (champsRemplis / champsTotal) * 100
```

---

## 4. Zone Centrale (Chat / Preview)

### 4.1 Modes d'affichage

| Mode | Description | Icône | Usage principal |
|------|-------------|-------|-----------------|
| **Vue d'ensemble** | Dashboard avec cards (infos, contexte, description, contraintes, budget) | 📊 | Vue globale du dossier, lecture rapide |
| **Chat** | Conversation IA pleine largeur | 💬 | Interaction et rédaction guidée |
| **Preview** | Aperçu document pleine largeur | 📄 | Relecture du document final |
| **Split** | 50/50 chat à gauche, preview à droite | ⚡ | Rédaction avec aperçu temps réel |

**Mode par défaut** : Vue d'ensemble (pour les utilisateurs qui consultent)
**Mode recommandé pour rédaction** : Chat ou Split

### 4.2 Header de zone centrale

```
┌──────────────────────────────────────────────────────────────────────┐
│ [📊 Vue d'ensemble] [💬 Chat] [📄 Preview] [⚡ Split]   Module: Contexte │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 Vue d'ensemble (Dashboard)

Cette vue reprend le layout actuel "Vue d'ensemble" avec les cards :

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Contexte & Justification    │  │ Description du besoin       │  │
│  │ ─────────────────────────── │  │ ─────────────────────────── │  │
│  │ Dans le cadre de la         │  │ Acquisition d'une solution  │  │
│  │ modernisation de notre SI...│  │ logicielle de gestion...    │  │
│  │                             │  │                             │  │
│  │ • Des délais importants     │  │                             │  │
│  │ • Des erreurs fréquentes    │  │                             │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Contraintes identifiées     │  │ 💰 Budget & Délais          │  │
│  │ ─────────────────────────── │  │ ─────────────────────────── │  │
│  │ **Contraintes techniques:** │  │ Fourchette: 80-120k EUR     │  │
│  │ • Intégration SIRH SAP      │  │ Montant: 100 000 EUR        │  │
│  │ • Compatibilité navigateurs │  │ Date: 31/08/2025            │  │
│  │                             │  │ Statut: ✅ Validé           │  │
│  │ **Contraintes réglement.:** │  │                             │  │
│  │ • Conformité RGPD           │  │ ⚠️ Justification urgence    │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Statut & Actions                                             │   │
│  │ [Brouillon ▾]  [En validation ▾]  [Envoyé ▾]                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Comportement des cards en Vue d'ensemble :**
- Clic sur une card → Bascule en mode Chat avec focus sur ce module
- Bouton "Modifier" sur chaque card → Mode édition inline (comme actuellement)
- Contenu affiché avec rendu markdown (listes, bold, italic)

### 4.3 Zone Chat

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 🤖 Bonjour ! Je suis votre assistant pour ce        │   │
│   │    dossier d'appel d'offres. Commençons par le      │   │
│   │    contexte de votre besoin.                        │   │
│   │                                                     │   │
│   │    Pourquoi ce projet est-il nécessaire pour        │   │
│   │    votre organisation ?                             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                     ┌───────────────────────────────────┐   │
│                     │ 👤 Dans le cadre de la           │   │
│                     │    modernisation de notre SI...  │   │
│                     └───────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 🤖 Excellent ! Je comprends que vous souhaitez      │   │
│   │    moderniser votre système d'information.          │   │
│   │                                                     │   │
│   │    ✅ J'ai mis à jour la section "Contexte"         │   │
│   │                                                     │   │
│   │    Quels problèmes rencontrez-vous actuellement ?   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [📎] [______________________________________] [Envoyer ▶]   │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Zone Preview

Utilise le composant `DocumentPreview` existant avec les améliorations :

- Sections cliquables → clic = focus chat sur cette section
- Indicateurs de génération en cours (shimmer effect)
- Badge "Dernière mise à jour" par section

---

## 5. Panneau Co-pilote (Colonne Droite)

### 5.1 Structure

```
┌─────────────────────────────┐
│ CO-PILOTE              [?]  │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ 💡 SUGGESTION           │ │
│ │ ─────────────────────── │ │
│ │ Le RC mentionne une     │ │
│ │ exigence RSE. Pensez à  │ │
│ │ inclure votre politique │ │
│ │ environnementale.       │ │
│ │                         │ │
│ │ [Appliquer] [Ignorer]   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ✅ GÉNÉRATION           │ │
│ │ ─────────────────────── │ │
│ │ Section "Contexte"      │ │
│ │ mise à jour en temps    │ │
│ │ réel.                   │ │
│ │                         │ │
│ │ Confiance: 92%          │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⚠️ ALERTE               │ │
│ │ ─────────────────────── │ │
│ │ Attestation URSSAF      │ │
│ │ expire dans 15 jours.   │ │
│ │                         │ │
│ │ [Uploader nouveau]      │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│                             │
│ 📄 APERÇU DOCUMENT          │
│ ┌─────────────────────────┐ │
│ │ ┌───────────────────┐   │ │
│ │ │ Miniature         │   │ │
│ │ │ du document       │   │ │
│ │ │ généré            │   │ │
│ │ └───────────────────┘   │ │
│ │                         │ │
│ │ [Voir en grand]         │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│                             │
│ ⚡ ACTIONS RAPIDES          │
│                             │
│ [📥 Exporter PDF]           │
│ [📄 Exporter Word]          │
│ [📦 Exporter ZIP]           │
│                             │
└─────────────────────────────┘
```

### 5.2 Types de cartes Co-pilote

| Type | Icône | Couleur bordure | Actions |
|------|-------|-----------------|---------|
| **Suggestion** | 💡 Lightbulb | `--primary` | Appliquer, Ignorer |
| **Génération** | ✅ Check | `--success` | Voir section |
| **Alerte** | ⚠️ AlertTriangle | `--warning` | Action contextuelle |
| **Erreur** | ❌ XCircle | `--destructive` | Corriger |

### 5.3 Comportement des suggestions

Les suggestions sont générées par l'IA basées sur :
1. Le RC parsé (si disponible)
2. Les champs manquants
3. Les bonnes pratiques AO
4. L'historique de l'entreprise (profil)

Priorité d'affichage : Erreurs > Alertes > Suggestions > Générations

### 5.4 Aperçu document miniature

- Affiche une miniature cliquable du document en cours
- Clic → ouvre le mode Preview dans la zone centrale
- Badge avec % de complétude du document

---

## 6. Composants à créer

### 6.1 Nouveaux composants

| Composant | Emplacement | Description |
|-----------|-------------|-------------|
| `WorkspaceLayout` | `components/workspace/` | Layout 3 colonnes |
| `ModuleSidebar` | `components/workspace/` | Sidebar avec modules |
| `ModuleItem` | `components/workspace/` | Item de module avec indicateur |
| `CompletionGauge` | `components/workspace/` | Jauge de progression |
| `CopilotPanel` | `components/workspace/` | Panneau co-pilote |
| `CopilotCard` | `components/workspace/` | Carte suggestion/alerte |
| `CentralZone` | `components/workspace/` | Zone chat/preview toggleable |
| `ZoneModeToggle` | `components/workspace/` | Toggle chat/preview/split |

### 6.2 Composants à adapter

| Composant existant | Modification |
|--------------------|--------------|
| `DemandChatPanel` | Extraire en composant standalone sans le conteneur fixe |
| `DocumentPreview` | Ajouter sections cliquables + badges mise à jour |
| `SectionEditor` | Intégrer dans le flux chat (inline editing) |

---

## 7. États et interactions

### 7.1 États du workspace

```typescript
interface WorkspaceState {
  // Module actif
  activeModule: ModuleId | null;

  // Mode d'affichage central
  centralMode: "chat" | "preview" | "split";

  // Complétude
  completion: {
    overall: number;
    byModule: Record<ModuleId, number>;
  };

  // Suggestions co-pilote
  copilotItems: CopilotItem[];

  // État d'édition
  isEditing: boolean;
  editingModule: ModuleId | null;
}
```

### 7.2 Flow d'interaction type

```
1. Utilisateur arrive sur le workspace
   └→ Sidebar affiche modules avec leurs états
   └→ Chat affiche message de bienvenue
   └→ Co-pilote affiche suggestions initiales

2. Utilisateur clique sur module "Contexte"
   └→ Module devient actif (visuel)
   └→ Chat envoie question contextuelle
   └→ Co-pilote met à jour suggestions

3. Utilisateur répond dans le chat
   └→ IA reformule et génère contenu
   └→ Indicateur module passe à ◐ ou ●
   └→ Jauge globale se met à jour
   └→ Co-pilote affiche "Génération OK"

4. Utilisateur clique sur "Preview"
   └→ Zone centrale bascule en mode preview
   └→ Document affiché avec section highlight

5. Utilisateur clique sur suggestion co-pilote
   └→ Action appliquée (ex: ajout politique RSE)
   └→ Chat confirme l'action
   └→ Suggestion disparaît
```

---

## 8. Accessibilité

### 8.1 Navigation clavier

| Touche | Action |
|--------|--------|
| `Tab` | Navigation entre zones (sidebar → centre → co-pilote) |
| `↑↓` | Navigation dans les modules |
| `Enter` | Sélectionner module |
| `Escape` | Fermer mode édition |
| `Cmd+1/2/3` | Basculer mode chat/preview/split |

### 8.2 ARIA

- Sidebar : `role="navigation"`, `aria-label="Modules du dossier"`
- Zone centrale : `role="main"`, `aria-live="polite"` pour le chat
- Co-pilote : `role="complementary"`, `aria-label="Suggestions et aperçu"`

---

## 9. Validation

### Questions pour validation :

1. ✅ Layout 3 colonnes avec dimensions définies
2. ✅ Modules avec indicateurs de complétude
3. ✅ Co-pilote toujours visible
4. ✅ Zone centrale toggleable (chat/preview/split)
5. ✅ Comportement au clic module défini

**Document prêt pour validation. Procéder à la spec de migration ?**
