import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// After the build, lists every file in dist and puts the list at the top of sw.js, together
// with a version made from the file contents. A new build changes the version, so the browser
// sees a new service worker and the old cache is removed.
function serviceWorkerManifest(): Plugin {
  let outDir = 'dist'

  function listFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? listFiles(path) : [path]
    })
  }

  return {
    name: 'service-worker-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    writeBundle() {
      const files = listFiles(outDir)
        .map((file) => relative(outDir, file))
        .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
        .sort()

      const hash = createHash('sha256')
      for (const file of files) {
        hash.update(file)
        hash.update(readFileSync(join(outDir, file)))
      }
      const swPath = join(outDir, 'sw.js')
      hash.update(readFileSync(swPath)) // a change in the worker itself is also a new version
      const version = hash.digest('hex').slice(0, 10)

      const header = `self.__VERSION__ = '${version}'\nself.__PRECACHE__ = ${JSON.stringify(['./', ...files])}\n`
      writeFileSync(swPath, header + readFileSync(swPath, 'utf8'))
    },
  }
}

// Relative base + HashRouter lets the build run from any GitHub Pages sub-path.
export default defineConfig({
  plugins: [react(), serviceWorkerManifest()],
  base: './',
})
