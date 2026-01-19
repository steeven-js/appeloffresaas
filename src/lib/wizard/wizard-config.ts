/**
 * Wizard Configuration - Module and question definitions
 */

import type { WizardConfig, WizardModule } from "./wizard-types";

/**
 * Module 1: Informations Générales
 */
const infoModule: WizardModule = {
  id: "info",
  title: "Informations Générales",
  description: "Identifiez votre demande et le contexte organisationnel",
  icon: "FileText",
  order: 1,
  questions: [
    {
      id: "title",
      type: "text",
      label: "Quel est le titre de votre demande ?",
      placeholder: "Ex: Acquisition de matériel informatique pour le service comptabilité",
      hint: "Soyez précis et descriptif",
      required: true,
      minLength: 10,
      maxLength: 200,
    },
    {
      id: "department",
      type: "select_or_text",
      label: "Quel service fait cette demande ?",
      options: [
        "Direction Générale",
        "Direction Informatique",
        "Direction des Systèmes d'Information",
        "Service Comptabilité",
        "Service Finances",
        "Ressources Humaines",
        "Service Juridique",
        "Service Communication",
        "Service Technique",
        "Direction des Marchés Publics",
      ],
      placeholder: "Sélectionnez ou saisissez le nom du service",
      required: true,
    },
    {
      id: "contact_name",
      type: "text",
      label: "Qui est le contact principal pour cette demande ?",
      placeholder: "Prénom Nom",
      required: true,
    },
    {
      id: "contact_email",
      type: "text",
      label: "Quelle est l'adresse email du contact ?",
      placeholder: "prenom.nom@organisation.fr",
      required: false,
    },
    {
      id: "need_type",
      type: "radio",
      label: "Quel type de besoin s'agit-il ?",
      required: true,
      options: [
        { value: "fourniture", label: "Fourniture / Équipement", description: "Achat de matériel, mobilier, consommables..." },
        { value: "service", label: "Prestation de service", description: "Conseil, audit, accompagnement, mission..." },
        { value: "formation", label: "Formation", description: "Formation professionnelle, sensibilisation..." },
        { value: "logiciel", label: "Logiciel / Licence", description: "Acquisition de licences, abonnements SaaS..." },
        { value: "travaux", label: "Travaux", description: "Construction, rénovation, aménagement..." },
        { value: "maintenance", label: "Maintenance / Support", description: "Contrat de maintenance, support technique..." },
        { value: "autre", label: "Autre", description: "Autre type de besoin" },
      ],
    },
    {
      id: "urgency",
      type: "radio",
      label: "Quel est le niveau d'urgence ?",
      required: true,
      options: [
        { value: "low", label: "Faible", description: "Peut attendre plusieurs mois, pas de deadline" },
        { value: "medium", label: "Moyen", description: "Souhaité dans les 2-3 prochains mois" },
        { value: "high", label: "Urgent", description: "Nécessaire dans le mois à venir" },
        { value: "critical", label: "Critique", description: "Blocage actuel, besoin immédiat" },
      ],
    },
  ],
};

/**
 * Module 2: Contexte & Justification
 */
