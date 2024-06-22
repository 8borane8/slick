export default interface CachedFile {
    content: string | null;
    timestamp: number;
    mimeType: string;
}