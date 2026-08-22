<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { Plus, Clock, Calendar, AlertTriangle } from 'lucide-vue-next'

// ====================================================
// 🔒 AREA KODE SOCKET.IO (DIKUNCI RAPAT - AMAN 100%) 🔒
// ====================================================
import { io } from 'socket.io-client'

const socket = io('http://localhost:8001', {
  withCredentials: true
})
// ====================================================

definePageMeta({
  layout: false,
  middleware: 'auth',
})

useHead({ title: 'Dashboard — TaskFlow' })

const auth = useAuthStore()
const analytics = useAnalyticsStore()
const boardsStore = useBoardsStore()

const waktuSekarang = ref(new Date())
const calendarOpen = ref(false)
let intervalJam: any = null

const userName = computed(() => {
  const name = auth.user?.name || auth.user?.email?.split('@')[0] || 'Pengguna'
  return name.charAt(0).toUpperCase() + name.slice(1)
})

// === FITUR ASISTEN PINTAR KEMBALI ===
const reminderOpen = ref(false)
const hasShownReminder = useState<boolean>('global-reminder-shown', () => false)

const allTasks = shallowRef<any[]>([])
const urgentTasks = shallowRef<any[]>([]) // Menyimpan data tugas mendesak
let isFetching = false

async function ekstrakTugas() {
  if (isFetching) return 
  isFetching = true

  try {
    let daftarPapan = boardsStore.boards

    if (!daftarPapan || daftarPapan.length === 0) {
      const resp: any = await $fetch('http://localhost:8001/boards', { credentials: 'include' }).catch(() => [])
      daftarPapan = resp
    }
    
    if (!daftarPapan || daftarPapan.length === 0) {
      isFetching = false
      return
    }

    const fetchPromises = daftarPapan.map((b: any) => 
      $fetch(`http://localhost:8001/boards/${b.id}`, { credentials: 'include' }).catch(() => null)
    )
    
    const hasilPapan = await Promise.all(fetchPromises)
    
    const terkumpul: any[] = []
    const mendesak: any[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    hasilPapan.forEach((detail: any) => {
      if (!detail || !detail.columns) return
      detail.columns.forEach((c: any) => {
        if (!c.tasks) return
        c.tasks.forEach((t: any) => {
          const isSelesai = c.type === 'DONE' || t.isCompleted || c.name.toLowerCase() === 'done'
          const taskObj = {
            ...t,
            boardName: detail.name,
            columnName: c.name,
            isCompleted: isSelesai
          }
          terkumpul.push(taskObj)

          // 🧠 LOGIKA ASISTEN PINTAR (H-3, H-2, H-1)
          if (!isSelesai) {
            const taskDate = new Date(t.dueDate || t.due_date || t.endDate || t.createdAt || t.created_at)
            if (!isNaN(taskDate.getTime())) {
              taskDate.setHours(0, 0, 0, 0)
              const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              const priority = (t.priority || '').toUpperCase()

              if (
                diffDays <= 0 ||
                (priority === 'HIGH' && diffDays <= 3) ||
                ((priority === 'MEDIUM' || priority === 'MED') && diffDays <= 2) ||
                ((priority === 'LOW' || priority === '') && diffDays <= 1)
              ) {
                mendesak.push(taskObj)
              }
            }
          }
        })
      })
    })
    
    allTasks.value = terkumpul
    urgentTasks.value = mendesak

    // Pelatuk Pop-Up Peringatan
    if (mendesak.length > 0 && !hasShownReminder.value) {
      hasShownReminder.value = true
      setTimeout(() => { reminderOpen.value = true }, 600) // Delay 0.6 detik biar mulus
    }

  } catch (error) {
    console.error('Gagal mengambil data kalender:', error)
  } finally {
    isFetching = false
  }
}

const jamFormat = computed(() => {
  return waktuSekarang.value.toLocaleTimeString('id-ID', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  }).replace(/\./g, ':') 
})

