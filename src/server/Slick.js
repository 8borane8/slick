import { PagesManager } from "./../pages/PagesManager.js";
import { Router } from "./Router.js";
import fs from "fs";

export class Slick{
    static #requiredFolders = ["pages", "assets", "styles", "scripts"];

    #workingDirectory;
    #pagesManager;
    #router;

    constructor(workingDirectory, options = {}){
        this.#workingDirectory = workingDirectory;

        this.port = options.port ?? 5000;
        this.development = options.development ?? false;
        this.alias = options.alias ?? {
            "/favicon.ico": "/assets/favicon.ico",
            "/robots.txt": "/assets/robots.txt"
        };
        this.redirect_404 = options.redirect_404 ?? "/";
        this.config = options.config ?? {};

        this.#pagesManager = new PagesManager(this);
        this.#router = new Router(this);
    }

    getWorkingDirectory(){
        return this.#workingDirectory;
    }

    getPagesManager(){
        return this.#pagesManager;
    }

    #preventErrors(){
        Slick.#requiredFolders.forEach((f) => {
            if(fs.existsSync(`${this.workingDirectory}/${f}`)){
                throw new Error(`The foder named '${f}' could not be found.`);
            }
        });

        this.#pagesManager.preventErrors();
    }

    async run(){
        await this.#pagesManager.loadPages(`${this.#workingDirectory}/pages`);

        this.#preventErrors();
        this.#router.listen();
    }
}