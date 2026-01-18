"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { RichTextEditor } from "~/components/ui/rich-text-editor";
import { cn } from "~/lib/utils";
import type { DemandSection } from "~/server/db/schema";

interface SectionEditorProps {
  sections: DemandSection[];
  onSectionsChange: (sections: DemandSection[]) => void;
  onGenerateDraft?: (sectionId: string) => void;
  isGenerating?: boolean;
  generatingSection?: string;
  disabled?: boolean;
}

interface SortableSectionProps {
  section: DemandSection;
  onTitleChange: (id: string, title: string) => void;
  onContentChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onGenerateDraft?: (sectionId: string) => void;
  isGenerating?: boolean;
  generatingSection?: string;
  disabled?: boolean;
}

function SortableSection({
  section,
  onTitleChange,
  onContentChange,
  onDelete,
  onGenerateDraft,
  isGenerating,
  generatingSection,
  disabled,
}: SortableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [isOpen, setIsOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onTitleChange(section.id, editedTitle.trim());
    } else {
      setEditedTitle(section.title);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(section.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const isCurrentlyGenerating = isGenerating && generatingSection === section.id;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "transition-shadow",
          isDragging && "opacity-50"
        )}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className={cn(
            "border-2",
            isDragging && "border-primary shadow-lg"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {/* Drag Handle */}
                <button
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
                  disabled={disabled}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Title or Edit Input */}
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-8 text-lg font-semibold"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleSaveTitle}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <CardTitle
                    className="text-lg flex-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => !disabled && setIsEditing(true)}
                  >
                    {section.title}
                  </CardTitle>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setIsEditing(true)}
                        disabled={disabled}
                        title="Renommer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {onGenerateDraft && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => onGenerateDraft(section.id)}
                          disabled={disabled === true || isGenerating === true}
                          title="Générer avec l'IA"
                        >
                          {isCurrentlyGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {!section.isRequired && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                          disabled={disabled}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <RichTextEditor
                  content={section.content}
                  onChange={(content) => onContentChange(section.id, content)}
                  placeholder={`Contenu de la section "${section.title}"...`}
                  disabled={disabled}
                  className="min-h-[200px]"
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette section ?</AlertDialogTitle>
            <AlertDialogDescription>
              La section &quot;{section.title}&quot; et son contenu seront supprimés.
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(section.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SectionEditor({
  sections,
  onSectionsChange,
  onGenerateDraft,
  isGenerating,
  generatingSection,
  disabled,
}: SectionEditorProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);
        const newSections = arrayMove(sections, oldIndex, newIndex).map(
          (s, index) => ({ ...s, order: index })
        );
        onSectionsChange(newSections);
      }
    },
    [sections, onSectionsChange]
  );

  const handleTitleChange = useCallback(
    (id: string, title: string) => {
      const newSections = sections.map((s) =>
        s.id === id ? { ...s, title } : s
      );
      onSectionsChange(newSections);
    },
    [sections, onSectionsChange]
  );

  const handleContentChange = useCallback(
    (id: string, content: string) => {
      const newSections = sections.map((s) =>
        s.id === id ? { ...s, content } : s
      );
      onSectionsChange(newSections);
    },
    [sections, onSectionsChange]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const newSections = sections
        .filter((s) => s.id !== id)
        .map((s, index) => ({ ...s, order: index }));
      onSectionsChange(newSections);
    },
    [sections, onSectionsChange]
  );

  const handleAddSection = useCallback(() => {
    if (!newSectionTitle.trim()) return;

    const newSection: DemandSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      content: "",
      isDefault: false,
      isRequired: false,
      order: sections.length,
    };

    onSectionsChange([...sections, newSection]);
    setNewSectionTitle("");
    setIsAddingSection(false);
  }, [newSectionTitle, sections, onSectionsChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSection();
    } else if (e.key === "Escape") {
      setIsAddingSection(false);
      setNewSectionTitle("");
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onDelete={handleDelete}
                onGenerateDraft={onGenerateDraft}
                isGenerating={isGenerating}
                generatingSection={generatingSection}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Section */}
      <div className="pt-2">
        {isAddingSection ? (
          <div className="flex items-center gap-2">
            <Input
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nom de la nouvelle section..."
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleAddSection} disabled={!newSectionTitle.trim()}>
              <Check className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingSection(false);
                setNewSectionTitle("");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setIsAddingSection(true)}
            disabled={disabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une section
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Get default sections for a new demand
 */
export function getDefaultSections(
  context?: string,
  description?: string,
  constraints?: string
): DemandSection[] {
  return [
    {
      id: "context",
      title: "Contexte & Justification",
      content: context ?? "",
      isDefault: true,
      isRequired: true,
      order: 0,
    },
    {
      id: "description",
      title: "Description du besoin",
      content: description ?? "",
      isDefault: true,
      isRequired: true,
      order: 1,
    },
    {
      id: "constraints",
      title: "Contraintes identifiées",
      content: constraints ?? "",
      isDefault: true,
      isRequired: false,
      order: 2,
    },
  ];
}
