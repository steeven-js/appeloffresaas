"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

const financialYearSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  revenue: z.coerce.number().int().nullable().optional(),
  netIncome: z.coerce.number().int().nullable().optional(),
  employeeCount: z.coerce.number().int().positive().nullable().optional(),
});

type FinancialYearInput = z.infer<typeof financialYearSchema>;

interface YearFormProps {
  year: number;
  defaultValues?: {
    revenue?: number | null;
    netIncome?: number | null;
    employeeCount?: number | null;
  };
  isStale?: boolean;
  onSuccess: () => void;
  onDelete?: () => void;
}

function YearForm({ year, defaultValues, isStale, onSuccess, onDelete }: YearFormProps) {
  const form = useForm<FinancialYearInput>({
    resolver: zodResolver(financialYearSchema),
    defaultValues: {
      year,
      revenue: defaultValues?.revenue ?? null,
      netIncome: defaultValues?.netIncome ?? null,
      employeeCount: defaultValues?.employeeCount ?? null,
    },
  });

  const upsertMutation = api.companyFinancial.upsertFinancialYear.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const deleteMutation = api.companyFinancial.deleteFinancialYear.useMutation({
    onSuccess: () => {
      onDelete?.();
    },
  });

  const onSubmit = async (data: FinancialYearInput) => {
    await upsertMutation.mutateAsync(data);
  };

  const isPending = upsertMutation.isPending || deleteMutation.isPending;

  return (
    <Card className={cn(isStale && "border-orange-300 bg-orange-50/50")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Année {year}</CardTitle>
            {isStale && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Données anciennes</span>
              </div>
            )}
          </div>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les données de {year} ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Les données financières de l&apos;année {year} seront définitivement supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate({ year })}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        {isStale && (
          <CardDescription className="text-orange-600">
            Ces données datent de plus d&apos;un an. Pensez à les mettre à jour.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register("year")} />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chiffre d&apos;affaires (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000000"
                        disabled={isPending}
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

              <FormField
                control={form.control}
                name="netIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Résultat net (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100000"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : parseInt(value, 10));
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Peut être négatif
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effectif</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        min={1}
                        disabled={isPending}
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

            {upsertMutation.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {upsertMutation.error.message}
              </div>
            )}

            {upsertMutation.isSuccess && (
              <div className="rounded-md bg-green-50 p-2 text-sm text-green-800">
                Données enregistrées
              </div>
            )}

            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function FinancialDataForm() {
  const utils = api.useUtils();
  const [addingYear, setAddingYear] = useState<number | null>(null);

  const { data: financialData, isLoading: isLoadingData } =
    api.companyFinancial.getFinancialData.useQuery();

  const { data: suggestedYears } = api.companyFinancial.getSuggestedYears.useQuery();

  const handleSuccess = () => {
    void utils.companyFinancial.getFinancialData.invalidate();
    setAddingYear(null);
  };

  const handleDelete = () => {
    void utils.companyFinancial.getFinancialData.invalidate();
  };

  if (isLoadingData) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  // Get existing years
  const existingYears = new Set(financialData?.data.map((d) => d.year) ?? []);

  // Get available years to add (suggested years that don't exist yet)
  const availableYears =
    suggestedYears?.years.filter((y) => !existingYears.has(y)) ?? [];

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Renseignez les données financières de votre entreprise pour les 3 dernières années.
          Ces informations sont souvent demandées dans les appels d&apos;offres pour évaluer
          la solidité financière des candidats.
        </p>
      </div>

      {/* Existing data */}
      {financialData?.data.map((record) => (
        <YearForm
          key={record.id}
          year={record.year}
          defaultValues={{
            revenue: record.revenue,
            netIncome: record.netIncome,
            employeeCount: record.employeeCount,
          }}
          isStale={record.isStale}
          onSuccess={handleSuccess}
          onDelete={handleDelete}
        />
      ))}

      {/* Add new year form */}
      {addingYear !== null && (
        <YearForm
          year={addingYear}
          onSuccess={handleSuccess}
          onDelete={() => setAddingYear(null)}
        />
      )}

      {/* Add year button */}
      {availableYears.length > 0 && addingYear === null && (
        <div className="flex items-center gap-2">
          <Select onValueChange={(value) => setAddingYear(parseInt(value, 10))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ajouter une année..." />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  Année {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (availableYears[0]) {
                setAddingYear(availableYears[0]);
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {financialData?.data.length === 0 && addingYear === null && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Aucune donnée financière enregistrée.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              if (availableYears[0]) {
                setAddingYear(availableYears[0]);
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter des données financières
          </Button>
        </div>
      )}
    </div>
  );
}
