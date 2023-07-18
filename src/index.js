#!/usr/bin/env node
"use strict";

const expressapi = require("@borane/expressapi");
const cleancss = require("clean-css");
const uglifyjs = require("uglify-js");
const mime = require('mime');
const fs = require("fs");

// Récupération du port
let port = 5000;
for (let arg of process.argv) {
    if (!arg.startsWith("--port=")) { continue; }

    port = parseInt(arg.split("=")[1]);
    break;
}

// Initialisation des constantes
const __script__ = process.argv.includes("--dev") ?
    fs.readFileSync(`${__dirname}/script.js`, { encoding: "utf-8"}) :
    uglifyjs.minify(fs.readFileSync(`${__dirname}/script.js`, { encoding: "utf-8"})).code;

const __server__ = new expressapi.HttpServer(port);
const __cachedStaticFiles__ = new Map();
const __cssMinifier__ = new cleancss();
const __pages__ = new Map();
const assetsRedirect = [
    "/favicon.ico",
    "/robots.txt"
];

// Déclaration de la méthode permettant de charger un module à partir de son contenu en mémoire
function requireFromString(src) {
    const m = new module.constructor();
    m._compile(src, "");
    return m.exports;
}

// Chargement des pages
fs.readdirSync(`./pages/`).forEach(function(pageFile){
    const compiledCode = fs.readFileSync(`./pages/${pageFile}`, { encoding: "utf-8"}).replace(/<template>(.*?)<\/template>/gs, function(_match, group){
        const compiledFunction = group.replace(/\{(.*?[^()])\}/gs, (_match, group) => `\${${group}}`)
        return `\`${compiledFunction}\``;
    });

    const m = requireFromString(compiledCode);
    __pages__.set(m.path, m);
});

// Déclaration de la fonction permettant de servir les fichiers statiques
async function sendStaticFile(req, res){
    req.url = `.${req.url}`;
    if(__cachedStaticFiles__.has(req.url)){
        const cachedStaticFile = __cachedStaticFiles__.get(req.url);

        res.setHeader("Cache-Control", "max-age=31536000");
        res.setHeader("Last-Modified", cachedStaticFile.get("lastModified"));
        res.setHeader("Content-Type", cachedStaticFile.get("type"));
        res.setHeader("eTag", cachedStaticFile.get("eTag"));

        if(!cachedStaticFile.has("content")){
            res.sendFile(req.url);
            return;
        }

        res.status(200).send(cachedStaticFile.get("content"));
        return;
    }

    if(!fs.existsSync(req.url)){ return res.status(404).send("404 Not found."); }
    const cachedStaticFile = new Map();
    cachedStaticFile.set("lastModified", new Date().toUTCString());
    cachedStaticFile.set("type", mime.getType(req.url));

    res.setHeader("Cache-Control", "max-age=31536000");
    res.setHeader("Last-Modified", cachedStaticFile.get("lastModified"));
    res.setHeader("Content-Type", cachedStaticFile.get("type"));

    switch(req.url.substring(1).match(/\.([^.?]+).*$/)[1]){
        case "js":
            cachedStaticFile.set("content", fs.readFileSync(req.url, { encoding: "utf-8"}));
            if(!process.argv.includes("--dev")){
                cachedStaticFile.set("content",
                    uglifyjs.minify(cachedStaticFile.get("content"), {
                        mangle: { keep_fnames: true }
                    }).code
                );
            }
            
            if(Object.keys(req.query).includes("slick-notrequired")){
                cachedStaticFile.set("content", `(async function(){${cachedStaticFile.get("content")}})()`);
            }
            break;

        case "css":
            cachedStaticFile.set("content", fs.readFileSync(req.url, { encoding: "utf-8"}));
            if(process.argv.includes("--dev")){ break; }
            cachedStaticFile.set("content", __cssMinifier__.minify(cachedStaticFile.get("content")).styles);
            break;

        default:
            cachedStaticFile.set("eTag", expressapi.sha256(fs.readFileSync(req.url)));
            res.setHeader("eTag", cachedStaticFile.get("eTag"));

            __cachedStaticFiles__.set(req.url, cachedStaticFile);
            res.sendFile(req.url);
            return;
    }
    
    cachedStaticFile.set("eTag", expressapi.sha256(cachedStaticFile.get("content")));
    res.setHeader("eTag", cachedStaticFile.get("eTag"));

    __cachedStaticFiles__.set(req.url, cachedStaticFile);
    res.status(200).send(cachedStaticFile.get("content"));
}

