# Spécifications Techniques - Wizard de Rédaction IA

**Version:** 1.0
**Date:** 2026-01-18
**Auteur:** Brainstorming Session avec Steeven

---

## 1. Vue d'Ensemble

### 1.1 Objectif

Transformer l'interaction chat libre actuelle en un **parcours guidé par étapes (Wizard)** qui :
- Pose des questions précises avec options de réponse
- Assemble automatiquement les réponses en texte professionnel
- Affiche la progression en temps réel
- Sauvegarde automatiquement chaque réponse
- Génère des livrables de haute qualité adaptés au type de besoin

### 1.2 Principes Directeurs

| Principe | Description |
|----------|-------------|
| **Guidage maximal** | L'IA dirige, l'utilisateur répond/valide |
| **Questions fermées** | Options prédéfinies + échappatoire "Autre" |
| **Feedback immédiat** | Preview temps réel du texte généré |
| **Zéro perte de données** | Auto-save à chaque réponse |
| **Qualité garantie** | Prompts enrichis + formats adaptatifs |

---

## 2. Architecture Fonctionnelle

### 2.1 Structure des Modules

```
┌─────────────────────────────────────────────────────────────┐
│                    WIZARD - 5 MODULES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MODULE 1: Informations Générales (4-5 questions)           │
│  ├─ Titre de la demande                                     │
│  ├─ Service demandeur                                       │
│  ├─ Contact principal                                       │
│  ├─ Type de besoin                                          │
│  └─ Niveau d'urgence                                        │
│                                                             │
│  MODULE 2: Contexte & Justification (3-4 questions)         │
│  ├─ Situation actuelle                                      │
│  ├─ Problèmes rencontrés                                    │
│  └─ Raison d'agir maintenant                                │
│                                                             │
│  MODULE 3: Description du Besoin (4-6 questions)            │
│  ├─ [Dynamique selon needType]                              │
│  ├─ Objectifs attendus                                      │
│  ├─ Périmètre / Quantités                                   │
│  └─ Spécifications techniques                               │
│                                                             │
│  MODULE 4: Contraintes (3-4 questions)                      │
│  ├─ Contraintes techniques                                  │
│  ├─ Contraintes réglementaires                              │
│  └─ Contraintes organisationnelles                          │
│                                                             │
│  MODULE 5: Budget & Délais (3-4 questions)                  │
│  ├─ Fourchette budgétaire                                   │
│  ├─ Budget validé ?                                         │
│  ├─ Date de livraison souhaitée                             │
│  └─ Justification délai                                     │
│                                                             │
│  EXPORT: Révision & Génération                              │
│  ├─ Aperçu complet                                          │
│  ├─ Modifications finales                                   │
│  └─ Export PDF / DOCX / ZIP                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Layout de l'Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header: Titre du dossier + Référence                                   │
├──────────────┬─────────────────────────────┬────────────────────────────┤
│              │                             │                            │
│   SIDEBAR    │     ZONE QUESTIONS          │    PREVIEW TEMPS RÉEL      │
│   (200px)    │        (flex)               │        (350px)             │
│              │                             │                            │
│  Navigation  │  Barre progression          │   Texte assemblé           │
│  par modules │  Question courante          │   qui se construit         │
│              │  Cards réponses validées    │   au fur et à mesure       │
│  ✅ ○ ○ ○ ○  │  Input/Options              │                            │
│              │                             │   Indicateur module        │
│              │                             │                            │
├──────────────┴─────────────────────────────┴────────────────────────────┤
│  Footer: Auto-save status | Actions (Sauvegarder, Quitter)              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Spécifications Détaillées

### 3.1 Types de Questions

#### Type: `text`
```typescript
interface TextQuestion {
  type: "text";
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}
```

#### Type: `textarea`
```typescript
interface TextareaQuestion {
  type: "textarea";
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
}
```

#### Type: `radio`
```typescript
interface RadioQuestion {
  type: "radio";
  id: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  required?: boolean;
  allowOther?: boolean;
}
```

#### Type: `checkbox`
```typescript
interface CheckboxQuestion {
  type: "checkbox";
  id: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  required?: boolean;
  minSelect?: number;
  maxSelect?: number;
  allowOther?: boolean;
}
```

#### Type: `select_or_text`
```typescript
interface SelectOrTextQuestion {
  type: "select_or_text";
  id: string;
  label: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
}
```

#### Type: `number`
```typescript
interface NumberQuestion {
  type: "number";
  id: string;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  suggestions?: number[];
  required?: boolean;
}
```

#### Type: `date`
```typescript
interface DateQuestion {
  type: "date";
  id: string;
  label: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
}
```

### 3.2 Structure d'un Module

```typescript
interface WizardModule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  questions: Question[];
  assemblePrompt: string;  // Prompt pour assembler les réponses en texte
  conditionalQuestions?: {
    condition: {
      questionId: string;
      operator: "equals" | "contains" | "not_equals";
      value: string | string[];
    };
    questions: Question[];
  }[];
}
```

### 3.3 État du Wizard (DB Schema)

```typescript
interface WizardState {
  currentModule: number;
  currentQuestion: number;
  startedAt: Date;
  lastActivityAt: Date;
  modules: {
    [moduleId: string]: ModuleState;
  };
}

