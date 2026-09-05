# TypeScript 7 下 d.ts 发射工具链迁移记录

> 适用场景：任何基于 Vite + `vite-plugin-dts`/`unplugin-dts` 的库
> 关联依赖：`typescript@7+`、`vite-plugin-dts` / `unplugin-dts`
> 关联文件：`vite.config.ts`、`tsconfig.build.json`、`tsconfig.build.cjs.json`、`package.json`

---

## 1. TL;DR

- **现象**：构建期抛出 `[unplugin-dts] The installed "typescript" package does not provide the JavaScript Compiler API ...`
- **根因**：TypeScript 7 移除了 `typescript` 包上的 JavaScript Compiler API（`createProgram` 等），`vite-plugin-dts`（即 `unplugin-dts` 的 Vite 适配）拿不到 API，于是要求安装 `@typescript/typescript6` 作为兜底 shim。
- **结论**：**不装 shim**。彻底移除 `vite-plugin-dts`，改用 TypeScript 7 自带的 `tsc --emitDeclarationOnly` 发射声明文件。typecheck 和声明发射统一走 TypeScript 7，工具链一致。
- **验证**：应用构建与库构建均通过；ESM / CJS 各自产出对应 `.d.mts` / `.d.cts`。

---

## 2. 背景

升级到 `typescript@7.0.x` 之前，典型的 Vite 库构建链路是这样的：

```text
vite build
  └─ vite-plugin-dts
      └─ unplugin-dts
          └─ require("typescript").createProgram(...)   ← 调 JS Compiler API
              └─ rollupTypes: true                      ← 多入口聚合成单文件
```

升级到 `typescript@7` 后，TS 7 把 `createProgram` 这套 JS Compiler API 从 `typescript` 包里移除，详见 [TypeScript 7 Beta 公告](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/)。`unplugin-dts` 拿不到 API 就直接抛错。

