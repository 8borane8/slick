const TemplatesController = require("./../controllers/TemplatesController.js");
const PagesController = require("./../controllers/PagesController.js");
const FileHelper = require("./../utils/FileHelper.js");
const Logger = require("./../utils/Logger.js");
const Router = require("./Router.js");
const Config = require("./Config.js");

const { HttpServer } = require("@borane/expressapi");
const child_process = require("child_process");
const fs = require("fs");

module.exports = class Slick{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #httpServer;

    static async start(options = {}){
        Config.load(options);

        Config.preventErrors();
        FileHelper.preventErrors();

        await TemplatesController.loadTemplates();
        await PagesController.loadPages();

        PagesController.preventErrors();
        
        Slick.#httpServer = new HttpServer(Config.port);
        Slick.#httpServer.endpointNotFoundFunction = Router.requestListener;

        if(process.argv.includes("--reload"))
            Slick.#httpServer.listen(() => Logger.log(`Slick has been reloaded.`));
        else{
            Slick.#httpServer.listen(() => Logger.log(`Slick has been started on port ${Config.port}.`));

            process.once("SIGINT", () => {
                Slick.#httpServer.stop();
                Logger.log("Slick has been stopped.");
            });
        }

        if(Config.development){
            const watcher = fs.watch(Config.workspace, { recursive: true, persistent: false }, () => {
                watcher.close();

                Slick.#httpServer.stop();
                child_process.spawn(process.argv[0], [process.argv[1], "--reload"], { stdio: "inherit" });
            });
        }
    }
}