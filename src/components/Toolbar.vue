<template lang="pug">
#toolbar
  #clear-processes.button(@click='clearProcesses')
    span.label CLEAR
  #monitor.button(:class='{ [monitorState]: true }', @click='changeMonitoring')
    span.mi {{ monitorState === "monitoring" ? "videocam" : "videocam_off" }}
    span.label {{ monitorLabel }}
  #view-list.button.view(:class='{ active: appView === "list" }', @click='changeView')
    span.mi reorder
    span.label LIST
  #view-obj.button.view(:class='{ active: appView === "obj" }', @click='changeView')
    span.mi view_comfy
    span.label OBJ
  #show-errors.button(:class='{ active: showErrors }', @click='changeShorErrors')
    span.mi error_outline
    span.label RDY&amp;ERR
  #selected-addr.button(:class='{ active: !showErrors && selectedAddr }')
    span.label {{ selectedAddr }}
    span.mi.close(v-if='selectedAddr', @click='clearAddr') close
    span.mi.temp(v-else) remove
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useMonitor } from '../lib/useMonitor'
import { useAppConfig } from '../lib/useAppConfig'
import { useDebugInfo } from '../lib/useDebugInfo'

const monitor = useMonitor()
const config = useAppConfig()
const debug = useDebugInfo()

export const appView = toRef(config, 'view')
export const showErrors = toRef(config, 'showErrors')
export const selectedAddr = toRef(debug.state, 'selectedAddr')

export const clearAddr = debug.clearAddrItem
export const clearProcesses = debug.clearProcesses

export function changeView() {
  config.view = config.view === 'obj' ? 'list' : 'obj'
}

export function changeShorErrors() {
  config.showErrors = !config.showErrors
}

export const monitorState = monitor.state

export const monitorLabel = computed(() => {
  if (monitor.state.value === 'monitoring') {
    return 'RECORDING'
  } else if (monitor.state.value === 'ready') {
    return 'READY'
  } else {
    return 'ERROR'
  }
})

export async function changeMonitoring() {
  if (monitor.state.value === 'monitoring') {
    await monitor.stop()
  } else {
    await monitor.start()
  }
}
</script>

<style lang="stylus" scoped>
#toolbar
  grid-row: 1
  grid-column: 1 / 4
  background-color: #eeeeee
  font-size: 18px
  line-height: 24px
  border-top: solid 1px #666666
  border-bottom: solid 1px #666666
  padding: 6px
  white-space: nowrap

  .button
    display: inline-block
    padding: 0px 4px
    cursor: pointer
    vertical-align: middle
    user-select: none
    border: solid 1px #666666
    background-color: #eeeeee

    span
      vertical-align: middle

    &.monitoring
      background-color: #56e850

    &.ready
      background-color: #eeeeee

    &.error
      background-color: #f75e5e

    &.view
      color: gray
      background: #ffffff

    &.view.active
      color: #ffffff
      background: #19bce0

  #monitor
    .label
      display: inline-block
      width: 90px
      text-align: center

  #view-list
    margin-left: 16px
    margin-right: 2px

  #view-obj, #view-list
    .label
      display: inline-block
      width: 40px
      text-align: center

  #show-errors
    margin-left: 16px
    color: gray

    span.mi
      padding-right: 4px

    &.active
      color: red
      background: white

  #selected-addr
    margin-left: 16px
    cursor: default
    color: gray

    .label
      display: inline-block
      width: 170px
      text-align: center

    span.close
      cursor: pointer

    span.temp
      color: #eeeeee

    &.active
      background: white
      color: black

  #clear-processes
    margin-right: 16px
    background: white
    color: #cc2727
</style>