interface ModuleState {
  status: "pending" | "in_progress" | "completed";
  startedAt?: Date;
  completedAt?: Date;
  validatedAt?: Date;
  answeredQuestions: string[];
}

interface SectionWithAnswers {
  id: string;
  title: string;
  content: string;           // Texte final assemblé et validé
  answers: Answer[];         // Réponses individuelles
  generatedAt?: Date;
  validatedAt?: Date;
  generationCount: number;
}

interface Answer {
  questionId: string;
  questionLabel: string;
  value: string | string[] | number | boolean;
  answeredAt: Date;
}
```

---

## 4. Flux Utilisateur

### 4.1 Démarrage

```
1. Utilisateur clique "Nouveau dossier"
2. Modal création avec titre + type besoin (minimal)
3. Redirection vers /demandes/[id]?mode=wizard
4. Affichage Module 1, Question 1
```

### 4.2 Réponse à une Question

```
1. Utilisateur voit la question avec options/input
2. Utilisateur sélectionne/saisit sa réponse
3. [AUTO] Sauvegarde immédiate en DB (answers[])
4. [AUTO] Preview se met à jour (si applicable)
5. Question passe en "Card validée" (readonly avec bouton edit)
6. Question suivante s'affiche
```

### 4.3 Fin de Module

```
1. Dernière question du module complétée
2. Appel API génération IA avec assemblePrompt + answers
3. Affichage du texte généré dans modal/section
4. Options: [Valider] [Modifier] [Régénérer]
5. Si Valider:
   - content = texte généré
   - module.status = "completed"
   - Passage au module suivant
6. Si Modifier: Éditeur inline pour ajustements
7. Si Régénérer: Nouvel appel IA, generationCount++
```

### 4.4 Navigation Libre

```
- Sidebar toujours cliquable
- Clic sur module completed: affiche résumé, permet édition
- Clic sur module pending: avertissement "compléter modules précédents d'abord" (optionnel)
- Clic sur module in_progress: reprend où on en était
```

### 4.5 Export

```
1. Tous les modules "completed"
2. Bouton "Générer le dossier" actif
3. Choix format: PDF / DOCX / ZIP
4. Génération avec template adapté au needType
5. Téléchargement
```

---

## 5. Génération IA

### 5.1 Prompt d'Assemblage (exemple Contexte)

```
Tu es un rédacteur expert en dossiers de marchés publics.
À partir des informations suivantes, rédige un paragraphe de contexte
professionnel et structuré.

INFORMATIONS FOURNIES:
- Situation actuelle: {answers.situation}
- Problèmes rencontrés: {answers.problem}
- Raison d'agir maintenant: {answers.why_now}

CONSIGNES DE RÉDACTION:
- Style formel et professionnel
- Phrases complètes et structurées
- Justifier le besoin de manière factuelle
- Longueur: 100-200 mots
- Pas de bullet points, texte fluide

CONTEXTE DU DOSSIER:
- Type: {project.needType}
- Service: {project.departmentName}
- Urgence: {project.urgencyLevel}
```

### 5.2 Prompts Adaptatifs par needType

Voir fichier `03-questions-completes.yaml` pour les prompts spécifiques.

---

## 6. Adaptation des Livrables par Type

### 6.1 Type: Fourniture

```markdown
## Structure PDF Fourniture

1. Page de garde
2. Sommaire
3. Informations générales
4. Contexte & Justification
5. **Spécifications Techniques**
   - Caractéristiques requises (tableau)
   - Quantités
   - Compatibilités
6. Contraintes
7. Budget & Délais
8. **Critères d'évaluation fournisseurs**
9. Annexes
```

### 6.2 Type: Service

```markdown
## Structure PDF Service

1. Page de garde
2. Sommaire
3. Informations générales
4. Contexte & Justification
5. **Périmètre de la prestation**
   - Objectifs
   - Livrables attendus
   - Planning prévisionnel
6. **Profils intervenants requis**
7. Contraintes
8. Budget & Délais
9. Annexes
```

### 6.3 Type: Formation

```markdown
## Structure PDF Formation

1. Page de garde
2. Sommaire
3. Informations générales
4. Contexte & Justification
5. **Programme pédagogique**
   - Objectifs de formation
   - Public cible
   - Contenu détaillé
   - Modalités (présentiel/distanciel)
6. **Évaluation des acquis**
7. Contraintes
8. Budget & Délais
9. Annexes
```

---

## 7. Métriques de Succès

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Taux de complétion | > 80% | Dossiers terminés / commencés |
| Temps moyen | < 15 min | Du début à l'export |
| Qualité perçue | > 4/5 | Feedback utilisateur |
| Régénérations | < 2/module | Moyenne par module |
| Modifications manuelles | < 20% | % du texte modifié post-génération |

---

## 8. Considérations Techniques

### 8.1 Performance

- Debounce sur auto-save: 500ms
- Preview update: 1s après dernière réponse
- Génération IA: streaming si possible
- Cache des questions/modules côté client

### 8.2 Accessibilité

- Navigation clavier complète
- Labels ARIA sur tous les contrôles
- Focus visible
- Contraste suffisant

### 8.3 Mobile

- Sidebar devient drawer
- Preview accessible via toggle
- Questions pleine largeur
- Touch-friendly options

---

*Document généré lors de la session de brainstorming du 2026-01-18*
