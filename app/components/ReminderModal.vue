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
          <label class="block text-sm font-semibold mb-1">Date <span class="text-red-500">*</span></label>
          <input
            v-model="formData.formDate"
            type="date"
            class="w-full border rounded px-3 py-2"
            :class="v$.formDate.$error ? 'border-red-500' : 'border-gray-300'"
          >
          <span v-if="v$.formDate.$error" class="text-red-500 text-xs mt-1">Date is required</span>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Time <span class="text-red-500">*</span></label>
          <div v-if="isSafari" class="flex gap-2">
            <input
              v-model="safariTimeInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]{2}:[0-9]{2}"
              placeholder="hh:mm (e.g., 02:30)"
              maxlength="5"
              class="flex-1 border rounded px-3 py-2"
              :class="v$.formTime.$error ? 'border-red-500' : 'border-gray-300'"
              @input="formatTimeInput"
            >
            <div class="relative w-24">
              <select
                v-model="safariTimePeriod"
                class="w-full border border-gray-300 rounded px-3 py-2 bg-white appearance-none pr-8"
                @change="convertSafariTimeTo24Hour"
              >
                <option value="AM">a.m</option>
                <option value="PM">p.m</option>
              </select>
              <UIcon 
                name="i-heroicons-chevron-down" 
                class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <input
            v-else
            v-model="formData.formTime"
            type="time"
            class="w-full border rounded px-3 py-2"
            :class="v$.formTime.$error ? 'border-red-500' : 'border-gray-300'"
          >
          <span v-if="v$.formTime.$error" class="text-red-500 text-xs mt-1 block">Time is required</span>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Reminder (max 30 chars) <span class="text-red-500">*</span></label>
          <input
            v-model="formData.formText"
            type="text"
            maxlength="30"
            class="w-full border rounded px-3 py-2"
            :class="v$.formText.$error ? 'border-red-500' : 'border-gray-300'"
            placeholder="Enter reminder..."
          >
          <div class="flex justify-between items-center mt-1">
            <span v-if="v$.formText.$error" class="text-red-500 text-xs">Reminder is required</span>
            <span class="text-xs text-gray-500" :class="v$.formText.$error ? 'ml-auto' : ''">
              {{ formData.formText.length }}/30 characters
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">City <span class="text-red-500">*</span></label>
          <input
            v-model="formData.formCity"
            type="text"
            class="w-full border rounded px-3 py-2"
            :class="v$.formCity.$error ? 'border-red-500' : 'border-gray-300'"
            placeholder="Enter city..."
          >
          <span v-if="v$.formCity.$error" class="text-red-500 text-xs mt-1 block">City is required</span>
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
          <div class="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 class="text-md font-semibold">
              Existing Reminders 
              <span class="text-sm font-normal text-gray-500">
                ({{ existingReminders.length }})
              </span>
            </h3>
            <button
              class="text-xs text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 border border-red-300 hover:border-red-400 transition-colors"
              title="Delete all reminders for this date"
              @click="deleteAllReminders"
            >
              Delete All
            </button>
          </div>
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
                <div class="text-xs text-gray-600 flex items-center gap-1">
                  <span>{{ reminder.city }}</span>
                  <span v-if="reminder.weather" class="inline-flex items-center gap-1">
                    • <span class="font-medium">{{ reminder.weather }}</span>
                    <UIcon :name="getWeatherIcon(reminder.weather)" class="w-4 h-4" />
                  </span>
                </div>
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
import { ref, computed, reactive, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useRemindersStore } from '@/stores/reminders'
import { formatTime } from '@/utils/dateTime'
import { useWeatherIcon } from '@/composables/useWeatherIcon'

const remindersStore = useRemindersStore()
const { getWeatherIcon } = useWeatherIcon()

const formData = reactive({
  formDate: '',
  formTime: '',
  formText: '',
  formCity: ''
})

const formColor = ref('#3472af')
const showExistingOnMobile = ref(false)
const editingId = ref<number | null>(null)

const rules = {
  formDate: { required },
  formTime: { required },
  formText: { required },
  formCity: { required }
}

const v$ = useVuelidate(rules, formData)

