# Plan de Migration : Workspace Layout

**Document** : Spec de migration demand-workspace
**Date** : 2026-01-18
**Référence** : ux-workspace-specification.md
**Statut** : Plan d'implémentation

---

## 1. État Actuel vs État Cible

### 1.1 Comparaison structurelle

| Aspect | État Actuel | État Cible |
|--------|-------------|------------|
| **Layout** | Zone principale + panels fixes droite | 3 colonnes (sidebar/centre/co-pilote) |
| **Navigation** | Onglets (Vue d'ensemble, Documents, Rédaction, Export) | Sidebar modules cliquables |
| **Chat** | Panel fixe 400px slide-in/out à droite | Zone centrale (partie du layout) |
| **Preview** | Panel fixe 500px à droite | Zone centrale toggleable ou co-pilote |
| **Co-pilote** | Absent (suggestions dans chat) | Panel fixe 320px toujours visible |
| **Progression** | Absente | Jauge + indicateurs par module |

### 1.2 Fichiers impactés

```
src/components/demands/
├── demand-workspace.tsx      # REFACTORING MAJEUR
├── demand-chat-panel.tsx     # ADAPTATION (extraire du conteneur)
├── document-preview.tsx      # ADAPTATION (sections cliquables)
├── section-editor.tsx        # OK (réutilisable)
├── annexes-manager.tsx       # OK (réutilisable)
└── pre-export-dialog.tsx     # OK (réutilisable)

src/components/workspace/     # NOUVEAU DOSSIER
├── workspace-layout.tsx      # NOUVEAU
├── module-sidebar.tsx        # NOUVEAU
├── module-item.tsx           # NOUVEAU
├── completion-gauge.tsx      # NOUVEAU
├── copilot-panel.tsx         # NOUVEAU
├── copilot-card.tsx          # NOUVEAU
├── central-zone.tsx          # NOUVEAU
└── zone-mode-toggle.tsx      # NOUVEAU
```

---

## 2. Stratégie de Migration

### 2.1 Approche recommandée : **Refactoring progressif**

Plutôt qu'une réécriture complète, nous allons :

1. **Créer les nouveaux composants** dans un dossier séparé (`workspace/`)
2. **Adapter les composants existants** pour être plus modulaires
3. **Construire le nouveau layout** qui utilise les composants
4. **Basculer** la route `/demandes/[id]` vers le nouveau layout
5. **Supprimer** l'ancien code après validation

### 2.2 Avantages de cette approche

- ✅ Pas de régression pendant le développement
- ✅ Possibilité de comparer ancien/nouveau
- ✅ Rollback facile si problème
- ✅ Tests possibles en parallèle

---

## 3. Plan d'implémentation par étapes

### Phase 1 : Fondations (Priorité P0)

#### Étape 1.1 : Créer WorkspaceLayout

```typescript
// src/components/workspace/workspace-layout.tsx

interface WorkspaceLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  copilot: React.ReactNode;
}

export function WorkspaceLayout({ sidebar, main, copilot }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar - 260px fixe */}
      <aside className="w-[260px] border-r bg-muted/30 flex flex-col">
        {sidebar}
      </aside>

      {/* Zone centrale - flex: 1 */}
      <main className="flex-1 flex flex-col min-w-0">
        {main}
      </main>

      {/* Co-pilote - 320px fixe */}
      <aside className="w-[320px] border-l bg-muted/10 flex flex-col">
        {copilot}
      </aside>
    </div>
  );
}
```

**Fichier** : `src/components/workspace/workspace-layout.tsx`
**Dépendances** : Aucune
**Tests** : Layout responsive

---

#### Étape 1.2 : Créer ModuleSidebar et ModuleItem

```typescript
// src/components/workspace/module-item.tsx

type ModuleStatus = "complete" | "in_progress" | "empty";

interface ModuleItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  status: ModuleStatus;
  isActive: boolean;
  onClick: () => void;
}

export function ModuleItem({ id, label, icon: Icon, status, isActive, onClick }: ModuleItemProps) {
  const statusStyles = {
    complete: "text-success",
    in_progress: "text-warning",
    empty: "text-muted-foreground",
  };

  const statusIcons = {
    complete: "●",
    in_progress: "◐",
    empty: "○",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-muted",
        isActive && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      <span className={statusStyles[status]}>{statusIcons[status]}</span>
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
```

**Fichier** : `src/components/workspace/module-item.tsx`
**Dépendances** : lucide-react, cn utility

---

#### Étape 1.3 : Créer CompletionGauge

```typescript
// src/components/workspace/completion-gauge.tsx

interface CompletionGaugeProps {
  percentage: number;
  completedItems: number;
  totalItems: number;
}

export function CompletionGauge({ percentage, completedItems, totalItems }: CompletionGaugeProps) {
  return (
    <div className="p-4">
      <div className="text-sm font-medium mb-2">Complétude</div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{percentage}% complet</span>
        <span>{completedItems} / {totalItems}</span>
      </div>
    </div>
  );
}
```

**Fichier** : `src/components/workspace/completion-gauge.tsx`
**Dépendances** : Aucune

---

### Phase 2 : Zone Centrale (Priorité P0)

#### Étape 2.1 : Extraire le chat en composant standalone

**Modification de** `demand-chat-panel.tsx` :

```typescript
// Avant : Composant avec son propre conteneur fixe
// Après : Composant pur qui reçoit projectId et s'affiche dans son parent

export function DemandChat({ projectId }: { projectId: string }) {
  // ... logique existante ...

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">Assistant IA</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ... messages ... */}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {/* ... input ... */}
      </div>
    </div>
  );
}
```

---

#### Étape 2.2 : Créer CentralZone avec toggle (4 modes)

```typescript
// src/components/workspace/central-zone.tsx

type ViewMode = "overview" | "chat" | "preview" | "split";

interface CentralZoneProps {
  projectId: string;
  project: DemandProject;
  sections: DemandSection[];
  activeModule: string | null;
  onModuleClick: (moduleId: string) => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

export function CentralZone({
  projectId,
  project,
  sections,
  activeModule,
  onModuleClick,
  isEditing,
  onEditingChange,
}: CentralZoneProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview"); // Défaut: Vue d'ensemble

  // Quand on clique sur un module depuis Vue d'ensemble, basculer en Chat
  const handleCardClick = (moduleId: string) => {
    onModuleClick(moduleId);
    setViewMode("chat");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header avec toggle 4 modes */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <ZoneModeToggle mode={viewMode} onModeChange={setViewMode} />
        {activeModule && viewMode !== "overview" && (
          <span className="text-sm text-muted-foreground">
            Module : <strong>{activeModule}</strong>
          </span>
        )}
      </div>

      {/* Contenu selon le mode */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "overview" && (
          <OverviewDashboard
            project={project}
            sections={sections}
            isEditing={isEditing}
            onEditingChange={onEditingChange}
            onCardClick={handleCardClick}
          />
        )}
        {viewMode === "chat" && (
          <DemandChat projectId={projectId} activeModule={activeModule} />
        )}
        {viewMode === "preview" && (
          <DocumentPreview {...project} sections={sections} />
        )}
        {viewMode === "split" && (
          <div className="flex h-full">
            <div className="flex-1 border-r">
              <DemandChat projectId={projectId} activeModule={activeModule} />
            </div>
            <div className="flex-1">
              <DocumentPreview {...project} sections={sections} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

#### Étape 2.3 : Créer OverviewDashboard (réutilise le code actuel)

```typescript
// src/components/workspace/overview-dashboard.tsx

interface OverviewDashboardProps {
  project: DemandProject;
  sections: DemandSection[];
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  onCardClick: (moduleId: string) => void;
}

export function OverviewDashboard({
  project,
  sections,
  isEditing,
  onEditingChange,
  onCardClick,
}: OverviewDashboardProps) {
  // Reprend le code actuel de TabsContent value="overview"
  // Avec les cards: Contexte, Description, Contraintes, Budget

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Row 1: Context and Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onCardClick("context")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contexte & Justification</CardTitle>
            </CardHeader>
            <CardContent>
              {project.context ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(project.context) }}
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Cliquez pour compléter avec l'assistant IA
                </p>
              )}
            </CardContent>
          </Card>

          {/* ... autres cards similaires ... */}
        </div>

        {/* ... reste du dashboard ... */}
      </div>
    </div>
  );
}
```

---

### Phase 3 : Panneau Co-pilote (Priorité P0)

#### Étape 3.1 : Créer CopilotCard

```typescript
// src/components/workspace/copilot-card.tsx

