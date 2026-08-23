# Product Design — instructions aux agents

Ce dépôt contient le plugin Goose **product-design**. Il transforme un brief, une URL ou une source visuelle en parcours, prototypes exécutables, revues et handoffs. Cette documentation décrit uniquement les composants réellement versionnés ici.

## Autorité et périmètre

- Respecter d'abord la demande utilisateur, puis les instructions du dépôt et du skill actif.
- Le frontmatter et le corps de chaque fichier `skills/*/SKILL.md` constituent le contrat d'exécution du skill.
- `references/critical-overrides.md` et `references/communication-protocol.md` s'appliquent à tout travail Product Design.
- Pour une application existante, respecter son propre `AGENTS.md`, son design system et ses conventions avant les valeurs par défaut du plugin.
- Ne pas présenter une capacité optionnelle comme intégrée. Navigateur, génération d'images, Figma, hébergement et Beads dépendent des outils disponibles dans la session.
- Ne pas modifier le code ou les contrats d'un workflow en se fondant seulement sur ce résumé : lire les fichiers concernés.

## Architecture réelle

Le plugin est déclaratif et piloté par des skills :

```text
plugin.json
  ├─ skills/                  contrats exécutés par Goose
  ├─ references/              règles transversales et gates
  ├─ templates/               starters Vite, Next.js, Nuxt et Astro
  ├─ assets/annotate/         ports de l'overlay d'annotation
  ├─ assets/beads-formulas/   suivi optionnel des étapes
  ├─ scripts/                 bootstrap et validateurs
  └─ tests/evals/             cas d'intégration versionnés
```

Après installation, Goose qualifie les skills avec `product-design:`. Les répertoires et leur frontmatter gardent les noms non qualifiés.

### Skills

| Skill | Responsabilité |
|---|---|
| `product-design:index` | Point d'entrée et routeur ; à charger quand Product Design ou le plugin est explicitement nommé |
| `product-design:get-context` | Établir le brief, la cible de design et l'issue utilisateur |
| `product-design:user-context` | Lire ou sauvegarder les références et préférences durables |
| `product-design:research` | Recherche UX sourcée sur les problèmes et frictions |
| `product-design:ideate` | Comparer des parcours ou directions visuelles générés |
| `product-design:audit` | Critique UX, visuelle et accessibilité d'une expérience existante |
| `product-design:image-to-code` | Implémenter fidèlement une source visuelle approuvée |
| `product-design:url-to-code` | Cloner fidèlement une URL en frontend local exécutable |
| `product-design:design-qa` | Comparer le rendu codé et sa source visuelle |
| `product-design:share` | Déployer uniquement sur demande et retourner une URL vérifiée |
| `product-design:annotate-inject` | Ajouter l'annotation à un projet existant compatible |
| `product-design:annotate` | Traiter les annotations en attente sur un projet en cours d'exécution |
| `product-design:project-status` | Suivi Beads optionnel, jamais un gate ni une dépendance |

## Routage et workflow canonique

```text
index → get-context → research / audit / ideate
                    → image-to-code ou url-to-code
                    → design-qa
                    → share, seulement si demandé
```

Tous les travaux ne parcourent pas toute la chaîne. Le routeur choisit le skill spécialisé ; il ne réalise pas son travail à sa place.

- Nouvelle interface sans référence : clarifier, produire trois options avec `ideate`, attendre un choix, puis construire.
- Screenshot, mockup ou frame Figma sélectionné : `image-to-code`, puis `design-qa`.
- « Clone cette URL » : capturer la source, `url-to-code`, puis `design-qa`.
- « Redessine » ou « fais quelque chose comme cette URL » : capturer la source, idéer, attendre la sélection, puis construire.
- Audit d'une expérience : `audit`. Comparaison source/rendu : `design-qa`. Ne pas confondre les deux.
- Recherche d'un problème utilisateur : `research`, avec sources et distinction entre faits et inférences.
- Déploiement : `share` uniquement si l'utilisateur demande de publier, héberger ou partager.

### Invariants de conception et de build

- **Pas de cible visuelle, pas de build.** Un brief complet ne remplace pas la sélection visuelle.
- Un parcours multi-écrans commence par exactement trois journey boards complets et comparables. Une image par étape est invalide.
- Après sélection d'un parcours, créer un plan ordonné, générer chaque écran détaillé, puis obtenir l'approbation de l'ensemble avant le build. Un journey board seul ne suffit pas.
- Pour une vraie cible mono-écran, comparer trois directions du même écran, avec contenu, état et contraintes constants.
- Dans un produit existant, inspecter d'abord les écrans analogues, composants, tokens, styles et interactions. Réutiliser avant d'inventer.
- Un prototype valide le frontend et le parcours avec des données mock réalistes. Ne pas ajouter backend, auth réelle, schémas, migrations, services ou intégrations sans demande explicite de phase production.
- Les interactions du parcours principal doivent fonctionner. Les contrôles périphériques peuvent rester visuels si cela est clairement hors périmètre.
- Ne jamais simuler des assets visibles avec emoji, ASCII, texte, placeholder, CSS art ou SVG artisanal. Réutiliser la source, une bibliothèque d'icônes ou un outil de génération d'images disponible.

## Gates de décision

La définition normative est `references/product-decision-gates.md`. Pour un travail impliqué, enregistrer les décisions dans `<projet>/.gates/` avec critères, score, confiance, preuves, hypothèses, risques, alternatives rejetées, prochaine étape et propriétaire.

