const uglifyjs = require("uglify-js");
const cleancss = require("clean-css");
const fs = require("fs");

module.exports = class Minifier{
    #cache = new Map();
    #cssMinifier = new cleancss();

    getMinifiedFile(filePath, mimeType){
        if(this.#cache.has(filePath))
            return this.#cache.get(filePath);

        const cachedFile = {
            content: null,
            timestamp: Date.now()
        };

        if(mimeType == "text/css")
            cachedFile.content = this.#cssMinifier.minify(fs.readFileSync(filePath, { encoding: "utf-8"})).styles;
        else if(mimeType == "application/javascript"){
            cachedFile.content = uglifyjs.minify(fs.readFileSync(filePath, { encoding: "utf-8"}), { mangle: { keep_fnames: true } }).code;
        }

        this.#cache.set(filePath, cachedFile);
        return cachedFile;
    }
}