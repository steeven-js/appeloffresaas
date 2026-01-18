/**
 * Seed script for company profile fake data
 * Run with: node --env-file=.env.local --import tsx scripts/seed-company-profile.ts
 */
import { db } from "~/server/db";
import { users } from "~/server/db/schema/auth";
import {
  companyProfiles,
  companyFinancialData,
  companyCertifications,
  companyTeamMembers,
  companyProjectReferences,
} from "~/server/db/schema/company";
import { eq } from "drizzle-orm";

async function seedCompanyProfile() {
  console.log("🌱 Starting company profile seed...\n");

  // 1. Find the first user (Super Admin)
  const [user] = await db.select().from(users).limit(1);

  if (!user) {
    console.error("❌ No user found in the database. Please create a user first.");
    process.exit(1);
  }

  console.log(`✓ Found user: ${user.name ?? user.email} (${user.id})`);

  // 2. Check if company profile already exists
  const existingProfile = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, user.id),
  });

  let profileId: string;

  if (existingProfile) {
    console.log(`✓ Company profile already exists, updating...`);
    profileId = existingProfile.id;

    // Update existing profile
    await db
      .update(companyProfiles)
      .set({
        name: "TechSolutions France SAS",
        siret: "84726195300042",
        legalForm: "SAS",
        capitalSocial: 150000,
        nafCode: "6201Z",
        creationDate: "2018-03-15",
        rcsCity: "Paris",
        address: "42 Avenue des Champs-Élysées",
        city: "Paris",
        postalCode: "75008",
        country: "France",
        phone: "+33 1 42 65 78 90",
        email: "contact@techsolutions-france.fr",
        website: "https://www.techsolutions-france.fr",
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.id, profileId));
  } else {
    // Create new profile
    const [newProfile] = await db
      .insert(companyProfiles)
      .values({
        userId: user.id,
        name: "TechSolutions France SAS",
        siret: "84726195300042",
        legalForm: "SAS",
        capitalSocial: 150000,
        nafCode: "6201Z",
        creationDate: "2018-03-15",
        rcsCity: "Paris",
        address: "42 Avenue des Champs-Élysées",
        city: "Paris",
        postalCode: "75008",
        country: "France",
        phone: "+33 1 42 65 78 90",
        email: "contact@techsolutions-france.fr",
        website: "https://www.techsolutions-france.fr",
      })
      .returning();

    profileId = newProfile!.id;
    console.log(`✓ Created company profile: TechSolutions France SAS`);
  }

  // 3. Clean existing related data
  await db.delete(companyFinancialData).where(eq(companyFinancialData.companyProfileId, profileId));
  await db.delete(companyCertifications).where(eq(companyCertifications.companyProfileId, profileId));
  await db.delete(companyTeamMembers).where(eq(companyTeamMembers.companyProfileId, profileId));
  await db.delete(companyProjectReferences).where(eq(companyProjectReferences.companyProfileId, profileId));
  console.log(`✓ Cleaned existing related data`);

  // 4. Add financial data (3 years)
  const financialYears = [
    { year: 2023, revenue: 2850000, netIncome: 285000, employeeCount: 18 },
    { year: 2024, revenue: 3420000, netIncome: 376200, employeeCount: 22 },
    { year: 2025, revenue: 4100000, netIncome: 492000, employeeCount: 28 },
  ];

  for (const data of financialYears) {
    await db.insert(companyFinancialData).values({
      companyProfileId: profileId,
      ...data,
    });
  }
  console.log(`✓ Added financial data for ${financialYears.length} years`);

  // 5. Add certifications
  const certifications = [
    {
      name: "ISO 9001:2015",
      issuer: "AFNOR Certification",
      certificationNumber: "FR-2022-09001-8472",
      obtainedDate: "2022-06-15",
      expiryDate: "2025-06-14",
      description: "Système de management de la qualité pour les services informatiques et le développement logiciel",
    },
    {
      name: "ISO 27001:2022",
      issuer: "Bureau Veritas Certification",
      certificationNumber: "FR-SEC-2023-27001-156",
      obtainedDate: "2023-02-20",
      expiryDate: "2026-02-19",
      description: "Système de management de la sécurité de l'information - Protection des données clients",
    },
    {
      name: "Qualiopi",
      issuer: "AFNOR Certification",
      certificationNumber: "QUA-2024-OF-3847",
      obtainedDate: "2024-01-10",
      expiryDate: "2027-01-09",
      description: "Certification qualité des prestataires d'actions de formation",
    },
    {
      name: "Label Numérique Responsable",
      issuer: "Institut du Numérique Responsable",
      certificationNumber: "NR-2024-1842",
      obtainedDate: "2024-03-22",
      expiryDate: "2026-03-21",
      description: "Engagement pour un numérique plus sobre et plus éthique",
    },
  ];

  for (const cert of certifications) {
    await db.insert(companyCertifications).values({
      companyProfileId: profileId,
      ...cert,
    });
  }
  console.log(`✓ Added ${certifications.length} certifications`);

  // 6. Add team members
  const teamMembers = [
    {
      firstName: "Marie",
      lastName: "Dupont",
      email: "m.dupont@techsolutions-france.fr",
      phone: "+33 6 12 34 56 78",
      role: "Directrice Générale",
      department: "Direction",
      yearsOfExperience: 18,
      skills: JSON.stringify(["Management", "Stratégie", "Développement commercial", "Gestion de projet"]),
      education: "HEC Paris - MBA, EPITA - Ingénieur Informatique",
      personalCertifications: JSON.stringify(["PMP", "ITIL v4 Foundation"]),
      bio: "Marie a fondé TechSolutions France en 2018 après 12 ans d'expérience chez Capgemini et Sopra Steria. Elle pilote la stratégie de croissance et les partenariats clés.",
      isKeyPerson: 1,
    },
    {
      firstName: "Thomas",
      lastName: "Martin",
      email: "t.martin@techsolutions-france.fr",
      phone: "+33 6 23 45 67 89",
      role: "Directeur Technique (CTO)",
      department: "Technique",
      yearsOfExperience: 15,
      skills: JSON.stringify(["Architecture logicielle", "Cloud AWS/Azure", "DevOps", "Python", "TypeScript", "Kubernetes"]),
      education: "Centrale Paris - Ingénieur généraliste, spécialisation informatique",
      personalCertifications: JSON.stringify(["AWS Solutions Architect Professional", "Kubernetes Administrator (CKA)", "Azure DevOps Expert"]),
      bio: "Thomas supervise l'ensemble des développements techniques et l'architecture des solutions. Expert reconnu en architecture cloud et microservices.",
      isKeyPerson: 1,
    },
    {
      firstName: "Sophie",
      lastName: "Bernard",
      email: "s.bernard@techsolutions-france.fr",
      phone: "+33 6 34 56 78 90",
      role: "Responsable Projets Secteur Public",
      department: "Projets",
      yearsOfExperience: 10,
      skills: JSON.stringify(["Gestion de projet", "Marchés publics", "RGPD", "Méthodologie Agile", "SAFe"]),
      education: "Sciences Po Paris, Master Management Public",
      personalCertifications: JSON.stringify(["Scrum Master Professional", "PRINCE2 Practitioner", "Certification RGPD DPO"]),
      bio: "Sophie dirige les projets du secteur public depuis 5 ans. Elle maîtrise parfaitement les processus des marchés publics et la réglementation RGPD.",
      isKeyPerson: 1,
    },
    {
      firstName: "Pierre",
      lastName: "Leroy",
      email: "p.leroy@techsolutions-france.fr",
      phone: "+33 6 45 67 89 01",
      role: "Lead Developer Full Stack",
      department: "Développement",
      yearsOfExperience: 8,
      skills: JSON.stringify(["React", "Next.js", "Node.js", "PostgreSQL", "GraphQL", "Docker"]),
      education: "EPITECH Paris - Expert en Technologies de l'Information",
      personalCertifications: JSON.stringify(["Meta React Developer", "MongoDB Developer Associate"]),
      bio: "Pierre anime l'équipe de développement front-end et back-end. Spécialiste des applications web modernes et des architectures JAMstack.",
      isKeyPerson: 0,
    },
    {
      firstName: "Camille",
      lastName: "Petit",
      email: "c.petit@techsolutions-france.fr",
      phone: "+33 6 56 78 90 12",
      role: "UX/UI Designer Senior",
      department: "Design",
      yearsOfExperience: 7,
      skills: JSON.stringify(["Figma", "Design System", "Recherche utilisateur", "Accessibilité RGAA", "Prototypage"]),
      education: "Gobelins - Directeur Artistique Digital",
      personalCertifications: JSON.stringify(["Google UX Design Professional", "Certification Accessibilité Numérique"]),
      bio: "Camille conçoit des interfaces accessibles et ergonomiques. Elle a mené la refonte UX de plusieurs portails publics majeurs.",
      isKeyPerson: 0,
    },
  ];

  for (const member of teamMembers) {
    await db.insert(companyTeamMembers).values({
      companyProfileId: profileId,
      ...member,
    });
  }
  console.log(`✓ Added ${teamMembers.length} team members`);

  // 7. Add project references
  const projectReferences = [
    {
      projectName: "Portail Citoyen - Ville de Lyon",
      clientName: "Métropole de Lyon",
      clientType: "public",
      sector: "Administration publique",
      description: "Conception et développement d'un portail citoyen permettant aux habitants d'accéder à l'ensemble des services municipaux en ligne : état civil, urbanisme, inscriptions scolaires, signalements. Intégration avec le SI existant et mise en conformité RGPD.",
      amount: 450000,
      startDate: "2023-03-01",
      endDate: "2024-02-28",
      location: "Lyon (69)",
      contactName: "Jean-Marc Dubois",
      contactEmail: "jm.dubois@grandlyon.com",
      contactPhone: "+33 4 72 10 30 40",
      isHighlight: 1,
      tags: JSON.stringify(["e-administration", "portail citoyen", "RGPD", "intégration SI"]),
    },
    {
      projectName: "Application de Gestion des Marchés Publics",
      clientName: "Conseil Départemental de l'Isère",
      clientType: "public",
      sector: "Administration publique",
      description: "Développement d'une application interne de gestion des marchés publics : de la publication des avis à l'attribution, en passant par l'analyse des offres. Dématérialisation complète du processus et tableaux de bord décisionnels.",
      amount: 320000,
      startDate: "2022-09-01",
      endDate: "2023-06-30",
      location: "Grenoble (38)",
      contactName: "Catherine Moreau",
      contactEmail: "c.moreau@isere.fr",
      contactPhone: "+33 4 76 00 38 38",
      isHighlight: 1,
      tags: JSON.stringify(["marchés publics", "dématérialisation", "workflow", "tableaux de bord"]),
    },
    {
      projectName: "Plateforme E-learning Santé",
      clientName: "CHU de Bordeaux",
      clientType: "public",
      sector: "Santé",
      description: "Création d'une plateforme de formation en ligne pour le personnel soignant. Modules interactifs, suivi des compétences, certification automatique. Hébergement HDS (Hébergeur de Données de Santé).",
      amount: 280000,
      startDate: "2024-01-15",
      endDate: "2024-11-30",
      location: "Bordeaux (33)",
      contactName: "Dr. François Lambert",
      contactEmail: "f.lambert@chu-bordeaux.fr",
      contactPhone: "+33 5 56 79 56 79",
      isHighlight: 1,
      tags: JSON.stringify(["e-learning", "santé", "HDS", "formation professionnelle"]),
    },
    {
      projectName: "Modernisation SI - Cabinet d'Avocats",
      clientName: "Cabinet Lefebvre & Associés",
      clientType: "private",
      sector: "Services juridiques",
      description: "Refonte complète du système d'information : migration cloud Azure, mise en place d'un CRM juridique, portail client sécurisé, gestion électronique des documents avec recherche intelligente.",
      amount: 180000,
      startDate: "2024-06-01",
      endDate: "2025-01-31",
      location: "Paris (75)",
      contactName: "Me Anne Lefebvre",
      contactEmail: "a.lefebvre@lefebvre-avocats.fr",
      contactPhone: "+33 1 45 67 89 00",
      isHighlight: 0,
      tags: JSON.stringify(["cloud Azure", "CRM", "GED", "secteur juridique"]),
    },
    {
      projectName: "API Open Data Transports",
      clientName: "Région Nouvelle-Aquitaine",
      clientType: "public",
      sector: "Transports",
      description: "Développement d'une API REST Open Data exposant les données de transport régional en temps réel. Intégration des données GTFS, SIRI, et des perturbations. Documentation Swagger et portail développeur.",
      amount: 195000,
      startDate: "2023-09-01",
      endDate: "2024-04-30",
      location: "Bordeaux (33)",
      contactName: "Marc Tisserand",
      contactEmail: "m.tisserand@nouvelle-aquitaine.fr",
      contactPhone: "+33 5 57 57 80 00",
      isHighlight: 0,
      tags: JSON.stringify(["API REST", "Open Data", "transports", "GTFS", "temps réel"]),
    },
  ];

  for (const ref of projectReferences) {
    await db.insert(companyProjectReferences).values({
      companyProfileId: profileId,
      ...ref,
    });
  }
  console.log(`✓ Added ${projectReferences.length} project references`);

  console.log("\n✅ Company profile seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Company: TechSolutions France SAS`);
  console.log(`   - SIRET: 84726195300042`);
  console.log(`   - Financial data: ${financialYears.length} years (2023-2025)`);
  console.log(`   - Certifications: ${certifications.length}`);
  console.log(`   - Team members: ${teamMembers.length}`);
  console.log(`   - Project references: ${projectReferences.length}`);

  process.exit(0);
}

seedCompanyProfile().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
