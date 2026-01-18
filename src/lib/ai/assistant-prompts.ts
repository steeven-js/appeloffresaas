/**
 * AI Assistant Prompts for Wizard
 * Contextual prompts for guiding users through long-form answers
 */

export interface PromptContext {
  // Project data from Module 1
  title: string;
  departmentName?: string;
  needType?: string;
  urgencyLevel?: string;

  // Current module/question
  moduleId: string;
  questionId: string;
  questionLabel: string;

  // Conversation state
  conversationHistory?: { role: "assistant" | "user"; content: string }[];
  currentText?: string;

  // Suggested options for AI context (e.g., checkbox options to help write)
  suggestedOptions?: string[];

  // Previous answers from wizard (for context in guided choices mode)
  previousAnswers?: Record<string, { questionLabel: string; value: string }>;
}

/**
 * Question-specific first questions based on questionId and needType
 * Format: questionId -> needType -> question
 *
 * IMPORTANT: Chaque question de chaque module DOIT avoir son prompt ici
 */
const QUESTION_FIRST_QUESTIONS: Record<string, Record<string, string>> = {
  // ============================================
  // MODULE 2: CONTEXTE & JUSTIFICATION
  // ============================================

  // Question 1: Situation actuelle
  current_situation: {
    default: "Pour décrire votre situation actuelle, commençons : combien de personnes sont concernées par ce besoin ?",
    fourniture: "Pour décrire votre situation actuelle concernant les équipements, combien de postes/unités sont concernés ?",
    service: "Pour décrire votre situation actuelle, quelle est l'activité concernée par ce besoin de prestation ?",
    travaux: "Pour décrire votre situation actuelle, quel est le bâtiment ou l'espace concerné par ces travaux ?",
    logiciel: "Pour décrire votre situation actuelle, combien d'utilisateurs sont concernés par ce besoin logiciel ?",
    maintenance: "Pour décrire votre situation actuelle, quel équipement nécessite cette maintenance ?",
    formation: "Pour décrire votre situation actuelle, quels sont les collaborateurs concernés par cette formation ?",
  },

  // Question 2: Problèmes rencontrés
  problems: {
    default: "Quel est le problème principal que vous rencontrez actuellement ?",
    fourniture: "Quels dysfonctionnements constatez-vous avec vos équipements actuels ?",
    service: "Quelles difficultés rencontrez-vous dans la réalisation de cette activité ?",
    travaux: "Quels problèmes avez-vous identifiés dans le bâtiment ou l'espace concerné ?",
    logiciel: "Quelles limitations rencontrez-vous avec votre solution actuelle ?",
    maintenance: "Quels types de pannes ou problèmes se produisent ?",
    formation: "Quelles lacunes ou difficultés avez-vous identifiées chez vos collaborateurs ?",
  },

  // Question 3: Détails des problèmes
  problem_details: {
    default: "Comment ces problèmes impactent-ils votre travail au quotidien ?",
    fourniture: "À quelle fréquence ces problèmes surviennent-ils et quel impact ont-ils ?",
    service: "Quelles sont les conséquences de ces difficultés sur votre service ?",
    travaux: "Quels sont les impacts de ces problèmes sur les occupants ou l'activité ?",
    logiciel: "Comment ces limitations affectent-elles la productivité de vos équipes ?",
    maintenance: "Quelle est la fréquence de ces pannes et leur impact sur l'activité ?",
    formation: "Comment ces lacunes affectent-elles la qualité du travail ou la productivité ?",
  },

  // Question 4: Pourquoi agir maintenant
  why_now: {
    default: "Pourquoi est-il important d'agir maintenant ? Quelle est la raison principale qui motive cette demande ?",
    fourniture: "Pourquoi avez-vous besoin de ces équipements maintenant ? Y a-t-il une échéance particulière ?",
    service: "Pourquoi cette prestation est-elle nécessaire maintenant ? Quel événement déclenche ce besoin ?",
    travaux: "Pourquoi ces travaux doivent-ils être réalisés maintenant ? Y a-t-il une urgence particulière ?",
    logiciel: "Pourquoi ce logiciel est-il nécessaire maintenant ? Qu'est-ce qui motive ce timing ?",
    maintenance: "Pourquoi cette maintenance est-elle urgente maintenant ? Y a-t-il eu un incident récent ?",
    formation: "Pourquoi cette formation est-elle nécessaire maintenant ? Y a-t-il une échéance ?",
  },

  // Question 5: Précisions sur les échéances/déclencheurs
  why_now_details: {
    default: "Pouvez-vous préciser les échéances ou événements qui motivent cette demande ?",
    fourniture: "Quelle est la date limite pour l'acquisition de ces équipements ? Y a-t-il un événement déclencheur ?",
    service: "Quelle est l'échéance de cette prestation ? Un événement particulier la déclenche-t-il ?",
    travaux: "Quelle est la date limite pour ces travaux ? Un événement ou une saison impose-t-il ce délai ?",
    logiciel: "Quelle est l'échéance pour la mise en place de ce logiciel ? Y a-t-il une fin de contrat ou de support ?",
    maintenance: "Quelle est l'échéance pour ce contrat de maintenance ? Un incident récent motive-t-il cette urgence ?",
    formation: "Quelle est la date limite pour cette formation ? Un audit ou une obligation réglementaire l'impose-t-il ?",
  },

  // ============================================
  // MODULE 3: DESCRIPTION DU BESOIN
  // ============================================

  // Question 1: Objectifs principaux
  objectives: {
    default: "Quel est l'objectif principal de cette demande ?",
    fourniture: "Quel type d'équipement ou de fourniture recherchez-vous ?",
    service: "Quel type de prestation recherchez-vous ?",
    travaux: "Quel type de travaux souhaitez-vous réaliser ?",
    logiciel: "Quel type de solution logicielle recherchez-vous ?",
    maintenance: "Quel type de maintenance est nécessaire ?",
    formation: "Quels sont les objectifs pédagogiques de cette formation ?",
  },

  // Question 2: Périmètre concerné
  scope: {
    default: "Quel est le périmètre concerné par cette demande ? Combien de personnes ou d'unités sont concernées ?",
    fourniture: "Combien de postes, d'équipements ou de sites sont concernés par cette acquisition ?",
    service: "Quelle est l'étendue de la prestation ? Quels services ou sites sont concernés ?",
    travaux: "Quelle est la surface ou le périmètre concerné par ces travaux ?",
    logiciel: "Combien d'utilisateurs, de licences ou de sites seront concernés ?",
    maintenance: "Combien d'équipements ou de sites sont couverts par ce besoin de maintenance ?",
    formation: "Combien de personnes doivent être formées ? Sur combien de sessions ?",
  },

  // ============================================
  // MODULE 4: CONTRAINTES
  // ============================================

  // Contraintes techniques
  technical_constraints: {
    default: "Quelles contraintes techniques devons-nous prendre en compte ?",
    fourniture: "Avec quels systèmes ou équipements existants le matériel doit-il être compatible ?",
    service: "Y a-t-il des contraintes techniques pour la réalisation de cette prestation ?",
    travaux: "Quelles sont les contraintes techniques du site (accès, réseaux, structure) ?",
    logiciel: "Avec quels systèmes existants le logiciel doit-il s'intégrer ?",
    maintenance: "Y a-t-il des contraintes techniques spécifiques aux équipements à maintenir ?",
    formation: "Y a-t-il des contraintes techniques (équipements de formation, logiciels requis) ?",
  },

  // Détails techniques
  technical_details: {
    default: "Pouvez-vous détailler les exigences techniques spécifiques ?",
    fourniture: "Quelles sont les spécifications techniques minimales requises ?",
    service: "Quels outils, méthodes ou technologies le prestataire doit-il maîtriser ?",
    travaux: "Quelles normes techniques ou de sécurité doivent être respectées ?",
    logiciel: "Quelles sont les exigences de performance, sécurité ou intégration ?",
    maintenance: "Quels niveaux de service (SLA) ou temps d'intervention sont requis ?",
    formation: "Quels prérequis techniques les participants doivent-ils avoir ?",
  },

  // Contraintes réglementaires
  regulatory_constraints: {
    default: "Quelles contraintes réglementaires s'appliquent à cette demande ?",
    fourniture: "Le matériel doit-il respecter des normes ou certifications particulières ?",
    service: "La prestation est-elle soumise à des obligations réglementaires ?",
    travaux: "Quelles normes de construction ou de sécurité s'appliquent ?",
    logiciel: "Le logiciel doit-il respecter des normes (RGPD, HDS, accessibilité) ?",
    maintenance: "Des certifications ou habilitations sont-elles requises pour les intervenants ?",
    formation: "La formation doit-elle être certifiante ou respecter un référentiel ?",
  },

  // Contraintes organisationnelles
  organizational_constraints: {
    default: "Quelles contraintes organisationnelles devons-nous prendre en compte ?",
    fourniture: "Y a-t-il des contraintes de livraison, d'installation ou de planning ?",
    service: "Quelles sont les contraintes de disponibilité ou d'accès pour le prestataire ?",
    travaux: "Quelles contraintes de planning ou d'accès au site s'appliquent ?",
    logiciel: "Y a-t-il des contraintes de déploiement ou de formation des utilisateurs ?",
    maintenance: "Quelles sont les contraintes horaires ou de disponibilité des équipements ?",
    formation: "Quelles sont les contraintes de disponibilité des participants ?",
  },

  // Autres contraintes
  other_constraints: {
    default: "Y a-t-il d'autres contraintes importantes à mentionner ?",
    fourniture: "Y a-t-il des exigences particulières (garantie, SAV, origine des produits) ?",
    service: "Y a-t-il des exigences particulières (confidentialité, langue, documentation) ?",
    travaux: "Y a-t-il des contraintes environnementales ou de nuisances à respecter ?",
    logiciel: "Y a-t-il des exigences de support, de formation ou de documentation ?",
    maintenance: "Y a-t-il des exigences de reporting, de documentation ou de pièces détachées ?",
    formation: "Y a-t-il des exigences de supports pédagogiques ou de suivi post-formation ?",
  },
};

