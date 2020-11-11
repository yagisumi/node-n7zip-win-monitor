<template lang="pug">
#toolbar
  #monitor.button(:class='{ [monitorState]: true }', @click='changeMonitoring')
    span.mi {{ monitorState === "monitoring" ? "videocam" : "videocam_off" }}
    span.label {{ monitorLabel }}
  #view-obj.button.view(:class='{ active: appView === "obj" }', @click='changeView')
    span.mi view_comfy
    span.label OBJ
  #view-list.button.view(:class='{ active: appView === "list" }', @click='changeView')
    span.mi reorder
    span.label LIST
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'
import { useMonitor } from '../lib/useMonitor'
import { useAppConfig } from '../lib/useAppConfig'

const monitor = useMonitor()
const config = useAppConfig()

export const appView = toRef(config, 'view')

export function changeView() {
  config.view = config.view === 'obj' ? 'list' : 'obj'
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
  console.log(monitor.state)
  console.log(monitor.error)
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
  grid-column: 1 \/ 4
  background-color: #eeeeee
  font-size: 18px
  line-height: 24px
  border-top: solid 1px #666666
  border-bottom: solid 1px #666666
  padding: 6px

  #monitor
    .label
      display: inline-block
      width: 90px
      text-align: center

  #view-obj
    margin-left: 24px
    margin-right: 6px

  #view-obj, #view-list
    .label
      display: inline-block
      width: 40px
      text-align: center

  .button
    display: inline-block
    padding: 0px 4px
    cursor: pointer
    vertical-align: middle
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
</style>
