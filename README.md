# Sang+

Outil de recensement, de rappel et de mobilisation des donneurs de sang pour les services nationaux de transfusion.
Premier pays : **Bénin** (ANTS). Conçu pour être répliqué dans d'autres pays d'Afrique sans modifier le code.

## Lancer la démo

Prérequis : Node 20, Docker (avec `docker-compose`).

```bash
npm run setup   # dépendances + PostgreSQL (port 5440) + schéma + données de démo
npm run demo    # API (port 3040) + front (Vite)
```

- Site vitrine : http://localhost:5173/
- Logiciel : http://localhost:5173/logiciel.html (bouton « Se connecter » du site)
- Remettre les données de démo à zéro : `npm run db:reset` ou bouton « Réinitialiser » dans l'espace super admin.

**Mode démonstration** : pas d'authentification. On choisit un profil à l'entrée ; le front envoie son identifiant
dans l'en-tête `x-demo-user` et l'API en déduit le rôle et le périmètre (`server/src/context.ts`).
L'authentification réelle se branchera à cet endroit.

**SMS** : passerelle simulée, rien n'est envoyé. Le simulateur (super admin) permet de répondre « 1 » ou « STOP »
à la place d'un donneur.

## Profils

| Rôle | Périmètre | Écrans |
|---|---|---|
| Super admin | Plateforme | Vue d'ensemble, organisations, comptes, règles et modèles, simulateur SMS, journal |
| Pilote | National, régional ou un site | National : tableau national, registre, règles. Site : tableau de bord, campagnes, collectes, registre |
| Opérateur de site | Un site | Ma journée : liste d'appel + pointage le jour de la collecte |
| Demandeur | Un établissement | Signalement de besoin et suivi |

Le rôle dit *ce qu'on fait*, le périmètre (un nœud de l'arbre des organisations) dit *où*.

## Architecture

```
src/                 front React (Vite) : site vitrine + logiciel (src/logiciel)
server/
  packs/bj.json      pack pays Bénin : libellés, téléphone, identifiant, langues, modèles SMS, règles
  prisma/            modèle de données (PostgreSQL) + données de démonstration
  src/domain/        métier : aptitude, campagnes, réservation de créneaux, SMS entrants/sortants
  src/routes/        API REST par profil
  src/jobs.ts        rappels quotidiens à l'heure locale, bascule des sans-réponse en liste d'appel
```

Aucune donnée médicale n'est stockée : l'aptitude est calculée à partir de la date du dernier don et des règles du pays ;
un ajournement n'enregistre qu'une date, jamais un motif.

## Ajouter un pays

1. Créer `server/packs/<code>.json` sur le modèle de `bj.json` (format du téléphone, identifiant national, langues,
   modèles de SMS, règles d'aptitude — à valider avec le service national du pays).
2. Créer ses organisations (service national, sites, établissements) et ses comptes depuis l'espace super admin.
3. Brancher un fournisseur SMS du pays derrière l'interface `SmsGateway` (`server/src/domain/messaging.ts`).

Les règles et modèles du pack peuvent ensuite être ajustés depuis l'application (écran « Règles et modèles ») ;
les valeurs modifiées sont stockées en base et surchargent celles du fichier.