/**
 * Module-level fallback first questions (if questionId not found)
 */
const MODULE_FIRST_QUESTIONS: Record<string, Record<string, string>> = {
  context: {
    default: "Pouvez-vous me décrire la situation que vous souhaitez expliquer ?",
    fourniture: "Pouvez-vous me décrire la situation concernant vos équipements ?",
    service: "Pouvez-vous me décrire la situation concernant cette prestation ?",
    travaux: "Pouvez-vous me décrire la situation concernant ce site ?",
    logiciel: "Pouvez-vous me décrire la situation concernant votre système actuel ?",
    maintenance: "Pouvez-vous me décrire la situation concernant vos équipements ?",
  },
  description: {
    default: "Décrivons votre besoin : quel est l'objectif principal de cette demande ?",
    fourniture: "Quel type d'équipement ou de fourniture recherchez-vous ?",
    service: "Quel type de prestation recherchez-vous ?",
    travaux: "Quel type de travaux souhaitez-vous réaliser ?",
    logiciel: "Quel type de solution logicielle recherchez-vous ?",
    maintenance: "Quel type de maintenance est nécessaire ?",
  },
  constraints: {
    default: "Y a-t-il des contraintes techniques à prendre en compte ?",
    fourniture: "Y a-t-il des contraintes de compatibilité avec vos équipements actuels ?",
    service: "Y a-t-il des contraintes horaires ou de disponibilité pour cette prestation ?",
    travaux: "Y a-t-il des contraintes d'accès ou de sécurité sur le site ?",
    logiciel: "Y a-t-il des contraintes d'intégration avec vos systèmes existants ?",
    maintenance: "Y a-t-il des contraintes de planification ou de disponibilité des équipements ?",
  },
};

