"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

// Route label mapping (French)
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  tenders: "Mes AO",
  profile: "Profil",
  company: "Entreprise",
  documents: "Documents",
  settings: "Paramètres",
  billing: "Facturation",
};

function getRouteLabel(segment: string): string {
  return routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

interface AppHeaderProps {
  actions?: React.ReactNode;
}

export function AppHeader({ actions }: AppHeaderProps) {
  const pathname = usePathname();

  // Parse pathname into breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);

  // Build breadcrumb items with cumulative paths
  const breadcrumbItems = segments.map((segment, index) => {
    const path = "/" + segments.slice(0, index + 1).join("/");
    const label = getRouteLabel(segment);
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  return (
    <header className="h-14 border-b flex items-center justify-between px-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <Fragment key={item.path}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.path}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Optional action buttons */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
