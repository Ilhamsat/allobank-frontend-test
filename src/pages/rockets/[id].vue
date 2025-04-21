<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRocketStore } from '@/stores/rocketStore'
import RocketDetail from '@/components/RocketDetail.vue'

const route = useRoute()
const rocketStore = useRocketStore()
const rocket = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbs = [
  { title: 'Home', href: '/' },
  { title: 'Rockets', href: '/rockets' },
  { title: 'Detail', disabled: true }
]

onMounted(async () => {
  loading.value = true
  const rocketData = await rocketStore.fetchRocketById(route.params.id as string)
  if (rocketData) {
    rocket.value = rocketData
  } else {
    error.value = 'Rocket not found.'
  }
  loading.value = false
})
</script>

<template>
  <v-container>
    <v-breadcrumbs
      :items="breadcrumbs"
      class="mb-4"
    >
      <template #divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <v-btn
      class="mb-4"
      icon
      @click="$router.back()"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <v-alert
      v-if="error"
      type="error"
    >
      {{ error }}
    </v-alert>
    <v-progress-circular
      v-if="loading"
      indeterminate
      class="d-block mx-auto my-10"
      color="primary"
    />
    <RocketDetail
      v-if="rocket && !loading"
      :rocket="rocket"
    />
  </v-container>
</template>