const tanggalFormat = computed(() => {
  return waktuSekarang.value.toLocaleDateString('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  })
})

const greeting = computed(() => {
  const name = auth.user?.name || auth.user?.email?.split('@')[0] || 'Pengguna'
  const finalName = name.charAt(0).toUpperCase() + name.slice(1)
  
  const hour = waktuSekarang.value.getHours()
  if (hour < 12) return `Good morning, ${finalName}.`
  if (hour < 18) return `Good afternoon, ${finalName}.`
  return `Good evening, ${finalName}.`
})

const createOpen = ref(false)

function openCreate() {
  createOpen.value = true
}

function onCreated(boardId: string) {
  navigateTo(`/boards/${boardId}`)
}

function refreshGrafik() {
  analytics.fetchTrend(14).catch(() => {})
  analytics.fetchDistribution().catch(() => {})
  ekstrakTugas() 
}

onMounted(() => {
  intervalJam = setInterval(() => {
    waktuSekarang.value = new Date()
  }, 1000)

  ekstrakTugas()

  if (!analytics.trend.length) analytics.fetchTrend(14).catch(() => {})
  if (!analytics.distribution.length) analytics.fetchDistribution().catch(() => {})

  socket.on('tugasBaru', () => { setTimeout(refreshGrafik, 500) })
  socket.on('geserTask', () => { setTimeout(refreshGrafik, 500) })
})

onUnmounted(() => {
  socket.disconnect()
  if (intervalJam) clearInterval(intervalJam)
})
</script>

<template>
  <NuxtLayout
    name="dashboard"
    :title="greeting"
    description="Here's a quick look at your week."
  >
    <template #header-actions>
      <AppButton variant="primary" size="sm" @click="openCreate">
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">New board</span>
      </AppButton>
    </template>

    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-card p-5 shadow-sm">
        <div class="flex items-center gap-4">
          <span class="flex h-12 w-12 items-center justify-center rounded-button bg-accent-soft text-accent dark:bg-accent-softDark">
            <Clock class="h-6 w-6 animate-pulse text-accent" />
          </span>
          <div>
            <p class="text-3xl font-display font-semibold tracking-tight text-ink dark:text-ink-dark">
              {{ jamFormat }}
            </p>
            <p class="text-sm font-medium text-ink-muted mt-0.5">
              {{ tanggalFormat }}
            </p>
          </div>
        </div>
        
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-ink text-canvas hover:bg-ink/90 dark:bg-ink-dark dark:text-canvas-dark dark:hover:bg-ink-dark/90 text-sm font-medium shadow transition-all duration-200"
          @click="calendarOpen = true"
        >
          <Calendar class="h-4 w-4" />
          <span>Buka Kalender Utama</span>
        </button>
      </div>
      
      <DashboardStats />

      <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <CompletionTrendChart :data="analytics.trend" :loading="analytics.loadingTrend" />
        <StatusDistributionChart :data="analytics.distribution" :loading="analytics.loadingDistribution" />
      </div>

      <RecentBoards @create-board="openCreate" />
    </div>

    <CreateBoardModal :open="createOpen" @close="createOpen = false" @created="onCreated" />

    <DashboardCalendarModal 
      :open="calendarOpen" 
      :tasks="allTasks" 
      @close="calendarOpen = false" 
    />

    <AppModal :open="reminderOpen" size="md" @close="reminderOpen = false">
      <template #header>
        <div class="flex items-center gap-3 w-full border-b border-border dark:border-border-dark pb-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle class="h-6 w-6 animate-bounce" />
          </span>
          <div>
            <h2 class="font-display text-xl font-bold text-ink dark:text-ink-dark">Pengingat Tugas!</h2>
            <p class="text-xs text-ink-muted">Sistem Asisten Pintar TaskFlow</p>
          </div>
        </div>
      </template>

      <div class="p-2 space-y-4">
        <p class="text-sm text-ink dark:text-ink-dark bg-warning/10 p-3 rounded-card border border-warning/20">
          Halo Kak <strong>{{ userName }}</strong>! Berdasarkan analisa sistem, ada <strong class="text-danger">{{ urgentTasks.length }} tugas</strong> yang harus diselesaikan <strong>SEGERA</strong>. Jangan ditunda lagi ya! 🔥
        </p>

        <div class="max-h-[250px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          <div 
            v-for="task in urgentTasks" 
            :key="task.id" 
            class="p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-card flex flex-col gap-1 shadow-sm hover:border-danger transition-colors"
          >
            <div class="flex justify-between items-start gap-2">
              <span class="font-bold text-sm text-ink dark:text-ink-dark line-clamp-1">{{ task.title }}</span>
              <span 
                class="text-[10px] px-2 py-0.5 rounded font-bold shrink-0"
                :class="{
                  'bg-danger text-white': (task.priority || '').toUpperCase() === 'HIGH',
                  'bg-warning text-ink dark:text-ink-dark': (task.priority || '').toUpperCase() === 'MED' || (task.priority || '').toUpperCase() === 'MEDIUM',
                  'bg-success text-white': (task.priority || '').toUpperCase() === 'LOW' || !task.priority
                }"
              >
                {{ (task.priority || 'LOW').toUpperCase() }}
              </span>
            </div>
            
            <div class="flex justify-between items-center mt-1">
              <span class="text-xs text-ink-muted flex items-center gap-1">
                Papan: <strong class="text-ink dark:text-ink-dark">{{ task.boardName }}</strong>
              </span>
              <span class="text-[10px] text-danger font-semibold bg-danger/10 px-1.5 py-0.5 rounded">
                Tenggat Mendekat! ⏳
              </span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton variant="primary" class="w-full font-bold" @click="reminderOpen = false">
          Siap, Saya Kerjakan Sekarang! 💪
        </AppButton>
      </template>
    </AppModal>
  </NuxtLayout>
</template>