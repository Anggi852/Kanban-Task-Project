<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, CalendarDays, BookOpen, KanbanSquare } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  tasks?: any[] 
}>()

const emit = defineEmits<{
  close: []
}>()

const currentDate = ref(new Date())
const selectedDateNum = ref<number | null>(null)

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

// ⚡ JURUS ANTI LAG CPU: Kita hitung tanggal tugas CUKUP SATU KALI SAJA, jangan diulang-ulang!
const tasksMappedByDate = computed(() => {
  const map = new Map<string, any[]>()
  const list = props.tasks || []
  
  for (let i = 0; i < list.length; i++) {
    const t = list[i]
    const d = new Date(t.dueDate || t.due_date || t.endDate || t.createdAt || t.created_at)
    
    if (!isNaN(d.getTime())) {
      // Buat kunci unik: Tahun-Bulan-Tanggal (Contoh: 2026-6-12)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(t)
    }
  }
  return map
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days: any[] = []
  const mapTugas = tasksMappedByDate.value // Ambil data yang sudah dikelompokkan
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ empty: true, tasks: [] })
  }
  
  const todayStr = new Date().toDateString()
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateObj = new Date(year, month, i)
    // Tinggal panggil data dari kelompok yang sudah rapi tadi! (Cuma butuh 0.0001 detik)
    const key = `${year}-${month}-${i}`
    const dayTasks = mapTugas.get(key) || []
    
    days.push({
      empty: false,
      date: i,
      fullDate: dateObj,
      tasks: dayTasks,
      isToday: dateObj.toDateString() === todayStr
    })
  }
  return days
})

const tasksForSelectedDay = computed(() => {
  if (selectedDateNum.value === null) return []
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const key = `${year}-${month}-${selectedDateNum.value}`
  return tasksMappedByDate.value.get(key) || []
})

function selectDay(day: any) {
  if (day.empty) return
  selectedDateNum.value = day.date
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  selectedDateNum.value = null
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  selectedDateNum.value = null
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
              Kalender Kerja TaskFlow
            </h2>
            <p class="text-sm text-ink-muted">Klik pada tanggal untuk melihat detail materi tugas</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2 mr-4">
          <AppButton variant="ghost" size="sm" @click="prevMonth">
            <ChevronLeft class="h-4 w-4" />
          </AppButton>
          <span class="font-medium text-sm text-ink dark:text-ink-dark min-w-[140px] text-center capitalize">
            {{ currentMonthName }}
          </span>
          <AppButton variant="ghost" size="sm" @click="nextMonth">
            <ChevronRight class="h-4 w-4" />
          </AppButton>
        </div>
      </div>
    </template>

    <div class="p-2 space-y-4">
      <div class="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-ink-muted uppercase tracking-wider">
        <div class="text-danger">Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>
      
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          @click="selectDay(day)"
          :class="[
            'min-h-[90px] p-2 rounded-card border transition-all duration-200 select-none',
            day.empty ? 'bg-transparent border-transparent pointer-events-none' : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark cursor-pointer hover:border-accent hover:shadow-sm',
            day.isToday ? 'ring-2 ring-accent border-transparent bg-accent-soft/10' : '',
            selectedDateNum === day.date && !day.empty ? 'border-accent bg-accent/5 dark:bg-accent/10 ring-1 ring-accent' : '',
            day.tasks?.length > 0 && !day.empty ? 'border-dashed border-accent/40' : ''
          ]"
        >
          <div v-if="!day.empty" class="flex flex-col h-full justify-between">
            <div class="flex items-center justify-between">
              <span :class="['text-sm font-semibold', day.isToday ? 'text-accent' : 'text-ink-muted']">
                {{ day.date }}
              </span>
              <span v-if="day.tasks?.length > 0" class="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
            </div>
            
            <div class="text-right">
              <span v-if="day.tasks?.length > 0" class="text-[9px] bg-canvas dark:bg-canvas-dark px-1 py-0.5 rounded border text-ink-muted">
                {{ day.tasks?.length }} Tasks
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 border-t border-border dark:border-border-dark pt-4">
        <div v-if="selectedDateNum !== null" class="space-y-3">
          <h3 class="text-sm font-semibold text-ink dark:text-ink-dark flex items-center gap-2">
            <BookOpen class="h-4 w-4 text-accent" />
            Daftar Tugas (Tanggal {{ selectedDateNum }} {{ currentMonthName }})
          </h3>
          
          <div v-if="tasksForSelectedDay.length > 0" class="grid gap-3 sm:grid-cols-2">
            <div 
              v-for="task in tasksForSelectedDay" 
              :key="task.id"
              class="p-4 rounded-card border border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark space-y-2 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-start justify-between gap-4">
                  <h4 class="text-sm font-bold text-ink dark:text-ink-dark line-clamp-1">{{ task.title }}</h4>
                  <span class="text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-accent-soft text-accent dark:bg-accent-softDark font-medium flex items-center gap-1">
                    <KanbanSquare class="h-3 w-3" />
                    Papan: {{ task.boardName || 'Umum' }}
                  </span>
                </div>
                <p class="text-xs text-ink-muted mt-2 bg-surface dark:bg-surface-dark p-2 rounded border border-border/40">
                  <strong class="text-[10px] text-ink block mb-0.5">Isi Materi / Deskripsi:</strong>
                  {{ task.description || 'Tidak ada deskripsi atau materi tugas.' }}
                </p>
              </div>
              
              <div class="text-[10px] flex justify-between items-center pt-2 border-t border-border/40 mt-2">
                <span class="text-ink-muted">Status Kolom: **{{ task.columnName || 'Backlog' }}**</span>
                
                <span v-if="task.isCompleted === true || task.isCompleted === 'true'" class="text-success font-semibold">
                  Selesai ✅
                </span>
                <span v-else class="text-warning font-semibold">
                  Belum Dikerjakan ⏳
                </span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-xs text-ink-muted bg-canvas/40 dark:bg-canvas-dark/40 rounded-card border border-dashed border-border">
            Bersih! Tidak ada tugas di tanggal ini. 🎉
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-xs text-ink-muted bg-canvas/40 dark:bg-canvas-dark/40 rounded-card border border-dashed border-border">
          Silakan klik salah satu tanggal yang memiliki tugas di atas untuk mengintip isi materinya! 👆
        </div>
      </div>
    </div>
  </AppModal>
</template>