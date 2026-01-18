import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Packer } from "docx";
import { eq, asc, desc } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import JSZip from "jszip";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { demandProjects, demandDocuments, companyProfiles } from "~/server/db/schema";
import { DemandPdfDocument } from "~/lib/pdf/demand-pdf-document";
import { createDemandDocxDocument } from "~/lib/docx/demand-docx-document";
import { generateExportFilename, sanitizeForFilename } from "~/lib/utils/filename";
import { r2Client, R2_BUCKET } from "~/server/services/storage";

/**
 * GET /api/export/zip/[demandId] - Generate and download ZIP archive for a demand project
 * Contains: PDF, DOCX, annexes, and README.txt
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

    // Fetch all annexes for the project
    const annexes = await db.query.demandDocuments.findMany({
      where: eq(demandDocuments.demandProjectId, demandId),
      orderBy: [asc(demandDocuments.displayOrder), desc(demandDocuments.createdAt)],
    });

    // Fetch company profile for cover page
    const companyProfile = await db.query.companyProfiles.findFirst({
      where: eq(companyProfiles.userId, session.user.id),
      columns: {
        name: true,
      },
    });

    // Prepare document data (shared between PDF and DOCX)
    const documentData = {
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
      annexes: annexes.filter(a => a.originalName).map(a => ({ originalName: a.originalName })),
      generatedDate: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      company: companyProfile ? { name: companyProfile.name } : null,
    };

    // Create ZIP archive
    const zip = new JSZip();

    // Generate base filename (without extension)
    const baseFilename = generateExportFilename(project.title, project.reference, "pdf").replace(".pdf", "");

    // 1. Generate and add PDF
    const pdfBuffer = await renderToBuffer(
      <DemandPdfDocument data={documentData} />
    );
    zip.file(`${baseFilename}.pdf`, pdfBuffer);

    // 2. Generate and add DOCX
    const doc = createDemandDocxDocument(documentData);
    const docxBuffer = await Packer.toBuffer(doc);
    zip.file(`${baseFilename}.docx`, docxBuffer);

    // 3. Add annexes in a subfolder
    const annexesFolder = zip.folder("Annexes");
    const annexesList: string[] = [];

    for (const annexe of annexes) {
      try {
        // Fetch file from R2
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET,
          Key: annexe.storageKey,
        });
        const response = await r2Client.send(command);

        if (response.Body) {
          // Convert stream to buffer using SDK's built-in method
          const annexeBuffer = await response.Body.transformToByteArray();

          // Sanitize filename and add to ZIP
          const safeFilename = sanitizeForFilename(annexe.originalName, 100);
          const extension = annexe.originalName.split(".").pop() ?? "";
          const finalFilename = extension && !safeFilename.endsWith(`.${extension}`)
            ? `${safeFilename}.${extension}`
            : safeFilename || annexe.originalName;

          annexesFolder?.file(finalFilename, annexeBuffer);
          annexesList.push(`- ${annexe.originalName} (${formatFileSize(annexe.fileSize)})`);
        }
      } catch (error) {
        console.error(`Failed to fetch annexe ${annexe.id}:`, error);
        annexesList.push(`- ${annexe.originalName} (ERREUR: fichier non disponible)`);
      }
    }

    // 4. Generate README.txt
    const readmeContent = generateReadme({
      title: project.title,
      reference: project.reference,
      departmentName: project.departmentName,
      contactName: project.contactName,
      contactEmail: project.contactEmail,
      createdAt: project.createdAt,
      baseFilename,
      annexesList,
      generatedDate: documentData.generatedDate,
    });
    zip.file("LISEZMOI.txt", readmeContent);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const zipBytes = new Uint8Array(zipBuffer);

    // Generate ZIP filename
    const zipFilename = `${baseFilename}.zip`;

    // Return ZIP as download
    return new NextResponse(zipBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": zipBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("ZIP export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'archive ZIP" },
      { status: 500 }
    );
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Generate README content for the ZIP archive
 */
function generateReadme(params: {
  title: string;
  reference?: string | null;
  departmentName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  createdAt?: Date | null;
  baseFilename: string;
  annexesList: string[];
  generatedDate: string;
}): string {
  const lines: string[] = [
    "═══════════════════════════════════════════════════════════════════",
    "                     DOSSIER DE DEMANDE",
    "═══════════════════════════════════════════════════════════════════",
    "",
    `Titre: ${params.title}`,
  ];

  if (params.reference) {
    lines.push(`Référence: ${params.reference}`);
  }

  lines.push("");
  lines.push("───────────────────────────────────────────────────────────────────");
  lines.push("INFORMATIONS DU DEMANDEUR");
  lines.push("───────────────────────────────────────────────────────────────────");

  if (params.departmentName) {
    lines.push(`Service: ${params.departmentName}`);
  }
  if (params.contactName) {
    lines.push(`Contact: ${params.contactName}`);
  }
  if (params.contactEmail) {
    lines.push(`Email: ${params.contactEmail}`);
  }
  if (params.createdAt) {
    lines.push(`Date de création: ${params.createdAt.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`);
  }

  lines.push("");
  lines.push("───────────────────────────────────────────────────────────────────");
  lines.push("CONTENU DE L'ARCHIVE");
  lines.push("───────────────────────────────────────────────────────────────────");
  lines.push("");
  lines.push("Documents principaux:");
  lines.push(`  - ${params.baseFilename}.pdf (Document principal au format PDF)`);
  lines.push(`  - ${params.baseFilename}.docx (Document principal au format Word)`);
  lines.push("");

  if (params.annexesList.length > 0) {
    lines.push(`Annexes (${params.annexesList.length} fichier${params.annexesList.length > 1 ? "s" : ""}):`);
    lines.push("  Dossier: Annexes/");
    params.annexesList.forEach(annexe => {
      lines.push(`    ${annexe}`);
    });
  } else {
    lines.push("Annexes: Aucune annexe jointe");
  }

  lines.push("");
  lines.push("───────────────────────────────────────────────────────────────────");
  lines.push("");
  lines.push(`Archive générée le ${params.generatedDate}`);
  lines.push("Généré par AppelOffreSaaS");
  lines.push("");

  return lines.join("\n");
}
