import chalk from 'chalk'
import kill from 'tree-kill'
import child_process from 'child_process'
import { rollup, watch, RollupBuild, InputOption } from 'rollup'
import { ElectronController } from './electronController'
import { closeEsbuild } from './esbuildPlugin'
import rollupConfigs from '../config/rollup.background.config'
import viteConfig from '../config/vite.config'

async function build() {
  const BUILD = chalk.cyan('[build]')
  let success = true
  let background: RollupBuild | void
  let preload: RollupBuild | void

  const optsBackground = rollupConfigs[0]
  const optsPreload = rollupConfigs[1]

  if (optsBackground != null) {
    console.log(`${BUILD} Electron background.js`)
    background = await rollup(optsBackground).catch((error) => {
      success = false
      console.log(`${chalk.blue(BUILD)} ${chalk.red('build error')}`)
      console.error(error)
    })
  } else {
    success = false
    console.error(`${BUILD} missing rollup config`)
  }

  if (optsPreload != null) {
    console.log(`${BUILD} Electron preload.js`)
    preload = await rollup(rollupConfigs[1]).catch((error) => {
      success = false
      console.log(`${BUILD} ${chalk.red('build error')}`)
      console.error(error)
    })
  }

  if (background) {
    background.write(optsBackground.output)
  }
  if (preload) {
    preload.write(optsPreload.output)
  }

  return success
}

async function serve() {
  const WATCH = chalk.cyan('[watch]')
  const ELECTRON = chalk.cyan('[electron]')

  const port = viteConfig.port ?? 3000
  const url = `http://localhost:${port}`
  process.env.DEV_SERVER_URL = url

  const vite = child_process.spawn('npm run serve', { stdio: 'inherit', shell: true })
  vite.addListener('close', () => {
    console.log(`${WATCH} vite close`)
  })
  vite.addListener('error', (error) => {
    console.log(`${WATCH} vite error`)
    console.error(error)
    killElectron()
    process.exit(11)
  })

  function killVite() {
    if (vite.exitCode == null) {
      kill(vite.pid)
    }
  }

  const inputs = rollupConfigs.map((config) => config.input)
  const builtFlags: Record<string, boolean> = {}
  inputs.forEach((src) => {
    builtFlags[src] = false
  })

  const electron = new ElectronController('build/background.js')
  const watcher = watch(rollupConfigs)

  function closeWatcher() {
    console.log(`${WATCH} watcher close`)
    watcher.close()
    closeEsbuild()
  }

  watcher.addListener('event', (ev) => {
    // console.log(ev)
    if (ev.code === 'BUNDLE_START') {
      getInputs(ev.input).forEach((src) => {
        console.log(`${WATCH} build start: ${src}`)
      })
    } else if (ev.code === 'BUNDLE_END') {
      getInputs(ev.input).forEach((src) => {
        builtFlags[src] = true
        console.log(`${WATCH} build end: ${src}`)
      })
    } else if (ev.code === 'END') {
      if (inputs.every((input) => builtFlags[input])) {
        if (electron.state === 'ready') {
          console.log(`${ELECTRON} start`)
        } else {
          console.log(`${ELECTRON} restart`)
        }
      }

      electron.restart()
    } else if (ev.code === 'ERROR') {
      console.log(`${WATCH} ${chalk.red('build error')}`)
      console.error(ev.error)
    }
  })

  electron.addListener('close', () => {
    console.log(`${ELECTRON} close`)
    closeWatcher()
    killVite()
  })

  electron.addListener('error', (error) => {
    console.log(`${WATCH} ${chalk.red('Electron error')}`)
    console.error(error)
    closeWatcher()
    killVite()
    process.exit(21)
  })

  function killElectron() {
    electron.kill()
  }
}

function getInputs(input: InputOption): string[] {
  if (typeof input === 'string') {
    return [input]
  } else if (Array.isArray(input)) {
    return input
  } else if (typeof input === 'object' && input != null) {
    return Object.keys(input)
  }
  return []
}

async function main() {
  if (process.argv.includes('--watch')) {
    serve()
  } else {
    const success = await build()
    if (!success) {
      process.exit(1)
    }
  }
}

main()
