const { HttpServer } = require("@borane/expressapi");
const Minifier = require("./Minifier.js");
const mime = require("mime");
const fs = require("fs");

module.exports = class Router{
    static #staticFolders = ["/assets", "/styles", "/scripts"];

    #slick;
    #httpServer;
    #minifier = new Minifier();

    constructor(slick){
        this.#slick = slick;

        this.#httpServer = new HttpServer(this.#slick.getConfig().getPort());
        this.#httpServer.setNotFoundEndpointFunction(this.#requestListener.bind(this))
    }

    #sendStaticFile(req, res){
        const filePath = `${this.#slick.getWorkingDirectory()}${req.url}`;
        const mimeType = mime.getType(filePath);
    
        if(!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()){
            res.status(404).send({
                success: false,
                error: "404 Not found."
            });
            return;
        }

        if(process.env.DEVELOPMENT){
            res.setHeader("Cache-Control", "no-cache");
            res.status(200).sendFile(filePath);
            return;
        }

        const file = this.#minifier.getMinifiedFile(filePath, mimeType);

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
        if(process.env.DEVELOPMENT)
            console.log(`[${new Date().toString().split("(")[0].slice(0, -1)}] [INFO] ${req.method} => ${req.url}`);

        const onrequest = this.#slick.getPagesManager().getApp().onrequest;
        if(!(onrequest == null || await onrequest(req, res)))
            return;

        if(Router.#staticFolders.filter(x => req.url.startsWith(x)).length == 1){
            this.#sendStaticFile(req, res);
            return;
        }

        if(Object.keys(this.#slick.getConfig().getAlias()).includes(req.url)){
            req.url = this.#slick.getConfig().getAlias()[req.url];
            this.#sendStaticFile(req, res);
            return;
        }

        if(req.method == "GET"){
            await this.#slick.getPagesManager().getPage(req, res); // TODO: paradigme
            return;
        }
        
        await this.#slick.getPagesManager().postPage(req, res); // TODO: paradigme
    }

    listen(){
        this.#httpServer.listen();
    }
}