module.exports = class Logger{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #getFormatedDate(){
        return new Date().toString().split(" ").slice(0, 5).join(" ");
    }

    static log(str){
        const date = this.#getFormatedDate();
        console.log(`[${date}] [INFO] ${str}`);
    }

    static error(str){
        const date = this.#getFormatedDate();
        console.log(`[${date}] [ERROR] ${str}`);
    }

    static throw(str){
        const date = this.#getFormatedDate();
        console.log(`[${date}] [FATAL] ${str}`);
        process.exit(1);
    }
}