import { reactive } from 'vue'
import { useMonitor } from './useMonitor'
import { DebugInfo } from './commands'

class ProcessItem {
  readonly pid: number
  readonly created: number
  readonly id: string
  addrItemMap = new Map<string, AddrItem>()
  addrItems: Array<AddrItem> = reactive([])
  records: Array<string> = []

  private addr_num_map = new Map<string, number>()
  private addr_item_map = new Map<string, AddrItem>()

  constructor(pid: number) {
    this.pid = pid
    this.created = Date.now()
    this.id = `${pid}-${this.created}`
  }

  append(info: DebugInfo) {
    this.records.push(info.message)

    if (info.message.match(/(0x\w+): ([\s\S]+)/)) {
      const addr = RegExp.$1
      const rest = RegExp.$2

      if (rest.match(/@ (\w+)/)) {
        const name = RegExp.$1
        const item = this.getAddrItem(addr)
        item.set_name(name)
      } else if (rest.match(/(\+\+|--) (\w+) #(\d+)/)) {
        // const sign = RegExp.$1
        const name = RegExp.$2
        const count = RegExp.$3
        const item = this.getAddrItem(addr)
        item.set_name(name)
        item.add_count(parseInt(count))
      } else if (rest.match(/([+-]) (\w+)/)) {
        const sign = RegExp.$1
        const name = RegExp.$2
        if (sign === '+') {
          const newItem = this.getNewAddrItem(addr, name)
          newItem.construct()
        } else {
          const item = this.getAddrItem(addr)
          item.set_name(name)
          item.destruct()
          // this.sealAddrItem(addr)
        }
      } else {
        const item = this.getAddrItem(addr)
        item.add_record(rest)
      }
    }
  }

  addAddrItem(item: AddrItem) {
    this.addrItems.push(reactive(item))
    this.addrItemMap.set(item.id, reactive(item))
  }

  getAddrItemById(id: string) {
    return this.addrItemMap.get(id)
  }

  getNewAddrItem(addr: string, name?: string) {
    this.sealAddrItem(addr)
    return this.getAddrItem(addr, name)
  }

  sealAddrItem(addr: string) {
    const item = this.addr_item_map.get(addr)
    if (item != null) {
      this.addr_item_map.delete(addr)
    }
  }

  getAddrItem(addr: string, name?: string) {
    let item = this.addr_item_map.get(addr)
    if (item == null) {
      const n = this.addr_num_map.get(addr) ?? 0
      item = new AddrItem(addr, n + 1)
      this.addr_num_map.set(addr, n + 1)
      this.addr_item_map.set(addr, item)
      if (name != null && name != '') {
        item.name = name
      }
      this.addAddrItem(item)
    }

    return item
  }
}

type AddrItemState = 'ready' | 'ok' | 'error'

class AddrItem {
  id: string
  addr: string
  num: number
  name = ''
  n_construct = 0
  n_destruct = 0
  counts: number[] = []
  records: string[] = []
  state: AddrItemState = 'ready'

  constructor(addr: string, num: number) {
    this.id = `${addr}#${num}`
    this.addr = addr
    this.num = num
  }

  set_name(name: string) {
    if (this.name === '' && name != null && name !== '') {
      this.name = name
    }
  }

  updateState() {
    let n_zero = 0
    this.counts.forEach((c) => {
      if (c === 0) {
        n_zero += 1
      }
    })

    if (this.n_construct == 1 && this.n_destruct == 1) {
      this.state = 'ok'
    } else if (n_zero === 1 && this.counts[this.counts.length - 1] === 0) {
      this.state = 'ok'
    } else if (n_zero > 0) {
      this.state = 'error'
    } else if (this.n_destruct > this.n_construct) {
      this.state = 'error'
    } else {
      this.state = 'ready'
    }
  }

  construct() {
    this.n_construct += 1
    this.updateState()
  }

  destruct() {
    this.n_destruct += 1
    this.updateState()
  }

  add_count(n: number) {
    this.counts.push(n)
    this.updateState()
  }

  add_record(msg: string) {
    this.records.push(msg)
  }
}

let currentProcessItem: ProcessItem | undefined = undefined

type State = {
  processItems: Array<ProcessItem>
  selectedProcessItemId: string | undefined
  addrItems: Array<AddrItem>
  selectedAddrItemId: string | undefined
  selectedAddrItem: AddrItem | undefined
}

const processItemMap = new Map<string, ProcessItem>()

const state = reactive<State>({
  processItems: [],
  selectedProcessItemId: undefined,
  addrItems: [],
  selectedAddrItemId: undefined,
  selectedAddrItem: undefined,
})

function appendProcessItem(pitem: ProcessItem) {
  console.log('appendProcessItem')
  processItemMap.set(pitem.id, pitem)
  state.processItems.push(pitem)
}

function selectProcessItem(id: string) {
  const pitem = processItemMap.get(id)
  if (pitem != null) {
    state.selectedProcessItemId = id
    state.addrItems = pitem.addrItems
    state.selectedAddrItemId = undefined
    state.selectedAddrItem = undefined
    return true
  }

  return false
}

function getSelectedProcessItem() {
  if (state.selectedProcessItemId !== undefined) {
    return processItemMap.get(state.selectedProcessItemId)
  }
  return undefined
}

function selectAddrItem(id: string) {
  console.log('selectAddrItem', { id })
  const selectedProcessItem = getSelectedProcessItem()
  console.log(selectedProcessItem !== undefined)
  if (selectedProcessItem !== undefined) {
    const addrItem = selectedProcessItem.getAddrItemById(id)
    console.log({ addrItem })
    if (addrItem !== undefined) {
      state.selectedAddrItem = addrItem
      state.selectedAddrItemId = id
      return true
    }
  }

  return false
}

const monitor = useMonitor()
const r_start = monitor.start()
console.log({ r_start })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sid = monitor.subscribe((info) => {
  console.log({ info })
  if (currentProcessItem?.pid === info.pid) {
    currentProcessItem.append(info)
    if (info.message === 'n7zip end') {
      currentProcessItem = undefined
    }
  } else {
    if (info.message === 'n7zip start') {
      console.log('n7zip start')
      const pitem = new ProcessItem(info.pid)
      appendProcessItem(pitem)
      currentProcessItem = pitem
      selectProcessItem(pitem.id)
    }
  }
})

export function useDebugInfo() {
  return {
    state,
    selectAddrItem,
    selectProcessItem,
  }
}
