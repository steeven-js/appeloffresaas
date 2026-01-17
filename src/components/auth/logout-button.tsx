"use client";

import { signOut } from "next-auth/react";

import { Button } from "~/components/ui/button";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
}

export function LogoutButton({ variant = "ghost" }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Button type="button" variant={variant} onClick={handleLogout}>
      Se déconnecter
    </Button>
  );
}