unplugin-dts 仓库的 issue [#465](https://github.com/qmhc/unplugin-dts/issues/465) 描述了同样的现象，提交 [`d150536`](https://github.com/qmhc/unplugin-dts/commit/d150536e11eca7039e5baee05f8b1b17778782c0) 给出了"先探测主包，再探测 `@typescript/typescript6` shim"的兜底实现。简化后的核心逻辑：

```js
function loadTs() {
  try {
    const ts = require("typescript")
    if (typeof ts.createProgram === "function") return ts
  } catch {}

  try {
    const ts = require("@typescript/typescript6")
    if (typeof ts.createProgram === "function") return ts
  } catch {}

  throw new Error(...)
}
```

也就是说，**shim 不是修复，只是 workaround**：工具链里会出现"TS 7 跑类型检查、TS 6 跑声明发射"的版本割裂。

---

## 3. 报错现象

执行 `vite build`（或 `vite build --mode app`）时：

```text
$ tsc --noEmit && vite build --mode app
failed to load config from /.../vite.config.ts
error during build:
Error: [unplugin-dts] The installed "typescript" package does not provide the
JavaScript Compiler API (this happens with TypeScript 7+), and the fallback
"@typescript/typescript6" was not found.
Please install it alongside TypeScript 7:
  npm install -D @typescript/typescript6
This allows TypeScript 7 to be used for compilation while keeping the JS API
available for tooling.
See: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/
```

注意：报错出现在 Vite **加载配置文件**阶段（`failed to load config from ... vite.config.ts`），不是 dts 插件在生成阶段报的——因为 `dts(...)` 是在 `vite.config.ts` 顶层调用，模块解析阶段就会执行 `loadTs()`。

---

## 4. 根因

1. **TypeScript 7 行为变更**：`typescript` 包不再暴露 JS Compiler API，目的是强制迁移到原生 ESM 工具链（`tsc` CLI 或新出的 `tsgo`）。
2. **`unplugin-dts` 的实现依赖 JS Compiler API**：聚合多个 `.d.ts`、重写相对导入、补 `.js`/`.cjs` 扩展名都靠 `createProgram` + transformer。
3. **官方兜底是 shim，不是修复**：`@typescript/typescript6` 只为工具提供老版 API，类型与运行时版本不一致的问题被掩盖。
4. **对库作者的影响**：哪怕你只想要一个干净的 `.d.ts` 输出，也得被迫接受工具链版本割裂。

---

## 5. 决策

| 备选方案 | 评价 | 决策 |
| --- | --- | --- |
| 安装 `@typescript/typescript6`，继续用 `vite-plugin-dts` | 解决报错但引入工具链割裂，长期维护成本高 | ❌ |
| 升级到 `unplugin-dts` 下一个大版本（等待上游适配 TS 7） | 阻塞主线进度 | ❌ |
| **移除 `vite-plugin-dts`，改用 `tsc --emitDeclarationOnly`** | typecheck / 声明发射统一走 TS 7，依赖更少 | ✅ |

---

## 6. 方案

### 6.1 新增 `tsconfig.build.json`（ESM 声明）

只包含库源码，启用声明发射：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": true,
    "declarationMap": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### 6.2 新增 `tsconfig.build.cjs.json`（CJS 声明）

通过 `module: "CommonJS"` 让 tsc 产出 `.d.cts`：

```json
{
  "extends": "./tsconfig.build.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node10"
  }
}
```

> TS 7 起 `moduleResolution: "Node10"` 已被移除，如果报错请改成 `"node"` 或继承父配置；这里保留是兼容 TS 7.0 beta 早期版本的写法，请按本地 TS 7 版本适配。

### 6.3 精简 `vite.config.ts`

```ts
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "app") {
    return { /* app 构建配置（不带 dts）*/ };
  }
  return {
    build: {
      emptyOutDir: true,
      lib: {
        entry: "src/index.ts",
        // name: "your-lib-name",
        formats: ["es", "cjs"],
        fileName: (format) => {
          if (format === "es") return "index.mjs";
          if (format === "cjs") return "index.cjs";
          return `index.${format}`;
        },
      },
      rolldownOptions: {
        external: ["react"], // 按需调整 external
        output: { minify: { compress: { dropConsole: true } } },
      },
    },
    // .d.ts 由独立的 tsc -p tsconfig.build.json --emitDeclarationOnly 负责，
    // 避免 vite-plugin-dts / unplugin-dts 拉取 TypeScript 6 编译器 API。
    plugins: [/* react() / vue() / 其他构建插件 */],
  };
});
```

`lib.fileName` 改成函数，让 ESM 产物固定为 `index.mjs`、CJS 产物固定为 `index.cjs`，与 `package.json#exports` 的双入口声明对齐。

### 6.4 调整 `package.json`

- 从 `devDependencies` 移除 `vite-plugin-dts`。
- `build` 脚本在 `vite build` 之后依次跑两份声明发射：

```json
"build": "rm -rf dist && tsc --noEmit && vite build && tsc -p tsconfig.build.json --emitDeclarationOnly && tsc -p tsconfig.build.cjs.json --emitDeclarationOnly"
```

顺序原因：`vite build` 设置了 `emptyOutDir: true`，会清空 `dist/`，所以 `tsc` 必须在 `vite build` 之后跑；ESM 先于 CJS，ESM 的 `.d.mts` 与 CJS 的 `.d.cts` 都输出到同一份 `dist` 下。

- `exports` 同步支持双格式 + 双类型入口：

```json
"exports": {
  ".": {
    "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
    "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
  }
},
"main": "dist/index.cjs",
"module": "dist/index.mjs"
```

---

## 7. 验证

| 命令 | 结果 |
| --- | --- |
| `pnpm install` | lockfile 自动移除 `vite-plugin-dts` |
| `pnpm run build:app` | ✅ 通过 |
| `pnpm run build` | ✅ 通过，产物结构如下 |

库产物结构：

```text
dist/
├── index.mjs                # ESM 入口
├── index.cjs                # CJS 入口
├── index.d.mts              # ESM 声明（来自 tsconfig.build.json）
├── index.d.cts              # CJS 声明（来自 tsconfig.build.cjs.json）
├── useActiveScroll.d.mts    # 各模块声明 …
├── useActiveScroll.d.cts
├── types.d.mts
├── types.d.cts
├── utils.d.mts
├── utils.d.cts
└── *.d.ts.map               # source map
```

> 模块名以仓库实际为准，库只有一个入口时只有 `index.*` 三个文件。

---

## 8. 收益与取舍

### 收益

- **工具链一致**：typecheck、声明发射、Vite 构建三件事全部走 TS 7，行为可预测。
- **依赖更少**：少一个 `vite-plugin-dts`，也避免了将来可能还要装 `@typescript/typescript6`。
- **产物更标准**：`.d.mts` / `.d.cts` 是 Node.js 官方约定的双格式声明文件，工具链（tsserver、eslint、bundlers）识别更稳。

### 取舍

- **失去 `rollupTypes` 自动聚合**：只有单入口的库不受影响；多入口项目需要自行用脚本聚合或继续保留 `unplugin-dts` + shim。
- **失去导入扩展名自动补全**：当 `useActiveScroll` 之类模块只导入相对路径下不带扩展名的文件时不需要补；如果以后出现"裸相对路径需要补 `.js`"的场景，得用 `tsc-alias` 或自家小脚本兜底。
- **失去 `.d.cts` 重命名能力**：现在由 `tsconfig.build.cjs.json` 的 `module: "CommonJS"` 自行产出，行为等价。

---

## 9. 给组里的建议

- 升级到 TypeScript 7 之前，先盘点项目里依赖 JS Compiler API 的工具：`vite-plugin-dts` / `unplugin-dts` / `rollup-plugin-dts` / `ts-morph` / `ts-patch` 等。
- 兜底方案统一是 `tsc -p tsconfig.build.json --emitDeclarationOnly`（或 `tsgo`），可观测性最好、依赖最少。
- **不要为了规避报错装 `@typescript/typescript6`**——它只解决"用起来"，不解决"工具链一致"，且锁定了 TS 6 行为，新语法可能跑偏。
- 多入口 / 需要自动重写相对路径的库，可以暂时保留 `unplugin-dts` + shim 方案，但要在 README / TROUBLESHOOTING 写明原因，等待上游适配。
- 给工具链升级留出"声明文件单独一个 step"的窗口：先 typecheck，再 bundle，最后 `tsc --emitDeclarationOnly`，这样调试时容易定位是哪一步出错。

---

## 10. 参考

- TypeScript 7 Beta 公告：<https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/>
- unplugin-dts issue #465 — TS 7.0 兼容讨论：<https://github.com/qmhc/unplugin-dts/issues/465>
- unplugin-dts commit `d150536` — 引入 `@typescript/typescript6` shim：<https://github.com/qmhc/unplugin-dts/commit/d150536e11eca7039e5baee05f8b1b17778782c0>
- 通用变更清单：
  - `vite.config.ts`（移除 `vite-plugin-dts`、调整 `lib.fileName`）
  - `tsconfig.build.json` / `tsconfig.build.cjs.json`
  - `package.json`（移除 `vite-plugin-dts`、更新 `build` 脚本与 `exports`）
