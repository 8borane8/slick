export default interface Page {
    readonly url: string;
    readonly template: string;

    readonly title: string;
    readonly favicon: string | null;

    readonly styles: Array<string>;
    readonly scripts: Array<string>;

    readonly head: Function | string;
    readonly body: Function | string;

    readonly onrequest: Function | null;
}