"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building,
  FolderOpen,
  Settings,
  CreditCard,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useSidebar } from "./sidebar-context";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mes AO", href: "/tenders", icon: FileText },
  { label: "Profil Entreprise", href: "/profile", icon: Building },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Paramètres", href: "/settings", icon: Settings },
  { label: "Facturation", href: "/billing", icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const toggleButton = (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {isCollapsed ? "Développer" : "Réduire"}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with Logo and Toggle */}
      <div className={cn(
        "h-16 flex items-center border-b",
        isCollapsed ? "flex-col justify-center gap-1 px-2 py-2" : "justify-between px-4"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg">AppelOffre</span>
          )}
        </Link>
        {isCollapsed && <div className="w-full border-t my-1" />}
        {toggleButton}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1",
        isCollapsed ? "p-2" : "p-4"
      )}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && item.label}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkContent}</div>;
        })}
      </nav>
    </div>
  );
}
