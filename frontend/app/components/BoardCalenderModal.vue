<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-vue-next'
import type { Task } from '~/types/api'

const props = defineProps<{
  open: boolean
  tasks: Task[]
}>()

const emit = defineEmits<{
  close: []
}>()

// Logika penanggalan
const currentDate = ref(new Date())

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Membuat deretan tanggal dalam satu bulan
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Mengisi kekosongan di awal bulan (jika tanggal 1 bukan hari Minggu)
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ empty: true })
  }
  
  // Mengisi tanggal-tanggal di bulan ini
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateObj = new Date(year, month, i)
    // Cari tugas yang tenggat waktunya (atau tanggal dibuatnya) jatuh pada hari ini
    const dayTasks = props.tasks.filter((t) => {
      // Jika punya dueDate, gunakan dueDate. Jika tidak, gunakan createdAt.
      const taskDate = new Date(t.dueDate || t.createdAt)
      return (
        taskDate.getDate() === i &&
        taskDate.getMonth() === month &&
        taskDate.getFullYear() === year
      )
    })
    
    days.push({
      empty: false,
      date: i,
      fullDate: dateObj,
      tasks: dayTasks,
      isToday: dateObj.toDateString() === new Date().toDateString()
    })
  }
  return days
})

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}
</script>

<template>
  <AppModal :open="open" size="xl" @close="emit('close')">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-button bg-accent-soft text-accent dark:bg-accent-softDark">
            <CalendarDays class="h-5 w-5" />
          </span>
          <div>
            <h2 class="font-display text-xl text-ink dark:text-ink-dark tracking-display-tight">
              Board Calendar
            </h2>
            <p class="text-sm text-ink-muted">View your tasks across the month</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2 mr-4">
          <AppButton variant="ghost" size="sm" @click="prevMonth">
            <ChevronLeft class="h-4 w-4" />
          </AppButton>
          <span class="font-medium text-sm text-ink dark:text-ink-dark min-w-[120px] text-center">
            {{ currentMonthName }}
          </span>
          <AppButton variant="ghost" size="sm" @click="nextMonth">
            <ChevronRight class="h-4 w-4" />
          </AppButton>
        </div>
      </div>
    </template>

    <div class="p-2">
      <div class="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-ink-muted uppercase tracking-wider">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          :class="[
            'min-h-[100px] p-2 rounded-card border transition-colors',
            day.empty ? 'bg-transparent border-transparent' : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark',
            day.isToday ? 'ring-2 ring-accent border-transparent' : ''
          ]"
        >
          <div v-if="!day.empty" class="flex flex-col h-full">
            <span :class="['text-sm font-medium mb-1', day.isToday ? 'text-accent' : 'text-ink-muted']">
              {{ day.date }}
            </span>
            
            <div class="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
              <div 
                v-for="task in day.tasks" 
                :key="task.id"
                class="text-[10px] px-1.5 py-1 rounded bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-dark truncate border border-border dark:border-border-dark"
                :title="task.title"
              >
                {{ task.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppModal>
</template>