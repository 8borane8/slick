import TemplateManager from "../managers/TemplateManager";
import PageManager from "../managers/PageManager";
import CachedFile from "../interfaces/CachedFile";
import FileHelper from "../helpers/FileHelper";
import Config from "../interfaces/Config";
import Logger from "../helpers/Logger";

const cleancss = require("clean-css");
const mime = require("mime");

import terser from "terser";
import fs from "fs";

export default class Router {
    private static readonly dom: string = fs.readFileSync(`${__dirname}/../client/dom.html`, { encoding: "utf-8"});
    private static readonly appRegex: RegExp = /(<[^>]*id\s*=\s*['"]app['"][^>]*>).*?(<\/[^>]*>)/s;

    private readonly templateManager: TemplateManager;
    private readonly pageManager: PageManager;

    private readonly config: Config;
    private readonly script: string;

    private readonly cssMinifier = new cleancss();
    private readonly cache: Record<string, CachedFile> = {};

    constructor(config: Config, templateManager: TemplateManager, pageManager: PageManager) {
        this.templateManager = templateManager;
        this.pageManager = pageManager;

        this.config = config;
        this.script = fs.readFileSync(`${__dirname}/../client/script.js`, { encoding: "utf-8"});

        if(!this.config.development)
            this.script = terser.minify_sync(this.script).code ?? "";
    }

    private async createDOM(req: any): Promise<string | void> {
        const page = this.pageManager.pages.find(page => page.url == req.url);
        if(page == undefined)
            return;

        const template = this.templateManager.templates.find(template => template.name == page.template);
        if(template == undefined)
            return;

        const styles = [
            ...template.styles.map((s: string) => `<link rel="stylesheet" href="${s}" slick-type="template">`),
            ...page.styles.map((s: string) => `<link rel="stylesheet" href="${s}" slick-type="page">`)
        ];
        const scripts = [
            ...template.scripts.map((s: string) => `<script src="${s}" type="application/javascript" slick-type="template"></script>`),
            ...page.scripts.map((s: string) => `<script src="${s}" type="application/javascript" slick-type="page"></script>`)
        ];

        const pageHead = typeof page.head == "function" ? await page.head(req) : page.head;
        const templateHead = typeof template.head == "function" ? await template.head(req) : template.head;

        const pageBody = typeof page.body == "function" ? await page.body(req) : page.body;
        const templateBody = typeof template.body == "function" ? await template.body(req) : template.body;

        const body = templateBody.replace(Router.appRegex, (_match: string, p1: string, p2: string) => `${p1}${pageBody}${p2}`);

        return Router.dom
            .replace("/--lang--/", this.config.lang)
            .replace("/--title--/", page.title)
            .replace("/--templateHead--/", templateHead)
            .replace("/--styles--/", styles.join("\n"))
            .replace("/--favicon--/", page.favicon ?? "")
            .replace("/--pageHead--/", pageHead)
            .replace("/--body--/", body)
            .replace("/--script--/", this.script + `Slick.template = "${template.name}";`)
            .replace("/--scripts--/", scripts.join("\n"));
    }

    public async requestListener(req: any, res: any) {
        if (this.config.development)
            Logger.info(`${req.method} => ${req.url}`);

        if (!["GET", "POST"].includes(req.method))
            return res.status(405).json({
                success: false,
                error: "405 Method Not Allowed."
            });

        if (req.method == "GET") {
            if (Object.keys(this.config.alias).includes(req.url))
                req.url = this.config.alias[req.url];

            if (FileHelper.staticDirectories.some(url => req.url.startsWith(url)))
                return this.sendStaticFile(req, res);
        }
        else {
            if (FileHelper.staticDirectories.some(url => req.url.startsWith(url)))
                return res.status(403).json({
                    success: false,
                    error: "400 Forbidden."
                });

            if (!Object.keys(req.body).includes("template") || (req.body.template != null && !this.templateManager.templates.some(template => template.name == req.body.template)))
                return res.status(400).json({
                    success: false,
                    error: "400 Bad Request."
                });
        }

        const page = this.pageManager.pages.find(page => page.url == req.url);
        if (page == undefined)
            return res.redirect(this.config.redirect404);

        const template = this.templateManager.templates.find(template => template.name == page.template);
        if (template == undefined)
            return;

        const url = JSON.parse(JSON.stringify(req.url));
        if (typeof template.onrequest == "function")
            await template.onrequest(req);

        if (url != req.url)
            return res.redirect(req.url);

        if (typeof page.onrequest == "function")
            await page.onrequest(req);

        if (url != req.url)
            return res.redirect(req.url);

        if (req.method == "GET") {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.status(200).send(await this.createDOM(req));
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
    }

    private sendStaticFile(req: any, res: any) {
        const filePath = this.config.workspace + req.url;

        if(!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory())
            return res.status(200).json({
                success: false,
                error: "404 Not Found."
            });

        if(this.config.development)
            return res.sendFile(filePath);

        let file = this.getFileFromCache(filePath);

        if(!(Object.keys(req.headers).includes("cache-control") && req.headers["cache-control"].includes("no-cache")) && req.headers["if-modified-since"] == file.timestamp)
            return res.status(304).end();

        res.setHeader("Cache-Control", "max-age=31536000");
        res.setHeader("Last-Modified", file.timestamp);
        res.setHeader("Content-Type", file.mimeType);
        res.setHeader("ETag", file.timestamp);

        if(file.content != null)
            return res.status(200).send(file.content);

        res.sendFile(filePath);
    }

    private getFileFromCache(filePath: string): CachedFile {
        if (Object.keys(this.cache).includes(filePath))
            return this.cache[filePath];

        const file: CachedFile = {
            content: null,
            timestamp: Date.now(),
            mimeType: mime.getType(filePath)
        };

        if (file.mimeType == "text/css")
            file.content = this.cssMinifier.minify(fs.readFileSync(filePath, { encoding: "utf-8" })).styles;
        else if (file.mimeType == "application/javascript")
            file.content = terser.minify_sync(fs.readFileSync(filePath, { encoding: "utf-8" })).code ?? "";

        this.cache[filePath] = file;
        return file;
    }
}