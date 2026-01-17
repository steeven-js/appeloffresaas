---
stepsCompleted: [1, 2, 3, 4]
workflowComplete: true
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
  - product-brief-appeloffresaas-2026-01-16.md
workflowType: "epics-and-stories"
project_name: "appeloffresaas"
date: "2026-01-16"
lastRevision: "2026-01-17"
revisionNotes: "Added Epic 1.5 - Dashboard Shell & App Layout (6 stories)"
---

# appeloffresaas - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for appeloffresaas, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements (66 FRs)

#### 1. User Account Management (7 FRs)

- **FR1:** User can create an account with email and password
- **FR2:** User can authenticate using email/password credentials
- **FR3:** User can reset password via email verification
- **FR4:** User can update account information (name, email)
- **FR5:** User can delete account and all associated data
- **FR6:** User can view current subscription tier and limits
- **FR7:** User can upgrade or downgrade subscription tier

#### 2. Company Profile Management (8 FRs)

- **FR8:** User can create and edit company profile (name, SIRET, address, contact)
- **FR9:** User can add and manage company legal information (Kbis, capital, NAF code)
- **FR10:** User can add and manage financial data (CA, effectifs, bilans)
- **FR11:** User can add and manage certifications and qualifications
- **FR12:** User can add and manage team members information (CV, compétences)
- **FR13:** User can add and manage project references (description, montant, client, dates)
- **FR14:** System automatically suggests profile completion based on missing fields
- **FR15:** User can view profile completeness score

#### 3. Document Vault Management (6 FRs)

- **FR16:** User can upload documents to secure vault (PDF, Word, images)
- **FR17:** User can categorize documents by type (Kbis, attestations, certificats)
- **FR18:** User can set expiration dates on documents
- **FR19:** System automatically detects document expiration dates from content when possible
- **FR20:** User can view, download, and delete vault documents
- **FR21:** User can search documents in vault by name and category

#### 4. Tender Project Management (7 FRs)

- **FR22:** User can create a new tender project (AO)
- **FR23:** User can upload tender regulation document (RC) in PDF format
- **FR24:** User can set tender submission deadline
- **FR25:** User can view list of all tender projects with status
- **FR26:** User can archive completed tender projects
- **FR27:** User can duplicate an existing tender project as template
- **FR28:** User can delete a tender project

#### 5. Regulation Parsing (7 FRs)

- **FR29:** System can parse uploaded RC document and extract required documents list
- **FR30:** System can categorize extracted requirements (administrative, technical, financial)
- **FR31:** System can identify submission format requirements (PDF, paper, platform)
- **FR32:** System can extract submission deadline from RC
- **FR33:** User can view parsed requirements as structured checklist
- **FR34:** User can manually add, edit, or remove items from parsed checklist
- **FR35:** User can mark checklist items as complete

#### 6. AI-Assisted Content Creation (8 FRs)

- **FR36:** User can interact with AI assistant via conversational chat interface
- **FR37:** AI can ask contextual questions to gather tender-specific information
- **FR38:** AI can suggest content based on company profile and previous tenders
- **FR39:** AI can pre-fill sections using existing company profile data
- **FR40:** User can accept, modify, or reject AI suggestions
- **FR41:** AI can adapt question depth based on information already known
- **FR42:** User can skip questions and return to them later (question queue)
- **FR43:** AI can provide sector-specific suggestions based on tender context

#### 7. Document Preview & Editing (7 FRs)

- **FR44:** User can view real-time preview of generated tender document
- **FR45:** User can edit document content directly in preview (inline editing)
- **FR46:** User can request AI to reformulate specific sections
- **FR47:** User can view section completion indicators (complete, needs review, missing)
- **FR48:** System can display confidence level for AI-generated content
- **FR49:** User can navigate between document sections via sidebar
- **FR50:** User can view document in 3-column layout (chat, content, modules)

#### 8. Export & Submission Preparation (7 FRs)

- **FR51:** User can export tender document in PDF format
- **FR52:** User can export tender document in Word format
- **FR53:** User can export complete tender package as structured ZIP
- **FR54:** System organizes ZIP with standard folder structure (administrative, technical, financial)
- **FR55:** User can customize export settings (include/exclude sections)
- **FR56:** System validates all required documents are present before export
- **FR57:** User can view pre-export conformity checklist with status

#### 9. Notifications & Alerts (5 FRs)

- **FR58:** System sends alert when vault document is expiring within configurable threshold
- **FR59:** System sends alert when document will be expired at tender submission date
- **FR60:** System sends reminder notifications for approaching tender deadlines
- **FR61:** User can configure notification preferences (email, in-app)
- **FR62:** User can view notification history

#### 10. Data Reuse & Intelligence (4 FRs)

- **FR63:** System can identify reusable content from previous tenders
- **FR64:** System can suggest relevant references based on tender sector/type
- **FR65:** User can save new information captured during tender to company profile
- **FR66:** System tracks data freshness and suggests updates for stale information

### Non-Functional Requirements (24 NFRs)

#### Performance (5 NFRs)

- **NFR-P1:** AI Chat Response Time — First token <1s, streaming visible, full response <10s
- **NFR-P2:** RC Parsing Performance — <50 pages in <30s, 50-200 pages in <90s
- **NFR-P3:** UI Responsiveness — Page load <3s, navigation <500ms, preview update <1s
- **NFR-P4:** Document Generation — PDF/Word <10s, ZIP <30s
- **NFR-P5:** Concurrent Users — 100 simultaneous users (MVP), graceful degradation

#### Security (6 NFRs)

- **NFR-S1:** Data Encryption — AES-256 at rest, TLS 1.3 in transit
- **NFR-S2:** Authentication — bcrypt (cost ≥12), session tokens with expiration, rate limiting
- **NFR-S3:** Authorization — Strict user data isolation, server-side validation
- **NFR-S4:** RGPD Compliance — Explicit consent, data export <72h, deletion <30 days
- **NFR-S5:** Audit & Logging — All sensitive actions logged, 90-day retention, append-only
- **NFR-S6:** API Security — Rate limiting (100 req/min), input validation, strict CORS

#### Scalability (3 NFRs)

- **NFR-SC1:** User Growth — 10x growth without major refactoring, 500→5000 users
- **NFR-SC2:** Data Storage — Horizontal scaling (S3), partitioning ready
- **NFR-SC3:** AI API Scaling — Queue management, graceful fallback, cost monitoring

#### Reliability (4 NFRs)

- **NFR-R1:** Availability — 99.5% uptime, planned maintenance off-hours
- **NFR-R2:** Data Durability — Daily backup, 30-day retention, RPO <24h, RTO <4h
- **NFR-R3:** Error Handling — Clear user messages, system logging, graceful degradation
- **NFR-R4:** Data Integrity — ACID transactions, validation before persistence

#### Accessibility (3 NFRs)

- **NFR-A1:** WCAG Compliance — Level AA, keyboard navigation, contrast 4.5:1
- **NFR-A2:** Responsive Design — Desktop optimized, tablet functional, mobile readable
- **NFR-A3:** Browser Support — Chrome, Firefox, Safari, Edge (2 latest versions)

#### Operational (3 NFRs)

- **NFR-O1:** Monitoring — APM active, automatic alerts, real-time dashboard
- **NFR-O2:** Deployments — Zero-downtime, rollback <5min, staging required
- **NFR-O3:** Logging — Centralized, searchable, request ID correlation

### Additional Requirements

#### From Architecture

