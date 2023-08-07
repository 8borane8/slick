import { HttpServer } from "@borane/expressapi";
import { Minifier } from "./Minifier.js";
import mime from "mime";
import fs from "fs";

export class Router{
    static #staticFolders = ["/assets", "/styles", "/scripts"];

    #slick;
    #httpServer;
    #minifier = new Minifier();

    constructor(slick){
        this.#slick = slick;

        this.#httpServer = new HttpServer(this.#slick.port);
        this.#httpServer.setNotFoundEndpointFunction(this.#requestListener.bind(this))
    }

    #sendStaticFile(req, res){
        const filePath = `${this.#slick.getWorkingDirectory()}${req.url}`;
        const mimeType = mime.getType(filePath);
        const notRequired = Object.keys(req.query).includes("slick-not-required");
    
        if(!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()){
            res.status(404).send({
                success: false,
                error: "404 Not found."
            });
            return;
        }

        if(this.#slick.development){
            res.setHeader("Cache-Control", "no-cache");
            if(mimeType == "application/javascript" && notRequired){
                res.setHeader("Content-Type", mimeType);

                res.status(200).send(`(async () => {${fs.readFileSync(filePath, { encoding: "utf-8"})}})();`);
                return;
            }   

            res.status(200).sendFile(filePath);
            return;
        }

        const file = this.#minifier.getMinifiedFile(filePath, notRequired, mimeType);

        if(req.headers["if-modified-since"] == file.timestamp){
            res.status(304);
            res.end();
            return;
        }

        res.setHeader("Cache-Control", "max-age=31536000");
        res.setHeader("ETag", file.timestamp);
        res.setHeader("Last-Modified", file.timestamp);

        res.setHeader("Content-Type", mimeType);

        if(file.content == null){
            res.sendFile(filePath);
            return;   
        }
        
        res.status(200).send(file.content);
    }

    async #requestListener(req, res){
        if(this.#slick.development)
            console.log(`[${new Date().toString().split("(")[0].slice(0, -1)}] [INFOS] ${req.method} => ${req.url}`);

        const onrequest = this.#slick.getPagesManager().getApp().onrequest;
        if(!(onrequest == null || await onrequest(req, res)))
            return;

        if(Router.#staticFolders.filter(x => req.url.startsWith(x)).length == 1){
            this.#sendStaticFile(req, res);
            return;
        }

        if(Object.keys(this.#slick.alias).includes(req.url)){
            req.url = this.#slick.alias[req.url];
            this.#sendStaticFile(req, res);
            return;
        }

        if(req.method == "GET"){
            await this.#slick.getPagesManager().sendPageForGetMethod(req, res);
            return;
        }
        
        await this.#slick.getPagesManager().sendPageForPostMethod(req, res);
    }

    listen(){
        this.#httpServer.listen();
    }
}