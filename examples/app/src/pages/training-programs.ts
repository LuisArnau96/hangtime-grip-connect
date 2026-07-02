import { escapeHtml } from "../lib/html.js"

interface TrainingProgramsPageState {
  programs: unknown[] | null
  loading: boolean
  error: string | null
  selectedProgramId: string | null
  loadPresetNotice: string | null
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  {
    id: "lun", short: "LUN", title: "Escalada + Hangboard",
    subtitle: "Hangboard primero", badge: "Rocódromo", badgeClass: "badge-climb",
    icon: "🧗",
    module: "Módulo: Repeaters o Peak Force / MVC",
    params: [
      { label: "Orden", value: "1º Hangboard", cls: "accent" },
      { label: "Luego", value: "Escalar" },
      { label: "Duración hang", value: "20–30 min" },
      { label: "Canto", value: "25 mm recto" },
      { label: "Sets", value: "2 (semanas 1–2)" },
      { label: "Frecuencia", value: "Semanas 1–8" },
    ],
    note: "Haz el hangboard nada más llegar al rocódromo, antes de calentar para escalar. Los tendones absorben mejor la carga en fresco.",
    noteClass: "",
  },
  {
    id: "mar", short: "MAR", title: "Yoga",
    subtitle: "Recuperación activa", badge: "Yoga", badgeClass: "badge-yoga",
    icon: "🧘",
    module: "Sin carga de dedos",
    params: [
      { label: "Tipo", value: "Movilidad" },
      { label: "Dedos", value: "Descanso" },
      { label: "Intensidad", value: "Baja" },
      { label: "OK además", value: "Playa / paseo" },
    ],
    note: "Día de recuperación para tendones. El yoga de movilidad es ideal — no carga las poleas. Evita agarres fuertes.",
    noteClass: "",
  },
  {
    id: "mie", short: "MIÉ", title: "Escalada + Hangboard",
    subtitle: "Hangboard primero", badge: "Rocódromo", badgeClass: "badge-climb",
    icon: "🧗",
    module: "Módulo: Repeaters o Peak Force / MVC",
    params: [
      { label: "Orden", value: "1º Hangboard", cls: "accent" },
      { label: "Luego", value: "Escalar" },
      { label: "Duración hang", value: "20–30 min" },
      { label: "Canto", value: "25 mm recto" },
      { label: "Sets", value: "3 (semanas 3–4)" },
      { label: "Frecuencia", value: "Semanas 1–8" },
    ],
    note: "48h desde el lunes — suficiente recuperación. Si notas los dedos cargados, reduce a 1 set y escala suave.",
    noteClass: "",
  },
  {
    id: "jue", short: "JUE", title: "Yoga / Descanso activo",
    subtitle: "Sin carga de dedos", badge: "Yoga", badgeClass: "badge-yoga",
    icon: "🧘",
    module: "Recuperación",
    params: [
      { label: "Actividad", value: "Yoga / trail suave" },
      { label: "Dedos", value: "Descanso" },
      { label: "Volley playa", value: "OK moderado" },
      { label: "Si hay roca sábado", value: "Mueve el hang aquí", cls: "warn" },
    ],
    note: "Si el fin de semana escalas en roca exterior, mueve el hangboard del viernes a hoy para llegar más fresco.",
    noteClass: "note-warn",
  },
  {
    id: "vie", short: "VIE", title: "Escalada + Hangboard",
    subtitle: "Hangboard primero — ver nota", badge: "Rocódromo", badgeClass: "badge-climb",
    icon: "🧗",
    module: "Módulo: Repeaters o Peak Force / MVC",
    params: [
      { label: "Orden", value: "1º Hangboard", cls: "accent" },
      { label: "Luego", value: "Escalar" },
      { label: "Duración hang", value: "20–30 min" },
      { label: "Canto", value: "25 mm recto" },
      { label: "Si hay roca sábado", value: "Solo escalar", cls: "warn" },
    ],
    note: "Si el sábado vas a roca exterior, omite el hangboard hoy. Escala solo y guarda los tendones para el exterior.",
    noteClass: "note-warn",
  },
  {
    id: "sab", short: "SÁB", title: "Roca exterior / Descanso",
    subtitle: "Cuenta como día de dedos", badge: "Opcional", badgeClass: "badge-free",
    icon: "⛰️",
    module: "Sin hangboard",
    params: [
      { label: "Hangboard", value: "No" },
      { label: "Roca", value: "Si toca" },
      { label: "Intensidad", value: "Moderada" },
      { label: "Nota", value: "Día de dedos real" },
    ],
    note: "La roca exterior genera carga de dedos alta. Si escalas hoy el domingo es descanso obligatorio.",
    noteClass: "note-warn",
  },
  {
    id: "dom", short: "DOM", title: "Descanso completo",
    subtitle: "Recuperación", badge: "Descanso", badgeClass: "badge-rest",
    icon: "😴",
    module: "Sin carga",
    params: [
      { label: "Actividad", value: "Libre" },
      { label: "Dedos", value: "Sin carga" },
      { label: "OK", value: "Paseo, yoga suave" },
    ],
    note: "El descanso es parte del entrenamiento. Los tendones se adaptan durante la recuperación, no durante la carga.",
    noteClass: "",
  },
]

