import { defineStore } from 'pinia'

export interface Reminder {
  id: number
  date: string
  time: string
  text: string
  city: string
  color: string
}

export const useRemindersStore = defineStore('reminders', {
  state: () => ({
    reminders: [] as Reminder[],
    showModal: false,
    selectedDate: ''
  }),

  actions: {
    addReminder(reminder: Omit<Reminder, 'id'>) {
      const newReminder: Reminder = {
        ...reminder,
        id: Date.now()
      }
      this.reminders.push(newReminder)
    },

    openModal(date: string) {
      this.selectedDate = date
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedDate = ''
    },

    deleteReminder(id: number) {
      const index = this.reminders.findIndex(r => r.id === id)
      if (index !== -1) {
        this.reminders.splice(index, 1)
      }
    },

    getRemindersForDate(date: string) {
      return this.reminders
        .filter(r => r.date === date)
        .map(r => ({
          ...r,
          color: r.color || '#3472af'
        }))
    }
  }
})
