# Scénario Data 01 : Fourniture - Achat Ordinateurs

**Type de besoin:** Fourniture / Équipement
**Titre:** Acquisition de matériel informatique pour le service comptabilité

---

## Données Utilisateur à Fournir

### MODULE 1 : Informations Générales

```
Titre : Acquisition de matériel informatique pour le service comptabilité
Service : Service Comptabilité
Responsable : Sophie Martin
Email : sophie.martin@mairie-exemple.fr
Type : Fourniture
Urgence : Moyenne
```

---

### MODULE 2 : Contexte & Justification

**Données à communiquer à l'IA :**

```
Notre service comptabilité compte 8 agents qui travaillent quotidiennement sur
des postes informatiques. Les ordinateurs actuels ont été achetés en 2018 et
montrent des signes de vieillissement importants : lenteurs au démarrage,
temps de traitement des fichiers Excel très longs, et plusieurs pannes ces
derniers mois qui ont perturbé la clôture comptable de décembre.

Problèmes rencontrés :
- Les ordinateurs mettent plus de 5 minutes à démarrer le matin
- Notre logiciel comptable Sage rame énormément, surtout en période de clôture
- 3 postes ont eu des pannes de disque dur depuis septembre
- Les écrans sont fatigués, plusieurs agents se plaignent de maux de tête
- On ne peut pas faire tourner la nouvelle version du logiciel de paie

La DSI nous a informés que nos postes ne seront plus maintenus à partir de
juin 2026. De plus, la mise à jour obligatoire vers Sage 100 Cloud nécessite
des machines plus puissantes. La période des bilans approche et on ne peut
pas se permettre de pannes.
```

---

### MODULE 3 : Description du Besoin

**Données à communiquer à l'IA :**

```
Équipements nécessaires :
- 8 ordinateurs fixes pour remplacer les postes existants
- 8 nouveaux écrans 24 pouces minimum (les anciens fatiguent les yeux)
- 2 ordinateurs portables pour les 2 cadres qui font du télétravail

Spécifications techniques (données par la DSI pour Sage 100 Cloud) :
- Processeur Intel Core i5 ou équivalent minimum
- 16 Go de RAM
- Disque SSD 512 Go minimum
- Windows 11 Pro

Pour les écrans : 24 pouces Full HD avec pied réglable en hauteur
Pour les portables : mêmes specs que les fixes avec écran 15 pouces

Accessoires et services :
- Claviers et souris sans fil pour chaque poste
- Sacoches de transport pour les 2 portables
- Garantie 3 ans sur site avec intervention J+1
- Installation et configuration des postes par le fournisseur
```

---

### MODULE 4 : Contraintes

**Données à communiquer à l'IA :**

```
Contraintes de compatibilité technique :
- Compatible avec Sage 100 Cloud (version 2024)
- Compatible avec notre système de sauvegarde Veeam
- Compatible avec notre antivirus Kaspersky
- Doit s'intégrer à notre Active Directory
- Certifié Energy Star
- Compatible avec notre outil de déploiement SCCM

Contraintes de délais :
- Livraison impérative avant le 15 mars 2026
- Installation en dehors des heures de bureau (soir ou week-end)
- La migration Sage 100 Cloud est prévue début avril, tout doit être prêt avant

Contraintes budgétaires et qualité :
- Budget validé par le DGS : maximum 25 000 € TTC
- Équipements avec indice de réparabilité > 6
- Marques reconnues uniquement (Dell, HP, Lenovo)
```

---

### MODULE 5 : Budget & Délais

```
Fourchette budgétaire : 20 000 - 25 000 EUR
Montant estimé : 23 500 EUR
Date de livraison : 15 mars 2026
Budget validé : Oui

Justification urgence :
Migration obligatoire vers Sage 100 Cloud début avril 2026.
Fin de maintenance DSI des équipements actuels en juin 2026.
```

---

## Résumé JSON (pour tests API)

```json
{
  "title": "Acquisition de matériel informatique pour le service comptabilité",
  "departmentName": "Service Comptabilité",
  "contactName": "Sophie Martin",
  "contactEmail": "sophie.martin@mairie-exemple.fr",
  "needType": "fourniture",
  "urgencyLevel": "medium",
  "budgetRange": "20 000 - 25 000 EUR",
  "estimatedAmount": 23500,
  "desiredDeliveryDate": "2026-03-15",
  "budgetValidated": 1
}
```
