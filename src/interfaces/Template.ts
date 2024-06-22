export default interface Template {
    readonly name: string;

    readonly styles: Array<string>;
    readonly scripts: Array<string>;

    readonly head: Function | string;
    readonly body: Function | string;

    readonly onrequest: Function | null;
}