/**
 * Question-specific examples based on questionId and needType
 *
 * IMPORTANT: Chaque question doit avoir son exemple correspondant
 */
const QUESTION_EXAMPLES: Record<string, Record<string, string>> = {
  // ============================================
  // MODULE 2: CONTEXTE & JUSTIFICATION
  // ============================================

  // Question 1: Situation actuelle
  current_situation: {
    default: "Le service compte 15 collaborateurs travaillant actuellement avec des équipements datant de 2018.",
    fourniture: "Le service comptabilité dispose de 8 ordinateurs acquis en 2017.",
    service: "Le service informatique gère actuellement la maintenance en interne avec 2 techniciens.",
    travaux: "Le bâtiment principal date de 1995 et accueille 120 agents sur 3 étages.",
    logiciel: "45 utilisateurs travaillent actuellement sur une solution Excel partagée.",
    maintenance: "Le parc comprend 20 imprimantes réparties sur 4 sites.",
    formation: "L'équipe de 12 agents utilise le logiciel depuis 2019 sans formation initiale.",
  },

  // Question 2: Problèmes rencontrés
  problems: {
    default: "Des lenteurs importantes sont constatées, ralentissant le travail quotidien.",
    fourniture: "5 postes sur 8 présentent des ralentissements importants rendant le travail difficile.",
    service: "Le temps de réponse moyen est de 48h, ce qui bloque les utilisateurs.",
    travaux: "Des infiltrations d'eau sont constatées lors de fortes pluies.",
    logiciel: "Le fichier Excel devient trop volumineux et génère des erreurs de synchronisation.",
    maintenance: "3 à 4 pannes par mois nécessitent l'intervention d'un technicien externe.",
    formation: "Les agents n'utilisent que 20% des fonctionnalités du logiciel par méconnaissance.",
  },

  // Question 3: Détails des problèmes
  problem_details: {
    default: "Ces problèmes engendrent une perte de productivité estimée à 2h par semaine et par agent.",
    fourniture: "Les agents perdent en moyenne 30 minutes par jour à cause des ralentissements.",
    service: "Les retards d'intervention ont causé 3 jours d'arrêt de production le mois dernier.",
    travaux: "L'humidité a causé des dégâts sur les archives et pose des problèmes de santé.",
    logiciel: "Les erreurs de saisie dues au fichier corrompu représentent 5% des données.",
    maintenance: "Chaque panne coûte en moyenne 150€ d'intervention externe.",
    formation: "Les erreurs de manipulation génèrent 15 tickets de support par mois.",
  },

  // Question 4: Pourquoi agir maintenant
  why_now: {
    default: "La fin de garantie des équipements actuels arrive en juin 2024, nous devons agir avant.",
    fourniture: "Les postes Windows 10 ne seront plus supportés après octobre 2025, il faut les remplacer.",
    service: "Un audit de conformité est prévu en septembre, nous devons être prêts.",
    travaux: "La toiture doit être refaite avant la saison des pluies en automne.",
    logiciel: "Le contrat actuel expire fin mars et ne sera pas renouvelé par l'éditeur.",
    maintenance: "Deux pannes critiques ce mois-ci ont causé 3 jours d'arrêt de production.",
    formation: "Un audit qualité ISO est prévu en juin, les agents doivent être formés avant.",
  },

  // Question 5: Précisions sur les échéances/déclencheurs
  why_now_details: {
    default: "L'échéance du projet est fixée au 15 septembre pour être opérationnel avant la rentrée.",
    fourniture: "Le support Windows 10 prend fin le 14 octobre 2025, les postes doivent être remplacés avant.",
    service: "L'audit ANSSI est programmé le 20 mars, la mise en conformité doit être terminée avant.",
    travaux: "Les travaux doivent être terminés avant le 1er novembre pour éviter la période de gel.",
    logiciel: "L'éditeur actuel cesse le support le 31 mars, la migration doit être faite avant.",
    maintenance: "Deux pannes majeures en décembre ont causé 5 jours d'arrêt, situation critique.",
    formation: "L'audit de certification est prévu le 15 juin, tous les agents doivent être formés avant.",
  },

  // ============================================
  // MODULE 3: DESCRIPTION DU BESOIN
  // ============================================

  // Objectifs
  objectives: {
    default: "Nous souhaitons améliorer l'efficacité et la productivité de notre service.",
    fourniture: "Nous recherchons des équipements performants et ergonomiques.",
    service: "Nous recherchons un prestataire réactif avec un temps d'intervention garanti.",
    travaux: "Nous souhaitons résoudre les problèmes d'étanchéité et améliorer l'isolation.",
    logiciel: "Nous recherchons une solution collaborative permettant le travail simultané.",
    maintenance: "Nous recherchons un contrat de maintenance avec intervention sous 4h.",
    formation: "Nous souhaitons former nos agents aux fonctionnalités avancées du logiciel.",
  },

  // Périmètre
  scope: {
    default: "Le projet concerne l'ensemble du service, soit 25 agents répartis sur 2 sites.",
    fourniture: "L'acquisition porte sur 15 postes pour le service comptabilité et 10 pour les RH.",
    service: "La prestation couvrira les 4 sites de la collectivité, soit environ 200 utilisateurs.",
    travaux: "Les travaux concernent le bâtiment A (800 m²) et ses 3 étages.",
    logiciel: "Le logiciel sera déployé pour 50 utilisateurs, dont 10 administrateurs.",
    maintenance: "Le contrat couvrira 45 équipements répartis sur les 3 sites principaux.",
    formation: "La formation concernera 20 agents, répartis en 4 sessions de 5 personnes.",
  },

  // ============================================
  // MODULE 4: CONTRAINTES
  // ============================================

  // Contraintes techniques
  technical_constraints: {
    default: "Les équipements doivent être compatibles avec notre infrastructure réseau existante.",
    fourniture: "Les postes doivent être compatibles avec notre parc d'écrans 24 pouces HDMI.",
    service: "Le prestataire devra utiliser nos outils de ticketing ServiceNow.",
    travaux: "Le bâtiment est classé, les travaux doivent respecter les contraintes ABF.",
    logiciel: "Le logiciel doit s'intégrer à notre Active Directory et notre SSO Keycloak.",
    maintenance: "Les techniciens doivent être habilités électriques B1V pour intervenir.",
    formation: "La salle de formation dispose de 12 postes avec Windows 11 et Office 365.",
  },

  // Détails techniques
  technical_details: {
    default: "Processeur i5 minimum, 16 Go RAM, SSD 256 Go, écran 24 pouces.",
    fourniture: "Intel Core i5 13e génération minimum, 16 Go RAM DDR5, SSD NVMe 512 Go.",
    service: "Le prestataire doit maîtriser ITIL v4, ServiceNow et les environnements Microsoft.",
    travaux: "Isolation R=6 minimum, menuiseries aluminium double vitrage Uw=1.4.",
    logiciel: "API REST, authentification SAML 2.0, export PDF et CSV, mode hors-ligne.",
    maintenance: "GTI 4h, GTR 8h, disponibilité 99.5%, reporting mensuel.",
    formation: "Prérequis : maîtrise des fonctions basiques d'Excel et d'un navigateur web.",
  },

  // Contraintes réglementaires
  regulatory_constraints: {
    default: "Les données doivent être hébergées en France conformément au RGPD.",
    fourniture: "Les équipements doivent être certifiés CE et conformes aux normes NF.",
    service: "Le prestataire doit disposer d'une certification ISO 27001.",
    travaux: "Les travaux doivent respecter la RT 2020 et les normes PMR.",
    logiciel: "Conformité RGPD obligatoire, hébergement HDS si données de santé.",
    maintenance: "Les intervenants doivent disposer des habilitations électriques requises.",
    formation: "Formation certifiante Qualiopi avec attestation de fin de formation.",
  },

  // Contraintes organisationnelles
  organizational_constraints: {
    default: "Les interventions doivent avoir lieu en dehors des heures d'ouverture au public.",
    fourniture: "Livraison obligatoire le matin entre 7h et 9h, avant l'ouverture des services.",
    service: "Les interventions sur site doivent être planifiées 48h à l'avance.",
    travaux: "Les travaux bruyants sont interdits pendant les heures de réunion (9h-12h).",
    logiciel: "Le déploiement doit se faire un weekend pour éviter les interruptions de service.",
    maintenance: "Les équipements ne sont disponibles que le mercredi après-midi et le weekend.",
    formation: "Les agents ne sont disponibles que le jeudi et vendredi matin.",
  },

  // Autres contraintes
  other_constraints: {
    default: "Une documentation complète en français est exigée.",
    fourniture: "Garantie 3 ans sur site minimum, avec remplacement J+1.",
    service: "Confidentialité stricte requise, signature d'un accord de non-divulgation.",
    travaux: "Réduction des nuisances sonores obligatoire, travaux silencieux après 18h.",
    logiciel: "Support en français par téléphone et email, temps de réponse < 4h.",
    maintenance: "Stock de pièces détachées sur site requis pour les équipements critiques.",
    formation: "Supports pédagogiques numériques à conserver, accès replay pendant 6 mois.",
  },
};

