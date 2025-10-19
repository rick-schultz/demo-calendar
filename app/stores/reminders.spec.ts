import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRemindersStore } from '@/stores/reminders'

const createReminderData = (overrides = {}) => ({
  date: '2025-10-20',
  time: '14:30',
  text: 'Test reminder',
  city: 'Test City',
  color: '#3472af',
  ...overrides
})

describe('Reminders Store', () => {
  let store: ReturnType<typeof useRemindersStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRemindersStore()
  })

  describe('addReminder', () => {
    it('should add a reminder to the store', () => {
      const reminderData = createReminderData()

      store.addReminder(reminderData)

      expect(store.reminders).toHaveLength(1)
    })

    it('should include all required fields', () => {
      const reminderData = createReminderData({
        text: 'Team meeting',
        city: 'New York'
      })

      store.addReminder(reminderData)

      expect(store.reminders[0]).toMatchObject(reminderData)
    })

    it('should generate a unique ID', () => {
      const reminderData = createReminderData()

      store.addReminder(reminderData)

      expect(store.reminders[0]?.id).toBeDefined()
      expect(typeof store.reminders[0]?.id).toBe('number')
    })

    it('should store text with maximum 30 characters', () => {
      const reminderData = createReminderData({
        text: 'This text has exactly 30 chars'
      })

      store.addReminder(reminderData)

      expect(store.reminders[0]?.text).toHaveLength(30)
    })

    it('should store date in YYYY-MM-DD format', () => {
      const reminderData = createReminderData()

      store.addReminder(reminderData)

      expect(store.reminders[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should store time in HH:mm format', () => {
      const reminderData = createReminderData({ time: '18:45' })

      store.addReminder(reminderData)

      expect(store.reminders[0]?.time).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should store city information', () => {
      const reminderData = createReminderData({ city: 'Los Angeles' })

      store.addReminder(reminderData)

      expect(store.reminders[0]?.city).toBe('Los Angeles')
    })

    it('should store color as hex value', () => {
      const reminderData = createReminderData({ color: '#ec4899' })

      store.addReminder(reminderData)

      expect(store.reminders[0]?.color).toBe('#ec4899')
    })

    it('should allow multiple reminders for the same date', () => {
      store.addReminder(createReminderData({ time: '09:00' }))
      store.addReminder(createReminderData({ time: '14:00' }))

      expect(store.reminders).toHaveLength(2)
      expect(store.getRemindersForDate('2025-10-20')).toHaveLength(2)
    })

    it('should allow reminders for different dates', () => {
      store.addReminder(createReminderData({ date: '2025-10-20' }))
      store.addReminder(createReminderData({ date: '2025-10-21' }))

      expect(store.getRemindersForDate('2025-10-20')).toHaveLength(1)
      expect(store.getRemindersForDate('2025-10-21')).toHaveLength(1)
    })
  })

  describe('getRemindersForDate', () => {
    it('should return reminders for the specified date', () => {
      const reminderData = createReminderData()
      store.addReminder(reminderData)

      const reminders = store.getRemindersForDate('2025-10-20')

      expect(reminders).toHaveLength(1)
      expect(reminders[0]).toMatchObject(reminderData)
    })

    it('should return empty array when no reminders exist for date', () => {
      const reminders = store.getRemindersForDate('2025-10-20')

      expect(reminders).toEqual([])
    })

    it('should apply default color when reminder has no color', () => {
      const reminderData = createReminderData({ color: '' })
      store.addReminder(reminderData)

      const reminders = store.getRemindersForDate('2025-10-20')

      expect(reminders[0]?.color).toBe('#3472af')
    })

    it('should not return reminders from other dates', () => {
      store.addReminder(createReminderData({ date: '2025-10-20' }))
      store.addReminder(createReminderData({ date: '2025-10-21' }))

      const reminders = store.getRemindersForDate('2025-10-20')

      expect(reminders).toHaveLength(1)
    })
  })

  describe('updateReminder', () => {
    it('should update an existing reminder', () => {
      const originalData = createReminderData({ text: 'Original' })
      store.addReminder(originalData)
      const id = store.reminders[0]!.id

      const updatedData = createReminderData({ text: 'Updated' })
      store.updateReminder(id, updatedData)

      expect(store.reminders[0]?.text).toBe('Updated')
    })

    it('should preserve the reminder ID', () => {
      store.addReminder(createReminderData())
      const originalId = store.reminders[0]!.id

      store.updateReminder(originalId, createReminderData({ text: 'Updated' }))

      expect(store.reminders[0]?.id).toBe(originalId)
    })

    it('should update the color', () => {
      store.addReminder(createReminderData({ color: '#3472af' }))
      const id = store.reminders[0]!.id

      store.updateReminder(id, createReminderData({ color: '#ec4899' }))

      expect(store.reminders[0]?.color).toBe('#ec4899')
    })

    it('should update all fields', () => {
      store.addReminder(createReminderData())
      const id = store.reminders[0]!.id

      const newData = createReminderData({
        date: '2025-10-21',
        time: '11:00',
        text: 'New text',
        city: 'New City',
        color: '#ef4444'
      })
      store.updateReminder(id, newData)

      expect(store.reminders[0]).toMatchObject(newData)
    })

    it('should not affect other reminders', () => {
      store.addReminder(createReminderData({ text: 'First' }))
      store.addReminder(createReminderData({ text: 'Second' }))
      const firstId = store.reminders[0]!.id

      store.updateReminder(firstId, createReminderData({ text: 'Updated' }))

      expect(store.reminders[1]?.text).toBe('Second')
    })
  })

  describe('deleteReminder', () => {
    it('should remove the reminder from the store', () => {
      store.addReminder(createReminderData())
      const id = store.reminders[0]!.id

      store.deleteReminder(id)

      expect(store.reminders).toHaveLength(0)
    })

    it('should only remove the specified reminder', () => {
      store.addReminder(createReminderData({ text: 'First' }))
      store.addReminder(createReminderData({ text: 'Second' }))
      const firstId = store.reminders[0]!.id

      store.deleteReminder(firstId)

      expect(store.reminders).toHaveLength(1)
      expect(store.reminders[0]?.text).toBe('Second')
    })

    it('should handle deleting non-existent reminder gracefully', () => {
      store.addReminder(createReminderData())

      store.deleteReminder(999999)

      expect(store.reminders).toHaveLength(1)
    })
  })

  describe('deleteAllRemindersForDate', () => {
    it('should delete all reminders for a specific date', () => {
      store.addReminder(createReminderData({ date: '2025-10-20', text: 'First' }))
      store.addReminder(createReminderData({ date: '2025-10-20', text: 'Second' }))
      store.addReminder(createReminderData({ date: '2025-10-21', text: 'Third' }))

      store.deleteAllRemindersForDate('2025-10-20')

      expect(store.reminders).toHaveLength(1)
      expect(store.reminders[0]?.text).toBe('Third')
    })

    it('should not delete reminders from other dates', () => {
      store.addReminder(createReminderData({ date: '2025-10-20' }))
      store.addReminder(createReminderData({ date: '2025-10-21' }))
      store.addReminder(createReminderData({ date: '2025-10-22' }))

      store.deleteAllRemindersForDate('2025-10-21')

      expect(store.reminders).toHaveLength(2)
      expect(store.getRemindersForDate('2025-10-20')).toHaveLength(1)
      expect(store.getRemindersForDate('2025-10-22')).toHaveLength(1)
    })

    it('should handle deleting from a date with no reminders', () => {
      store.addReminder(createReminderData({ date: '2025-10-20' }))

      store.deleteAllRemindersForDate('2025-10-25')

      expect(store.reminders).toHaveLength(1)
    })
  })

  describe('Modal Management', () => {
    describe('openModal', () => {
      it('should set showModal to true', () => {
        store.openModal('2025-10-20')

        expect(store.showModal).toBe(true)
      })

      it('should set the selected date', () => {
        store.openModal('2025-10-20')

        expect(store.selectedDate).toBe('2025-10-20')
      })
    })

    describe('closeModal', () => {
      it('should set showModal to false', () => {
        store.openModal('2025-10-20')
        
        store.closeModal()

        expect(store.showModal).toBe(false)
      })

      it('should clear the selected date', () => {
        store.openModal('2025-10-20')
        
        store.closeModal()

        expect(store.selectedDate).toBe('')
      })
    })
  })
})
