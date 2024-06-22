import Logger from "./Logger";

import vm from "vm";

export default abstract class Compiler {
    private static readonly commentRegex = /{\s*\/\*(?:(?!\*\/).)*\*\/\s*}/gs;

    public static parse(code: string): any {
        let tagLevel = 0;
        let bracketLevel = 0;
        let noBracketLevel = 0;

        let propertyLevels: number[] = [];

        const mapCode = code.split("");
        for(let i = 0; i < mapCode.length; i++){
            if(mapCode[i] == "<" && mapCode[i + 1] == ">"){
                mapCode.splice(i, 2, "`");
                tagLevel += 1;
                continue;
            }

            if(mapCode[i] == "<" && mapCode[i + 1] == "/"  && mapCode[i + 2] == ">"){
                mapCode.splice(i, 3, "`");
                tagLevel -= 1;
                continue;
            }

            if(tagLevel == 0)
                continue;

            if(mapCode[i] == "{"){
                if(tagLevel != bracketLevel){
                    if(mapCode[i - 1] == "="){
                        propertyLevels.push(tagLevel);
                        mapCode.splice(i, 0, "\"");
                        i += 1;
                    }

                    mapCode.splice(i, 0, "$");
                    bracketLevel += 1;
                    i += 1;
                    continue;
                }

                noBracketLevel += 1;
            }

            if(mapCode[i] == "}"){
                if(noBracketLevel == 0){
                    if(propertyLevels.includes(tagLevel)){
                        propertyLevels = propertyLevels.filter(level => level != tagLevel);
                        mapCode.splice(i + 1, 0, "\"");
                        i += 1;
                    }
                    bracketLevel -= 1;
                    continue;
                }
                noBracketLevel -= 1;
            }
        }

        code = mapCode.join("").replace(Compiler.commentRegex, "");
        code = `(() => {${code}})();`;

        try {
            return vm.runInContext(code, vm.createContext({
                process: process,
                console: console,
                require: require
            }));
        }catch(err: any) {
            Logger.error(err);
        }
    }
}