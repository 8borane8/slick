export default abstract class Logger {
    private static getFormatedDate(): string{
        return new Date().toString().split(" ").slice(0, 5).join(" ");
    }

    public static error(str: string) {
        const date = Logger.getFormatedDate();
        console.error(`[${date}] [ERROR] ${str}`);

        process.exit(1);
    }

    public static warn(str: string) {
        const date = Logger.getFormatedDate();
        console.warn(`[${date}] [WARN] ${str}`);
    }

    public static info(str: string) {
        const date = Logger.getFormatedDate();
        console.info(`[${date}] [INFO] ${str}`);
    }
}