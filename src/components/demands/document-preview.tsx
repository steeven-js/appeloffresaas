"use client";

import { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { markdownToHtml } from "~/lib/utils/markdown-parser";
import type { DemandSection } from "~/server/db/schema";

interface DocumentPreviewProps {
  title: string;
  reference?: string | null;
  departmentName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  needType?: string | null;
  urgencyLevel?: string | null;
  budgetRange?: string | null;
  desiredDeliveryDate?: string | null;
  sections: DemandSection[];
  onClose?: () => void;
  className?: string;
}

const needTypeLabels: Record<string, string> = {
  fourniture: "Fourniture / Équipement",
  service: "Prestation de service",
  travaux: "Travaux / Construction",
  formation: "Formation",
  logiciel: "Logiciel / Licence",
  maintenance: "Maintenance / Support",
  autre: "Autre",
};

const urgencyLabels: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Urgent",
  critical: "Critique",
};

export function DocumentPreview({
  title,
  reference,
  departmentName,
  contactName,
  contactEmail,
  needType,
  urgencyLevel,
  budgetRange,
  desiredDeliveryDate,
  sections,
  onClose,
  className,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Calculate approximate page count based on content height
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    if (contentRef.current) {
      // A4 page at 96 DPI is approximately 794px height (minus margins)
      const contentHeight = contentRef.current.scrollHeight;
      const pageHeight = 1000; // Approximate content height per page
      setPageCount(Math.max(1, Math.ceil(contentHeight / pageHeight)));
    }
  }, [sections, title, zoom]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      void containerRef.current.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const scrollToPage = (page: number) => {
    if (contentRef.current) {
      const pageHeight = 1000 * (zoom / 100);
      contentRef.current.scrollTo({
        top: (page - 1) * pageHeight,
        behavior: "smooth",
      });
      setCurrentPage(page);
    }
  };

  // Track scroll position to update current page
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const pageHeight = 1000 * (zoom / 100);
        const scrollTop = contentRef.current.scrollTop;
        const page = Math.floor(scrollTop / pageHeight) + 1;
        setCurrentPage(Math.min(page, pageCount));
      }
    };

    const content = contentRef.current;
    content?.addEventListener("scroll", handleScroll);
    return () => content?.removeEventListener("scroll", handleScroll);
  }, [zoom, pageCount]);

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-muted/50 border-l",
        isFullscreen && "fixed inset-0 z-50 bg-background",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-3 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Aperçu du document</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Page Navigation */}
          <div className="flex items-center gap-1 mr-2 border-r pr-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              {currentPage} / {pageCount}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => scrollToPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage >= pageCount}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Zoom arrière"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[40px] text-center">
            {zoom}%
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom avant"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleZoomReset}
            title="Réinitialiser le zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 ml-1"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {/* Close Button */}
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 ml-1"
              onClick={onClose}
              title="Fermer l'aperçu"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-auto p-4 bg-muted/30"
        style={{ scrollBehavior: "smooth" }}
      >
        <div
          className="mx-auto transition-transform origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            width: `${100 / (zoom / 100)}%`,
            maxWidth: "210mm", // A4 width
          }}
        >
          {/* Document Page */}
          <div className="bg-white shadow-lg rounded-sm mx-auto" style={{ maxWidth: "210mm" }}>
            {/* Page Content */}
            <div className="p-12 min-h-[297mm]">
              {/* Document Header */}
              <div className="border-b-2 border-primary pb-6 mb-8">
                <h1 className="text-2xl font-bold text-primary mb-2">{title || "Sans titre"}</h1>
                {reference && (
                  <p className="text-sm text-muted-foreground">Référence : {reference}</p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                {departmentName && (
                  <div>
                    <span className="font-medium text-muted-foreground">Service demandeur :</span>
                    <p>{departmentName}</p>
                  </div>
                )}
                {contactName && (
                  <div>
                    <span className="font-medium text-muted-foreground">Contact :</span>
                    <p>{contactName}</p>
                    {contactEmail && <p className="text-muted-foreground">{contactEmail}</p>}
                  </div>
                )}
                {needType && (
                  <div>
                    <span className="font-medium text-muted-foreground">Type de besoin :</span>
                    <p>{needTypeLabels[needType] ?? needType}</p>
                  </div>
                )}
                {urgencyLevel && (
                  <div>
                    <span className="font-medium text-muted-foreground">Niveau d&apos;urgence :</span>
                    <p>{urgencyLabels[urgencyLevel] ?? urgencyLevel}</p>
                  </div>
                )}
                {budgetRange && (
                  <div>
                    <span className="font-medium text-muted-foreground">Budget estimé :</span>
                    <p>{budgetRange}</p>
                  </div>
                )}
                {desiredDeliveryDate && (
                  <div>
                    <span className="font-medium text-muted-foreground">Date souhaitée :</span>
                    <p>{new Date(desiredDeliveryDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {sortedSections.map((section, index) => (
                  <div key={section.id} className="break-inside-avoid">
                    <h2 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                      {index + 1}. {section.title}
                    </h2>
                    {section.content ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }}
                      />
                    ) : (
                      <p className="text-muted-foreground italic text-sm">
                        Cette section est vide.
                      </p>
                    )}
                  </div>
                ))}

                {sortedSections.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune section à afficher.</p>
                    <p className="text-sm">Ajoutez du contenu pour voir l&apos;aperçu.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-4 border-t text-xs text-muted-foreground text-center">
                <p>Document généré le {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