| Gate | Passage |
|---|---|
| G1 | Brief → idéation du parcours/visuel |
| G2 | Trois parcours complets → parcours sélectionné |
| G3 | Parcours sélectionné → ensemble détaillé d'écrans approuvé |
| G4 | Direction sélectionnée → prototype |
| G5 | Prototype → revue/handoff, avec qualité d'exécution et validité du test séparées |
| G6 | Prototype validé → industrialisation |
| G7 | Production readiness |

Un score ne compense jamais un critère dur manquant. Les verdicts sont `pass`, `conditional`, `experiment` ou `blocked`. Ne pas confondre approbation stakeholder, exécution technique et validation utilisateur.

## Templates et framework

- `templates/prototype/` : Vite + React, défaut pour une revue jetable.
- `templates/nextjs/` : Next.js lorsque le comportement Next est réellement à valider.
- `templates/nuxt/` : Nuxt.
- `templates/astro/` : Astro.
- Résoudre le framework avec `get-context` avant de scaffold.
- Créer un prototype via `scripts/bootstrap-prototype.mjs`, puis installer depuis la racine générée.
- Les quatre templates embarquent déjà l'overlay d'annotation. Ne pas lancer `annotate-inject` sur un starter généré.
- Les `templates/*/AGENTS.md` sont copiés dans le projet et donnent les consignes locales de prototype.

## Annotations

Le mécanisme est local au projet généré ou injecté : overlay navigateur, endpoint de développement et fichiers sous `<projet>/.goose/annotations/`.

- Utiliser `annotate-inject` seulement pour un projet utilisateur qui ne possède pas encore le mécanisme.
- Détecter le framework et utiliser le port correspondant dans `assets/annotate/{vite,nextjs,nuxt,astro}/`.
- Monter l'overlay côté client et seulement en développement. L'endpoint est `goose-annotate`, jamais un chemin préfixé par underscore.
- Vérifier réellement le mode développement (requête acceptée et fichier écrit) et le build/serveur de production (endpoint absent ou refusé).
- Avec `annotate`, traiter l'inbox du plus ancien au plus récent. Reproduire route et viewport, capturer et recadrer la bbox, effectuer le changement ciblé, recapturer, puis déplacer l'enregistrement vers `processed/`.
- Pour une modification non triviale ou le dernier cycle avant handoff, relancer `design-qa`.
- L'agent démarre ou réutilise le serveur et vérifie l'URL de revue ; ne pas déléguer ces commandes à l'utilisateur.

## User context et confidentialité

Le contexte durable est optionnel et Goose-local, par défaut sous `$GOOSE_HOME/.local/state/product-design/` (Goose home usuel : `~/.config/goose`). Lire `skills/user-context/SKILL.md` avant toute opération.

- Si `user-context.md` existe, l'utiliser comme ancrage par défaut sans le confondre avec le brief courant.
- L'initialisation et le preflight sont les scripts TypeScript compilés du skill ; ne pas inventer un stockage dans le dépôt du projet.
- Copier les images sauvegardées dans le sous-répertoire `assets/` du user-context, avec des noms descriptifs, et les référencer depuis le Markdown.
- Conserver peu de références, mais de haute valeur. `status: not provided` signifie absence d'information, pas une préférence.
- Ne jamais persister secrets, identifiants, clés API, tokens privés, données client copiées ou contenu qui ne devrait pas survivre à la session.
- Respecter le navigateur choisi par l'utilisateur. Demander avant d'utiliser directement Playwright si ce n'est pas le navigateur autorisé par le contexte ou la demande.

## Vérification et preuves

- Une capture seule n'est pas une QA. Comparer source et rendu dans la même entrée, au même viewport et dans le même état ; corriger puis comparer à nouveau.
- Ne pas annoncer une QA sans capture rendue, un serveur prêt sans URL vérifiée, ni un partage sans URL de déploiement fonctionnelle.
- Vérifier les états principaux, navigation, responsive, accessibilité applicable et absence de problèmes P0/P1/P2 avant handoff.
- Si une capacité obligatoire manque, signaler un blocker précis plutôt que fabriquer un résultat.

## Sécurité

- Ne pas exposer ni écrire de secret dans le dépôt, les captures, les annotations, les traces ou le user-context.
- Ne pas effectuer d'action destructive, de déploiement ou d'intégration production sans autorisation explicite.
- En clonage d'URL, reproduire le frontend demandé ; ne pas copier de données privées ni contourner une authentification.
- En projet existant, préserver l'infrastructure et limiter les changements au périmètre convenu.
- Les traces d'évaluation peuvent contenir des conversations ou données runtime : les garder dans les chemins ignorés `evaluations/` ou `*-workspace/`, jamais les committer.

## Tests et contribution

Avant de proposer un changement, exécuter depuis la racine :

```bash
npm test
# ou séparément
npm run validate:workflow
npm run validate:skills
npm run validate:plugin
```

- `validate:workflow` contrôle les invariants du parcours et les fichiers d'evals.
- `validate:skills` valide chaque skill avec le validateur officiel.
- `validate:plugin` stage le bundle puis valide les schémas Agent Plugins et Goose.
- Ajouter ou mettre à jour les evals lorsqu'un comportement observable de skill change.
- Garder les noms de skill non qualifiés dans les dossiers/frontmatter et utiliser `product-design:<nom>` dans la documentation d'usage.
- Synchroniser skill, références, templates, tests et documentation quand un contrat partagé change.
- Ne pas modifier les artefacts générés ou `node_modules`. Ne pas committer sans demande explicite.
- Limiter le diff au besoin, conserver le style Markdown existant et vérifier `git diff --check` ainsi que `git status`.

Voir aussi : `docs/architecture.md`, `docs/workflows.md`, `docs/operations.md` et `docs/contributing.md`.
