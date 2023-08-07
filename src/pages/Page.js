export class Page{
    #url;

    #title;
    #favicon;

    #head;
    #body;

    #styles;
    #scripts;

    constructor(options){
        this.#url = options.url;

        this.#title = options.title ?? "";
        this.#favicon = options.favicon ?? "";

        this.#styles = options.styles;
        this.#scripts = options.scripts;

        this.#head = options.head;
        this.#body = options.body;

        this.canload = options.canload ?? null;
        this.onrequest = options.onrequest ?? null;
    }

    getUrl(){
        return this.#url;
    }

    getTitle(){
        return this.#title;
    }

    getFavicon(){
        return this.#favicon;
    }

    getStyles(required = false){
        return this.#styles.map(style => `<link rel="stylesheet"${required ? "" : " slick-not-required"} href="${style}">`);
    }

    getScripts(required = false){
        return this.#scripts.map(script => `<script type="application/javascript" src="${script}${required ? "" : "?slick-not-required"}"></script>`);
    }

    async getBody(req){
        return this.#body instanceof Function ? await this.#body(req) : this.#body;
    }

    async getHead(req){
        return this.#head instanceof Function ? await this.#head(req) : this.#head;
    }

    async getPostReponse(req){
        return {
            url: req.url,

            title: this.#title,
            favicon: this.#favicon,

            styles: this.#styles,
            scripts: this.#scripts,

            head: await this.getHead(req),
            body: await this.getBody(req)
        };
    }
}