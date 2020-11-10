import { CHANNEL, Commands } from './commands'
import { createClient } from '@yagisumi/e7ipc2-electron'
import { ipcRenderer } from 'electron'

const client = createClient<Commands>(CHANNEL, ipcRenderer)

export const api = {
  start: () => client.invoke({ $cmd: 'start' }),
  stop: () => client.invoke({ $cmd: 'stop' }),
  fetch: () => client.invoke({ $cmd: 'fetch' }),
}

export type ApiType = typeof api
