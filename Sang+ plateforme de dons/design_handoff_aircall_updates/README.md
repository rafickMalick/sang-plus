
# Handoff : Mises à jour "inspiration Aircall" — Site Sang+

## Aperçu
Le site Sang+ (recensement/sensibilisation/mobilisation de donneurs de sang, Bénin & Sénégal) existait déjà. Cette session a ajouté 6 sections inspirées d'aircall.io (preuve sociale, confiance, conversion) et a rendu **tout le site responsive** (mobile → desktop). Ce dossier documente uniquement ces mises à jour, à implémenter dans le vrai codebase.

## À propos des fichiers de design
Le fichier `Sang+ Site.dc.html` inclus est un **prototype HTML de référence** — pas du code à copier tel quel. Il montre le rendu et le comportement voulus. La tâche : recréer ces sections dans l'environnement existant du projet cible (React, Vue, autre) en respectant ses conventions — ou choisir le framework le plus adapté si le projet est neuf.

## Fidélité
**Haute fidélité** : couleurs, typographies, espacements et interactions ci-dessous sont finaux. Reproduire pixel-près avec les outils du codebase cible.

---

## 1. Bande de confiance institutionnelle
**Emplacement** : juste après le Hero, avant la section Mission.
**Layout** : flex row, `gap:34px`, padding `28px 56px` (desktop) / `24px 20px` empilé en colonne (mobile ≤900px), bordure supérieure `1px solid rgba(67,20,32,.14)`.
**Contenu** :
- Label : "Pensé pour l'écosystème de santé publique" — 11.5px, 600, uppercase, letter-spacing .1em, couleur `#8a6f76`
- Liste : "Ministères de la Santé · CNTS · Croix-Rouge · Programmes OMS · UNICEF" — séparateurs "·" en `#d8c3b5`, texte 14.5px 600 Newsreader, couleur `#5c4048`
- **Note** : noms d'institutions à titre illustratif (positionnement "conçu pour", pas de revendication de partenariat réel) — remplacer par les vrais logos/partenaires du client si disponibles.

## 2. Témoignage
**Emplacement** : après la section "Outil" (mockup PC), avant la photo pleine largeur.
**Layout** : flex row (colonne + centré sur mobile ≤900px), `gap:40px`, max-width 980px centré, padding `76px 56px`.
**Composants** :
- Photo circulaire 108×108px (placeholder à remplir — voir Assets)
- Citation : 23px italic 500 Newsreader, couleur `#2b0d15`, line-height 1.5
- Nom : "Dr Aïcha Koné" — 14px 600 Public Sans, `#431420`
- Fonction : "Responsable régionale de la transfusion sanguine" — 13px, `#8a6f76`
- Mention italique 11.5px `#b09aa0` : "Témoignage illustratif — à remplacer par un retour réel de vos équipes."
- **Important** : contenu 100% fictif/illustratif. Remplacer par une vraie citation + photo avant mise en ligne.

## 3. Compatibilité réseaux (opérateurs télécom)
**Emplacement** : après Impact, avant Contact.
**Layout** : bande pleine largeur, bordure inférieure `1px solid rgba(67,20,32,.14)`, padding `36px 56px` (colonne sur mobile).
**Contenu** : label "SMS & appels vocaux sur tous les réseaux" (12px 600 uppercase `#8a6f76`) + liste Orange / MTN / Moov Africa / Wave / "+ opérateurs locaux" (14.5px 600 Newsreader `#5c4048`, dernier item 13px 400 `#8a6f76`).
Présenté comme une **capacité technique** (compatibilité réseau), pas comme un partenariat commercial affiché.

## 4. Bandeau CTA final + badges de confiance
**Emplacement** : après Contact, avant le Footer.
**Layout** : bande bordeaux `#431420` pleine largeur, texte centré, padding `64px 56px` (`48px 20px` mobile), contenu max-width 760px.
**Composants** :
- H2 : "Prêt à équiper votre centre de transfusion ?" — `clamp` desktop 34px → 27px mobile, 600 Newsreader, `#f8ddcb`
- Paragraphe 15px `#d9b8a8`
- Bouton "Demander une démo" → `#contact` — fond `#c8102e`, texte blanc, padding 15px 32px, radius 4px
- 4 badges pill (border `1px solid rgba(248,221,203,.3)`, texte `#d9b8a8` 12.5px) : "✓ Hébergement des données en Afrique", "✓ Conçu pour la conformité RGPD", "✓ Chiffrement de bout en bout", "✓ Accès sécurisé par rôle"
- **Ces affirmations sont des positionnements produits, pas des certifications vérifiées** — à valider/adapter avec la réalité de l'infrastructure avant publication.

