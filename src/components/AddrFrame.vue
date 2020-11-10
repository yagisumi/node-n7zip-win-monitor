<template lang="pug">
#addrs
  .item(
    v-for='item in items',
    :key='item.id',
    @click='selectItem(item.id)',
    :class='{ selected: item.id === selectedId, [item.state]: true }'
  )
    .name {{ item.name || "NO_NAME" }}
    .addr {{ item.addr }}
    .life C: {{ item.n_construct }}, D: {{ item.n_destruct }}
    .counts(v-if='item.counts.length > 0') COUNTS: {{ item.counts.join("-") }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDebugInfo } from '../lib/useDebugInfo'

const debug = useDebugInfo()

export const items = computed(() => {
  return debug.state.addrItems
})

export const selectedId = computed(() => {
  return debug.state.selectedAddrItemId
})

export const selectItem = debug.selectAddrItem
</script>

<style lang="stylus" scoped>
#addrs
  grid-row: 2
  grid-column: 2
  background-color: #d0d0d0
  overflow-y: scroll

  .item
    background-color: #ffffff
    padding: 4px
    border-left: solid 4px #b9b9b9
    margin-bottom: 1px

    &:hover
      background-color: #dddddd
      cursor: pointer

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
</style>
