# Slick

Slick est un framework permettant la création de Single Page Application en utilisant du Server Side Rendering.

## Technologies

- Language : NodeJS
- Librairies : @borane/expressapi, clean-css, mime, uglify-js

## Avantages

- Rapide / Léger
- Supporte la syntaxe JSX
- Simple d'utilisation

## Installation

Afin de démarrer un projet avec Slick, vous devez installer [NodeJS](https://nodejs.org/).
Exécuter ensuite les commandes ci-dessous:
```
mkdir Nouveau_Projet && cd Nouveau_Projet
mkdir pages styles scripts assets
npm init -y
npm i @borane/slick
npm i nodemon --save-dev
npm pkg delete scripts main keywords license
npm pkg set scripts.dev="nodemon --ext * --exec index.js" scripts.build="node index.js"
```

Par la suite nous vous conseillons de modifier les champs ci-dessous présents dans le fichier `package.json`:
```
name
version
description
author
```

Pour lancer le projet executez l'une des commandes suivantes:
```
npm run dev
npm run build
```

## Documentation

Slick requiert un fichier pour s'initialiser. Créez un fichier `index.jsx`.
Ajoutez le contenu suivant dans ce fichier.
```js
const { Slick } = require("@borane/slick");

const workingDirectory = import.meta.url.slice(8).split("/").slice(0, -1).join("/");

const slick = new Slick(workingDirectory, {
    port: 5005,
    development: true,
    alias: {
        "/favicon.ico": "/assets/favicon.ico",
        "/robots.txt": "/assets/robots.txt"
    },
    redirect_404: "/",
    config: {
        apiUrl: "http://127.0.0.1:5050"
    }
});

slick.run();
```

Slick requiert une "App Page". Créez un fichier `/pages/app.jsx`.
Voici toutes les propriétés et leurs valeures possibles:
```js
const title = "Bienvenue sur Slick !";
console.log(config); // Vous avez access à l'argument config défini plus haut.

return {
    url: "app", // Ne pas changer.

    styles: [ // Url des styles.
        "/styles/app.css"
    ],
    scripts: [ // Url des scripts.
        "/scripts/app.js"
    ],

    head: <template></template> || async function(req){
        return <template></template>;
    },

     // Require un container avec id ="app".
    body: <template>
        <h1>{title}</h1>
        <div id="app"></div>
    </template> || async function(req){
        return <template>
            <h1>{title}</h1>
            <div id="app"></div>
        </template>;
    },

    onrequest: null || async function(req, res){
        if(true)
            return true;

        res.status(400).send("Error.");
        return false;
    }
};
```

Pour créer une nouvelle page, créez un fichier `/pages/<name>.jsx` et ajoutez y cet exemple:

```js
return {
    url: "/", // Url de la page.

    styles: [ // Url des styles.
        "/styles/index.css"
    ],
    scripts: [ // Url des scripts.
        "/scripts/index.js"
    ],

    head: <template></template> || async function(req){
        return <template></template>;
    },

    body: <template></template> || async function(req){
        return <template></template>;
    },

    canload: null || async function(req, res){
        if(true)
            return true;

        return "/login";
    }
};
```

## Disclamer

Slick ne prend pas en charge directement le JSX de React. Cependant, Slick compile les modules pour permettre l'utilisation de HTML dans le JavaScript. Veuillez noter que cette fonctionnalité est différente de la prise en charge du JSX de React et peut ne pas offrir les mêmes avantages ou fonctionnalités.

Slick est un framework de développement conçu pour être performant et simple à utiliser. Cependant, comme tout logiciel, il peut parfois présenter des bugs ou des failles de sécurité. Si vous rencontrez un problème ou une préoccupation de sécurité avec Slick, veuillez nous en informer immédiatement afin que nous puissions le résoudre rapidement.