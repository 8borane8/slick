const FileHelper = require("./../utils/FileHelper.js");
const Template = require("./../classes/Template.js");
const Compiler = require("./../utils/Compiler.js");
const Config = require("./../server/Config.js");
const Logger = require("./../utils/Logger.js");

const fs = require("fs");

module.exports = class TemplatesController{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #templates = new Map();

    static async loadTemplates(){
        TemplatesController.#templates.clear();

        for(let filePath of FileHelper.listFilesInFolder(`${Config.workspace}/templates`)){
            let template = fs.readFileSync(filePath, { encoding: "utf-8"});
            template = await Compiler.parse(template);
            template = new Template(template);

            if(TemplatesController.#templates.has(template.name)){
                Logger.error(`The template '${template.name}' already exist.`);
                continue;
            }

            TemplatesController.#templates.set(template.name, template);
        }
    } 

    static getTemplate(name){
        return TemplatesController.#templates.get(name) ?? null;
    }
}