const contextModule: WizardModule = {
  id: "context",
  title: "Contexte & Justification",
  description: "Expliquez la situation actuelle et pourquoi ce besoin existe",
  icon: "BookOpen",
  order: 2,
  questions: [
    {
      id: "current_situation",
      type: "textarea",
      label: "Quelle est la situation actuelle ?",
      placeholder: "Décrivez l'existant : équipements, processus, équipe concernée...",
      hint: "Exemple : Le service dispose actuellement de 8 postes informatiques acquis en 2018...",
      required: true,
      rows: 4,
      showAIByDefault: true,
    },
    {
      id: "problems",
      type: "textarea",
      label: "Quels problèmes rencontrez-vous ?",
      placeholder: "Décrivez les problèmes, dysfonctionnements ou difficultés rencontrés...",
      hint: "Exemples : lenteurs, pannes, incompatibilités, risques de sécurité, coûts élevés...",
      required: true,
      rows: 4,
      showAIByDefault: true,
    },
    {
      id: "problem_details",
      type: "textarea",
      label: "Pouvez-vous préciser l'impact de ces problèmes ?",
      placeholder: "Impact sur le travail quotidien, les coûts, la qualité du service...",
      hint: "Soyez concret : fréquence des incidents, temps perdu, risques encourus...",
      required: false,
      rows: 3,
      showAIByDefault: true,
    },
    {
      id: "why_now",
      type: "checkbox",
      label: "Pourquoi agir maintenant ?",
      required: true,
      minSelect: 1,
      allowOther: true,
      showAIByDefault: true,
      options: [
        { value: "regulatory_deadline", label: "Échéance réglementaire à respecter" },
        { value: "end_of_support", label: "Fin de support / garantie" },
        { value: "new_project", label: "Nouveau projet nécessitant cette ressource" },
        { value: "recent_incident", label: "Incident récent ayant mis en lumière le besoin" },
        { value: "budget_available", label: "Budget disponible cette année" },
        { value: "strategic_alignment", label: "Alignement avec la stratégie de l'organisation" },
        { value: "user_request", label: "Demande des utilisateurs / agents" },
      ],
    },
    {
      id: "why_now_details",
      type: "textarea",
      label: "Précisez les échéances ou événements déclencheurs",
      placeholder: "Date limite, événement prévu, conséquences si non réalisé...",
      required: false,
      rows: 2,
      showAIByDefault: true,
    },
  ],
  assemblePrompt: `Tu es un rédacteur expert en dossiers de marchés publics français.
Rédige un paragraphe de CONTEXTE ET JUSTIFICATION professionnel et structuré.

INFORMATIONS FOURNIES:
- Situation actuelle: {current_situation}
- Problèmes rencontrés: {problems}
- Détails des impacts: {problem_details}
- Raisons d'agir maintenant: {why_now}
- Précisions sur l'urgence: {why_now_details}

CONSIGNES:
- Style formel et professionnel, adapté aux marchés publics
- Justifier factuellement le besoin
- Mettre en avant l'urgence si mentionnée
- Structure: situation → problèmes → impacts → justification temporelle
- Longueur: 150-250 mots
- Texte fluide sans bullet points`,
};

/**
 * Module 3: Description du Besoin
 */