/**
 * Module-level fallback examples (if questionId not found)
 */
const DYNAMIC_EXAMPLES: Record<string, Record<string, string>> = {
  context: {
    default: "Le service compte 15 collaborateurs travaillant actuellement avec des équipements datant de 2018.",
    fourniture: "Le service RH dispose de 12 bureaux acquis en 2015.",
    service: "Le service informatique gère actuellement la maintenance en interne.",
    travaux: "Le bâtiment principal date de 1995.",
    logiciel: "45 utilisateurs travaillent actuellement sur une solution Excel.",
    maintenance: "Le parc de 20 imprimantes a 5 ans de moyenne d'âge.",
  },
  description: {
    default: "Nous recherchons une solution permettant d'améliorer l'efficacité de notre service.",
    fourniture: "Nous recherchons 12 bureaux ergonomiques réglables en hauteur.",
    service: "Nous recherchons un prestataire pour assurer la formation de nos équipes.",
    travaux: "Nous souhaitons rénover l'isolation des combles.",
    logiciel: "Nous recherchons un logiciel de gestion de projet collaboratif.",
    maintenance: "Nous recherchons un contrat de maintenance préventive et curative.",
  },
  constraints: {
    default: "Les équipements doivent être compatibles avec notre infrastructure existante.",
    fourniture: "Les bureaux doivent respecter les normes ergonomiques.",
    service: "La prestation doit pouvoir se dérouler en dehors des heures de service.",
    travaux: "Les travaux doivent être réalisés pendant les congés d'été.",
    logiciel: "Le logiciel doit s'intégrer avec notre Active Directory.",
    maintenance: "L'intervention doit être possible sous 4h en cas de panne critique.",
  },
};

