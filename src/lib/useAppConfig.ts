import { reactive } from 'vue'

export type ViewType = 'obj' | 'list'

type State = {
  view: ViewType
  showErrors: boolean
}

const state = reactive<State>({
  view: 'list',
  showErrors: false,
})

export function useAppConfig() {
  return state
}
