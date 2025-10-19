<template>
  <div
    v-if="remindersStore.showModal"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div 
      class="bg-white rounded-lg p-6 w-full flex flex-col relative"
      :class="existingReminders.length > 0 ? 'max-w-4xl' : 'max-w-lg'"
    >
      <!-- Close Button -->
      <button
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
        title="Close"
        @click="closeModal"
      >
        <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
      </button>

      <!-- Mobile: Back Button -->
      <button
        v-if="showExistingOnMobile"
        class="md:hidden flex items-center gap-2 text-gray-700 mb-4"
        @click="showExistingOnMobile = false"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
        <span>Back</span>
      </button>

      <h2 class="text-xl font-bold mb-4">Manage Reminders</h2>
      
      <div class="md:flex gap-6">
        <!-- Reminder Section -->
        <div class="flex-1 flex flex-col" :class="{ 'hidden md:flex': showExistingOnMobile }">
          <h3 class="text-md font-semibold mb-3">{{ editingId ? 'Edit Reminder' : 'Add New Reminder' }}</h3>
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
        <div>
          <label class="block text-sm font-semibold mb-1">Color</label>
          <div class="flex gap-2">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              type="button"
              class="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
              :class="formColor === color.value ? 'border-gray-800' : 'border-gray-300'"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
              @click="formColor = color.value"
            />
          </div>
        </div>
      </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-[#3472af] text-white rounded hover:bg-[#2a5a8f]"
              @click="saveReminder"
            >
              {{ editingId ? 'Update Reminder' : 'Add Reminder' }}
            </button>
          </div>

          <!-- Mobile: View Existing Reminders Button -->
          <button
            v-if="existingReminders.length > 0"
            class="md:hidden mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2"
            @click="showExistingOnMobile = true"
          >
            <span>View Existing Reminders ({{ existingReminders.length }})</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </button>
        </div>

        <!-- Existing Reminders Section -->
        <div v-if="existingReminders.length > 0" class="flex-1 flex flex-col max-h-[600px] md:border-l md:border-gray-200 md:pl-6" :class="{ 'hidden md:flex': !showExistingOnMobile }">
          <h3 class="text-md font-semibold mb-3 flex-shrink-0">
            Existing Reminders 
            <span class="text-sm font-normal text-gray-500">
              ({{ existingReminders.length }})
            </span>
          </h3>
          <div class="space-y-2 overflow-y-auto overflow-x-hidden pr-2 flex-1">
            <div
              v-for="reminder in existingReminders"
              :key="reminder.id"
              class="flex items-center gap-3 bg-gray-50 p-3 rounded border-2"
              :style="{ borderColor: reminder.color }"
            >
              <div
                class="w-1 h-12 rounded flex-shrink-0"
                :style="{ backgroundColor: reminder.color }"
              />
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm">{{ formatTime(reminder.time) }} - {{ reminder.text }}</div>
                <div class="text-xs text-gray-600">{{ reminder.city }}</div>
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <button
                  class="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                  title="Edit reminder"
                  @click="editReminder(reminder)"
                >
                  <UIcon name="i-heroicons-pencil" class="w-5 h-5" />
                </button>
                <button
                  class="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRemindersStore } from '@/stores/reminders'
import { formatTime } from '@/utils/dateTime'

const remindersStore = useRemindersStore()

const formDate = ref('')
const formTime = ref('')
const formText = ref('')
const formCity = ref('')
const formColor = ref('#3472af')
const showExistingOnMobile = ref(false)
const editingId = ref<number | null>(null)

const colorOptions = [
  { name: 'Blue', value: '#3472af' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' }
]

const existingReminders = computed(() => {
  return remindersStore.getRemindersForDate(remindersStore.selectedDate)
})

watch(() => remindersStore.selectedDate, (newDate) => {
  if (newDate) {
    formDate.value = newDate
    formTime.value = ''
    formText.value = ''
    formCity.value = ''
    formColor.value = '#3472af'
    showExistingOnMobile.value = false
    editingId.value = null
  }
})

const resetForm = () => {
  formDate.value = remindersStore.selectedDate
  formTime.value = ''
  formText.value = ''
  formCity.value = ''
  formColor.value = '#3472af'
  editingId.value = null
}

const closeModal = () => {
  showExistingOnMobile.value = false
  editingId.value = null
  remindersStore.closeModal()
}

const cancelEdit = () => {
  if (editingId.value) {
    resetForm()
  } else {
    closeModal()
  }
}

const editReminder = (reminder: { id: number; date: string; time: string; text: string; city: string; color: string }) => {
  editingId.value = reminder.id
  formDate.value = reminder.date
  formTime.value = reminder.time
  formText.value = reminder.text
  formCity.value = reminder.city
  formColor.value = reminder.color
  showExistingOnMobile.value = false
}

const deleteReminder = (id: number) => {
  remindersStore.deleteReminder(id)
}

const saveReminder = () => {
  if (!formDate.value || !formTime.value || !formText.value || !formCity.value) {
    alert('Please fill in all fields')
    return
  }

  const reminderData = {
    date: formDate.value,
    time: formTime.value,
    text: formText.value.substring(0, 30),
    city: formCity.value,
    color: formColor.value
  }

  if (editingId.value) {
    remindersStore.updateReminder(editingId.value, reminderData)
  } else {
    remindersStore.addReminder(reminderData)
  }

  resetForm()
}
</script>
