# Documentation Product Design

Cette documentation décrit le plugin Product Design présent dans ce dépôt et ses contrats d'exécution.

## Index

| Document | Contenu |
|---|---|
| [architecture.md](architecture.md) | Structure du bundle, skills, dépendances et templates |
| [workflows.md](workflows.md) | Routage, workflow de conception, gates et preuves attendues |
| [operations.md](operations.md) | Annotation, user-context, sécurité et handoff |
| [contributing.md](contributing.md) | Conventions de modification, validation et évaluations |

## Sources normatives

Les docs expliquent le système, mais les contrats exécutables restent :

- `skills/*/SKILL.md` pour chaque skill ;
- `references/critical-overrides.md` et `references/communication-protocol.md` pour les règles transversales ;
- `references/product-decision-gates.md` pour les gates ;
- `plugin.json` pour l'identité du plugin ;
- `package.json` et `scripts/validate-*.mjs` pour les validations.

En cas de divergence, corriger la documentation et suivre ces sources.
