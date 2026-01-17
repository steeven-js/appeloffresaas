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

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b",
        isCollapsed ? "justify-center px-2" : "px-6"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg">AppelOffre</span>
          )}
        </Link>
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

      {/* Toggle button */}
      <div className={cn(
        "border-t",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "sm"}
          onClick={toggle}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            isCollapsed ? "w-full" : "w-full justify-start gap-3"
          )}
        >
          {isCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Réduire</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
