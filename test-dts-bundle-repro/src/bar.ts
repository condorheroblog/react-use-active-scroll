/**
 * Sub-module B: defines the Bar interface and reuses Foo.
 */
import type { Foo } from "./foo.js";

export interface Bar {
	/** A unique identifier. */
	id: string;
	/** A reference to Foo to force cross-module type resolution. */
	foo: Foo;
}

export function createBar(id: string, foo: Foo): Bar {
	return { id, foo };
}
