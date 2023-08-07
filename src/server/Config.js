export class Config{
    #port;
    #alias;
    #redirect404;
    #lang;
    #config;

    constructor(options){
        this.#port = options.port ?? 5000;
        this.#alias = options.alias ?? {
            "/favicon.ico": "/assets/favicon.ico",
            "/robots.txt": "/assets/robots.txt"
        };
        this.#redirect404 = options.redirect404 ?? "/";
        this.#lang = options.lang ?? "en";
        this.#config = options.config ?? {};
    }

    getPort(){
        return this.#port;
    }

    getAlias(){
        return this.#alias;
    }

    getRedirect404(){
        return this.#redirect404;
    }

    getLang(){
        return this.#lang;
    }

    getConfig(){
        return this.#config;
    }
}