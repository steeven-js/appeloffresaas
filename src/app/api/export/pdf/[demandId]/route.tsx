import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { eq, asc, desc } from "drizzle-orm";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { demandProjects, demandDocuments, companyProfiles } from "~/server/db/schema";
import { DemandPdfDocument } from "~/lib/pdf/demand-pdf-document";
import { generateExportFilename } from "~/lib/utils/filename";

/**
 * GET /api/export/pdf/[demandId] - Generate and download PDF for a demand project
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ demandId: string }> }
) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { demandId } = await params;

    // Fetch the demand project
    const project = await db.query.demandProjects.findFirst({
      where: eq(demandProjects.id, demandId),
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Fetch annexes for the project
    const annexes = await db.query.demandDocuments.findMany({
      where: eq(demandDocuments.demandProjectId, demandId),
      orderBy: [asc(demandDocuments.displayOrder), desc(demandDocuments.createdAt)],
      columns: {
        originalName: true,
      },
    });

    // Fetch company profile for cover page
    const companyProfile = await db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, session.user.id),
      columns: {
        name: true,
      },
    });

    // Prepare PDF data
    const pdfData = {
      title: project.title,
      reference: project.reference,
      departmentName: project.departmentName,
      contactName: project.contactName,
      contactEmail: project.contactEmail,
      needType: project.needType,
      urgencyLevel: project.urgencyLevel,
      budgetRange: project.budgetRange,
      desiredDeliveryDate: project.desiredDeliveryDate,
      createdAt: project.createdAt?.toISOString(),
      sections: project.sections ?? [],
      annexes: annexes.filter(a => a.originalName),
      generatedDate: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      company: companyProfile ? { name: companyProfile.name } : null,
    };

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <DemandPdfDocument data={pdfData} />
    );

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfBytes = new Uint8Array(pdfBuffer);

    // Generate filename: DEMANDE_[REF]_[TITRE]_YYYYMMDD.pdf
    const filename = generateExportFilename(
      project.title,
      project.reference,
      "pdf"
    );

    // Return PDF as download
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
