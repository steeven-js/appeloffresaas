"use client";

import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/components/ui/alert";

interface BillingAlertProps {
  type: "success" | "warning" | "error" | "info";
  title: string;
  description: string;
}

const alertConfig = {
  success: {
    icon: CheckCircle2,
    className: "border-green-500/50 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400",
  },
  warning: {
    icon: AlertCircle,
    className: "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
  },
  error: {
    icon: XCircle,
    className: "border-red-500/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400",
  },
  info: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400",
  },
};

export function BillingAlert({ type, title, description }: BillingAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Alert className={config.className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
