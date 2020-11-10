import { DefineCommands } from '@yagisumi/e7ipc2-electron'

export const CHANNEL = 'monitor'

export type MonitorState = 'monitoring' | 'ready'
export type DebugInfo = {
  pid: number
  message: string
}

export type Commands = DefineCommands<{
  start: {
    ret: MonitorState
  }
  stop: {
    ret: MonitorState
  }
  fetch: {
    ret: DebugInfo[]
  }
}>
