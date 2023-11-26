const uglifyjs = require("uglify-js");
const cleancss = require("clean-css");
const mime = require("mime");
const fs = require("fs");

module.exports = class Minifier{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #cssMinifier = new cleancss();
    static #cache = new Map();

    static async #minifyFile(filePath){
        const file = {
            content: fs.readFileSync(filePath),
            timestamp: Date.now(),
            mimeType: mime.getType(filePath)
        };

        if(file.mimeType == "text/css")
            file.content = Minifier.#cssMinifier.minify(file.content).styles;

        else if(file.mimeType == "application/javascript")
            file.content = uglifyjs.minify(file.content, { mangle: { keep_fnames: true } }).code;

        return file;
    }

    static async getMinifiedFile(filePath){
        if(Minifier.#cache.has(filePath))
            return Minifier.#cache.get(filePath);

        const file = await Minifier.#minifyFile(filePath);

        Minifier.#cache.set(filePath, file);
        return file;
    }
}