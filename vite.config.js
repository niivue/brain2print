import { defineConfig } from "vite";
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  // root: '.',
  base: "./",
  server: {
    open: "index.html",
  },
  worker: {
    format: "esm",
  },
  // exclude @niivue/niimath from optimization
  optimizeDeps: {
    exclude: ["@niivue/niimath", "@itk-wasm/cuberille", "@itk-wasm/mesh-filters"],
  },
  plugins: [
    // put lazy loaded JavaScript and Wasm bundles in dist directory
    viteStaticCopy({
      targets: [
        { src: 'node_modules/@itk-wasm/cuberille/dist/pipelines/*.{js,wasm,wasm.zst}', dest: 'pipelines' },
        { src: 'node_modules/@itk-wasm/mesh-filters/dist/pipelines/*.{js,wasm,wasm.zst}', dest: 'pipelines' },
      ],
    })
  ],
});
