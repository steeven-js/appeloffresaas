# Attentes en Données pour l'Assistant IA

Ce document décrit les informations attendues par l'IA pour chaque module du dossier de demande. L'assistant IA utilise ces données pour générer du contenu pertinent, poser des questions ciblées et fournir des suggestions d'amélioration.

---

## Vue d'ensemble

L'assistant IA est un expert en rédaction de dossiers de demande pour les marchés publics français. Il aide le CHEF (chef de service) à formaliser son besoin pour transmission à l'Administration.

### Rôles de l'IA :
1. Poser des questions pour comprendre le besoin
2. Aider à structurer et reformuler les réponses de manière professionnelle
3. Suggérer les éléments manquants ou imprécis
4. Guider vers un document complet et bien rédigé

---

## 1. Module Identité & Contact

### Champs attendus

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `title` | string | Oui | Titre/objet du projet de demande |
| `reference` | string | Non | Référence interne (auto-générée: DEM-YYYY-NNN) |
| `departmentName` | string | Oui | Nom du service demandeur |
| `contactName` | string | Oui | Nom du contact/responsable |
| `contactEmail` | string | Oui | Email du contact |

### Utilisation par l'IA
- Personnalise le message d'accueil
- Adapte le ton des réponses au contexte du service
- Vérifie la cohérence des informations

### Exemple de données
```json
{
  "title": "Acquisition de matériel informatique pour le service RH",
  "reference": "DEM-2026-001",
  "departmentName": "Direction des Ressources Humaines",
  "contactName": "Marie Dupont",
  "contactEmail": "marie.dupont@example.fr"
}
```

---

## 2. Module Définition du Besoin

### Champs attendus

| Champ | Type | Valeurs possibles | Description |
|-------|------|-------------------|-------------|
| `needType` | enum | `fourniture`, `service`, `travaux`, `formation`, `logiciel`, `maintenance`, `autre` | Type de besoin |
| `urgencyLevel` | enum | `low`, `medium`, `high`, `critical` | Niveau d'urgence |
| `urgencyJustification` | string | - | Justification si urgence haute/critique |

### Utilisation par l'IA
- **Sélection du template** : Chaque type de besoin charge un template adapté avec des placeholders spécifiques
- **Génération de contenu** : Les prompts sont adaptés au type de besoin
- **Critères d'évaluation** : Les critères suggérés dépendent du type

### Templates par type de besoin

#### Fourniture / Équipement (`fourniture`)
```
Contexte attendu :
- Contexte d'achat et destination
- Équipement actuel à remplacer/compléter
- Objectifs de l'acquisition

Description attendue :
- Spécifications techniques par article
- Conditionnement et accessoires
- Quantités précises

Contraintes attendues :
- Délais et modalités de livraison
- Exigences d'installation
- Garanties et normes requises
```

#### Prestation de service (`service`)
```
Contexte attendu :
- Contexte de la mission
- Enjeux et organisation actuelle
- Périmètre d'intervention

Description attendue :
- Phases et activités
- Livrables attendus
- Profils d'intervenants
- Gouvernance

Contraintes attendues :
- Modalités d'exécution
- Confidentialité
- Propriété intellectuelle
- Références requises
```

#### Travaux / Construction (`travaux`)
```
Contexte attendu :
- Description du site
- État actuel des lieux
- Objectifs des travaux
- Occupation pendant les travaux

Description attendue :
- Nature des travaux par lot
- Plans et documents techniques
- Rôles de coordination

Contraintes attendues :
- Autorisations administratives
- Contraintes techniques du site
- Sécurité et assurances
```

#### Formation (`formation`)
```
Contexte attendu :
- Pourquoi cette formation
- Public cible (profils, nombre)
- Objectifs pédagogiques

Description attendue :
- Programme et modules
- Méthodes pédagogiques
- Certification visée

Contraintes attendues :
- Contraintes organisationnelles
- Logistique (lieu, matériel)
- Exigences formateur
- Qualité et évaluation
```

#### Logiciel / Licence (`logiciel`)
```
Contexte attendu :
- Environnement IT actuel
- Limites des systèmes existants
- Objectifs de la solution
- Profils utilisateurs cibles

Description attendue :
- Fonctionnalités principales et secondaires
- Interfaces et intégrations
- Exigences non-fonctionnelles (performance, disponibilité)

Contraintes attendues :
- Environnement technique (stack, navigateurs, mobile)
- Sécurité et conformité (authentification, RGPD)
- Migration des données
- Formation et documentation
```

#### Maintenance / Support (`maintenance`)
```
Contexte attendu :
- Équipements concernés
- Historique de maintenance
- Criticité du matériel

Description attendue :
- Périmètre maintenance préventive/corrective
- Pièces détachées
- Reporting et suivi

Contraintes attendues :
- Niveaux de SLA
- Délais d'intervention
- Certifications requises
- Durée du contrat
```

---

## 3. Module Contexte & Justification

### Données attendues

L'IA utilise les **500 premiers caractères** du champ `context` pour adapter ses réponses.

