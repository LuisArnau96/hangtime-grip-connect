<template>
  <div class="training">
    <!-- Header -->
    <div class="header">
      <h1>Training Programs</h1>
      <p class="subtitle">Mesociclo 8 semanas · WH-C06</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB: SEMANA -->
    <div v-if="activeTab === 'week'" class="tab-content">
      <p class="hint">Toca un día para ver los detalles.</p>
      <div class="day-list">
        <div
          v-for="day in weekDays"
          :key="day.id"
          :class="['day-row', { selected: selectedDay === day.id }]"
          @click="selectedDay = selectedDay === day.id ? null : day.id"
        >
          <div class="day-label">{{ day.short }}</div>
          <div :class="['day-card', day.type]">
            <div class="day-info">
              <span class="day-title">{{ day.title }}</span>
              <span class="day-sub">{{ day.subtitle }}</span>
            </div>
            <span :class="['badge', day.type]">{{ day.badgeLabel }}</span>
          </div>
        </div>

        <!-- Detail panel -->
        <transition name="slide">
          <div v-if="selectedDay" class="detail-panel">
            <div class="detail-header">
              <span class="detail-icon">{{ selectedDayData?.icon }}</span>
              <div>
                <div class="detail-title">{{ selectedDayData?.title }}</div>
                <div class="detail-sub">{{ selectedDayData?.module }}</div>
              </div>
            </div>

            <div class="params-grid">
              <div v-for="p in selectedDayData?.params" :key="p.label" class="param">
                <div class="param-label">{{ p.label }}</div>
                <div :class="['param-val', { accent: p.accent, warn: p.warn }]">{{ p.value }}</div>
              </div>
            </div>

            <div v-if="selectedDayData?.note" :class="['note', selectedDayData?.noteType || 'default']">
              {{ selectedDayData?.note }}
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- TAB: MESOCICLO -->
    <div v-if="activeTab === 'meso'" class="tab-content">
      <div class="phase-tabs">
        <button
          v-for="phase in phases"
          :key="phase.id"
          :class="['phase-tab', { active: activePhase === phase.id }]"
          @click="activePhase = phase.id; activeWeek = 0"
        >
          {{ phase.label }}
        </button>
      </div>

      <div v-if="currentPhaseData?.weeks?.length > 1" class="week-grid">
        <button
          v-for="(week, i) in currentPhaseData?.weeks"
          :key="i"
          :class="['week-btn', { active: activeWeek === i }]"
          @click="activeWeek = i"
        >
          <div class="week-label">{{ week.label }}</div>
          <div class="week-title">{{ week.title }}</div>
        </button>
      </div>

      <div v-if="currentSession" class="session-card">
        <div class="session-header">
          <span class="session-icon">{{ currentSession.icon }}</span>
          <div>
            <div class="session-title">{{ currentSession.title }}</div>
            <div class="session-sub">{{ currentSession.sub }}</div>
          </div>
        </div>
        <div class="params-grid">
          <div v-for="p in currentSession.params" :key="p.label" class="param">
            <div class="param-label">{{ p.label }}</div>
            <div :class="['param-val', { accent: p.accent }]">{{ p.value }}</div>
          </div>
        </div>
        <div v-if="currentSession.note" class="note default">{{ currentSession.note }}</div>
      </div>
    </div>

    <!-- TAB: MEDIDOR -->
    <div v-if="activeTab === 'meter'" class="tab-content">
      <div class="section-title">MVC actual (desde Peak Force)</div>

      <div class="mvc-row">
        <label>Mano débil</label>
        <input type="range" min="10" max="80" step="1" v-model.number="mvcWeak" />
        <span class="mvc-val">{{ mvcWeak }} kg</span>
      </div>
      <div class="mvc-row">
        <label>Mano fuerte</label>
        <input type="range" min="10" max="80" step="1" v-model.number="mvcStrong" />
        <span class="mvc-val">{{ mvcStrong }} kg</span>
      </div>

      <div class="section-title" style="margin-top: 1.25rem">Nivel estimado</div>
      <div class="level-bar">
        <div class="level-fill" :style="{ width: levelPct + '%' }"></div>
        <span class="level-label">{{ levelGrade }}</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Techo hoy</div>
          <div class="stat-val">{{ ceilGrade }}</div>
          <div class="stat-sub">proyectos</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Zona calidad</div>
          <div class="stat-val">{{ workZone }}</div>
          <div class="stat-sub">más repeticiones</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Asimetría</div>
          <div :class="['stat-val', { warn: asymmetry > 8 }]">{{ asymmetry }} kg</div>
          <div class="stat-sub">{{ asymmetry > 8 ? '⚠ trabaja el débil' : 'equilibrado' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Target hang</div>
          <div class="stat-val accent">{{ Math.round(Math.min(mvcWeak, mvcStrong) * 0.7) }} kg</div>
          <div class="stat-sub">70% MVC (repeaters)</div>
        </div>
      </div>

      <div class="rec-box">
        <div class="rec-title">Recomendación para hoy</div>
        <div class="rec-body">{{ recommendation }}</div>
      </div>
    </div>

    <!-- TAB: REGLAS -->
    <div v-if="activeTab === 'rules'" class="tab-content">
      <div class="rule-card" v-for="rule in rules" :key="rule.title">
        <div class="rule-title">{{ rule.icon }} {{ rule.title }}</div>
        <div class="rule-body">{{ rule.body }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('week')
const selectedDay = ref<string | null>(null)
const activePhase = ref('test')
const activeWeek = ref(0)
const mvcWeak = ref(30)
const mvcStrong = ref(35)

const tabs = [
  { id: 'week', label: 'Semana' },
  { id: 'meso', label: 'Mesociclo' },
  { id: 'meter', label: 'Medidor' },
  { id: 'rules', label: 'Reglas' },
]

// ─── WEEK ───────────────────────────────────────────────────────────────────
const weekDays = [
  {
    id: 'lun', short: 'LUN', type: 'climb', badgeLabel: 'Rocódromo',
    title: 'Escalada + Hangboard', subtitle: 'Hangboard primero',
    icon: '🧗', module: 'Módulo: Repeaters o Peak Force/MVC',
    params: [
      { label: 'Orden', value: '1º Hangboard', accent: true },
      { label: 'Luego', value: 'Escalar' },
      { label: 'Duración hang', value: '20–30 min' },
      { label: 'Canto', value: '25 mm recto' },
      { label: 'Sets', value: '2 (semanas 1–2)' },
      { label: 'Frecuencia', value: 'Semanas 1–8' },
    ],
    note: 'Haz el hangboard nada más llegar al rocódromo, antes de calentar para escalar. Así los tendones absorben la carga con frescos.',
    noteType: 'default',
  },
  {
    id: 'mar', short: 'MAR', type: 'yoga', badgeLabel: 'Yoga',
    title: 'Yoga', subtitle: 'Recuperación activa',
    icon: '🧘', module: 'Sin carga de dedos',
    params: [
      { label: 'Tipo', value: 'Movilidad' },
      { label: 'Dedos', value: 'Descanso' },
      { label: 'Intensidad', value: 'Baja' },
      { label: 'OK además', value: 'Playa / paseo' },
    ],
    note: 'Día de recuperación para tendones. El yoga de movilidad es ideal — no carga las poleas. Evita agarres fuertes.',
    noteType: 'default',
  },
  {
    id: 'mie', short: 'MIÉ', type: 'climb', badgeLabel: 'Rocódromo',
    title: 'Escalada + Hangboard', subtitle: 'Hangboard primero',
    icon: '🧗', module: 'Módulo: Repeaters o Peak Force/MVC',
    params: [
      { label: 'Orden', value: '1º Hangboard', accent: true },
      { label: 'Luego', value: 'Escalar' },
      { label: 'Duración hang', value: '20–30 min' },
      { label: 'Canto', value: '25 mm recto' },
      { label: 'Sets', value: '3 (semanas 3–4)' },
      { label: 'Frecuencia', value: 'Semanas 1–8' },
    ],
    note: '48h desde el lunes — suficiente recuperación. Si notas los dedos cargados, reduce a 1 set y escala suave.',
    noteType: 'default',
  },
  {
    id: 'jue', short: 'JUE', type: 'yoga', badgeLabel: 'Yoga',
    title: 'Yoga / Descanso activo', subtitle: 'Sin carga de dedos',
    icon: '🧘', module: 'Recuperación',
    params: [
      { label: 'Actividad', value: 'Yoga / trail suave' },
      { label: 'Dedos', value: 'Descanso' },
      { label: 'Volley playa', value: 'OK moderado' },
      { label: 'Si hay roca sábado', value: 'Mueve el hang aquí', warn: true },
    ],
    note: 'Si el fin de semana escalas en roca exterior, puedes mover el hangboard del viernes a hoy para llegar más fresco.',
    noteType: 'warn',
  },
  {
    id: 'vie', short: 'VIE', type: 'climb', badgeLabel: 'Rocódromo',
    title: 'Escalada + Hangboard', subtitle: 'Hangboard primero — ver nota',
    icon: '🧗', module: 'Módulo: Repeaters o Peak Force/MVC',
    params: [
      { label: 'Orden', value: '1º Hangboard', accent: true },
      { label: 'Luego', value: 'Escalar' },
      { label: 'Duración hang', value: '20–30 min' },
      { label: 'Canto', value: '25 mm recto' },
      { label: 'Si hay roca sábado', value: 'Solo escalar', warn: true },
    ],
    note: 'Si el sábado vas a roca exterior, omite el hangboard hoy. Escala solo y guarda los tendones para el día siguiente.',
    noteType: 'warn',
  },
  {
    id: 'sab', short: 'SÁB', type: 'free', badgeLabel: 'Opcional',
    title: 'Roca exterior / Descanso', subtitle: 'Cuenta como día de dedos',
    icon: '⛰️', module: 'Sin hangboard',
    params: [
      { label: 'Hangboard', value: 'No' },
      { label: 'Roca', value: 'Si toca' },
      { label: 'Intensidad', value: 'Moderada' },
      { label: 'Nota', value: 'Día de dedos real' },
    ],
    note: 'La roca exterior genera carga de dedos alta. Si escalas hoy el domingo es descanso obligatorio.',
    noteType: 'warn',
  },
  {
    id: 'dom', short: 'DOM', type: 'rest', badgeLabel: 'Descanso',
    title: 'Descanso completo', subtitle: 'Recuperación',
    icon: '😴', module: 'Sin carga',
    params: [
      { label: 'Actividad', value: 'Libre' },
      { label: 'Dedos', value: 'Sin carga' },
      { label: 'OK', value: 'Paseo, yoga suave' },
    ],
    note: 'El descanso es parte del entrenamiento. Los tendones se adaptan durante la recuperación, no durante la carga.',
    noteType: 'default',
  },
]

const selectedDayData = computed(() => weekDays.find(d => d.id === selectedDay.value))

// ─── MESOCICLO ───────────────────────────────────────────────────────────────
const phases = [
  { id: 'test', label: 'Test MVC' },
  { id: 'base', label: 'Base S1–4' },
  { id: 'strength', label: 'Fuerza S5–8' },
]

interface Week {
  label: string
  title: string
  intensity?: string
  sets?: number
  deload?: boolean
}

interface Phase {
  id: string
  label: string
  weeks: Week[]
}

const mesoData: Phase[] = [
  {
    id: 'test',
    label: 'Test MVC',
    weeks: [{ label: 'Semana 0', title: 'Antes de empezar' }],
  },
  {
    id: 'base',
    label: 'Base S1–4',
    weeks: [
      { label: 'Semana 1', title: 'Introducción', intensity: '60', sets: 2 },
      { label: 'Semana 2', title: 'Adaptación', intensity: '65', sets: 2 },
      { label: 'Semana 3', title: 'Volumen', intensity: '70', sets: 3 },
      { label: 'Semana 4', title: 'Descarga + re-test', intensity: '60', sets: 1, deload: true },
    ],
  },
  {
    id: 'strength',
    label: 'Fuerza S5–8',
    weeks: [
      { label: 'Semana 5', title: 'Fuerza máx.', intensity: '85', sets: 4 },
      { label: 'Semana 6', title: 'Intensidad', intensity: '88', sets: 5 },
      { label: 'Semana 7', title: 'Pico', intensity: '90', sets: 5 },
      { label: 'Semana 8', title: 'Test final', intensity: '85', sets: 3, deload: true },
    ],
  },
]

const currentPhaseData = computed(() => mesoData.find(p => p.id === activePhase.value))

const currentSession = computed(() => {
  const phase = currentPhaseData.value
  const week = phase?.weeks[activeWeek.value]
  if (!phase || !week) return null

  if (phase.id === 'test') {
    return {
      icon: '📊',
      title: 'Peak Force / MVC',
      sub: 'Módulo: Peak Force / MVC — cada mano por separado',
      params: [
        { label: 'Intentos', value: '3 por mano' },
        { label: 'Duración', value: '10 s máx' },
        { label: 'Descanso', value: '3–4 min' },
        { label: 'Canto', value: '25 mm recto' },
      ],
      note: 'Apunta el mejor valor de cada mano en kg. Ese es tu MVC. Méterlo en Left MVC y Right MVC en Repeaters. Repite en semana 4 y al final.',
    }
  }

  const isStrength = phase.id === 'strength'
  if (isStrength) {
    return {
      icon: '💪',
      title: week.deload ? 'Test + descarga' : 'Max Hangs',
      sub: 'Módulo: Peak Force / MVC',
      params: [
        { label: 'Series', value: String(week.sets) },
        { label: 'Duración hang', value: '10 s' },
        { label: 'Descanso', value: '4–5 min' },
        { label: 'Intensidad', value: `${week.intensity}% MVC`, accent: true },
        { label: 'Canto', value: '25 mm recto' },
        { label: 'Frecuencia', value: '2×/semana' },
      ],
      note: week.deload
        ? 'Semana de descarga. Reduce el volumen a la mitad. Haz el test MVC al final para medir el progreso del ciclo.'
        : `Cada serie: 1 hang máximo de 10 s al ${week.intensity}% MVC. Descansa completo. Si no llegas al %, para — menos series con calidad.`,
    }
  }

  const minTarget = String(Number(week.intensity) - 5)
  return {
    icon: '🔁',
    title: week.deload ? 'Descarga + re-test' : 'Repeaters 7/3',
    sub: 'Módulo: Repeaters',
    params: [
      { label: 'Sets', value: String(week.sets) },
      { label: 'Reps', value: '6' },
      { label: 'Work', value: '7 s' },
      { label: 'Rest', value: '3 s' },
      { label: 'Pause', value: '180 s' },
      { label: 'Min target', value: `${minTarget}%` },
      { label: 'Max target', value: `${week.intensity}%`, accent: true },
      { label: 'Left/Right', value: 'Activado' },
    ],
    note: week.deload
      ? 'Semana 4: baja a 1–2 series. Haz el re-test MVC para ajustar % de las semanas de fuerza.'
      : 'Frecuencia: 2–3×/semana. Mínimo 48h entre sesiones. Si en la última rep pierdes >20% de fuerza respecto a la primera, para la serie.',
  }
})

// ─── MEDIDOR ─────────────────────────────────────────────────────────────────
const grades = ['5+', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c']
const gradePcts = [0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92]

function mvcToIdx(mvc: number): number {
  const thresholds = [18, 22, 26, 30, 34, 38, 43, 48, 54, 60, 68]
  return thresholds.findIndex(t => mvc < t) === -1 ? grades.length - 1 : thresholds.findIndex(t => mvc < t)
}

const limitingMvc = computed(() => Math.min(mvcWeak.value, mvcStrong.value))
const gradeIdx = computed(() => mvcToIdx(limitingMvc.value))
const levelGrade = computed(() => grades[gradeIdx.value])
const levelPct = computed(() => gradePcts[gradeIdx.value])
const ceilGrade = computed(() => grades[Math.min(gradeIdx.value + 1, grades.length - 1)])
const workZone = computed(() => `${grades[Math.max(gradeIdx.value - 1, 0)]}–${levelGrade.value}`)
const asymmetry = computed(() => mvcStrong.value - mvcWeak.value)

const recommendation = computed(() => {
  if (asymmetry.value > 8) {
    return `Asimetría de ${asymmetry.value} kg detectada. Prioriza vías equilibradas y añade 1 serie extra solo con la mano débil en el hangboard.`
  }
  return `Zona de trabajo: ${workZone.value}. Calienta con ${grades[Math.max(gradeIdx.value - 1, 0)]}, encadena en ${levelGrade.value}, proyecta ${ceilGrade.value}. No fuerces por encima del techo hoy.`
})

// ─── REGLAS ──────────────────────────────────────────────────────────────────
const rules = [
  {
    icon: '⚡',
    title: 'Hangboard siempre antes de escalar',
    body: 'Los tendones se recuperan más lento que el músculo (48–72h mínimo). Si escalas primero y luego haces hang, acumulas fatiga residual y el riesgo de lesión sube mucho. Hangboard al llegar, escala después.',
  },
  {
    icon: '🚨',
    title: 'Señales de parar',
    body: 'Dolor en polea A2 (base del dedo anular o medio) → para inmediatamente. Pérdida de más del 20% de fuerza entre primera y última rep → la serie ya no sirve. MVC del día más de 10% por debajo del habitual → sesión ligera o descanso.',
  },
  {
    icon: '⛰️',
    title: 'Adaptación si vas a roca el finde',
    body: 'Si el sábado escalas en roca exterior, el viernes no hagas hangboard — solo escala o descansa. La roca en exterior cuenta como sesión de dedos de alta intensidad. Mueve el hang del viernes al jueves.',
  },
  {
    icon: '📐',
    title: 'Canto correcto',
    body: 'Usa siempre el canto de 25 mm recto para el hangboard de entrenamiento. El de 20 mm irregular es demasiado específico y agresivo para trabajo sistemático de fuerza — guárdalo para sesiones de escalada real.',
  },
  {
    icon: '📊',
    title: 'Actualiza el MVC',
    body: 'Mide tu MVC con Peak Force / MVC al inicio del ciclo (semana 0), en semana 4, y al final (semana 8). Los % de target del Medidor y del Repeaters se basan en ese valor — si no lo actualizas, entrenas con intensidad equivocada.',
  },
]
</script>

<style scoped>
.training {
  padding: 1rem;
  max-width: 480px;
  margin: 0 auto;
  font-family: var(--font-family, system-ui, sans-serif);
}

.header {
  margin-bottom: 1.25rem;
}

.header h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  font-size: 13px;
  color: var(--text-secondary, #666);
  margin-top: 2px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.tab {
  flex: 1;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--border, #e0e0e0);
  background: transparent;
  color: var(--text-secondary, #666);
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
  transition: all 0.15s;
}

.tab.active {
  background: var(--primary-light, #e8f0fe);
  color: var(--primary, #1a73e8);
  border-color: var(--primary, #1a73e8);
  font-weight: 500;
}

.tab-content {
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.hint {
  font-size: 12px;
  color: var(--text-muted, #999);
  margin-bottom: 10px;
}

/* Week */
.day-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  cursor: pointer;
}

.day-label {
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted, #999);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.day-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border, #e0e0e0);
  background: var(--surface, #fff);
  transition: border-color 0.15s;
}

.day-row.selected .day-card {
  border-color: var(--primary, #1a73e8);
  border-width: 2px;
}

.day-info {
  display: flex;
  flex-direction: column;
}

.day-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #111);
}

.day-sub {
  font-size: 12px;
  color: var(--text-muted, #999);
  margin-top: 1px;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge.climb { background: #e8f0fe; color: #1a56db; }
.badge.yoga { background: #def7ec; color: #057a55; }
.badge.rest { background: #f3f4f6; color: #6b7280; border: 1px solid #e0e0e0; }
.badge.free { background: #f3f4f6; color: #6b7280; border: 1px solid #e0e0e0; }

/* Detail panel */
.detail-panel {
  margin-top: 4px;
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 12px;
  padding: 1rem 1.125rem;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.slide-enter-to, .slide-leave-from {
  opacity: 1;
  max-height: 600px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.detail-icon {
  font-size: 22px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-alt, #f8f9fa);
  border-radius: 8px;
  flex-shrink: 0;
}

.detail-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #111);
}

.detail-sub {
  font-size: 12px;
  color: var(--text-muted, #999);
  margin-top: 1px;
}

/* Params */
.params-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.param {
  background: var(--surface-alt, #f8f9fa);
  border-radius: 8px;
  padding: 8px 10px;
}

.param-label {
  font-size: 11px;
  color: var(--text-muted, #999);
}

.param-val {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #111);
  margin-top: 1px;
}

.param-val.accent { color: var(--primary, #1a73e8); }
.param-val.warn { color: #d97706; }

/* Notes */
.note {
  font-size: 13px;
  color: var(--text-secondary, #555);
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--surface-alt, #f8f9fa);
  line-height: 1.5;
  border-left: 3px solid var(--primary, #1a73e8);
}

.note.warn {
  border-left-color: #f59e0b;
}

/* Meso */
.phase-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.phase-tab {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--border, #e0e0e0);
  background: transparent;
  color: var(--text-secondary, #666);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}

.phase-tab.active {
  background: var(--primary-light, #e8f0fe);
  color: var(--primary, #1a73e8);
  border-color: var(--primary, #1a73e8);
  font-weight: 500;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.week-btn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border, #e0e0e0);
  background: var(--surface, #fff);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.week-btn.active {
  border-color: var(--primary, #1a73e8);
  border-width: 2px;
  background: var(--primary-light, #e8f0fe);
}

.week-label {
  font-size: 11px;
  color: var(--text-muted, #999);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.week-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #111);
  margin-top: 2px;
}

.week-btn.active .week-label,
.week-btn.active .week-title {
  color: var(--primary, #1a73e8);
}

.session-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 12px;
  padding: 1rem 1.125rem;
}

.session-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.session-icon {
  font-size: 22px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-alt, #f8f9fa);
  border-radius: 8px;
  flex-shrink: 0;
}

.session-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #111);
}

.session-sub {
  font-size: 12px;
  color: var(--text-muted, #999);
  margin-top: 1px;
}

/* Meter */
.section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted, #999);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.mvc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.mvc-row label {
  font-size: 13px;
  color: var(--text-secondary, #555);
  width: 90px;
  flex-shrink: 0;
}

.mvc-row input[type='range'] {
  flex: 1;
  accent-color: var(--primary, #1a73e8);
}

.mvc-val {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #111);
  min-width: 44px;
  text-align: right;
}

.level-bar {
  position: relative;
  height: 30px;
  border-radius: 8px;
  background: var(--surface-alt, #f8f9fa);
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid var(--border, #e0e0e0);
}

.level-fill {
  height: 100%;
  background: var(--primary-light, #e8f0fe);
  transition: width 0.3s ease;
}

.level-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: var(--primary, #1a73e8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.stat-card {
  background: var(--surface-alt, #f8f9fa);
  border-radius: 8px;
  padding: 10px 12px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted, #999);
}

.stat-val {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #111);
  margin-top: 2px;
}

.stat-val.accent { color: var(--primary, #1a73e8); }
.stat-val.warn { color: #d97706; }

.stat-sub {
  font-size: 11px;
  color: var(--text-muted, #999);
  margin-top: 1px;
}

.rec-box {
  background: var(--primary-light, #e8f0fe);
  border-radius: 10px;
  padding: 12px 14px;
}

.rec-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--primary, #1a73e8);
}

.rec-body {
  font-size: 12px;
  color: var(--primary, #1a73e8);
  margin-top: 4px;
  line-height: 1.5;
  opacity: 0.85;
}

/* Rules */
.rule-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 12px;
  padding: 1rem 1.125rem;
  margin-bottom: 8px;
}

.rule-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #111);
  margin-bottom: 6px;
}

.rule-body {
  font-size: 13px;
  color: var(--text-secondary, #555);
  line-height: 1.6;
}
</style>
