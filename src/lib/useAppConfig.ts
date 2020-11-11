import { reactive } from 'vue'

export type ViewType = 'obj' | 'list'

type State = {
  view: ViewType
}

const state = reactive<State>({
  view: 'obj',
})

export function useAppConfig() {
  return state
}
