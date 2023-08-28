const Compiler = require("./Compiler.js");
const Page = require("./Page.js");
const fs = require("fs");

module.exports = class PagesManager{
    #pages = new Map();
    #app = null;
    #compiler;
    #config;

    constructor(config){
        this.#config = config;
        this.#compiler = new Compiler(this.#config);
    }

    static #loadPagesFromDirectory(path, pages = []){
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
        for(let page of PagesManager.#loadPagesFromDirectory(`${workingDirectory}/pages`)){
            page = new Page(await this.#compiler.compilePage(page));
            if(page.getUrl() == "app"){ // TODO: paradigme
                page.setRequired();
                this.#app = page;
                continue;
            }

            this.#pages.set(page.getUrl(), page);
        }
    }

    async getPage(req, res){
        await this.#sendPage(req, res, true);
    }

    async postPage(req, res){
        await this.#sendPage(req, res);
    }

    async #sendPage(req, res, isMethodGet = false){
        if(!this.#pages.has(req.url)){
            req.url = this.#config.getRedirect404();
        }
        
        let page = this.#pages.get(req.url);
        if(page.canload != null){
            const canload = await page.canload(req, res);
            if(canload != true){
                if(isMethodGet){
                    res.redirect(canload);
                    return;
                }

                req.url = canload;
                page = this.#pages.get(canload.split("#")[0].split("?")[0]);
            }
        }

        if(isMethodGet){
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.status(200).send(await this.#compiler.createDOM(this.#app, page, req));
            return;
        }

        res.status(200).send(await page.getPostReponse(req));
    }

    preventErrors(){
        if(this.#app == null)
            throw new Error(`The 'app' page does not exist.`);

        if(!this.#pages.has(this.#config.getRedirect404()))
            throw new Error(`The 404 page does not exist.`);
    }
}