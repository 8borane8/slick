import { PagesManager } from "./../pages/PagesManager.js";
import { Config } from "./Config.js";
import { Router } from "./Router.js";
import fs from "fs";

export class Slick{
    static #requiredFolders = ["pages", "assets", "styles", "scripts"];

    #workingDirectory;
    #pagesManager;
    #router;
    #config;

    constructor(workingDirectory, options = {}){
        this.#workingDirectory = workingDirectory;
        this.#config = new Config(options);

        this.#pagesManager = new PagesManager(this.#config);
        this.#router = new Router(this);
    }

    getConfig(){
        return this.#config;
    }

    getWorkingDirectory(){
        return this.#workingDirectory;
    }

    getPagesManager(){
        return this.#pagesManager;
    }

    #preventErrors(){
        for(let folder of Slick.#requiredFolders){
            if(!fs.existsSync(`${this.#workingDirectory}/${folder}`))
                throw new Error(`The folder named '${folder}' does not exist.`);
        }

        this.#pagesManager.preventErrors();
    }

    async run(){
        await this.#pagesManager.loadPages(this.#workingDirectory);

        this.#preventErrors();
        this.#router.listen();
    }
}