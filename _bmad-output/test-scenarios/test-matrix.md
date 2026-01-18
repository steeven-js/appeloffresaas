# Matrice de Test - MVP Dossier de Demande

**Version:** 1.0
**Date:** 2026-01-18
**Testeur:**

---

## Vue d'Ensemble des Scénarios

| # | Scénario | Fichier | Tests | Priorité | Statut |
|---|----------|---------|-------|----------|--------|
| 01 | Utilisateur Novice | `scenario-01-novice.md` | 22 | 🔴 Haute | ⬜ À faire |
| 02 | Utilisateur Expert | `scenario-02-expert.md` | 21 | 🔴 Haute | ⬜ À faire |
| 03 | Cas Limites (Edge Cases) | `scenario-03-edge-cases.md` | 40 | 🟡 Moyenne | ⬜ À faire |
| 04 | Génération de Contenu | `scenario-04-generation.md` | 26 | 🔴 Haute | ⬜ À faire |
| 05 | Panneau Co-pilote | `scenario-05-copilot.md` | 36 | 🔴 Haute | ⬜ À faire |
| **TOTAL** | | | **145** | | |

---

## Workflow de Test Recommandé

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDRE D'EXÉCUTION                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. scenario-01-novice.md     ──────┐                       │
│     (Parcours utilisateur de base)  │                       │
│                                     ▼                       │
│                              ┌──────────────┐               │
│                              │   OK ?       │               │
│                              └──────┬───────┘               │
│                         OUI ◄───────┴───────► NON           │
│                          │                     │            │
│                          ▼                     ▼            │
│  2. scenario-02-expert.md              🔧 CORRIGER          │
│     (Parcours avancé)                      │                │
│            │                               │                │
│            ▼                               │                │
│     ┌──────────────┐                       │                │
│     │   OK ?       │◄──────────────────────┘                │
│     └──────┬───────┘                                        │
│            │ OUI                                            │
│            ▼                                                │
│  3. scenario-04-generation.md                               │
│     (Qualité du contenu IA)                                 │
│            │                                                │
│            ▼                                                │
│  4. scenario-05-copilot.md                                  │
│     (Interface Co-pilote)                                   │
│            │                                                │
│            ▼                                                │
│  5. scenario-03-edge-cases.md                               │
│     (Robustesse - si temps disponible)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Critères de Validation Globaux

### Critères Bloquants (🔴 Must Pass)

| ID | Critère | Scénario Ref | Statut |
|----|---------|--------------|--------|
| B1 | L'IA répond aux messages basiques | 01 - Phase 1 | ⬜ |
| B2 | L'IA capture les informations clés | 01 - Phase 2 | ⬜ |
| B3 | L'IA peut générer du contenu | 04 - Phase 1 | ⬜ |
| B4 | L'export PDF fonctionne | 05 - Phase 7 | ⬜ |
| B5 | Le Co-pilote affiche des suggestions | 05 - Phase 1 | ⬜ |

### Critères Importants (🟡 Should Pass)

| ID | Critère | Scénario Ref | Statut |
|----|---------|--------------|--------|
| I1 | L'IA reformule correctement | 04 - Phase 3 | ⬜ |
| I2 | L'IA gère les inputs ambigus | 03 - Cat. B | ⬜ |
| I3 | Le score de complétude est précis | 05 - Phases 1-5 | ⬜ |
| I4 | Les exports Word/ZIP fonctionnent | 05 - Phase 7 | ⬜ |
| I5 | L'IA reste dans le sujet | 03 - Cat. D | ⬜ |

### Critères Souhaitables (🟢 Nice to Have)

| ID | Critère | Scénario Ref | Statut |
|----|---------|--------------|--------|
| N1 | L'IA comprend le langage SMS | 03 - Cat. E | ⬜ |
| N2 | L'IA résiste aux prompt injections | 03 - Cat. I | ⬜ |
| N3 | Performance <3s par réponse | 05 - Phase 8 | ⬜ |
| N4 | L'IA gère les contradictions | 03 - Cat. C | ⬜ |

---

## Tableau de Bord des Résultats

### Par Scénario

| Scénario | Réussis | Échoués | Taux | Statut |
|----------|---------|---------|------|--------|
| 01 - Novice | /22 | | % | |
| 02 - Expert | /21 | | % | |
| 03 - Edge Cases | /40 | | % | |
| 04 - Génération | /26 | | % | |
| 05 - Co-pilote | /36 | | % | |
| **TOTAL** | **/145** | | **%** | |

### Par Fonctionnalité

| Fonctionnalité | Tests | Réussis | Taux |
|----------------|-------|---------|------|
| Compréhension utilisateur | ~30 | | % |
| Génération contenu | ~26 | | % |
| Co-pilote suggestions | ~20 | | % |
| Export documents | ~10 | | % |
| Robustesse (edge cases) | ~40 | | % |
| Interface utilisateur | ~19 | | % |

---

## Bugs et Issues Identifiés

### Bugs Critiques 🔴

| # | Description | Scénario | Étape | Statut |
|---|-------------|----------|-------|--------|
| | | | | |

### Bugs Majeurs 🟡

| # | Description | Scénario | Étape | Statut |
|---|-------------|----------|-------|--------|
| | | | | |

### Bugs Mineurs 🟢

| # | Description | Scénario | Étape | Statut |
|---|-------------|----------|-------|--------|
| | | | | |

---

## Recommandations Post-Test

### Améliorations Prioritaires

```
1.
2.
3.
```

### Améliorations Secondaires

```
1.
2.
3.
```

### Notes pour la Prochaine Itération

```
[Notes libres]


```

---

## Signature de Validation

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Testeur | | | |
| Développeur | | | |
| Product Owner | | | |

---

## Historique des Tests

| Date | Version | Testeur | Résultat Global | Notes |
|------|---------|---------|-----------------|-------|
| | | | | |
