import { type Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

interface ManifestPluginOptions {
  manifestPath: string
  betaManifestPath?: string
  firefoxManifestPath?: string
}

export function manifestPlugin(options: ManifestPluginOptions): Plugin {
  const { manifestPath, betaManifestPath, firefoxManifestPath } = options

  return {
    name: 'manifest-plugin',

    generateBundle() {
      const isBeta = process.env.BETA === 'true'
      const isFirefox = process.env.FIREFOX === 'true'

      // Read base manifest
      const baseManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

      // Merge with variant manifest
      let manifest = { ...baseManifest }

      if (isBeta && betaManifestPath && fs.existsSync(betaManifestPath)) {
        const betaManifest = JSON.parse(fs.readFileSync(betaManifestPath, 'utf-8'))
        manifest = { ...manifest, ...betaManifest }
      }

      if (isFirefox && firefoxManifestPath && fs.existsSync(firefoxManifestPath)) {
        const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf-8'))
        manifest = { ...manifest, ...firefoxManifest }
      }

      // Emit manifest.json
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(manifest, null, 2),
      })
    },
  }
}
