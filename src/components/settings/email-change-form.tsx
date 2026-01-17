"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { api } from "~/trpc/react";

const emailChangeSchema = z.object({
  newEmail: z.string().email("Veuillez entrer une adresse email valide"),
});

type EmailChangeFormInput = z.infer<typeof emailChangeSchema>;

interface EmailChangeFormProps {
  currentEmail: string;
}

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<EmailChangeFormInput>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const requestEmailChangeMutation = api.user.requestEmailChange.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
    },
  });

  const onSubmit = async (data: EmailChangeFormInput) => {
    await requestEmailChangeMutation.mutateAsync(data);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">Email de vérification envoyé</p>
          <p className="mt-1">
            Un email a été envoyé à votre nouvelle adresse. Cliquez sur le lien
            pour confirmer le changement.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
        >
          Changer d&apos;adresse
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {requestEmailChangeMutation.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {requestEmailChangeMutation.error.message}
          </div>
        )}

        <div className="text-sm">
          <span className="text-muted-foreground">Email actuel : </span>
          <span className="font-medium">{currentEmail}</span>
        </div>

        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouvelle adresse email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="nouvelle@exemple.fr"
                  autoComplete="email"
                  disabled={requestEmailChangeMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Un email de vérification sera envoyé à cette adresse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={requestEmailChangeMutation.isPending}>
          {requestEmailChangeMutation.isPending
            ? "Envoi en cours..."
            : "Envoyer le lien de vérification"}
        </Button>
      </form>
    </Form>
  );
}
