import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import type { DemandSection } from "~/server/db/schema";

// Use built-in Helvetica font for reliability
// Custom fonts via URL can fail in serverless environments
// If you need custom fonts, bundle them locally in /public/fonts/

// Color palette
const colors = {
  primary: "#0066CC",
  text: "#1a1a2e",
  muted: "#6b7280",
  border: "#e5e7eb",
  background: "#f9fafb",
};

// Styles
const styles = StyleSheet.create({
  // Content pages (with space for fixed header/footer)
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingTop: 60, // Space for fixed header
    paddingBottom: 50, // Space for fixed footer
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.text,
  },
  // Cover page
  coverPage: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 50,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  coverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLogo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  coverLogoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLogoText: {
    fontSize: 40,
    fontWeight: 700,
    color: "#ffffff",
  },
  coverDocType: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 15,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 30,
    maxWidth: 400,
  },
  coverDivider: {
    width: 80,
    height: 3,
    backgroundColor: colors.primary,
    marginBottom: 30,
  },
  coverInfoBox: {
    backgroundColor: colors.background,
    padding: 25,
    borderRadius: 8,
    width: 350,
    marginBottom: 40,
  },
  coverInfoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  coverInfoLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.muted,
    width: 120,
    textTransform: "uppercase",
  },
  coverInfoValue: {
    fontSize: 11,
    color: colors.text,
    flex: 1,
  },
  coverFooter: {
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: "center",
  },
  coverCompany: {
    fontSize: 12,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 5,
  },
  coverDate: {
    fontSize: 10,
    color: colors.muted,
  },
  // Header
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
  },
  reference: {
    fontSize: 10,
    color: colors.muted,
  },
  // Metadata section
  metadataSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metadataItem: {
    width: "50%",
    marginBottom: 10,
  },
  metadataLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.muted,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  metadataValue: {
    fontSize: 11,
    color: colors.text,
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  emptySection: {
    fontSize: 10,
    fontStyle: "italic",
    color: colors.muted,
  },
  // Paragraph
  paragraph: {
    marginBottom: 8,
  },
  // Lists
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 11,
  },
  listItemText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: colors.muted,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 50,
    fontSize: 9,
    color: colors.muted,
  },
  // Annexes section
  annexesList: {
    marginTop: 10,
  },
  annexeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 3,
  },
  annexeNumber: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 600,
    textAlign: "center",
    lineHeight: 25,
    marginRight: 10,
  },
  annexeName: {
    flex: 1,
    fontSize: 10,
  },
  // Table of Contents styles (with space for fixed header/footer)
  tocPage: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingTop: 60, // Space for fixed header
    paddingBottom: 50, // Space for fixed footer
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  tocHeader: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tocTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.primary,
  },
  tocContent: {
    flex: 1,
  },
  tocEntry: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  tocNumber: {
    width: 30,
    fontSize: 12,
    fontWeight: 600,
    color: colors.primary,
  },
  tocText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  tocLink: {
    textDecoration: "none",
    color: colors.text,
  },
  tocDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderBottomStyle: "dotted",
    marginHorizontal: 10,
    height: 10,
  },
  tocSectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tocMetaLabel: {
    fontSize: 10,
    fontWeight: 500,
    color: colors.muted,
    marginRight: 5,
  },
  tocMetaValue: {
    fontSize: 10,
    color: colors.text,
  },
  tocFooter: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: colors.muted,
  },
  // Fixed Header/Footer styles for all pages (except cover)
  fixedHeader: {
    position: "absolute",
    top: 20,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fixedHeaderTitle: {
    fontSize: 9,
    fontWeight: 500,
    color: colors.primary,
    maxWidth: 300,
  },
  fixedHeaderRef: {
    fontSize: 8,
    color: colors.muted,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fixedFooterLeft: {
    fontSize: 8,
    color: colors.muted,
  },
  fixedFooterCenter: {
    fontSize: 8,
    color: colors.muted,
  },
  fixedFooterRight: {
    fontSize: 9,
    fontWeight: 500,
    color: colors.text,
  },
});

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

// Types
export interface CompanyInfo {
  name?: string | null;
  logoUrl?: string | null;
}

