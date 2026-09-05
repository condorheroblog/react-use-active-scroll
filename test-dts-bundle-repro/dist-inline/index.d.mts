declare interface Bar {
    /** A unique identifier. */
    id: string;
    /** A reference to Foo to force cross-module type resolution. */
    foo: Foo;
}

export declare function createRoot(options: RootOptions): RootOptions;

/**
 * Sub-module A: defines the Foo interface.
 */
declare interface Foo {
    /** A required name property. */
    name: string;
    /** An optional numeric value. */
    value?: number;
}

export declare interface RootOptions {
    foo: Foo;
    bar: Bar;
}

export { }
