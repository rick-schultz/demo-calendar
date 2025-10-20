import { defineStore } from 'pinia'

export interface Reminder {
  id: number
  date: string
  time: string
  text: string
  city: string
  color: string
  weather?: string | null
}

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    reminders: [] as Reminder[],
    showModal: false,
    selectedDate: '',
    lastWeatherUpdate: {} as Record<string, number>,
    hydrated: false
  }),

  actions: {
    loadFromLocalStorage() {
      if (import.meta.client && !this.hydrated) {
        const stored = localStorage.getItem('reminders')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            this.reminders = data.reminders || []
            this.lastWeatherUpdate = data.lastWeatherUpdate || {}
          } catch (e) {
            console.error('Failed to parse stored reminders:', e)
          }
        }
        this.hydrated = true
      }
    },

    saveToLocalStorage() {
      if (import.meta.client) {
        const data = {
          reminders: this.reminders,
          lastWeatherUpdate: this.lastWeatherUpdate
        }
        localStorage.setItem('reminders', JSON.stringify(data))
      }
    },

    addReminder(reminder: Omit<Reminder, 'id'>) {
      const newReminder: Reminder = {
        ...reminder,
        id: Date.now()
      }
      this.reminders.push(newReminder)
      this.saveToLocalStorage()
    },

    openModal(date: string) {
      this.selectedDate = date
      this.showModal = true
      // Fetch weather only if it wasn't updated in the last 5 minutes
      const now = Date.now()
      const lastUpdate = this.lastWeatherUpdate[date] || 0
      const fiveMinutes = 5 * 60 * 1000
      
      if (now - lastUpdate > fiveMinutes) {
        this.refreshWeatherForDate(date)
      }
    },

    closeModal() {
      this.showModal = false
      this.selectedDate = ''
    },

    deleteReminder(id: number) {
      const index = this.reminders.findIndex(r => r.id === id)
      if (index !== -1) {
        this.reminders.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    deleteAllRemindersForDate(date: string) {
      this.reminders = this.reminders.filter(r => r.date !== date)
      this.saveToLocalStorage()
    },

    updateReminder(id: number, updatedData: Omit<Reminder, 'id'>) {
      const index = this.reminders.findIndex(r => r.id === id)
      if (index !== -1) {
        this.reminders[index] = {
          ...updatedData,
          id
        }
        this.saveToLocalStorage()
      }
    },

    getRemindersForDate(date: string) {
      return this.reminders
        .filter(r => r.date === date)
        .map(r => ({
          ...r,
          color: r.color || '#3472af'
        }))
    },

    async fetchWeatherForReminder(id: number) {
      const { getWeatherForecast } = await import('@/services/weatherService')
      const reminder = this.reminders.find(r => r.id === id)
      
      if (!reminder) return

      const weather = await getWeatherForecast(reminder.date, reminder.city)
      
      const index = this.reminders.findIndex(r => r.id === id)
      if (index !== -1) {
        this.reminders.splice(index, 1, {
          ...this.reminders[index]!,
          weather
        })
        this.saveToLocalStorage()
      }
    },

    async refreshWeatherForDate(date: string) {
      const remindersForDate = this.reminders.filter(r => r.date === date)
      for (const reminder of remindersForDate) {
        await this.fetchWeatherForReminder(reminder.id)
      }
      // Update weather timestamp
      this.lastWeatherUpdate[date] = Date.now()
      this.saveToLocalStorage()
    },

    async refreshAllWeather() {
      const uniqueDates = [...new Set(this.reminders.map(r => r.date))]
      for (const date of uniqueDates) {
        await this.refreshWeatherForDate(date)
      }
    }
  }
})
