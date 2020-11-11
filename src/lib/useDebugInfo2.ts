import { reactive } from 'vue'
import { useMonitor } from './useMonitor'
import moment from 'moment'

export type ProcessRecord = {
  message: string
  addr: string | undefined
  obj: AddrItem | undefined
}

export type ProcessItem = {
  id: string
  pid: number
  created: number
  date: string
  records: ProcessRecord[]
  n_ready: number
  n_ok: number
  n_error: number
  manager: AddrItemManager
}

export type AddrItemState = 'ready' | 'ok' | 'error'

export type AddrItem = {
  id: string
  addr: string
  num: number
  name: string
  n_construct: number
  n_destruct: number
  counts: number[]
  records: string[]
  state: AddrItemState
}

function updateAddrItem(aitem: AddrItem) {
  let n_zero = 0
  aitem.counts.forEach((c) => {
    if (c === 0) {
      n_zero += 1
    }
  })

  if (aitem.n_construct == 1 && aitem.n_destruct == 1) {
    aitem.state = 'ok'
  } else if (n_zero === 1 && aitem.counts[aitem.counts.length - 1] === 0) {
    aitem.state = 'ok'
  } else if (n_zero > 0) {
    aitem.state = 'error'
  } else if (aitem.n_destruct > aitem.n_construct) {
    aitem.state = 'error'
  } else {
    aitem.state = 'ready'
  }
}

function updateProcessItem(pitem: ProcessItem) {
  const counts: Record<AddrItemState, number> = {
    ready: 0,
    ok: 0,
    error: 0,
  }

  pitem.manager.items.forEach((aitem) => {
    counts[aitem.state] += 1
  })

  pitem.n_ready = counts.ready
  pitem.n_ok = counts.ok
  pitem.n_error = counts.error
}

class AddrItemManager {
  items = reactive<AddrItem[]>([])
  idItemMap = new Map<string, AddrItem>()
  addrItemMap = new Map<string, AddrItem>()
  addrNumMap = new Map<string, number>()

  createItem(addr: string) {
    const num = this.addrNumMap.get(addr) ?? 1
    const item = reactive<AddrItem>({
      id: `${addr}-${num}`,
      addr,
      num,
      name: '',
      n_construct: 0,
      n_destruct: 0,
      counts: [],
      records: [],
      state: 'ready',
    })
    this.addrNumMap.set(addr, num + 1)

    this.items.push(item)
    this.idItemMap.set(item.id, item)
    this.addrItemMap.set(addr, item)

    return item
  }

  new(addr: string, name?: string) {
    this.seal(addr)
    return this.get(addr, name)
  }

  get(addr: string, name?: string) {
    let item = this.addrItemMap.get(addr)
    if (item === undefined) {
      item = this.createItem(addr)
    }

    if (name != null && name !== '' && item.name === '') {
      item.name = name
    }

    return item
  }

  has(id: string) {
    return this.idItemMap.has(id)
  }

  getById(id: string) {
    return this.idItemMap.get(id)
  }

  seal(addr: string) {
    return this.addrItemMap.delete(addr)
  }
}

type State = {
  processItems: ProcessItem[]
  selectedProcessId: string | undefined
  addrItems: AddrItem[]
  selectedAddrId: string | undefined
  selectedAddr: string | undefined
  processRecords: ProcessRecord[]
}

const state = reactive<State>({
  processItems: [],
  selectedProcessId: undefined,
  addrItems: [],
  selectedAddrId: undefined,
  selectedAddr: undefined,
  processRecords: [],
})

const IdProcessMap = new Map<string, ProcessItem>()
let currentProcess: ProcessItem | undefined = undefined

function createProcessItem(pid: number): ProcessItem {
  const created = Date.now()
  const date = moment(created).format('YYYY/MM/DD HH:mm:ss')
  const item: ProcessItem = reactive({
    id: `${pid}-${created}`,
    pid,
    created,
    date,
    addrs: [],
    records: reactive([]),
    manager: new AddrItemManager(),
    n_ready: 0,
    n_ok: 0,
    n_error: 0,
  })

  state.processItems.push(item)
  IdProcessMap.set(item.id, item)
  currentProcess = item
  selectProcessItem(item.id)

  return item
}

const monitor = useMonitor()
monitor.start()
monitor.subscribe((info) => {
  let pitem: ProcessItem | undefined = undefined
  if (info.message === 'n7zip start') {
    pitem = createProcessItem(info.pid)
    pitem.records.push({ message: info.message, addr: undefined, obj: undefined })
  } else if (currentProcess !== undefined && currentProcess.pid === info.pid) {
    pitem = currentProcess

    const record: ProcessRecord = {
      message: info.message,
      addr: undefined,
      obj: undefined,
    }

    if (info.message.match(/(0x\w+): ([\s\S]+)/)) {
      const addr = RegExp.$1
      const rest = RegExp.$2
      record.addr = addr
      record.message = rest

      if (rest.match(/@ (\w+)/)) {
        const name = RegExp.$1
        const aitem = pitem.manager.get(addr, name)
        aitem.records.push(info.message)
        record.obj = aitem
      } else if (rest.match(/(\+\+|--) (\w+) #(\d+)/)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sign = RegExp.$1
        const name = RegExp.$2
        const count = RegExp.$3

        const aitem = pitem.manager.get(addr, name)
        aitem.counts.push(parseInt(count))
        updateAddrItem(aitem)
        updateProcessItem(pitem)
        aitem.records.push(info.message)
        record.obj = aitem
      } else if (rest.match(/([+-]) (\w+)/)) {
        const sign = RegExp.$1
        const name = RegExp.$2
        if (sign === '+') {
          const aitem = pitem.manager.new(addr, name)
          aitem.n_construct += 1
          aitem.records.push(info.message)
          record.obj = aitem
          updateProcessItem(pitem)
        } else {
          const aitem = pitem.manager.get(addr, name)
          aitem.n_destruct += 1
          updateAddrItem(aitem)
          updateProcessItem(pitem)
          aitem.records.push(info.message)
          record.obj = aitem
        }
      } else {
        const aitem = pitem.manager.get(addr, name)
        aitem.records.push(info.message)
        record.obj = aitem
      }
    }

    pitem.records.push(record)
  }
})

function selectProcessItem(id: string) {
  const pitem = IdProcessMap.get(id)
  if (pitem !== undefined) {
    state.selectedProcessId = id
    state.addrItems = pitem.manager.items
    state.processRecords = pitem.records
  }
}

function selectAddrItem(id: string) {
  if (state.selectedProcessId !== undefined) {
    const pitem = IdProcessMap.get(state.selectedProcessId)
    const aitem = pitem?.manager.getById(id)
    if (pitem && aitem) {
      state.selectedAddrId = id
      state.selectedAddr = aitem.addr
    }
  }
}

function clearAddrItem() {
  state.selectedAddrId = undefined
  state.selectedAddr = undefined
}

export function useDebugInfo() {
  return {
    state,
    selectAddrItem,
    selectProcessItem,
    clearAddrItem,
  }
}
