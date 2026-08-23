# Contribuer au plugin

## Principes

- Faire des changements minimaux et cohérents avec l'architecture par skills.
- Lire le skill, ses références et ses evals avant de changer un workflow.
- Garder la documentation descriptive ; les contrats normatifs vivent dans les skills et références.
- Utiliser le nom simple dans le frontmatter et les chemins (`design-qa`), le nom qualifié dans les instructions d'utilisation (`product-design:design-qa`).
- Ne pas introduire une dépendance implicite à un outil optionnel.
- Ne pas modifier un starter sans vérifier les quatre frameworks lorsque le contrat est partagé.

## Synchronisation attendue

Selon le changement, mettre à jour ensemble :

- `skills/*/SKILL.md` et les références qu'il charge ;
- les `evals/evals.json` du skill et/ou `tests/evals/plugin-integration.json` ;
- `references/product-decision-gates.md` si un passage de phase change ;
- les templates et ports d'annotation si le comportement runtime change ;
- `README.md`, `AGENTS.md` et `docs/` si l'interface publique ou l'architecture change.

Ne pas éditer les sorties générées, les dépendances vendored ou `node_modules`.

## Validation locale

```bash
npm run validate:workflow
npm run validate:skills
npm run validate:plugin
# agrégat
npm test
```

Le validateur de workflow protège les invariants d'idéation, d'approbation des écrans, de build et de QA. Le validateur de skills applique le format officiel à chaque skill. Le validateur de plugin stage le bundle sans artefacts d'évaluation et exécute les validateurs Agent Plugins et Goose.

Ajouter au moins les cas positifs, les cas ambigus et les blockers importants lorsqu'un contrat change. Les benchmarks et traces locales vont dans `evaluations/` ou un chemin `*-workspace/` ignoré. Ils peuvent contenir des données runtime et ne doivent pas être commit.

## Contrôle du diff

Avant handoff :

```bash
git diff --check
git status --short
git diff -- AGENTS.md docs
```

Vérifier qu'aucun secret, résultat généré, cache ou fichier hors périmètre n'est présent. Ne pas créer de commit sauf demande explicite.
