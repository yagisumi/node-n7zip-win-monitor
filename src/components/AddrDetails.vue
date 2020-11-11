<template lang="pug">
#addr-details
  .item(
    v-for='item in items',
    :key='item.id',
    :class='{ selected: item.id === selectedId, [item.state]: true }'
  )
    .name {{ item.name || "NO_NAME" }}
    .addr {{ item.addr }}
    .life C: {{ item.n_construct }}, D: {{ item.n_destruct }}
    .counts(v-if='item.counts.length > 0') COUNTS: {{ item.counts.join("-") }}
    .records
      .record(v-for='record in item.records') {{ record.replace(/^0x\w+: /, "") }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDebugInfo } from '../lib/useDebugInfo2'

const debug = useDebugInfo()

export const items = computed(() => {
  if (debug.state.selectedAddr === undefined) {
    return []
  } else {
    return debug.state.addrItems.filter((item) => item.addr === debug.state.selectedAddr)
  }
})

export const selectedId = computed(() => {
  return debug.state.selectedAddrId
})
</script>

<style lang="stylus" scoped>
#addr-details
  grid-row: 2
  grid-column: 3
  background-color: #ffffff
  overflow-y: scroll

  .item
    padding: 4px
    border-left: solid 4px #b9b9b9
    margin-bottom: 2px

    &.selected
      border-left: solid 4px #0073d6

    &.ok
      border-right: solid 4px #12ce0f

    &.ready
      border-right: solid 4px #49cdea

      .life, .counts
        color: #4681bd

    &.error
      border-right: solid 4px #ea49aa

      .life, .counts
        color: #ec1010

    .records
      border-left: solid 8px #e6e6e6
      padding: 4px
</style>
