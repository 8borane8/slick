import { Compiler } from "./Compiler.js";
import { Page } from "./Page.js";
import fs from "fs";

export class PagesManager{
    static appName = "app";

    #pages = new Map();
    #app = null;
    #compiler;
    #config;

    constructor(config){
        this.#config = config;
        this.#compiler = new Compiler(this.#config);
    }

    static #loadPagesFromDirectory(path, pages){
        for(let x of fs.readdirSync(path, { withFileTypes: true })){
            if(x.isDirectory()){
                pages = PagesManager.#loadPagesFromDirectory(`${path}/${x.name}`, pages);
                continue;
            }
            
            pages.push(fs.readFileSync(`${path}/${x.name}`, { encoding: "utf-8"}));
        }

        return pages;
    }

    getApp(){
        return this.#app;
    }

    async loadPages(workingDirectory){
        for(let page of PagesManager.#loadPagesFromDirectory(`${workingDirectory}/pages`, [])){
            page = new Page(await this.#compiler.compilePage(page));
            if(page.getUrl() == PagesManager.appName){
                this.#app = page;
                continue;
            }

            this.#pages.set(page.getUrl(), page);
        }
    }

    async sendPageForGetMethod(req, res){
        if(!this.#pages.has(req.url)){
            return null;
        }

        const page = this.#pages.get(req.url);
        if(page.canload != null){
            const canload = await page.canload(req, res);
            if(canload != true){
                res.redirect(canload);
                return;
            }
        }

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.status(200).send(await this.#compiler.createDOM(this.#app, page, req));
    }

    async sendPageForPostMethod(req, res){
        if(!this.#pages.has(req.url)){
            req.url = this.#config.getRedirect404();
        }
        
        let page = this.#pages.get(req.url);
        if(page.canload != null){
            const canload = await page.canload(req, res);
            if(canload != true){
                req.url = canload;
                page = this.#pages.get(canload.split("#")[0].split("?")[0]);
            }
        }

        res.status(200).send(await page.getPostReponse(req));
    }

    preventErrors(){
        if(this.#app == null)
            throw new Error(`The '${PagesManager.appName}' page does not exist.`);

        if(!this.#pages.has(this.#config.getRedirect404()))
            throw new Error(`The 404 page does not exist.`);
    }
}