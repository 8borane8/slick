module.exports = class Page{
    #required = false;
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

    setRequired(){
        this.#required = true;
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

    getStyles(){
        return this.#styles.map(style => `<link rel="stylesheet"${this.#required ? "" : " slick-not-required"} href="${style}">`);
    }

    getScripts(){
        return this.#scripts.map(script => `<script type="application/javascript"${this.#required ? "" : " slick-not-required"} src="${script}"></script>`);
    }

    async getBody(req){
        return typeof this.#body == "function" ? await this.#body(req) : this.#body;
    }

    async getHead(req){
        return typeof this.#head == "function" ? await this.#head(req) : this.#head;
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