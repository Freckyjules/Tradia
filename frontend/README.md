# Tradia — front

Le site de Tradia, en Angular 22. Il a été généré avec [Angular CLI](https://github.com/angular/angular-cli) 22.2.0.

La structure des dossiers et les conventions sont décrites dans
[`interne/front/CLAUDE.md`](../interne/front/CLAUDE.md).

## Prérequis

- [Node.js](https://nodejs.org/) **24 LTS** (ou 22.22.3 minimum).
- L'API démarrée pour que le site fonctionne (voir plus bas).

## Installer

```bash
npm install
```

## Lancer en développement

```bash
npm start
```

Le site est alors sur <http://localhost:4200/>. Il se recharge tout seul à chaque
modification d'un fichier source.

Le front appelle l'API par des adresses relatives en `/api/…`. En développement,
`proxy.conf.json` les redirige vers l'API sur `http://localhost:5138` : il faut
donc la lancer à côté, dans un autre terminal.

```bash
cd ../backend
dotnet run --project Tradia.Api --launch-profile http
```

La page d'accueil indique si l'API est bien jointe.

## Créer du code

Angular CLI génère le squelette des composants, services, etc. Par exemple, pour
une page dans une feature :

```bash
ng generate component features/accueil/pages/accueil-page
```

La liste complète de ce qu'on peut générer :

```bash
ng generate --help
```

## Compiler

```bash
npm run build
```

Le résultat est déposé dans `dist/`. Par défaut, la compilation de production
optimise l'application en taille et en vitesse.

## Tests

Les tests unitaires utilisent [Vitest](https://vitest.dev/) :

```bash
npm test
```

## Pour aller plus loin

La [documentation d'Angular CLI](https://angular.dev/tools/cli) détaille toutes
les commandes.
