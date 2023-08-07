import { Compiler } from "./Compiler.js";
import { Page } from "./Page.js";
import fs from "fs";

export class PagesManager{
    static appName = "app";

    #pages = new Map();
    #app = null;
    #compiler;
    #slick;

    constructor(slick){
        this.#slick = slick;
        this.#compiler = new Compiler(this.#slick);
    }

    static #loadPagesFromDirectory(path, pages){
        for(let x of fs.readdirSync(path, { withFileTypes: true })){
            if(x.isDirectory()){
                pages = PagesManager.#loadPagesFromDirectory(`${path}/${x.name}`, pages);
                return;
            }
            
            pages.push(fs.readFileSync(`${path}/${x.name}`, { encoding: "utf-8"}));
        }

        return pages;
    }

    getApp(){
        return this.#app;
    }

    async loadPages(path){
        const pages = PagesManager.#loadPagesFromDirectory(path, []);
        for(let page of pages){
            page = new Page(await this.#compiler.compilePage(page));
            if(page.url == PagesManager.appName){
                this.#app = page;
                continue;
            }

            this.#pages.set(page.url, page);
        }
    }

    async sendPageForGetMethod(req, res){
        if(!this.#pages.has(req.url)){
            return null;
        }

        // TODO: canload
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
            req.url = this.#slick.redirect404;
        }
        
        let page = this.#pages.get(req.url);
        if(page.canload != null){
            const canload = await page.canload(req, res);
            if(canload != true){
                req.url = canload;
                page = this.#pages.get(canload.split("#")[0].split("?")[0]);
            }
        }

        const response = await page.getPostReponse();
        response.url = req.url;
        res.status(200).send(response);
    }

    preventErrors(){
        if(this.#app == null)
            throw new Error(`The '${PagesManager.appName}' page does not exist.`);

        if(!this.#pages.has(this.#slick.redirect404))
            throw new Error(`The 404 page does not exist.`);
    }
}