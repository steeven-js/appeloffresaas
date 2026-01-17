"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Edit,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
  Users,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const teamMemberSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(100),
  lastName: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  role: z.string().min(1, "Le poste est requis").max(255),
  department: z.string().max(100).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(60).optional(),
  skills: z.string().optional(), // Comma-separated skills
  education: z.string().optional(),
  personalCertifications: z.string().optional(), // Comma-separated certifications
  bio: z.string().optional(),
  isKeyPerson: z.boolean().optional(),
});

type TeamMemberInput = z.infer<typeof teamMemberSchema>;

interface TeamMemberFormDialogProps {
  teamMember?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string;
    department: string | null;
    yearsOfExperience: number | null;
    skills: string[];
    education: string | null;
    personalCertifications: string[];
    bio: string | null;
    isKeyPerson: number | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function TeamMemberFormDialog({
  teamMember,
  open,
  onOpenChange,
  onSuccess,
}: TeamMemberFormDialogProps) {
  const isEditing = !!teamMember;

  const form = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      firstName: teamMember?.firstName ?? "",
      lastName: teamMember?.lastName ?? "",
      email: teamMember?.email ?? "",
      phone: teamMember?.phone ?? "",
      role: teamMember?.role ?? "",
      department: teamMember?.department ?? "",
      yearsOfExperience: teamMember?.yearsOfExperience ?? undefined,
      skills: teamMember?.skills?.join(", ") ?? "",
      education: teamMember?.education ?? "",
      personalCertifications: teamMember?.personalCertifications?.join(", ") ?? "",
      bio: teamMember?.bio ?? "",
      isKeyPerson: teamMember?.isKeyPerson === 1,
    },
  });

  const createMutation = api.companyTeamMembers.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = api.companyTeamMembers.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = async (data: TeamMemberInput) => {
    // Parse comma-separated fields into arrays
    const skills = data.skills
      ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const personalCertifications = data.personalCertifications
      ? data.personalCertifications.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // Convert empty strings to null for optional fields
    const emptyToNull = (value: string | undefined) => (value && value.trim() !== "" ? value : null);

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: emptyToNull(data.email),
      phone: emptyToNull(data.phone),
      role: data.role,
      department: emptyToNull(data.department),
      yearsOfExperience: data.yearsOfExperience ?? null,
      skills: skills.length > 0 ? skills : null,
      education: emptyToNull(data.education),
      personalCertifications: personalCertifications.length > 0 ? personalCertifications : null,
      bio: emptyToNull(data.bio),
      isKeyPerson: data.isKeyPerson ?? false,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: teamMember.id,
        data: payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le membre" : "Ajouter un membre"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du membre de l'équipe"
              : "Ajoutez un nouveau membre à votre équipe"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jean"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dupont"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+33 6 12 34 56 78"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste / Fonction *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Chef de projet, Ingénieur..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service / Département</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Technique, Commercial..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Années d&apos;expérience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        placeholder="10"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formation / Diplôme</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingénieur INSA, Master..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compétences clés</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Gestion de projet, BIM, AutoCAD, ..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Séparez les compétences par des virgules
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personal Certifications */}
            <FormField
              control={form.control}
              name="personalCertifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications personnelles</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PMP, PRINCE2, Scrum Master, ..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Séparez les certifications par des virgules
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie / Présentation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Courte présentation du parcours et des réalisations..."
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Key Person */}
            <FormField
              control={form.control}
              name="isKeyPerson"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Personne clé</FormLabel>
                    <FormDescription>
                      Marquer comme personne clé pour les appels d&apos;offres (affiché en priorité)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error.message}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Enregistrement..."
                  : isEditing
                    ? "Enregistrer"
                    : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface TeamMemberCardProps {
  teamMember: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string;
    department: string | null;
    yearsOfExperience: number | null;
    skills: string[];
    education: string | null;
    personalCertifications: string[];
    bio: string | null;
    isKeyPerson: number | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

function TeamMemberCard({ teamMember, onEdit, onDelete }: TeamMemberCardProps) {
  const utils = api.useUtils();

  const deleteMutation = api.companyTeamMembers.delete.useMutation({
    onSuccess: onDelete,
  });

  const toggleKeyPersonMutation = api.companyTeamMembers.toggleKeyPerson.useMutation({
    onSuccess: () => {
      void utils.companyTeamMembers.list.invalidate();
    },
  });

  const isKeyPerson = teamMember.isKeyPerson === 1;

  return (
    <Card className={cn(isKeyPerson && "border-primary/50 bg-primary/5")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                {teamMember.firstName} {teamMember.lastName}
                {isKeyPerson && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                {teamMember.role}
                {teamMember.department && (
                  <span className="text-muted-foreground/70">
                    {" "}
                    • {teamMember.department}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleKeyPersonMutation.mutate({ id: teamMember.id })}
            className={cn(
              "h-8 w-8 p-0",
              isKeyPerson && "text-yellow-500 hover:text-yellow-600"
            )}
            title={isKeyPerson ? "Retirer des personnes clés" : "Marquer comme personne clé"}
          >
            <Star className={cn("h-4 w-4", isKeyPerson && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {/* Contact info */}
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {teamMember.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{teamMember.email}</span>
              </div>
            )}
            {teamMember.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{teamMember.phone}</span>
              </div>
            )}
          </div>

          {/* Experience and education */}
          <div className="flex flex-wrap gap-4">
            {teamMember.yearsOfExperience !== null && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {teamMember.yearsOfExperience} ans
                </span>
                <span>d&apos;expérience</span>
              </div>
            )}
            {teamMember.education && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                <span>{teamMember.education}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {teamMember.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {teamMember.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Personal certifications */}
          {teamMember.personalCertifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {teamMember.personalCertifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          )}

          {/* Bio */}
          {teamMember.bio && (
            <p className="text-muted-foreground">{teamMember.bio}</p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="mr-1 h-4 w-4" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. {teamMember.firstName} {teamMember.lastName}
                  {" "}sera définitivement supprimé de votre équipe.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate({ id: teamMember.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamMembersForm() {
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<
    TeamMemberCardProps["teamMember"] | null
  >(null);

  const { data, isLoading } = api.companyTeamMembers.list.useQuery();

  const handleSuccess = () => {
    void utils.companyTeamMembers.list.invalidate();
  };

  const handleEdit = (teamMember: TeamMemberCardProps["teamMember"]) => {
    setEditingMember(teamMember);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingMember(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const teamMembers = data?.teamMembers ?? [];
  const keyPersonCount = teamMembers.filter((m) => m.isKeyPerson === 1).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {teamMembers.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{teamMembers.length}</span>
            <span className="text-muted-foreground">
              membre{teamMembers.length > 1 ? "s" : ""}
            </span>
          </div>
          {keyPersonCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{keyPersonCount}</span>
              <span className="text-muted-foreground">
                personne{keyPersonCount > 1 ? "s" : ""} clé{keyPersonCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* List of team members */}
      {teamMembers.map((member) => (
        <TeamMemberCard
          key={member.id}
          teamMember={member}
          onEdit={() => handleEdit(member)}
          onDelete={handleSuccess}
        />
      ))}

      {/* Empty state */}
      {teamMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="mb-4 text-sm text-muted-foreground">
            Aucun membre d&apos;équipe enregistré.
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un membre
          </Button>
        </div>
      )}

      {/* Add button */}
      {teamMembers.length > 0 && (
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un membre
        </Button>
      )}

      {/* Form dialog */}
      <TeamMemberFormDialog
        teamMember={editingMember ?? undefined}
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
