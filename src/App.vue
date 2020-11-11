<template>
  <Toolbar />
  <ProcessFrame />
  <template v-if="config.view === 'obj'">
    <AddrFrame />
    <AddrDetails />
  </template>
  <template v-else>
    <ProcessRecords />
  </template>
</template>

<script lang="ts">
import ProcessFrame from './components/ProcessFrame.vue'
import AddrFrame from './components/AddrFrame.vue'
import AddrDetails from './components/AddrDetails.vue'
import Toolbar from './components/Toolbar.vue'
import ProcessRecords from './components/ProcessRecords.vue'

export default {
  name: 'App',
  components: {
    ProcessFrame,
    AddrFrame,
    AddrDetails,
    Toolbar,
    ProcessRecords,
  },
}
</script>

<script lang="ts" setup>
import {} from 'vue'
import { useAppConfig } from './lib/useAppConfig'

export const config = useAppConfig()
</script>
