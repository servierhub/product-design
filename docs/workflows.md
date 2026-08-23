# Workflows et gates

## Boucle principale

```text
router → brief → exploration visuelle ou inspection → build → QA → partage optionnel
```

### 1. Router

Charger `product-design:index` dès que l'utilisateur nomme Product Design ou le plugin. Identifier l'intention exacte : nouvelle interface, source visuelle, clone, redesign, audit, recherche, contexte sauvegardé, annotation ou partage.

### 2. Clarifier

`get-context` établit au minimum la cible de design et l'issue utilisateur. Il inspecte le contexte existant et ne pose qu'une question ciblée lorsque l'une manque. Pour un travail dans une app existante, commencer par les patterns et le design system locaux.

### 3. Explorer ou inspecter

- `research` produit une synthèse sourcée des problèmes et frictions ; les hypothèses restent étiquetées.
- `audit` examine une expérience précise sous les angles UX, design visuel et accessibilité.
- `ideate` rend exactement trois alternatives comparables.
- Une URL de référence doit être capturée et ouverte avant toute génération ou reproduction.

Pour un parcours multi-écrans, chaque alternative d'idéation est un board complet avec étapes ordonnées, décisions et récupération critique. Après le choix utilisateur, produire un plan d'écrans à IDs stables, puis les visuels détaillés un par un. Attendre l'approbation de l'ensemble.

### 4. Construire

- `image-to-code` exige une source sélectionnée ; pour un parcours, chaque écran requis doit avoir sa source détaillée.
- `url-to-code` sert au clone fidèle d'une URL, pas au redesign.
- Utiliser des données mock réalistes et rendre fonctionnel le parcours principal.
- Rester en phase prototype frontend tant que l'utilisateur n'a pas explicitement demandé l'industrialisation.

### 5. Vérifier

`design-qa` compare chaque état implémenté à sa source, avec le même viewport et le même état. Fournir les deux images ensemble, corriger les écarts visibles puis recapturer. Une simple inspection du code ou une capture isolée ne suffit pas.

### 6. Partager

N'exécuter `share` que sur demande explicite. Vérifier la cible d'hébergement disponible ou enregistrée, effectuer le déploiement et tester l'URL avant de déclarer le prototype partagé.

## Routage rapide

| Intention | Chaîne recommandée |
|---|---|
| Nouvelle interface | `index → get-context → ideate → image-to-code → design-qa` |
| Screenshot/mockup/Figma | `index → get-context → image-to-code → design-qa` |
| Clone fidèle d'une URL | `index → get-context → url-to-code → design-qa` |
| Redesign inspiré d'une URL | `index → get-context → capture → ideate → image-to-code → design-qa` |
| Critique d'un écran/parcours | `index → audit` |
| Recherche utilisateur sourcée | `index → research` |
| Feedback dans le navigateur | `annotate-inject` si nécessaire, puis `annotate` |
| Publication | ajouter `share` après build et QA |

## Gates

La spécification complète est `../references/product-decision-gates.md`.

- **G1** exige un brief exploitable, une valeur, un succès observable, les contraintes et références.
- **G2** compare exactement trois parcours complets au même périmètre et aboutit à un choix utilisateur.
- **G3** exige le plan, toutes les sources détaillées cohérentes et l'approbation de l'ensemble.
- **G4** cadre le prototype, ses états, données, hypothèse, métrique et hors-périmètre.
- **G5** sépare qualité d'exécution et validité du test produit.
- **G6** décide si l'évidence justifie l'industrialisation.
- **G7** couvre la readiness production, dont sécurité, données, accessibilité, observabilité et rollback.

Pour les travaux impliqués, écrire les records dans `.gates/`. Un critère dur absent bloque même avec un bon score. Documenter la confiance et le type d'évidence ; ne pas présenter l'approbation d'un décideur comme une preuve d'utilisabilité.

## Handoff

Le handoff doit commencer par le résultat visible ou l'URL de prototype, indiquer clairement les limites, et proposer une seule prochaine action utile. Ne pas noyer l'utilisateur dans les commandes, chemins internes ou traces, sauf s'il les demande ou qu'un blocker l'exige.