/**
 * Module-specific rules to guide AI behavior
 */
const MODULE_RULES: Record<string, string> = {
  context: `RÈGLES SPÉCIFIQUES AU MODULE "CONTEXTE" :
- Tu décris UNIQUEMENT la situation ACTUELLE (ce qui existe aujourd'hui)
- Tu NE proposes JAMAIS de solutions, produits, marques ou recommandations
- Tu NE parles PAS de ce qui devrait être fait ou acquis
- Tu te concentres sur : l'existant, les problèmes rencontrés, les impacts, les chiffres actuels
- Questions pertinentes : nombre de personnes/équipements, âge du matériel, fréquence des problèmes, impacts sur le travail
- Exemples INTERDITS : "il faudrait acquérir...", "la solution serait...", "des ordinateurs comme Dell/HP..."`,

  description: `RÈGLES SPÉCIFIQUES AU MODULE "DESCRIPTION DU BESOIN" :
- Tu décris ce que l'utilisateur RECHERCHE (la solution souhaitée)
- Tu peux mentionner des caractéristiques techniques souhaitées
- Tu NE recommandes PAS de marques ou produits spécifiques
- Tu te concentres sur : objectifs, fonctionnalités attendues, caractéristiques requises`,

  constraints: `RÈGLES SPÉCIFIQUES AU MODULE "CONTRAINTES" :
- Tu listes les contraintes et exigences obligatoires
- Tu te concentres sur : compatibilité, normes, délais, restrictions
- Tu NE proposes PAS de solutions pour contourner les contraintes`,
};

/**
 * Build initial prompt for first AI question
 */
export function buildInitialPrompt(ctx: PromptContext): string {
  const urgencyInstruction = ctx.urgencyLevel === "critical"
    ? "L'urgence est critique : pose des questions directes et concises, va à l'essentiel. Limite-toi à 3-4 questions maximum."
    : "Prends le temps d'explorer le contexte en détail pour un dossier complet.";

  // Try question-specific first, then module-level fallback
  const firstQuestion = QUESTION_FIRST_QUESTIONS[ctx.questionId]?.[ctx.needType ?? "default"]
    ?? QUESTION_FIRST_QUESTIONS[ctx.questionId]?.default
    ?? MODULE_FIRST_QUESTIONS[ctx.moduleId]?.[ctx.needType ?? "default"]
    ?? MODULE_FIRST_QUESTIONS[ctx.moduleId]?.default
    ?? "Pouvez-vous décrire votre situation ?";

  // Try question-specific example first, then module-level fallback
  const example = QUESTION_EXAMPLES[ctx.questionId]?.[ctx.needType ?? "default"]
    ?? QUESTION_EXAMPLES[ctx.questionId]?.default
    ?? DYNAMIC_EXAMPLES[ctx.moduleId]?.[ctx.needType ?? "default"]
    ?? DYNAMIC_EXAMPLES[ctx.moduleId]?.default
    ?? "";

  const moduleRules = MODULE_RULES[ctx.moduleId] ?? "";

  // Build suggested options context if provided
  const suggestedOptionsContext = ctx.suggestedOptions && ctx.suggestedOptions.length > 0
    ? `
OPTIONS SUGGÉRÉES POUR GUIDER LA RÉDACTION :
L'utilisateur peut choisir parmi ces raisons/motifs. Utilise-les pour guider tes questions et structurer la réponse :
${ctx.suggestedOptions.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}

IMPORTANT : Demande à l'utilisateur quelles raisons s'appliquent parmi cette liste, puis explore les détails pour chacune.
Propose ces options comme choix rapides dans ta première question.`
    : "";

  return `Tu es un assistant qui aide à rédiger des dossiers de demande d'achat pour une collectivité.
Tu guides l'utilisateur avec des questions simples et claires, une à la fois.

CONTEXTE DU PROJET :
- Titre : ${ctx.title}
- Service demandeur : ${ctx.departmentName ?? "Non spécifié"}
- Type de besoin : ${ctx.needType ?? "Non spécifié"}
- Niveau d'urgence : ${ctx.urgencyLevel ?? "normal"}

${urgencyInstruction}

MODULE ACTUEL : ${ctx.moduleId}
QUESTION À TRAITER : ${ctx.questionLabel}

${moduleRules}
${suggestedOptionsContext}

Ta première question devrait être : "${firstQuestion}"

RÈGLES GÉNÉRALES :
1. La question doit être adaptée au type de besoin (${ctx.needType ?? "général"})
2. Propose 2-4 options de réponse rapide SI pertinent (sinon laisse libre)
3. Donne UN exemple concret adapté au contexte (SANS proposer de solution)
4. Sois chaleureux mais professionnel, en français
5. Ne pose qu'UNE question à la fois
6. L'exemple devrait ressembler à : "${example}"

FORMAT DE RÉPONSE (JSON strict) :
{
  "question": "Ta question claire et concise",
  "options": ["Option 1", "Option 2", "Option 3"] ou null si question ouverte,
  "example": "Exemple : ${example.substring(0, 50)}...",
  "inputType": "text" ou "select" ou "number"
}`;
}

