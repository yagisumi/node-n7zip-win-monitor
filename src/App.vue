<template>
  <ProcessFrame />
  <AddrFrame />
</template>

<script lang="ts">
import ProcessFrame from './components/ProcessFrame.vue'
import AddrFrame from './components/AddrFrame.vue'
import window from './lib/api-window'

export default {
  name: 'App',
  components: {
    ProcessFrame,
    AddrFrame,
  },
  mounted: async () => {},
}
</script>
