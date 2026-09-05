import type { Foo } from "./foo";
import type { Bar } from "./bar";

export interface RootOptions {
	foo: Foo;
	bar: Bar;
}

export function createRoot(options: RootOptions): RootOptions {
	return options;
}
