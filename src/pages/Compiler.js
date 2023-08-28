const PagesManager = require("./PagesManager.js");
const uglifyjs = require("uglify-js");
const fs = require("fs");
const vm = require("vm");

module.exports = class Compiler{
    static #dom = fs.readFileSync(`${__dirname}/../dom.html`, { encoding: "utf-8"});

    static #templateRegex = /<template>(.*?)<\/template>/gs;
    static #propertyRegex = /(^|[^=])(\s*)(\{[^}]+\})/gs;
    static #attributeRegex = /=\s*(\{[^}]+\})/gs;

    #bodyRegex = /(<[^>]*id\s*=\s*['"]app['"][^>]*>).*?(<\/[^>]*>)/s;

    #script = fs.readFileSync(`${__dirname}/../script.js`, { encoding: "utf-8"});
    #config;

    constructor(config){
        this.#config = config;

        if(process.env.DEVELOPMENT)
            this.#script = uglifyjs.minify(this.#script).code;
    }

    async compilePage(code){
        code = code.replace(Compiler.#templateRegex, function(_match, group){
            let newCode = group.replace(Compiler.#propertyRegex, (_match, g1, g2, g3) => `${g1}${g2}\$${g3}`);
            newCode = newCode.replace(Compiler.#attributeRegex, (_match, group) => `="\$${group}"`);
            return `\`${newCode}\``;
        });

        code = code.replace(/\/\/[^\n\r]*|\/\*[\s\S]*?\*\/|("[^"]*")/g, function(_match, p1){
            if(p1 == undefined)
                return "";

            return p1;
        });

        code = `(async () => {
            const config = JSON.parse(\`${JSON.stringify(this.#config.getConfig())}\`);
            ${code}
        })();`;
        
        return await vm.runInContext(code, vm.createContext({
            process: process,
            console: console,
            require: require
        }));
    }

    async createDOM(app, page, req){
        const styles = [...app.getStyles(), ...page.getStyles()].join("\n");
        const scripts = [...app.getScripts(), ...page.getScripts()].join("\n");

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