"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Trash2,
  XCircle,
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
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const certificationSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255),
  issuer: z.string().max(255).optional(),
  certificationNumber: z.string().max(100).optional(),
  obtainedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
});

type CertificationInput = z.infer<typeof certificationSchema>;

interface CertificationFormDialogProps {
  certification?: {
    id: string;
    name: string;
    issuer: string | null;
    certificationNumber: string | null;
    obtainedDate: string | null;
    expiryDate: string | null;
    description: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function CertificationFormDialog({
  certification,
  open,
  onOpenChange,
  onSuccess,
}: CertificationFormDialogProps) {
  const isEditing = !!certification;

  const form = useForm<CertificationInput>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: certification?.name ?? "",
      issuer: certification?.issuer ?? "",
      certificationNumber: certification?.certificationNumber ?? "",
      obtainedDate: certification?.obtainedDate ?? "",
      expiryDate: certification?.expiryDate ?? "",
      description: certification?.description ?? "",
    },
  });

  const createMutation = api.companyCertifications.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = api.companyCertifications.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = async (data: CertificationInput) => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: certification.id,
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la certification" : "Ajouter une certification"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la certification"
              : "Ajoutez une nouvelle certification ou qualification"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la certification *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ISO 9001, Qualibat, RGE..."
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisme certificateur</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AFNOR, Qualibat..."
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
                name="certificationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de certificat</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CERT-2024-001"
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
                name="obtainedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d&apos;obtention</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d&apos;expiration</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Laissez vide si pas d&apos;expiration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Périmètre</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails sur le périmètre de la certification..."
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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

interface CertificationCardProps {
  certification: {
    id: string;
    name: string;
    issuer: string | null;
    certificationNumber: string | null;
    obtainedDate: string | null;
    expiryDate: string | null;
    description: string | null;
    expirationStatus: "valid" | "expiring" | "expired" | "unknown";
  };
  onEdit: () => void;
  onDelete: () => void;
}

function CertificationCard({ certification, onEdit, onDelete }: CertificationCardProps) {
  const deleteMutation = api.companyCertifications.delete.useMutation({
    onSuccess: onDelete,
  });

  const statusConfig = {
    valid: {
      icon: CheckCircle,
      label: "Valide",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    expiring: {
      icon: Clock,
      label: "Expire bientôt",
      variant: "secondary" as const,
      className: "bg-orange-100 text-orange-800 border-orange-200",
    },
    expired: {
      icon: XCircle,
      label: "Expirée",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200",
    },
    unknown: {
      icon: AlertTriangle,
      label: "Sans expiration",
      variant: "outline" as const,
      className: "",
    },
  };

  const status = statusConfig[certification.expirationStatus];
  const StatusIcon = status.icon;

  return (
    <Card
      className={cn(
        certification.expirationStatus === "expiring" && "border-orange-300",
        certification.expirationStatus === "expired" && "border-red-300"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{certification.name}</CardTitle>
          </div>
          <Badge variant={status.variant} className={cn("text-xs", status.className)}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        {certification.issuer && (
          <CardDescription>{certification.issuer}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {certification.certificationNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">N° certificat</span>
              <span className="font-medium">{certification.certificationNumber}</span>
            </div>
          )}
          {certification.obtainedDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Obtenue le</span>
              <span>
                {new Date(certification.obtainedDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}
          {certification.expiryDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expire le</span>
              <span
                className={cn(
                  certification.expirationStatus === "expiring" && "text-orange-600 font-medium",
                  certification.expirationStatus === "expired" && "text-red-600 font-medium"
                )}
              >
                {new Date(certification.expiryDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}
          {certification.description && (
            <p className="mt-2 text-muted-foreground">{certification.description}</p>
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
                <AlertDialogTitle>Supprimer cette certification ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La certification &quot;{certification.name}&quot;
                  sera définitivement supprimée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate({ id: certification.id })}
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

export function CertificationsForm() {
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<
    CertificationCardProps["certification"] | null
  >(null);

  const { data, isLoading } = api.companyCertifications.list.useQuery();

  const handleSuccess = () => {
    void utils.companyCertifications.list.invalidate();
  };

  const handleEdit = (certification: CertificationCardProps["certification"]) => {
    setEditingCertification(certification);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCertification(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const certifications = data?.certifications ?? [];
  const expiringCount = certifications.filter(
    (c) => c.expirationStatus === "expiring"
  ).length;
  const expiredCount = certifications.filter(
    (c) => c.expirationStatus === "expired"
  ).length;

  return (
    <div className="space-y-4">
      {/* Alerts for expiring/expired certifications */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="rounded-lg border bg-muted/50 p-4">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              <span>
                {expiredCount} certification{expiredCount > 1 ? "s" : ""} expirée
                {expiredCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>
                {expiringCount} certification{expiringCount > 1 ? "s" : ""} expire
                {expiringCount > 1 ? "nt" : ""} dans les 30 prochains jours
              </span>
            </div>
          )}
        </div>
      )}

      {/* List of certifications */}
      {certifications.map((certification) => (
        <CertificationCard
          key={certification.id}
          certification={certification}
          onEdit={() => handleEdit(certification)}
          onDelete={handleSuccess}
        />
      ))}

      {/* Empty state */}
      {certifications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="mb-4 text-sm text-muted-foreground">
            Aucune certification enregistrée.
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une certification
          </Button>
        </div>
      )}

      {/* Add button */}
      {certifications.length > 0 && (
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une certification
        </Button>
      )}

      {/* Form dialog */}
      <CertificationFormDialog
        certification={editingCertification ?? undefined}
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
