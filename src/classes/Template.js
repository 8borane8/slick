module.exports = class{
    #name;

    #styles;
    #scripts;

    #head;
    #body;

    #onrequest;

    constructor(page){
        this.#name = page.name;

        this.#styles = page.styles;
        this.#scripts = page.scripts;

        this.#head = page.head;
        this.#body = page.body;

        this.#onrequest = page.onrequest ?? (() => { return true; });
    }

    get name(){
        return this.#name;
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