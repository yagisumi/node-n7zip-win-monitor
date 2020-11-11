<template lang="pug">
#process-records
  .record(
    v-for='(record, idx) in records',
    :class='{ [record.obj ? record.obj.state : "msg"]: true }'
  )
    sapn.addr(v-if='record.addr')
      a(href='#', @click.stop.prevent='selectAddr(record.obj)') {{ record.addr }}
      | :&nbsp;
    span {{ record.message }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useDebugInfo, AddrItem } from '../lib/useDebugInfo'
import { useAppConfig } from '../lib/useAppConfig'

const debug = useDebugInfo()
const config = useAppConfig()

export const records = computed(() => {
  if (config.showErrors) {
    return debug.state.processRecords.filter((record) => {
      return record.addr === undefined || record.obj?.state !== 'ok'
    })
  } else if (debug.state.selectedAddr !== undefined) {
    return debug.state.processRecords.filter((record) => {
      return record.addr === undefined || record.addr === debug.state.selectedAddr
    })
  } else {
    return debug.state.processRecords
  }
})

export function selectAddr(aitem?: AddrItem) {
  if (aitem) {
    debug.selectAddrItem(aitem.id)
  }
}
</script>

<style lang="stylus" scoped>
#process-records
  grid-row: 2
  grid-column: 2 \/ 4
  background-color: white
  overflow-y: scroll

  .record
    border-left: solid 4px #ffffff
    padding-left: 4px

    &.ok
      border-left: solid 4px #12ce0f

    &.ready
      border-left: solid 4px #49cdea

    &.error
      border-left: solid 4px #ea49aa

    .addr
      a:link
        color: #000000
        text-decoration: none

      a:visited
        color: #000000
        text-decoration: none

      a:hover
        color: #000000
        text-decoration: underline

      a:active
        color: #000000
</style>
