import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from "docx";
import type { DemandSection } from "~/server/db/schema";

// Color palette (matching PDF)
const colors = {
  primary: "0066CC",
  text: "1a1a2e",
  muted: "6b7280",
  border: "e5e7eb",
};

// Label maps
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

// Types (matching PDF)
export interface CompanyInfo {
  name?: string | null;
}

export interface DemandDocxData {
  title: string;
  reference?: string | null;
  departmentName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  needType?: string | null;
  urgencyLevel?: string | null;
  budgetRange?: string | null;
  desiredDeliveryDate?: string | null;
  createdAt?: string | null;
  sections: DemandSection[];
  annexes?: { originalName: string }[];
  generatedDate: string;
  company?: CompanyInfo | null;
}

/**
 * Strip HTML tags and convert to plain text
 */
function stripHtml(html: string): string {
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

/**
 * Create cover page content
 */
function createCoverPage(data: DemandDocxData): Paragraph[] {
  const elements: Paragraph[] = [];

  // Add spacing at top
  elements.push(new Paragraph({ spacing: { before: 2000 } }));

  // Document type
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "DOSSIER DE DEMANDE",
          color: colors.muted,
          size: 24,
          allCaps: true,
        }),
      ],
    })
  );

  // Title
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 600 },
      children: [
        new TextRun({
          text: data.title || "Sans titre",
          color: colors.primary,
          size: 56,
          bold: true,
        }),
      ],
    })
  );

  // Divider line
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      border: {
        bottom: {
          color: colors.primary,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [new TextRun({ text: "                    " })],
    })
  );

  // Info table
  const infoRows: TableRow[] = [];

  if (data.reference) {
    infoRows.push(createInfoRow("Référence", data.reference));
  }
  if (data.departmentName) {
    infoRows.push(createInfoRow("Service", data.departmentName));
  }
  if (data.contactName) {
    infoRows.push(createInfoRow("Contact", data.contactName));
  }
  if (data.needType) {
    infoRows.push(
      createInfoRow("Type de besoin", needTypeLabels[data.needType] ?? data.needType)
    );
  }
  if (data.createdAt) {
    const createdDate = new Date(data.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    infoRows.push(createInfoRow("Date de création", createdDate));
  }

  // Add info table (will be added as a separate section element)
  if (infoRows.length > 0) {
    elements.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [],
      })
    );
  }

  // Company name at bottom
  if (data.company?.name) {
    elements.push(
      new Paragraph({
        spacing: { before: 2000 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: data.company.name,
            size: 24,
            bold: true,
          }),
        ],
      })
    );
  }

  // Generation date
  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: `Document généré le ${data.generatedDate}`,
          color: colors.muted,
          size: 20,
        }),
      ],
    })
  );

  // Page break after cover
  elements.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return elements;
}

/**
 * Create info row for cover page table
 */
function createInfoRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: label.toUpperCase(),
                color: colors.muted,
                size: 18,
                bold: true,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `   ${value}`,
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Create table of contents (manual - Word will auto-generate on update)
 */
function createTableOfContents(data: DemandDocxData): Paragraph[] {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  const hasAnnexes = data.annexes && data.annexes.length > 0;

  const elements: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: "Sommaire",
          color: colors.primary,
        }),
      ],
    }),
  ];

  // Add TOC entries manually
  sortedSections.forEach((section, index) => {
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${index + 1}. ${section.title}`,
            size: 22,
          }),
        ],
      })
    );
  });

  if (hasAnnexes) {
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${sortedSections.length + 1}. Annexes`,
            size: 22,
          }),
        ],
      })
    );
  }

  elements.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return elements;
}

/**
 * Create metadata section
 */
function createMetadataSection(data: DemandDocxData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  const metadataRows: { label: string; value: string }[] = [];

  if (data.departmentName) {
    metadataRows.push({ label: "Service demandeur", value: data.departmentName });
  }
  if (data.contactName) {
    const contactValue = data.contactEmail
      ? `${data.contactName} (${data.contactEmail})`
      : data.contactName;
    metadataRows.push({ label: "Contact", value: contactValue });
  }
  if (data.needType) {
    metadataRows.push({
      label: "Type de besoin",
      value: needTypeLabels[data.needType] ?? data.needType,
    });
  }
  if (data.urgencyLevel) {
    metadataRows.push({
      label: "Niveau d'urgence",
      value: urgencyLabels[data.urgencyLevel] ?? data.urgencyLevel,
    });
  }
  if (data.budgetRange) {
    metadataRows.push({ label: "Budget estimé", value: data.budgetRange });
  }
  if (data.desiredDeliveryDate) {
    metadataRows.push({
      label: "Date souhaitée",
      value: new Date(data.desiredDeliveryDate).toLocaleDateString("fr-FR"),
    });
  }

  if (metadataRows.length > 0) {
    // Create 2-column layout
    const rows: TableRow[] = [];
    for (let i = 0; i < metadataRows.length; i += 2) {
      const row1 = metadataRows[i];
      const row2 = metadataRows[i + 1];

      rows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: "f9fafb" },
              margins: {
                top: convertInchesToTwip(0.1),
                bottom: convertInchesToTwip(0.1),
                left: convertInchesToTwip(0.1),
                right: convertInchesToTwip(0.1),
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: row1!.label.toUpperCase(),
                      color: colors.muted,
                      size: 16,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: row1!.value,
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: "f9fafb" },
              margins: {
                top: convertInchesToTwip(0.1),
                bottom: convertInchesToTwip(0.1),
                left: convertInchesToTwip(0.1),
                right: convertInchesToTwip(0.1),
              },
              children: row2
                ? [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: row2.label.toUpperCase(),
                          color: colors.muted,
                          size: 16,
                          bold: true,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: row2.value,
                          size: 22,
                        }),
                      ],
                    }),
                  ]
                : [new Paragraph({ children: [] })],
            }),
          ],
        })
      );
    }

    elements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows,
      })
    );

    elements.push(new Paragraph({ spacing: { after: 400 } }));
  }

  return elements;
}

