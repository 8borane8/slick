const Config = require("./../server/Config.js");
const Logger = require("./Logger.js");
const fs = require("fs");

module.exports = class FileHelper{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #requiredFolders = ["templates", "pages", "assets", "styles", "scripts"];

    static listFilesInFolder(path){
        const files = new Array();

        for(let asset of fs.readdirSync(path, { encoding: "utf-8", withFileTypes: true, recursive: false })){
            const subpath = `${path}/${asset.name}`;
            if(asset.isDirectory()){
                files.push(...FileHelper.listFilesInFolder(subpath));
                continue;
            }

            files.push(subpath);
        }

        return files;
    }

    static preventErrors(){
        if(!fs.existsSync(Config.workspace))
            Logger.error(`The path '${Config.workspace}' does not exist.`);

        for(let folder of FileHelper.#requiredFolders){
            if(!fs.existsSync(`${Config.workspace}/${folder}`))
                Logger.error(`The folder named '${folder}' does not exist.`);
        }
    }
}