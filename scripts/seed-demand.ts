/**
 * Seed script for demand project fake data
 * Run with: node --env-file=.env --env-file=.env.local --import tsx scripts/seed-demand.ts
 */
import { db } from "~/server/db";
import { users } from "~/server/db/schema/auth";
import { demandProjects, type DemandSection, type SuggestedCriteria } from "~/server/db/schema/demands";

async function seedDemand() {
  console.log("🌱 Starting demand project seed...\n");

  // 1. Find the first user (Super Admin)
  const [user] = await db.select().from(users).limit(1);

  if (!user) {
    console.error("❌ No user found in the database. Please create a user first.");
    process.exit(1);
  }

  console.log(`✓ Found user: ${user.name ?? user.email} (${user.id})`);

  // 2. Create demand project with comprehensive data
  const sections: DemandSection[] = [
    {
      id: "context",
      title: "Contexte & Justification",
      content: `Dans le cadre de la modernisation de notre système d'information, le Service des Ressources Humaines a identifié un besoin urgent de digitalisation de la gestion des congés et absences.

Actuellement, le processus repose sur des formulaires papier et des échanges d'emails, ce qui engendre :
- Des délais de traitement importants (5 à 10 jours ouvrés)
- Des erreurs de saisie fréquentes
- Une difficulté à suivre les soldes de congés en temps réel
- Une charge administrative excessive pour l'équipe RH (estimation : 2 ETP)

Ce projet s'inscrit dans la stratégie de transformation numérique 2024-2026 validée par la Direction Générale et répond aux objectifs du schéma directeur SI.`,
      isDefault: true,
      isRequired: true,
      order: 1,
    },
    {
      id: "description",
      title: "Description du besoin",
      content: `Le besoin porte sur l'acquisition et le déploiement d'une solution logicielle de gestion des congés et absences pour l'ensemble des collaborateurs de l'organisation (environ 450 agents).

**Fonctionnalités attendues :**

1. **Gestion des demandes de congés**
   - Saisie en ligne des demandes par les agents
   - Workflow de validation paramétrable (N+1, N+2, RH)
   - Notifications automatiques par email
   - Visualisation du planning d'équipe

2. **Suivi des soldes**
   - Calcul automatique des droits acquis
   - Gestion des différents types de congés (CP, RTT, récupération, maladie)
   - Historique des mouvements
   - Alertes sur les soldes négatifs

3. **Reporting et statistiques**
   - Tableaux de bord pour les managers
   - Export des données au format Excel/CSV
   - Indicateurs de suivi RH (taux d'absentéisme, etc.)

4. **Administration**
   - Gestion des utilisateurs et droits d'accès
   - Paramétrage des règles de gestion
   - Interface d'administration intuitive

**Exigences techniques :**
- Solution accessible via navigateur web (responsive)
- Compatibilité SSO avec notre annuaire Active Directory
- API REST pour intégration avec le SIRH existant
- Hébergement cloud sécurisé (données en France, conforme RGPD)`,
      isDefault: true,
      isRequired: true,
      order: 2,
    },
    {
      id: "constraints",
      title: "Contraintes identifiées",
      content: `**Contraintes techniques :**
- Intégration obligatoire avec le SIRH SAP SuccessFactors existant
- Compatibilité avec les navigateurs : Chrome, Firefox, Edge (versions récentes)
- Disponibilité minimale de 99,5% en heures ouvrées
- Temps de réponse < 3 secondes pour les opérations courantes

**Contraintes réglementaires :**
- Conformité RGPD (données hébergées en France ou UE)
- Respect des règles de gestion RH en vigueur (statut fonction publique)
- Traçabilité des opérations pour audit

**Contraintes organisationnelles :**
- Déploiement progressif par direction (4 vagues)
- Formation des utilisateurs clés avant déploiement
- Période de bascule : hors période de congés scolaires
- Support utilisateur en français

**Contraintes temporelles :**
- Mise en production souhaitée avant septembre 2025
- Phase pilote avec le Service RH en juin 2025`,
      isDefault: true,
      isRequired: true,
      order: 3,
    },
    {
      id: "deliverables",
      title: "Livrables attendus",
      content: `1. **Documentation**
   - Spécifications fonctionnelles détaillées
   - Documentation technique d'intégration
   - Manuel utilisateur
   - Manuel administrateur

2. **Logiciel**
   - Solution configurée selon nos besoins
   - Environnement de recette
   - Environnement de production

3. **Services**
   - Installation et paramétrage
   - Migration des données historiques (3 ans)
   - Formation des administrateurs (2 jours)
   - Formation des utilisateurs clés (1 jour)
   - Assistance au démarrage (1 mois)

4. **Maintenance**
   - Contrat de maintenance corrective et évolutive
   - Support utilisateur niveau 2
   - Mises à jour de sécurité`,
      isDefault: false,
      isRequired: false,
      order: 4,
    },
  ];

  const suggestedCriteria: SuggestedCriteria = {
    technicalCriteria: [
      "Conformité aux exigences fonctionnelles (40%)",
      "Qualité de l'intégration avec le SIRH existant (25%)",
      "Performance et disponibilité de la solution (20%)",
      "Sécurité et conformité RGPD (15%)",
    ],
    qualityCriteria: [
      "Qualité de l'accompagnement et de la formation",
      "Références clients dans le secteur public",
      "Ergonomie et facilité d'utilisation",
      "Qualité du support et réactivité",
    ],
    priceCriteria: [
      "Coût total de possession sur 3 ans (TCO)",
      "Transparence de la tarification",
      "Options de paiement (licence vs SaaS)",
    ],
    otherCriteria: [
      "Engagement développement durable",
      "Capacité d'évolution de la solution",
    ],
  };

  const [newDemand] = await db
    .insert(demandProjects)
    .values({
      userId: user.id,
      title: "Solution de Gestion des Congés et Absences",
      reference: "DEM-2025-RH-001",
      description: "Acquisition d'une solution logicielle de gestion dématérialisée des congés et absences pour l'ensemble des collaborateurs de l'organisation.",
      departmentName: "Direction des Ressources Humaines",
      contactName: "Sophie Bernard",
      contactEmail: "s.bernard@techsolutions-france.fr",
      context: sections.find(s => s.id === "context")?.content ?? "",
      constraints: sections.find(s => s.id === "constraints")?.content ?? "",
      urgencyLevel: "medium",
      needType: "logiciel",
      budgetRange: "80 000 - 120 000 EUR",
      budgetValidated: 1,
      desiredDeliveryDate: "2025-09-01",
      urgencyJustification: "Mise en production impérative avant la rentrée de septembre pour bénéficier de la période de congés d'été pour la bascule.",
      suggestedCriteria,
      sections,
      buyerType: "public",
      estimatedAmount: 100000,
      status: "draft",
      notes: "Projet validé en comité de direction le 15/01/2025. Budget pré-réservé sur ligne SI.",
    })
    .returning();

  console.log(`✓ Created demand project: ${newDemand!.title}`);
  console.log(`   - Reference: ${newDemand!.reference}`);
  console.log(`   - Status: ${newDemand!.status}`);
  console.log(`   - Need type: ${newDemand!.needType}`);
  console.log(`   - Budget: ${newDemand!.budgetRange}`);
  console.log(`   - Sections: ${sections.length}`);

  console.log("\n✅ Demand project seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Title: Solution de Gestion des Congés et Absences`);
  console.log(`   - Reference: DEM-2025-RH-001`);
  console.log(`   - Department: Direction des Ressources Humaines`);
  console.log(`   - Budget: 80 000 - 120 000 EUR`);
  console.log(`   - Status: Brouillon (draft)`);
  console.log(`   - Sections: 4 (Contexte, Description, Contraintes, Livrables)`);

  process.exit(0);
}

seedDemand().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