const descriptionModule: WizardModule = {
  id: "description",
  title: "Description du Besoin",
  description: "Détaillez précisément ce dont vous avez besoin",
  icon: "ClipboardList",
  order: 3,
  questions: [
    {
      id: "objectives",
      type: "textarea",
      label: "Quels sont les objectifs principaux ?",
      placeholder: "Qu'attendez-vous concrètement de cette acquisition/prestation ?",
      hint: "Listez 2-4 objectifs clairs et mesurables si possible",
      required: true,
      rows: 4,
      showAIByDefault: true,
    },
    {
      id: "scope",
      type: "textarea",
      label: "Quel est le périmètre concerné ?",
      placeholder: "Nombre d'utilisateurs, de postes, de sites, surface concernée...",
      required: true,
      rows: 3,
      showAIByDefault: true,
    },
  ],
  conditionalQuestions: [
    // FOURNITURE
    {
      condition: { questionId: "need_type", operator: "equals", value: "fourniture" },
      questions: [
        {
          id: "quantity",
          type: "number",
          label: "Quelle quantité est nécessaire ?",
          unit: "unités",
          min: 1,
          required: true,
        },
        {
          id: "technical_specs",
          type: "textarea",
          label: "Quelles sont les caractéristiques techniques requises ?",
          placeholder: "Spécifications minimales, performances attendues, compatibilités...",
          hint: "Exemple pour un PC: processeur i5 min, 16Go RAM, SSD 512Go...",
          required: true,
          rows: 5,
          showAIByDefault: true,
        },
        {
          id: "compatibility_requirements",
          type: "checkbox",
          label: "Avec quoi doit être compatible le matériel ?",
          allowOther: true,
          showAIByDefault: true,
          options: [
            { value: "existing_software", label: "Logiciels existants (préciser)" },
            { value: "existing_hardware", label: "Matériel existant (préciser)" },
            { value: "network", label: "Infrastructure réseau actuelle" },
            { value: "security_standards", label: "Normes de sécurité internes" },
          ],
        },
        {
          id: "warranty_requirements",
          type: "radio",
          label: "Quelle garantie souhaitez-vous ?",
          options: [
            { value: "1year", label: "1 an (standard)" },
            { value: "2years", label: "2 ans" },
            { value: "3years", label: "3 ans" },
            { value: "5years", label: "5 ans" },
            { value: "other", label: "Autre (préciser)" },
          ],
        },
      ],
    },
    // SERVICE
    {
      condition: { questionId: "need_type", operator: "equals", value: "service" },
      questions: [
        {
          id: "mission_description",
          type: "textarea",
          label: "Décrivez la mission attendue",
          placeholder: "Nature de la prestation, périmètre d'intervention...",
          required: true,
          rows: 5,
          showAIByDefault: true,
        },
        {
          id: "deliverables",
          type: "textarea",
          label: "Quels livrables attendez-vous ?",
          placeholder: "Documents, rapports, recommandations, formations...",
          hint: "Listez les livrables concrets attendus à la fin de la mission",
          required: true,
          rows: 4,
          showAIByDefault: true,
        },
        {
          id: "duration",
          type: "text",
          label: "Quelle est la durée estimée de la mission ?",
          placeholder: "Ex: 3 mois, 20 jours, 6 mois renouvelables...",
          required: true,
        },
        {
          id: "profile_required",
          type: "textarea",
          label: "Quel profil d'intervenant recherchez-vous ?",
          placeholder: "Expérience requise, certifications, compétences...",
          rows: 3,
          showAIByDefault: true,
        },
        {
          id: "work_location",
          type: "radio",
          label: "Où se déroulera la prestation ?",
          options: [
            { value: "onsite", label: "Sur site (dans vos locaux)" },
            { value: "remote", label: "À distance" },
            { value: "hybrid", label: "Mixte (sur site et à distance)" },
            { value: "provider", label: "Chez le prestataire" },
          ],
        },
      ],
    },
    // FORMATION
    {
      condition: { questionId: "need_type", operator: "equals", value: "formation" },
      questions: [
        {
          id: "training_objectives",
          type: "textarea",
          label: "Quels sont les objectifs pédagogiques ?",
          placeholder: "À l'issue de la formation, les participants seront capables de...",
          required: true,
          rows: 4,
          showAIByDefault: true,
        },
        {
          id: "target_audience",
          type: "textarea",
          label: "Qui sont les participants ?",
          placeholder: "Profils, niveau actuel, nombre de personnes...",
          required: true,
          rows: 3,
          showAIByDefault: true,
        },
        {
          id: "participant_count",
          type: "number",
          label: "Combien de personnes à former ?",
          unit: "personnes",
          min: 1,
          required: true,
        },
        {
          id: "training_format",
          type: "radio",
          label: "Quel format de formation ?",
          options: [
            { value: "in_person", label: "Présentiel" },
            { value: "remote", label: "Distanciel (visio)" },
            { value: "elearning", label: "E-learning (autonome)" },
            { value: "hybrid", label: "Mixte (présentiel + distanciel)" },
            { value: "blended", label: "Blended (e-learning + sessions live)" },
          ],
        },
        {
          id: "training_duration",
          type: "text",
          label: "Quelle durée de formation ?",
          placeholder: "Ex: 2 jours, 14 heures, 3 sessions de 2h...",
          required: true,
        },
        {
          id: "certification",
          type: "radio",
          label: "Une certification est-elle souhaitée ?",
          options: [
            { value: "yes_mandatory", label: "Oui, obligatoire" },
            { value: "yes_optional", label: "Oui, si possible" },
            { value: "no", label: "Non, pas nécessaire" },
          ],
        },
      ],
    },
    // LOGICIEL
    {
      condition: { questionId: "need_type", operator: "equals", value: "logiciel" },
      questions: [
        {
          id: "software_type",
          type: "radio",
          label: "Quel type de solution recherchez-vous ?",
          options: [
            { value: "saas", label: "SaaS (abonnement cloud)" },
            { value: "license", label: "Licence perpétuelle (on-premise)" },
            { value: "open_source", label: "Open source (avec support)" },
            { value: "custom", label: "Développement sur mesure" },
          ],
        },
        {
          id: "user_count",
          type: "number",
          label: "Combien d'utilisateurs ?",
          unit: "utilisateurs",
          min: 1,
          required: true,
        },
        {
          id: "features_required",
          type: "textarea",
          label: "Quelles fonctionnalités sont indispensables ?",
          placeholder: "Listez les fonctionnalités obligatoires...",
          required: true,
          rows: 5,
          showAIByDefault: true,
        },
        {
          id: "features_optional",
          type: "textarea",
          label: "Quelles fonctionnalités seraient un plus ?",
          placeholder: "Fonctionnalités souhaitées mais non bloquantes...",
          rows: 3,
          showAIByDefault: true,
        },
        {
          id: "integrations",
          type: "textarea",
          label: "Avec quels systèmes doit-il s'intégrer ?",
          placeholder: "ERP, CRM, messagerie, annuaire LDAP, SSO...",
          rows: 3,
          showAIByDefault: true,
        },
        {
          id: "hosting_preference",
          type: "radio",
          label: "Quelle préférence d'hébergement ?",
          options: [
            { value: "cloud_public", label: "Cloud public (AWS, Azure, GCP)" },
            { value: "cloud_sovereign", label: "Cloud souverain (SecNumCloud, HDS)" },
            { value: "on_premise", label: "On-premise (vos serveurs)" },
            { value: "no_preference", label: "Pas de préférence" },
          ],
        },
      ],
    },
  ],
  assemblePrompt: `Tu es un rédacteur expert en dossiers de marchés publics français.
Rédige une DESCRIPTION DU BESOIN professionnelle et structurée.

TYPE DE BESOIN: {need_type}

INFORMATIONS FOURNIES:
- Objectifs: {objectives}
- Périmètre: {scope}
{conditional_answers}

CONSIGNES:
- Style formel et professionnel
- Structure claire avec sous-sections si nécessaire
- Spécifications précises et mesurables
- Longueur: 200-400 mots selon la complexité
- Adapter le vocabulaire au type de besoin`,
};

