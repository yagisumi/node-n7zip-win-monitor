import child_process from 'child_process'
import { EventEmitter } from 'events'
import kill from 'tree-kill'

export declare interface ElectronController {
  on(event: 'error', listener: (error: Error) => void): this
  on(event: 'close', listener: (code: number, signal: NodeJS.Signals) => void): this
  addListener(event: 'error', listener: (error: Error) => void): this
  addListener(event: 'close', listener: (code: number, signal: NodeJS.Signals) => void): this
}

export class ElectronController extends EventEmitter {
  private electron?: child_process.ChildProcess
  readonly mainPath: string
  private _state: 'ready' | 'started' | 'restarting'
  get state() {
    return this._state
  }

  constructor(mainPath: string) {
    super()
    this.mainPath = mainPath
    this._state = 'ready'
  }

  private emitError(error: Error) {
    this.electron = undefined
    this._state = 'ready'
    this.emit('error', error)
  }

  start() {
    if (this.isClosed()) {
      this.electron = child_process.exec(`npx electron ${JSON.stringify(this.mainPath)}`)
      this._state = 'started'

      this.electron.addListener('error', (error) => {
        this.emitError(error)
      })

      this.electron.addListener('close', (code: number, signal: NodeJS.Signals) => {
        if (this._state !== 'restarting') {
          this.emit('close', code, signal)
        }
        if (this.electron) {
          this.electron.removeAllListeners()
        }
        this.electron = undefined
        this._state = 'ready'
      })
    }
  }

  isClosed() {
    return this.electron == null || this.electron.exitCode != null
  }

  kill(callback?: (error?: Error) => void) {
    if (this.electron && !this.isClosed()) {
      kill(this.electron.pid, callback)
    } else {
      if (callback) {
        callback()
      }
    }
  }

  restart() {
    this._state = 'restarting'
    this.kill((error) => {
      if (error) {
        console.log('Failed to close Electron')
        console.error(error)
      } else {
        this.start()
      }
    })
  }

  close() {
    this.kill()
  }
}