/**
 * Create content paragraphs from HTML content
 */
function createContentParagraphs(content: string): Paragraph[] {
  const plainText = stripHtml(content);
  const paragraphs = plainText.split("\n\n").filter((p) => p.trim());

  const elements: Paragraph[] = [];

  for (const paragraph of paragraphs) {
    const lines = paragraph.split("\n").filter((l) => l.trim());

    for (const line of lines) {
      if (line.startsWith("• ")) {
        // Bullet point
        elements.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: line.substring(2),
                size: 22,
              }),
            ],
          })
        );
      } else {
        // Regular paragraph
        elements.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: line,
                size: 22,
              }),
            ],
          })
        );
      }
    }
  }

  return elements;
}

/**
 * Create section content
 */
function createSections(data: DemandDocxData): (Paragraph | Table)[] {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  const elements: (Paragraph | Table)[] = [];

  sortedSections.forEach((section, index) => {
    // Section heading
    elements.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: colors.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        children: [
          new TextRun({
            text: `${index + 1}. ${section.title}`,
            color: colors.primary,
            bold: true,
          }),
        ],
      })
    );

    // Section content
    if (section.content) {
      elements.push(...createContentParagraphs(section.content));
    } else {
      elements.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Cette section n'a pas été renseignée.",
              italics: true,
              color: colors.muted,
              size: 20,
            }),
          ],
        })
      );
    }
  });

  return elements;
}

/**
 * Create annexes section
 */
function createAnnexesSection(data: DemandDocxData): Paragraph[] {
  if (!data.annexes || data.annexes.length === 0) {
    return [];
  }

  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  const elements: Paragraph[] = [];

  // Section heading
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      border: {
        bottom: {
          color: colors.border,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: `${sortedSections.length + 1}. Annexes`,
          color: colors.primary,
          bold: true,
        }),
      ],
    })
  );

  // List annexes
  data.annexes.forEach((annexe, index) => {
    elements.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: `${index + 1}. `,
            bold: true,
            color: colors.primary,
          }),
          new TextRun({
            text: annexe.originalName,
            size: 22,
          }),
        ],
      })
    );
  });

  return elements;
}

/**
 * Create the Word document
 */
export function createDemandDocxDocument(data: DemandDocxData): Document {
  // Build all sections
  const coverPageContent = createCoverPage(data);
  const tocContent = createTableOfContents(data);
  const metadataContent = createMetadataSection(data);
  const sectionsContent = createSections(data);
  const annexesContent = createAnnexesSection(data);

  // Create document with header and footer
  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 36,
            bold: true,
            color: colors.primary,
          },
          paragraph: {
            spacing: { before: 400, after: 200 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 28,
            bold: true,
            color: colors.primary,
          },
          paragraph: {
            spacing: { before: 300, after: 150 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: {
                  bottom: {
                    color: colors.border,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: data.title || "Dossier de Demande",
                    color: colors.primary,
                    size: 18,
                  }),
                  data.reference
                    ? new TextRun({
                        text: `  |  Réf: ${data.reference}`,
                        color: colors.muted,
                        size: 18,
                      })
                    : new TextRun({ text: "" }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: colors.border,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "Dossier de Demande",
                    color: colors.muted,
                    size: 16,
                  }),
                  new TextRun({
                    text: `  |  Généré le ${data.generatedDate}  |  Page `,
                    color: colors.muted,
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: colors.text,
                    size: 16,
                  }),
                  new TextRun({
                    text: " / ",
                    color: colors.muted,
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    color: colors.text,
                    size: 16,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...coverPageContent,
          ...tocContent,
          // Document title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: data.title || "Dossier de Demande",
                color: colors.primary,
              }),
            ],
          }),
          data.reference
            ? new Paragraph({
                spacing: { after: 400 },
                children: [
                  new TextRun({
                    text: `Référence : ${data.reference}`,
                    color: colors.muted,
                    size: 20,
                  }),
                ],
              })
            : new Paragraph({ children: [] }),
          ...metadataContent,
          ...sectionsContent,
          ...annexesContent,
        ],
      },
    ],
  });
}
