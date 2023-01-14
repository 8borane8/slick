# Slick

Slick est un framework de développement de single page application (SPA) conçu pour être rapide, pratique et simple à utiliser.

## Technologies

- Language : NodeJS
- Librairies : @borane/expressapi, uglify-js, css-minify

## Avantages

- Rapide / Léger
- Supporte la syntaxe JSX
- Facile à utiliser

## Installation

Pour utiliser Slick, vous devez d'abord installer NodeJS sur votre ordinateur. Vous pouvez télécharger la dernière version de NodeJS [ici](https://nodejs.org/).

Une fois que NodeJS est installé, il vous suffit de télécharger le repository slick dans sa dernière version. Executer les lignes de commandes suivantes:

```
npm install
slick (port)
```

## Documentation

Pour commencer à coder, vous devrez éditer le fichier `/pages/__app__.jsx`. Vous pouvez y éditer les constantes qui seront uniques pour tout le site.

Une fois que vous avez fait cela, vous pouvez éditer la configuration. Assurez-vous de ne pas modifier la variable `path` et de la définir sur `__app__`. Si vous ne souhaitez pas d'icône, définissez sa valeur sur null.

Pour inclure des styles ou des scripts, voici la syntaxe de chemin vers le fichier :
```js
styles: [
    "/styles/<name>.css"
],
scripts: [
    "/scripts/<name>.js"
]
```

Dans le fichier `__app__` vous devez ajouter la variable `constants` :

```js
constantes: {
    lang: "en",
    encoding: "utf-8",
}
```

Passons maintenant à la variable `html`. Pour utiliser le JSX, vous devez **impérativement englober votre code HTML** avec la balise `template`. Pour ajouter des rendus, vous pouvez définir vos fonctions dans la catégorie renders. Voici un exemple :

```js
renders: {
    getTitle: function(){
        return <template>
            <h1>Titre</h1>
        </template>
    }
}
```

Pour utiliser cette fonction, vous devez l'encapsuler dans votre HTML.
**Faites attention à ne mettre que nom et les parenthèses**

```js
html : <template>
    {getTitle()}
</template>
```

Pour créer une nouvelle page, créez un fichier `<name>.jsx` dans le dossier `pages`. Copiez-y cet exemple :

```js
module.exports = {
    renders: {
        getTitle: async function(req, res){
            let title = "";
            return <template>
                {title}
            </template>;
        }
    },

    config: {
        path: "/",
    
        title: "Index",
        icon: null,
        styles: [
            "/styles/index.css"
        ],
        scripts: [
            "/scripts/index.js"
        ],
    
        html: <template>
            <p>{getTitle()}</p>
        </template>
    },

    canload: async function(req, res){ return true; }
}
```

Vous y retrouverez les mêmes paramètres que dans le fichier `__app__`. La fonction `canload` n'est pas requise, mais elle permet de rediriger vers une autre page en utilisant le code `return "/path"`.

## Disclamer

Slick ne prend pas en charge directement le JSX de React. Cependant, Slick compile les modules pour permettre l'utilisation de HTML dans le JavaScript. Veuillez noter que cette fonctionnalité est différente de la prise en charge du JSX de React et peut ne pas offrir les mêmes avantages ou fonctionnalités.

Slick est un framework de développement conçu pour être performant et simple à utiliser. Cependant, comme tout logiciel, il peut parfois présenter des bugs ou des failles de sécurité. Si vous rencontrez un problème ou une préoccupation de sécurité avec Slick, veuillez nous en informer immédiatement afin que nous puissions le résoudre rapidement.