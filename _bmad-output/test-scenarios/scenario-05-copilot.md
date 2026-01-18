# Scénario 05 : Test du Panneau Co-pilote

**Objectif:** Tester les suggestions dynamiques et actions du panneau Co-pilote
**Contexte:** Vérifier que le Co-pilote analyse correctement le dossier et propose des actions pertinentes

---

## Instructions de Test

1. Créer une **nouvelle demande vierge**
2. Observer le panneau Co-pilote à droite
3. Suivre les étapes progressives ci-dessous
4. Vérifier les suggestions à chaque étape

---

## Phase 1 : Dossier Vierge

**État:** Demande créée avec uniquement un titre

| # | Vérification | Résultat | Observations |
|---|--------------|----------|--------------|
| 1.1 | Le Co-pilote affiche un score de complétude bas (0-20%) | ⬜ | |
| 1.2 | Des suggestions de type "champ manquant" apparaissent | ⬜ | |
| 1.3 | Les suggestions prioritaires sont mises en avant | ⬜ | |
| 1.4 | Le bouton "Actualiser" fonctionne | ⬜ | |

**Attendu:** Suggestions pour remplir les champs obligatoires.

---

## Phase 2 : Dossier Partiellement Rempli

**Action:** Remplir via le chat : service demandeur, contact, type de besoin

| # | Vérification | Résultat | Observations |
|---|--------------|----------|--------------|
| 2.1 | Le score de complétude augmente (20-50%) | ⬜ | |
| 2.2 | Les suggestions précédentes disparaissent | ⬜ | |
| 2.3 | Nouvelles suggestions pour les champs restants | ⬜ | |
| 2.4 | L'aperçu miniature se met à jour | ⬜ | |

**Attendu:** Mise à jour dynamique des suggestions.

---

## Phase 3 : Contenu Présent mais Faible

**Action:** Ajouter un contexte très court (1 phrase)

| # | Vérification | Résultat | Observations |
|---|--------------|----------|--------------|
| 3.1 | Suggestion "Améliorer" ou "Enrichir" le contexte | ⬜ | |
| 3.2 | Indication que le contenu est insuffisant | ⬜ | |
| 3.3 | Proposition de génération IA | ⬜ | |

**Attendu:** Détection de contenu trop léger.

---

## Phase 4 : Test des Actions du Co-pilote

**Action:** Cliquer sur les différentes actions proposées

| # | Action Co-pilote | Résultat | Observations |
|---|------------------|----------|--------------|
| 4.1 | Clic sur "Naviguer vers [section]" | ⬜ | |
| 4.2 | Clic sur "Générer [section]" | ⬜ | |
| 4.3 | Clic sur "Reformuler [section]" | ⬜ | |
| 4.4 | Clic sur une suggestion de priorité haute | ⬜ | |
| 4.5 | Clic sur une suggestion de priorité moyenne | ⬜ | |

**Attendu:** Les actions déclenchent les bonnes fonctions.

---

## Phase 5 : Dossier Complet

**Action:** Remplir toutes les sections principales

| # | Vérification | Résultat | Observations |
|---|--------------|----------|--------------|
| 5.1 | Score de complétude proche de 100% | ⬜ | |
| 5.2 | Moins de suggestions critiques | ⬜ | |
| 5.3 | Suggestions d'amélioration optionnelles | ⬜ | |
| 5.4 | Message positif ou encourageant | ⬜ | |

**Attendu:** Le Co-pilote reconnaît un dossier bien rempli.

---

## Phase 6 : Aperçu Document

| # | Vérification | Résultat | Observations |
|---|--------------|----------|--------------|
| 6.1 | L'aperçu miniature affiche le titre | ⬜ | |
| 6.2 | L'aperçu affiche la référence si présente | ⬜ | |
| 6.3 | L'aperçu affiche les métadonnées (service, contact) | ⬜ | |
| 6.4 | L'aperçu affiche un résumé des sections | ⬜ | |
| 6.5 | Clic sur l'aperçu ouvre le mode Preview | ⬜ | |

**Attendu:** Aperçu fidèle au contenu du dossier.

---

## Phase 7 : Actions Rapides (Export)

| # | Action | Résultat | Observations |
|---|--------|----------|--------------|
| 7.1 | Clic sur "Exporter PDF" | ⬜ | |
| 7.2 | Le PDF se télécharge | ⬜ | |
| 7.3 | Le PDF contient toutes les infos | ⬜ | |
| 7.4 | Clic sur "Exporter Word" | ⬜ | |
| 7.5 | Le DOCX se télécharge | ⬜ | |
| 7.6 | Clic sur "Exporter ZIP" | ⬜ | |
| 7.7 | Le ZIP contient le dossier + annexes | ⬜ | |

**Attendu:** Tous les exports fonctionnent correctement.

---

## Phase 8 : Rafraîchissement et Performance

| # | Vérification | Résultat | Observations |
|---|--------------|----------|--------------|
| 8.1 | Le bouton refresh actualise les suggestions | ⬜ | |
| 8.2 | Temps de chargement acceptable (<3s) | ⬜ | |
| 8.3 | Pas d'erreur dans la console | ⬜ | |
| 8.4 | Les suggestions se mettent à jour après modification dans le chat | ⬜ | |

**Attendu:** Performance et réactivité correctes.

---

## Résumé du Test

| Phase | Réussis | Échoués | Taux |
|-------|---------|---------|------|
| 1. Dossier Vierge | /4 | | % |
| 2. Partiellement Rempli | /4 | | % |
| 3. Contenu Faible | /3 | | % |
| 4. Actions Co-pilote | /5 | | % |
| 5. Dossier Complet | /4 | | % |
| 6. Aperçu Document | /5 | | % |
| 7. Actions Export | /7 | | % |
| 8. Performance | /4 | | % |
| **TOTAL** | **/36** | | **%** |

---

## Notes et Bugs Identifiés

```
[Notez ici les problèmes rencontrés]


```

## Actions Correctives

```
[Notez ici les corrections à apporter]


```
