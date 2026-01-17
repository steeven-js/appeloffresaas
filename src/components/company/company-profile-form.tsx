"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

// Formes juridiques françaises courantes
const LEGAL_FORMS = [
  { value: "SAS", label: "SAS - Société par Actions Simplifiée" },
  { value: "SASU", label: "SASU - SAS Unipersonnelle" },
  { value: "SARL", label: "SARL - Société à Responsabilité Limitée" },
  { value: "EURL", label: "EURL - Entreprise Unipersonnelle à RL" },
  { value: "SA", label: "SA - Société Anonyme" },
  { value: "SNC", label: "SNC - Société en Nom Collectif" },
  { value: "EI", label: "EI - Entreprise Individuelle" },
  { value: "EIRL", label: "EIRL - Entreprise Individuelle à RL" },
  { value: "AUTO", label: "Auto-entrepreneur / Micro-entreprise" },
  { value: "SCOP", label: "SCOP - Société Coopérative" },
  { value: "ASSOCIATION", label: "Association loi 1901" },
  { value: "OTHER", label: "Autre" },
] as const;

const companyProfileSchema = z.object({
  name: z.string().max(255, "Le nom ne peut pas dépasser 255 caractères").optional(),
  siret: z
    .string()
    .regex(/^(\d{14})?$/, "Le SIRET doit contenir exactement 14 chiffres")
    .optional()
    .or(z.literal("")),
  // Legal information (Story 2.2)
  legalForm: z.string().max(50).optional(),
  capitalSocial: z.coerce.number().int().positive().optional().nullable(),
  nafCode: z
    .string()
    .regex(/^(\d{4}[A-Z])?$/, "Le code NAF doit être au format 1234A")
    .optional()
    .or(z.literal("")),
  creationDate: z.string().optional().nullable(),
  rcsCity: z.string().max(255).optional(),
  // Address
  address: z.string().optional(),
  city: z.string().max(255).optional(),
  postalCode: z.string().max(10).optional(),
  country: z.string().max(255).optional(),
  // Contact
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
});

type CompanyProfileFormInput = z.infer<typeof companyProfileSchema>;

export function CompanyProfileForm() {
  const utils = api.useUtils();

  const { data, isLoading } = api.companyProfile.getProfile.useQuery();

  const form = useForm<CompanyProfileFormInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: "",
      siret: "",
      // Legal information
      legalForm: "",
      capitalSocial: null,
      nafCode: "",
      creationDate: null,
      rcsCity: "",
      // Address
      address: "",
      city: "",
      postalCode: "",
      country: "France",
      // Contact
      phone: "",
      email: "",
      website: "",
    },
  });

  // Update form when profile is loaded
  useEffect(() => {
    if (data?.profile) {
      form.reset({
        name: data.profile.name ?? "",
        siret: data.profile.siret ?? "",
        // Legal information
        legalForm: data.profile.legalForm ?? "",
        capitalSocial: data.profile.capitalSocial ?? null,
        nafCode: data.profile.nafCode ?? "",
        creationDate: data.profile.creationDate ?? null,
        rcsCity: data.profile.rcsCity ?? "",
        // Address
        address: data.profile.address ?? "",
        city: data.profile.city ?? "",
        postalCode: data.profile.postalCode ?? "",
        country: data.profile.country ?? "France",
        // Contact
        phone: data.profile.phone ?? "",
        email: data.profile.email ?? "",
        website: data.profile.website ?? "",
      });
    }
  }, [data, form]);

  const upsertMutation = api.companyProfile.upsertProfile.useMutation({
    onSuccess: () => {
      void utils.companyProfile.getProfile.invalidate();
    },
  });

  const onSubmit = async (formData: CompanyProfileFormInput) => {
    await upsertMutation.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const completeness = data?.completeness ?? 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Completeness Score */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Complétude du profil</span>
            <span className="text-sm font-bold">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          {completeness < 100 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Complétez votre profil pour faciliter vos réponses aux appels d&apos;offres
            </p>
          )}
        </div>

        {upsertMutation.isSuccess && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Profil entreprise enregistré avec succès
          </div>
        )}

        {upsertMutation.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {upsertMutation.error.message}
          </div>
        )}

        {/* Identity Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Identité</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison sociale</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ma Société SAS"
                    disabled={upsertMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET</FormLabel>
                <FormControl>
                  <Input
                    placeholder="12345678901234"
                    maxLength={14}
                    disabled={upsertMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  14 chiffres sans espaces
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Legal Information Section (Story 2.2) */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations légales</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="legalForm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forme juridique</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={upsertMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEGAL_FORMS.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capitalSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capital social (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10000"
                      disabled={upsertMutation.isPending}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? null : parseInt(value, 10));
                      }}
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
              name="nafCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code NAF/APE</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="6201Z"
                      maxLength={5}
                      disabled={upsertMutation.isPending}
                      {...field}
                      onChange={(e) => {
                        // Force uppercase for the letter
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: 4 chiffres + 1 lettre
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="creationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de création</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={upsertMutation.isPending}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e.target.value || null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="rcsCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville d&apos;immatriculation RCS</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Paris"
                    disabled={upsertMutation.isPending}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Ville du registre du commerce et des sociétés
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Adresse</h3>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 rue de l'Exemple"
                    disabled={upsertMutation.isPending}
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
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code postal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="75001"
                      maxLength={10}
                      disabled={upsertMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paris"
                      disabled={upsertMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays</FormLabel>
                <FormControl>
                  <Input
                    placeholder="France"
                    disabled={upsertMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact</h3>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    disabled={upsertMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@masociete.fr"
                    disabled={upsertMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.masociete.fr"
                    disabled={upsertMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={upsertMutation.isPending}>
          {upsertMutation.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}