/**
 * Module 4: Contraintes
 */
const constraintsModule: WizardModule = {
  id: "constraints",
  title: "Contraintes",
  description: "Identifiez les contraintes techniques, réglementaires et organisationnelles",
  icon: "AlertTriangle",
  order: 4,
  questions: [
    {
      id: "technical_constraints",
      type: "checkbox",
      label: "Quelles contraintes techniques s'appliquent ?",
      allowOther: true,
      showAIByDefault: true,
      options: [
        { value: "compatibility", label: "Compatibilité avec l'existant" },
        { value: "performance", label: "Exigences de performance minimales" },
        { value: "scalability", label: "Capacité d'évolution / scalabilité" },
        { value: "availability", label: "Haute disponibilité requise" },
        { value: "backup", label: "Sauvegarde / PRA obligatoire" },
        { value: "network", label: "Contraintes réseau spécifiques" },
      ],
    },
    {
      id: "regulatory_constraints",
      type: "checkbox",
      label: "Quelles contraintes réglementaires s'appliquent ?",
      allowOther: true,
      showAIByDefault: true,
      options: [
        { value: "rgpd", label: "RGPD (données personnelles)" },
        { value: "hds", label: "HDS (hébergement données santé)" },
        { value: "rgaa", label: "RGAA (accessibilité)" },
        { value: "rgs", label: "RGS (sécurité)" },
        { value: "iso27001", label: "ISO 27001" },
        { value: "secnumcloud", label: "SecNumCloud" },
        { value: "gdpr_outside_eu", label: "Pas de transfert hors UE" },
      ],
    },
    {
      id: "organizational_constraints",
      type: "checkbox",
      label: "Quelles contraintes organisationnelles ?",
      allowOther: true,
      showAIByDefault: true,
      options: [
        { value: "working_hours", label: "Intervention uniquement en heures ouvrées" },
        { value: "off_hours", label: "Intervention hors heures ouvrées" },
        { value: "vacation_period", label: "Période à éviter (vacances, etc.)" },
        { value: "training_required", label: "Formation des utilisateurs obligatoire" },
        { value: "documentation", label: "Documentation en français obligatoire" },
        { value: "support_french", label: "Support en français obligatoire" },
        { value: "site_access", label: "Accès au site restreint (badges, etc.)" },
      ],
    },
    {
      id: "other_constraints",
      type: "textarea",
      label: "Autres contraintes à mentionner ?",
      placeholder: "Contraintes budgétaires spécifiques, délais impératifs, etc.",
      rows: 3,
      showAIByDefault: true,
    },
  ],
  assemblePrompt: `Tu es un rédacteur expert en dossiers de marchés publics français.
Rédige une section CONTRAINTES claire et exhaustive.

INFORMATIONS FOURNIES:
- Contraintes techniques: {technical_constraints}
- Contraintes réglementaires: {regulatory_constraints}
- Contraintes organisationnelles: {organizational_constraints}
- Autres contraintes: {other_constraints}

CONSIGNES:
- Organiser par catégorie (techniques, réglementaires, organisationnelles)
- Formuler de manière précise et sans ambiguïté
- Utiliser des listes à puces pour la clarté
- Longueur: 100-200 mots`,
};

/**
 * Module 5: Budget & Délais
 */
