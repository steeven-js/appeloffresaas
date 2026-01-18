# Scénario 02 : Utilisateur Expert

**Persona:** Thomas, responsable achats, utilisateur expérimenté
**Objectif:** Créer rapidement une demande complète pour une prestation de conseil IT
**Contexte:** Connaît la terminologie, sait exactement ce qu'il veut, veut aller vite

---

## Instructions de Test

1. Créer une **nouvelle demande vierge**
2. Copier-coller chaque phrase dans le chat
3. Observer la réponse de l'IA
4. Cocher ✅ si OK, ❌ si problème
5. Noter les observations

---

## Phase 1 : Entrée Directe et Structurée

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 1.1 | `Nouvelle demande : prestation de conseil en architecture IT` | ⬜ | |
| 1.2 | `Service demandeur : DSI, contact : Thomas Durand, thomas.durand@exemple.fr` | ⬜ | |
| 1.3 | `Type : service, urgence : moyenne, budget : 50000-80000€` | ⬜ | |

**Attendu:** L'IA doit capturer toutes les infos structurées en une fois.

---

## Phase 2 : Contenu Dense en Une Fois

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 2.1 | `Contexte : Notre SI actuel est vieillissant. Nous avons 3 applications legacy en COBOL qui doivent être modernisées. Le DSI a validé un budget de transformation sur 2 ans. Nous cherchons un cabinet de conseil pour nous accompagner dans la définition de la cible et la roadmap de migration.` | ⬜ | |
| 2.2 | `Description : Mission de conseil en architecture IT comprenant : audit de l'existant, définition de l'architecture cible, roadmap de migration, accompagnement au choix des solutions. Durée estimée : 6 mois. Livrables attendus : rapport d'audit, schéma d'architecture cible, plan de migration détaillé.` | ⬜ | |
| 2.3 | `Contraintes : Le prestataire doit avoir des références dans le secteur public. Certification ISO 27001 souhaitée. Équipe senior uniquement (min 10 ans d'expérience). Disponibilité immédiate requise.` | ⬜ | |

**Attendu:** L'IA doit intégrer ces blocs complets sans redemander.

---

## Phase 3 : Modifications Rapides

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 3.1 | `Modifie le budget : 60000-100000€` | ⬜ | |
| 3.2 | `Ajoute dans contraintes : clause de confidentialité renforcée` | ⬜ | |
| 3.3 | `Change l'urgence en haute` | ⬜ | |
| 3.4 | `Remplace "6 mois" par "4 mois" dans la description` | ⬜ | |

**Attendu:** L'IA doit effectuer les modifications précises sans tout reformuler.

---

## Phase 4 : Commandes Directes

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 4.1 | `Génère une section "Critères d'évaluation"` | ⬜ | |
| 4.2 | `Ajoute une section annexe pour les références demandées` | ⬜ | |
| 4.3 | `Reformule le contexte de manière plus formelle` | ⬜ | |
| 4.4 | `Résume le dossier en 3 bullet points` | ⬜ | |

**Attendu:** L'IA doit exécuter les commandes sans poser de questions inutiles.

---

## Phase 5 : Vérifications Spécifiques

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 5.1 | `Le dossier est-il complet pour un MAPA ?` | ⬜ | |
| 5.2 | `Quels champs sont encore vides ?` | ⬜ | |
| 5.3 | `Estime le taux de complétude` | ⬜ | |
| 5.4 | `Y a-t-il des incohérences ?` | ⬜ | |

**Attendu:** L'IA doit analyser et répondre précisément.

---

## Phase 6 : Export et Finalisation

| # | Input Utilisateur | Résultat | Observations |
|---|-------------------|----------|--------------|
| 6.1 | `Prépare l'export PDF` | ⬜ | |
| 6.2 | `Vérifie le formatage avant export` | ⬜ | |
| 6.3 | `Génère aussi la version Word` | ⬜ | |

**Attendu:** L'IA doit guider vers les fonctions d'export.

---

## Résumé du Test

| Phase | Réussis | Échoués | Taux |
|-------|---------|---------|------|
| 1. Entrée Directe | /3 | | % |
| 2. Contenu Dense | /3 | | % |
| 3. Modifications | /4 | | % |
| 4. Commandes | /4 | | % |
| 5. Vérifications | /4 | | % |
| 6. Export | /3 | | % |
| **TOTAL** | **/21** | | **%** |

---

## Notes et Bugs Identifiés

```
[Notez ici les problèmes rencontrés]


```

## Actions Correctives

```
[Notez ici les corrections à apporter]


```
