<template>
  <ProcessFrame />
  <AddrFrame />
  <AddrDetails />
</template>

<script lang="ts">
import ProcessFrame from './components/ProcessFrame.vue'
import AddrFrame from './components/AddrFrame.vue'
import AddrDetails from './components/AddrDetails.vue'
import window from './lib/api-window'

export default {
  name: 'App',
  components: {
    ProcessFrame,
    AddrFrame,
    AddrDetails,
  },
  mounted: async () => {},
}
</script>
