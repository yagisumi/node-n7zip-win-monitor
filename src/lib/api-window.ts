import type { ApiType } from './api'
declare const window: Window & typeof globalThis & { api: ApiType }
export default window
