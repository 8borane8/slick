#!/usr/bin/env node
//-*- js -*-

"use strict";

const expressapi = require("@borane/expressapi");
const { Module } = require('module');
const uglifyjs = require("uglify-js");
const cssminify = require("css-minify");
const fs = require("fs");

const isDevMod = true;

const __server__ = new expressapi.HttpServer(process.argv[2] == undefined ? 5000 : process.argv[2]);
const __script__ = isDevMod ? fs.readFileSync(`${__dirname}/src/script.js`, "utf-8") : uglifyjs.minify(fs.readFileSync(`${__dirname}/src/script.js`, "utf-8")).code;

const pages = new Map();

fs.readdirSync(`${__dirname}/../../../pages/`).filter(file => file.endsWith(".jsx")).forEach(file => {
    const code = fs.readFileSync(`${__dirname}/../../../pages/` + file, "utf-8");
    const module = new Module();
    module._compile(code.replace(/<template>(.*?)<\/template>/gs, (match, group) => `\`${group}\``), 'module.js');
    pages.set(module.exports.config.path, module.exports);
});

async function compileHTML(page, req, res) {
    let html = page.config.html;
    const promises = [];
    html.replace(/\{(.*?)\}/gs, (match, ...args) => {
        const promise = (async (match, group) => await page.renders[group](req, res))(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return html.replace(/\{(.*?)\}/gs, () => data.shift());
}

async function createDOM(page, req, res) {
    let html = await compileHTML(page, req, res);
    let __app__ = pages.get("__app__");

    html = (await compileHTML(__app__, req, res)).replace(/(<[^>]*\bid\s*=\s*['"]\s*root\s*['"][^>]*>)(?:.*?)(<\/[^>]*>)/gs, (match, p1, p2) =>
        `${p1}${html}${p2}`
    );

    const styles = [...__app__.config.styles.map(style => `<link rel="stylesheet" href="${style}">`)
    , ...page.config.styles.map(style => `<link rel="stylesheet" href="${style}" notrequired>`)];
    const scripts = [...__app__.config.scripts.map(script => `<script src="${script}?required" type="application/javascript"></script>`),
     ...page.config.scripts.map(script => `<script src="${script}" type="application/javascript" notrequired></script>`)];

    
    return `<!DOCTYPE html>
<html lang="${__app__.constantes.lang}">
    <head>
        <meta charset="${__app__.constantes.encoding}">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.config.title ? page.config.title : __app__.config.title}</title>
        ${page.config.icon ? `\n<link rel="icon shortcut" href="${page.config.icon}">` : __app__.config.icon ? `\n<link rel="icon" href="${pages.get("__app__").config.icon}">` : ""}
        ${styles.length != 0 ? "\n" + styles.join("\n") : ""}
    </head>
    <body>
        ${html}
        <script>${__script__}</script>${scripts.length != 0 ? "\n" + scripts.join("\n") : ""}
    </body>
</html>`;
}

const loadedMinify = new Map();
async function sendAsset(req, res){
    if(!fs.existsSync(`${__dirname}/../../../${req.url}`)){ return res.status(404).send(""); }
    let code = fs.readFileSync(`${__dirname}/../../../${req.url}`, "utf-8");

    if(loadedMinify.has(req.url)){ code = loadedMinify.get(req.url); }
    else{
        if(req.url.endsWith(".js")){
            code = isDevMod ? code : uglifyjs.minify(code, {
                mangle: { keep_fnames: true }
            }).code;

            if(!Object.keys(req.query).includes("required")){
                code = `(async function(){${code}})()`;
            }
        }
        else if(req.url.endsWith(".css")){ code = isDevMod ? code : await cssminify(code); }
        else{
            return res.status(200).sendFile(`${__dirname}/../../../${req.url}`);
        }
        loadedMinify.set(req.url, code);
    }
    
    res.status(200).send(code);
}

__server__.get("/styles/:file", sendAsset);
__server__.get("/scripts/:file", sendAsset);
__server__.get("/assets/:file", sendAsset);

__server__.setNotFoundEndpointFunction(async function(req, res){
    let page = pages.get(req.url);
    if (!page) {
        if(req.method == "GET"){
            return res.redirect("/");
        }
        page = pages.get("/");
    }

    if(page.canload != undefined){
        let canload = await page.canload(req, res);
        if(canload != true){
            if(req.method == "POST"){
                page = pages.get(canload);
            }else{
                return res.redirect(canload);
            }
        }
    }

    if(req.method == "POST"){
        return res.status(200).send(JSON.stringify({
            path: page.config.path,
            title: page.config.title,
            icon: page.config.icon,
            styles: page.config.styles,
            scripts: page.config.scripts,
            html: await compileHTML(page, req, res)
        }));
    }

    return res.status(200).send(await createDOM(page, req, res));
});

__server__.listen();