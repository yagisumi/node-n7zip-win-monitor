<template lang="pug">
#processes
  .item(
    v-for='item in items',
    :key='item.id',
    @click='selectItem(item.id)',
    :class='{ selected: item.id === selectedId }'
  )
    .pid PID: {{ item.pid }}
    .time {{ formatTime(item.created) }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDebugInfo } from '../lib/useDebugInfo'
import moment from 'moment'

const debug = useDebugInfo()

export const processItems = debug.state.processItems
export const selectedId = computed(() => {
  return debug.state.selectedProcessItemId
})

export const items = computed(() => {
  return debug.state.processItems.slice().reverse()
})

export function formatTime(time: number) {
  const date = moment(time)
  return date.format('YYYY/MM/DD HH:mm:ss')
}

export const selectItem = debug.selectProcessItem
</script>

<style lang="stylus" scoped>
#processes
  grid-row: 2
  grid-column: 1
  background-color: #ffffff
  overflow-y: scroll

  .item
    padding: 4px
    border-left: solid 4px #b9b9b9
    margin-bottom: 1px

    &:hover
      background-color: #dddddd
      cursor: pointer

    &.selected
      border-left: solid 4px #0073d6
</style>
