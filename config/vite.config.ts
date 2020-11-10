import type { UserConfig } from 'vite'
import path from 'path'

const root = path.join(process.cwd(), 'src')

const config: UserConfig = {
  root,
  outDir: 'build',
  optimizeDeps: {
    exclude: [
      '@yagisumi/win-output-debug-string', //
      '@yagisumi/e7ipc2-electron',
    ],
  },
}

export default config
