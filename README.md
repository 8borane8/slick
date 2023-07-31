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
npm pkg delete scripts.test main keywords license
npm pkg set scripts.dev="nodemon --ext * --exec slick --port=5000 --dev" scripts.build="slick --port=5000"
```

Créez les fichiers `/pages/__app__.jsx` et `/pages/index.jsx`.
Vous pouvez vous aider des exemples présent [ici](exemples/)

Pour lancer le projet executez l'une des commandes suivantes:
```
npm run dev
npm run build
```

Par la suite nous vous conseillons de modifier les champs ci-dessous présents dans le fichier `package.json`:
```
name
version
description
author
```

## Documentation

Slick requiert un fichier de configuration, il est généralement nommé `/pages/__app__.jsx`.
Voici toutes les propriétés et leurs valeures possibles:

```jsx
const title = "Header";

const head = `<meta name="keywords" content="HTML, CSS, JavaScript">`;

module.exports = {
    path: "__app__", // Ce paramètre ne peut être modifié

    configuration: {
        lang: "fr", // <html lang="">
        default404: "/", // Url de la page 404
        onrequest: null || async function(_req, res){
            if(...){
                res.status(200).send("Erreur");
                return false; // Empeche le chargement de la page
            }
            
            return true; // Autorise le chargement de la page
        }
    },

    renders: {
        getTitle: async function(_req){
            return <template>
                <h1>{title}</h1>
            </template>;
        }
    },

    styles: [
        "/styles/__app__.css" // Url des styles
    ],
    scripts: [
        "/scripts/__app__.js" // Url des scripts
    ],

    head: null || <template></template> || function(_req){
        return head;
    },

    // #root est requis
    body: <template>
        <header>{getTitle()}</header>
        <div id="root"></div>
    </template>,
}
```

Pour créer une nouvelle page, créez un fichier `/pages/<name>.jsx` et ajoutez y cet exemple:

```js
const message = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum beatae sed facilis excepturi soluta eligendi deleniti, et tempore autem voluptatum voluptate quos iusto ipsam fugiat repellat eveniet culpa provident laborum!";

const head = `<meta name="keywords" content="HTML, CSS, JavaScript">`;

module.exports = {
    path: "/",

    renders: {
        getMessage: async function(_req){
            return <template>
                <p>{message}</p>
            </template>;
        }
    },

    title: "Test",
    icon: null || "/assets/favicon.ico",

    styles: [
        "/styles/index.css"
    ],
    scripts: [
        "/scripts/index.js"
    ],

    head: <template></template> || function(_req){
        return head;
    },

    body: <template>
        {getMessage()}
    </template>,

    canload: null || async function(_req, _res){
        if(...){
            return "/login"; // Redirige vers l'url indiqué
        }
        
        return true; // Autorise le chargement de la page
    }
}
```

## Disclamer

Slick ne prend pas en charge directement le JSX de React. Cependant, Slick compile les modules pour permettre l'utilisation de HTML dans le JavaScript. Veuillez noter que cette fonctionnalité est différente de la prise en charge du JSX de React et peut ne pas offrir les mêmes avantages ou fonctionnalités.

Slick est un framework de développement conçu pour être performant et simple à utiliser. Cependant, comme tout logiciel, il peut parfois présenter des bugs ou des failles de sécurité. Si vous rencontrez un problème ou une préoccupation de sécurité avec Slick, veuillez nous en informer immédiatement afin que nous puissions le résoudre rapidement.