/**
 * Build prompt for processing user response
 */
export function buildResponsePrompt(ctx: PromptContext): string {
  const history = ctx.conversationHistory
    ?.map(m => `${m.role === "assistant" ? "Assistant" : "Utilisateur"}: ${m.content}`)
    .join("\n") ?? "";

  const lastUserResponse = ctx.conversationHistory
    ?.filter(m => m.role === "user")
    .pop()?.content ?? "";

  const moduleRules = MODULE_RULES[ctx.moduleId] ?? "";

  return `Tu es un assistant qui aide à rédiger des dossiers de demande d'achat.

CONTEXTE DU PROJET :
- Titre : ${ctx.title}
- Service : ${ctx.departmentName ?? "Non spécifié"}
- Type de besoin : ${ctx.needType ?? "Non spécifié"}
- Urgence : ${ctx.urgencyLevel ?? "normal"}

MODULE : ${ctx.moduleId}
QUESTION GLOBALE : ${ctx.questionLabel}

${moduleRules}

HISTORIQUE DE CONVERSATION :
${history}

TEXTE GÉNÉRÉ JUSQU'ICI :
${ctx.currentText ?? "(Vide - première réponse)"}

DERNIÈRE RÉPONSE DE L'UTILISATEUR :
${lastUserResponse}

Ta tâche :
1. Intégrer la réponse de l'utilisateur dans le texte existant de manière fluide et professionnelle
2. Poser la question suivante la plus pertinente pour enrichir le texte
3. Si le texte semble suffisamment complet (3-4 échanges), proposer de terminer

RÈGLES GÉNÉRALES :
1. Le texte intégré doit être rédigé à la 3ème personne, style professionnel administratif
2. Ne répète JAMAIS les informations déjà présentes dans le texte
3. Une seule question à la fois
4. Propose des options si la question s'y prête
5. Adapte le ton selon l'urgence (${ctx.urgencyLevel === "critical" ? "direct et concis" : "détaillé"})
6. RESPECTE STRICTEMENT les règles spécifiques au module ci-dessus

FORMAT DE RÉPONSE (JSON strict) :
{
  "integratedText": "Le texte complet mis à jour avec la nouvelle information intégrée",
  "question": "Ta prochaine question" ou null si tu proposes de terminer,
  "options": ["Option 1", "Option 2"] ou null,
  "example": "Exemple : ..." ou null,
  "inputType": "text" ou "select" ou "number",
  "isComplete": false (true seulement si tu proposes de terminer et question est null)
}`;
}

/**
 * Build prompt for completion suggestions
 */
export function buildCompletionPrompt(ctx: PromptContext): string {
  const moduleRules = MODULE_RULES[ctx.moduleId] ?? "";

  return `Tu es un assistant qui aide à rédiger des dossiers de demande d'achat.

L'utilisateur a indiqué vouloir terminer la rédaction de cette section.

TEXTE GÉNÉRÉ :
${ctx.currentText}

CONTEXTE :
- Type de besoin : ${ctx.needType ?? "général"}
- Module : ${ctx.moduleId}
- Service : ${ctx.departmentName ?? "Non spécifié"}

${moduleRules}

Ta tâche : Analyser le texte et proposer 2-3 suggestions d'enrichissement OPTIONNELLES.

RÈGLES :
1. Les suggestions doivent être pertinentes pour un dossier de demande officiel
2. Chaque suggestion doit être actionnable en un clic
3. Génère le texte qui serait ajouté pour chaque suggestion
4. Ne force pas l'utilisateur, ce sont des options facultatives
5. RESPECTE les règles spécifiques au module (pas de solutions si module contexte)

FORMAT DE RÉPONSE (JSON strict) :
{
  "textIsComplete": true ou false (true si le texte est vraiment complet),
  "suggestions": [
    {
      "id": "add_impact",
      "label": "Ajouter l'impact sur le travail",
      "preview": "Cette situation impacte directement la productivité des équipes..."
    },
    {
      "id": "add_dates",
      "label": "Préciser les dates clés",
      "preview": "Les équipements ont été acquis en [année] et..."
    }
  ]
}`;
}

