import type { Asciidoctor } from 'asciidoctor';
export declare const setupProcessor: () => Asciidoctor;
interface NodeConverter {
    nodeName: string;
    converter: (node: Asciidoctor.Block) => string;
}
interface Attributes {
    [key: string]: string;
}
export declare class DocProcessor {
    nodeConverters: NodeConverter[];
    ad: Asciidoctor;
    registry: Asciidoctor.Extensions.Registry;
    doc: Asciidoctor.Document | null;
    constructor(nodeConverters?: NodeConverter[]);
    registerSyntaxHighlighter(): void;
    registerConverter(): void;
    load(content: string, attributes: Attributes): Asciidoctor.Document;
    convert(): string | null;
}
export {};
