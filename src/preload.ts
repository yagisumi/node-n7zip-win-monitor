import { contextBridge } from 'electron'
import { api } from './lib/api'

contextBridge.exposeInMainWorld('api', api)
