# Slick

Slick est un framework novateur permettant la création de Single Page Applications (SPA) à l'aide de Server Side Rendering (SSR). Conçu pour être rapide, léger et simple d'utilisation, Slick offre une alternative efficace pour le développement d'applications web modernes.

## Technologies

- Language : NodeJS
- Librairies : @borane/expressapi, clean-css, mime, uglify-js

## Avantages

- **Rapidité et Légèreté:** Slick est conçu pour offrir des performances élevées avec un script ne pesant que quelques kilooctets.
- **Support JSX:** Profitez de la puissance de la syntaxe JSX pour la création d'interfaces utilisateur.
- **Simplicité d'utilisation:** Avec une configuration minimale, Slick facilite le processus de développement.

## Installation

Pour commencer un nouveau projet avec Slick, suivez ces étapes après avoir installé [NodeJS](https://nodejs.org/):

1. Créez un nouveau répertoire: `mkdir Nouveau_Projet && cd Nouveau_Projet`.
2. Mettez en place la structure du projet `mkdir src && cd src && mkdir templates pages styles scripts assets`.
3. Initialisez le projet NodeJS: `npm init -y`.
4. Installez Slick: `npm i @borane/slick`.

5. Créez et personnalisez les champs `name`, `version`, et `author` du fichier `package.json`:
```json
{
    "name": "nouveau_projet",
    "version": "1.0.0",
    "author": "username",

    "scripts": {
        "dev": "node src/index.js --dev",
        "build": "node src/index.js"
    },

    "dependencies": {
        "@borane/slick": "^3.0.0"
    }
}
```

6. Lancez le projet avec l'une des commandes suivantes:
- `npm run dev`
- `npm run build`

## Documentation

### Fichier d'Initialisation (index.js)

Slick nécessite un fichier d'initialisation pour démarrer votre application. Créez le fichier `src/index.js`:

```js
const Slick = require("@borane/slick");

Slick.start({
    workspace: __dirname,
    port: 5000,

    lang: "en",
    alias: {
        "/favicon.ico": "/assets/favicon.ico",
        "/robots.txt": "/assets/robots.txt"
    },

    redirect404: "/",
    development: false
});
```

Ce fichier définit les paramètres essentiels pour le fonctionnement de Slick, tels que le répertoire racine, le port, les alias ...

### Templates

Les templates dans Slick définissent la structure des pages dans votre application. Chaque template est associé à une page spécifique et contient des informations sur les styles, les scripts, les balises <head> et <body>, ainsi que des fonctions facultatives pour personnaliser le comportement de la page.

```jsx
return {
    name: "dashboard",

    styles: [
        "/styles/dashboard.css"
    ],
    scripts: [
        "/scripts/dashboard.js"
    ],

    head: <>
        <meta name="robots" content="index, follow" />
    </>,
    body: (req) => {
        const classname = "url";
        return <>
            <p class={classname}>{req.url}</p>
            <div id="app"></div>
        </>
    },

    onrequest: (req) => {
        req.url = "/newurl";
    }
};
```

Propriétés :
- name: Le nom du template, utilisé pour l'associer aux pages correspondantes. ( String )
- styles: Tableau des chemins vers les fichiers CSS spécifiques au template. ( Array )
- scripts: Tableau des chemins vers les fichiers JavaScript spécifiques au template. ( Array )
- head: Contenu de la balise <head> ( <></> | Async function(req) )
- body: Contenu de la balise <body> ( <></> | Async function(req) )
- onrequest: Fonction facultative pour la gestion personnalisée des requêtes HTTP spécifiques au template. ( Null | Async function(req) )

Remarques :
- Les templates fournissent une structure réutilisable pour les pages, facilitant la gestion de la mise en page globale de l'application.
- Les styles et scripts spécifiques au template permettent de définir des ressources spécifiques à une mise en page particulière.
- Le conteneur avec l'identifiant "app" dans la section body est essentiel pour l'insertion correcte du contenu de la page. Assurez-vous de maintenir cet élément avec l'identifiant spécifié.
- La fonction onrequest offre un contrôle personnalisé sur le traitement des requêtes HTTP spécifiques au template, permettant des actions telles que les redirections en fonction de la logique de votre application grace à req.url.

### Pages

Les pages dans Slick définissent le contenu spécifique à afficher pour une URL particulière. Chaque page est associée à un template qui structure la mise en page générale de la page. Voici un exemple de structure de page :

```jsx
return {
    url: "/",
    template: "dashboard",

    title: "Index",
    favicon: "/favicon.ico",

    styles: [
        "/styles/dashboard/index.css"
    ],
    scripts: [
        "/scripts/dashboard/index.js"
    ],

    head: <>
        <meta name="og:description" content="Index" />
    </>,

    body: (req) => {
        const text = "This is the content of the page. Method:" + req.method;
        return <>
            <p>{text}</p>
        </>
    },

    onrequest: null || (req) => {
        req.url = "/newurl";
    }
};
```

Propriétés :
- url: L'URL associée à la page. ( String )
- template: Le nom du template à utiliser pour cette page. ( String )
- title: Titre de la page. ( String )
- favicon ( Null | String )
- styles: Tableau des chemins vers les fichiers CSS spécifiques au template. ( Array )
- scripts: Tableau des chemins vers les fichiers JavaScript spécifiques au template. ( Array )
- head: Contenu de la balise <head> ( <></> | Async function(req) )
- body: Contenu de la balise <body> ( <></> | Async function(req) )
- onrequest: Fonction facultative pour la gestion personnalisée des requêtes HTTP spécifiques au template. ( Null | Async function(req) )

Remarques :
- Assurez-vous que le template spécifié existe et correspond à celui défini dans le template global de l'application.
- Les styles et scripts sont spécifiques à chaque page, offrant une modularité pour le chargement de ressources.
- La fonction onrequest offre un contrôle personnalisé sur le traitement des requêtes HTTP spécifiques au template, permettant des actions telles que les redirections en fonction de la logique de votre application grace à req.url.

## Disclamer

Slick n'intègre pas directement le JSX de React. Toutefois, il compile les modules, permettant ainsi l'utilisation d'HTML au sein du JavaScript. Il est important de noter que cette fonctionnalité diffère de la prise en charge native du JSX de React et peut ne pas offrir les mêmes avantages ou fonctionnalités.

En tant que framework de développement, Slick est conçu pour allier performance et simplicité d'utilisation. Bien que nous nous efforcions d'offrir une expérience fluide, comme tout logiciel, Slick peut parfois présenter des bugs ou des vulnérabilités. Si vous rencontrez un problème ou si vous avez des préoccupations concernant la sécurité de Slick, nous vous encourageons vivement à nous en informer immédiatement.

**Vous aimez Slick ? Ajoutez une star à notre répertoire :star: :arrow_up:.**