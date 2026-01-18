import { NextResponse } from "next/server";
import { Packer } from "docx";
import { eq, asc, desc } from "drizzle-orm";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { demandProjects, demandDocuments, companyProfiles } from "~/server/db/schema";
import { createDemandDocxDocument } from "~/lib/docx/demand-docx-document";
import { generateExportFilename } from "~/lib/utils/filename";

/**
 * GET /api/export/docx/[demandId] - Generate and download DOCX for a demand project
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

    // Prepare DOCX data
    const docxData = {
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

    // Generate DOCX document
    const doc = createDemandDocxDocument(docxData);

    // Convert to buffer
    const docxBuffer = await Packer.toBuffer(doc);

    // Convert to Uint8Array for NextResponse compatibility
    const docxBytes = new Uint8Array(docxBuffer);

    // Generate filename: DEMANDE_[REF]_[TITRE]_YYYYMMDD.docx
    const filename = generateExportFilename(
      project.title,
      project.reference,
      "docx"
    );

    // Return DOCX as download
    return new NextResponse(docxBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du document Word" },
      { status: 500 }
    );
  }
}
