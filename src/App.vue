<template>
  <Toolbar />
  <ProcessFrame />
  <AddrFrame />
  <AddrDetails />
</template>

<script lang="ts">
import ProcessFrame from './components/ProcessFrame.vue'
import AddrFrame from './components/AddrFrame.vue'
import AddrDetails from './components/AddrDetails.vue'
import Toolbar from './components/Toolbar.vue'

export default {
  name: 'App',
  components: {
    ProcessFrame,
    AddrFrame,
    AddrDetails,
    Toolbar,
  },
  mounted: async () => {},
}
</script>