const budgetModule: WizardModule = {
  id: "budget",
  title: "Budget & Délais",
  description: "Définissez l'enveloppe budgétaire et le calendrier souhaité",
  icon: "Banknote",
  order: 5,
  questions: [
    {
      id: "budget_range",
      type: "radio",
      label: "Quelle est l'enveloppe budgétaire envisagée ?",
      required: true,
      options: [
        { value: "under_5k", label: "Moins de 5 000 €" },
        { value: "5k_15k", label: "5 000 € - 15 000 €" },
        { value: "15k_40k", label: "15 000 € - 40 000 €" },
        { value: "40k_90k", label: "40 000 € - 90 000 €" },
        { value: "90k_150k", label: "90 000 € - 150 000 €" },
        { value: "150k_plus", label: "Plus de 150 000 €" },
        { value: "to_define", label: "À définir / Demande de devis" },
      ],
    },
    {
      id: "budget_precise",
      type: "number",
      label: "Si connu, quel est le montant estimé ?",
      unit: "EUR",
      min: 0,
      required: false,
      suggestions: [10000, 25000, 50000, 100000],
    },
    {
      id: "budget_validated",
      type: "radio",
      label: "Le budget est-il validé ?",
      required: true,
      options: [
        { value: "yes", label: "Oui, budget validé et disponible" },
        { value: "pending", label: "En cours de validation" },
        { value: "estimate", label: "Estimation, à confirmer" },
        { value: "no", label: "Non, budget non défini" },
      ],
    },
    {
      id: "delivery_date",
      type: "date",
      label: "Quelle est la date de livraison souhaitée ?",
      required: true,
      minDate: "today",
    },
    {
      id: "date_flexibility",
      type: "radio",
      label: "Cette date est-elle impérative ?",
      options: [
        { value: "strict", label: "Oui, date impérative (deadline réglementaire, etc.)" },
        { value: "preferred", label: "Préférée mais négociable" },
        { value: "flexible", label: "Flexible, pas de contrainte forte" },
      ],
    },
    {
      id: "date_justification",
      type: "textarea",
      label: "Justification du délai (si date impérative)",
      placeholder: "Pourquoi cette date ? Échéance réglementaire, projet dépendant...",
      rows: 2,
      showAIByDefault: true,
    },
  ],
  assemblePrompt: `Tu es un rédacteur expert en dossiers de marchés publics français.
Rédige une section BUDGET ET DÉLAIS claire.

INFORMATIONS FOURNIES:
- Fourchette budgétaire: {budget_range}
- Montant estimé: {budget_precise}
- Budget validé: {budget_validated}
- Date de livraison: {delivery_date}
- Flexibilité: {date_flexibility}
- Justification: {date_justification}

CONSIGNES:
- Présenter le budget de manière claire
- Indiquer le statut de validation
- Justifier le calendrier si contraint
- Longueur: 50-100 mots`,
};

/**
 * Complete wizard configuration
 */
export const wizardConfig: WizardConfig = {
  version: "1.0.0",
  modules: [
    infoModule,
    contextModule,
    descriptionModule,
    constraintsModule,
    budgetModule,
  ],
};

/**
 * Get wizard configuration, optionally filtered by need type
 */
export function getWizardConfig(_needType?: string): WizardConfig {
  // For now, return the full config
  // In the future, we can filter conditional questions based on _needType
  return wizardConfig;
}

/**
 * Get a specific module by ID
 */
export function getModuleById(moduleId: string): WizardModule | undefined {
  return wizardConfig.modules.find((m) => m.id === moduleId);
}

/**
 * Get all questions for a module, including conditional ones based on answers
 */
export function getModuleQuestions(
  moduleId: string,
  answers: Record<string, unknown> = {}
): WizardModule["questions"] {
  const wizardModule = getModuleById(moduleId);
  if (!wizardModule) return [];

  const questions = [...wizardModule.questions];

  // Add conditional questions if conditions are met
  if (wizardModule.conditionalQuestions) {
    for (const conditional of wizardModule.conditionalQuestions) {
      const { condition, questions: conditionalQs } = conditional;
      const answerValue = answers[condition.questionId];

      let conditionMet = false;
      switch (condition.operator) {
        case "equals":
          conditionMet = answerValue === condition.value;
          break;
        case "contains":
          if (Array.isArray(answerValue) && typeof condition.value === "string") {
            conditionMet = answerValue.includes(condition.value);
          }
          break;
        case "not_equals":
          conditionMet = answerValue !== condition.value;
          break;
      }

      if (conditionMet) {
        questions.push(...conditionalQs);
      }
    }
  }

  return questions;
}

/**
 * Get the total number of questions for a module based on current answers
 */
export function getModuleQuestionCount(
  moduleId: string,
  answers: Record<string, unknown> = {}
): number {
  return getModuleQuestions(moduleId, answers).length;
}
