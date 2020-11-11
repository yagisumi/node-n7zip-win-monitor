import { ref, Ref } from 'vue'
import { MonitorState, DebugInfo } from './commands'
import window from './api-window'

const state = ref() as Ref<MonitorState>
state.value = 'ready'
const error = ref() as Ref<string | undefined>
const callbacks = new Map<number, (info: DebugInfo) => void>()
let n = 0
let iid: NodeJS.Timeout | undefined = undefined
let infos: DebugInfo[] = []

function dispatch() {
  console.log('dispatch')
  infos.forEach((info) => {
    callbacks.forEach((cb) => {
      try {
        cb(info)
      } catch (e) {}
    })
  })
}

function startDispatch() {
  if (iid === undefined) {
    iid = setInterval(async () => {
      const r_infos = await window.api.fetch()
      if (r_infos.ok) {
        infos = infos.concat(r_infos.value)
      }

      if (infos.length > 0) {
        dispatch()
        infos = []
      }
    }, 1000)
  }
}

function stopDispatch() {
  if (iid !== undefined) {
    clearInterval(iid)
  }

  iid = undefined
}

async function start() {
  const r = await window.api.start()
  console.log(r)
  if (r.ok) {
    state.value = r.value
    error.value = undefined
  } else {
    state.value = 'error'
    error.value = r.error.message
  }

  return r
}

async function stop() {
  const r = await window.api.stop()
  if (r.ok) {
    state.value = r.value
  }

  return r
}

function subscribe(cb: (info: DebugInfo) => void) {
  console.log('subscribe')
  n += 1
  callbacks.set(n, cb)
  startDispatch()
  return n
}

function unsubscribe(id: number) {
  const r = callbacks.delete(id)
  if (callbacks.size === 0) {
    stopDispatch()
  }

  return r
}

export function useMonitor() {
  return {
    state,
    error,
    start,
    stop,
    subscribe,
    unsubscribe,
  }
}
