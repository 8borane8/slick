const vm = require("vm");

module.exports = class Compiler{
    constructor(){
        throw Error("A static class cannot be instantiated.");
    }

    static #commentRegex = /{\s*\/\*.*\*\/\s*}/gs;
    static #propertyRegex = /(?<![=$])(\{.*?\})/gs;
    static #attributeRegex = /=\s*(\{.*?\})/gs;
    static #codeRegex = /<>(.*?)<\/>/gs;

    static parse(code){
        code = code.replace(Compiler.#codeRegex, (_match, group) => {
            let newCode = group.replace(Compiler.#commentRegex, "");
            newCode = newCode.replace(Compiler.#attributeRegex, (_match, group) => `="\$${group}"`);
            newCode = newCode.replace(Compiler.#propertyRegex, (_match, group) => `\$${group}`);
            return `\`${newCode}\``;
        });

        code = `(async () => {${code}})();`;
        return vm.runInContext(code, vm.createContext({
            process: process,
            console: console,
            require: require
        }));
    }
}