import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  bureaus as defaultBureaus,
  categories,
  classifyComplaint,
  createSeedData,
  makeActivity,
  statuses,
  suggestPriority,
} from "./data"
import type {
  AppData,
  Attachment,
  Complaint,
  Priority,
  Role,
  Status,
  User,
} from "./types"

const STORAGE_KEY = "aicte-scm-data-v1"
const SESSION_KEY = "aicte-scm-session-v1"
const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—"
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    /* restore the seed below */
  }
  const seed = createSeedData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function Icon({ name, size = 20 }: { name: string size?: number }) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="M3 11 12 3l9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    file: (
      <>
        <path d="M6 2h9l4 4v16H6z" />
        <path d="M14 2v5h5M9 12h6M9 16h6" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    upload: (
      <>
        <path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H3v-3.6h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8V3h3.6v.2A2 2 0 0 0 15 5a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 0 1.8 1.2h.2v3.6h-.2A2 2 0 0 0 19.4 15Z" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name] ?? paths.file}
    </svg>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <div className="brand-mark">
        <span>अ</span>
      </div>
      {!compact && (
        <div>
          <strong>AICTE</strong>
          <small>Smart Complaint Monitoring</small>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const kind =
    status.includes("Resolved") || status === "User Feedback Submitted"
      ? "success"
      : status.includes("Returned") || status.includes("Rejected")
        ? "danger"
        : status.includes("Verification")
          ? "violet"
          : status === "Submitted" || status.includes("Review")
            ? "warning"
            : "info"
  return (
    <span className={`badge badge-${kind}`}>
      <span />
      {status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  )
}

function Empty({ title, text }: { title: string text: string }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name="file" size={28} />
      </div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem(SESSION_KEY) || "",
  )
  const [auth, setAuth] = useState<{
    role: Role
    mode: "login" | "register"
  } | null>(null)
  const [toast, setToast] = useState("")
  const currentUser = data.users.find((user) => user.id === sessionId)

  useEffect(
    () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)),
    [data],
  )
  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId)
    else localStorage.removeItem(SESSION_KEY)
  }, [sessionId])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(""), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const update = (fn: (draft: AppData) => AppData, message?: string) => {
    setData((current) => fn(structuredClone(current)))
    if (message) setToast(message)
  }

  const login = (email: string, password: string, role: Role) => {
    const user = data.users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password &&
        item.role === role,
    )
    if (!user) return "Email, password or selected role is incorrect."
    if (user.accountStatus !== "active")
      return user.accountStatus === "pending"
        ? "Your officer account is awaiting administrator approval."
        : "This account is not active."
    setSessionId(user.id)
    setAuth(null)
    setToast(`Welcome back, ${user.fullName.split(" ")[0]}.`)
    return ""
  }

  const logout = () => {
    setSessionId("")
    setToast("You have been signed out securely.")
  }
  const reset = () => {
    if (
      !window.confirm(
        "Reset all local demo accounts, complaints and activity to the original seed data?",
      )
    )
      return
    const seed = createSeedData()
    setData(seed)
    setSessionId("")
    setToast("Demo data has been reset.")
  }

  return (
    <>
      {currentUser ? (
        <Portal
          user={currentUser}
          data={data}
          update={update}
          logout={logout}
          reset={reset}
        />
      ) : auth ? (
        <AuthScreen
          config={auth}
          data={data}
          onBack={() => setAuth(null)}
          login={login}
          update={update}
        />
      ) : (
        <Landing
          onAuth={(role, mode) => setAuth({ role, mode })}
          reset={reset}
        />
      )}
      {toast && (
        <div className="toast">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
    </>
  )
}

function Landing({
  onAuth,
  reset,
}: {
  onAuth: (role: Role, mode: "login" | "register") => void
  reset: () => void
}) {
  const roles: {
    role: Role
    label: string
    eyebrow: string
    description: string
    icon: string
    tone: string
  }[] = [
    {
      role: "user",
      label: "Complainant / User",
      eyebrow: "For citizens & students",
      description:
        "Submit a grievance, track every update and review the verified resolution.",
      icon: "users",
      tone: "blue",
    },
    {
      role: "admin",
      label: "AICTE Administrator",
      eyebrow: "Central oversight",
      description:
        "Route cases, monitor deadlines, manage officers and verify final resolutions.",
      icon: "shield",
      tone: "navy",
    },
    {
      role: "officer",
      label: "Bureau / Cell Officer",
      eyebrow: "Investigation workspace",
      description:
        "Investigate assigned cases, document action and submit evidence for review.",
      icon: "briefcase",
      tone: "teal",
    },
  ]
  return (
    <div className="landing">
      <header className="public-header">
        <Brand />
        <div className="header-actions">
          <span className="demo-pill">SIH 2026 DEMO</span>
          <button className="text-btn" onClick={reset}>
            Reset demo data
          </button>
        </div>
      </header>
      <main className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span />
            Smart India Hackathon 2026 · PS2
          </div>
          <h1>
            Every complaint.
            <br />
            <em>Accountably resolved.</em>
          </h1>
          <p>
            A transparent, accountable and efficient platform for grievance
            monitoring and resolution across AICTE bureaus and cells.
          </p>
          <div className="trust-row">
            <span>
              <Icon name="shield" size={17} /> Role-protected access
            </span>
            <span>
              <Icon name="clock" size={17} /> Live case timelines
            </span>
            <span>
              <Icon name="chart" size={17} /> Data-led oversight
            </span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-head">
            <span>Choose your secure workspace</span>
            <small>Local demonstration environment</small>
          </div>
          <div className="role-grid">
            {roles.map((item) => (
              <article className="role-card" key={item.role}>
                <div className={`role-icon ${item.tone}`}>
                  <Icon name={item.icon} size={25} />
                </div>
                <div className="role-content">
                  <small>{item.eyebrow}</small>
                  <h2>{item.label}</h2>
                  <p>{item.description}</p>
                </div>
                <div className="role-actions">
                  <button
                    className="btn primary"
                    onClick={() => onAuth(item.role, "login")}
                  >
                    Login <Icon name="arrow" size={16} />
                  </button>
                  {item.role !== "admin" && (
                    <button
                      className="btn ghost"
                      onClick={() => onAuth(item.role, "register")}
                    >
                      Register
                    </button>
                  )}
                  {item.role === "admin" && (
                    <span className="invite-note">
                      New admins are invitation-only
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <section className="process-strip">
        <div>
          <b>01</b>
          <span>
            <strong>Register securely</strong>
            <small>Role-specific onboarding</small>
          </span>
        </div>
        <i />
        <div>
          <b>02</b>
          <span>
            <strong>Track every action</strong>
            <small>Auditable case history</small>
          </span>
        </div>
        <i />
        <div>
          <b>03</b>
          <span>
            <strong>Verify the outcome</strong>
            <small>AICTE-controlled closure</small>
          </span>
        </div>
      </section>
      <footer className="public-footer">
        <p>
          <strong>Functional SIH demonstration prototype.</strong>{" "}
          Authentication and records are stored locally in this browser for
          evaluation only.
        </p>
        <p>
          Production deployment requires a secure backend, hashed credentials,
          server sessions and server-side authorization.
        </p>
      </footer>
    </div>
  )
}

function AuthScreen({
  config,
  data,
  onBack,
  login,
  update,
}: {
  config: { role: Role mode: "login" | "register" }
  data: AppData
  onBack: () => void
  login: (email: string, pass: string, role: Role) => string
  update: (fn: (d: AppData) => AppData, msg?: string) => void
}) {
  const demo =
    config.role === "admin"
      ? ["admin@aicte.demo", "Admin@123"]
      : config.role === "officer"
        ? ["ananya.rao@aicte.demo", "Officer@123"]
        : ["citizen@demo.in", "Demo@123"]
  const [mode, setMode] = useState(config.mode)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    institution: "",
    state: "",
    designation: "",
    bureauId: "",
  })
  const roleLabel =
    config.role === "admin"
      ? "AICTE Administrator"
      : config.role === "officer"
        ? "Bureau / Cell Officer"
        : "Complainant / User"
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (mode === "login") {
      setError(login(form.email, form.password, config.role))
      return
    }
    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirm
    )
      return setError("Complete all required fields.")
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return setError("Enter a valid email address.")
    if (!/^\d{10,12}$/.test(form.phone))
      return setError("Enter a valid 10–12 digit mobile number.")
    if (form.password.length < 8)
      return setError("Password must contain at least 8 characters.")
    if (form.password !== form.confirm)
      return setError("Passwords do not match.")
    if (
      data.users.some(
        (user) => user.email.toLowerCase() === form.email.toLowerCase(),
      )
    )
      return setError("An account with this email already exists.")
    const pending = config.role === "officer"
    update(
      (draft) => {
        draft.users.push({
          id: uid(),
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: config.role,
          accountStatus: pending ? "pending" : "active",
          institution: form.institution,
          state: form.state,
          designation: form.designation,
          bureauId: form.bureauId || undefined,
          createdAt: now(),
        })
        return draft
      },
      pending
        ? "Registration submitted for administrator approval."
        : "Account created. You can now sign in.",
    )
    setMode("login")
    setForm((value) => ({ ...value, password: "", confirm: "" }))
  }
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Brand />
        <div className="auth-message">
          <span className="section-kicker">SECURE ROLE ACCESS</span>
          <h1>{roleLabel}</h1>
          <p>
            {config.role === "user"
              ? "Submit and track your own grievances with a clear, verified resolution trail."
              : config.role === "admin"
                ? "Monitor every case, deadline and verification decision from one command centre."
                : "Work only on cases assigned to your authorized bureau."}
          </p>
        </div>
        <div className="security-note">
          <Icon name="shield" />
          <div>
            <strong>Demonstration security</strong>
            <p>
              Local browser storage is used only for this SIH prototype. No
              credentials are transmitted.
            </p>
          </div>
        </div>
      </aside>
      <main className="auth-main">
        <button className="back-btn" onClick={onBack}>
          ← Back to role selection
        </button>
        <form className="auth-form" onSubmit={submit}>
          <div className="form-heading">
            <span>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </span>
            <h2>
              {mode === "login"
                ? `Sign in as ${roleLabel}`
                : `${roleLabel} registration`}
            </h2>
            <p>
              {mode === "login"
                ? "Enter your credentials to continue."
                : "Fields marked with * are required."}
            </p>
          </div>
          {mode === "register" && (
            <div className="form-grid">
              <Field label="Full name *">
                <input
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
              </Field>
              <Field
                label={
                  config.role === "officer"
                    ? "Official email *"
                    : "Email address *"
                }
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Mobile number *">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              {config.role === "user" ? (
                <>
                  <Field label="Institution (optional)">
                    <input
                      value={form.institution}
                      onChange={(e) =>
                        setForm({ ...form, institution: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Institution state">
                    <input
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Designation *">
                    <input
                      value={form.designation}
                      onChange={(e) =>
                        setForm({ ...form, designation: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Requested bureau">
                    <select
                      value={form.bureauId}
                      onChange={(e) =>
                        setForm({ ...form, bureauId: e.target.value })
                      }
                    >
                      <option value="">Select bureau</option>
                      {defaultBureaus.map((b) => (
                        <option value={b.id} key={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}
            </div>
          )}
          {mode === "login" && (
            <Field label="Email address">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
          )}
          <div className={mode === "register" ? "form-grid" : ""}>
            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
            {mode === "register" && (
              <Field label="Confirm password *">
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                />
              </Field>
            )}
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn primary wide" type="submit">
            {mode === "login"
              ? "Sign in securely"
              : config.role === "officer"
                ? "Submit for approval"
                : "Create account"}{" "}
            <Icon name="arrow" size={17} />
          </button>
          {config.role !== "admin" && (
            <p className="switch-auth">
              {mode === "login" ? "Need an account?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login")
                  setError("")
                }}
              >
                {mode === "login" ? "Register here" : "Sign in"}
              </button>
            </p>
          )}
          {mode === "login" && (
            <div className="demo-box">
              <div>
                <strong>Demo account</strong>
                <small>Preconfigured for evaluation</small>
              </div>
              <code>{demo[0]}</code>
              <code>{demo[1]}</code>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, email: demo[0], password: demo[1] })
                }
              >
                Use credentials
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

type Update = (fn: (d: AppData) => AppData, msg?: string) => void

const navByRole: Record<Role, { id: string label: string icon: string }[]> = {
  user: [
    { id: "overview", label: "My Dashboard", icon: "home" },
    { id: "submit", label: "Submit Complaint", icon: "plus" },
    { id: "complaints", label: "My Complaints", icon: "file" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "profile", label: "My Profile", icon: "users" },
    { id: "help", label: "Help / Guidelines", icon: "shield" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "complaints", label: "All Complaints", icon: "file" },
    { id: "assignment", label: "Assignment & Routing", icon: "briefcase" },
    { id: "bureaus", label: "Bureau Management", icon: "home" },
    { id: "officers", label: "Officer Management", icon: "users" },
    { id: "verification", label: "Verification Queue", icon: "check" },
    { id: "escalations", label: "Escalations & Deadlines", icon: "clock" },
    { id: "reports", label: "Reports & Analytics", icon: "chart" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "settings", label: "Settings", icon: "settings" },
  ],
  officer: [
    { id: "overview", label: "My Dashboard", icon: "home" },
    { id: "complaints", label: "Assigned Complaints", icon: "file" },
    { id: "workspace", label: "Investigation Workspace", icon: "briefcase" },
    { id: "evidence", label: "Evidence Upload", icon: "upload" },
    { id: "returned", label: "Returned Cases", icon: "clock" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "profile", label: "My Profile", icon: "users" },
  ],
}

function Portal({
  user,
  data,
  update,
  logout,
  reset,
}: {
  user: User
  data: AppData
  update: Update
  logout: () => void
  reset: () => void
}) {
  const [page, setPage] = useState("overview")
  const [selectedId, setSelectedId] = useState<string>()
  const [mobileNav, setMobileNav] = useState(false)
  const notifications = data.notifications.filter(
    (note) => note.recipientId === user.id && !note.read,
  ).length
  const title =
    navByRole[user.role].find((item) => item.id === page)?.label ??
    "Case Details"
  const navigate = (id: string) => {
    setPage(id)
    setSelectedId(undefined)
    setMobileNav(false)
  }
  return (
    <div className="portal">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="side-brand">
          <Brand />
          <button onClick={() => setMobileNav(false)}>
            <Icon name="close" />
          </button>
        </div>
        <div className="role-label">
          {user.role === "admin"
            ? "ADMIN COMMAND CENTRE"
            : user.role === "officer"
              ? "BUREAU WORKSPACE"
              : "CITIZEN PORTAL"}
        </div>
        <nav>
          {navByRole[user.role].map((item) => (
            <button
              className={page === item.id ? "active" : ""}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === "notifications" && notifications > 0 && (
                <b>{notifications}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="side-footer">
          <div className="user-mini">
            <span>
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <strong>{user.fullName}</strong>
              <small>
                {user.designation ||
                  (user.role === "user" ? "Complainant" : user.role)}
              </small>
            </div>
          </div>
          <button className="logout" onClick={logout}>
            <Icon name="logout" size={18} /> Logout
          </button>
        </div>
      </aside>
      {mobileNav && (
        <div className="scrim" onClick={() => setMobileNav(false)} />
      )}
      <main className="portal-main">
        <header className="topbar">
          <div>
            <button className="menu-btn" onClick={() => setMobileNav(true)}>
              <Icon name="menu" />
            </button>
            <div>
              <span>
                {user.role === "admin"
                  ? "Central oversight"
                  : user.role === "officer"
                    ? data.bureaus.find((b) => b.id === user.bureauId)?.name
                    : "Complaint services"}
              </span>
              <h1>{selectedId ? selectedId : title}</h1>
            </div>
          </div>
          <div className="top-actions">
            <span className="demo-pill">DEMO MODE</span>
            <button
              className="notification-btn"
              onClick={() => navigate("notifications")}
            >
              <Icon name="bell" />
              {notifications > 0 && <b>{notifications}</b>}
            </button>
          </div>
        </header>
        <div className="content">
          {user.role === "user" && (
            <UserPages
              page={page}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              setPage={setPage}
              user={user}
              data={data}
              update={update}
            />
          )}
          {user.role === "admin" && (
            <AdminPages
              page={page}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              setPage={setPage}
              user={user}
              data={data}
              update={update}
              reset={reset}
            />
          )}
          {user.role === "officer" && (
            <OfficerPages
              page={page}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              setPage={setPage}
              user={user}
              data={data}
              update={update}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function PageIntro({
  kicker,
  title,
  text,
  action,
}: {
  kicker?: string
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="page-intro">
      <div>
        {kicker && <span>{kicker}</span>}
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {action}
    </div>
  )
}

function Metric({
  label,
  value,
  icon,
  tone = "blue",
  note,
}: {
  label: string
  value: number | string
  icon: string
  tone?: string
  note?: string
}) {
  return (
    <article className="metric">
      <div className={`metric-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        {note && <span>{note}</span>}
      </div>
    </article>
  )
}

function UserPages({
  page,
  selectedId,
  setSelectedId,
  setPage,
  user,
  data,
  update,
}: {
  page: string
  selectedId?: string
  setSelectedId: (id?: string) => void
  setPage: (p: string) => void
  user: User
  data: AppData
  update: Update
}) {
  const mine = data.complaints.filter((c) => c.complainantId === user.id)
  const selected = mine.find((c) => c.id === selectedId)
  if (selected)
    return (
      <ComplaintDetail
        complaint={selected}
        user={user}
        data={data}
        update={update}
        onBack={() => setSelectedId(undefined)}
      />
    )
  if (page === "submit")
    return (
      <SubmitComplaint
        user={user}
        data={data}
        update={update}
        onDone={(id) => {
          setPage("complaints")
          setSelectedId(id)
        }}
      />
    )
  if (page === "complaints")
    return (
      <ComplaintList
        complaints={mine}
        data={data}
        onOpen={setSelectedId}
        title="My complaints"
        text="Search and track every grievance you have submitted."
      />
    )
  if (page === "notifications")
    return (
      <Notifications
        user={user}
        data={data}
        update={update}
        onOpen={(id) => {
          if (mine.some((c) => c.id === id)) setSelectedId(id)
        }}
      />
    )
  if (page === "profile") return <Profile user={user} data={data} />
  if (page === "help") return <Help />
  const counts = {
    pending: mine.filter((c) =>
      ["Submitted", "Under Admin Review", "Assigned"].includes(c.status),
    ).length,
    progress: mine.filter((c) =>
      ["In Progress", "Returned for Further Action"].includes(c.status),
    ).length,
    verification: mine.filter((c) => c.status === "Awaiting AICTE Verification")
      .length,
    resolved: mine.filter((c) =>
      ["Resolved", "User Feedback Submitted"].includes(c.status),
    ).length,
  }
  return (
    <>
      <PageIntro
        kicker="CITIZEN DASHBOARD"
        title={`Namaste, ${user.fullName.split(" ")[0]}`}
        text="Track your grievances and stay informed at every step."
        action={
          <button className="btn primary" onClick={() => setPage("submit")}>
            <Icon name="plus" size={17} /> Submit a complaint
          </button>
        }
      />
      <div className="metric-grid five">
        <Metric label="Total complaints" value={mine.length} icon="file" />
        <Metric
          label="Pending review"
          value={counts.pending}
          icon="clock"
          tone="amber"
        />
        <Metric
          label="In progress"
          value={counts.progress}
          icon="briefcase"
          tone="teal"
        />
        <Metric
          label="Awaiting verification"
          value={counts.verification}
          icon="shield"
          tone="violet"
        />
        <Metric
          label="Resolved"
          value={counts.resolved}
          icon="check"
          tone="green"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>RECENT ACTIVITY</span>
              <h3>Your complaint journey</h3>
            </div>
            <button className="text-btn" onClick={() => setPage("complaints")}>
              View all
            </button>
          </div>
          {mine.length ? (
            <div className="case-list">
              {mine.slice(0, 4).map((c) => (
                <button
                  className="case-row"
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="case-symbol">{c.id.slice(-2)}</div>
                  <div>
                    <strong>{c.subject}</strong>
                    <small>
                      {c.id} · Updated {date(c.updatedAt)}
                    </small>
                  </div>
                  <StatusBadge status={c.status} />
                  <Icon name="arrow" size={17} />
                </button>
              ))}
            </div>
          ) : (
            <Empty
              title="No complaints yet"
              text="Submit your first grievance to begin tracking."
            />
          )}
        </section>
        <aside className="panel guide-panel">
          <div className="panel-head">
            <div>
              <span>HOW IT WORKS</span>
              <h3>Clear path to resolution</h3>
            </div>
          </div>
          {[
            "Submit with supporting information",
            "AICTE reviews and assigns the right bureau",
            "Officer investigates and uploads evidence",
            "AICTE verifies before final resolution",
          ].map((x, i) => (
            <div className="guide-step" key={x}>
              <b>{i + 1}</b>
              <span>{x}</span>
            </div>
          ))}
        </aside>
      </div>
    </>
  )
}

function SubmitComplaint({
  user,
  data,
  update,
  onDone,
}: {
  user: User
  data: AppData
  update: Update
  onDone: (id: string) => void
}) {
  const [form, setForm] = useState({
    subject: "",
    category: "",
    description: "",
    institution: user.institution || "",
    location: user.state || "",
    bureauId: "",
    incidentDate: "",
    declaration: false,
  })
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const ai = classifyComplaint(`${form.subject} ${form.description}`)
  const priority = suggestPriority(`${form.subject} ${form.description}`)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (
      !form.subject ||
      !form.category ||
      form.description.length < 30 ||
      !form.institution ||
      !form.location ||
      !form.declaration
    )
      return setError(
        "Complete all required fields, add at least 30 description characters and accept the declaration.",
      )
    const next =
      Math.max(
        0,
        ...data.complaints.map((c) => Number(c.id.split("-").pop())),
      ) + 1
    const complaintId = `CMP-2026-${String(next).padStart(4, "0")}`
    const attachments: Attachment[] = files.map((file) => ({
      id: uid(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedBy: user.id,
      uploadedAt: now(),
      visibility: "public",
    }))
    const complaint: Complaint = {
      id: complaintId,
      complainantId: user.id,
      subject: form.subject,
      description: form.description,
      category: form.category,
      institution: form.institution,
      location: form.location,
      incidentDate: form.incidentDate,
      supportingAttachments: attachments,
      priority: priority.priority,
      suggestedBureauId: form.bureauId || ai.bureauId,
      status: "Submitted",
      createdAt: now(),
      updatedAt: now(),
      summary: form.description.split(/[.!?]/)[0].slice(0, 160),
      activities: [
        makeActivity(
          user.id,
          "user",
          "Complaint submitted",
          "Submitted",
          "Complaint registered successfully.",
        ),
      ],
      assignments: [],
      reports: [],
      verifications: [],
    }
    update((draft) => {
      draft.complaints.unshift(complaint)
      draft.notifications.push({
        id: uid(),
        recipientId: user.id,
        complaintId,
        message: `Complaint ${complaintId} was submitted successfully.`,
        timestamp: now(),
        read: false,
      })
      draft.users
        .filter((u) => u.role === "admin" && u.accountStatus === "active")
        .forEach((admin) =>
          draft.notifications.push({
            id: uid(),
            recipientId: admin.id,
            complaintId,
            message: `New complaint ${complaintId} requires review.`,
            timestamp: now(),
            read: false,
          }),
        )
      return draft
    }, `Complaint ${complaintId} submitted successfully.`)
    onDone(complaintId)
  }
  const fileChange = (list: FileList | null) => {
    if (!list) return
    const accepted = Array.from(list).filter(
      (file) =>
        ["application/pdf", "image/jpeg", "image/png"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024,
    )
    if (accepted.length !== list.length)
      setError(
        "Some files were rejected. Use PDF, JPG or PNG files up to 5 MB.",
      )
    setFiles((current) => [...current, ...accepted].slice(0, 5))
  }
  return (
    <>
      <PageIntro
        kicker="NEW GRIEVANCE"
        title="Submit a complaint"
        text="Provide clear, accurate details to help AICTE route and review your case efficiently."
      />
      <form className="form-panel" onSubmit={submit}>
        <div className="form-section">
          <div className="section-number">01</div>
          <div className="section-fields">
            <h3>Complaint details</h3>
            <div className="form-grid">
              <Field label="Complaint subject *">
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="Briefly describe the issue"
                />
              </Field>
              <Field label="Category *">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Detailed description *"
                hint={`${form.description.length} characters`}
              >
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Explain what happened, steps already taken and the outcome you expect."
                />
              </Field>
              {form.description.length > 20 && (
                <div className="ai-card">
                  <span>RULE-BASED ASSISTANCE</span>
                  <strong>Suggested: {ai.category}</strong>
                  <p>{ai.reason}</p>
                  <strong>Priority: {priority.priority}</strong>
                  <p>{priority.reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="form-section">
          <div className="section-number">02</div>
          <div className="section-fields">
            <h3>Institution & incident</h3>
            <div className="form-grid">
              <Field label="Institution name *">
                <input
                  value={form.institution}
                  onChange={(e) =>
                    setForm({ ...form, institution: e.target.value })
                  }
                />
              </Field>
              <Field label="State / location *">
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </Field>
              <Field label="Relevant bureau (optional)">
                <select
                  value={form.bureauId}
                  onChange={(e) =>
                    setForm({ ...form, bureauId: e.target.value })
                  }
                >
                  <option value="">Let AICTE decide</option>
                  {data.bureaus.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Incident date (optional)">
                <input
                  type="date"
                  value={form.incidentDate}
                  onChange={(e) =>
                    setForm({ ...form, incidentDate: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </div>
        <div className="form-section">
          <div className="section-number">03</div>
          <div className="section-fields">
            <h3>Supporting evidence</h3>
            <label className="upload-zone">
              <Icon name="upload" size={26} />
              <strong>Choose supporting files</strong>
              <span>PDF, JPG or PNG · Max 5 MB each · Up to 5 files</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => fileChange(e.target.files)}
              />
            </label>
            {files.map((file) => (
              <div className="file-row" key={file.name}>
                <Icon name="file" />
                <span>
                  <strong>{file.name}</strong>
                  <small>{(file.size / 1024).toFixed(0)} KB</small>
                </span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((f) => f !== file))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <label className="declaration">
          <input
            type="checkbox"
            checked={form.declaration}
            onChange={(e) =>
              setForm({ ...form, declaration: e.target.checked })
            }
          />
          <span>
            I declare that the information submitted is accurate to the best of
            my knowledge. *
          </span>
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button className="btn primary" type="submit">
            Submit complaint <Icon name="arrow" size={17} />
          </button>
        </div>
      </form>
    </>
  )
}

function ComplaintList({
  complaints,
  data,
  onOpen,
  title,
  text,
}: {
  complaints: Complaint[]
  data: AppData
  onOpen: (id: string) => void
  title: string
  text: string
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [category, setCategory] = useState("")
  const filtered = complaints.filter(
    (c) =>
      `${c.id} ${c.subject} ${c.institution}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || c.status === status) &&
      (!category || c.category === category),
  )
  return (
    <>
      <PageIntro kicker="CASE REGISTER" title={title} text={text} />
      <section className="panel table-panel">
        <div className="filters">
          <div className="search">
            <Icon name="search" size={18} />
            <input
              placeholder="Search ID, subject or institution"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Complaint</th>
                <th>Category / Institution</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Assignment</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <button className="table-link" onClick={() => onOpen(c.id)}>
                      {c.subject}
                      <small>{c.id}</small>
                    </button>
                  </td>
                  <td>
                    {c.category}
                    <small>{c.institution}</small>
                  </td>
                  <td>{date(c.createdAt)}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    {data.bureaus.find((b) => b.id === c.assignedBureauId)
                      ?.name || "Not assigned"}
                  </td>
                  <td>{date(c.updatedAt)}</td>
                  <td>
                    <button
                      className="icon-action"
                      onClick={() => onOpen(c.id)}
                    >
                      <Icon name="arrow" size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <Empty
            title="No matching complaints"
            text="Try changing the search or filters."
          />
        )}
        <div className="table-foot">
          Showing {filtered.length} of {complaints.length} records
        </div>
      </section>
    </>
  )
}

function ComplaintDetail({
  complaint,
  user,
  data,
  update,
  onBack,
}: {
  complaint: Complaint
  user: User
  data: AppData
  update: Update
  onBack: () => void
}) {
  const bureau = data.bureaus.find((b) => b.id === complaint.assignedBureauId)
  const officer = data.users.find((u) => u.id === complaint.assignedOfficerId)
  return (
    <>
      <button className="back-link" onClick={onBack}>
        ← Back to complaints
      </button>
      <div className="detail-head">
        <div>
          <div className="detail-meta">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <h2>{complaint.subject}</h2>
          <p>
            {complaint.id} · Submitted {date(complaint.createdAt)}
          </p>
        </div>
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel detail-section">
            <div className="panel-head">
              <div>
                <span>COMPLAINT</span>
                <h3>Submitted information</h3>
              </div>
            </div>
            <p className="long-copy">{complaint.description}</p>
            <div className="info-grid">
              <Info label="Category" value={complaint.category} />
              <Info label="Institution" value={complaint.institution} />
              <Info label="State / location" value={complaint.location} />
              <Info
                label="Incident date"
                value={date(complaint.incidentDate)}
              />
            </div>
            {complaint.supportingAttachments.length > 0 && (
              <Files files={complaint.supportingAttachments} />
            )}
          </section>
          {complaint.verifiedResolution && (
            <section className="panel resolution-box">
              <div className="resolution-icon">
                <Icon name="check" size={25} />
              </div>
              <div>
                <span>AICTE VERIFIED RESOLUTION</span>
                <h3>Resolution approved on {date(complaint.verifiedAt)}</h3>
                <p>{complaint.verifiedResolution}</p>
                {complaint.reports
                  .at(-1)
                  ?.evidence.filter((e) => e.visibility === "public").length ? (
                  <Files
                    files={complaint.reports
                      .at(-1)!
                      .evidence.filter((e) => e.visibility === "public")}
                  />
                ) : null}
              </div>
            </section>
          )}
          {["Resolved", "User Feedback Submitted"].includes(complaint.status) &&
            user.role === "user" && (
              <FeedbackForm complaint={complaint} user={user} update={update} />
            )}
          {user.role !== "user" && (
            <InternalCaseActions
              complaint={complaint}
              user={user}
              data={data}
              update={update}
            />
          )}
        </div>
        <aside className="detail-side">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span>CASE ROUTING</span>
                <h3>Assignment</h3>
              </div>
            </div>
            <Info
              label="Assigned bureau"
              value={bureau?.name || "Awaiting assignment"}
            />
            {user.role !== "user" && (
              <Info
                label="Assigned officer"
                value={officer?.fullName || "Not assigned"}
              />
            )}
            <Info label="Priority" value={complaint.priority} />
            <Info label="Deadline" value={date(complaint.deadline)} />
          </section>
          <section className="panel">
            <div className="panel-head">
              <div>
                <span>LIVE HISTORY</span>
                <h3>Complaint timeline</h3>
              </div>
            </div>
            <Timeline
              activities={complaint.activities.filter(
                (a) => user.role !== "user" || a.visibility === "public",
              )}
            />
          </section>
        </aside>
      </div>
    </>
  )
}

function Info({ label, value }: { label: string value: string }) {
  return (
    <div className="info">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}
function Files({ files }: { files: Attachment[] }) {
  return (
    <div className="files">
      {files.map((file) => (
        <div className="file-row" key={file.id}>
          <Icon name="file" />
          <span>
            <strong>{file.fileName}</strong>
            <small>
              {(file.fileSize / 1024).toFixed(0)} KB ·{" "}
              {file.fileType.split("/").pop()?.toUpperCase()}
            </small>
          </span>
          {file.verificationStatus && (
            <span className={`mini-state ${file.verificationStatus}`}>
              {file.verificationStatus}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
function Timeline({ activities }: { activities: Complaint["activities"] }) {
  return (
    <div className="timeline">
      {[...activities].reverse().map((a, index) => (
        <div className="timeline-item" key={a.id}>
          <i className={index === 0 ? "current" : ""} />
          <div>
            <strong>{a.action}</strong>
            <p>{a.note}</p>
            <small>{dateTime(a.timestamp)}</small>
          </div>
        </div>
      ))}
    </div>
  )
}

function FeedbackForm({
  complaint,
  user,
  update,
}: {
  complaint: Complaint
  user: User
  update: Update
}) {
  const [rating, setRating] = useState(complaint.feedback?.rating || 0)
  const [comments, setComments] = useState(complaint.feedback?.comments || "")
  const [satisfaction, setSatisfaction] = useState(
    complaint.feedback?.satisfaction || "Satisfied",
  )
  const [helpful, setHelpful] = useState(complaint.feedback?.helpful ?? true)
  const [unresolved, setUnresolved] = useState(
    complaint.feedback?.unresolved || false,
  )
  const save = () => {
    if (!rating) return
    update(
      (draft) => {
        const c = draft.complaints.find((x) => x.id === complaint.id)!
        c.feedback = {
          userId: user.id,
          rating,
          satisfaction,
          comments,
          helpful,
          unresolved,
          createdAt: now(),
        }
        c.status = unresolved
          ? "Reopened / Review Requested"
          : "User Feedback Submitted"
        c.updatedAt = now()
        c.activities.push(
          makeActivity(
            user.id,
            "user",
            unresolved ? "Review requested" : "Feedback submitted",
            c.status,
            unresolved
              ? "Citizen reports that the issue remains unresolved."
              : "Citizen feedback received.",
            "internal",
          ),
        )
        draft.users
          .filter((u) => u.role === "admin")
          .forEach((admin) =>
            draft.notifications.push({
              id: uid(),
              recipientId: admin.id,
              complaintId: c.id,
              message: unresolved
                ? `Review requested for ${c.id}.`
                : `Citizen feedback received for ${c.id}.`,
              timestamp: now(),
              read: false,
            }),
          )
        return draft
      },
      unresolved
        ? "Review request sent to AICTE."
        : "Thank you for your feedback.",
    )
  }
  return (
    <section className="panel detail-section">
      <div className="panel-head">
        <div>
          <span>CITIZEN FEEDBACK</span>
          <h3>
            {complaint.feedback
              ? "Your submitted review"
              : "How was the resolution?"}
          </h3>
        </div>
      </div>
      <div className="rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            className={rating >= n ? "filled" : ""}
            onClick={() => setRating(n)}
            key={n}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="form-grid">
        <Field label="Satisfaction">
          <select
            value={satisfaction}
            onChange={(e) => setSatisfaction(e.target.value)}
          >
            <option>Very satisfied</option>
            <option>Satisfied</option>
            <option>Neutral</option>
            <option>Dissatisfied</option>
          </select>
        </Field>
        <Field label="Was the explanation helpful?">
          <select
            value={String(helpful)}
            onChange={(e) => setHelpful(e.target.value === "true")}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </Field>
        <Field label="Comments">
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </Field>
      </div>
      <label className="declaration compact">
        <input
          type="checkbox"
          checked={unresolved}
          onChange={(e) => setUnresolved(e.target.checked)}
        />
        <span>
          The issue remains unresolved — request administrator review.
        </span>
      </label>
      <button className="btn primary" onClick={save} disabled={!rating}>
        {complaint.feedback ? "Update feedback" : "Submit feedback"}
      </button>
    </section>
  )
}

function AdminPages({
  page,
  selectedId,
  setSelectedId,
  setPage,
  user,
  data,
  update,
  reset,
}: {
  page: string
  selectedId?: string
  setSelectedId: (id?: string) => void
  setPage: (p: string) => void
  user: User
  data: AppData
  update: Update
  reset: () => void
}) {
  const selected = data.complaints.find((c) => c.id === selectedId)
  if (selected)
    return (
      <ComplaintDetail
        complaint={selected}
        user={user}
        data={data}
        update={update}
        onBack={() => setSelectedId(undefined)}
      />
    )
  if (page === "complaints")
    return (
      <ComplaintList
        complaints={data.complaints}
        data={data}
        onOpen={setSelectedId}
        title="All complaints"
        text="Search, filter and open any case in the central register."
      />
    )
  if (page === "assignment")
    return (
      <ComplaintList
        complaints={data.complaints.filter(
          (c) =>
            ["Submitted", "Under Admin Review"].includes(c.status) ||
            !c.assignedOfficerId,
        )}
        data={data}
        onOpen={setSelectedId}
        title="Assignment & routing"
        text="Review new cases and route them to approved bureau officers."
      />
    )
  if (page === "verification")
    return (
      <ComplaintList
        complaints={data.complaints.filter(
          (c) => c.status === "Awaiting AICTE Verification",
        )}
        data={data}
        onOpen={setSelectedId}
        title="Verification queue"
        text="Review officer reports and evidence before approving any final resolution."
      />
    )
  if (page === "escalations")
    return (
      <ComplaintList
        complaints={data.complaints.filter(isOverdue)}
        data={data}
        onOpen={setSelectedId}
        title="Escalations & deadlines"
        text="Cases that have exceeded or are approaching their assigned deadline."
      />
    )
  if (page === "officers")
    return <OfficerManagement data={data} update={update} />
  if (page === "bureaus") return <BureauManagement data={data} />
  if (page === "reports") return <Reports data={data} />
  if (page === "notifications")
    return (
      <Notifications
        user={user}
        data={data}
        update={update}
        onOpen={setSelectedId}
      />
    )
  if (page === "settings") return <Settings reset={reset} />
  const all = data.complaints
  const awaiting = all.filter(
    (c) => c.status === "Awaiting AICTE Verification",
  ).length
  const resolved = all.filter((c) =>
    ["Resolved", "User Feedback Submitted"].includes(c.status),
  ).length
  return (
    <>
      <PageIntro
        kicker="CENTRAL COMMAND CENTRE"
        title="Complaint oversight"
        text={`Live operational view · ${date(new Date().toISOString())}`}
        action={
          <button className="btn primary" onClick={() => setPage("complaints")}>
            Open case register <Icon name="arrow" size={17} />
          </button>
        }
      />
      <div className="metric-grid five">
        <Metric label="Total complaints" value={all.length} icon="file" />
        <Metric
          label="New & unassigned"
          value={all.filter((c) => !c.assignedOfficerId).length}
          icon="clock"
          tone="amber"
        />
        <Metric
          label="In progress"
          value={all.filter((c) => c.status === "In Progress").length}
          icon="briefcase"
          tone="teal"
        />
        <Metric
          label="Awaiting verification"
          value={awaiting}
          icon="shield"
          tone="violet"
        />
        <Metric
          label="Overdue"
          value={all.filter(isOverdue).length}
          icon="clock"
          tone="red"
        />
      </div>
      <div className="dashboard-grid admin-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>COMPLAINT DISTRIBUTION</span>
              <h3>Cases by current status</h3>
            </div>
            <span className="rate">
              {all.length ? Math.round((resolved / all.length) * 100) : 0}%
              resolved
            </span>
          </div>
          <BarChart
            items={countBy(all, "status").slice(0, 6)}
            total={all.length}
          />
        </section>
        <section className="panel attention">
          <div className="panel-head">
            <div>
              <span>REQUIRES ATTENTION</span>
              <h3>Priority queue</h3>
            </div>
          </div>
          {all
            .filter(
              (c) =>
                !c.assignedOfficerId ||
                c.status === "Awaiting AICTE Verification" ||
                isOverdue(c),
            )
            .slice(0, 5)
            .map((c) => (
              <button
                className="attention-row"
                key={c.id}
                onClick={() => setSelectedId(c.id)}
              >
                <span className={isOverdue(c) ? "red-dot" : "amber-dot"} />
                <div>
                  <strong>{c.subject}</strong>
                  <small>
                    {c.id} · {isOverdue(c) ? "Deadline exceeded" : c.status}
                  </small>
                </div>
                <Icon name="arrow" size={16} />
              </button>
            ))}
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>BUREAU LOAD</span>
              <h3>Active cases by bureau</h3>
            </div>
          </div>
          <BarChart
            items={data.bureaus
              .map((b) => ({
                label: b.name,
                value: all.filter(
                  (c) =>
                    c.assignedBureauId === b.id &&
                    !["Resolved", "User Feedback Submitted"].includes(c.status),
                ).length,
              }))
              .sort((a, b) => b.value - a.value)}
            total={Math.max(1, all.filter((c) => c.assignedBureauId).length)}
          />
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>RECENT SYSTEM ACTIVITY</span>
              <h3>Latest case updates</h3>
            </div>
          </div>
          <div className="activity-feed">
            {all
              .flatMap((c) =>
                c.activities.map((a) => ({ ...a, complaintId: c.id })),
              )
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .slice(0, 6)
              .map((a) => (
                <div key={a.id}>
                  <span>
                    <Icon name="check" size={14} />
                  </span>
                  <p>
                    <strong>{a.action}</strong> on {a.complaintId}
                    <small>{dateTime(a.timestamp)}</small>
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  )
}

function countBy(items: Complaint[], field: "status" | "category") {
  const map = new Map<string, number>()
  items.forEach((item) => map.set(item[field], (map.get(item[field]) || 0) + 1))
  return [...map]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}
function BarChart({
  items,
  total,
}: {
  items: { label: string value: number }[]
  total: number
}) {
  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <div>
            <i
              style={{
                width: `${Math.max(3, (item.value / Math.max(1, total)) * 100)}%`,
              }}
            />
          </div>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  )
}
function isOverdue(c: Complaint) {
  return (
    !!c.deadline &&
    new Date(c.deadline) < new Date() &&
    !["Resolved", "User Feedback Submitted"].includes(c.status)
  )
}

function InternalCaseActions({
  complaint,
  user,
  data,
  update,
}: {
  complaint: Complaint
  user: User
  data: AppData
  update: Update
}) {
  return user.role === "admin" ? (
    <AdminActions
      complaint={complaint}
      user={user}
      data={data}
      update={update}
    />
  ) : (
    <OfficerActions complaint={complaint} user={user} update={update} />
  )
}

function AdminActions({
  complaint,
  user,
  data,
  update,
}: {
  complaint: Complaint
  user: User
  data: AppData
  update: Update
}) {
  const [bureauId, setBureau] = useState(
    complaint.assignedBureauId || complaint.suggestedBureauId || "",
  )
  const eligible = data.users.filter(
    (u) =>
      u.role === "officer" &&
      u.accountStatus === "active" &&
      u.bureauId === bureauId,
  )
  const [officerId, setOfficer] = useState(complaint.assignedOfficerId || "")
  const [priority, setPriority] = useState<Priority>(complaint.priority)
  const [deadline, setDeadline] = useState(
    complaint.deadline?.slice(0, 10) || "",
  )
  const [reason, setReason] = useState("")
  const [publicNote, setPublicNote] = useState("")
  const [resolution, setResolution] = useState(
    complaint.reports.at(-1)?.actionSummary || "",
  )
  const assign = () => {
    if (!bureauId || !officerId || !deadline) return
    const officer = eligible.find((o) => o.id === officerId)
    if (!officer) return
    update((draft) => {
      const c = draft.complaints.find((x) => x.id === complaint.id)!
      const previousStatus = c.status
      c.assignments.push({
        previousBureauId: c.assignedBureauId,
        newBureauId: bureauId,
        previousOfficerId: c.assignedOfficerId,
        newOfficerId: officerId,
        assignedBy: user.id,
        reason: reason || "Assigned based on category and bureau workload.",
        timestamp: now(),
      })
      c.assignedBureauId = bureauId
      c.assignedOfficerId = officerId
      c.priority = priority
      c.deadline = new Date(`${deadline}T23:59:59`).toISOString()
      c.status = "Assigned"
      c.updatedAt = now()
      c.activities.push({
        ...makeActivity(
          user.id,
          "admin",
          c.assignments.length > 1 ? "Case reassigned" : "Case assigned",
          "Assigned",
          `Assigned to ${data.bureaus.find((b) => b.id === bureauId)?.name}.`,
        ),
        previousStatus,
      })
      draft.notifications.push(
        {
          id: uid(),
          recipientId: officerId,
          complaintId: c.id,
          message: `${c.id} has been assigned to you.`,
          timestamp: now(),
          read: false,
        },
        {
          id: uid(),
          recipientId: c.complainantId,
          complaintId: c.id,
          message: `${c.id} has been assigned to the relevant bureau.`,
          timestamp: now(),
          read: false,
        },
      )
      return draft
    }, "Case assigned and officer notified.")
  }
  const note = (visibility: "public" | "internal") => {
    if (!publicNote.trim()) return
    update(
      (draft) => {
        const c = draft.complaints.find((x) => x.id === complaint.id)!
        c.activities.push(
          makeActivity(
            user.id,
            "admin",
            visibility === "public"
              ? "AICTE update"
              : "Internal administrator note",
            c.status,
            publicNote,
            visibility,
          ),
        )
        c.updatedAt = now()
        if (visibility === "public")
          draft.notifications.push({
            id: uid(),
            recipientId: c.complainantId,
            complaintId: c.id,
            message: `AICTE posted an update on ${c.id}.`,
            timestamp: now(),
            read: false,
          })
        return draft
      },
      `${visibility === "public" ? "Public update" : "Internal note"} added.`,
    )
    setPublicNote("")
  }
  const verify = (
    decision: "approved" | "returned" | "rejected" | "information-requested",
  ) => {
    if (!complaint.reports.length) return
    if (decision !== "approved" && !reason.trim()) return
    const latest = complaint.reports.at(-1)!
    if (
      decision === "approved" &&
      !latest.evidence.length &&
      !latest.exceptionReason
    )
      return
    update(
      (draft) => {
        const c = draft.complaints.find((x) => x.id === complaint.id)!
        const nextStatus: Status =
          decision === "approved"
            ? "Resolved"
            : decision === "returned"
              ? "Returned for Further Action"
              : decision === "rejected"
                ? "Resolution Rejected"
                : "Awaiting User Information"
        c.verifications.push({
          id: uid(),
          adminId: user.id,
          decision,
          reason: reason || resolution,
          timestamp: now(),
        })
        const previousStatus = c.status
        c.status = nextStatus
        c.updatedAt = now()
        if (decision === "approved") {
          c.verifiedResolution = resolution || latest.actionSummary
          c.verifiedAt = now()
          latest.evidence.forEach((e) => {
            if (e.visibility === "public") e.verificationStatus = "approved"
          })
        }
        c.activities.push({
          ...makeActivity(
            user.id,
            "admin",
            decision === "approved"
              ? "Resolution approved"
              : decision === "returned"
                ? "Returned for further action"
                : decision === "rejected"
                  ? "Resolution proposal rejected"
                  : "Additional information requested",
            nextStatus,
            decision === "approved"
              ? "AICTE verified the resolution and closed the complaint."
              : reason,
            decision === "approved" ? "public" : "internal",
          ),
          previousStatus,
        })
        ;[c.complainantId, c.assignedOfficerId]
          .filter(Boolean)
          .forEach((recipientId) =>
            draft.notifications.push({
              id: uid(),
              recipientId: recipientId!,
              complaintId: c.id,
              message:
                decision === "approved"
                  ? `AICTE verified the resolution for ${c.id}.`
                  : `${c.id}: ${c.activities.at(-1)!.action}.`,
              timestamp: now(),
              read: false,
            }),
          )
        return draft
      },
      decision === "approved"
        ? "Resolution approved and citizen notified."
        : "Verification decision recorded.",
    )
  }
  const recommendation = classifyComplaint(
    `${complaint.subject} ${complaint.description}`,
  )
  return (
    <section className="panel detail-section action-panel">
      <div className="panel-head">
        <div>
          <span>ADMINISTRATOR CONTROLS</span>
          <h3>Case management actions</h3>
        </div>
      </div>
      <div className="ai-card horizontal">
        <span>EXPLAINABLE ROUTING SUGGESTION</span>
        <strong>
          {data.bureaus.find((b) => b.id === recommendation.bureauId)?.name}
        </strong>
        <p>
          {recommendation.reason} Administrator review and override are
          available.
        </p>
      </div>
      <div className="action-block">
        <h4>Assignment & deadline</h4>
        <div className="form-grid">
          <Field label="Bureau">
            <select
              value={bureauId}
              onChange={(e) => {
                setBureau(e.target.value)
                setOfficer("")
              }}
            >
              <option value="">Select bureau</option>
              {data.bureaus
                .filter((b) => b.active)
                .map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Approved officer">
            <select
              value={officerId}
              onChange={(e) => setOfficer(e.target.value)}
            >
              <option value="">Select officer</option>
              {eligible.map((o) => (
                <option value={o.id} key={o.id}>
                  {o.fullName} · {o.designation}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {["Low", "Medium", "High", "Critical"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
          <Field label="Assignment / reassignment reason">
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
        <button className="btn primary" onClick={assign}>
          {complaint.assignedOfficerId
            ? "Confirm reassignment"
            : "Confirm assignment"}
        </button>
      </div>
      <div className="action-block">
        <h4>Case note or public update</h4>
        <textarea
          rows={3}
          value={publicNote}
          onChange={(e) => setPublicNote(e.target.value)}
          placeholder="Enter a concise update..."
        />
        <div className="button-row">
          <button className="btn secondary" onClick={() => note("internal")}>
            Add internal note
          </button>
          <button className="btn secondary" onClick={() => note("public")}>
            Post public update
          </button>
        </div>
      </div>
      {complaint.status === "Awaiting AICTE Verification" && (
        <div className="action-block verification-block">
          <h4>Final verification decision</h4>
          {complaint.reports.map((report, i) => (
            <div className="report-card" key={report.id}>
              <strong>
                Submission {i + 1}: {report.actionSummary}
              </strong>
              <p>{report.details}</p>
              <Files files={report.evidence} />
            </div>
          ))}
          <Field label="Verified resolution summary">
            <textarea
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </Field>
          <Field label="Decision reason (required for return/reject/request)">
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <div className="button-row">
            <button className="btn success" onClick={() => verify("approved")}>
              Approve resolution
            </button>
            <button
              className="btn secondary"
              onClick={() => verify("returned")}
            >
              Return for action
            </button>
            <button className="btn danger" onClick={() => verify("rejected")}>
              Reject proposal
            </button>
            <button
              className="btn secondary"
              onClick={() => verify("information-requested")}
            >
              Request information
            </button>
          </div>
        </div>
      )}
      {complaint.feedback && (
        <div className="action-block">
          <h4>Citizen feedback</h4>
          <div className="feedback-summary">
            <b>{complaint.feedback.rating}/5</b>
            <span>
              {complaint.feedback.satisfaction}
              <small>
                {complaint.feedback.comments || "No written comments"}
              </small>
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

function OfficerPages({
  page,
  selectedId,
  setSelectedId,
  setPage,
  user,
  data,
  update,
}: {
  page: string
  selectedId?: string
  setSelectedId: (id?: string) => void
  setPage: (p: string) => void
  user: User
  data: AppData
  update: Update
}) {
  const mine = data.complaints.filter(
    (c) =>
      c.assignedOfficerId === user.id && c.assignedBureauId === user.bureauId,
  )
  const selected = mine.find((c) => c.id === selectedId)
  if (selected)
    return (
      <ComplaintDetail
        complaint={selected}
        user={user}
        data={data}
        update={update}
        onBack={() => setSelectedId(undefined)}
      />
    )
  if (["complaints", "workspace", "evidence"].includes(page))
    return (
      <ComplaintList
        complaints={mine}
        data={data}
        onOpen={setSelectedId}
        title={
          page === "evidence"
            ? "Evidence & completion reports"
            : "Assigned complaints"
        }
        text="Only cases assigned to you within your authorized bureau are shown."
      />
    )
  if (page === "returned")
    return (
      <ComplaintList
        complaints={mine.filter((c) =>
          ["Returned for Further Action", "Resolution Rejected"].includes(
            c.status,
          ),
        )}
        data={data}
        onOpen={setSelectedId}
        title="Returned cases"
        text="Review AICTE’s decision, take further action and resubmit evidence."
      />
    )
  if (page === "notifications")
    return (
      <Notifications
        user={user}
        data={data}
        update={update}
        onOpen={setSelectedId}
      />
    )
  if (page === "profile") return <Profile user={user} data={data} />
  return (
    <>
      <PageIntro
        kicker="OFFICER WORKSPACE"
        title={`Good day, ${user.fullName.split(" ")[0]}`}
        text={`${data.bureaus.find((b) => b.id === user.bureauId)?.name} · Your authorized caseload`}
        action={
          <button className="btn primary" onClick={() => setPage("complaints")}>
            Open assigned cases <Icon name="arrow" size={17} />
          </button>
        }
      />
      <div className="metric-grid five">
        <Metric label="Assigned to me" value={mine.length} icon="file" />
        <Metric
          label="New assignments"
          value={mine.filter((c) => c.status === "Assigned").length}
          icon="bell"
          tone="amber"
        />
        <Metric
          label="In progress"
          value={mine.filter((c) => c.status === "In Progress").length}
          icon="briefcase"
          tone="teal"
        />
        <Metric
          label="Awaiting AICTE"
          value={
            mine.filter((c) => c.status === "Awaiting AICTE Verification")
              .length
          }
          icon="shield"
          tone="violet"
        />
        <Metric
          label="Overdue"
          value={mine.filter(isOverdue).length}
          icon="clock"
          tone="red"
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <span>MY ACTIVE CASES</span>
            <h3>Investigation queue</h3>
          </div>
        </div>
        <div className="case-list">
          {mine
            .filter(
              (c) =>
                !["Resolved", "User Feedback Submitted"].includes(c.status),
            )
            .map((c) => (
              <button
                className="case-row"
                key={c.id}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="case-symbol">{c.id.slice(-2)}</div>
                <div>
                  <strong>{c.subject}</strong>
                  <small>
                    {c.id} · Deadline {date(c.deadline)}
                  </small>
                </div>
                <PriorityBadge priority={c.priority} />
                <StatusBadge status={c.status} />
                <Icon name="arrow" size={17} />
              </button>
            ))}
        </div>
      </section>
    </>
  )
}

function OfficerActions({
  complaint,
  user,
  update,
}: {
  complaint: Complaint
  user: User
  update: Update
}) {
  const [note, setNote] = useState("")
  const [summary, setSummary] = useState("")
  const [details, setDetails] = useState("")
  const [actionDate, setActionDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [files, setFiles] = useState<File[]>([])
  const [exception, setException] = useState("")
  const transition = (
    status: Status,
    action: string,
    visibility: "public" | "internal",
    text: string,
  ) =>
    update((draft) => {
      const c = draft.complaints.find((x) => x.id === complaint.id)!
      if (
        c.assignedOfficerId !== user.id ||
        c.assignedBureauId !== user.bureauId
      )
        return draft
      const previousStatus = c.status
      c.status = status
      c.updatedAt = now()
      c.activities.push({
        ...makeActivity(user.id, "officer", action, status, text, visibility),
        previousStatus,
      })
      if (visibility === "public")
        draft.notifications.push({
          id: uid(),
          recipientId: c.complainantId,
          complaintId: c.id,
          message: `${c.id}: ${action}.`,
          timestamp: now(),
          read: false,
        })
      return draft
    }, `${action} recorded.`)
  const addNote = (visibility: "public" | "internal") => {
    if (!note.trim()) return
    transition(
      complaint.status,
      visibility === "public"
        ? "Investigation update"
        : "Internal investigation note",
      visibility,
      note,
    )
    setNote("")
  }
  const submit = () => {
    if (
      !summary ||
      details.length < 30 ||
      !actionDate ||
      (!files.length && !exception.trim())
    )
      return
    update((draft) => {
      const c = draft.complaints.find((x) => x.id === complaint.id)!
      if (c.assignedOfficerId !== user.id) return draft
      const evidence: Attachment[] = files.map((f) => ({
        id: uid(),
        fileName: f.name,
        fileType: f.type,
        fileSize: f.size,
        uploadedBy: user.id,
        uploadedAt: now(),
        visibility: "public",
        verificationStatus: "pending",
      }))
      c.reports.push({
        id: uid(),
        officerId: user.id,
        actionSummary: summary,
        details,
        actionDate,
        evidence,
        exceptionReason: evidence.length ? undefined : exception,
        submittedAt: now(),
      })
      const previousStatus = c.status
      c.status = "Awaiting AICTE Verification"
      c.updatedAt = now()
      c.activities.push({
        ...makeActivity(
          user.id,
          "officer",
          "Resolution submitted for verification",
          c.status,
          "Action report submitted to AICTE for verification.",
        ),
        previousStatus,
      })
      draft.users
        .filter((u) => u.role === "admin" && u.accountStatus === "active")
        .forEach((admin) =>
          draft.notifications.push({
            id: uid(),
            recipientId: admin.id,
            complaintId: c.id,
            message: `${c.id} is awaiting resolution verification.`,
            timestamp: now(),
            read: false,
          }),
        )
      draft.notifications.push({
        id: uid(),
        recipientId: c.complainantId,
        complaintId: c.id,
        message: `${c.id}: action report is under AICTE verification.`,
        timestamp: now(),
        read: false,
      })
      return draft
    }, "Completion report submitted to AICTE.")
  }
  const actionable = [
    "Assigned",
    "In Progress",
    "Returned for Further Action",
    "Resolution Rejected",
  ].includes(complaint.status)
  return (
    <section className="panel detail-section action-panel">
      <div className="panel-head">
        <div>
          <span>INVESTIGATION WORKSPACE</span>
          <h3>Officer case actions</h3>
        </div>
      </div>
      {complaint.status === "Assigned" && (
        <button
          className="btn primary"
          onClick={() =>
            transition(
              "In Progress",
              "Investigation started",
              "public",
              "The assigned bureau has started its review.",
            )
          }
        >
          Accept case & start investigation
        </button>
      )}
      {actionable && complaint.status !== "Assigned" && (
        <>
          <div className="action-block">
            <h4>Investigation notes & updates</h4>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record findings, actions or a citizen-safe update..."
            />
            <div className="button-row">
              <button
                className="btn secondary"
                onClick={() => addNote("internal")}
              >
                Save internal note
              </button>
              <button
                className="btn secondary"
                onClick={() => addNote("public")}
              >
                Post public update
              </button>
            </div>
          </div>
          <div className="action-block verification-block">
            <h4>Submit completion report to AICTE</h4>
            {complaint.status === "Returned for Further Action" && (
              <div className="return-reason">
                <strong>AICTE return reason</strong>
                <p>{complaint.verifications.at(-1)?.reason}</p>
              </div>
            )}
            <div className="form-grid">
              <Field label="Action taken summary *">
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </Field>
              <Field label="Date of action *">
                <input
                  type="date"
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                />
              </Field>
              <Field label="Detailed resolution report *">
                <textarea
                  rows={5}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </Field>
            </div>
            <label className="upload-zone compact">
              <Icon name="upload" />
              <strong>Attach completion evidence</strong>
              <span>PDF, JPG or PNG · Max 5 MB</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFiles(
                    Array.from(e.target.files || []).filter(
                      (f) =>
                        ["application/pdf", "image/jpeg", "image/png"].includes(
                          f.type,
                        ) && f.size <= 5 * 1024 * 1024,
                    ),
                  )
                }
              />
            </label>
            {files.map((f) => (
              <div className="file-row" key={f.name}>
                <Icon name="file" />
                <span>
                  <strong>{f.name}</strong>
                  <small>{(f.size / 1024).toFixed(0)} KB</small>
                </span>
              </div>
            ))}
            <Field label="Evidence exception reason (only if no file can be provided)">
              <textarea
                rows={2}
                value={exception}
                onChange={(e) => setException(e.target.value)}
                placeholder="This exception requires administrator approval."
              />
            </Field>
            <p className="guardrail">
              <Icon name="shield" size={17} /> Officers cannot resolve cases
              directly. AICTE verification is mandatory.
            </p>
            <button className="btn primary" onClick={submit}>
              Submit to AICTE for verification
            </button>
          </div>
        </>
      )}
      {complaint.status === "Awaiting AICTE Verification" && (
        <div className="waiting-state">
          <Icon name="clock" size={28} />
          <strong>Awaiting AICTE verification</strong>
          <p>
            Your report and evidence are locked into the case history. You
            cannot approve your own resolution.
          </p>
        </div>
      )}
    </section>
  )
}

function OfficerManagement({ data, update }: { data: AppData update: Update }) {
  const officers = data.users.filter((u) => u.role === "officer")
  const change = (id: string, status: User["accountStatus"]) =>
    update((draft) => {
      const user = draft.users.find((u) => u.id === id)!
      user.accountStatus = status
      return draft
    }, `Officer account ${status}.`)
  return (
    <>
      <PageIntro
        kicker="ACCESS CONTROL"
        title="Officer management"
        text="Approve registrations, manage bureau access and monitor active workload."
      />
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Officer</th>
                <th>Contact</th>
                <th>Bureau</th>
                <th>Status</th>
                <th>Workload</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.fullName}</strong>
                    <small>{o.designation}</small>
                  </td>
                  <td>
                    {o.email}
                    <small>{o.phone}</small>
                  </td>
                  <td>
                    {data.bureaus.find((b) => b.id === o.bureauId)?.name ||
                      "Not assigned"}
                  </td>
                  <td>
                    <span className={`account-state ${o.accountStatus}`}>
                      {o.accountStatus}
                    </span>
                  </td>
                  <td>
                    {
                      data.complaints.filter(
                        (c) =>
                          c.assignedOfficerId === o.id &&
                          !["Resolved", "User Feedback Submitted"].includes(
                            c.status,
                          ),
                      ).length
                    }{" "}
                    active
                  </td>
                  <td>
                    <div className="button-row compact">
                      {o.accountStatus === "pending" && (
                        <button
                          className="small-btn success"
                          onClick={() => change(o.id, "active")}
                        >
                          Approve
                        </button>
                      )}
                      {o.accountStatus !== "inactive" ? (
                        <button
                          className="small-btn"
                          onClick={() => change(o.id, "inactive")}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="small-btn success"
                          onClick={() => change(o.id, "active")}
                        >
                          Activate
                        </button>
                      )}
                      {o.accountStatus === "pending" && (
                        <button
                          className="small-btn danger"
                          onClick={() => change(o.id, "rejected")}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function BureauManagement({ data }: { data: AppData }) {
  return (
    <>
      <PageIntro
        kicker="CONFIGURABLE EXAMPLES"
        title="Bureau management"
        text="Illustrative bureau categories for this demonstration; these do not claim to reproduce AICTE’s official structure."
      />
      <div className="bureau-grid">
        {data.bureaus.map((b) => (
          <article className="panel bureau-card" key={b.id}>
            <div className="bureau-icon">
              <Icon name="home" />
            </div>
            <span className="account-state active">Active</span>
            <h3>{b.name}</h3>
            <p>{b.description}</p>
            <div>
              <span>
                {
                  data.users.filter(
                    (u) => u.bureauId === b.id && u.accountStatus === "active",
                  ).length
                }{" "}
                officers
              </span>
              <span>
                {
                  data.complaints.filter((c) => c.assignedBureauId === b.id)
                    .length
                }{" "}
                cases
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function Reports({ data }: { data: AppData }) {
  const [status, setStatus] = useState("")
  const [bureau, setBureau] = useState("")
  const filtered = data.complaints.filter(
    (c) =>
      (!status || c.status === status) &&
      (!bureau || c.assignedBureauId === bureau),
  )
  const resolved = filtered.filter((c) =>
    ["Resolved", "User Feedback Submitted"].includes(c.status),
  )
  const ratings = filtered
    .map((c) => c.feedback?.rating)
    .filter(Boolean) as number[]
  const exportCsv = () => {
    const rows = [
      [
        "Complaint ID",
        "Subject",
        "Category",
        "Status",
        "Bureau",
        "Priority",
        "Submitted",
        "Updated",
      ],
      ...filtered.map((c) => [
        c.id,
        c.subject,
        c.category,
        c.status,
        data.bureaus.find((b) => b.id === c.assignedBureauId)?.name || "",
        c.priority,
        c.createdAt,
        c.updatedAt,
      ]),
    ]
    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    link.download = `aicte-complaints-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  return (
    <>
      <PageIntro
        kicker="LIVE ANALYTICS"
        title="Reports & analytics"
        text="All metrics are calculated from the current local complaint dataset."
        action={
          <button className="btn primary" onClick={exportCsv}>
            <Icon name="download" size={17} /> Export filtered CSV
          </button>
        }
      />
      <div className="filters report-filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={bureau} onChange={(e) => setBureau(e.target.value)}>
          <option value="">All bureaus</option>
          {data.bureaus.map((b) => (
            <option value={b.id} key={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="metric-grid four">
        <Metric
          label="Filtered complaints"
          value={filtered.length}
          icon="file"
        />
        <Metric
          label="Resolution rate"
          value={`${
            filtered.length
              ? Math.round((resolved.length / filtered.length) * 100)
              : 0
          }%`}
          icon="check"
          tone="green"
        />
        <Metric
          label="Overdue cases"
          value={filtered.filter(isOverdue).length}
          icon="clock"
          tone="red"
        />
        <Metric
          label="Average satisfaction"
          value={
            ratings.length
              ? `${(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)}/5`
              : "—"
          }
          icon="chart"
          tone="violet"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>BY STATUS</span>
              <h3>Complaint distribution</h3>
            </div>
          </div>
          <BarChart
            items={countBy(filtered, "status")}
            total={filtered.length}
          />
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>BY CATEGORY</span>
              <h3>Top grievance categories</h3>
            </div>
          </div>
          <BarChart
            items={countBy(filtered, "category").slice(0, 7)}
            total={filtered.length}
          />
        </section>
      </div>
    </>
  )
}

function Notifications({
  user,
  data,
  update,
  onOpen,
}: {
  user: User
  data: AppData
  update: Update
  onOpen: (id: string) => void
}) {
  const notes = data.notifications
    .filter((n) => n.recipientId === user.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const read = (id: string, complaintId?: string) => {
    update((draft) => {
      draft.notifications.find((n) => n.id === id)!.read = true
      return draft
    })
    if (complaintId) onOpen(complaintId)
  }
  return (
    <>
      <PageIntro
        kicker="IN-APP ALERTS"
        title="Notifications"
        text="Persistent updates about cases and actions relevant to your role."
        action={
          <button
            className="btn secondary"
            onClick={() =>
              update((draft) => {
                draft.notifications
                  .filter((n) => n.recipientId === user.id)
                  .forEach((n) => (n.read = true))
                return draft
              }, "All notifications marked as read.")
            }
          >
            Mark all read
          </button>
        }
      />
      <section className="panel notification-list">
        {notes.length ? (
          notes.map((n) => (
            <button
              className={n.read ? "" : "unread"}
              key={n.id}
              onClick={() => read(n.id, n.complaintId)}
            >
              <span className="notification-icon">
                <Icon name="bell" size={18} />
              </span>
              <div>
                <strong>{n.message}</strong>
                <small>
                  {n.complaintId && `${n.complaintId} · `}
                  {dateTime(n.timestamp)}
                </small>
              </div>
              {!n.read && <i />}
              <Icon name="arrow" size={17} />
            </button>
          ))
        ) : (
          <Empty
            title="No notifications"
            text="Case updates will appear here."
          />
        )}
      </section>
    </>
  )
}

function Profile({ user, data }: { user: User data: AppData }) {
  return (
    <>
      <PageIntro
        kicker="ACCOUNT"
        title="My profile"
        text="Your role and access information in this demonstration."
      />
      <section className="panel profile-card">
        <div className="profile-avatar">
          {user.fullName
            .split(" ")
            .map((x) => x[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <h3>{user.fullName}</h3>
          <p>
            {user.designation ||
              (user.role === "user" ? "Complainant / User" : user.role)}
          </p>
        </div>
        <div className="info-grid">
          <Info label="Email address" value={user.email} />
          <Info label="Mobile number" value={user.phone} />
          <Info label="Account status" value={user.accountStatus} />
          <Info
            label="Bureau / institution"
            value={
              data.bureaus.find((b) => b.id === user.bureauId)?.name ||
              user.institution ||
              "—"
            }
          />
          <Info label="Member since" value={date(user.createdAt)} />
          <Info label="Role" value={user.role} />
        </div>
        <div className="security-note inline">
          <Icon name="shield" />
          <div>
            <strong>Demo environment</strong>
            <p>
              Profile and authentication data are stored only in this browser.
              Production requires secure server-side identity management.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
function Help() {
  return (
    <>
      <PageIntro
        kicker="GUIDANCE"
        title="Help & complaint guidelines"
        text="Prepare a clear, factual submission to help AICTE review it efficiently."
      />
      <div className="help-grid">
        <section className="panel">
          <h3>Before you submit</h3>
          <ul>
            <li>Use the institution’s grievance process where appropriate.</li>
            <li>
              Keep dates, acknowledgement numbers and relevant correspondence
              ready.
            </li>
            <li>
              Remove unrelated personal or sensitive information from evidence.
            </li>
          </ul>
        </section>
        <section className="panel">
          <h3>Good complaint descriptions</h3>
          <ul>
            <li>Explain what happened in chronological order.</li>
            <li>State what action you have already taken.</li>
            <li>Describe the fair outcome you are seeking.</li>
          </ul>
        </section>
        <section className="panel">
          <h3>Accepted files</h3>
          <ul>
            <li>PDF, JPG, JPEG and PNG only.</li>
            <li>Maximum 5 MB per file in this prototype.</li>
            <li>Uploaded metadata persists locally in this demo.</li>
          </ul>
        </section>
      </div>
    </>
  )
}
function Settings({ reset }: { reset: () => void }) {
  return (
    <>
      <PageIntro
        kicker="DEMO CONTROL"
        title="Settings"
        text="Configuration and data controls for the local demonstration environment."
      />
      <section className="panel settings-card">
        <div>
          <h3>Reset demonstration data</h3>
          <p>
            Restore all 12 fictional complaints, demo accounts, notifications
            and histories. Any data created in this browser will be removed.
          </p>
        </div>
        <button className="btn danger" onClick={reset}>
          Reset demo data
        </button>
      </section>
      <section className="panel security-note inline">
        <Icon name="shield" />
        <div>
          <strong>Prototype security disclosure</strong>
          <p>
            This browser-only implementation demonstrates workflow and
            authorization logic. A production service must use a secure backend,
            encrypted transport, hashed credentials, secure sessions, malware
            scanning and server-enforced access controls.
          </p>
        </div>
      </section>
    </>
  )
}

export default App
