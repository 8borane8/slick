import { PagesManager } from "./PagesManager.js";
import uglifyjs from "uglify-js";
import fs from "fs";

export class Compiler{
    #script = fs.readFileSync(`${import.meta.url.slice(8).split("/").slice(0, -1).join("/")}/../script.js`, { encoding: "utf-8"});
    #bodyRegex;
    #slick;

    constructor(slick){
        this.#slick = slick;
        this.#bodyRegex = new RegExp(`(<[^>]*id\\s*=\\s*['"]${PagesManager.appName}['"][^>]*>).*?(<\\/[^>]*>)`, "s");

        if(this.#slick.development)
            this.#script = uglifyjs.minify(this.#script).code;
    }

    async compilePage(code){
        code = code.replace(/<template>(.*?)<\/template>/gs, function(_match, group){
            let newCode = group.replace(/(^|[^=])(\s*)(\{[^}]+\})/gs, (_match, g1, g2, g3) => `${g1}${g2}\$${g3}`);
            newCode = newCode.replace(/=\s*(\{[^}]+\})/gs, (_match, group) => `="\$${group}"`);
            return `\`${newCode}\``;
        });

        code = `return (async () => {
            const config = JSON.parse(\`${JSON.stringify(this.#slick.config)}\`);
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

        console.log()

        return `<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        ${await app.getHead()}
        ${styles}
        <link rel="icon shortcut" href="${page.favicon}">
        ${await page.getHead()}
    </head>
    <body>
        ${body}

        <script>${this.#script}</script>
        ${scripts}
    </body>
</html>`;
    }
}