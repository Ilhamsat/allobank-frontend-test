<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRocketStore } from '@/stores/rocketStore'
import Swal from 'sweetalert2'

const rocketStore = useRocketStore()
const expandedRocketId = ref<string | null>(null)
const costRange = ref<[number, number]>([0, 90000000])
const showAddDialog = ref(false)
const newRocket = ref({
  name: '',
  description: '',
  country: '',
  cost_per_launch: 0,
  first_flight: '',
  active: true,
  flickr_images: []
})

function resetForm() {
  newRocket.value = {
    name: '',
    description: '',
    country: '',
    cost_per_launch: 0,
    first_flight: '',
    active: true,
    flickr_images: []
  }
}

function addRocket() {
  if (!newRocket.value.name || !newRocket.value.description) return

  const fakeId = 'local-' + Date.now()
  rocketStore.addRocket({ ...newRocket.value, id: fakeId })
  showAddDialog.value = false
  resetForm()
  Swal.fire({
    icon: 'success',
    title: 'Rocket added',
    text: 'The new rocket has been added successfully.',
    timer: 2500,
    showConfirmButton: false
  })
}

function confirmDeleteRocket(rocket: any) {
  Swal.fire({
    title: `Are you sure want to delete ${rocket.name}?`,
    text: 'You won\'t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: 'Yes, delete it',
  }).then((result) => {
    if (result.isConfirmed) {
      rocketStore.removeCustomRocket(rocket.id)
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${rocket.name} has been deleted.`,
        timer: 2000,
        showConfirmButton: false
      })
    }
  })
}

watch(costRange, ([min, max]) => {
  rocketStore.costMin = min
  rocketStore.costMax = max
})

onMounted(() => {
  rocketStore.fetchRockets()
})
</script>

<template>
  <v-container>
    <!-- FILTER SECTION -->
    <v-card
      class="mb-6"
      elevation="1"
    >
      <v-card-title>
        <v-icon
          icon="mdi-filter"
          class="mr-2"
        />
        Filter Rockets
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="rocketStore.search"
              label="Search by name"
              prepend-inner-icon="mdi-magnify"
              clearable
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="rocketStore.country"
              :items="rocketStore.countries"
              label="Country"
              clearable
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-range-slider
              v-model="costRange"
              :min="0"
              :max="90000000"
              step="1000000"
              label="Cost per Launch (USD)"
              hide-details
              ticks="always"
            />
            <div class="text-caption text-right mt-n2">
              US$ {{ costRange[0].toLocaleString() }} - {{ costRange[1].toLocaleString() }}
            </div>
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <v-radio-group
              v-model="rocketStore.active"
              row
            >
              <v-label class="text-subtitle-2 mb-2">
                Active Status
              </v-label>
              <v-radio
                label="All"
                value="all"
              />
              <v-radio
                label="Active"
                value="true"
              />
              <v-radio
                label="Inactive"
                value="false"
              />
            </v-radio-group>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-btn
      class="mb-4"
      color="primary"
      @click="showAddDialog = true"
    >
      <v-icon left>
        mdi-plus
      </v-icon> Add New Rocket
    </v-btn>

    <v-alert
      v-if="rocketStore.error"
      type="error"
      border="start"
      border-color="red"
    >
      {{ rocketStore.error }}
      <v-btn
        class="ml-4"
        variant="outlined"
        @click="rocketStore.fetchRockets()"
      >
        Retry
      </v-btn>
    </v-alert>

    <!-- LOADING -->
    <v-progress-circular
      v-if="rocketStore.loading"
      indeterminate
      color="primary"
      class="d-block mx-auto my-10"
    />

    <!-- ROCKET LIST SECTION -->
    <v-card
      v-if="!rocketStore.loading && !rocketStore.error"
      elevation="1"
    >
      <v-card-title>
        <v-icon
          icon="mdi-rocket-launch-outline"
          class="mr-2"
        />
        Rocket List
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-row>
          <v-col
            v-for="rocket in rocketStore.filteredRockets"
            :key="rocket.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="d-flex flex-column h-100">
              <router-link
                :to="`/rockets/${rocket.id}`"
                class="text-decoration-none"
                style="flex: 1"
              >
                <v-card>
                  <div
                    style="height: 100%; display: flex; flex-direction: column;"
                    @click.stop
                  >
                    <v-carousel
                      height="200"
                      show-arrows="hover"
                      cycle
                    >
                      <v-carousel-item
                        v-for="(img, index) in rocket.flickr_images"
                        :key="index"
                        :src="img" />
                    </v-carousel>
                    <v-card-title>{{ rocket.name }}</v-card-title>
                    <v-card-text class="flex-grow-1">
                      <div v-if="expandedRocketId === rocket.id">
                        {{ rocket.description }}
                        <v-btn
                          variant="text"
                          size="small"
                          @click.stop="expandedRocketId = null"
                        >
                          Show less
                        </v-btn>
                      </div>
                      <div v-else>
                        {{ rocket.description.slice(0, 150) }}<span v-if="rocket.description.length > 150">...</span>
                        <v-btn
                          v-if="rocket.description.length > 150"
                          variant="text"
                          size="small"
                          @click.stop="expandedRocketId = rocket.id"
                        >
                          Show more
                        </v-btn>
                      </div>
                    </v-card-text>
                  </div>
                </v-card>
              </router-link>

              <v-card-actions v-if="rocket.isLocal">
                <v-spacer />
                <v-btn
                  color="error"
                  variant="text"
                  @click.stop="confirmDeleteRocket(rocket)"
                >
                  <v-icon>mdi-delete</v-icon> Delete
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-alert
          v-if="rocketStore.filteredRockets.length === 0"
          type="info"
          class="mt-6"
        >
          No rockets match the current filters.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- MODAL ADD ROCKET SECTION -->
  <v-dialog
    v-model="showAddDialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title>Add New Rocket</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newRocket.name"
          label="Name"
          required
        />
        <v-textarea
          v-model="newRocket.description"
          label="Description"
          required
        />
        <v-text-field
          v-model="newRocket.country"
          label="Country"
          required
        />
        <v-text-field
          v-model.number="newRocket.cost_per_launch"
          label="Cost per Launch (USD)"
          type="number"
          min="0"
        />
        <v-text-field
          v-model="newRocket.first_flight"
          label="First Flight"
          type="date"
        />
        <v-switch
          v-model="newRocket.active"
          color="primary"
          label="Active"
        />
        <v-textarea
          v-model="newRocket.flickr_images"
          label="Image URLs (comma separated)"
          hint="https://img1.jpg, https://img2.jpg"
          persistent-hint
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          text
          @click="showAddDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="() => {
            newRocket.flickr_images = newRocket.flickr_images
              .split(',')
              .map(url => url.trim())
            addRocket()
          }"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card {
  min-height: 350px;
}
</style>
