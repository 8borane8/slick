import uglifyjs from "uglify-js";
import cleancss from "clean-css";
import fs from "fs";

export class Minifier{
    #cache = new Map();
    #cssMinifier = new cleancss();

    getMinifiedFile(filePath){
        if(this.#cache.has(filePath)){
            return this.#cache.get(filePath);
        }

        const cachedFile = {
            content: null,
            timestamp: Date.now()
        };

        if(filePath.startsWith("./styles")){
            cachedFile.content = this.#cssMinifier.minify(fs.readFileSync(filePath, { encoding: "utf-8"})).styles;
        }
        else if(filePath.startsWith("./scripts")){
            cachedFile.content = uglifyjs.minify(fs.readFileSync(filePath, { encoding: "utf-8"}), { mangle: { keep_fnames: true } }).code;
        }

        this.#cache.set(filePath, cachedFile);
        return cachedFile;
    }
}