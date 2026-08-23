# Opérations : annotations, contexte et sécurité

## Annotation d'un prototype

Tous les starters fournis ont l'overlay installé. Pour un projet existant seulement, `annotate-inject` :

1. détecte Vite, Next.js, Nuxt ou Astro ;
2. copie le port adapté depuis `assets/annotate/` ;
3. monte le client uniquement en développement ;
4. expose un endpoint `goose-annotate` sans préfixe underscore ;
5. vérifie un envoi réel en développement et son indisponibilité en production.

Les messages sont enregistrés sous `<projet>/.goose/annotations/inbox/`. `annotate` traite les fichiers du plus ancien au plus récent : reproduire route et viewport, capturer la zone indiquée par la bbox, modifier seulement la cible, recapturer, puis déplacer l'item vers `processed/`. Ne supprimer aucune annotation silencieusement.

L'agent est responsable du serveur local et de l'URL de revue. Une passe non triviale ou finale doit repasser par `design-qa`.

## User context

`product-design:user-context` gère un fichier durable hors du dépôt du produit, sous `$GOOSE_HOME/.local/state/product-design/` par défaut. Il peut conserver :

- URLs produit, Storybook ou Figma ;
- préférences de navigateur ou de partage ;
- références de design system, tokens et composants ;
- screenshots et brand assets copiés dans son propre `assets/`.

Règles :

- lancer le preflight fourni par le skill quand le shell local est disponible ;
- lire le contexte existant par défaut, puis limiter l'inspection aux besoins de la tâche ;
- dater les entrées et donner aux images un nom explicite ;
- préférer quelques références utiles à un dump ;
- interpréter `status: not provided` comme une absence ;
- ne jamais sauvegarder secret, credential, clé, token privé ou donnée client copiée.

Le user-context fournit des valeurs par défaut durables. `get-context` reste responsable du brief courant, qui peut les remplacer sur demande.

## Sécurité opérationnelle

- Demander l'autorisation avant d'utiliser directement un navigateur différent de celui choisi.
- Ne pas contourner auth ou paywall pour capturer une URL.
- Ne pas publier sans demande explicite et ne pas annoncer un partage sans URL testée.
- Ne pas ajouter d'infrastructure de production, auth réelle, base de données ou intégration externe pendant une phase prototype.
- Garder secrets et données privées hors du dépôt, des screenshots, des annotations et des artefacts d'évaluation.
- Préserver l'architecture d'une app existante et suivre ses instructions locales.
- Signaler les capacités manquantes ; ne jamais inventer une capture, un résultat Image Gen, une QA ou un déploiement.

## Preuves minimales

| Affirmation | Preuve requise |
|---|---|
| « le prototype fonctionne » | serveur accessible et parcours principal exercé |
| « fidèle à la source » | comparaison source/rendu au même viewport et état |
| « annotation installée » | envoi dev écrit + endpoint production absent/refusé |
| « partagé » | URL de déploiement accessible |
| « accessible » | contrôles applicables réellement vérifiés, avec limites déclarées |
