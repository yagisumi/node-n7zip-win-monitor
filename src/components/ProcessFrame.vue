<template lang="pug">
#processes
  .item(
    v-for='item in items',
    :key='item.id',
    @click='selectItem(item.id)',
    :class='{ selected: item.id === selectedId }'
  )
    .pid PID: {{ item.pid }}
    .time {{ item.date }}
    .counts
      span.ready RDY:{{ item.n_ready }}
      span.ok OK:{{ item.n_ok }}
      span.error ERR:{{ item.n_error }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDebugInfo } from '../lib/useDebugInfo2'
import moment from 'moment'

const debug = useDebugInfo()

export const processItems = debug.state.processItems
export const selectedId = computed(() => {
  return debug.state.selectedProcessId
})

export const items = computed(() => {
  return debug.state.processItems.slice().reverse()
})

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

    .counts
      span
        margin-right: 6px

        &.ready
          border-bottom: solid 2px #49cdea

        &.ok
          border-bottom: solid 2px #12ce0f

        &.error
          border-bottom: solid 2px #ea49aa
</style>
