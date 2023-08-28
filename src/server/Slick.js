const PagesManager = require("./../pages/PagesManager.js");
const Config = require("./Config.js");
const Router = require("./Router.js");
const fs = require("fs");


// TODO: getName -> get name

module.exports = class Slick{
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