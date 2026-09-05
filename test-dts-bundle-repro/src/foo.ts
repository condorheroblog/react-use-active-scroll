/**
 * Sub-module A: defines the Foo interface.
 */
export interface Foo {
	/** A required name property. */
	name: string;
	/** An optional numeric value. */
	value?: number;
}

export function createFoo(name: string, value?: number): Foo {
	return { name, value };
}