type CopilotCardType = "suggestion" | "generation" | "alert" | "error";

interface CopilotCardProps {
  type: CopilotCardType;
  title: string;
  content: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  }>;
  confidence?: number;
}

export function CopilotCard({ type, title, content, actions, confidence }: CopilotCardProps) {
  const config = {
    suggestion: { icon: Lightbulb, color: "border-primary" },
    generation: { icon: Check, color: "border-success" },
    alert: { icon: AlertTriangle, color: "border-warning" },
    error: { icon: XCircle, color: "border-destructive" },
  };

  const { icon: Icon, color } = config[type];

  return (
    <Card className={cn("border-l-4", color)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p>{content}</p>
        {confidence !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">
            Confiance : {confidence}%
          </p>
        )}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant ?? "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

#### Étape 3.2 : Créer CopilotPanel

```typescript
// src/components/workspace/copilot-panel.tsx

interface CopilotPanelProps {
  projectId: string;
  project: DemandProject;
  sections: DemandSection[];
  onExportPdf: () => void;
  onExportDocx: () => void;
  onExportZip: () => void;
}

export function CopilotPanel({
  projectId,
  project,
  sections,
  onExportPdf,
  onExportDocx,
  onExportZip,
}: CopilotPanelProps) {
  // Fetch suggestions from API
  const { data: suggestions } = api.ai.getCopilotSuggestions.useQuery({ projectId });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Co-pilote
        </h2>
      </div>

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {suggestions?.map((s) => (
          <CopilotCard key={s.id} {...s} />
        ))}
      </div>

      {/* Aperçu miniature */}
      <div className="p-4 border-t">
        <h3 className="text-sm font-medium mb-2">📄 Aperçu document</h3>
        <div className="aspect-[210/297] bg-muted rounded border overflow-hidden">
          {/* Miniature du document */}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="p-4 border-t space-y-2">
        <h3 className="text-sm font-medium mb-2">⚡ Actions rapides</h3>
        <Button variant="outline" size="sm" className="w-full" onClick={onExportPdf}>
          <Download className="mr-2 h-4 w-4" /> Exporter PDF
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={onExportDocx}>
          <FileText className="mr-2 h-4 w-4" /> Exporter Word
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={onExportZip}>
          <Archive className="mr-2 h-4 w-4" /> Exporter ZIP
        </Button>
      </div>
    </div>
  );
}
```

---

### Phase 4 : Assemblage (Priorité P1)

#### Étape 4.1 : Créer le nouveau DemandWorkspace

```typescript
// src/components/demands/demand-workspace-v2.tsx

export function DemandWorkspaceV2({ projectId }: { projectId: string }) {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  // ... fetch project data ...

  const modules = [
    { id: "info", label: "Informations", icon: FileText, status: calcStatus("info") },
    { id: "context", label: "Contexte", icon: MessageSquare, status: calcStatus("context") },
    { id: "description", label: "Description", icon: ClipboardList, status: calcStatus("description") },
    { id: "constraints", label: "Contraintes", icon: AlertTriangle, status: calcStatus("constraints") },
    { id: "budget", label: "Budget & Délais", icon: Banknote, status: calcStatus("budget") },
    { id: "documents", label: "Documents", icon: Paperclip, status: calcStatus("documents") },
  ];

  const completion = calculateCompletion(project, sections);

  return (
    <WorkspaceLayout
      sidebar={
        <ModuleSidebar
          modules={modules}
          activeModule={activeModule}
          onModuleClick={setActiveModule}
          completion={completion}
          onBack={() => router.push("/demandes")}
        />
      }
      main={
        <CentralZone
          projectId={projectId}
          project={project}
          sections={sections}
          activeModule={activeModule}
        />
      }
      copilot={
        <CopilotPanel
          projectId={projectId}
          project={project}
          sections={sections}
          onExportPdf={handleExportPdf}
          onExportDocx={handleExportDocx}
          onExportZip={handleExportZip}
        />
      }
    />
  );
}
```

---

#### Étape 4.2 : Basculer la route

```typescript
// src/app/(auth)/demandes/[id]/page.tsx

// Avant
import { DemandWorkspace } from "~/components/demands/demand-workspace";

// Après
import { DemandWorkspaceV2 } from "~/components/demands/demand-workspace-v2";

export default function DemandPage({ params }: { params: { id: string } }) {
  return <DemandWorkspaceV2 projectId={params.id} />;
}
```

---

### Phase 5 : Nettoyage (Priorité P2)

1. Supprimer `demand-workspace.tsx` (ancien)
2. Renommer `demand-workspace-v2.tsx` → `demand-workspace.tsx`
3. Supprimer code mort dans `demand-chat-panel.tsx`
4. Mettre à jour les imports

---

## 4. Ordre d'implémentation recommandé

| # | Tâche | Fichier(s) | Effort | Dépendance |
|---|-------|------------|--------|------------|
| 1 | WorkspaceLayout | workspace-layout.tsx | 0.5j | - |
| 2 | ModuleItem | module-item.tsx | 0.25j | - |
| 3 | CompletionGauge | completion-gauge.tsx | 0.25j | - |
| 4 | ModuleSidebar | module-sidebar.tsx | 0.5j | #2, #3 |
| 5 | Extraire DemandChat | demand-chat-panel.tsx | 0.5j | - |
| 6 | ZoneModeToggle | zone-mode-toggle.tsx | 0.25j | - |
| 7 | CentralZone | central-zone.tsx | 0.5j | #5, #6 |
| 8 | CopilotCard | copilot-card.tsx | 0.25j | - |
| 9 | CopilotPanel | copilot-panel.tsx | 0.5j | #8 |
| 10 | Assemblage v2 | demand-workspace-v2.tsx | 1j | #1, #4, #7, #9 |
| 11 | Calcul complétude | utils/completion.ts | 0.5j | - |
| 12 | Tests & ajustements | - | 1j | #10 |
| 13 | Bascule route | page.tsx | 0.1j | #12 |
| 14 | Nettoyage | - | 0.25j | #13 |

**Total estimé : ~6 jours de développement**

---

## 5. Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Régression fonctionnelle | Élevé | Garder ancien code jusqu'à validation |
| Performance (3 colonnes) | Moyen | Lazy loading des panels |
| Responsive cassé | Moyen | Tester sur tous breakpoints dès Phase 1 |
| Chat contextuel complexe | Moyen | Commencer simple, enrichir après |

---

## 6. Critères de validation

### Avant bascule en production :

- [ ] Layout 3 colonnes fonctionne sur desktop (≥1280px)
- [ ] Tous les modules affichent leur état correct
- [ ] Clic module → message IA contextuel
- [ ] Toggle chat/preview/split fonctionne
- [ ] Co-pilote affiche suggestions
- [ ] Export PDF/Word/ZIP fonctionne
- [ ] Pas de régression sur les fonctionnalités existantes
- [ ] Tests manuels sur Chrome, Firefox, Safari

---

**Document de migration prêt. Procéder au mockup HTML interactif ?**
