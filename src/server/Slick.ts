import TemplateManager from "../managers/TemplateManager";
import PageManager from "../managers/PageManager";
import FileHelper from "../helpers/FileHelper";
import Config from "../interfaces/Config";
import Logger from "../helpers/Logger";
import Router from "./Router";

const expressapi = require("@borane/expressapi");

import fs from "fs";

const defaultConfig: Config = {
    workspace: process.cwd(),
    port: 5000,

    lang: "en",
    alias: {
        "/favicon.ico": "/assets/favicon.ico",
        "/robots.txt": "/assets/robots.txt"
    },

    redirect404: "/",
    development: false
};

export class Slick {
    private static readonly urlRegex: RegExp = /^(?:\/[^\/]+)+$/;

    private readonly config: Config;

    private readonly templateManager: TemplateManager;
    private readonly pageManager: PageManager;

    private readonly httpServer: any;
    private readonly router: Router;

    private running: boolean = false;

    constructor(config: Config = defaultConfig) {
        this.config = { ...defaultConfig, ...config };
        this.preventErrors();

        this.templateManager = new TemplateManager(this.config.workspace);
        this.pageManager = new PageManager(this.config.workspace);

        this.preventErrors2();

        this.router = new Router(this.config, this.templateManager, this.pageManager);

        this.httpServer = new expressapi.HttpServer(this.config.port);
        this.httpServer.endpointNotFoundFunction = this.router.requestListener.bind(this.router);

        this.running = true;

        this.httpServer.listen(() => Logger.info(`Slick has been started on port ${this.config.port}.`));
        process.once("SIGINT", this.stop.bind(this));

        if (this.config.development) {
            const watcher = fs.watch(this.config.workspace, { recursive: true, persistent: false }, () => {
                watcher.close();
                this.stop();

                new Slick(this.config);
            });
        }
    }

    private preventErrors() {
        if (!fs.existsSync(this.config.workspace))
            Logger.error(`The specified workspace does not exist.`);

        if (this.config.redirect404 != "/" && !Slick.urlRegex.test(this.config.redirect404))
            Logger.error(`Invalid redirect 404 url. Please provide a valid format: ${this.config.redirect404}`);

        if (Object.entries(this.config.alias).some(([key, value]) => !Slick.urlRegex.test(key) || !Slick.urlRegex.test(value)))
            Logger.error(`Invalid alias url. Please provide a valid format: ${Slick.urlRegex}`);

        for (let directory of FileHelper.requiredDirectories) {
            if (!fs.existsSync(`${this.config.workspace}/${directory}`))
                Logger.warn(`The directory named '${directory}' does not exist.`);
        }
    }

    private preventErrors2() {
        if (!this.pageManager.pages.some(page => page.url == this.config.redirect404))
            Logger.error(`The 404 page does not exist.`);

        for(let page of this.pageManager.pages){
            if (FileHelper.staticDirectories.some(directory => page.url.startsWith(directory)))
                Logger.error(`URLs starting with ${FileHelper.staticDirectories.map(o => `'${o}'`).join(", ")} are reserved.`);

            if (!this.templateManager.templates.some(template => template.name == page.template))
                Logger.error(`The template '${page.template}' does not exist.`);
        }
    }

    private stop() {
        if(!this.running)
            return;

        this.running = false;

        this.httpServer.stop();
        Logger.info("Slick has been stopped.\n");
    }
}