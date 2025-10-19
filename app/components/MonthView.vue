<template>
  <div class="w-full h-full max-md:h-[50vh] flex items-center justify-center overflow-hidden">
    <div class="w-[90%] max-w-[1400px] h-[95%] max-h-[900px] flex flex-col bg-white overflow-hidden">
      <div class="flex-shrink-0 text-center font-bold pb-4 text-2xl">
        {{ monthYear }}
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
          class="day-cell px-[0.5em] py-[0.4em] text-[0.9rem] md:text-[1.3rem] font-semibold cursor-pointer hover:bg-blue-50 flex flex-col"
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
              v-for="reminder in getRemindersForDay(dayObj.date)"
              :key="reminder.id"
              class="truncate px-1 py-0.5 rounded"
              :style="{ backgroundColor: reminder.color + '20', color: reminder.color }"
            >
              {{ formatTime(reminder.time) }} {{ reminder.text }}
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
import { computed } from 'vue'
import { useRemindersStore } from '@/stores/reminders'
import { formatDate, formatTime } from '@/utils/dateTime'

const remindersStore = useRemindersStore()

const now = dayjs()
const monthYear = now.format('MMMM YYYY')

const weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const days = computed(() => {
  const year = now.year()
  const month = now.month()
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
