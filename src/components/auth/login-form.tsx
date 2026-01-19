"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { loginSchema, type LoginInput } from "~/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth returns "CredentialsSignin" for invalid credentials
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
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
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>

        {process.env.NODE_ENV === "development" && (
          <>
            <Separator className="my-4" />
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              disabled={isLoading}
              onClick={async () => {
                setError(null);
                setIsLoading(true);
                try {
                  const result = await signIn("credentials", {
                    email: "jacques.steeven@gmail.com",
                    password: "Password123",
                    redirect: false,
                  });
                  if (result?.error) {
                    setError("Connexion dev échouée - vérifiez que l'utilisateur existe");
                  } else {
                    router.push("/dashboard");
                    router.refresh();
                  }
                } catch {
                  setError("Erreur de connexion dev");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              🔧 Dev: Connexion Super Admin
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