| Information | Importance | Description |
|-------------|------------|-------------|
| Situation actuelle | Haute | État des lieux, ce qui existe aujourd'hui |
| Limites identifiées | Haute | Problèmes, insuffisances, besoins non couverts |
| Justification du besoin | Critique | Pourquoi cette demande est nécessaire |
| Objectifs recherchés | Haute | Ce que l'on veut atteindre |
| Bénéfices attendus | Moyenne | Impact positif prévu |

### Structure type générée par l'IA

```markdown
## Contexte actuel
[Description de la situation existante et de ses limitations]

## Justification du besoin
[Pourquoi cette acquisition/prestation est nécessaire]

## Objectifs visés
[Ce que l'organisation souhaite accomplir]
```

### Paramètres de génération
- **Température** : 0.7 (créativité modérée)
- **Max tokens** : 1 500
- **Style** : Professionnel, 3-5 paragraphes

---

## 4. Module Description du Besoin

### Données attendues

L'IA utilise les **500 premiers caractères** du champ `description`.

| Information | Importance | Description |
|-------------|------------|-------------|
| Spécifications précises | Critique | Ce qui est demandé exactement |
| Caractéristiques attendues | Haute | Fonctionnalités, performances |
| Quantités | Haute | Volumes, nombres |
| Livrables | Haute | Résultats attendus |

### Structure type générée par l'IA

```markdown
## Objet de la demande
[Description précise de ce qui est demandé]

## Spécifications techniques
- [Caractéristique 1]
- [Caractéristique 2]
- ...

## Fonctionnalités attendues
[Liste des fonctionnalités requises]

## Quantités et volumétrie
[Détail des quantités]
```

### Paramètres de génération
- **Température** : 0.7
- **Max tokens** : 1 500
- **Style** : Technique mais accessible, utilise des listes

---

## 5. Module Contraintes

### Données attendues

L'IA utilise les **300 premiers caractères** du champ `constraints`.

| Type de contrainte | Exemples |
|--------------------|----------|
| **Techniques** | Compatibilité, normes, standards, environnement existant |
| **Réglementaires** | Conformité, certifications, agréments |
| **Temporelles** | Délais critiques, jalons, planning |
| **Budgétaires** | Enveloppe disponible, modalités de paiement |
| **Organisationnelles** | Installation, déploiement, formation |

### Structure type générée par l'IA

```markdown
## Contraintes techniques
- [Contrainte 1]
- [Contrainte 2]

## Contraintes réglementaires
- [Conformité requise]
- [Certifications exigées]

## Contraintes temporelles
- [Délais impératifs]
- [Jalons clés]

## Contraintes budgétaires
- [Limites financières]
```

### Paramètres de génération
- **Température** : 0.7
- **Max tokens** : 1 500
- **Style** : Catégories claires, réaliste et pertinent

---

## 6. Module Budget & Délais

### Champs attendus

| Champ | Type | Format | Description |
|-------|------|--------|-------------|
| `budgetRange` | string | "50 000 - 100 000 EUR" | Fourchette budgétaire estimée |
| `estimatedAmount` | number | Entier en EUR | Montant estimé précis |
| `desiredDeliveryDate` | string | YYYY-MM-DD | Date de livraison souhaitée |
| `budgetValidated` | number | 0 ou 1 | Budget validé par la hiérarchie |

### Utilisation par l'IA
- **Pondération des critères prix** : Minimum 20% du poids total
- **Analyse des contraintes** : Complexité adaptée au budget
- **Suggestions** : Recommandations budgétaires

### Impact sur les critères générés

```json
{
  "budgetRange": "100 000 - 150 000 EUR",
  "impact": {
    "priceCriteriaWeight": "20-30%",
    "technicalCriteriaWeight": "40-50%",
    "qualityCriteriaWeight": "20-30%"
  }
}
```

---

## 7. Module Documents

### Données attendues

| Élément | Description |
|---------|-------------|
| Fichiers supportés | PDF, DOCX, DOC (max 10 Mo) |
| Contenu extrait | 30 000 premiers caractères |
| Métadonnées | Nom, type, taille |

### Extraction automatique par l'IA

Lors de l'import d'un document, l'IA extrait :

```json
{
  "title": "Titre détecté",
  "reference": "Référence trouvée",
  "departmentName": "Service identifié",
  "contactName": "Nom du contact",
  "contactEmail": "email@valide.fr",
  "needType": "logiciel|service|...",
  "urgencyLevel": "low|medium|high|critical",
  "context": "Texte complet extrait",
  "description": "Texte complet extrait",
  "constraints": "Texte complet extrait",
  "budgetRange": "Format: 100 000 - 150 000 EUR",
  "estimatedAmount": 125000,
  "desiredDeliveryDate": "2026-06-30"
}
```

### Score de confiance

L'IA fournit un score de confiance (0.0 - 1.0) :
- **> 0.8** : Extraction fiable
- **0.5 - 0.8** : Vérification recommandée
- **< 0.5** : Données incomplètes/ambiguës

---

