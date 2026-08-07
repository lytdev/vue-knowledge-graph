import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

/** Inject component CSS once so consumers do not need a separate style import. */
function inlineAllCss(): Plugin {
  const styleId = 'agile-knowledge-graph-styles'

  return {
    name: 'inline-all-css',
    enforce: 'post',
    apply: 'build',
    generateBundle(_, bundle) {
      let css = ''

      for (const name of Object.keys(bundle)) {
        const chunk = bundle[name]
        if (chunk.type === 'asset' && name.endsWith('.css')) {
          css += typeof chunk.source === 'string' ? chunk.source : new TextDecoder().decode(chunk.source)
          delete bundle[name]
        }
      }

      if (!css) return

      const injectCode = `
(function(){if(typeof document<"u"&&!document.getElementById("${styleId}")){var e=document.createElement("style");e.id="${styleId}",e.textContent=${JSON.stringify(css)},document.head.appendChild(e)}})();`

      for (const name of Object.keys(bundle)) {
        const chunk = bundle[name]
        if (chunk.type === 'chunk' && (name.endsWith('.mjs') || name.endsWith('.cjs'))) {
          chunk.code = injectCode + '\n' + chunk.code
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
    }),
    inlineAllCss(),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'AgileKnowledgeGraph',
      formats: ['es', 'cjs'],
      fileName: (format) => `agile-knowledge-graph.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@antv/g6'],
      output: {
        exports: 'named',
        globals: {
          '@antv/g6': 'G6',
          vue: 'Vue',
        },
      },
    },
  },
})
