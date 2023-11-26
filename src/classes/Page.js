module.exports = class{
    #url;
    #template;

    #title;
    #favicon;

    #styles;
    #scripts;

    #head;
    #body;

    #onrequest;

    constructor(page){
        this.#url = page.url;
        this.#template = page.template;

        this.#title = page.title;
        this.#favicon = page.favicon ?? "/favicon.ico";

        this.#styles = page.styles;
        this.#scripts = page.scripts;

        this.#head = page.head;
        this.#body = page.body;

        this.#onrequest = page.onrequest ?? (async () => {});
    }

    get url(){
        return this.#url;
    }

    get template(){
        return this.#template;
    }

    get title(){
        return this.#title;
    }

    get favicon(){
        return this.#favicon;
    }

    get styles(){
        return this.#styles;
    }

    get scripts(){
        return this.#scripts;
    }

    get head(){
        return this.#head;
    }

    get body(){
        return this.#body;
    }

    get onrequest(){
        return this.#onrequest;
    }
}