const MESO_PHASES = [
  {
    id: "test", label: "Test MVC",
    weeks: [{ label: "Semana 0", title: "Antes de empezar" }],
  },
  {
    id: "base", label: "Base S1–4",
    weeks: [
      { label: "Semana 1", title: "Introducción", intensity: 60, sets: 2 },
      { label: "Semana 2", title: "Adaptación", intensity: 65, sets: 2 },
      { label: "Semana 3", title: "Volumen", intensity: 70, sets: 3 },
      { label: "Semana 4", title: "Descarga + re-test", intensity: 60, sets: 1, deload: true },
    ],
  },
  {
    id: "strength", label: "Fuerza S5–8",
    weeks: [
      { label: "Semana 5", title: "Fuerza máx.", intensity: 85, sets: 4 },
      { label: "Semana 6", title: "Intensidad", intensity: 88, sets: 5 },
      { label: "Semana 7", title: "Pico", intensity: 90, sets: 5 },
      { label: "Semana 8", title: "Test final", intensity: 85, sets: 3, deload: true },
    ],
  },
]

const RULES = [
  {
    icon: "⚡",
    title: "Hangboard siempre antes de escalar",
    body: "Los tendones se recuperan más lento que el músculo (48–72h mínimo). Si escalas primero y luego haces hang, acumulas fatiga residual y el riesgo de lesión sube. Hangboard al llegar, escala después.",
  },
  {
    icon: "🚨",
    title: "Señales de parar",
    body: "Dolor en polea A2 (base del dedo anular o medio) → para inmediatamente. Pérdida de más del 20% de fuerza entre primera y última rep → la serie ya no sirve. MVC del día más de 10% por debajo del habitual → sesión ligera.",
  },
  {
    icon: "⛰️",
    title: "Adaptación si vas a roca el finde",
    body: "Si el sábado escalas en roca exterior, el viernes no hagas hangboard — solo escala o descansa. La roca exterior cuenta como sesión de dedos de alta intensidad. Mueve el hang del viernes al jueves.",
  },
  {
    icon: "📐",
    title: "Canto correcto",
    body: "Usa siempre el canto de 25 mm recto para hangboard de entrenamiento. El de 20 mm irregular es demasiado agresivo para trabajo sistemático — guárdalo para sesiones de escalada real.",
  },
  {
    icon: "📊",
    title: "Actualiza el MVC",
    body: "Mide tu MVC con Peak Force / MVC en semana 0, semana 4 y semana 8. Los porcentajes de target del Medidor y del Repeaters se basan en ese valor — si no lo actualizas, entrenas con intensidad equivocada.",
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function renderParams(params: { label: string; value: string; cls?: string }[]): string {
  return `<div class="tp-params">${params
    .map(
      (p) =>
        `<div class="tp-param">
          <div class="tp-param-label">${escapeHtml(p.label)}</div>
          <div class="tp-param-val${p.cls ? ` tp-${p.cls}` : ""}">${escapeHtml(p.value)}</div>
        </div>`,
    )
    .join("")}</div>`
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function renderWeekTab(activeDay: string | null): string {
  const dayRows = WEEK_DAYS.map((d) => {
    const isSelected = activeDay === d.id
    return `
      <div class="tp-day-row${isSelected ? " tp-selected" : ""}" data-tp-day="${escapeHtml(d.id)}">
        <div class="tp-day-short">${escapeHtml(d.short)}</div>
        <div class="tp-day-card">
          <div class="tp-day-info">
            <span class="tp-day-title">${escapeHtml(d.title)}</span>
            <span class="tp-day-sub">${escapeHtml(d.subtitle)}</span>
          </div>
          <span class="tp-badge ${escapeHtml(d.badgeClass)}">${escapeHtml(d.badge)}</span>
        </div>
      </div>
      ${
        isSelected
          ? `<div class="tp-detail">
              <div class="tp-detail-header">
                <span class="tp-det-icon">${d.icon}</span>
                <div>
                  <div class="tp-det-title">${escapeHtml(d.title)}</div>
                  <div class="tp-det-sub">${escapeHtml(d.module)}</div>
                </div>
              </div>
              ${renderParams(d.params)}
              <div class="tp-note${d.noteClass ? ` ${escapeHtml(d.noteClass)}` : ""}">${escapeHtml(d.note)}</div>
            </div>`
          : ""
      }
    `
  }).join("")

  return `
    <p class="tp-hint">Toca un día para ver los detalles.</p>
    <div class="tp-day-list">${dayRows}</div>
  `
}

function renderMesoTab(activePhase: string, activeWeek: number): string {
  const phaseTabs = MESO_PHASES.map(
    (p) =>
      `<button type="button" class="tp-phase-tab${activePhase === p.id ? " active" : ""}" data-tp-phase="${escapeHtml(p.id)}">${escapeHtml(p.label)}</button>`,
  ).join("")

  const phase = MESO_PHASES.find((p) => p.id === activePhase)!
  const week = phase.weeks[activeWeek] as { label: string; title: string; intensity?: number; sets?: number; deload?: boolean }

  const weekGrid =
    phase.weeks.length > 1
      ? `<div class="tp-week-grid">${phase.weeks
          .map(
            (w, i) =>
              `<button type="button" class="tp-week-btn${i === activeWeek ? " active" : ""}" data-tp-week="${i}">
                <div class="tp-week-label">${escapeHtml(w.label)}</div>
                <div class="tp-week-title">${escapeHtml(w.title)}</div>
              </button>`,
          )
          .join("")}</div>`
      : ""

  let sessionHTML = ""

  if (activePhase === "test") {
    sessionHTML = `
      <div class="tp-session-card">
        <div class="tp-session-header">
          <span class="tp-session-icon">📊</span>
          <div>
            <div class="tp-session-title">Peak Force / MVC</div>
            <div class="tp-session-sub">Módulo: Peak Force / MVC — cada mano por separado</div>
          </div>
        </div>
        ${renderParams([
          { label: "Intentos", value: "3 por mano" },
          { label: "Duración", value: "10 s máx" },
          { label: "Descanso", value: "3–4 min" },
          { label: "Canto", value: "25 mm recto" },
        ])}
        <div class="tp-note">Apunta el mejor valor de cada mano en kg. Ese es tu MVC. Méterlo en Left MVC y Right MVC en Repeaters. Repite en semana 4 y al final del ciclo.</div>
      </div>`
  } else if (activePhase === "strength") {
    sessionHTML = `
      <div class="tp-session-card">
        <div class="tp-session-header">
          <span class="tp-session-icon">💪</span>
          <div>
            <div class="tp-session-title">${week.deload ? "Test + descarga" : "Max Hangs"}</div>
            <div class="tp-session-sub">Módulo: Peak Force / MVC</div>
          </div>
        </div>
        ${renderParams([
          { label: "Series", value: String(week.sets) },
          { label: "Duración hang", value: "10 s" },
          { label: "Descanso", value: "4–5 min" },
          { label: "Intensidad", value: `${week.intensity}% MVC`, cls: "accent" },
          { label: "Canto", value: "25 mm recto" },
          { label: "Frecuencia", value: "2×/semana" },
        ])}
        <div class="tp-note">${
          week.deload
            ? "Semana de descarga. Reduce el volumen a la mitad. Haz el test MVC al final para medir el progreso del ciclo."
            : `Cada serie: 1 hang máximo de 10 s al ${week.intensity}% MVC. Descansa completo. Si no llegas al %, para — menos series con calidad.`
        }</div>
      </div>`
  } else {
    const minTarget = (week.intensity ?? 60) - 5
    sessionHTML = `
      <div class="tp-session-card">
        <div class="tp-session-header">
          <span class="tp-session-icon">🔁</span>
          <div>
            <div class="tp-session-title">${week.deload ? "Descarga + re-test" : "Repeaters 7/3"}</div>
            <div class="tp-session-sub">Módulo: Repeaters</div>
          </div>
        </div>
        ${renderParams([
          { label: "Sets", value: String(week.sets) },
          { label: "Reps", value: "6" },
          { label: "Work", value: "7 s" },
          { label: "Rest", value: "3 s" },
          { label: "Pause", value: "180 s" },
          { label: "Min target", value: `${minTarget}%` },
          { label: "Max target", value: `${week.intensity}%`, cls: "accent" },
          { label: "Left/Right", value: "Activado" },
        ])}
        <div class="tp-note">${
          week.deload
            ? "Semana 4: baja a 1–2 series. Haz el re-test MVC para ajustar los % de las semanas de fuerza."
            : "Frecuencia: 2–3×/semana. Mínimo 48h entre sesiones. Si en la última rep pierdes más del 20% de fuerza respecto a la primera, para la serie."
        }</div>
      </div>`
  }

  return `
    <div class="tp-phase-tabs">${phaseTabs}</div>
    ${weekGrid}
    ${sessionHTML}
  `
}

function renderMeterTab(mvcWeak: number, mvcStrong: number): string {
  const grades = ["5+", "6a", "6a+", "6b", "6b+", "6c", "6c+", "7a", "7a+", "7b", "7b+", "7c"]
  const gradePcts = [0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92]
  const thresholds = [18, 22, 26, 30, 34, 38, 43, 48, 54, 60, 68]
  const limiting = Math.min(mvcWeak, mvcStrong)
  const idx = thresholds.findIndex((t) => limiting < t)
  const gradeIdx = idx === -1 ? grades.length - 1 : idx
  const pct = gradePcts[gradeIdx]
  const levelGrade = grades[gradeIdx]
  const ceilGrade = grades[Math.min(gradeIdx + 1, grades.length - 1)]
  const workLow = grades[Math.max(gradeIdx - 1, 0)]
  const asymmetry = mvcStrong - mvcWeak
  const targetHang = Math.round(limiting * 0.7)

  const rec =
    asymmetry > 8
      ? `Asimetría de ${asymmetry} kg detectada. Prioriza vías equilibradas y añade 1 serie extra solo con la mano débil en el hangboard.`
      : `Zona de trabajo: ${workLow}–${levelGrade}. Calienta con ${workLow}, encadena en ${levelGrade}, proyecta ${ceilGrade}. No fuerces por encima del techo hoy.`

  return `
    <div class="tp-section-title">MVC actual (desde Peak Force)</div>
    <div class="tp-mvc-row">
      <label>Mano débil</label>
      <input type="range" min="10" max="80" step="1" value="${mvcWeak}" data-tp-mvc="weak" />
      <span class="tp-mvc-val" id="tp-weak-val">${mvcWeak} kg</span>
    </div>
    <div class="tp-mvc-row">
      <label>Mano fuerte</label>
      <input type="range" min="10" max="80" step="1" value="${mvcStrong}" data-tp-mvc="strong" />
      <span class="tp-mvc-val" id="tp-strong-val">${mvcStrong} kg</span>
    </div>

    <div class="tp-section-title" style="margin-top:1.25rem">Nivel estimado</div>
    <div class="tp-level-bar">
      <div class="tp-level-fill" style="width:${pct}%" id="tp-level-fill"></div>
      <span class="tp-level-label" id="tp-level-label">${levelGrade}</span>
    </div>

    <div class="tp-stats-grid">
      <div class="tp-stat">
        <div class="tp-stat-label">Techo hoy</div>
        <div class="tp-stat-val" id="tp-ceil">${ceilGrade}</div>
        <div class="tp-stat-sub">proyectos</div>
      </div>
      <div class="tp-stat">
        <div class="tp-stat-label">Zona calidad</div>
        <div class="tp-stat-val" id="tp-work">${workLow}–${levelGrade}</div>
        <div class="tp-stat-sub">más repeticiones</div>
      </div>
      <div class="tp-stat">
        <div class="tp-stat-label">Asimetría</div>
        <div class="tp-stat-val${asymmetry > 8 ? " tp-warn" : ""}" id="tp-asym">${asymmetry} kg</div>
        <div class="tp-stat-sub" id="tp-asym-sub">${asymmetry > 8 ? "⚠ trabaja el débil" : "equilibrado"}</div>
      </div>
      <div class="tp-stat">
        <div class="tp-stat-label">Target hang</div>
        <div class="tp-stat-val tp-accent" id="tp-target">${targetHang} kg</div>
        <div class="tp-stat-sub">70% MVC repeaters</div>
      </div>
    </div>

    <div class="tp-rec-box">
      <div class="tp-rec-title">Recomendación para hoy</div>
      <div class="tp-rec-body" id="tp-rec">${escapeHtml(rec)}</div>
    </div>
    <div class="tp-note" style="margin-top:10px">El MVC lo mides con Peak Force / MVC antes de la sesión. Actualiza los sliders con el valor de hoy.</div>
  `
}

function renderRulesTab(): string {
  return RULES.map(
    (r) => `
    <div class="tp-rule-card">
      <div class="tp-rule-title">${r.icon} ${escapeHtml(r.title)}</div>
      <div class="tp-rule-body">${escapeHtml(r.body)}</div>
    </div>`,
  ).join("")
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const STYLES = `
<style>
.tp-tabs{display:flex;gap:6px;margin-bottom:1.25rem;flex-wrap:wrap}
.tp-tab{flex:1;padding:8px 4px;border-radius:8px;border:1px solid var(--border-color,#e0e0e0);background:transparent;color:var(--text-secondary,#666);font-size:13px;cursor:pointer;text-align:center;font-family:inherit}
.tp-tab.active{background:var(--primary-light,#e8f0fe);color:var(--primary,#1a73e8);border-color:var(--primary,#1a73e8);font-weight:500}
.tp-hint{font-size:12px;color:var(--text-muted,#999);margin-bottom:10px}
.tp-day-list{display:flex;flex-direction:column;gap:6px}
.tp-day-row{display:flex;align-items:stretch;gap:8px;cursor:pointer}
.tp-day-short{width:34px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--text-muted,#999);text-transform:uppercase;letter-spacing:.05em;flex-shrink:0}
.tp-day-card{flex:1;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:10px;border:1px solid var(--border-color,#e0e0e0);background:var(--card-bg,#fff)}
.tp-selected .tp-day-card{border:2px solid var(--primary,#1a73e8)}
.tp-day-info{display:flex;flex-direction:column}
.tp-day-title{font-size:14px;font-weight:500;color:var(--text-primary,#111)}
.tp-day-sub{font-size:12px;color:var(--text-muted,#999);margin-top:1px}
.tp-badge{font-size:11px;padding:2px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0}
.badge-climb{background:#e8f0fe;color:#1a56db}
.badge-yoga{background:#def7ec;color:#057a55}
.badge-rest,.badge-free{background:#f3f4f6;color:#6b7280;border:1px solid #e0e0e0}
.tp-detail{margin:2px 0 4px 42px;background:var(--card-bg,#fff);border:1px solid var(--border-color,#e0e0e0);border-radius:12px;padding:1rem 1.125rem}
.tp-detail-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.tp-det-icon{font-size:22px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:var(--input-bg,#f8f9fa);border-radius:8px;flex-shrink:0}
.tp-det-title{font-size:15px;font-weight:500;color:var(--text-primary,#111)}
.tp-det-sub{font-size:12px;color:var(--text-muted,#999);margin-top:1px}
.tp-params{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px}
.tp-param{background:var(--input-bg,#f8f9fa);border-radius:8px;padding:8px 10px}
.tp-param-label{font-size:11px;color:var(--text-muted,#999)}
.tp-param-val{font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-top:1px}
.tp-accent{color:var(--primary,#1a73e8)}
.tp-warn{color:#d97706}
.tp-note{font-size:13px;color:var(--text-secondary,#555);padding:10px 12px;border-radius:8px;background:var(--input-bg,#f8f9fa);line-height:1.5;border-left:3px solid var(--primary,#1a73e8)}
.tp-note.note-warn{border-left-color:#f59e0b}
.tp-phase-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.tp-phase-tab{padding:6px 12px;border-radius:8px;border:1px solid var(--border-color,#e0e0e0);background:transparent;color:var(--text-secondary,#666);font-size:12px;cursor:pointer;font-family:inherit}
.tp-phase-tab.active{background:var(--primary-light,#e8f0fe);color:var(--primary,#1a73e8);border-color:var(--primary,#1a73e8);font-weight:500}
.tp-week-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
.tp-week-btn{padding:10px 12px;border-radius:10px;border:1px solid var(--border-color,#e0e0e0);background:var(--card-bg,#fff);text-align:left;cursor:pointer;font-family:inherit}
.tp-week-btn.active{border:2px solid var(--primary,#1a73e8);background:var(--primary-light,#e8f0fe)}
.tp-week-label{font-size:11px;color:var(--text-muted,#999);text-transform:uppercase;letter-spacing:.05em}
.tp-week-title{font-size:13px;font-weight:500;color:var(--text-primary,#111);margin-top:2px}
.tp-week-btn.active .tp-week-label,.tp-week-btn.active .tp-week-title{color:var(--primary,#1a73e8)}
.tp-session-card{background:var(--card-bg,#fff);border:1px solid var(--border-color,#e0e0e0);border-radius:12px;padding:1rem 1.125rem}
.tp-session-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.tp-session-icon{font-size:22px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:var(--input-bg,#f8f9fa);border-radius:8px;flex-shrink:0}
.tp-session-title{font-size:15px;font-weight:500;color:var(--text-primary,#111)}
.tp-session-sub{font-size:12px;color:var(--text-muted,#999);margin-top:1px}
.tp-section-title{font-size:11px;font-weight:600;color:var(--text-muted,#999);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.tp-mvc-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.tp-mvc-row label{font-size:13px;color:var(--text-secondary,#555);width:90px;flex-shrink:0}
.tp-mvc-row input[type=range]{flex:1}
.tp-mvc-val{font-size:13px;font-weight:500;color:var(--text-primary,#111);min-width:44px;text-align:right}
.tp-level-bar{position:relative;height:30px;border-radius:8px;background:var(--input-bg,#f8f9fa);overflow:hidden;margin-bottom:12px;border:1px solid var(--border-color,#e0e0e0)}
.tp-level-fill{height:100%;background:var(--primary-light,#e8f0fe);transition:width .3s}
.tp-level-label{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:600;color:var(--primary,#1a73e8)}
.tp-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
.tp-stat{background:var(--input-bg,#f8f9fa);border-radius:8px;padding:10px 12px}
.tp-stat-label{font-size:11px;color:var(--text-muted,#999)}
.tp-stat-val{font-size:18px;font-weight:600;color:var(--text-primary,#111);margin-top:2px}
.tp-stat-sub{font-size:11px;color:var(--text-muted,#999);margin-top:1px}
.tp-rec-box{background:var(--primary-light,#e8f0fe);border-radius:10px;padding:12px 14px}
.tp-rec-title{font-size:13px;font-weight:500;color:var(--primary,#1a73e8)}
.tp-rec-body{font-size:12px;color:var(--primary,#1a73e8);margin-top:4px;line-height:1.5;opacity:.85}
.tp-rule-card{background:var(--card-bg,#fff);border:1px solid var(--border-color,#e0e0e0);border-radius:12px;padding:1rem 1.125rem;margin-bottom:8px}
.tp-rule-title{font-size:14px;font-weight:500;color:var(--text-primary,#111);margin-bottom:6px}
.tp-rule-body{font-size:13px;color:var(--text-secondary,#555);line-height:1.6}
</style>
`

// ─── CLIENT SCRIPT ────────────────────────────────────────────────────────────

const CLIENT_SCRIPT = `
<script>
(function() {
  var state = {
    tab: 'week',
    day: null,
    phase: 'test',
    week: 0,
    mvcWeak: 30,
    mvcStrong: 35,
  };

  var grades = ["5+","6a","6a+","6b","6b+","6c","6c+","7a","7a+","7b","7b+","7c"];
  var gradePcts = [0,8,17,25,33,42,50,58,67,75,83,92];
  var thresholds = [18,22,26,30,34,38,43,48,54,60,68];

  function mvcToIdx(mvc) {
    var i = thresholds.findIndex(function(t){return mvc<t;});
    return i===-1 ? grades.length-1 : i;
  }

  function updateMeter() {
    var limiting = Math.min(state.mvcWeak, state.mvcStrong);
    var idx = mvcToIdx(limiting);
    var pct = gradePcts[idx];
    var level = grades[idx];
    var ceil = grades[Math.min(idx+1,grades.length-1)];
    var workLow = grades[Math.max(idx-1,0)];
    var asym = state.mvcStrong - state.mvcWeak;
    var target = Math.round(limiting*0.7);

    var fill = document.getElementById('tp-level-fill');
    var lbl = document.getElementById('tp-level-label');
    var ceilEl = document.getElementById('tp-ceil');
    var workEl = document.getElementById('tp-work');
    var asymEl = document.getElementById('tp-asym');
    var asymSub = document.getElementById('tp-asym-sub');
    var targetEl = document.getElementById('tp-target');
    var recEl = document.getElementById('tp-rec');
    var weakVal = document.getElementById('tp-weak-val');
    var strongVal = document.getElementById('tp-strong-val');

    if(fill) fill.style.width = pct+'%';
    if(lbl) lbl.textContent = level;
    if(ceilEl) ceilEl.textContent = ceil;
    if(workEl) workEl.textContent = workLow+'–'+level;
    if(asymEl){ asymEl.textContent = asym+' kg'; asymEl.className='tp-stat-val'+(asym>8?' tp-warn':''); }
    if(asymSub) asymSub.textContent = asym>8 ? '⚠ trabaja el débil' : 'equilibrado';
    if(targetEl) targetEl.textContent = target+' kg';
    if(weakVal) weakVal.textContent = state.mvcWeak+' kg';
    if(strongVal) strongVal.textContent = state.mvcStrong+' kg';
    if(recEl){
      recEl.textContent = asym>8
        ? 'Asimetría de '+asym+' kg detectada. Prioriza vías equilibradas y añade 1 serie extra solo con la mano débil en el hangboard.'
        : 'Zona de trabajo: '+workLow+'–'+level+'. Calienta con '+workLow+', encadena en '+level+', proyecta '+ceil+'. No fuerces por encima del techo hoy.';
    }
  }

  document.addEventListener('click', function(e) {
    var dayEl = e.target.closest('[data-tp-day]');
    if(dayEl){
      var id = dayEl.getAttribute('data-tp-day');
      state.day = state.day===id ? null : id;
      document.querySelectorAll('.tp-day-row').forEach(function(r){
        var rId = r.getAttribute('data-tp-day');
        r.classList.toggle('tp-selected', rId===state.day);
        var det = r.nextElementSibling;
        if(det && det.classList.contains('tp-detail')) det.style.display = rId===state.day ? '' : 'none';
      });
      return;
    }

    var tabEl = e.target.closest('.tp-tab');
    if(tabEl){
      state.tab = tabEl.getAttribute('data-tp-tab');
      document.querySelectorAll('.tp-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tp-tab')===state.tab); });
      document.querySelectorAll('.tp-tab-content').forEach(function(c){ c.style.display = c.getAttribute('data-tp-content')===state.tab ? '' : 'none'; });
      return;
    }

    var phaseEl = e.target.closest('[data-tp-phase]');
    if(phaseEl){
      state.phase = phaseEl.getAttribute('data-tp-phase');
      state.week = 0;
      document.querySelectorAll('.tp-phase-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tp-phase')===state.phase); });
      document.querySelectorAll('[data-tp-week]').forEach(function(b){ b.classList.toggle('active', parseInt(b.getAttribute('data-tp-week'))===0); });
      return;
    }

    var weekEl = e.target.closest('[data-tp-week]');
    if(weekEl){
      state.week = parseInt(weekEl.getAttribute('data-tp-week'));
      document.querySelectorAll('[data-tp-week]').forEach(function(b){ b.classList.toggle('active', parseInt(b.getAttribute('data-tp-week'))===state.week); });
      return;
    }
  });

  document.addEventListener('input', function(e) {
    var mvc = e.target.getAttribute('data-tp-mvc');
    if(mvc==='weak'){ state.mvcWeak=parseInt(e.target.value); updateMeter(); }
    if(mvc==='strong'){ state.mvcStrong=parseInt(e.target.value); updateMeter(); }
  });
})();
<\/script>
`

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function setupTrainingProgramsPage(_state: TrainingProgramsPageState): string {
  const header = `
    <div class="page-title-row">
      <a class="session-back-link" href="?"><i class="fa-solid fa-arrow-left"></i></a>
      <h3>Training Programs</h3>
    </div>
  `

  const tabs = ["week", "meso", "meter", "rules"]
  const tabLabels: Record<string, string> = { week: "Semana", meso: "Mesociclo", meter: "Medidor", rules: "Reglas" }

  const tabButtons = tabs
    .map(
      (t) =>
        `<button type="button" class="tp-tab${t === "week" ? " active" : ""}" data-tp-tab="${t}">${tabLabels[t]}</button>`,
    )
    .join("")

  const tabContents = tabs
    .map((t) => {
      let content = ""
      if (t === "week") content = renderWeekTab(null)
      else if (t === "meso") content = renderMesoTab("test", 0)
      else if (t === "meter") content = renderMeterTab(30, 35)
      else if (t === "rules") content = renderRulesTab()
      return `<div class="tp-tab-content" data-tp-content="${t}"${t !== "week" ? ' style="display:none"' : ""}>${content}</div>`
    })
    .join("")

  return `
    ${STYLES}
    <section class="session-page" aria-label="Training Programs">
      ${header}
      <div class="section-content">
        <div class="tp-tabs">${tabButtons}</div>
        ${tabContents}
      </div>
    </section>
    ${CLIENT_SCRIPT}
  `
}
