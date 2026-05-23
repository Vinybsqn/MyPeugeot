const VIN = "VR3UHZKXZPT583300"
const API = "https://api.vbasquin.com"

// ─── Fetch data ───────────────────────────────────────────────
async function fetchData() {
  const req = new Request(`${API}/get_vehicleinfo/${VIN}`)
  return await req.loadJSON()
}

const data = await fetchData()
const energy = data.energy?.[0]
const level = energy?.level ?? 0
const autonomy = energy?.autonomy ?? 0
const charging = energy?.charging
const isCharging = charging?.status === "InProgress"
const isPlugged = charging?.plugged
const remaining = charging?.remaining_time
const rate = charging?.charging_rate
const nextCharge = charging?.next_delayed_time
const temp = data.environment?.air?.temp
const mileage = data.timed_odometer?.mileage
const updatedAt = energy?.updated_at

function parseDuration(iso) {
  if (!iso) return ""
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  return `${m[1] ? m[1]+"h " : ""}${m[2] ? m[2]+"min" : ""}`.trim()
}

function timeAgo(dateStr) {
  if (!dateStr) return "–"
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000)
  if (diff < 2) return "à l'instant"
  if (diff < 60) return `il y a ${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h/24)}j`
}

const levelColor = isCharging
  ? (level > 60 ? new Color("#4ade80") : level > 30 ? new Color("#facc15") : new Color("#f87171"))
  : (level <= 20 ? new Color("#f87171") : level <= 30 ? new Color("#facc15") : new Color("#ffffff"))

// ─── WIDGET MODE ─────────────────────────────────────────────
if (config.runsInWidget) {
  const w = new ListWidget()
  w.backgroundColor = new Color("#0c0c14")
  w.setPadding(16, 16, 16, 16)
  w.url = "https://e208.vbasquin.com"

  const grad = new LinearGradient()
  grad.colors = [new Color("#1a0808"), new Color("#0c0c14")]
  grad.locations = [0, 1]
  w.backgroundGradient = grad

  const title = w.addText("e-208 de Vianney")
  title.textColor = new Color("#ffffff", 0.35)
  title.font = Font.mediumSystemFont(11)

  w.addSpacer(6)

  const levelText = w.addText(`${level}%`)
  levelText.textColor = levelColor
  levelText.font = Font.boldSystemFont(42)

  w.addSpacer(2)

  const autoText = w.addText(`${autonomy} km restants`)
  autoText.textColor = new Color("#ffffff", 0.45)
  autoText.font = Font.systemFont(13)

  w.addSpacer(8)

  const statusStack = w.addStack()
  statusStack.layoutHorizontally()
  statusStack.spacing = 6

  if (isPlugged) {
    const dot = statusStack.addText(isCharging ? "⚡ En charge" : "🔌 Branché")
    dot.textColor = isCharging ? new Color("#4ade80") : new Color("#94a3b8")
    dot.font = Font.mediumSystemFont(12)
    if (remaining) {
      statusStack.addSpacer()
      const rem = statusStack.addText(parseDuration(remaining))
      rem.textColor = new Color("#ffffff", 0.35)
      rem.font = Font.systemFont(12)
    }
  } else {
    const status = statusStack.addText("🚗 Prêt à partir")
    status.textColor = new Color("#ffffff", 0.45)
    status.font = Font.systemFont(12)
  }

  if (temp != null) {
    w.addSpacer(4)
    const tempText = w.addText(`🌡 ${temp}°C`)
    tempText.textColor = new Color("#ffffff", 0.3)
    tempText.font = Font.systemFont(11)
  }

  Script.setWidget(w)

// ─── CARPLAY / INTERACTIVE MODE ──────────────────────────────
} else {
  const table = new UITable()
  table.showSeparators = false

  // Batterie
  const battRow = new UITableRow()
  battRow.height = 100
  const battCell = battRow.addText(`${level}%`, `${autonomy} km restants`)
  battCell.titleColor = levelColor
  battCell.titleFont = Font.boldSystemFont(48)
  battCell.subtitleColor = Color.gray()
  battCell.subtitleFont = Font.systemFont(18)
  table.addRow(battRow)

  // Statut charge
  const statusRow = new UITableRow()
  statusRow.height = 60
  let statusText, statusSub, statusColor
  if (isCharging) {
    statusText = "⚡ En charge"
    statusSub = remaining ? parseDuration(remaining) + " restant" : ""
    statusColor = new Color("#4ade80")
  } else if (isPlugged) {
    statusText = "🔌 Branché"
    statusSub = nextCharge ? `Programmée à ${parseDuration(nextCharge)}` : ""
    statusColor = Color.gray()
  } else {
    statusText = "🚗 Prêt à partir"
    statusSub = `Sync ${timeAgo(updatedAt)}`
    statusColor = Color.white()
  }
  const statusCell = statusRow.addText(statusText, statusSub)
  statusCell.titleColor = statusColor
  statusCell.titleFont = Font.semiboldSystemFont(20)
  statusCell.subtitleColor = Color.gray()
  statusCell.subtitleFont = Font.systemFont(15)
  table.addRow(statusRow)

  await QuickLook.present(table, false)
}

Script.complete()
