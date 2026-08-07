# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vue 3 component library for knowledge-graph visualization with AntV G6.

- `src/components/` contains public Vue components such as `GraphVisualization.vue` and `GraphToolbar.vue`.
- `src/module/` contains framework-independent graph behavior and G6 integration.
- `src/types/` defines shared TypeScript interfaces.
- `src/index.ts` is the package entry point; export new public APIs here.
- `dev/` is the local playground used by Vite for manual verification.
- `dist/` is generated build output. Do not edit it directly.

Keep reusable code under `src/`; keep demos and development-only data under `dev/`.

## Build, Test, and Development Commands

The repository uses the `pnpm-lock.yaml` lockfile, so prefer pnpm:

Use Node.js 20.19+ (Node.js 22 LTS is recommended) for the Vite 8 toolchain.

- `pnpm install` installs dependencies from the lockfile.
- `pnpm dev` starts the Vite playground with hot reload.
- `pnpm build` creates ESM/CJS library bundles and TypeScript declarations in `dist/`.
- `pnpm lint` checks TypeScript and Vue files with ESLint.
- `pnpm typecheck` runs Vue-aware TypeScript checking.
- `pnpm test:run` runs Vitest once; `pnpm test:coverage` also writes coverage reports.
- `pnpm release:check` runs all checks, builds the package, and previews the npm tarball.

Run `pnpm check` and `pnpm build` before submitting changes.

## Coding Style & Naming Conventions

Use TypeScript and Vue Single-File Components with `<script setup lang="ts">`. Follow the existing style: two-space indentation, single quotes, no semicolons, and trailing commas in multiline objects where practical. Use PascalCase for Vue components and exported classes/types, camelCase for functions and variables, and kebab-case for CSS classes (for example, `.kg-toolbar`).

Keep prop, emit, and public method types explicit. Prefer literal unions such as `'force' | 'circular'` over broad `string` types. Use the `@/` alias for imports rooted at `src/` when it improves readability.

## Testing Guidelines

Tests use Vitest, Vue Test Utils, and jsdom. Place `*.test.ts` files beside the source they cover. Validate visible graph changes in `dev/App.vue` as well as through automated tests. Coverage reports are written to `coverage/`; add tests for new behavior and regressions even though no global threshold is currently enforced.

## Commit & Pull Request Guidelines

There is no existing commit history to establish a house convention. Use concise, imperative messages; Conventional Commit prefixes are encouraged, for example `fix: preserve circular layout selection`.

Pull requests should explain the motivation and behavior change, list verification performed, and link related issues. Include screenshots or a short recording for visible UI changes, and call out any public API or generated declaration changes.
