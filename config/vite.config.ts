import type { UserConfig } from 'vite'
import path from 'path'

const root = path.join(process.cwd(), 'src')

const config: UserConfig = {
  root,
  outDir: 'build',
  optimizeDeps: {
    exclude: [],
  },
}

export default config