export interface DemandPdfData {
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
  // Replace common HTML elements
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
 * Render content as paragraphs
 */
function ContentRenderer({ content }: { content: string }) {
  const plainText = stripHtml(content);
  const paragraphs = plainText.split("\n\n").filter(p => p.trim());

  return (
    <View>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n").filter(l => l.trim());
        return (
          <View key={index} style={styles.paragraph}>
            {lines.map((line, lineIndex) => {
              if (line.startsWith("• ")) {
                return (
                  <View key={lineIndex} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listItemText}>{line.substring(2)}</Text>
                  </View>
                );
              }
              return <Text key={lineIndex} style={styles.sectionContent}>{line}</Text>;
            })}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Fixed Page Header component - appears on every page (except cover)
 */
function PageHeader({ title, reference }: { title: string; reference?: string | null }) {
  return (
    <View style={styles.fixedHeader} fixed>
      <Text style={styles.fixedHeaderTitle}>{title || "Dossier de Demande"}</Text>
      {reference && <Text style={styles.fixedHeaderRef}>Réf: {reference}</Text>}
    </View>
  );
}

/**
 * Fixed Page Footer component - appears on every page (except cover)
 */
function PageFooter({ generatedDate }: { generatedDate: string }) {
  return (
    <View style={styles.fixedFooter} fixed>
      <Text style={styles.fixedFooterLeft}>Dossier de Demande</Text>
      <Text style={styles.fixedFooterCenter}>Généré le {generatedDate}</Text>
      <Text
        style={styles.fixedFooterRight}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

/**
 * Cover Page component
 */
function CoverPage({ data }: { data: DemandPdfData }) {
  const companyInitial = data.company?.name?.[0]?.toUpperCase() ?? "D";

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverContainer}>
        {/* Logo or Placeholder */}
        {data.company?.logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={data.company.logoUrl} style={styles.coverLogo} />
        ) : (
          <View style={styles.coverLogoPlaceholder}>
            <Text style={styles.coverLogoText}>{companyInitial}</Text>
          </View>
        )}

        {/* Document Type */}
        <Text style={styles.coverDocType}>Dossier de Demande</Text>

        {/* Title */}
        <Text style={styles.coverTitle}>{data.title || "Sans titre"}</Text>

        {/* Divider */}
        <View style={styles.coverDivider} />

        {/* Info Box */}
        <View style={styles.coverInfoBox}>
          {data.reference && (
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Référence</Text>
              <Text style={styles.coverInfoValue}>{data.reference}</Text>
            </View>
          )}
          {data.departmentName && (
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Service</Text>
              <Text style={styles.coverInfoValue}>{data.departmentName}</Text>
            </View>
          )}
          {data.contactName && (
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Contact</Text>
              <Text style={styles.coverInfoValue}>{data.contactName}</Text>
            </View>
          )}
          {data.needType && (
            <View style={styles.coverInfoRow}>
              <Text style={styles.coverInfoLabel}>Type de besoin</Text>
              <Text style={styles.coverInfoValue}>
                {needTypeLabels[data.needType] ?? data.needType}
              </Text>
            </View>
          )}
          {data.createdAt && (
            <View style={[styles.coverInfoRow, { marginBottom: 0 }]}>
              <Text style={styles.coverInfoLabel}>Date de création</Text>
              <Text style={styles.coverInfoValue}>
                {new Date(data.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.coverFooter}>
        {data.company?.name && (
          <Text style={styles.coverCompany}>{data.company.name}</Text>
        )}
        <Text style={styles.coverDate}>
          Document généré le {data.generatedDate}
        </Text>
      </View>
    </Page>
  );
}

/**
 * Table of Contents Page component
 */
function TableOfContentsPage({ data }: { data: DemandPdfData }) {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  const hasAnnexes = data.annexes && data.annexes.length > 0;

  return (
    <Page size="A4" style={styles.tocPage}>
      {/* Fixed Header */}
      <PageHeader title={data.title} reference={data.reference} />

      {/* Page Title */}
      <View style={styles.tocHeader}>
        <Text style={styles.tocTitle}>Sommaire</Text>
      </View>

      {/* Document Info */}
      <View style={styles.tocSectionMeta}>
        <Text style={styles.tocMetaLabel}>Document :</Text>
        <Text style={styles.tocMetaValue}>{data.title || "Dossier de Demande"}</Text>
        {data.reference && (
          <>
            <Text style={[styles.tocMetaLabel, { marginLeft: 20 }]}>Réf :</Text>
            <Text style={styles.tocMetaValue}>{data.reference}</Text>
          </>
        )}
      </View>

      {/* TOC Content */}
      <View style={styles.tocContent}>
        {/* Main sections */}
        {sortedSections.map((section, index) => (
          <Link key={section.id} src={`#section-${section.id}`} style={styles.tocLink}>
            <View style={styles.tocEntry}>
              <Text style={styles.tocNumber}>{index + 1}.</Text>
              <Text style={styles.tocText}>{section.title}</Text>
            </View>
          </Link>
        ))}

        {/* Annexes entry */}
        {hasAnnexes && (
          <Link src="#section-annexes" style={styles.tocLink}>
            <View style={styles.tocEntry}>
              <Text style={styles.tocNumber}>{sortedSections.length + 1}.</Text>
              <Text style={styles.tocText}>
                Annexes ({data.annexes!.length} document{data.annexes!.length > 1 ? "s" : ""})
              </Text>
            </View>
          </Link>
        )}
      </View>

      {/* Section count info */}
      <Text style={styles.tocFooter}>
        {sortedSections.length} section{sortedSections.length > 1 ? "s" : ""}
        {hasAnnexes && ` • ${data.annexes!.length} annexe${data.annexes!.length > 1 ? "s" : ""}`}
      </Text>

      {/* Fixed Footer */}
      <PageFooter generatedDate={data.generatedDate} />
    </Page>
  );
}

/**
 * Content Page component
 */
function ContentPage({ data }: { data: DemandPdfData }) {
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  return (
    <Page size="A4" style={styles.page}>
      {/* Fixed Header */}
      <PageHeader title={data.title} reference={data.reference} />

      {/* Page Title Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.title || "Dossier de Demande"}</Text>
        {data.reference && (
          <Text style={styles.reference}>Référence : {data.reference}</Text>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.metadataSection}>
        <View style={styles.metadataGrid}>
          {data.departmentName && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Service demandeur</Text>
              <Text style={styles.metadataValue}>{data.departmentName}</Text>
            </View>
          )}
          {data.contactName && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Contact</Text>
              <Text style={styles.metadataValue}>
                {data.contactName}
                {data.contactEmail && ` (${data.contactEmail})`}
              </Text>
            </View>
          )}
          {data.needType && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Type de besoin</Text>
              <Text style={styles.metadataValue}>
                {needTypeLabels[data.needType] ?? data.needType}
              </Text>
            </View>
          )}
          {data.urgencyLevel && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Niveau d&apos;urgence</Text>
              <Text style={styles.metadataValue}>
                {urgencyLabels[data.urgencyLevel] ?? data.urgencyLevel}
              </Text>
            </View>
          )}
          {data.budgetRange && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Budget estimé</Text>
              <Text style={styles.metadataValue}>{data.budgetRange}</Text>
            </View>
          )}
          {data.desiredDeliveryDate && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Date souhaitée</Text>
              <Text style={styles.metadataValue}>
                {new Date(data.desiredDeliveryDate).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Sections */}
      {sortedSections.map((section, index) => (
        <View key={section.id} id={`section-${section.id}`} style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            {index + 1}. {section.title}
          </Text>
          {section.content ? (
            <ContentRenderer content={section.content} />
          ) : (
            <Text style={styles.emptySection}>
              Cette section n&apos;a pas été renseignée.
            </Text>
          )}
        </View>
      ))}

      {/* Annexes */}
      {data.annexes && data.annexes.length > 0 && (
        <View id="section-annexes" style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            {sortedSections.length + 1}. Annexes
          </Text>
          <View style={styles.annexesList}>
            {data.annexes.map((annexe, index) => (
              <View key={index} style={styles.annexeItem}>
                <Text style={styles.annexeNumber}>{index + 1}</Text>
                <Text style={styles.annexeName}>{annexe.originalName}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Fixed Footer */}
      <PageFooter generatedDate={data.generatedDate} />
    </Page>
  );
}

/**
 * Main PDF Document component
 */
export function DemandPdfDocument({ data }: { data: DemandPdfData }) {
  return (
    <Document>
      {/* Cover Page */}
      <CoverPage data={data} />
      {/* Table of Contents */}
      <TableOfContentsPage data={data} />
      {/* Content Pages */}
      <ContentPage data={data} />
    </Document>
  );
}
