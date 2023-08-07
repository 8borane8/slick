import uglifyjs from "uglify-js";
import cleancss from "clean-css";
import fs from "fs";

export class Minifier{
    #cache = new Map();
    #cssMinifier = new cleancss();

    getMinifiedFile(filePath, notRequired, mimeType){
        if(this.#cache.has(filePath)){
            return this.#cache.get(filePath);
        }

        const cachedFile = {
            content: null,
            timestamp: Date.now()
        };

        if(mimeType == "text/css"){
            cachedFile.content = this.#cssMinifier.minify(fs.readFileSync(filePath, { encoding: "utf-8"})).styles;
        }
        else if(mimeType == "application/javascript"){
            let content = fs.readFileSync(filePath, { encoding: "utf-8"});
            if(notRequired)
                content = `(async () => {${content}})();`;

            cachedFile.content = uglifyjs.minify(content, { mangle: { keep_fnames: true } }).code;
        }

        this.#cache.set(filePath, cachedFile);
        return cachedFile;
    }
}