## 8. Critères d'Évaluation (Générés)

### Données d'entrée requises

| Champ | Importance | Utilisation |
|-------|------------|-------------|
| `needType` | Critique | Détermine les catégories de critères |
| `title` | Haute | Contextualise les critères |
| `description` | Haute | Source des critères techniques |
| `context` | Moyenne | Justifie les priorités |
| `constraints` | Haute | Génère critères de conformité |
| `budgetRange` | Haute | Pondère le critère prix |

### Structure générée

```json
{
  "criteria": [
    {
      "name": "Qualité technique de la solution",
      "description": "Évaluation de l'adéquation fonctionnelle...",
      "weight": 35,
      "category": "technical"
    },
    {
      "name": "Prix global",
      "description": "Coût total de possession...",
      "weight": 25,
      "category": "price"
    }
  ],
  "recommendations": [
    "Prévoir une démonstration technique",
    "Exiger des références similaires"
  ]
}
```

### Règles appliquées
- 5 à 8 critères au total
- Somme des poids = 100%
- Prix : minimum 20%
- Technique : 30-50%
- Conforme au Code de la Commande Publique

---

## 9. Calcul du Score de Complétion

### Répartition des points (100%)

| Catégorie | Poids | Détail |
|-----------|-------|--------|
| **Sections éditoriales** | 70% | Contenu réel (pas de placeholders) |
| **Métadonnées** | 20% | Budget (7%), Date (7%), Email (3%), Contraintes (3%) |
| **Documents** | 10% | Au moins un document attaché |

### Détection de contenu réel

L'IA distingue le contenu réel des placeholders :
- Texte entre crochets `[À compléter]` = placeholder
- Si placeholders > 30% du texte = pas de contenu réel
- Texte sans placeholder < 50 caractères = incomplet

### Seuils de complétion

| Score | Couleur | Signification |
|-------|---------|---------------|
| 0-49% | Orange | Document incomplet |
| 50-79% | Bleu | En cours de rédaction |
| 80-100% | Vert | Prêt pour export/validation |

---

## 10. Suggestions du Copilot

### Types de suggestions générées

| Type | Priorité | Déclencheur | Actions |
|------|----------|-------------|---------|
| `alert` | Haute | Champs obligatoires manquants | Naviguer vers le champ |
| `generation` | Moyenne | Sections générables (titre + contexte présents) | Générer contexte/description/contraintes |
| `improvement` | Basse | Contenu court ou incomplet | Reformuler/enrichir |
| `suggestion` | Variable | Analyse IA du projet | Conseils personnalisés |

### Exemple de réponse Copilot

```json
{
  "suggestions": [
    {
      "type": "alert",
      "priority": "high",
      "title": "Champs obligatoires manquants",
      "content": "Le budget et la date de livraison ne sont pas renseignés.",
      "actions": [
        { "label": "Compléter le budget", "target": "budget" }
      ]
    },
    {
      "type": "generation",
      "priority": "medium",
      "title": "Génération IA disponible",
      "content": "L'IA peut générer un brouillon pour les sections vides.",
      "actions": [
        { "label": "Générer le contexte", "action": "generate", "target": "context" }
      ]
    }
  ],
  "completionScore": 45
}
```

---

## 11. Paramètres Techniques de l'IA

### Configuration par fonction

| Fonction | Température | Max Tokens | Modèle |
|----------|-------------|------------|--------|
| Chat interactif | 0.7 | 1 000 | gpt-4o-mini |
| Génération de section | 0.7 | 1 500 | gpt-4o-mini |
| Reformulation | 0.5 | 2 000 | gpt-4o-mini |
| Extraction document | 0.3 | 3 000 | gpt-4o-mini |
| Critères d'évaluation | 0.7 | 2 000 | gpt-4o-mini |
| Suggestions Copilot | 0.6 | 1 500 | gpt-4o-mini |

### Limites de contexte

| Élément | Limite |
|---------|--------|
| Message utilisateur | 10 000 caractères |
| Contexte projet (context) | 500 caractères |
| Description projet | 500 caractères |
| Contraintes projet | 300 caractères |
| Document importé | 30 000 caractères |
| Historique chat | 20 derniers messages |

---

## Résumé : Données Minimales pour une Génération Efficace

### Pour générer du contenu de qualité, l'IA a besoin au minimum de :

1. **Titre du projet** - Obligatoire pour toute génération
2. **Type de besoin** - Détermine le template et le style
3. **Service demandeur** - Contextualise le besoin
4. **Au moins 100 caractères** dans une section - Pour reformulation/amélioration

### Checklist de données idéales

- [ ] Titre clair et descriptif
- [ ] Type de besoin sélectionné
- [ ] Service demandeur identifié
- [ ] Contact avec email
- [ ] Contexte de 200+ mots
- [ ] Description de 200+ mots
- [ ] Contraintes identifiées
- [ ] Budget estimé
- [ ] Date de livraison souhaitée
- [ ] Au moins un document de référence

---

*Document généré pour le projet AppelOffreSaaS - MVP v1*
