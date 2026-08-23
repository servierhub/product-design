# Architecture du plugin Product Design

## Modèle d'exécution

Product Design est un plugin Goose composé de skills Markdown, de références partagées, de starters frontend et de scripts locaux. Il n'embarque pas de service de mémoire, de base vectorielle ou d'orchestrateur de graphe.

```text
Demande utilisateur
      ↓
product-design:index (routeur)
      ↓
skill spécialisé + références transversales
      ↓
outils disponibles dans la session
      ↓
artefacts visuels, prototype local, QA ou URL partagée
```

Goose ajoute le préfixe `product-design:` après installation. Le nom déclaré dans chaque répertoire de skill reste simple, par exemple `ideate`.

## Composants

### Skills

Les treize skills sont répartis par responsabilité :

- **Orchestration** : `index`, `get-context`.
- **Contexte et découverte** : `user-context`, `research`, `audit`.
- **Conception** : `ideate`.
- **Construction** : `image-to-code`, `url-to-code`.
- **Vérification et livraison** : `design-qa`, `share`.
- **Boucle de feedback** : `annotate-inject`, `annotate`.
- **Suivi optionnel** : `project-status`.

Le routeur charge le skill adapté ; les skills peuvent ensuite demander le chargement d'un autre skill au passage d'une étape. Il n'existe pas d'agent custom distinct dans ce dépôt.

### Références

`references/` rassemble les règles communes : communication, overrides critiques, modification d'une base existante, preflight des prototypes et gates de décision. Elles évitent de dupliquer ces contrats dans chaque skill.

### Templates

| Répertoire | Stack | Usage |
|---|---|---|
| `templates/prototype` | Vite + React | Prototype jetable par défaut |
| `templates/nextjs` | Next.js | Validation de comportements spécifiques à Next |
| `templates/nuxt` | Nuxt | Prototype Nuxt demandé ou requis |
| `templates/astro` | Astro | Prototype Astro demandé ou requis |

Le script `scripts/bootstrap-prototype.mjs` copie le starter choisi vers une nouvelle destination. Chaque starter contient un `AGENTS.md` local et une annotation déjà câblée. Le framework doit être décidé avant le scaffold.

### Annotation

`assets/annotate/` contient les ports à injecter dans une application existante : composants overlay, styles et endpoint/plugin par framework. Les templates en contiennent déjà une copie adaptée. Les annotations sont des fichiers locaux au prototype, sous `.goose/annotations/`, et non des données envoyées à une infrastructure du plugin.

### Gates et suivi

Les décisions de produit sont documentées dans `.gates/` au sein du projet généré. Les formules sous `assets/beads-formulas/` peuvent refléter les phases dans Beads, mais restent facultatives : elles ne décident pas des gates et aucun skill ne doit échouer parce que Beads est absent.

## Capacités runtime

Le plugin s'appuie sur les capacités exposées à Goose :

- navigateur pour capturer une source et vérifier un rendu ;
- génération d'images pour l'idéation et certains assets ;
- Node.js/npm pour bootstrap, installation et serveurs locaux ;
- hébergeur uniquement lors d'un partage demandé ;
- Figma ou Goose Apps de façon optionnelle.

Ces outils ne sont pas installés automatiquement. Le skill actif doit détecter leur disponibilité et annoncer un blocker si l'étape ne peut pas être prouvée.
