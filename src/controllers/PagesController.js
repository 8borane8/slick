const TemplatesController = require("./TemplatesController.js");
const FileHelper = require("./../utils/FileHelper.js");
const Compiler = require("./../utils/Compiler.js");
const Config = require("./../server/Config.js");
const Logger = require("./../utils/Logger.js");
const Page = require("./../classes/Page.js");
const fs = require("fs");

module.exports = class PagesController{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #staticFolders = ["/assets", "/styles", "/scripts"];
    static #pages = new Map();

    static async loadPages(){
        PagesController.#pages.clear();

        for(let filePath of FileHelper.listFilesInFolder(`${Config.workspace}/pages`)){
            let page = fs.readFileSync(filePath, { encoding: "utf-8"});
            page = await Compiler.parse(page);
            page = new Page(page);

            if(PagesController.#pages.has(page.name)){
                Logger.error(`The page '${page.name}' already exist.`);
                continue;
            }
            
            PagesController.#pages.set(page.url, page);
        }
    }

    static preventErrors(){
        if(!PagesController.#pages.has(Config.redirect404))
            Logger.error(`The 404 page '${Config.redirect404}' does not exist.`);

        for(let page of PagesController.#pages.values()){
            if(PagesController.#staticFolders.some(url => page.url.startsWith(url)))
                Logger.error(`URLs starting with ${PagesController.#staticFolders.map(o => `'${o}'`).join(", ")} are reserved.`);

            if(TemplatesController.getTemplate(page.template) == null)
                Logger.error(`The template '${page.template}' does not exist.`);
        }
    }

    static getPage(url){
        return PagesController.#pages.get(url) ?? null;
    }

    static enumPages(){
        return PagesController.#pages.values();
    }

    static get staticFolders(){
        return PagesController.#staticFolders;
    }
}