const isSafari = ref(false)
if (import.meta.client) {
  isSafari.value = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

const safariTimeInput = ref('')
const safariTimePeriod = ref<'AM' | 'PM'>('AM')

const convertSafariTimeTo24Hour = () => {
  if (safariTimeInput.value) {
    const timeMatch = safariTimeInput.value.match(/^(\d{2}):(\d{2})$/)
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2])
      
      if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return
      
      if (safariTimePeriod.value === 'PM' && hour !== 12) {
        hour += 12
      } else if (safariTimePeriod.value === 'AM' && hour === 12) {
        hour = 0
      }
      
      formData.formTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    }
  }
}

const convert24HourToSafariTime = (time24: string) => {
  if (time24 && isSafari.value) {
    const [hourStr, minute] = time24.split(':')
    if (hourStr && minute) {
      let hour = parseInt(hourStr)
      
      if (hour >= 12) {
        safariTimePeriod.value = 'PM'
        if (hour > 12) hour -= 12
      } else {
        safariTimePeriod.value = 'AM'
        if (hour === 0) hour = 12
      }
      
      safariTimeInput.value = `${String(hour).padStart(2, '0')}:${minute}`
    }
  }
}

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
    formData.formDate = newDate
    formData.formTime = ''
    safariTimeInput.value = ''
    safariTimePeriod.value = 'AM'
    formData.formText = ''
    formData.formCity = ''
    formColor.value = '#3472af'
    showExistingOnMobile.value = false
    editingId.value = null
    v$.value.$reset()
  }
})

const resetForm = () => {
  formData.formDate = remindersStore.selectedDate
  formData.formTime = ''
  safariTimeInput.value = ''
  safariTimePeriod.value = 'AM'
  formData.formText = ''
  formData.formCity = ''
  formColor.value = '#3472af'
  editingId.value = null
  v$.value.$reset()
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

const formatTimeInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/[^\d]/g, '')
  
  if (value.length >= 3) {
    value = value.slice(0, 2) + ':' + value.slice(2, 4)
  }
  
  safariTimeInput.value = value.slice(0, 5)
  convertSafariTimeTo24Hour()
}

const editReminder = (reminder: { id: number; date: string; time: string; text: string; city: string; color: string }) => {
  editingId.value = reminder.id
  formData.formDate = reminder.date
  formData.formTime = reminder.time
  formData.formText = reminder.text
  formData.formCity = reminder.city
  formColor.value = reminder.color
  showExistingOnMobile.value = false
  convert24HourToSafariTime(reminder.time)
  v$.value.$reset()
}

const deleteReminder = (id: number) => {
  remindersStore.deleteReminder(id)
}

const deleteAllReminders = () => {
  remindersStore.deleteAllRemindersForDate(remindersStore.selectedDate)
  showExistingOnMobile.value = false
}

const saveReminder = async () => {
  if (isSafari.value && safariTimeInput.value && safariTimePeriod.value && !formData.formTime) {
    const timeMatch = safariTimeInput.value.match(/^(\d{2}):(\d{2})$/)
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      let hour = parseInt(timeMatch[1])
      const minute = parseInt(timeMatch[2])
      
      if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
        if (safariTimePeriod.value === 'PM' && hour !== 12) {
          hour += 12
        } else if (safariTimePeriod.value === 'AM' && hour === 12) {
          hour = 0
        }
        formData.formTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      }
    }
  }
  
  const isFormValid = await v$.value.$validate()
  
  if (!isFormValid) {
    return
  }

  const reminderData = {
    date: formData.formDate,
    time: formData.formTime,
    text: formData.formText.substring(0, 30),
    city: formData.formCity,
    color: formColor.value
  }

  if (editingId.value) {
    remindersStore.updateReminder(editingId.value, reminderData)
    remindersStore.fetchWeatherForReminder(editingId.value)
  } else {
    remindersStore.addReminder(reminderData)
    // Fetch weather for new reminder
    const newReminderId = remindersStore.reminders[remindersStore.reminders.length - 1]?.id
    if (newReminderId) {
      remindersStore.fetchWeatherForReminder(newReminderId)
    }
  }

  resetForm()
}
</script>