/**
 * Build prompt for expert mode analysis
 */
export function buildAnalysisPrompt(ctx: PromptContext): string {
  return `Tu es un assistant qui analyse des textes de dossiers de demande d'achat.

TEXTE À ANALYSER :
${ctx.currentText}

CONTEXTE :
- Type de besoin : ${ctx.needType ?? "général"}
- Module : ${ctx.moduleId} (${ctx.questionLabel})
- Service : ${ctx.departmentName ?? "Non spécifié"}

Ta tâche : Analyser le texte et fournir un feedback structuré.

FORMAT DE RÉPONSE (JSON strict) :
{
  "strengths": [
    "Point fort détecté (ex: Chiffres précis)",
    "Autre point fort"
  ],
  "suggestions": [
    {
      "id": "suggestion_1",
      "type": "add",
      "label": "Préciser les problèmes rencontrés",
      "priority": "high",
      "preview": "Texte qui serait ajouté..."
    }
  ],
  "missingPoints": [
    "Nombre de personnes concernées",
    "Budget actuel"
  ],
  "completenessScore": 65
}`;
}

/**
 * Build prompt for generating a specific suggestion
 */
export function buildSuggestionPrompt(
  ctx: PromptContext,
  suggestionType: string
): string {
  const instructions: Record<string, string> = {
    add_problems: "Ajoute une phrase décrivant les problèmes rencontrés avec la situation actuelle.",
    add_impact: "Ajoute une phrase sur l'impact de la situation sur le travail quotidien ou la productivité.",
    add_dates: "Ajoute les dates pertinentes (acquisition, dernière maintenance, échéance, etc.).",
    add_numbers: "Ajoute des chiffres concrets (coûts, quantités, fréquences, pourcentages).",
    add_context: "Ajoute du contexte supplémentaire pour mieux comprendre la situation.",
    reformulate: "Reformule le texte pour le rendre plus professionnel et clair.",
  };

  return `Tu es un assistant qui enrichit des textes de dossiers de demande.

TEXTE ACTUEL :
${ctx.currentText}

CONTEXTE :
- Type de besoin : ${ctx.needType ?? "général"}
- Service : ${ctx.departmentName ?? "Non spécifié"}

INSTRUCTION :
${instructions[suggestionType] ?? "Améliore le texte de manière pertinente."}

RÈGLES :
1. Génère UNIQUEMENT le texte à ajouter ou la modification
2. Le style doit être cohérent avec le texte existant
3. Sois concis mais informatif
4. Utilise un ton professionnel administratif

FORMAT DE RÉPONSE (JSON strict) :
{
  "action": "append" ou "replace",
  "text": "Le texte généré à ajouter ou le texte complet si replace",
  "position": "end" ou "after_first_sentence" ou null
}`;
}

/**
 * Build prompt for user questions to AI
 */
export function buildUserQuestionPrompt(
  ctx: PromptContext,
  userQuestion: string
): string {
  return `Tu es un assistant expert en rédaction de dossiers de demande d'achat pour les collectivités.

L'utilisateur pose une question sur son texte ou demande de l'aide.

TEXTE ACTUEL :
${ctx.currentText ?? "(Pas encore de texte)"}

QUESTION DE L'UTILISATEUR :
${userQuestion}

CONTEXTE :
- Type de besoin : ${ctx.needType ?? "général"}
- Module : ${ctx.moduleId}
- Service : ${ctx.departmentName ?? "Non spécifié"}

Ta tâche : Répondre de manière utile et proposer une amélioration concrète si pertinent.

EXEMPLES DE QUESTIONS COURANTES :
- "C'est suffisant ?" → Évalue la complétude et suggère des ajouts si besoin
- "Comment formuler ça mieux ?" → Propose une reformulation
- "Je dois ajouter quoi d'autre ?" → Liste les points manquants importants
- "Est-ce correct ?" → Vérifie la cohérence et la clarté

FORMAT DE RÉPONSE (JSON strict) :
{
  "answer": "Ta réponse claire et utile à la question",
  "suggestion": {
    "label": "Suggestion d'amélioration" ou null si pas pertinent,
    "text": "Texte suggéré à ajouter" ou null
  }
}`;
}

/**
 * Build prompt for generating dynamic choices in guided mode
 * Generates 4-6 contextual suggestions based on project data and previous answers
 */