## 5. Footer enrichi (mega-footer)
**Emplacement** : remplace l'ancien footer une ligne.
**Layout** : fond `#2b0d15`, grid 4 colonnes `1.4fr 1fr 1fr 1fr` gap 40px (2 colonnes ≤900px, 1 colonne ≤520px), séparateur `border-bottom:1px solid rgba(248,221,203,.12)` avant la barre du bas.
**Colonnes** :
1. Logo + description courte (max 32ch)
2. "Produit" : Assistance Campagne, Recensement des donneurs, Messagerie SMS & vocale, Statistiques
3. "Ressources" : Guide de déploiement, Étude de cas régionale, La mission
4. "Contact" : email, "Bénin · Sénégal", CTA démo
**Barre du bas** : flex space-between (colonne sur mobile ≤900px) — copyright + mention CNTS, 12.5px `#8a5f6b`.

## 6. Responsive — système de breakpoints
Le site n'avait quasi aucune adaptation mobile ; ajout de 4 breakpoints :

| Breakpoint | Effet |
|---|---|
| `≤1100px` | Hero seul bascule en 1 colonne (empêche le titre H1 de se retrouver écrasé dans une colonne trop étroite entre 900-1240px) |
| `≤900px` | Nav : liens masqués (garder logo + CTA) · Hero/Mission/Campagne/Outil/Témoignage/Impact/Partenaires/Contact/CTA final/Footer passent en 1 colonne ou empilement · Impact passe en grille 2×2 |
| `≤700px` | Dashboard PC (mockup "Outil") : sidebar verticale → barre horizontale scrollable, logo masqué, indicateur actif passe de bordure gauche à bordure basse · tableau donneurs devient scrollable horizontalement |
| `≤520px` | Footer en 1 colonne |

**Détails techniques clés** :
- H1 du Hero utilise `font-size: clamp(28px, 7vw + 4px, 58px)` — taille fluide, pas de palier fixe, pour éviter tout écart (dead zone) entre breakpoints.
- Tableau des donneurs (grid 5 colonnes) : chaque ligne a `min-width:540px` + le conteneur `overflow-x:auto` → scroll horizontal plutôt que colonnes écrasées sur petit écran.
- Badge flottant "1 don = 3 vies" (Hero) : `position:absolute` en desktop → `position:static` + marge négative en mobile pour rester ancré à l'image sans déborder du viewport.
- `body { overflow-x:hidden }` en garde-fou contre tout débordement horizontal résiduel.

## Design tokens
**Couleurs**
- Fond crème : `#faf4ee`
- Bordeaux foncé (fonds sombres, texte fort) : `#431420` / `#2b0d15`
- Rouge accent (CTA, highlights) : `#c8102e`
- Texte body : `#5c4048` · Texte muted/label : `#8a6f76`
- Sur fond bordeaux : `#f8ddcb` (titres), `#d9b8a8` (body), `#a97f8b` / `#8a5f6b` (muted)
- Bordures : `rgba(67,20,32,.14)` (sur crème), `rgba(248,221,203,.12-.3)` (sur bordeaux), `#e4d4c8` / `#f0e4da`

**Typographie**
- Titres : 'Newsreader' (serif, variable, opsz 6..72), poids 400/500/600/700
- UI/body : 'Public Sans' (sans-serif), poids 400/500/600/700

**Rayons** : 4px (boutons), 6-8px (images/cards), 10-12px (panneaux), 999px (pills/badges)
**Ombres** : `0 20px 50px rgba(43,13,21,.22)` (images hero), `0 24px 60px rgba(0,0,0,.35)` (carte démo), `0 30px 80px rgba(43,13,21,.2)` (dashboard PC)

## Assets
- `assets/logo.png`, `photo-don-1.png`, `photo-don-2.png`, `photo-campagne.png`, `carte-senegal.png`, `carte-benin.png` — images générées pour le prototype, à remplacer par les vrais visuels de marque/photos.
- Photo du témoignage : actuellement un placeholder vide (drag-and-drop dans le prototype) — fournir une vraie photo.

## Fichiers
- `Sang+ Site.dc.html` (inclus dans ce dossier) — prototype HTML complet et interactif de référence pour toutes les sections ci-dessus.