// Définition des routes permettant de servir les fichiers statiques
__server__.get("/styles/:file", sendStaticFile);
__server__.get("/scripts/:file", sendStaticFile);
__server__.get("/assets/:file", sendStaticFile);

// Déclaration de la fonction compilant les fonctions async se trouvant dans le body
async function compileBody(page, req) {
    const promises = [];
    page.body.replace(/{([^()]*)\(\)}/gs, function(_match, group){
        promises.push(page.renders[group](req))
    });

    const data = await Promise.all(promises);
    return page.body.replace(/{([^()]*)\(\)}/gs, () => data.shift());
}

// Déclaration de la fonction compilant les fonctions async se trouvant dans le body
async function createDOM(page, req, res) {
    // Compilation de la page
    const pageBody = await compileBody(page, req);
    const body = (await compileBody(__pages__.get("__app__"), req)).replace(/(<[^>]*\bid\s*=\s*['"]\s*root\s*['"][^>]*>)(?:.*?)(<\/[^>]*>)/gs, function(_match, p1, p2){
        return `${p1}${pageBody}${p2}`;
    });

    // Génération des styles et des scripts
    const styles = [...__pages__.get("__app__").styles.map(style => `<link rel="stylesheet" href="${style}">`),
        ...page.styles.map(style => `<link rel="stylesheet" href="${style}?slick-notrequired">`)];
    const scripts = [...__pages__.get("__app__").scripts.map(script => `<script src="${script}" type="application/javascript"></script>`),
        ...page.scripts.map(script => `<script src="${script}?slick-notrequired" type="application/javascript"></script>`)];

    
    return `<!DOCTYPE html>
<html lang="${__pages__.get("__app__").configuration.lang}">
    <head>
       <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>

        ${styles.join("\n")}
        ${__pages__.get("__app__").head == null ? "" : __pages__.get("__app__").head}
        <link rel="icon shortcut" href="${page.icon == null ? '' : page.icon}">
        ${page.head == null ? "" : page.head}
    </head>
    <body>
        ${body}
        <script>${__script__}</script>
        ${scripts.join("\n")}
    </body>
</html>`;
}

__server__.setNotFoundEndpointFunction(async function(req, res){
    if(assetsRedirect.includes(req.url)){
        res.redirect(`/assets${req.url}`);
        return;
    }

    // Execution de la fonction onrequest
    if(__pages__.get("__app__").configuration.onrequest != null && await __pages__.get("__app__").configuration.onrequest(req, res) == false){ return; }

    // Vérification de la page et redirection vers la page 404 si elle n'existe pas
    let page = __pages__.get(req.url);
    if(page == undefined){
        if(req.method == "GET"){
            res.redirect(__pages__.get("__app__").configuration.default404);
            return;
        }

        req.url = __pages__.get("__app__").configuration.default404;
        page = __pages__.get(req.url);
    }

    // Execution de la fonction canload
    if (req.method === "GET") {
        const canload = page.canload == null ? true : await page.canload(req, res);
      
        if (canload == true) {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.status(200).send(await createDOM(page, req, res));
            return;
        }

        res.redirect(canload);
        return;
    }

    let path = req.url;
    if(page.canload != null){
        const canload = await page.canload(req, res);
        if(canload != true){
            page = __pages__.get(canload.split("#")[0].split("?")[0]);
            path = canload;
        }
    }

    if(req.method == "POST"){
        res.status(200).send({
            path: path,
            title: page.title,
            icon: page.icon,
            styles: page.styles.map(style => `${style}?slick-notrequired`),
            scripts: page.scripts.map(script => `${script}?slick-notrequired`),
            head: page.head,
            body: await compileBody(page, req)
        });
        return;
    }
});

// Lancement du serveur
__server__.listen();