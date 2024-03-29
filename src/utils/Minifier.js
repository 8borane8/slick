const cleancss = require("clean-css");
const terser = require("terser");
const mime = require("mime");
const fs = require("fs");

module.exports = class Minifier{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #cssMinifier = new cleancss();
    static #cache = new Map();

    static #minifyFile(filePath){
        const file = {
            content: null,
            timestamp: Date.now(),
            mimeType: mime.getType(filePath)
        };

        if(file.mimeType == "text/css")
            file.content = Minifier.#cssMinifier.minify(fs.readFileSync(filePath, { encoding: "utf-8" })).styles;

        else if(file.mimeType == "application/javascript")
            file.content = terser.minify_sync(fs.readFileSync(filePath, { encoding: "utf-8" })).code;

        return file;
    }

    static getMinifiedFile(filePath){
        if(Minifier.#cache.has(filePath))
            return Minifier.#cache.get(filePath);

        const file = Minifier.#minifyFile(filePath);

        Minifier.#cache.set(filePath, file);
        return file;
    }
}