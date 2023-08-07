import { PagesManager } from "./PagesManager.js";
import uglifyjs from "uglify-js";
import fs from "fs";

let __dirname = new URL('.', import.meta.url).pathname;
if(!fs.existsSync(__dirname))
    __dirname = __dirname.slice(1);


export class Compiler{
    static #dom = fs.readFileSync(`${__dirname}../dom.html`, { encoding: "utf-8"});

    static #templateRegex = /<template>(.*?)<\/template>/gs;
    static #propertyRegex = /(^|[^=])(\s*)(\{[^}]+\})/gs;
    static #attributeRegex = /=\s*(\{[^}]+\})/gs;

    #bodyRegex;

    #script = fs.readFileSync(`${__dirname}/../script.js`, { encoding: "utf-8"});
    #config;

    constructor(config){
        this.#bodyRegex = new RegExp(`(<[^>]*id\\s*=\\s*['"]${PagesManager.appName}['"][^>]*>).*?(<\\/[^>]*>)`, "s");
        this.#config = config;

        if(process.env.DEVELOPMENT ?? false)
            this.#script = uglifyjs.minify(this.#script).code;
    }

    async compilePage(code){
        code = code.replace(Compiler.#templateRegex, function(_match, group){
            let newCode = group.replace(Compiler.#propertyRegex, (_match, g1, g2, g3) => `${g1}${g2}\$${g3}`);
            newCode = newCode.replace(Compiler.#attributeRegex, (_match, group) => `="\$${group}"`);
            return `\`${newCode}\``;
        });

        code = `return (async () => {
            const config = JSON.parse(\`${JSON.stringify(this.#config.getConfig())}\`);
            ${code}
        })();`;

        return await Function(code)();
    }

    async createDOM(app, page, req){
        const styles = [...app.getStyles(true), ...page.getStyles()].join("\n");
        const scripts = [...app.getScripts(true), ...page.getScripts()].join("\n");

        const pageBody = await page.getBody(req);
        const body = (await app.getBody(req)).replace(this.#bodyRegex, function(_match, p1, p2){
            return `${p1}${pageBody}${p2}`;
        });

        return Compiler.#dom
            .replace("/--lang--/", this.#config.getLang())
            .replace("/--title--/", page.getTitle())
            .replace("/--appPageHead--/", await app.getHead())
            .replace("/--styles--/", styles)
            .replace("/--favicon--/", page.getFavicon())
            .replace("/--currentPageHead--/", await page.getHead())
            .replace("/--body--/", body)
            .replace("/--script--/", this.#script)
            .replace("/--scripts--/", scripts);
    }
}