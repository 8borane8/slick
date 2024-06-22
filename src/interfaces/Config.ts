export default interface Config {
    readonly workspace: string;
    readonly port: number;
    
    readonly lang: string;
    readonly alias: Record<string, string>;

    readonly redirect404: string;
    readonly development: boolean;
}