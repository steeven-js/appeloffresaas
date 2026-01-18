# Scénario 01 : Utilisateur Novice

**Persona:** Marie, assistante administrative, première utilisation
**Objectif:** Créer une demande d'achat d'ordinateurs pour son service
**Contexte:** Ne connaît pas la terminologie, besoin simple mais mal formulé

---

## Instructions de Test

1. Créer une **nouvelle demande vierge**
2. Copier-coller chaque phrase dans le chat
3. Observer la réponse de l'IA
4. Cocher ✅ si OK, ❌ si problème
5. Noter les observations

---

## Phase 1 : Premier Contact

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 1.1 | `Bonjour` | ⬜ | |
| 1.2 | `Je sais pas trop par où commencer` | ⬜ | |
| 1.3 | `C'est ma première fois sur cet outil` | ⬜ | |

**Attendu:** L'IA doit accueillir chaleureusement et guider vers les premières étapes.

---

## Phase 2 : Expression du Besoin (vague)

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 2.1 | `J'ai besoin d'acheter des ordinateurs` | ⬜ | |
| 2.2 | `C'est pour mon service` | ⬜ | |
| 2.3 | `On est 5 personnes` | ⬜ | |
| 2.4 | `Les ordis actuels sont vieux` | ⬜ | |

**Attendu:** L'IA doit poser des questions de clarification (combien ? quel type ? budget ?).

---

## Phase 3 : Questions de Clarification (réponses incomplètes)

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 3.1 | `Je sais pas combien ça coûte` | ⬜ | |
| 3.2 | `Mon chef a dit de voir avec les achats` | ⬜ | |
| 3.3 | `C'est quoi un budget estimé ?` | ⬜ | |
| 3.4 | `Aucune idée pour la date` | ⬜ | |

**Attendu:** L'IA doit aider à estimer, expliquer les termes, proposer des fourchettes.

---

## Phase 4 : Urgence et Contraintes

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 4.1 | `Mon chef veut ça rapidement` | ⬜ | |
| 4.2 | `C'est urgent` | ⬜ | |
| 4.3 | `On peut pas dépasser 10000 euros je crois` | ⬜ | |
| 4.4 | `Il faut que ça marche avec nos logiciels` | ⬜ | |

**Attendu:** L'IA doit capturer l'urgence et les contraintes techniques.

---

## Phase 5 : Demandes d'Aide

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 5.1 | `Tu peux m'aider à rédiger le contexte ?` | ⬜ | |
| 5.2 | `Je sais pas quoi mettre dans description` | ⬜ | |
| 5.3 | `C'est quoi les contraintes ?` | ⬜ | |
| 5.4 | `Tu peux me faire un résumé ?` | ⬜ | |

**Attendu:** L'IA doit proposer de générer/rédiger les sections.

---

## Phase 6 : Validation Finale

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 6.1 | `C'est bon là ? J'ai tout mis ?` | ⬜ | |
| 6.2 | `Il manque quelque chose ?` | ⬜ | |
| 6.3 | `Je peux exporter maintenant ?` | ⬜ | |

**Attendu:** L'IA doit faire un bilan de complétude et guider vers l'export.

---

## Résumé du Test

| Phase | Réussis | Échoués | Taux |
|-------|---------|---------|------|
| 1. Premier Contact | /3 | | % |
| 2. Expression Besoin | /4 | | % |
| 3. Clarification | /4 | | % |
| 4. Urgence/Contraintes | /4 | | % |
| 5. Demandes d'Aide | /4 | | % |
| 6. Validation | /3 | | % |
| **TOTAL** | **/22** | | **%** |

---

## Notes et Bugs Identifiés

```
[Notez ici les problèmes rencontrés]


```

## Actions Correctives

```
[Notez ici les corrections à apporter]


```
