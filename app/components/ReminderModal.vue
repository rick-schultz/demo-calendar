<template>
  <div
    v-if="remindersStore.showModal"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg p-6 w-[90%] max-w-md max-h-[80vh] flex flex-col">
      <h2 class="text-xl font-bold mb-4">Manage Reminders</h2>
      
      <h3 class="text-md font-semibold mb-3">Add New Reminder</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Date</label>
          <input
            v-model="formDate"
            type="date"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Time</label>
          <input
            v-model="formTime"
            type="time"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Reminder (max 30 chars)</label>
          <input
            v-model="formText"
            type="text"
            maxlength="30"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter reminder..."
          >
          <div class="text-xs text-gray-500 mt-1">
            {{ formText.length }}/30 characters
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">City</label>
          <input
            v-model="formCity"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter city..."
          >
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-[#3472af] text-white rounded hover:bg-[#2a5a8f]"
          @click="addReminder"
        >
          Add Reminder
        </button>
      </div>

      <div v-if="existingReminders.length > 0" class="mt-6 pt-6 border-t border-gray-200 flex-shrink-0">
        <h3 class="text-md font-semibold mb-3">Existing Reminders:</h3>
        <div class="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          <div
            v-for="reminder in existingReminders"
            :key="reminder.id"
            class="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
          >
            <div class="flex-1">
              <div class="font-semibold text-sm">{{ reminder.time }} - {{ reminder.text }}</div>
              <div class="text-xs text-gray-600">{{ reminder.city }}</div>
            </div>
            <button
              class="ml-3 text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
              title="Delete reminder"
              @click="deleteReminder(reminder.id)"
            >
              <UIcon name="i-heroicons-trash" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRemindersStore } from '@/stores/reminders'

const remindersStore = useRemindersStore()

const formDate = ref('')
const formTime = ref('')
const formText = ref('')
const formCity = ref('')

const existingReminders = computed(() => {
  return remindersStore.getRemindersForDate(remindersStore.selectedDate)
})

watch(() => remindersStore.selectedDate, (newDate) => {
  if (newDate) {
    formDate.value = newDate
    formTime.value = ''
    formText.value = ''
    formCity.value = ''
  }
})

const closeModal = () => {
  remindersStore.closeModal()
}

const deleteReminder = (id: number) => {
  remindersStore.deleteReminder(id)
}

const addReminder = () => {
  if (!formDate.value || !formTime.value || !formText.value || !formCity.value) {
    alert('Please fill in all fields')
    return
  }

  remindersStore.addReminder({
    date: formDate.value,
    time: formTime.value,
    text: formText.value.substring(0, 30),
    city: formCity.value
  })

  closeModal()
}
</script>
