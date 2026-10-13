import { useEffect, useRef, useState } from "react"
import logo from "./imports/itl_leon.png"

const zones = ["Principal", "Libramiento", "Yupol", "Estacionamiento"] as const
type Zone = typeof zones[number]
const accounts: Record<string, Zone> = {
  "23240426": "Principal",
  "23240427": "Libramiento",
  "23240428": "Yupol",
  "23240429": "Estacionamiento",
}
const routes: Record<Zone, string[]> = {
  Principal: [
    "Biblioteca",
    "A",
    "Q",
    "R",
    "P",
    "J",
    "H",
    "B",
    "G",
    "K",
    "F",
    "C",
    "D",
  ],
  Libramiento: ["Canchas", "W", "E"],
  Yupol: ["T", "S", "Ñ", "O", "M", "L"],
  Estacionamiento: ["Entrada vehicular", "Cajones", "Salida vehicular"],
}
const checkpointCode = (point: string) =>
  `QR-${point.toUpperCase().replace(/ /g, "-")}`

type Vehicle = "Autos" | "Motos" | "Bicicletas"
type Entry = { id: number time: string zone: Zone text: string }
type Candidate = {
  name: string
  control: string
  known: boolean
  schedule: boolean
  pass: boolean
}
const people: Record<string, Candidate> = {
  "QR-21310234": {
    name: "Carlos Ramírez Torres",
    control: "21310234",
    known: true,
    schedule: true,
    pass: true,
  },
  "QR-21310567": {
    name: "María González López",
    control: "21310567",
    known: true,
    schedule: false,
    pass: true,
  },
  "QR-SIN-PASE": {
    name: "Andrea López",
    control: "21310890",
    known: true,
    schedule: true,
    pass: false,
  },
  "QR-DESCONOCIDO": {
    name: "Identidad no reconocida",
    control: "Sin registro",
    known: false,
    schedule: false,
    pass: true,
  },
}
const capacities = { Autos: 120, Motos: 40, Bicicletas: 60 }
const initialSpaces = { Autos: 18, Motos: 12, Bicicletas: 24 }
function Icon({ kind = "qr" }: { kind?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "person" ? (
        <>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      ) : kind === "alert" ? (
        <>
          <path d="m12 3 10 18H2L12 3Z" />
          <path d="M12 9v4m0 4h.01" />
        </>
      ) : kind === "car" ? (
        <>
          <path d="m5 5-3 7v7h20v-7l-3-7H5ZM2 12h20M5 19v2m14-2v2" />
          <path d="M6 15h2m8 0h2" />
        </>
      ) : kind === "mic" ? (
        <>
          <rect x="9" y="2" width="6" height="13" rx="3" />
          <path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8" />
        </>
      ) : (
        <>
          <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />
          <path d="M7 7h3v3H7zm7 0h3v3h-3zM7 14h3v3H7zm7 0h3v3h-3z" />
        </>
      )}
    </svg>
  )
}
function Brand() {
  return (
    <div className="brand">
      <img src={logo} alt="Instituto Tecnológico de León" />
      <div>
        <strong>Instituto Tecnológico de León</strong>
        <span>Seguridad institucional</span>
      </div>
    </div>
  )
}
function Panel({
  title,
  subtitle,
  icon,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  icon?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div className="heading-icon">
          <Icon kind={icon} />
        </div>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
export default function App() {
  const [zone, setZone] = useState<Zone>("Principal")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [logged, setLogged] = useState(false)
  const [tab, setTab] = useState("Monitoreo")
  const [flows, setFlows] = useState<Partial<Record<Zone, boolean>>>({})
  const highFlow = !!flows[zone]
  const setHighFlow = (value: boolean) =>
    setFlows((f) => ({ ...f, [zone]: value }))
  const [spaces, setSpaces] = useState(initialSpaces)
  const [entries, setEntries] = useState<Entry[]>([])
  const [devices, setDevices] = useState<Record<string, boolean>>({})
  const [emergencies, setEmergencies] = useState<Partial<Record<Zone, string>>>(
    {},
  )
  const emergency = emergencies[zone] || ""
  const setEmergency = (value: string) =>
    setEmergencies((e) => ({ ...e, [zone]: value }))
  const [confirm, setConfirm] = useState<{
    action: string
    stage: number
  } | null>(null)
  const [protocol, setProtocol] = useState("Disturbio")
  const [note, setNote] = useState("")
  const [dictating, setDictating] = useState(false)
  const [chat, setChat] = useState<{
    from: string
    to: string
    text: string
    time: string
  }[]>([])
  const [destination, setDestination] = useState<Zone>("Libramiento")
  const [message, setMessage] = useState("")
  const [patrols, setPatrols] = useState<Partial<Record<Zone, boolean>>>({})
  const [zoneChecks, setZoneChecks] = useState<Partial<Record<Zone, string[]>>>(
    {},
  )
  const patrol = !!patrols[zone]
  const checks = zoneChecks[zone] || []
  const setPatrol = (value: boolean) =>
    setPatrols((p) => ({ ...p, [zone]: value }))
  const setChecks = (value: string[] | ((c: string[]) => string[])) =>
    setZoneChecks((c) => ({
      ...c,
      [zone]: typeof value === "function" ? value(c[zone] || []) : value,
    }))
  const route = routes[zone].map(checkpointCode)
  const localEntries = entries.filter((e) => e.zone === zone)
  const [checkpoint, setCheckpoint] = useState("")
  const [feedback, setFeedback] = useState("")
  const [clock, setClock] = useState(new Date())
  const dialogRef = useRef<HTMLDialogElement>(null)
  const time = () =>
    new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })
  function log(text: string) {
    setEntries((e) => [
      { id: Date.now() + Math.random(), time: time(), zone, text },
      ...e,
    ])
    setFeedback(text)
  }
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    if (confirm) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [confirm])
  useEffect(() => {
    if (!dictating) return
    const id = setTimeout(() => {
      setNote(
        (n) =>
          `${n}${
            n ? " " : ""
          }Rondín realizado sin novedades. Se verificaron los accesos y las áreas comunes.`,
      )
      setDictating(false)
    }, 1600)
    return () => clearTimeout(id)
  }, [dictating])
  function hardware(name: string) {
    return !!devices[`${zone}-${name}`]
  }
  const hardwareNames =
    zone === "Estacionamiento"
      ? ["Pluma entrada", "Pluma salida"]
      : ["Torniquete entrada", "Torniquete salida"]
  function closeLocalDevices() {
    setDevices((d) => ({
      ...d,
      ...Object.fromEntries(
        hardwareNames.map((name) => [`${zone}-${name}`, false]),
      ),
    }))
  }
  function applyConfirmation() {
    if (!confirm) return
    if (confirm.stage === 1) {
      setConfirm({ ...confirm, stage: 2 })
      return
    }
    if (confirm.action === "Restablecer operación") {
      setEmergency("")
      closeLocalDevices()
      log("Operación restablecida manualmente. Dispositivos cerrados.")
    } else {
      setEmergency(confirm.action)
      setHighFlow(false)
      closeLocalDevices()
      log(
        `Protocolo activado: ${confirm.action}. ${
          confirm.action === "Evacuación"
            ? "Salidas liberadas; entradas suspendidas."
            : "Accesos bloqueados; solicitar apoyo."
        }`,
      )
    }
    setConfirm(null)
  }
  if (!logged)
    return (
      <div className="login-page">
        <div className="login-card">
          <aside className="login-aside">
            <img src={logo} alt="Emblema del Instituto Tecnológico de León" />
            <span>PROTEGEMOS NUESTRA COMUNIDAD</span>
            <h2>
              Un campus seguro.
              <br />
              Una comunidad conectada.
            </h2>
            <p>Centro de operación y control de accesos</p>
            <div className="login-status">
              <i /> Prototipo interactivo · Simulación
            </div>
          </aside>
          <div className="login-form">
            <Brand />
            <div className="eyebrow">PLATAFORMA DE SEGURIDAD</div>
            <h1>Bienvenido de nuevo</h1>
            <p className="muted">
              Inicia tu turno en el punto de acceso asignado.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const assigned = accounts[username.trim()]
                if (!assigned || password !== "itl2026") {
                  setLoginError(
                    "Cuenta o contraseña incorrecta. Utiliza una cuenta demo de la lista.",
                  )
                  return
                }
                setZone(assigned)
                setLogged(true)
                setPassword("")
                setLoginError("")
                setDestination(zones.find((z) => z !== assigned)!)
                setNote("")
                setMessage("")
                setFeedback("")
                setCheckpoint("")
              }}
            >
              <label>
                Número de control
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="23240426"
                  autoComplete="username"
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
              </label>
              <div className="info-box">
                <strong>Cuentas de demostración</strong>
                {Object.entries(accounts).map(([id, assigned]) => (
                  <button
                    type="button"
                    className="demo-account"
                    key={id}
                    onClick={() => {
                      setUsername(id)
                      setPassword("itl2026")
                      setLoginError("")
                    }}
                  >
                    <span>{id}</span>
                    <span>{assigned}</span>
                  </button>
                ))}
                Contraseña para todas las cuentas: <strong>itl2026</strong>
              </div>
              {loginError && (
                <p className="validation warning" role="alert">
                  {loginError}
                </p>
              )}
              <button className="primary full">
                Iniciar turno <span>→</span>
              </button>
            </form>
            <p className="login-help">
              Cada cuenta opera únicamente su caseta asignada.
              <br />
              No se conecta a sistemas institucionales.
            </p>
          </div>
        </div>
        <footer>
          © 2026 Instituto Tecnológico de León · Seguridad institucional
        </footer>
      </div>
    )
  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        <div className="top-date">
          {clock.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          <strong>{clock.toLocaleTimeString("es-MX")}</strong>
        </div>
        <button
          className="danger"
          onClick={() => setConfirm({ action: protocol, stage: 1 })}
          disabled={!!emergency}
        >
          <Icon kind="alert" /> Emergencia
        </button>
        <div className="profile">
          <span className="avatar small">AM</span>
          <div>
            <strong>Guardia demo</strong>
            <span>
              {username} · {zone}
            </span>
          </div>
        </div>
        <button
          className="logout"
          onClick={() => {
            setLogged(false)
            setDictating(false)
            setConfirm(null)
            setNote("")
            setMessage("")
            setPassword("")
            setTab("Monitoreo")
          }}
        >
          Cerrar sesión
        </button>
      </header>
      <div className="statusbar">
        <span>
          <i /> Simulación en línea
        </span>
        <span>
          {zone} · {zone === "Estacionamiento" ? "Vehicular" : "Peatonal"}
        </span>
        <span>Validación de identidad y horario activa</span>
        <span className="demo-tag">ENTORNO DEMO</span>
      </div>
      <main className="workspace">
        <div className="page-heading">
          <div>
            <div className="eyebrow">CENTRO DE OPERACIÓN</div>
            <h1>Monitoreo de accesos</h1>
            <p>Supervisión y control simulados · {zone}</p>
          </div>
          <div className="flow-control">
            <div>
              <strong>Alto Flujo</strong>
              <span>Conserva todas las validaciones</span>
            </div>
            <button
              className={`switch ${highFlow ? "on" : ""}`}
              aria-label="Activar Alto Flujo"
              aria-pressed={highFlow}
              disabled={!!emergency}
              onClick={() => {
                setHighFlow(!highFlow)
                log(
                  `Alto Flujo ${
                    !highFlow ? "activado" : "desactivado"
                  }; validaciones conservadas.`,
                )
              }}
            >
              <span />
            </button>
          </div>
        </div>
        {emergency && (
          <div className="emergency-banner" role="alert">
            <Icon kind="alert" />
            <div>
              <strong>Protocolo activo: {emergency}</strong>
              <p>
                {emergency === "Evacuación"
                  ? "Entradas suspendidas. Salidas liberadas para evacuación."
                  : "Accesos bloqueados. Coordinar apoyo con las casetas."}
              </p>
            </div>
            <button
              onClick={() =>
                setConfirm({ action: "Restablecer operación", stage: 1 })
              }
            >
              Restablecer operación
            </button>
          </div>
        )}
        <nav className="tabs">
          {["Monitoreo", "Rondines"].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t}
              {t === "Bitácora" && <span>{localEntries.length}</span>}
            </button>
          ))}
        </nav>
        <div className="feedback" role="status">
          {feedback ||
            "Turno iniciado. Selecciona un escenario QR para probar la operación."}
        </div>
        {tab === "Monitoreo" && (
          <>
            <Panel
              title={`Cámaras · ${zone}`}
              subtitle="Escenas de demostración · Sin conexión a cámaras reales"
            >
              <div className="camera-grid">
                {["Entrada", "Salida"].map((view, index) => (
                  <div className="camera-scene" key={`${zone}-${view}`}>
                    <div className="camera-label">
                      <span>
                        CAM 0{index + 1} · {zone} / {view}
                      </span>
                      <span>SIMULADA</span>
                    </div>
                    <div
                      className={`campus-scene ${
                        zone === "Estacionamiento" ? "parking-scene" : ""
                      }`}
                    >
                      <div className="campus-building">
                        <span>ITL · {zone}</span>
                      </div>
                      <div className="campus-path" />
                      <div className="campus-gate" />
                    </div>
                    <div className="camera-caption">
                      Vista de {view.toLowerCase()} · Escena estática, sin video
                      real
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <div className={`dashboard-grid ${"pedestrian-only"}`}>
              {zone !== "Estacionamiento" && (
                <AccessPanel
                  key={`${zone}-pedestrian`}
                  title="Acceso peatonal"
                  vehicle={false}
                  emergency={emergency}
                  highFlow={highFlow}
                  spaces={spaces}
                  onAuthorize={(text) => log(text)}
                />
              )}
              {zone === "Estacionamiento" && (
                <AccessPanel
                  key={`${zone}-vehicle`}
                  title="Acceso vehicular"
                  vehicle
                  emergency={emergency}
                  highFlow={highFlow}
                  spaces={spaces}
                  onAuthorize={(text, type, direction) => {
                    if (type)
                      setSpaces((s) => ({
                        ...s,
                        [type]: Math.max(
                          0,
                          Math.min(
                            capacities[type],
                            s[type] + (direction === "Salida" ? 1 : -1),
                          ),
                        ),
                      }))
                    log(text)
                  }}
                />
              )}
              <div className="side-column">
                <Panel
                  title="Control de hardware"
                  subtitle="Acciones manuales simuladas"
                  icon="car"
                >
                  <div className="hardware-list">
                    {hardwareNames.map((name) => {
                      const open =
                        (emergency === "Evacuación" &&
                          name.includes("salida")) ||
                        (!emergency && hardware(name))
                      return (
                        <div className="device" key={name}>
                          <div>
                            <strong>{name}</strong>
                            <span className={open ? "green-text" : "muted"}>
                              {open ? "Abierto" : "Cerrado"}
                            </span>
                          </div>
                          <button
                            aria-label={`${open ? "Cerrar" : "Abrir"} ${name}`}
                            className={`switch ${open ? "on" : ""}`}
                            aria-pressed={open}
                            disabled={!!emergency}
                            onClick={() => {
                              setDevices((d) => ({
                                ...d,
                                [`${zone}-${name}`]: !open,
                              }))
                              log(
                                `Control manual: ${name} ${
                                  !open ? "abierto" : "cerrado"
                                }.`,
                              )
                            }}
                          >
                            <span />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <p className="panel-footnote">
                    Los controles manuales no registran entradas ni modifican el
                    aforo.
                  </p>
                </Panel>
                <Panel title="Protocolos de emergencia" icon="alert">
                  <div className="panel-body">
                    <label>
                      Tipo de emergencia
                      <select
                        value={protocol}
                        onChange={(e) => setProtocol(e.target.value)}
                        disabled={!!emergency}
                      >
                        <option>Disturbio</option>
                        <option>Sospecha de robo</option>
                        <option>Evacuación</option>
                      </select>
                    </label>
                    <p className="muted">
                      Activación y restablecimiento requieren dos
                      confirmaciones.
                    </p>
                    <button
                      className="outline full"
                      disabled={!!emergency}
                      onClick={() => setConfirm({ action: protocol, stage: 1 })}
                    >
                      Activar protocolo
                    </button>
                  </div>
                </Panel>
              </div>
            </div>
            {zone === "Estacionamiento" && (
              <Panel
                title="Disponibilidad de estacionamiento"
                subtitle="Lugares disponibles · Conteos independientes"
                icon="car"
              >
                <div className="capacity-grid">
                  {(Object.keys(spaces) as Vehicle[]).map((type) => (
                    <div className="capacity" key={type}>
                      <div>
                        <span>{type}</span>
                        <strong
                          className={spaces[type] === 0 ? "red-text" : ""}
                        >
                          {spaces[type]}
                          <small> / {capacities[type]}</small>
                        </strong>
                      </div>
                      <div className="progress">
                        <span
                          style={{
                            width: `${(spaces[type] / capacities[type]) * 100}%`,
                          }}
                        />
                      </div>
                      <p>
                        {spaces[type] === 0
                          ? "Sin lugares. Desviar al Edificio ZZ."
                          : "Lugares disponibles"}
                      </p>
                      <div className="capacity-actions">
                        <button
                          disabled={!!emergency || spaces[type] === 0}
                          onClick={() => {
                            setSpaces((s) => ({ ...s, [type]: 0 }))
                            log(
                              `Escenario simulado: ${type} sin lugares; desviar al Edificio ZZ.`,
                            )
                          }}
                        >
                          Simular lleno
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            <Panel title="Actividad reciente" subtitle="Trazabilidad del turno">
              <Activity entries={localEntries.slice(0, 5)} />
            </Panel>
          </>
        )}
        {tab === "Rondines" && (
          <div className="two-column">
            <Panel title="Tablet de rondines" subtitle="Lectura QR simulada">
              <div className="panel-body">
                <div className="tablet-screen">
                  <Icon />
                  <h3>{patrol ? "Rondín en curso" : "Listo para iniciar"}</h3>
                  <p>Verifica los puntos de control con tu tablet.</p>
                  <span>
                    {checks.length} / {route.length} puntos registrados
                  </span>
                </div>
                {!patrol ? (
                  <button
                    className="primary full"
                    onClick={() => {
                      setPatrol(true)
                      setChecks([])
                      setCheckpoint("")
                      log("Rondín iniciado con tablet QR.")
                    }}
                  >
                    Iniciar rondín
                  </button>
                ) : (
                  <>
                    <label>
                      QR del punto de control
                      <input
                        value={checkpoint}
                        onChange={(e) => setCheckpoint(e.target.value)}
                        placeholder="QR-BIBLIOTECA"
                      />
                    </label>
                    <div className="sample-buttons">
                      {routes[zone].map((c) => (
                        <button
                          key={c}
                          onClick={() => setCheckpoint(checkpointCode(c))}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <button
                      className="primary full"
                      onClick={() => {
                        const valid = route
                        if (!valid.includes(checkpoint)) {
                          setFeedback("QR de rondín no reconocido.")
                          return
                        }
                        if (checks.includes(checkpoint)) {
                          setFeedback("Este punto ya fue registrado.")
                          return
                        }
                        if (checkpoint !== route[checks.length]) {
                          setFeedback(
                            "Escanea el siguiente punto de la ruta asignada.",
                          )
                          return
                        }
                        setChecks((c) => [...c, checkpoint])
                        log(`Rondín: punto ${checkpoint} verificado.`)
                        setCheckpoint("")
                      }}
                    >
                      Escanear punto QR
                    </button>
                    <button
                      className="outline full"
                      disabled={checks.length !== route.length}
                      onClick={() => {
                        setPatrol(false)
                        log(
                          `Rondín finalizado: ${route.length} de ${route.length} puntos verificados.`,
                        )
                      }}
                    >
                      Finalizar rondín
                    </button>
                  </>
                )}
              </div>
            </Panel>
            <Panel
              title="Ruta de verificación"
              subtitle={`${route.length} puntos · ${zone}`}
            >
              <div className="panel-body">
                {route.map((c, i) => (
                  <div className="route-row" key={c}>
                    <span
                      className={`route-number ${
                        checks.includes(c) ? "checked" : ""
                      }`}
                    >
                      {checks.includes(c) ? "✓" : i + 1}
                    </span>
                    <div>
                      <strong>{c.replace("QR-", "").replace("-", " ")}</strong>
                      <p>
                        {checks.includes(c)
                          ? "Verificado y registrado en bitácora"
                          : "Pendiente de verificación"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
        <div className="bottom-console">
          <div>
            <>
              <Panel
                title="Reporte de turno"
                subtitle="Registro manual y dictado simulado"
                icon="mic"
              >
                <div className="panel-body">
                  <label>
                    Novedades del turno
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe una novedad, incidente o cambio de turno…"
                      rows={4}
                    />
                  </label>
                  <div className="button-row">
                    <button
                      className="outline"
                      aria-pressed={dictating}
                      onClick={() => setDictating(!dictating)}
                    >
                      <Icon kind="mic" />
                      {dictating ? "Detener dictado" : "Simular dictado"}
                    </button>
                    <button
                      className="primary"
                      disabled={!note.trim() || dictating}
                      onClick={() => {
                        log(`Reporte de turno: ${note.trim()}`)
                        setNote("")
                      }}
                    >
                      Guardar reporte
                    </button>
                  </div>
                  {dictating && (
                    <p role="status" className="green-text">
                      Generando transcripción de demostración…
                    </p>
                  )}
                  <p className="panel-footnote">
                    El dictado genera texto de ejemplo editable; no usa el
                    micrófono real.
                  </p>
                </div>
              </Panel>
              <Panel
                title="Bitácora del turno"
                subtitle={`${localEntries.length} eventos registrados · Se conserva al cambiar de pantalla`}
              >
                <Activity entries={localEntries} />
              </Panel>
            </>
          </div>
          <div>
            <Panel
              title="Coordinación intercasetas"
              subtitle="Mensajería local simulada · No envía mensajes reales"
            >
              <div className="panel-body">
                <label>
                  Caseta destinataria
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as Zone)}
                  >
                    {zones
                      .filter((z) => z !== zone)
                      .map((z) => (
                        <option key={z}>{z}</option>
                      ))}
                  </select>
                </label>
                <div className="chat-messages" aria-live="polite">
                  {chat.filter(
                    (c) =>
                      (c.from === zone && c.to === destination) ||
                      (c.from === destination && c.to === zone),
                  ).length === 0 && (
                    <div className="empty">
                      <Icon kind="person" />
                      <p>Inicia la coordinación con {destination}.</p>
                    </div>
                  )}
                  {chat
                    .filter(
                      (c) =>
                        (c.from === zone && c.to === destination) ||
                        (c.from === destination && c.to === zone),
                    )
                    .map((c, i) => (
                      <div
                        className={`chat-bubble ${
                          c.from === zone ? "sent" : ""
                        }`}
                        key={i}
                      >
                        <strong>
                          {c.from} · {c.time}
                        </strong>
                        <p>{c.text}</p>
                      </div>
                    ))}
                </div>
                <form
                  className="chat-compose"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!message.trim()) return
                    const text = message.trim()
                    setChat((c) => [
                      ...c,
                      { from: zone, to: destination, text, time: time() },
                    ])
                    setMessage("")
                    log(`Mensaje enviado a ${destination}: ${text}`)
                  }}
                >
                  <input
                    aria-label="Mensaje"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje a la caseta…"
                  />
                  <button className="primary" disabled={!message.trim()}>
                    Enviar
                  </button>
                </form>
                <button
                  className="outline"
                  onClick={() => {
                    setChat((c) => [
                      ...c,
                      {
                        from: destination,
                        to: zone,
                        text: "Recibido. Caseta en operación y pendiente de indicaciones.",
                        time: time(),
                      },
                    ])
                    log(`Respuesta simulada recibida de ${destination}.`)
                  }}
                >
                  Simular respuesta de caseta
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </main>
      <footer className="app-footer">
        Instituto Tecnológico de León{" "}
        <span>
          Prototipo simulado · Datos en memoria, se reinician al recargar
        </span>
      </footer>
      <dialog
        ref={dialogRef}
        className="confirmation-dialog"
        onCancel={() => setConfirm(null)}
      >
        {confirm && (
          <>
            <div className="modal-symbol">
              <Icon kind="alert" />
            </div>
            <div className="eyebrow">CONFIRMACIÓN {confirm.stage} DE 2</div>
            <h2>{confirm.action}</h2>
            <p>
              Únicamente caseta {zone}. Las otras casetas no se modificarán.
            </p>
            <p>
              {confirm.stage === 1
                ? "Confirma que deseas iniciar este protocolo. Aún no se aplicarán cambios."
                : "Confirmación final: esta acción cambiará el estado de los accesos y quedará registrada en bitácora."}
            </p>
            <div className="info-box">
              {confirm.action === "Restablecer operación"
                ? "Se desactivará la emergencia y todos los dispositivos quedarán cerrados."
                : confirm.action === "Evacuación"
                  ? "Se liberarán las salidas y se suspenderán las entradas."
                  : "Se bloquearán entradas y salidas mientras se coordina apoyo."}
            </div>
            <div className="button-row">
              <button className="outline" onClick={() => setConfirm(null)}>
                Cancelar
              </button>
              <button className="danger" onClick={applyConfirmation}>
                {confirm.stage === 1
                  ? "Continuar"
                  : "Confirmar definitivamente"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}
function Activity({ entries }: { entries: Entry[] }) {
  return (
    <div className="activity-list">
      {!entries.length && (
        <div className="empty">
          Sin eventos todavía. Las acciones del turno aparecerán aquí.
        </div>
      )}
      {entries.map((e) => (
        <div className="activity-row" key={e.id}>
          <time>{e.time}</time>
          <span className="event-dot" />
          <div>
            <p>{e.text}</p>
            <span>{e.zone} · Guardia demo</span>
          </div>
        </div>
      ))}
    </div>
  )
}
function AccessPanel({
  title,
  vehicle,
  emergency,
  highFlow,
  spaces,
  onAuthorize,
}: {
  title: string
  vehicle: boolean
  emergency: string
  highFlow: boolean
  spaces: Record<Vehicle, number>
  onAuthorize: (text: string, type?: Vehicle, direction?: string) => void
}) {
  const [qr, setQr] = useState("")
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [result, setResult] = useState("")
  const [reason, setReason] = useState("")
  const [type, setType] = useState<Vehicle>("Autos")
  const [direction, setDirection] = useState("Entrada")
  const [plate, setPlate] = useState("GTO-426-A")
  const [processed, setProcessed] = useState(false)
  function reset() {
    setCandidate(null)
    setResult("")
    setReason("")
    setProcessed(false)
  }
  function scan() {
    if (!qr.trim()) {
      setResult("Ingresa un QR para validar.")
      return
    }
    const person = people[qr.trim().toUpperCase()] || people["QR-DESCONOCIDO"]
    setCandidate(person)
    setProcessed(false)
    setReason("")
    const status = !person.known
      ? "Identidad desconocida. Acceso rechazado."
      : !person.pass
        ? "Pase no vigente. Acceso rechazado."
        : !person.schedule
          ? "Fuera del horario autorizado. Requiere motivo de excepción."
          : "Identidad y horario verificados. Listo para autorizar."
    setResult(status)
    onAuthorize(
      `Validación QR ${
        vehicle ? "vehicular" : "peatonal"
      }: ${person.name}. ${status}`,
    )
  }
  const blocked =
    !!emergency ||
    !candidate?.known ||
    !candidate?.pass ||
    (vehicle && type !== "Bicicletas" && !plate.trim()) ||
    (vehicle && direction === "Salida" && spaces[type] === capacities[type]) ||
    processed ||
    (vehicle && direction === "Entrada" && spaces[type] === 0) ||
    (!candidate?.schedule && !reason.trim())
  function authorize() {
    if (blocked || !candidate) return
    setProcessed(true)
    setResult(`${direction} autorizada y registrada.`)
    onAuthorize(
      `${direction} ${
        vehicle ? `vehicular (${type})` : "peatonal"
      } autorizada: ${candidate.name}.${
        vehicle
          ? ` QR: ${qr}. ${
              type === "Bicicletas"
                ? "Sin matrícula"
                : `Matrícula simulada: ${plate.trim().toUpperCase()}`
            }.`
          : ""
      }${
        !candidate.schedule
          ? ` Excepción fuera de horario. Motivo: ${reason.trim()}.`
          : " Identidad y horario válidos."
      }`,
      vehicle ? type : undefined,
      direction,
    )
  }
  return (
    <Panel
      title={title}
      subtitle={
        vehicle
          ? "QR + matrícula simulada · Bicicletas solo QR"
          : "Torniquetes · Identidad y horario"
      }
      icon={vehicle ? "car" : "person"}
    >
      <div className="panel-body">
        <div className="scanner">
          <div className="scanner-corners">
            <Icon />
          </div>
          <div>
            <span className="live-label">LECTOR QR SIMULADO</span>
            <h3>Validar credencial</h3>
            <p>
              {highFlow
                ? "Alto Flujo activo · Validación completa"
                : "Selecciona un escenario o ingresa un código"}
            </p>
          </div>
        </div>
        <div className="segmented">
          {["Entrada", "Salida"].map((d) => (
            <button
              className={direction === d ? "selected" : ""}
              key={d}
              onClick={() => {
                setDirection(d)
                reset()
              }}
            >
              {d}
            </button>
          ))}
        </div>
        {vehicle && (
          <label>
            Tipo de vehículo
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as Vehicle)
                reset()
              }}
            >
              <option>Autos</option>
              <option>Motos</option>
              <option>Bicicletas</option>
            </select>
          </label>
        )}
        {vehicle && type !== "Bicicletas" && (
          <label>
            Matrícula simulada
            <input
              value={plate}
              onChange={(e) => {
                setPlate(e.target.value)
                reset()
              }}
              placeholder="GTO-426-A"
              disabled={!!emergency}
            />
          </label>
        )}
        <label>
          Código QR
          <input
            value={qr}
            onChange={(e) => {
              setQr(e.target.value)
              reset()
            }}
            placeholder="QR-21310234"
            disabled={!!emergency}
          />
        </label>
        <div className="sample-buttons">
          <button
            disabled={!!emergency}
            onClick={() => {
              setQr("QR-21310234")
              reset()
            }}
          >
            Válido
          </button>
          <button
            disabled={!!emergency}
            onClick={() => {
              setQr("QR-21310567")
              reset()
            }}
          >
            Fuera de horario
          </button>
          <button
            disabled={!!emergency}
            onClick={() => {
              setQr("QR-SIN-PASE")
              reset()
            }}
          >
            Sin pase
          </button>
          <button
            disabled={!!emergency}
            onClick={() => {
              setQr("QR-DESCONOCIDO")
              reset()
            }}
          >
            Desconocido
          </button>
        </div>
        <button className="outline full" disabled={!!emergency} onClick={scan}>
          <Icon /> Simular lectura QR
        </button>
        {candidate && (
          <div className="identity">
            <span className="avatar">
              {candidate.known
                ? candidate.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                : "?"}
            </span>
            <div>
              <strong>{candidate.name}</strong>
              <span>{candidate.control}</span>
              <p>
                {candidate.known
                  ? "Identidad verificada"
                  : "Sin identidad válida"}{" "}
                ·{" "}
                {candidate.schedule
                  ? "Horario válido"
                  : "Horario no autorizado"}
              </p>
            </div>
          </div>
        )}
        {result && (
          <div
            className={`validation ${
              (candidate?.known && candidate.schedule) || processed
                ? "success"
                : "warning"
            }`}
            role="status"
          >
            {result}
          </div>
        )}
        {candidate?.known &&
          candidate.pass &&
          !candidate.schedule &&
          !processed && (
            <label>
              Motivo obligatorio de excepción
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe por qué se autoriza fuera de horario"
              />
            </label>
          )}
        {vehicle && direction === "Entrada" && spaces[type] === 0 && (
          <div className="validation warning">
            Sin lugares para {type.toLowerCase()}. Desviar al Edificio ZZ.
          </div>
        )}
        {vehicle &&
          direction === "Salida" &&
          spaces[type] === capacities[type] && (
            <p className="validation warning">
              No hay vehículos registrados de este tipo para salir.
            </p>
          )}
        <button className="primary full" disabled={blocked} onClick={authorize}>
          {processed
            ? "Movimiento registrado"
            : `Autorizar ${direction.toLowerCase()}`}
        </button>
        <p className="panel-footnote">
          {emergency
            ? "Validaciones suspendidas por emergencia."
            : "No se abre hardware real. Cada autorización registra un único movimiento."}
        </p>
      </div>
    </Panel>
  )
}
