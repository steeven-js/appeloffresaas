"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/trpc/react";

const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

type ProfileFormInput = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const utils = api.useUtils();

  const { data: profile, isLoading } = api.user.getProfile.useQuery();

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  // Update form when profile is loaded
  useEffect(() => {
    if (profile?.name) {
      form.reset({ name: profile.name });
    }
  }, [profile, form]);

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void utils.user.getProfile.invalidate();
    },
  });

  const onSubmit = async (data: ProfileFormInput) => {
    await updateProfileMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {updateProfileMutation.isSuccess && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            Profil mis à jour avec succès
          </div>
        )}

        {updateProfileMutation.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {updateProfileMutation.error.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jean Dupont"
                  disabled={updateProfileMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending
            ? "Enregistrement..."
            : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}
