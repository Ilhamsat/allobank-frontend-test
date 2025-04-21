<script setup lang="ts">
import { computed, toRefs } from 'vue'

const props = defineProps<{ rocket: any }>()
const { rocket } = toRefs(props)

const details = computed(() => [
  { label: 'Description', value: rocket.value.description },
  { label: 'Country', value: rocket.value.country },
  { label: 'Cost per Launch', value: `US$ ${rocket.value.cost_per_launch.toLocaleString()}` },
  { label: 'First Flight', value: formatDate(rocket.value.first_flight) },
  { label: 'Status', value: rocket.value.active ? 'Active' : 'Inactive' }
])

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <v-card elevation="2">
    <v-alert
      v-if="rocket.isLocal"
      type="info"
    >
      This rocket was added locally and is not part of the SpaceX API.
    </v-alert>
    <v-carousel
      height="300"
      show-arrows="hover"
      cycle
    >
      <v-carousel-item
        v-for="(img, index) in rocket.flickr_images"
        :key="index"
        :src="img"
      />
    </v-carousel>

    <v-card-title
      class="text-h5"
    >
      {{ rocket.name }}
    </v-card-title>

    <v-card-text>

      <v-container class="pa-0">
        <v-row
          v-for="(item, index) in details"
          :key="index"
          dense
          class="py-3 border-b"
          align="center"
        >
          <v-col cols="4">
            <span class="text-subtitle-1 font-weight-medium">{{ item.label }}</span>
          </v-col>
          <v-col cols="8">
            <span class="text-body-1 font-weight-regular">{{ item.value }}</span>
          </v-col>
          <v-divider
            v-if="index < details.length - 1"
            class="my-2"
          />
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>


<style scoped>
.border-b {
  border-bottom: 1px solid #e0e0e0;
}
</style>
