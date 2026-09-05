# test-dts-bundle-repro

Minimal reproduction for `unplugin-dts` behavior when `bundleTypes: true` is combined with `outDirs`.

## Files

- `src/index.ts`: main entry that re-exports `Foo` and `Bar` from sub-modules.
- `src/foo.ts`: defines `Foo`.
- `src/bar.ts`: defines `Bar` and references `Foo`.
- `vite.config.ts`: reproduces the bug (`bundleTypes: true` + `outDirs`), emits to `dist/`.
- `vite.config.inline.ts`: baseline (`bundleTypes: true` only), emits to `dist-inline/`.

## How to test

1. Install dependencies from the workspace root if needed (do not install inside this folder):

```bash
# Run from the repository root
pnpm install
```

2. Build with the buggy config (`outDirs` + `bundleTypes`) using the workspace dependencies (no install inside this folder):

```bash
cd test-dts-bundle-repro
rm -rf dist dist-inline
npx vite build
```

3. Inspect `dist/index.d.mts` and `dist/index.d.cts`. The file will likely contain references like `import { Bar } from './bar'` and `import { Foo } from './foo'`, but `dist/bar.d.ts` and `dist/foo.d.ts` do **not** exist. The bundled output is unusable because the `.d.ts` siblings the bundle still imports were never emitted.

4. Build with the baseline config (`bundleTypes: true` only) to compare:

```bash
npx vite build --config vite.config.inline.ts
```