export function buildChoicesPrompt(
  ctx: PromptContext,
  existingChoices?: string[]
): string {
  // Build previous answers context
  const previousAnswersContext = ctx.previousAnswers
    ? Object.entries(ctx.previousAnswers)
        .map(([questionId, data]) => `- ${data.questionLabel}: ${data.value}`)
        .join("\n")
    : "(Aucune réponse précédente)";

  // Build existing choices to avoid
  const existingChoicesContext = existingChoices && existingChoices.length > 0
    ? `\nCHOIX DÉJÀ PROPOSÉS (à ne PAS répéter) :\n${existingChoices.map(c => `- ${c}`).join("\n")}`
    : "";

  const moduleRules = MODULE_RULES[ctx.moduleId] ?? "";

  // Get question-specific guidance
  const questionGuidance = QUESTION_FIRST_QUESTIONS[ctx.questionId]?.[ctx.needType ?? "default"]
    ?? QUESTION_FIRST_QUESTIONS[ctx.questionId]?.default
    ?? "";

  const questionExample = QUESTION_EXAMPLES[ctx.questionId]?.[ctx.needType ?? "default"]
    ?? QUESTION_EXAMPLES[ctx.questionId]?.default
    ?? "";

  return `Tu es un assistant expert en rédaction de dossiers de demande d'achat pour les collectivités.

CONTEXTE DU PROJET :
- Titre : ${ctx.title}
- Service demandeur : ${ctx.departmentName ?? "Non spécifié"}
- Type de besoin : ${ctx.needType ?? "Non spécifié"}
- Niveau d'urgence : ${ctx.urgencyLevel ?? "normal"}

MODULE ACTUEL : ${ctx.moduleId}
QUESTION : ${ctx.questionLabel}

${moduleRules}

RÉPONSES PRÉCÉDENTES DU WIZARD :
${previousAnswersContext}
${existingChoicesContext}

GUIDANCE POUR CETTE QUESTION :
${questionGuidance}

EXEMPLE DE RÉPONSE ATTENDUE :
${questionExample}

Ta tâche : Générer exactement 5 suggestions de réponses PERTINENTES et CONTEXTUALISÉES pour cette question.

RÈGLES STRICTES :
1. Chaque suggestion doit être une phrase courte et claire (10-20 mots max)
2. Les suggestions doivent être SPÉCIFIQUES au contexte du projet (type de besoin, service, etc.)
3. NE PAS répéter les choix déjà proposés
4. NE PAS inclure de choix générique type "Autre" ou "Aucun"
5. Les suggestions doivent pouvoir être combinées (l'utilisateur peut en sélectionner plusieurs)
6. Adapter le vocabulaire au type de besoin (${ctx.needType ?? "général"})
7. RESPECTER les règles du module (${ctx.moduleId})

FORMAT DE RÉPONSE (JSON strict) :
{
  "choices": [
    "Première suggestion contextuelle et spécifique",
    "Deuxième suggestion différente mais pertinente",
    "Troisième suggestion apportant un autre angle",
    "Quatrième suggestion complémentaire",
    "Cinquième suggestion originale"
  ]
}`;
}

/**
 * Build prompt for generating final answer from selected choices
 * Creates a well-structured professional text from user's selections
 */
export function buildAnswerFromChoicesPrompt(
  ctx: PromptContext,
  selectedChoices: string[],
  freeInput?: string
): string {
  // Build previous answers context
  const previousAnswersContext = ctx.previousAnswers
    ? Object.entries(ctx.previousAnswers)
        .map(([questionId, data]) => `- ${data.questionLabel}: ${data.value}`)
        .join("\n")
    : "(Aucune réponse précédente)";

  const moduleRules = MODULE_RULES[ctx.moduleId] ?? "";

  // Build selected choices list
  const selectedChoicesText = selectedChoices.map((c, i) => `${i + 1}. ${c}`).join("\n");

  // Free input context
  const freeInputContext = freeInput
    ? `\nSAISIE LIBRE DE L'UTILISATEUR :\n"${freeInput}"`
    : "";

  return `Tu es un rédacteur expert en dossiers de demande d'achat pour les collectivités.

CONTEXTE DU PROJET :
- Titre : ${ctx.title}
- Service demandeur : ${ctx.departmentName ?? "Non spécifié"}
- Type de besoin : ${ctx.needType ?? "Non spécifié"}
- Niveau d'urgence : ${ctx.urgencyLevel ?? "normal"}

MODULE ACTUEL : ${ctx.moduleId}
QUESTION À TRAITER : ${ctx.questionLabel}

${moduleRules}

RÉPONSES PRÉCÉDENTES DU WIZARD :
${previousAnswersContext}

CHOIX SÉLECTIONNÉS PAR L'UTILISATEUR :
${selectedChoicesText}
${freeInputContext}

Ta tâche : Rédiger un texte professionnel et structuré qui intègre TOUS les éléments sélectionnés par l'utilisateur.

RÈGLES DE RÉDACTION :
1. Style professionnel administratif, adapté aux marchés publics
2. Rédaction à la 3ème personne ("Le service...", "L'organisation...")
3. Intégrer TOUS les choix sélectionnés de manière fluide et cohérente
4. Structurer le texte de manière logique (ne pas faire une simple liste)
5. Ajouter des connecteurs et transitions pour la fluidité
6. Si saisie libre fournie, l'intégrer naturellement dans le texte
7. Longueur adaptée : ${selectedChoices.length <= 2 ? "2-3 phrases" : selectedChoices.length <= 4 ? "4-6 phrases" : "un paragraphe complet"}
8. RESPECTER les règles du module (pas de solutions dans le module contexte, etc.)

FORMAT DE RÉPONSE (JSON strict) :
{
  "generatedText": "Le texte rédigé, professionnel et structuré, intégrant tous les éléments sélectionnés."
}`;
}
