import { defineHandlers, CmdHandler, OK, ERR, Result } from '@yagisumi/e7ipc2-electron'
import { Commands, DebugInfo, MonitorState } from './commands'
import { monitor } from '@yagisumi/win-output-debug-string'

let cache: DebugInfo[] = []
let state: MonitorState = 'ready'

function start(): Result<MonitorState> {
  if (state !== 'monitoring') {
    const r = monitor.start((info) => {
      cache.push(info)
    })
    if (r.ok) {
      state = 'monitoring'
    } else {
      state = 'error'
      return ERR(r.error)
    }
  }

  return OK(state)
}

function stop() {
  monitor.stop()
  state = 'ready'
}

const startHandler: CmdHandler<Commands, 'start'> = async (_ev, _opts) => {
  return start()
}

const stopHandler: CmdHandler<Commands, 'stop'> = async (_ev, _opts) => {
  stop()
  return OK(state)
}

const fetchHandler: CmdHandler<Commands, 'fetch'> = async (_ev, _opts) => {
  const tmp = cache
  cache = []
  return OK(tmp)
}

export const handlers = defineHandlers<Commands>({
  start: startHandler,
  stop: stopHandler,
  fetch: fetchHandler,
})
