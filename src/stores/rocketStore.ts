import { defineStore } from 'pinia'
import axios from 'axios'

export const useRocketStore = defineStore('rocket', {
  state: () => ({
    rockets: [],
    loading: false,
    error: null,
    search: '',
    country: '',
    costMin: 0,
    costMax: Infinity,
    active: 'all' as 'all' | 'true' | 'false',
  }),
  actions: {
    async fetchRockets() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('https://api.spacexdata.com/v4/rockets')
        const apiRockets = response.data

        // Get data from localStorage
        const localData = localStorage.getItem('customRockets')
        const customRockets = localData ? JSON.parse(localData) : []

        // Merge data from API and localStorage
        this.rockets = [...customRockets, ...apiRockets]
      } catch (err) {
        this.error = 'Failed to fetch rockets'
      } finally {
        this.loading = false
      }
    },
    addRocket(rocket: any) {
      // Tambahkan ke state
      rocket.isLocal = true
      this.rockets.unshift(rocket)

      // Update localStorage
      const localData = localStorage.getItem('customRockets')
      const existing = localData ? JSON.parse(localData) : []
      existing.unshift(rocket)
      localStorage.setItem('customRockets', JSON.stringify(existing))
    },
    removeCustomRocket(id: string) {
      // Hapus dari state
      this.rockets = this.rockets.filter((r: any) => r.id !== id)

      // Hapus dari localStorage
      const localData = localStorage.getItem('customRockets')
      const existing = localData ? JSON.parse(localData) : []
      const updated = existing.filter((r: any) => r.id !== id)
      localStorage.setItem('customRockets', JSON.stringify(updated))
    },
    async fetchRocketById(id: string) {
      try {
        const { data } = await axios.get(`https://api.spacexdata.com/v4/rockets/${id}`)
        return data
      } catch (e) {
        return this.getRocketById(id)
      }
    },
    getRocketById(id: string) {
      // Find from state first
      const existing = this.rockets.find((r: any) => r.id === id)
      if (existing) return existing

      // Try to get data from localStorage
      const localData = localStorage.getItem('customRockets')
      const localRockets = localData ? JSON.parse(localData) : []
      return localRockets.find((r: any) => r.id === id)
    }
  },
  getters: {
    countries(state) {
      return [...new Set(state.rockets.map((r: any) => r.country))].sort()
    },
    filteredRockets(state) {
      return state.rockets.filter((rocket: any) => {
        const matchName = rocket.name.toLowerCase().includes(state.search.toLowerCase())
        const matchCountry = state.country ? rocket.country === state.country : true
        const matchCost = rocket.cost_per_launch >= state.costMin && rocket.cost_per_launch <= state.costMax
        const matchActive =
          state.active === 'all' ? true : rocket.active === (state.active === 'true')
        return matchName && matchCountry && matchCost && matchActive
      })
    }
  }
})