5. Inspect `dist-inline/`. The baseline also produces broken output — see the observed output in [Observed output](#observed-output) and the full bug report in [Issue: `bundleTypes: true` is broken for cross-module type references](#issue-bundletypes-true-is-broken-for-cross-module-type-references).

## Observed output

Environment: `unplugin-dts@1.1.0`, `vite@8.2.2`, `typescript@6.0.3`, Node 24.

### `vite.config.ts` — `bundleTypes: true` + `outDirs` → `dist/`

Files produced:

```
dist/index.cjs
dist/index.mjs
dist/index.d.mts
dist/index.d.cts
```

`dist/index.d.mts` (identical to `dist/index.d.cts`):

```ts
import { Bar } from './bar';
import { Foo } from './foo';

export declare function createRoot(options: RootOptions): RootOptions;

export declare interface RootOptions {
    foo: Foo;
    bar: Bar;
}

export { }
```

There is **no** `dist/bar.d.ts` or `dist/foo.d.ts`. Downstream `tsc` / `tsserver` fails with `TS2307: Cannot find module './bar' or its corresponding type declarations.`

### `vite.config.inline.ts` — `bundleTypes: true` only → `dist-inline/`

Files produced:

```
dist-inline/index.cjs
dist-inline/index.mjs
dist-inline/index.d.mts
```

Notice `dist-inline/index.d.cts` is **missing entirely** — only the ESM declaration file is emitted even though `formats: ["es", "cjs"]` is configured.

`dist-inline/index.d.mts`:

```ts
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
```

`Foo` and `Bar` are emitted as `declare interface` (no `export` keyword) even though they are reachable from the public `RootOptions` type. Any consumer that tries to write `Foo` or `Bar` in their own code will get `TS2305: Module '"test-dts-bundle-repro"' has no exported member 'Foo'.` while the `RootOptions.foo: Foo` field still references an unexported symbol that cannot be resolved from the outside.

## Issue: `bundleTypes: true` is broken for cross-module type references

> Ready-to-paste issue for the `unplugin-dts` repository.

### Title

`bundleTypes: true` fails to bundle referenced types — emits dangling imports (with `outDirs`) or strips the `export` modifier (without `outDirs`)

### Environment

- `unplugin-dts`: `1.1.0`
- `vite`: `8.2.2`
- `typescript`: `6.0.3`
- `vite-plugin-dts` bundled TS engine: `5.9.3`
- Node: `v24.19.0`
- OS: macOS

### Describe the bug

When `bundleTypes: true` is enabled, `unplugin-dts` does not actually bundle the referenced types into the single declaration file it emits. The failure mode differs depending on whether `outDirs` is also configured:

1. **With `outDirs`**, the output is a single `.d.mts`/`.d.cts` per format that still contains raw `import` statements for the types it should have inlined (e.g. `import { Bar } from './bar';`). The corresponding `bar.d.ts` / `foo.d.ts` are never written, so the package's `types` entry is unusable.

2. **Without `outDirs`**, the types are inlined in the file body but the `export` modifier is stripped, so `declare interface Foo` / `declare interface Bar` end up as unexported declarations. Cross-references like `RootOptions.foo: Foo` point at unexported symbols, and consumers cannot name those types themselves.

A second, separate symptom appears in the no-`outDirs` case: `index.d.cts` is **never emitted** even though the Vite config requests both `es` and `cjs` formats.

### Steps to reproduce

1. Clone the reproduction in this folder (`test-dts-bundle-repro`).
2. `pnpm install` at the repository root.
3. `cd test-dts-bundle-repro`
4. `npx vite build` — uses `vite.config.ts` (with `outDirs`).
5. Inspect `dist/index.d.mts` — observe the dangling `./bar` / `./foo` imports.
6. `npx vite build --config vite.config.inline.ts` — uses `vite.config.inline.ts` (without `outDirs`).
7. Inspect `dist-inline/` — observe that `index.d.cts` is missing and that `Foo` / `Bar` are declared but not exported.

### Expected behavior

With `bundleTypes: true`, the bundler should produce a single, self-contained declaration file per requested format where:

- All referenced types are **exported** and inlined, e.g.

  ```ts
  export interface Foo { name: string; value?: number; }
  export interface Bar { id: string; foo: Foo; }
  export interface RootOptions { foo: Foo; bar: Bar; }
  export declare function createRoot(options: RootOptions): RootOptions;
  export { }
  ```

- The output is emitted for every format requested by Vite (both `.d.mts` and `.d.cts` when `formats: ["es", "cjs"]` is configured).

- No `import './bar'` / `import './foo'` statements remain, and no sibling `.d.ts` is required for the bundled output to type-check.

### Actual behavior (with `outDirs`)

```ts
// dist/index.d.mts and dist/index.d.cts
import { Bar } from './bar';
import { Foo } from './foo';

export declare function createRoot(options: RootOptions): RootOptions;
export declare interface RootOptions {
    foo: Foo;
    bar: Bar;
}

export { }
```

Sibling files `dist/bar.d.ts` and `dist/foo.d.ts` are **not** generated. Any consumer fails with `TS2307: Cannot find module './bar'`.

### Actual behavior (without `outDirs`)

```ts
// dist-inline/index.d.mts  (dist-inline/index.d.cts is missing entirely)
declare interface Bar {
    id: string;
    foo: Foo;
}
export declare function createRoot(options: RootOptions): RootOptions;
declare interface Foo {
    name: string;
    value?: number;
}
export declare interface RootOptions {
    foo: Foo;
    bar: Bar;
}
export { }
```

`Foo` / `Bar` are not exported, and `index.d.cts` is never written.

### Minimal source

```ts
// src/foo.ts
export interface Foo { name: string; value?: number; }
export function createFoo(name: string, value?: number): Foo {
	return { name, value };
}
```

```ts
// src/bar.ts
import type { Foo } from "./foo.js";
export interface Bar { id: string; foo: Foo; }
export function createBar(id: string, foo: Foo): Bar {
	return { id, foo };
}
```

```ts
// src/index.ts
import type { Foo } from "./foo";
import type { Bar } from "./bar";

export interface RootOptions { foo: Foo; bar: Bar; }
export function createRoot(options: RootOptions): RootOptions {
	return options;
}
```

### Reproduction configs

```ts
// vite.config.ts — buggy: bundleTypes + outDirs
import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

export default defineConfig({
	build: {
		emptyOutDir: true,
		lib: {
			entry: "src/index.ts",
			name: "TestDtsBundleRepro",
			formats: ["es", "cjs"],
			fileName: (format) =>
				format === "es" ? "index.mjs" : format === "cjs" ? "index.cjs" : `index.${format}`,
		},
		rollupOptions: { external: [] },
	},
	plugins: [
		dts({
			bundleTypes: true,
			outDirs: [
				{ dir: "dist", moduleFormat: "esm" },
				{ dir: "dist", moduleFormat: "cjs" },
			],
		}),
	],
});
```

```ts
// vite.config.inline.ts — buggy: bundleTypes only
import { defineConfig } from "vite";
import dts from "unplugin-dts/vite";

export default defineConfig({
	build: {
		emptyOutDir: true,
		outDir: "dist-inline",
		lib: {
			entry: "src/index.ts",
			name: "TestDtsBundleRepro",
			formats: ["es", "cjs"],
			fileName: (format) =>
				format === "es" ? "index.mjs" : format === "cjs" ? "index.cjs" : `index.${format}`,
		},
		rollupOptions: { external: [] },
	},
	plugins: [
		dts({
			bundleTypes: true,
		}),
	],
});
```

### Suggestion

It looks like the API Extractor-based bundler is being skipped (`Start generate declaration files...` followed by `Start bundling declaration files...` but no re-export rewriting is happening for cross-module types), or the re-export pass is being run on the wrong entry. Please verify that `bundleTypes: true` actually invokes the API Extractor bundler pass for every requested format, and that the resulting declarations retain the `export` modifier on any type that was originally exported from a transitive module.
