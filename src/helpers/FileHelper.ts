import fs from "fs";

export default abstract class FileHelper {
    public static readonly requiredDirectories: Array<string> = ["templates", "pages", "styles", "scripts", "assets"];
    public static readonly staticDirectories: Array<string> = ["/styles", "/scripts", "/assets"];

    public static listFilesInDirectory(path: string): Array<string> {
        return fs.readdirSync(path, { withFileTypes: true }).flatMap(entry => {
            const subpath = `${path}/${entry.name}`;
            return entry.isDirectory() ? this.listFilesInDirectory(subpath) : subpath;
        });
    }
}