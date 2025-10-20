<template>
  <div class="w-full h-full max-md:h-[50vh] flex items-center justify-center overflow-hidden">
    <div class="w-[90%] max-w-[1400px] h-[95%] max-h-[900px] flex flex-col bg-white overflow-hidden">
      <div class="flex-shrink-0 flex items-center justify-center gap-4 pb-4">
        <button 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Previous month"
          @click="previousMonth"
        >
          <UIcon name="i-heroicons-chevron-left" class="w-6 h-6 text-[#3472af]" />
        </button>
        <div class="font-bold text-2xl flex items-center justify-center w-48">
          {{ monthYear }}
        </div>
        <button 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          aria-label="Next month"
          @click="nextMonth"
        >
          <UIcon name="i-heroicons-chevron-right" class="w-6 h-6 text-[#3472af]" />
        </button>
      </div>
      <div class="grid grid-cols-7 flex-shrink-0">
        <div
          v-for="(day, i) in weekdaysFull"
          :key="day"
          class="text-center font-semibold text-white bg-[#3472af] md:text-lg text-[0.95rem] border-b border-[#ccc]"
        >
          <span class="hidden md:inline">{{ day }}</span>
          <span class="md:hidden">{{ weekdaysShort[i] }}</span>
        </div>
      </div>
      <div class="days flex-1 min-h-0 grid grid-cols-7">
        <div
          v-for="(dayObj, idx) in days"
          :key="idx"
          class="day-cell px-[0.5em] py-[0.4em] text-[0.9rem] lg:text-[1.3rem] font-semibold cursor-pointer hover:bg-blue-50 flex flex-col"
          :class="{
            'today-cell': isToday(dayObj.date),
            'text-[#b0b0b0]': !dayObj.current,
            'text-[#3472af]': isWeekend(dayObj.date) && dayObj.current,
            'bg-[#f3f3f3]': isWeekend(dayObj.date),
            'bg-white': !isWeekend(dayObj.date)
          }"
          @click="openReminderModal(dayObj.date)"
        >
          <div class="flex-shrink-0">{{ dayObj.date.getDate() }}</div>
          <div v-if="getRemindersForDay(dayObj.date).length > 0" class="text-[0.5rem] md:text-xs font-normal mt-1 space-y-0.5 overflow-y-auto scrollbar-hide">
            <div
              v-for="group in groupRemindersByTime(getRemindersForDay(dayObj.date))"
              :key="group.time"
              class="space-y-0.5"
            >
              <div 
                class="grid gap-0.5"
                :class="group.items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
              >
                <div
                  v-for="reminder in group.items"
                  :key="reminder.id"
                  class="flex items-center justify-between gap-1 px-1 py-0.5 rounded"
                  :style="{ backgroundColor: reminder.color + '20', color: reminder.color }"
                  :title="reminder.weather ? `Weather: ${reminder.weather}` : ''"
                >
                  <span class="truncate">{{ formatTime(reminder.time) }} {{ reminder.text }}</span>
                  <UIcon 
                    v-if="reminder.weather" 
                    :name="getWeatherIcon(reminder.weather)" 
                    class="hidden md:flex flex-shrink-0 w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ReminderModal />
  </div>
</template>


<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRemindersStore } from '@/stores/reminders'
import { formatDate, formatTime } from '@/utils/dateTime'
import { useWeatherIcon } from '@/composables/useWeatherIcon'

const remindersStore = useRemindersStore()
const route = useRoute()
const router = useRouter()
const { getWeatherIcon } = useWeatherIcon()

// Force re-render on client side
const isClient = ref(false)

// Auto-refresh every 5 minutes
let weatherRefreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  isClient.value = true
  
  // Set URL params to current month/year if not present
  if (!route.query.year || !route.query.month) {
    const now = dayjs()
    router.replace({
      query: {
        year: now.year(),
        month: now.month()
      }
    })
  }
  
  // Initial fetch
  remindersStore.loadFromLocalStorage()
  remindersStore.refreshAllWeather()
  
  // Set up 5-minute auto-refresh
  weatherRefreshInterval = setInterval(() => {
    remindersStore.refreshAllWeather()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (weatherRefreshInterval) {
    clearInterval(weatherRefreshInterval)
  }
})

const currentDate = computed(() => {
  const year = route.query.year ? parseInt(route.query.year as string) : dayjs().year()
  const month = route.query.month ? parseInt(route.query.month as string) : dayjs().month()
  return dayjs().year(year).month(month)
})

const monthYear = computed(() => currentDate.value.format('MMMM YYYY'))

const previousMonth = () => {
  const newDate = currentDate.value.subtract(1, 'month')
  router.push({
    query: {
      year: newDate.year(),
      month: newDate.month()
    }
  })
}

const nextMonth = () => {
  const newDate = currentDate.value.add(1, 'month')
  router.push({
    query: {
      year: newDate.year(),
      month: newDate.month()
    }
  })
}

const weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const days = computed(() => {
  const year = currentDate.value.year()
  const month = currentDate.value.month()
  const firstDay = dayjs(new Date(year, month, 1))
  const lastDay = dayjs(new Date(year, month + 1, 0))
  const result = []

  // Previous month overflow days
  for (let i = 0; i < firstDay.day(); i++) {
    result.push({
      date: firstDay.subtract(firstDay.day() - i, 'day').toDate(),
      current: false
    })
  }

  // Current month days
  for (let d = 1; d <= lastDay.date(); d++) {
    result.push({
      date: new Date(year, month, d),
      current: true
    })
  }

  // Next month overflow days
  const remaining = 7 - (result.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      result.push({
        date: lastDay.add(i, 'day').toDate(),
        current: false
      })
    }
  }

  return result
})

const isToday = (date: Date) => {
  if (!isClient.value) return false // Wait for client hydration
  
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

const isWeekend = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const openReminderModal = (date: Date) => {
  remindersStore.openModal(formatDate(date))
}

const getRemindersForDay = (date: Date) => {
  return remindersStore.getRemindersForDate(formatDate(date))
}

const groupRemindersByTime = (reminders: typeof remindersStore.reminders) => {
  const grouped: Record<string, typeof reminders> = {}
  reminders.forEach(reminder => {
    if (!grouped[reminder.time]) {
      grouped[reminder.time] = []
    }
    grouped[reminder.time]!.push(reminder)
  })
  return Object.entries(grouped).map(([time, items]) => ({ time, items }))
}
</script>

<style scoped>
.days {
  grid-auto-rows: 1fr;
}

.day-cell {
  border: 1px solid #ccc;
  overflow: hidden;
}

.today-cell {
  border: 3px solid #3472af;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  max-height: calc(100% - 2em);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
