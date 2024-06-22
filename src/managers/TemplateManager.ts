import FileHelper from "../helpers/FileHelper";
import Template from "../interfaces/Template";
import Compiler from "../helpers/Compiler";
import Logger from "../helpers/Logger";

import fs from "fs";

export default class TemplateManager {
    public readonly templates: Array<Template> = [];

    constructor(workspace: string) {
        for (let path of FileHelper.listFilesInDirectory(`${workspace}/templates`)) {
            let code = fs.readFileSync(path, { encoding: "utf-8"});
            const template: Template = Compiler.parse(code);

            if(this.templates.some(t => t.name == template.name))
                Logger.error(`Duplicated template for name '${template.name}'.`);

            this.templates.push(template);
        }
    }
}