- **ARCH-1:** Project initialization with create-t3-app starter template (Story 0)
  ```bash
  pnpm create t3-app@latest appeloffresaas --tailwind --trpc --drizzle --dbProvider postgresql --appRouter --CI
  npx shadcn@latest init
  ```
- **ARCH-2:** Infrastructure setup — Neon PostgreSQL, Upstash Redis, Cloudflare R2, Vercel
- **ARCH-3:** Inngest integration for background jobs (RC parsing, export generation)
- **ARCH-4:** SSE streaming for AI chat responses (Vercel AI SDK)
- **ARCH-5:** TipTap editor for WYSIWYG document editing
- **ARCH-6:** Stripe integration for subscription management
- **ARCH-7:** Resend for transactional emails
- **ARCH-8:** NextAuth.js v5 for authentication

#### From UX Design

- **UX-1:** 3-column layout implementation (sidebar 280px, center flexible, co-pilot 320px)
- **UX-2:** RGAA AA accessibility compliance (French standard)
- **UX-3:** shadcn/ui + Radix UI component library integration
- **UX-4:** 6 custom components: ChatBubble, ModuleCard, CompletionGauge, CopilotSuggestion, DocumentPreview, HybridQuestion
- **UX-5:** Professional Trust color palette (Blue #0066CC, Slate grays, Green accents)
- **UX-6:** Mobile-responsive design (desktop-first)
- **UX-7:** Loading states and progress indicators for all async operations

### FR Coverage Map

| FR        | Epic   | Description                  |
| --------- | ------ | ---------------------------- |
| FR1-FR7   | Epic 1 | User Account Management      |
| FR8-FR15  | Epic 2 | Company Profile Management   |
| FR16-FR21 | Epic 2 | Document Vault Management    |
| FR22-FR28 | Epic 3 | Tender Project Management    |
| FR29-FR35 | Epic 4 | Regulation Parsing (RC)      |
| FR36-FR43 | Epic 5 | AI-Assisted Content Creation |
| FR44-FR50 | Epic 6 | Document Preview & Editing   |
| FR51-FR57 | Epic 7 | Export & Submission          |
| FR58-FR62 | Epic 8 | Notifications & Alerts       |
| FR63-FR66 | Epic 8 | Data Reuse & Intelligence    |

**Coverage Summary:** 66/66 FRs mapped (100%)

---

## Epic List

### Epic 0: Project Foundation

**Objectif :** Initialiser l'infrastructure technique permettant le développement de l'application.

**Valeur Utilisateur :** Les développeurs peuvent commencer à construire l'application sur une base solide et conforme à l'architecture.

**Requirements couverts :** ARCH-1, ARCH-2, ARCH-8, UX-3, UX-5

**Scope :**

- Initialisation create-t3-app avec tRPC, Drizzle, Tailwind
- Configuration shadcn/ui et thème Professional Trust
- Setup NextAuth.js v5 (base)
- Configuration environnements (Neon, Upstash, R2, Vercel)
- CI/CD pipeline basique

---

### Epic 1: Authentification & Gestion Compte

**Objectif :** Les utilisateurs peuvent créer un compte, se connecter, gérer leur profil et leur abonnement.

**Valeur Utilisateur :** Accès sécurisé à la plateforme avec gestion autonome du compte et de l'abonnement.

**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7

**Additional Requirements :** ARCH-6 (Stripe), NFR-S1, NFR-S2, NFR-S4

**Scope :**

- Inscription email/password
- Connexion et sessions
- Reset password
- Gestion profil utilisateur
- Intégration Stripe (tiers Free, Pro, Business)
- Upgrade/downgrade abonnement

---

### Epic 1.5: Dashboard Shell & App Layout

**Objectif :** Implémenter le squelette SaaS de l'application avec une interface professionnelle (sidebar, navigation, dropdown utilisateur) conforme aux standards modernes.

**Valeur Utilisateur :** Une expérience utilisateur cohérente et professionnelle dès la connexion, avec une navigation intuitive et un accès rapide à toutes les fonctionnalités.

**Additional Requirements :** UX-1 (3-column layout), NFR-A2 (Responsive Design), Architecture Section 4.3 (Structure Patterns)

**Scope :**

- AppLayout wrapper pour pages authentifiées
- AppSidebar avec navigation principale et modules
- AppHeader avec breadcrumb et actions contextuelles
- UserDropdown (profil, paramètres, thème, déconnexion)
- Dashboard page avec métriques et actions rapides
- Mobile responsive drawer
- Breadcrumb et navigation contextuelle

---

## Epic 2: Profil Entreprise & Coffre-fort Documents

**Objectif :** Les utilisateurs peuvent créer leur profil entreprise complet et stocker leurs documents administratifs récurrents.

**Valeur Utilisateur :** Base de données entreprise réutilisable pour tous les AO futurs, avec gestion centralisée des documents.

**FRs couverts :** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21

**Additional Requirements :** UX-4 (CompletionGauge), NFR-SC2

**Scope :**

- Création/édition profil entreprise (SIRET, Kbis, etc.)
- Gestion informations légales et financières
- Gestion certifications et qualifications
- Gestion équipe et compétences
- Gestion références projets
- Score de complétude profil
- Upload documents vers coffre-fort
- Catégorisation et dates d'expiration
- Recherche et gestion documents

---

### Epic 3: Création Projet AO

**Objectif :** Les utilisateurs peuvent créer et gérer des projets d'appels d'offres.

**Valeur Utilisateur :** Espace de travail dédié pour chaque AO avec organisation claire.

**FRs couverts :** FR22, FR23, FR24, FR25, FR26, FR27, FR28

**Additional Requirements :** UX-1 (3-column layout base)

**Scope :**

- Création nouveau projet AO
- Upload document RC (PDF)
- Définition deadline soumission
- Liste des projets avec statuts
- Archivage projets terminés
- Duplication projets comme template
- Suppression projets

---

### Epic 4: Parsing RC & Checklist Conformité

**Objectif :** Le système analyse automatiquement le règlement de consultation et génère une checklist des pièces requises.

**Valeur Utilisateur :** Plus besoin de lire 100+ pages — la checklist des documents requis est générée automatiquement.

**FRs couverts :** FR29, FR30, FR31, FR32, FR33, FR34, FR35

**Additional Requirements :** ARCH-3 (Inngest), ARCH-4 (Claude API), UX-4 (ModuleCard), NFR-P2

**Scope :**

- Parsing PDF du règlement de consultation
- Extraction liste des documents requis
- Catégorisation (administratif, technique, financier)
- Identification format soumission
- Extraction deadline depuis RC
- Affichage checklist structurée
- Édition manuelle checklist
- Marquage items comme complétés

---

### Epic 5: Assistant IA Co-Pilote

**Objectif :** Les utilisateurs interagissent avec l'assistant IA pour créer le contenu de leur réponse AO.

**Valeur Utilisateur :** Rédaction guidée avec suggestions contextuelles et pré-remplissage intelligent.

**FRs couverts :** FR36, FR37, FR38, FR39, FR40, FR41, FR42, FR43

**Additional Requirements :** ARCH-4 (SSE streaming), UX-4 (ChatBubble, CopilotSuggestion, HybridQuestion), NFR-P1

**Scope :**

- Interface chat conversationnel
- Questions contextuelles adaptatives
- Suggestions basées sur profil entreprise
- Pré-remplissage sections depuis profil
- Accept/modify/reject suggestions
- Adaptation profondeur selon données connues
- Queue de questions (skip et retour)
- Suggestions sectorielles contextuelles

---

### Epic 6: Preview & Édition Document

**Objectif :** Les utilisateurs voient et éditent leur document de réponse en temps réel.

**Valeur Utilisateur :** Contrôle total sur le contenu final avec feedback visuel et édition inline.

**FRs couverts :** FR44, FR45, FR46, FR47, FR48, FR49, FR50

**Additional Requirements :** ARCH-5 (TipTap), UX-1 (3-column layout complete), UX-4 (DocumentPreview), NFR-P3

**Scope :**

- Preview temps réel du document
- Édition inline (WYSIWYG)
- Reformulation par IA sur demande
- Indicateurs complétion par section
- Indicateurs confiance IA
- Navigation sidebar sections
- Layout 3 colonnes complet

---

### Epic 7: Export & Préparation Soumission

**Objectif :** Les utilisateurs exportent leur dossier complet prêt à soumettre.

**Valeur Utilisateur :** Dossier conforme exporté en PDF/Word/ZIP avec structure standard.

**FRs couverts :** FR51, FR52, FR53, FR54, FR55, FR56, FR57

**Additional Requirements :** ARCH-3 (Inngest for generation), NFR-P4

**Scope :**

- Export PDF
- Export Word
- Export ZIP structuré
- Organisation dossiers (admin, technique, financier)
- Personnalisation export
- Validation conformité pré-export
- Checklist finale avec statuts

---

### Epic 8: Alertes & Intelligence Données

**Objectif :** Le système prévient proactivement les problèmes et suggère des optimisations basées sur les données.

**Valeur Utilisateur :** Zéro oubli de documents expirés, données toujours à jour, réutilisation intelligente.

**FRs couverts :** FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66

**Additional Requirements :** ARCH-7 (Resend), ARCH-3 (Inngest scheduled)

**Scope :**

- Alertes expiration documents
- Alertes documents expirés à date soumission
- Rappels deadlines AO
- Configuration préférences notifications
- Historique notifications
- Identification contenu réutilisable
- Suggestions références pertinentes
- Sauvegarde nouvelles infos vers profil
- Tracking fraîcheur données

---

## Epic Dependency Flow

```
Epic 0 (Foundation)
    │
    └──▶ Epic 1 (Auth & Compte)
              │
              └──▶ Epic 1.5 (Dashboard Shell & App Layout)  ← NEW
                        │
                        └──▶ Epic 2 (Profil & Coffre-fort)
                                  │
                                  └──▶ Epic 3 (Projet AO)
                                            │
                                            └──▶ Epic 4 (Parsing RC)
                                                      │
                                                      └──▶ Epic 5 (Chat IA)
                                                                │
                                                                └──▶ Epic 6 (Preview & Édition)
                                                                          │
                                                                          └──▶ Epic 7 (Export)
                                                                                    │
                                                                                    └──▶ Epic 8 (Alertes & Intelligence)
```

**Note :** Chaque epic est autonome et fonctionne indépendamment des epics suivants.

---

## Epic 0: Project Foundation — Stories

### Story 0.1: Initialisation Projet T3

As a **developer**,
I want **a bootstrapped Next.js project with tRPC, Drizzle, and Tailwind configured**,
So that **I can start building features on a solid, type-safe foundation**.

**Acceptance Criteria:**

**Given** a clean development environment with Node.js 20+ and pnpm installed
**When** I run the project initialization commands
**Then** the project is created with Next.js 15, TypeScript, tRPC, Drizzle, and Tailwind CSS
**And** I can run `pnpm dev` and see the default T3 homepage
**And** TypeScript strict mode is enabled with no compilation errors

---

### Story 0.2: Configuration shadcn/ui & Design System

As a **developer**,
I want **shadcn/ui initialized with the Professional Trust color theme**,
So that **all UI components follow a consistent design system**.

**Acceptance Criteria:**

**Given** the T3 project is initialized (Story 0.1)
**When** I run `npx shadcn@latest init` and configure the theme
**Then** shadcn/ui is installed with the default components available
**And** tailwind.config.ts includes the Professional Trust color palette (Blue #0066CC, Slate grays, Green accents)
**And** I can import and render a Button component with the correct styling

---

### Story 0.3: Configuration Base de Données Neon

As a **developer**,
I want **the Drizzle ORM connected to Neon PostgreSQL**,
So that **I can define and migrate database schemas**.

**Acceptance Criteria:**

**Given** a Neon PostgreSQL database is provisioned
**When** I configure the DATABASE_URL in .env.local
**Then** Drizzle can connect to the database
**And** I can run `pnpm db:push` to sync an empty schema
**And** I can access Drizzle Studio with `pnpm db:studio`

---

### Story 0.4: Configuration Services Cloud (Upstash, R2)

As a **developer**,
I want **Upstash Redis and Cloudflare R2 configured**,
So that **caching and file storage are ready for use**.

**Acceptance Criteria:**

**Given** Upstash Redis and Cloudflare R2 accounts are provisioned
**When** I add the environment variables (UPSTASH_REDIS_REST_URL, R2_ACCESS_KEY, etc.)
**Then** I can import and use the Redis client from `@/lib/redis`
**And** I can import and use the R2 client from `@/server/services/storage`
**And** basic connectivity tests pass

---

### Story 0.5: Setup Déploiement Vercel & CI/CD

As a **developer**,
I want **the project deployed to Vercel with CI/CD pipeline**,
So that **every push to main triggers automated tests and deployment**.

**Acceptance Criteria:**

**Given** the project is connected to a Git repository
**When** I push to the main branch
**Then** Vercel automatically builds and deploys the application
**And** preview deployments are created for pull requests
**And** environment variables are configured in Vercel dashboard

---

## Epic 1: Authentification & Gestion Compte — Stories

### Story 1.1: Inscription Utilisateur

As a **new user**,
I want **to create an account with my email and password**,
So that **I can access the platform and start preparing my tender responses**.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email and password (min 8 chars, 1 uppercase, 1 number)
**Then** my account is created and I receive a confirmation email
**And** I am redirected to the onboarding flow
**And** my password is stored hashed with bcrypt (cost ≥12)

**Given** I enter an email already registered
**When** I submit the registration form
**Then** I see an error message "This email is already registered"

---

### Story 1.2: Connexion Utilisateur

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my account and projects**.

**Acceptance Criteria:**

**Given** I have a registered account
**When** I enter my correct email and password
**Then** I am authenticated and redirected to the dashboard
**And** a secure session is created with JWT token

**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error message "Invalid email or password"
**And** after 5 failed attempts, the account is temporarily locked (15 minutes)

---

### Story 1.3: Réinitialisation Mot de Passe

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

**Acceptance Criteria:**

**Given** I am on the forgot password page
**When** I enter my registered email
**Then** I receive a password reset email with a secure link (valid 1 hour)

**Given** I click the reset link
**When** I enter a new valid password
**Then** my password is updated and I can log in with the new password
**And** all existing sessions are invalidated

---

### Story 1.4: Gestion Profil Utilisateur

As a **logged-in user**,
I want **to update my account information (name, email)**,
So that **my profile reflects accurate information**.

**Acceptance Criteria:**

**Given** I am on the account settings page
**When** I update my name
**Then** the change is saved and reflected immediately

**Given** I want to change my email
**When** I enter a new email address
**Then** a verification email is sent to the new address
**And** my email is updated only after clicking the verification link

---

### Story 1.5: Suppression Compte (RGPD)

As a **user**,
I want **to delete my account and all associated data**,
So that **I can exercise my RGPD right to erasure**.

**Acceptance Criteria:**

**Given** I am on the account settings page
**When** I click "Delete my account" and confirm
**Then** I see a confirmation dialog requiring password entry
**And** all my data (profile, documents, projects) is permanently deleted within 30 days
**And** I receive a confirmation email
**And** I am logged out and cannot log in again

---

### Story 1.6: Affichage Abonnement & Limites

As a **user**,
I want **to see my current subscription tier and usage limits**,
So that **I know what features I can access**.

**Acceptance Criteria:**

**Given** I am on the billing page
**When** the page loads
**Then** I see my current tier (Free, Pro, or Business)
**And** I see my usage (AO created, documents stored, etc.)
**And** I see the limits for my tier
**And** I see a comparison with other tiers

---

### Story 1.7: Upgrade/Downgrade Abonnement (Stripe)

As a **user**,
I want **to upgrade or downgrade my subscription**,
So that **I can access more features or reduce costs**.

**Acceptance Criteria:**

**Given** I am on the billing page
**When** I click "Upgrade to Pro" or "Upgrade to Business"
**Then** I am redirected to Stripe Checkout
**And** after successful payment, my tier is updated immediately
**And** I receive a confirmation email with invoice

**Given** I want to downgrade
**When** I select a lower tier
**Then** I see what features I will lose
**And** the change takes effect at the end of the billing period

---

## Epic 1.5: Dashboard Shell & App Layout — Stories

### Story 1.5.1: AppLayout Wrapper

As a **logged-in user**,
I want **a consistent application layout with sidebar and main content area**,
So that **I can navigate the application efficiently with a professional SaaS experience**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to any authenticated route
**When** the page loads
**Then** I see a layout with a fixed sidebar on the left (280px on desktop)
**And** a main content area that fills the remaining space
**And** the layout is responsive (sidebar collapses on smaller screens)

**Given** I am on mobile (< 768px)
**When** I view the application
**Then** the sidebar is hidden by default
**And** I can access navigation via a hamburger menu

**Technical Notes:**
- Create `components/layout/app-layout.tsx`
- Use CSS Grid or Flexbox for layout structure
- Implement with shadcn/ui Sheet component for mobile drawer

---

### Story 1.5.2: AppSidebar Navigation

As a **logged-in user**,
I want **a sidebar with clear navigation links and visual indicators**,
So that **I can quickly access different sections of the application**.

**Acceptance Criteria:**

**Given** I am viewing the sidebar
**When** I look at the navigation
**Then** I see the application logo at the top
**And** I see navigation links: Dashboard, Mes AO, Profil Entreprise, Documents, Paramètres
**And** each link has an icon and label
**And** the current page is highlighted

**Given** I click a navigation link
**When** the navigation completes
**Then** I am taken to the corresponding page
**And** the sidebar reflects the new active state

**Given** I am on a page within a section
**When** I view the sidebar
**Then** the parent section is highlighted
**And** I can see expandable sub-navigation if applicable

**Technical Notes:**
- Create `components/layout/app-sidebar.tsx`
- Use Lucide icons for navigation items
- Implement active state with `usePathname()` from next/navigation

---

### Story 1.5.3: UserDropdown Menu

As a **logged-in user**,
I want **a user dropdown menu in the sidebar**,
So that **I can access my profile, settings, and logout quickly**.

**Acceptance Criteria:**

**Given** I am viewing the sidebar
**When** I look at the bottom section
**Then** I see my avatar (or initials), name, and email
**And** I see a dropdown trigger (chevron or dots)

**Given** I click on my user section
**When** the dropdown opens
**Then** I see options: Mon profil, Paramètres, Thème (clair/sombre), Déconnexion
**And** each option has an appropriate icon

**Given** I click "Thème"
**When** I toggle the theme
**Then** the application switches between light and dark mode
**And** my preference is saved

**Given** I click "Déconnexion"
**When** I confirm
**Then** I am logged out and redirected to the login page

**Technical Notes:**
- Create `components/layout/user-dropdown.tsx`
- Use shadcn/ui DropdownMenu component
- Integrate with next-themes for theme switching
- Use signOut from next-auth for logout

---

### Story 1.5.4: Dashboard Page

As a **logged-in user**,
I want **a dashboard showing my key metrics and quick actions**,
So that **I have an overview of my activity and can start tasks quickly**.

**Acceptance Criteria:**

**Given** I navigate to /dashboard
**When** the page loads
**Then** I see a welcome message with my name
**And** I see key metrics cards: AO en cours, Documents stockés, Profil complétude
**And** I see quick action buttons: Nouvel AO, Ajouter document

**Given** I have active tender projects
**When** I view the dashboard
**Then** I see a list of my recent/active projects with status
**And** I can click to navigate to each project

**Given** I am a new user with no projects
**When** I view the dashboard
**Then** I see an empty state with onboarding guidance
**And** I see a prominent CTA to create my first AO

**Technical Notes:**
- Update `app/(auth)/dashboard/page.tsx`
- Create metric cards using shadcn/ui Card component
- Implement quick actions with Button components

---

### Story 1.5.5: Mobile Responsive Drawer

As a **mobile user**,
I want **the sidebar to be accessible via a drawer on smaller screens**,
So that **I can navigate the app comfortably on my phone or tablet**.

**Acceptance Criteria:**

**Given** I am on a screen < 1024px
**When** I view the application
**Then** the sidebar is hidden
**And** I see a hamburger menu icon in the header area

**Given** I tap the hamburger menu
**When** the drawer opens
**Then** I see the full sidebar content sliding in from the left
**And** I see an overlay behind the drawer

**Given** the drawer is open
**When** I tap outside the drawer or press Escape
**Then** the drawer closes smoothly

**Given** I navigate to a new page via the drawer
**When** the navigation completes
**Then** the drawer closes automatically

**Technical Notes:**
- Use shadcn/ui Sheet component for the drawer
- Implement with `useSidebar` context for state management
- Add touch gestures support (swipe to close)

---

### Story 1.5.6: AppHeader avec Breadcrumb

As a **logged-in user**,
I want **a contextual header with breadcrumb navigation**,
So that **I know where I am and can navigate back easily**.

**Acceptance Criteria:**

**Given** I am on a nested page (e.g., /dashboard/projects/123)
**When** I view the header
**Then** I see a breadcrumb showing: Dashboard > Mes AO > Nom du projet
**And** each breadcrumb segment is clickable (except current)

**Given** I am on mobile
**When** I view the header
**Then** I see the hamburger menu trigger on the left
**And** I see a simplified breadcrumb (current page only or truncated)

**Given** the page has contextual actions
**When** I view the header
**Then** I see action buttons on the right side (e.g., "Exporter", "Paramètres")

**Technical Notes:**
- Create `components/layout/app-header.tsx`
- Use shadcn/ui Breadcrumb component
- Implement with dynamic route parsing

---

## Epic 2: Profil Entreprise & Coffre-fort Documents — Stories

### Story 2.1: Création Profil Entreprise de Base

As a **user**,
I want **to create my company profile with basic information (name, SIRET, address)**,
So that **my company identity is established for all future tenders**.

**Acceptance Criteria:**

**Given** I am logged in and on the company profile page
**When** I fill in company name, SIRET, address, and contact info
**Then** my company profile is created and saved
**And** I see a confirmation message
**And** the profile completeness score updates accordingly

---

### Story 2.2: Gestion Informations Légales

As a **user**,
I want **to add and manage my company's legal information (Kbis, capital, NAF code)**,
So that **I have all administrative data ready for tenders**.

**Acceptance Criteria:**

**Given** I have a company profile
**When** I add legal information (capital social, code NAF, date création, forme juridique)
**Then** the information is saved and displayed in my profile
**And** I can upload a Kbis extract document
**And** the profile completeness score updates

---

### Story 2.3: Gestion Données Financières

As a **user**,
I want **to add and manage financial data (CA, effectifs, bilans)**,
So that **I can demonstrate my company's financial health in tenders**.

**Acceptance Criteria:**

**Given** I have a company profile
**When** I add financial data for the last 3 years (CA, résultat, effectif)
**Then** the data is saved with year associations
**And** I can update or correct past entries
**And** the system flags data older than 1 year as potentially stale

---

### Story 2.4: Gestion Certifications & Qualifications

As a **user**,
I want **to add and manage my certifications and qualifications**,
So that **I can prove my expertise and compliance**.

**Acceptance Criteria:**

**Given** I have a company profile
**When** I add a certification (name, issuer, date obtained, expiry date)
**Then** the certification is saved with its expiration date
**And** I can upload the certificate document
**And** certifications nearing expiry are highlighted

---

### Story 2.5: Gestion Équipe & Compétences

As a **user**,
I want **to add team members with their CVs and competencies**,
So that **I can showcase my team's expertise in tenders**.

**Acceptance Criteria:**

**Given** I have a company profile
**When** I add a team member (name, role, experience, skills)
**Then** the team member is saved to my profile
**And** I can upload their CV document
**And** I can list their key competencies and years of experience

---

### Story 2.6: Gestion Références Projets

As a **user**,
I want **to add and manage project references**,
So that **I can demonstrate past experience relevant to new tenders**.

**Acceptance Criteria:**

**Given** I have a company profile
**When** I add a reference (project name, client, sector, amount, dates, description)
**Then** the reference is saved with all details
**And** I can tag references by sector (BTP, IT, Conseil, etc.)
**And** I can mark references as "highlight" for priority display

---

### Story 2.7: Score Complétude Profil

As a **user**,
I want **to see my profile completeness score and suggestions**,
So that **I know what information is missing**.

**Acceptance Criteria:**

**Given** I am on my company profile page
**When** I view the completeness gauge
**Then** I see a percentage score (0-100%)
**And** I see a list of missing or incomplete sections
**And** clicking a suggestion takes me to that section

---

### Story 2.8: Upload Documents Coffre-fort

As a **user**,
I want **to upload documents to my secure vault**,
So that **I can reuse them across multiple tenders**.

**Acceptance Criteria:**

**Given** I am on the document vault page
**When** I upload a document (PDF, Word, or image)
**Then** the document is stored securely in R2 storage
**And** I can see the document in my vault list
**And** I see upload progress and confirmation

**Given** I try to upload an unsupported file type
**When** I select the file
**Then** I see an error message listing accepted formats

---

### Story 2.9: Catégorisation Documents

As a **user**,
I want **to categorize my vault documents by type**,
So that **I can find them easily when needed**.

**Acceptance Criteria:**

**Given** I have documents in my vault
**When** I assign a category (Kbis, Attestation URSSAF, Certificat, CV, etc.)
**Then** the document is tagged with that category
**And** I can filter the vault by category
**And** I can change a document's category later

---

### Story 2.10: Dates Expiration Documents

As a **user**,
I want **to set expiration dates on my documents**,
So that **I am alerted before they become invalid**.

**Acceptance Criteria:**

**Given** I have a document in my vault
**When** I set an expiration date
**Then** the date is saved and displayed on the document
**And** documents expiring within 30 days are highlighted in orange
**And** expired documents are highlighted in red

---

### Story 2.11: Détection Auto Date Expiration

As a **user**,
I want **the system to detect expiration dates from document content**,
So that **I don't have to enter them manually**.

**Acceptance Criteria:**

**Given** I upload an administrative document (attestation, certificat)
**When** the upload completes
**Then** the system attempts to extract the expiration date using OCR/AI
**And** if found, it suggests the date for confirmation
**And** I can accept, modify, or reject the suggestion

---

### Story 2.12: Consultation & Téléchargement Documents

As a **user**,
I want **to view and download my vault documents**,
So that **I can access them when needed**.

**Acceptance Criteria:**

**Given** I have documents in my vault
**When** I click on a document
**Then** I see a preview (for PDF/images)
**And** I can download the original file
**And** I can see document metadata (upload date, size, category)

---

### Story 2.13: Suppression Documents

As a **user**,
I want **to delete documents from my vault**,
So that **I can remove outdated or incorrect files**.

**Acceptance Criteria:**

**Given** I have a document in my vault
**When** I click delete and confirm
**Then** the document is permanently removed
**And** any references to it in tenders show "Document deleted"

---

### Story 2.14: Recherche Documents

As a **user**,
I want **to search documents in my vault by name and category**,
So that **I can quickly find what I need**.

**Acceptance Criteria:**

**Given** I have multiple documents in my vault
**When** I type in the search box
**Then** documents matching the name are displayed
**And** I can combine search with category filter
**And** results update as I type (debounced)

---

## Epic 3: Création Projet AO — Stories

### Story 3.1: Création Nouveau Projet AO

As a **user**,
I want **to create a new tender project**,
So that **I can start preparing my response to a specific call for tender**.

**Acceptance Criteria:**

**Given** I am on the dashboard or tenders list
**When** I click "Nouveau projet AO"
**Then** a new project is created with a default name
**And** I am redirected to the project workspace
**And** the project appears in my tenders list with status "Brouillon"

---

### Story 3.2: Upload Règlement de Consultation (RC)

As a **user**,
I want **to upload the tender regulation document (RC) in PDF format**,
So that **the system can analyze requirements for this tender**.

**Acceptance Criteria:**

**Given** I am in a tender project workspace
**When** I upload a PDF file as the RC
**Then** the file is stored and associated with the project
**And** I see a preview of the uploaded document
**And** the parsing process is triggered (Epic 4)

**Given** I upload a non-PDF file
**When** the upload is attempted
**Then** I see an error message "Seuls les fichiers PDF sont acceptés"

---

### Story 3.3: Définition Deadline Soumission

As a **user**,
I want **to set the submission deadline for my tender**,
So that **I can track time remaining and receive reminders**.

**Acceptance Criteria:**

**Given** I am in a tender project
**When** I set the submission deadline (date and time)
**Then** the deadline is saved and displayed prominently
**And** I see a countdown to the deadline
**And** the system will send reminders based on this date

---

### Story 3.4: Liste des Projets AO avec Statuts

As a **user**,
I want **to view all my tender projects with their status**,
So that **I can track progress across multiple tenders**.

**Acceptance Criteria:**

**Given** I have multiple tender projects
**When** I go to the tenders list page
**Then** I see all my projects sorted by deadline (soonest first)
**And** each project shows: name, client, deadline, status, completion %
**And** I can filter by status (Brouillon, En cours, Soumis, Archivé)

---

### Story 3.5: Archivage Projet Terminé

As a **user**,
I want **to archive completed tender projects**,
So that **my active list stays clean while preserving history**.

**Acceptance Criteria:**

**Given** I have a tender project that is submitted or expired
**When** I click "Archiver"
**Then** the project moves to the archived section
**And** it no longer appears in the active tenders list
**And** I can still access it from the archives

---

### Story 3.6: Duplication Projet comme Template

As a **user**,
I want **to duplicate an existing project as a template**,
So that **I can reuse my work for similar tenders**.

**Acceptance Criteria:**

**Given** I have an existing tender project
**When** I click "Dupliquer"
**Then** a new project is created with copied content
**And** the new project has a modified name (e.g., "Copie de [original]")
**And** project-specific data (RC, deadline) is cleared
**And** reusable content (methodology, team) is preserved

---

### Story 3.7: Suppression Projet AO

As a **user**,
I want **to delete a tender project**,
So that **I can remove projects I no longer need**.

**Acceptance Criteria:**

**Given** I have a tender project
**When** I click "Supprimer" and confirm
**Then** the project and all associated data are permanently deleted
**And** the project no longer appears in any list
**And** I see a confirmation message

**Given** the project has submitted status
**When** I try to delete
**Then** I see a warning that this action is irreversible

---

## Epic 4: Parsing RC & Checklist Conformité — Stories

### Story 4.1: Parsing Automatique du RC

As a **user**,
I want **the system to automatically parse my uploaded RC document**,
So that **I don't have to manually read 100+ pages to find requirements**.

**Acceptance Criteria:**

**Given** I have uploaded a RC document to my tender project
**When** the parsing job starts (via Inngest)
**Then** I see a progress indicator showing parsing status
**And** the parsing completes within 30 seconds for documents <50 pages
**And** the parsing completes within 90 seconds for documents 50-200 pages
**And** I receive a notification when parsing is complete

**Given** parsing fails
**When** an error occurs
**Then** I see a clear error message explaining the issue
**And** I can retry the parsing

---

### Story 4.2: Extraction Liste Documents Requis

As a **user**,
I want **the system to extract the list of required documents from the RC**,
So that **I have a clear checklist of what to prepare**.

**Acceptance Criteria:**

**Given** the RC has been parsed
**When** I view the results
**Then** I see a list of all required documents extracted from the RC
**And** each item shows the document name and source reference (page number)
**And** the list includes both mandatory and optional documents (clearly labeled)

---

### Story 4.3: Catégorisation des Requirements

As a **user**,
I want **extracted requirements categorized by type**,
So that **I can focus on one category at a time**.

**Acceptance Criteria:**

**Given** the RC has been parsed with requirements extracted
**When** I view the checklist
**Then** requirements are grouped into categories: Administratif, Technique, Financier
**And** I can expand/collapse each category
**And** I see a count of items per category

---

### Story 4.4: Identification Format Soumission

As a **user**,
I want **the system to identify the submission format requirements**,
So that **I know how to submit my response (PDF, paper, platform)**.

**Acceptance Criteria:**

**Given** the RC has been parsed
**When** I view the project details
**Then** I see the identified submission format (PDF, papier, plateforme dématérialisée)
**And** I see any specific platform mentioned (PLACE, AWS, etc.)
**And** I see format requirements (max file size, naming convention)

---

### Story 4.5: Extraction Deadline depuis RC

As a **user**,
I want **the system to automatically extract the submission deadline from the RC**,
So that **I don't miss the date**.

**Acceptance Criteria:**

**Given** the RC has been parsed
**When** a deadline is found in the document
**Then** the deadline is suggested for the project
**And** I can confirm, modify, or reject the suggested date
**And** if confirmed, the project deadline is automatically set

---

### Story 4.6: Affichage Checklist Structurée

As a **user**,
I want **to view the parsed requirements as a structured checklist**,
So that **I can track my progress on each item**.

**Acceptance Criteria:**

**Given** the RC has been parsed
**When** I view the checklist in the project
**Then** I see each requirement as a ModuleCard component
**And** each card shows: requirement name, category, status (todo/in progress/done)
**And** I see an overall completion percentage
**And** cards are visually distinct by status (color-coded)

---

### Story 4.7: Édition Manuelle Checklist

As a **user**,
I want **to manually add, edit, or remove items from the parsed checklist**,
So that **I can correct parsing errors or add missed requirements**.

**Acceptance Criteria:**

**Given** I have a parsed checklist
**When** I click "Add item"
**Then** I can add a new requirement with name and category

**Given** I have an existing item
**When** I click edit
**Then** I can modify the requirement name and category
**And** I can delete the item with confirmation

---

### Story 4.8: Marquage Items Complétés

As a **user**,
I want **to mark checklist items as complete**,
So that **I can track my progress**.

**Acceptance Criteria:**

**Given** I have a checklist with items
**When** I click the checkbox on an item
**Then** the item is marked as complete
**And** the overall completion percentage updates
**And** I can uncheck to mark as incomplete

**Given** I link a vault document to an item
**When** I complete the link
**Then** the item is automatically marked as complete

---

## Epic 5: Assistant IA Co-Pilote (FR36-FR43)

### Story 5.1: Interface Chat Conversationnelle

As a **user**,
I want **to interact with the AI assistant through a chat interface**,
So that **I can get help writing my tender response naturally**.

**Acceptance Criteria:**

**Given** I am in a project workspace
**When** I open the AI panel (right column)
**Then** I see a chat interface with message history
**And** I see a text input field at the bottom
**And** I can type questions or requests

**Given** I send a message
**When** the AI processes my request
**Then** I see the response streaming in real-time (SSE)
**And** the conversation history is preserved

**FRs:** FR36

---

### Story 5.2: Questions Contextuelles IA

As a **user**,
I want **the AI to ask me contextual questions about my response**,
So that **I can provide relevant information for the tender**.

**Acceptance Criteria:**

**Given** I am working on a project
**When** I open the AI assistant
**Then** the AI analyzes the RC requirements and my current progress
**And** suggests relevant questions to help me complete the response

**Given** the AI asks a question
**When** I provide an answer
**Then** the AI uses my answer to suggest content
**And** the next question is contextually relevant

**FRs:** FR37

---

### Story 5.3: Suggestions Basées sur Profil Entreprise

As a **user**,
I want **the AI to suggest content based on my company profile**,
So that **I can reuse my existing information efficiently**.

**Acceptance Criteria:**

**Given** my company profile has competencies, references, and certifications
**When** the AI generates suggestions
**Then** it incorporates relevant profile data (experience, team, equipment)
**And** suggestions are personalized to my company's strengths

**Given** the AI suggests content from my profile
**When** I view the suggestion
**Then** I see which profile elements were used
**And** I can click to view the source in my vault

**FRs:** FR38

---

### Story 5.4: Pré-remplissage Sections depuis Profil

As a **user**,
I want **sections to be pre-filled with data from my profile**,
So that **I save time on repetitive information**.

**Acceptance Criteria:**

**Given** I start a new response section
**When** the section matches a profile category (moyens humains, références, etc.)
**Then** the AI offers to pre-fill with matching profile data

**Given** I accept pre-fill
**When** the content is inserted
**Then** text is adapted to the tender context
**And** I can review and edit before finalizing

**FRs:** FR39

---

### Story 5.5: Accepter/Modifier/Refuser Suggestions

As a **user**,
I want **to accept, modify, or reject AI suggestions**,
So that **I maintain control over my response content**.

**Acceptance Criteria:**

**Given** the AI provides a suggestion
**When** I view it
**Then** I see three action buttons: Accept, Modify, Reject

**Given** I click "Accept"
**When** the action completes
**Then** the suggestion is inserted into my response as-is

**Given** I click "Modify"
**When** the edit modal opens
**Then** I can edit the text before inserting
**And** I can cancel to return to the suggestion

**Given** I click "Reject"
**When** the action completes
**Then** the suggestion is dismissed
**And** the AI can offer an alternative

**FRs:** FR40

---

### Story 5.6: Profondeur Questions Adaptive

As a **user**,
I want **the AI to adapt question depth based on my expertise**,
So that **experts aren't bothered with basic questions**.

**Acceptance Criteria:**

**Given** I am answering AI questions
**When** I provide detailed answers quickly
**Then** the AI recognizes my expertise level
**And** subsequent questions are more specific/advanced

**Given** I struggle with a question
**When** I ask for clarification
**Then** the AI provides more context and simpler sub-questions

**FRs:** FR41

---

### Story 5.7: File d'Attente Questions

As a **user**,
I want **to skip questions and return to them later**,
So that **I can answer in my preferred order**.

**Acceptance Criteria:**

**Given** the AI asks me a question
**When** I click "Skip" or "Later"
**Then** the question is added to a pending queue
**And** the AI moves to the next question

**Given** I have skipped questions
**When** I view the question queue panel
**Then** I see all pending questions listed
**And** I can click any question to answer it

**Given** I complete all immediate questions
**When** the AI has no more questions
**Then** it reminds me of pending skipped questions

**FRs:** FR42

---

### Story 5.8: Suggestions Spécifiques par Secteur

As a **user**,
I want **AI suggestions tailored to my industry sector**,
So that **recommendations are relevant to my domain**.

**Acceptance Criteria:**

**Given** my company profile specifies a sector (BTP, IT, Services, etc.)
**When** the AI generates suggestions
**Then** terminology and examples are sector-appropriate
**And** suggestions reference industry-specific standards/certifications

**Given** a tender is in my sector
**When** the AI analyzes requirements
**Then** it highlights sector-specific expectations
**And** suggests relevant past references from my vault

**FRs:** FR43

---

## Epic 6: Preview & Édition Document (FR44-FR50)

### Story 6.1: Éditeur Riche TipTap

As a **user**,
I want **to write and format my response in a rich text editor**,
So that **I can create professional-looking documents**.

**Acceptance Criteria:**

**Given** I am editing a response section
**When** I view the editor
**Then** I see a TipTap-based rich text editor
**And** I can format text (bold, italic, underline, headings)
**And** I can create lists (bulleted, numbered)
**And** I can insert tables

**Given** I type in the editor
**When** my content changes
**Then** changes are auto-saved (debounced 2 seconds)

**FRs:** FR44

---

### Story 6.2: Preview PDF Temps Réel

As a **user**,
I want **to preview my response as a PDF in real-time**,
So that **I can see how it will look when submitted**.

**Acceptance Criteria:**

**Given** I am editing my response
**When** I toggle the preview mode
**Then** I see a PDF-like preview of my document
**And** the preview updates as I type (debounced)

**Given** I am viewing the preview
**When** I make changes in the editor
**Then** the preview reflects changes within 2 seconds

**FRs:** FR45

---

### Story 6.3: Structure Documents Configurable

As a **user**,
I want **to configure the structure of my response document**,
So that **I can organize sections as required by the tender**.

**Acceptance Criteria:**

**Given** I am in a project
**When** I access document structure settings
**Then** I see a list of sections in my document

**Given** I have multiple sections
**When** I drag-and-drop sections
**Then** the order is updated
**And** the preview reflects the new order

**Given** I need a new section
**When** I click "Add section"
**Then** I can create a new section with a title
**And** the section appears in my document structure

**FRs:** FR46

---

### Story 6.4: Insertion Images et Tableaux

As a **user**,
I want **to insert images and tables into my response**,
So that **I can include visual content and data**.

**Acceptance Criteria:**

**Given** I am in the editor
**When** I click "Insert image"
**Then** I can upload an image or select from vault
**And** the image is inserted at cursor position
**And** I can resize the image

**Given** I am in the editor
**When** I click "Insert table"
**Then** I can specify rows and columns
**And** a table is created at cursor position
**And** I can edit cell contents and add/remove rows/columns

**FRs:** FR47

---

### Story 6.5: Annotations et Commentaires

As a **user**,
I want **to add annotations and comments to my document**,
So that **I can mark areas for review or remember notes**.

**Acceptance Criteria:**

**Given** I am in the editor
**When** I select text and click "Add comment"
**Then** a comment is attached to the selected text
**And** the text is highlighted

**Given** I have comments in my document
**When** I view the comments panel
**Then** I see all comments listed with their context
**And** I can click a comment to navigate to its location

**Given** I resolve a comment
**When** I click "Resolve"
**Then** the comment is hidden but not deleted
**And** I can view resolved comments if needed

**FRs:** FR48

---

### Story 6.6: Gestion Versions Document

As a **user**,
I want **to view and restore previous versions of my document**,
So that **I can recover from mistakes**.

**Acceptance Criteria:**

**Given** I am working on a document
**When** I access version history
**Then** I see a list of saved versions with timestamps

**Given** I view a previous version
**When** I click on it
**Then** I see a read-only preview of that version
**And** I can compare with current version

**Given** I want to restore a version
**When** I click "Restore"
**Then** the document reverts to that version
**And** a new version is created (current becomes history)

**FRs:** FR49

---

### Story 6.7: Éditeur Plein Écran

As a **user**,
I want **to expand the editor to full screen**,
So that **I can focus on writing without distractions**.

**Acceptance Criteria:**

**Given** I am in the editor
**When** I click "Full screen" or press Escape (toggle)
**Then** the editor expands to fill the entire screen
**And** sidebars and navigation are hidden

**Given** I am in full screen mode
**When** I press Escape or click "Exit full screen"
**Then** I return to the normal 3-column layout
**And** my cursor position is preserved

**FRs:** FR50

---

## Epic 7: Export & Préparation Soumission (FR51-FR57)

### Story 7.1: Export PDF Professionnel

As a **user**,
I want **to export my response as a professional PDF**,
So that **I can submit a polished document**.

**Acceptance Criteria:**

**Given** I have completed my response
**When** I click "Export PDF"
**Then** a PDF is generated with proper formatting
**And** fonts, images, and tables are preserved
**And** the PDF is downloadable

**Given** the PDF is being generated
**When** I wait
**Then** I see a progress indicator
**And** I'm notified when the PDF is ready

**FRs:** FR51

---

### Story 7.2: Export Word/DOCX

As a **user**,
I want **to export my response as a Word document**,
So that **I can make final edits or submit in DOCX format**.

**Acceptance Criteria:**

**Given** I have completed my response
**When** I click "Export DOCX"
**Then** a Word document is generated
**And** formatting is preserved (styles, tables, images)
**And** the file is downloadable

**Given** the tender requires DOCX format
**When** I export
**Then** the document meets Word format standards

**FRs:** FR52

---

### Story 7.3: Page de Garde Automatique

As a **user**,
I want **a professional cover page generated automatically**,
So that **my submission looks polished**.

**Acceptance Criteria:**

**Given** I export my response
**When** the document is generated
**Then** a cover page is automatically added
**And** it includes: company logo, tender name, submission date, company info

**Given** I want to customize the cover page
**When** I access cover page settings
**Then** I can choose a template or customize elements
**And** changes are reflected in exports

**FRs:** FR53

---

### Story 7.4: Sommaire et Numérotation Automatiques

As a **user**,
I want **automatic table of contents and page numbering**,
So that **my document is easy to navigate**.

**Acceptance Criteria:**

**Given** I export my response
**When** the PDF/DOCX is generated
**Then** a table of contents is automatically created
**And** page numbers are added to all pages
**And** section headings link to their pages

**Given** I modify my document structure
**When** I re-export
**Then** the table of contents updates automatically

**FRs:** FR54

---

### Story 7.5: Checklist Pré-Soumission

As a **user**,
I want **a pre-submission checklist**,
So that **I don't forget required documents or steps**.

**Acceptance Criteria:**

**Given** I am preparing to submit
**When** I open the submission checklist
**Then** I see all required items from the RC
**And** items are marked complete/incomplete based on my progress

**Given** items are incomplete
**When** I view the checklist
**Then** I see what's missing
**And** I can navigate to complete each item

**Given** all items are complete
**When** I view the checklist
**Then** I see a "Ready to submit" confirmation

**FRs:** FR55

---

### Story 7.6: Archive ZIP Complète

As a **user**,
I want **to download all submission documents as a ZIP**,
So that **I can easily upload to submission platforms**.

**Acceptance Criteria:**

**Given** I am ready to submit
**When** I click "Download ZIP"
**Then** a ZIP file is created with all required documents
**And** files are named according to RC requirements (if specified)

**Given** the ZIP is generated
**When** I download it
**Then** it contains: response PDF, annexes, required documents
**And** folder structure matches submission requirements

**FRs:** FR56

---

### Story 7.7: Instructions Soumission Contextuelles

As a **user**,
I want **platform-specific submission instructions**,
So that **I know exactly how to submit on each platform**.

**Acceptance Criteria:**

**Given** the RC specifies a submission platform (PLACE, AWS, etc.)
**When** I view submission instructions
**Then** I see step-by-step guidance for that platform
**And** I see deadline reminders and time zone info

**Given** the submission is physical (paper)
**When** I view instructions
**Then** I see mailing address and packaging requirements
**And** I see recommended shipping methods

**FRs:** FR57

---

## Epic 8: Alertes & Intelligence Données (FR58-FR66)

### Story 8.1: Création Alertes Personnalisées

As a **user**,
I want **to create custom alerts for new tenders**,
So that **I'm notified when relevant opportunities appear**.

**Acceptance Criteria:**

**Given** I am in the alerts settings
**When** I click "Create alert"
**Then** I can define criteria: keywords, sectors, regions, budget range

**Given** I save an alert
**When** new tenders match my criteria
**Then** I receive a notification
**And** the alert is stored in my settings

**FRs:** FR58

---

### Story 8.2: Notifications Email Configurables

As a **user**,
I want **to configure email notifications**,
So that **I receive alerts in my preferred format**.

**Acceptance Criteria:**

**Given** I have alerts configured
**When** I access notification settings
**Then** I can choose frequency: instant, daily digest, weekly digest

**Given** I set daily digest
**When** matching tenders are found during the day
**Then** I receive one email summarizing all matches

**Given** I want to disable emails
**When** I toggle off email notifications
**Then** I only see alerts in-app

**FRs:** FR59

---

### Story 8.3: Centre de Notifications In-App

As a **user**,
I want **a notification center in the application**,
So that **I can see all alerts and updates in one place**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the notification bell
**Then** I see a dropdown with recent notifications
**And** unread notifications are highlighted

**Given** I have notifications
**When** I click one
**Then** I'm taken to the relevant page (tender, project, etc.)
**And** the notification is marked as read

**FRs:** FR60

---

### Story 8.4: Rappels Deadline

As a **user**,
I want **automatic reminders before deadlines**,
So that **I never miss a submission date**.

**Acceptance Criteria:**

**Given** I have a project with a deadline
**When** the deadline approaches
**Then** I receive reminders at configurable intervals (7 days, 3 days, 1 day)

**Given** I receive a reminder
**When** I view it
**Then** I see project name, deadline date/time, and completion status
**And** I can navigate directly to the project

**FRs:** FR61

---

### Story 8.5: Tableau de Bord Statistiques

As a **user**,
I want **a dashboard showing my tender statistics**,
So that **I can track my success rate and activity**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I view statistics
**Then** I see: total projects, completed, won, lost, pending
**And** I see success rate percentage
**And** I see activity trend over time (chart)

**Given** I have historical data
**When** I filter by date range
**Then** statistics update to reflect the selected period

**FRs:** FR62

---

### Story 8.6: Analyse Performance par Secteur

As a **user**,
I want **to see my performance broken down by sector**,
So that **I can identify my strongest markets**.

**Acceptance Criteria:**

**Given** I have completed projects in multiple sectors
**When** I view sector analysis
**Then** I see success rate per sector
**And** I see number of projects per sector
**And** sectors are ranked by performance

**Given** I click on a sector
**When** the detail view opens
**Then** I see all projects in that sector
**And** I can filter by status (won, lost, pending)

**FRs:** FR63

---

### Story 8.7: Historique Appels d'Offres

As a **user**,
I want **to access my tender history**,
So that **I can reference past projects**.

**Acceptance Criteria:**

**Given** I am in the history section
**When** I view the list
**Then** I see all past projects with: name, date, status, outcome
**And** I can search and filter by keywords, date, status

**Given** I click on a historical project
**When** the detail view opens
**Then** I can view all documents and responses
**And** I can clone the project as a template

**FRs:** FR64

---

### Story 8.8: Export Données Analytics

As a **user**,
I want **to export my analytics data**,
So that **I can create custom reports or use in other tools**.

**Acceptance Criteria:**

**Given** I am viewing statistics
**When** I click "Export"
**Then** I can choose format: CSV, Excel

**Given** I select a format
**When** the export completes
**Then** the file contains all visible statistics
**And** I can download the file

**FRs:** FR65

---

### Story 8.9: Suggestions Amélioration

As a **user**,
I want **the system to suggest ways to improve my success rate**,
So that **I can become more competitive**.

**Acceptance Criteria:**

**Given** I have a history of projects
**When** I view the suggestions panel
**Then** I see AI-generated insights based on my data
**And** suggestions are specific (e.g., "Your references section is often incomplete")

**Given** I have lost projects
**When** I marked reasons (if known)
**Then** suggestions incorporate that feedback
**And** I see patterns in unsuccessful bids

**FRs:** FR66

---

## Résumé Complet

### Statistiques

| Epic      | Nom                                  | FRs Couverts   | Stories        |
| --------- | ------------------------------------ | -------------- | -------------- |
| 0         | Foundation Projet                    | Infrastructure | 5              |
| 1         | Authentification & Compte            | FR1-FR7        | 7              |
| **1.5**   | **Dashboard Shell & App Layout**     | **UX-1, NFR-A2** | **6**        |
| 2         | Profil Entreprise & Coffre Documents | FR8-FR21       | 14             |
| 3         | Gestion Projets Appels d'Offres      | FR22-FR28      | 7              |
| 4         | Parsing RC & Checklist               | FR29-FR35      | 8              |
| 5         | Assistant IA Co-Pilote               | FR36-FR43      | 8              |
| 6         | Preview & Édition Document           | FR44-FR50      | 7              |
| 7         | Export & Préparation Soumission      | FR51-FR57      | 7              |
| 8         | Alertes & Intelligence Données       | FR58-FR66      | 9              |
| **Total** |                                      | **66 FRs**     | **78 Stories** |

### Couverture

- **66/66 FRs** couverts (100%)
- **24 NFRs** intégrés dans les critères d'acceptation
- **15+ exigences additionnelles** de l'Architecture et UX intégrées
- **Epic 1.5** ajouté pour le Dashboard Shell (UX-1: 3-column layout)

### Prochaines Étapes

1. ~~Validation finale de la couverture FR~~
2. ~~Approbation des epics et stories~~
3. **Implémentation Epic 1.5** — Dashboard Shell & App Layout
4. Continuation Epic 2+ après validation Epic 1.5
