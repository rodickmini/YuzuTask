import { build } from 'vite'
import { copyFileSync, mkdirSync, cpSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const dist = resolve('dist')

// Step 1: Vite build
await build({
  build: {
    rollupOptions: {
      input: {
        newtab: resolve('src/newtab/index.html'),
        background: resolve('src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
    outDir: dist,
  },
})

// Step 2: Copy icons
mkdirSync(resolve(dist, 'icons'), { recursive: true })
cpSync(resolve('public/icons'), resolve(dist, 'icons'), { recursive: true })

// Step 3: Copy manifest.json
copyFileSync(resolve('manifest.json'), resolve(dist, 'manifest.json'))

console.log('Build complete! Load the dist/ folder in Chrome.')
