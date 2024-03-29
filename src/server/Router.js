const TemplatesController = require("./../controllers/TemplatesController.js");
const PagesController = require("./../controllers/PagesController.js");
const Minifier = require("./../utils/Minifier.js");
const Logger = require("./../utils/Logger.js");
const Config = require("./Config.js");

const terser = require("terser");
const fs = require("fs");

module.exports = class Router{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #script = terser.minify_sync(fs.readFileSync(`${__dirname}/../client/script.js`, { encoding: "utf-8"}), { mangle: { keep_fnames: true } }).code;
    static #dom = fs.readFileSync(`${__dirname}/../client/dom.html`, { encoding: "utf-8"});
    static #bodyRegex = /(<[^>]*id\s*=\s*['"]app['"][^>]*>).*?(<\/[^>]*>)/s;

    static async #createDOM(req){
        const page = PagesController.getPage(req.url);
        const template = TemplatesController.getTemplate(page.template);

        const styles = [
            ...template.styles.map(s => `<link rel="stylesheet" href="${s}" slick-type="template">`),
            ...page.styles.map(s => `<link rel="stylesheet" href="${s}" slick-type="page">`)
        ].join("\n");
        const scripts = [
            ...template.scripts.map(s => `<script src="${s}" type="application/javascript" slick-type="template"></script>`),
            ...page.scripts.map(s => `<script src="${s}" type="application/javascript" slick-type="page"></script>`)
        ].join("\n");

        const pageBody = typeof page.body == "function" ? await page.body(req) : page.body;
        const body = (typeof template.body == "function" ? await template.body(req) : template.body).replace(Router.#bodyRegex, (_match, p1, p2) => `${p1}${pageBody}${p2}`);

        return Router.#dom
            .replace("/--lang--/", Config.lang)
            .replace("/--title--/", page.title)
            .replace("/--templateHead--/", typeof template.head == "function" ? await template.head(req) : template.head)
            .replace("/--styles--/", styles)
            .replace("/--favicon--/", page.favicon)
            .replace("/--pageHead--/", typeof page.head == "function" ? await page.head(req) : page.head)
            .replace("/--body--/", body)
            .replace("/--script--/", Router.#script + `Slick._template = "${template.name}";`)
            .replace("/--scripts--/", scripts);
    }

    static async requestListener(req, res){
        if(Config.development)
            Logger.log(`${req.method} => ${req.url}`);

        if(req.method == "GET"){
            if(Object.keys(Config.alias).includes(req.url))
                req.url = Config.alias[req.url];

            if(PagesController.staticFolders.some(url => req.url.startsWith(url))){
                Router.#sendStaticFile(req, res);
                return;
            }

            const page = PagesController.getPage(req.url);
            if(page == null){
                res.redirect(Config.redirect404);
                return;
            }

            const template = TemplatesController.getTemplate(page.template);

            const url = structuredClone(req.url);
            await template.onrequest(req);
            if(url != req.url){
                res.redirect(req.url);
                return;
            }

            await page.onrequest(req);
            if(url != req.url){
                res.redirect(req.url);
                return;
            }

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.status(200).send(await Router.#createDOM(req));
            return;
        }else if(req.method == "POST"){
            if(Object.keys(Config.alias).includes(req.url))
                req.url = Config.alias[req.url];

            if(PagesController.staticFolders.some(url => req.url.startsWith(url))){
                res.status(403).json({
                    success: false,
                    error: "400 Forbidden."
                });
                return;
            }

            if(!Object.keys(req.body).includes("template") || (req.body.template != null && TemplatesController.getTemplate(req.body.template) == null)){
                res.status(400).json({
                    success: false,
                    error: "400 Bad Request."
                });
                return;
            }

            const page = PagesController.getPage(req.url);
            if(page == null){
                res.redirect(Config.redirect404);
                return;
            }

            const template = TemplatesController.getTemplate(page.template);

            const url = structuredClone(req.url);
            await template.onrequest(req);
            if(url != req.url){
                res.redirect(req.url);
                return;
            }

            await page.onrequest(req);
            if(url != req.url){
                res.redirect(req.url);
                return;
            }

            res.status(200).json({
                template: req.body.template == page.template ? null : {
                    name: template.name,
                    styles: template.styles,
                    scripts: template.scripts,
                    head: typeof template.head == "function" ? await template.head(req) : template.head,
                    body: typeof template.body == "function" ? await template.body(req) : template.body
                },
                page: {
                    url: page.url,
                    title: page.title,
                    favicon : page.favicon,
                    styles: page.styles,
                    scripts: page.scripts,
                    head: typeof page.head == "function" ? await page.head(req) : page.head,
                    body: typeof page.body == "function" ? await page.body(req) : page.body
                }
            });
            return;
        }

        res.status(405).json({
            success: false,
            error: "405 Method Not Allowed."
        });
    }

    static #sendStaticFile(req, res){
        const filePath = Config.workspace + req.url;

        if(!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()){
            res.status(200).json({
                success: false,
                error: "404 Not Found."
            });
            return;
        }

        if(Config.development){
            res.sendFile(filePath);
            return;
        }

        const file = Minifier.getMinifiedFile(filePath);

        if(!req.headers["cache-control"].includes("no-cache") && req.headers["if-modified-since"] == file.timestamp){
            res.status(304).end();
            return;
        }

        res.setHeader("Cache-Control", "max-age=31536000");
        res.setHeader("ETag", file.timestamp);
        res.setHeader("Last-Modified", file.timestamp);
        res.setHeader("Content-Type", file.mimeType);

        if(file.content != null)
            return res.status(200).send(file.content);

        res.sendFile(filePath);
    }
}