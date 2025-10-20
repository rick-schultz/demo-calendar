<template>
  <div
    class="flex items-center bg-gray-50 rounded border-2"
    :class="size === 'large' ? 'gap-3 p-3' : 'gap-2 p-2'"
    :style="{ borderColor: reminder.color }"
  >
    <div
      class="rounded flex-shrink-0"
      :class="size === 'large' ? 'w-1 h-12' : 'w-1 h-12'"
      :style="{ backgroundColor: reminder.color }"
    />
    <div class="flex-1 min-w-0">
      <div 
        class="font-semibold"
        :class="size === 'large' ? 'text-sm' : 'text-sm'"
      >
        {{ formatTime(reminder.time) }} - {{ reminder.text }}
      </div>
      <div class="text-xs text-gray-600 flex items-center gap-1">
        <span>{{ reminder.city }}</span>
        <span v-if="reminder.weather" class="inline-flex items-center gap-1">
          • <span class="font-medium">{{ reminder.weather }}</span>
          <UIcon :name="getWeatherIcon(reminder.weather)" class="w-4 h-4" />
        </span>
      </div>
    </div>
    <div 
      v-if="showActions"
      class="flex flex-shrink-0"
      :class="size === 'large' ? 'gap-1 flex-row' : 'gap-1 flex-col'"
    >
      <button
        class="text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
        :class="size === 'large' ? 'p-2' : 'p-1'"
        title="Edit reminder"
        @click="$emit('edit', reminder)"
      >
        <UIcon 
          name="i-heroicons-pencil" 
          :class="size === 'large' ? 'w-5 h-5' : 'w-4 h-4'"
        />
      </button>
      <button
        class="text-red-600 hover:text-red-800 rounded hover:bg-red-50"
        :class="size === 'large' ? 'p-2' : 'p-1'"
        title="Delete reminder"
        @click="$emit('delete', reminder.id)"
      >
        <UIcon 
          name="i-heroicons-trash" 
          :class="size === 'large' ? 'w-5 h-5' : 'w-4 h-4'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/dateTime'
import { useWeatherIcon } from '@/composables/useWeatherIcon'

interface Reminder {
  id: number
  date: string
  time: string
  text: string
  city: string
  color: string
  weather?: string | null
}

interface Props {
  reminder: Reminder
  size?: 'large' | 'small'
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'large',
  showActions: true
})

defineEmits<{
  edit: [reminder: Reminder]
  delete: [id: number]
}>()

const { getWeatherIcon } = useWeatherIcon()
</script>
