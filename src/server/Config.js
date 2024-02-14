const Logger = require("./../utils/Logger.js");

module.exports = class Config{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #regexUrl = /^(?:\/[^\/]+)+$/;
    
    static #workspace;
    static #port;

    static #lang;
    static #alias;

    static #redirect404;
    static #development;

    static load(options){
        Config.#workspace = options.workspace ?? process.cwd();
        Config.#port = options.port ?? 5000;

        Config.#lang = options.lang ?? "en";
        Config.#alias = options.alias ?? {
            "/favicon.ico": "/assets/favicon.ico",
            "/robots.txt": "/assets/robots.txt"
        };

        Config.#redirect404 = options.redirect404 ?? "/";
        Config.#development = options.development ?? false;
    }

    static preventErrors(){
        if(Config.#redirect404 != "/" && !Config.#regexUrl.test(Config.#redirect404))
            Logger.throw(`Invalid redirect 404 url. Please provide a valid format: ${Config.#regexUrl}`);

        if(Object.entries(Config.#alias).some(o => !Config.#regexUrl.test(o[0]) || !Config.#regexUrl.test(o[1])))
            Logger.throw(`Invalid alias url. Please provide a valid format: ${Config.#regexUrl}`);
    }

    static get workspace(){
        return Config.#workspace;
    }

    static get port(){
        return Config.#port;
    }

    static get lang(){
        return Config.#lang;
    }

    static get alias(){
        return Config.#alias;
    }

    static get redirect404(){
        return Config.#redirect404;
    }

    static get development(){
        return Config.#development;
    }
}