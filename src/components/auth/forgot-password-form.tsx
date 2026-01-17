"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "~/lib/validations/auth";
import { api } from "~/trpc/react";

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = api.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await requestResetMutation.mutateAsync(data);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">Email envoyé</p>
          <p className="mt-1">
            Si un compte existe avec cette adresse email, vous recevrez un lien
            de réinitialisation dans quelques minutes.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Pensez à vérifier votre dossier spam si vous ne recevez pas l&apos;email.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {requestResetMutation.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            Une erreur est survenue. Veuillez réessayer.
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jean.dupont@exemple.fr"
                  autoComplete="email"
                  disabled={requestResetMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={requestResetMutation.isPending}
        >
          {requestResetMutation.isPending
            ? "Envoi en cours..."
            : "Envoyer le lien de réinitialisation"}
        </Button>
      </form>
    </Form>
  );
}
