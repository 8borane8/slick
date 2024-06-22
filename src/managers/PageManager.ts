import FileHelper from "../helpers/FileHelper";
import Compiler from "../helpers/Compiler";
import Logger from "../helpers/Logger";
import Page from "../interfaces/Page";

import fs from "fs";

export default class PageManager {
    public readonly pages: Array<Page> = [];

    constructor(workspace: string) {
        for (let path of FileHelper.listFilesInDirectory(`${workspace}/pages`)) {
            let code = fs.readFileSync(path, { encoding: "utf-8"});
            const page: Page = Compiler.parse(code);

            if(this.pages.some(p => p.url == page.url))
                Logger.error(`Duplicated page for url '${page.url}'.`);

            this.pages.push(page);
        }
    }
}