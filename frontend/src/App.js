import React, { useEffect, useMemo, useState } from "react";


import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Factory,
  IceCreamCone,
  Boxes,
  Warehouse,
  Truck,
  Store,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  PackageX,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Plus,
  Edit3,
  Trash2,
  Download,
  AlertTriangle,
  Package,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Mail,
  Settings,
  Eye,
  EyeOff,
  LockKeyhole,
  Info,
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  BadgeCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  initialData,
  schema,
  menuGroups,
  roles,
  access,
  choices,
} from "./data";
import "./App.css";
import { validateRecord, csvCell } from "./validation";
const icons = {
  Payroll: ClipboardList,
  Payments: BarChart3,
  "Stock Transfers": Boxes,
  "Meal Preferences": Users,
  Dashboard: LayoutDashboard,
  Notifications: Bell,
  Employees: Users,
  Attendance: CalendarCheck,
  "Leave Requests": CalendarDays,
  Production: Factory,
  Products: IceCreamCone,
  "Raw Materials": Boxes,
  "Cool Rooms": Warehouse,
  Vehicles: Truck,
  Outlets: Store,
  Orders: ShoppingCart,
  Deliveries: Truck,
  Sales: BarChart3,
  "Returns & Wastage": PackageX,
  Reports: ClipboardList,
};
const money = (n) => "Rs. " + Number(n || 0).toLocaleString("en-LK");
const dateDiff = (d) =>
  Math.ceil(
    (new Date(d + "T00:00:00") - new Date(new Date().toDateString())) /
      86400000,
  );
// For Create React App, set REACT_APP_API_URL if your backend uses a different URL.
const AUTH_API = (process.env.REACT_APP_API_URL || "http://localhost:8080").replace(/\/$/, ""); //backend running location eka
// Run the complete interface without Spring Boot by setting REACT_APP_DEMO_MODE=true.



// DEMO MODE IS ONLY FOR LOCAL PREVIEW. It is not authentication or secure storage.(Workspace eka check karanda dapu ekk backend database eken passe ganna)
const DEMO_MODE = process.env.REACT_APP_DEMO_MODE === "true";
const DEMO_USERS = [
  { email: "admin@demo.test", password: "Admin123", name: "Demo Administrator", role: "Admin" },
  { email: "manager@demo.test", password: "Manager123", name: "Demo Manager", role: "Manager" },
  { email: "staff@demo.test", password: "Staff123", name: "Demo Staff", role: "Staff" },
];
const DEMO_WHOLESALE_KEY = "sathutu_demo_wholesale_applications";
function getDemoApplications() {
  try { return JSON.parse(localStorage.getItem(DEMO_WHOLESALE_KEY) || "[]"); }
  catch { return []; }
}
function saveDemoApplications(rows) { localStorage.setItem(DEMO_WHOLESALE_KEY, JSON.stringify(rows)); }


// Spring Security uses CSRF protection for session-based POST/PUT/DELETE calls.
async function fetchCsrfToken() {
  const response = await fetch(`${AUTH_API}/api/auth/csrf`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to start secure session. Is Spring Boot running?");
  const data = await response.json();
  return data.token;
}


export default function App() {
  const [db, setDb] = useState(() => {
    try {
      return {
        ...initialData,
        ...JSON.parse(localStorage.getItem("frosty_db") || "{}"),
      };
    } catch {
      return initialData;
    }
  });
  // A saved browser object is not proof of authentication.
  // Verify the login session with the backend on every page reload.
  const [user, setUser] = useState(null);
  const [wholesaleView, setWholesaleView] = useState(
    () => window.location.pathname === "/wholesale/register"
  );
  useEffect(() => {
    const updateView = () => setWholesaleView(window.location.pathname === "/wholesale/register");
    window.addEventListener("popstate", updateView);
    return () => window.removeEventListener("popstate", updateView);
  }, []);
  function showWholesalePage(value) {
    window.history.pushState({}, "", value ? "/wholesale/register" : "/");
    setWholesaleView(value);
  }
  const [authChecking, setAuthChecking] = useState(true);
  useEffect(() => {
    if (DEMO_MODE) {
      // Preserve demo login only within this browser tab; no backend call.
      try {
        const saved = JSON.parse(sessionStorage.getItem("sathutu_demo_user") || "null");
        if (saved && DEMO_USERS.some(u => u.email === saved.email && u.role === saved.role)) setUser(saved);
      } catch { /* Ignore invalid browser storage */ }
      setAuthChecking(false);
      return;
    }
    const controller = new AbortController();
    async function checkSession() {
      try {
        const response = await fetch(`${AUTH_API}/api/auth/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("No active session");
        const data = await response.json();
        if (!data.user?.name || !access[data.user.role]) {
          throw new Error("Invalid user profile");
        }
        setUser(data.user);
      } catch (error) {
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setAuthChecking(false);
      }
    }
    checkSession();
    return () => controller.abort();
  }, []);
  const [page, setPage] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("page");
    return requested && (requested === "Wholesale Customers" || requested in schema || ["Dashboard", "Reports", "Notifications"].includes(requested)) ? requested : "Dashboard";
  });
  useEffect(() => {
    const handleBrowserBack = () => {
      const next = new URLSearchParams(window.location.search).get("page") || "Dashboard";
      if ((next === "Wholesale Customers" && user?.role === "Admin") || access[user?.role]?.includes(next)) {
        setPage(next);
      } else {
        setPage("Dashboard");
      }
    };
    window.addEventListener("popstate", handleBrowserBack);
    return () => window.removeEventListener("popstate", handleBrowserBack);
  }, [user]);
  const [sidebar, setSidebar] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");



  useEffect(() => {
    if (DEMO_MODE) localStorage.setItem("frosty_db", JSON.stringify(db));
  }, [db]);
  const [workspaceLoading, setWorkspaceLoading] = useState(!DEMO_MODE);
  useEffect(() => {
    if (DEMO_MODE || !user) return;
    const controller = new AbortController();
    setWorkspaceLoading(true);
    fetch(`${AUTH_API}/api/workspace`, { credentials: "include", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Cannot load workspace data from Spring Boot.");
        return response.json();
      })
      .then(remote => {
        if (!controller.signal.aborted) {
          setDb(Object.fromEntries(Object.keys(initialData).map(key => [key, remote[key] || []])));
        }
      })
      .catch(err => { if (!controller.signal.aborted) setNotice(err.message); })
      .finally(() => { if (!controller.signal.aborted) setWorkspaceLoading(false); });
    return () => controller.abort();
  }, [user]);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(""), 3500);
      return () => clearTimeout(id);
    }
  }, [notice]);
  // UI restriction only; enforce access again on protected backend API routes.
  const allowed = (p) => Boolean(user && access[user.role]?.includes(p));
  function navigate(p) {
    if (p !== "Wholesale Customers" && !allowed(p)) return;
    if (p === "Wholesale Customers" && user?.role !== "Admin") return;
    window.history.pushState({}, "", p === "Dashboard" ? "/" : `/?page=${encodeURIComponent(p)}`);
    setPage(p);
    setSearch("");
    setSidebar(false);
  }
  async function handleLogout() {
    // Clear UI state even if the backend is temporarily unreachable.
    if (DEMO_MODE) sessionStorage.removeItem("sathutu_demo_user");
    try {
      if (!DEMO_MODE) {
      const csrfToken = await fetchCsrfToken();
      await fetch(`${AUTH_API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRF-TOKEN": csrfToken },
      });
      }
    } catch (error) {
      console.warn("Unable to reach logout endpoint:", error);
    } finally {
      setUser(null);
      window.history.replaceState({}, "", "/");
      setPage("Dashboard");
      setSidebar(false);
      setModal(null);
    }
  }




  async function update(key, record) {
    let saved = record;
    if (!DEMO_MODE) {                                       //DEMO Data checkup
      try {
        const token = await fetchCsrfToken();
        const url = `${AUTH_API}/api/workspace/${encodeURIComponent(key)}` +
          (record.id ? `/${encodeURIComponent(record.id)}` : "");
        const response = await fetch(url, {
          method: record.id ? "PUT" : "POST", credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": token },
          body: JSON.stringify(record),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Could not save record to the server.");
        saved = body;
      } catch (error) { setNotice(error.message || "Save failed"); return; }
    }
    setDb(old => ({
      ...old,
      [key]: saved.id && old[key].some(x => x.id === saved.id)
        ? old[key].map(x => x.id === saved.id ? saved : x)
        : [...old[key], { ...saved, id: saved.id || key.slice(0, 3).toUpperCase() + "-" + crypto.randomUUID().slice(0, 8) }]
    }));
    setModal(null);
    setNotice("Record saved successfully");
  }
  async function remove(key, id) {
    if (!window.confirm("Delete this record?")) return;
    if (!DEMO_MODE) {
      try {
        const token = await fetchCsrfToken();
        const response = await fetch(`${AUTH_API}/api/workspace/${encodeURIComponent(key)}/${encodeURIComponent(id)}`, {
          method: "DELETE", credentials: "include", headers: { "X-CSRF-TOKEN": token },
        });
        if (!response.ok) throw new Error("Cannot delete the record from the server.");
      } catch (error) { setNotice(error.message || "Delete failed"); return; }
    }
    setDb(old => ({ ...old, [key]: old[key].filter(x => x.id !== id) }));
    setNotice("Record deleted");
  }
  function exportCsv(key) {
    const cols = schema[page].columns;
    const escape = csvCell;
    const csv = [
      cols.join(","),
      ...db[key].map((r) => cols.map((c) => escape(r[c])).join(",")),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frostydelights-${key}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  if (authChecking) {
    return <div className="ss-auth-check" role="status">Checking your session…</div>;
  }
  if (!user) {
    if (wholesaleView) {
      return <WholesaleRegister onBack={() => showWholesalePage(false)} />;
    }
    return (
      <Login
        onWholesaleRegister={() => showWholesalePage(true)}
        onLogin={(value) => {
          window.history.replaceState({}, "", "/");
          setPage("Dashboard");
          setUser(value);
        }}
      />
    );
  }
  if (workspaceLoading) return <div className="ss-auth-check" role="status">Loading your factory workspace…</div>;
  return (
    <div className="app">
      <aside className={"sidebar " + (sidebar ? "show" : "")}>
        <div className="brand">
          <div className="brand-icon">

                <img
                  src="/IMG_2313.PNG"
                  alt="Sathutu Sina Dairies Logo"
                  className="sidebar-logo"
                />

          </div>
          <div>
            <b>Sathutu Sina</b>
            <small>Factory Management</small>
          </div>
          <button className="mobile-close" onClick={() => setSidebar(false)}>
            <X />
          </button>
        </div>
        <div className="nav-scroll">
          {user.role === "Admin" && (
            <div className="nav-group">
              <div className="nav-label">BUSINESS PARTNERS</div>
              <button className={"nav-item " + (page === "Wholesale Customers" ? "active" : "")}
                onClick={() => navigate("Wholesale Customers")}>
                <Building2 size={18} /><span>Wholesale Customers</span>
                {page === "Wholesale Customers" && <ChevronRight size={15} />}
              </button>
            </div>
          )}
          {menuGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-label">{group.label}</div>
              {group.items.filter(allowed).map((item) => {
                const Icon = icons[item];
                return (
                  <button
                    key={item}
                    className={"nav-item " + (page === item ? "active" : "")}
                    onClick={() => navigate(item)}
                  >
                    <Icon size={18} />
                    <span>{item}</span>
                    {page === item && <ChevronRight size={15} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="profile-dot">{user.name[0].toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
          <button title="Logout" onClick={handleLogout}>
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebar(true)}>
            <Menu />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <span className={"workspace-env " + (DEMO_MODE ? "" : "real")}>{DEMO_MODE ? "DEMO MODE" : "CONNECTED"}</span>
            <span className="today">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button className="bell" onClick={() => navigate("Notifications")}>
              <Bell size={19} />
              {db.notifications.length > 0 && <i />}
            </button>
            <div className="avatar">{user.name[0].toUpperCase()}</div>
          </div>
        </header>
        <main className="content">
          {page === "Wholesale Customers" && user.role === "Admin" ? (
            <div className="wholesale-workspace"><div className="page-heading"><div><div className="eyebrow">BUSINESS RELATIONSHIPS</div><h1>Wholesale Customers</h1><p>Review and manage wholesale customer registration requests.</p></div></div><WholesaleApplicationsPanel showAll /></div>
          ) : page === "Dashboard" ? (
            <Dashboard db={db} user={user} navigate={navigate} />
          ) : page === "Reports" ? (
            <Reports db={db} />
          ) : page === "Notifications" ? (
            <Notifications db={db} setDb={setDb} />
          ) : schema[page] ? (
            <DataPage
              title={page}
              config={schema[page]}
              data={db[schema[page].key]}
              search={search}
              setSearch={setSearch}
              onAdd={() => setModal({ page, record: null })}
              onEdit={(record) => setModal({ page, record })}
              onDelete={(id) => remove(schema[page].key, id)}
              onExport={() => exportCsv(schema[page].key)}
            />
          ) : null}
        </main>
      </div>
      {modal && (
        <RecordModal
          config={schema[modal.page]}
          title={modal.page}
          record={modal.record}
          onClose={() => setModal(null)}
          onSave={(record) => update(schema[modal.page].key, record)}
        />
      )}
      {notice && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
    </div>
  );
}

function Login({ onLogin, onWholesaleRegister }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (DEMO_MODE) {
      const match = DEMO_USERS.find((u) =>
        u.email === email.trim().toLowerCase() && u.password === password && u.role === role
      );
      if (!match) { setError("Incorrect email, role, or password."); return; }
      const profile = { name: match.name, email: match.email, role: match.role };
      sessionStorage.setItem("sathutu_demo_user", JSON.stringify(profile));
      onLogin(profile);
      return;
    }
    setLoading(true);

    try {
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`${AUTH_API}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          role,
          password,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Incorrect email, role or password.");
      }
      // Only trust the role sent by your authenticated backend.
      if (!result.user?.name || !access[result.user.role]) {
        throw new Error("Invalid user profile returned.");
      }
      onLogin(result.user);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the login server. Check that your system is running."
          : err.message || "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ss-login">
      {/* Purple left panel. Decorative images are separate so there are no hard edges. */}
      <section className="ss-login-left">
        <div className="ss-factory-image" aria-hidden="true" />
        <div className="ss-artwork" aria-hidden="true" />
        <div className="ss-milk-wave" aria-hidden="true" />

        <header className="ss-brand">
          <div className="ss-brand-logo">
            <img src="/IMG_2313.PNG" alt="Sathutu Sina Dairies logo" />
          </div>
          <span className="ss-brand-separator" aria-hidden="true" />
          <div className="ss-brand-name">
            <strong>Sathutu Sina</strong>
            <span>DAIRIES MANAGEMENT</span>
          </div>
        </header>

        <div className="ss-login-intro">
          <div className="ss-platform-badge">
            <Factory size={21} aria-hidden="true" />
            <span>FACTORY MANAGEMENT PLATFORM</span>
          </div>
          <h1>
            Smarter operations.<br />
            Better <em>together.</em>
          </h1>
          <p>
            A unified workspace to manage your people, production,
            inventory and daily factory operations with confidence.
          </p>
          <div className="ss-feature-list" aria-label="Management modules">
            <div className="ss-feature"><Settings size={30} /><span>Production</span></div>
            <div className="ss-feature"><Boxes size={30} /><span>Inventory</span></div>
            <div className="ss-feature"><Users size={30} /><span>Workforce</span></div>
          </div>
          <div className="ss-connected-card">
            <span className="ss-connected-icon" aria-hidden="true">✦</span>
            <div>
              <strong>One connected workspace</strong>
              <span>Everything your team needs, in one place.</span>
            </div>
          </div>
        </div>
        <footer className="ss-left-footer">
          © {new Date().getFullYear()} Sathutu Sina Dairies. All rights reserved.
        </footer>
      </section>

      {/* White sign-in panel; contains live form controls, not a screenshot. */}
      <section className="ss-login-right">
        <form className="ss-login-form" onSubmit={handleLogin}>
          <div className="ss-welcome">
            <img className="ss-welcome-logo" src="/IMG_2313.PNG" alt="Sathutu Sina logo" />
            <h2>Welcome back!</h2>
            <p>Sign in to your factory management portal</p>
          </div>

          <div className="ss-form-field">
            <label htmlFor="ss-email"><Mail size={19} />Email address</label>
            <div className="ss-input-wrap">
              <Mail className="ss-field-icon" size={20} aria-hidden="true" />
              <input
                id="ss-email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="ss-form-field">
            <label htmlFor="ss-role"><ShieldCheck size={19} />Select your role</label>
            <div className="ss-input-wrap">
              <Users className="ss-field-icon" size={20} aria-hidden="true" />
              <select
                id="ss-role"
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                required
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item === "Admin" ? "Administrator" : item === "Staff" ? "Staff Member" : item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ss-form-field">
            <label htmlFor="ss-password"><LockKeyhole size={19} />Password</label>
            <div className="ss-input-wrap">
              <LockKeyhole className="ss-field-icon" size={20} aria-hidden="true" />
              <input
                id="ss-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="ss-toggle-password"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {error && <p className="ss-login-error" role="alert">{error}</p>}
          <button className="ss-submit" disabled={loading} type="submit">
            <span>{loading ? "Signing in…" : "Enter Dashboard"}</span>
            {!loading && <ChevronRight size={24} aria-hidden="true" />}
          </button>
          <div className="ss-demo-note">
            <Info size={23} aria-hidden="true" />
            <span>{DEMO_MODE ? "Preview mode:  use the  credential in the README to check the workspace. No backend required." : "Authorized staff only. Use your assigned email, role and password."}</span>
          </div>
          <div className="ws-register-prompt">
            <span>Buying in bulk for your business?</span>
            <button type="button" onClick={onWholesaleRegister}>
              Register as a wholesale customer <ChevronRight size={17} />
            </button>
          </div>
        </form>
        <footer className="ss-right-footer">
          <Factory size={19} aria-hidden="true" />
          Sathutu Sina Dairies · Internal Staff Portal
        </footer>
      </section>
    </div>
  );
}

// Sample weekly production figures for the Dashboard chart.
// Replace with values from your backend when production reporting is connected.
const trend = [
  { day: "Mon", value: 1450 },
  { day: "Tue", value: 1950 },
  { day: "Wed", value: 1750 },
  { day: "Thu", value: 2450 },
  { day: "Fri", value: 1900 },
  { day: "Sat", value: 2000 },
  { day: "Sun", value: 2550 },
];

function WholesaleRegister({ onBack }) {
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessRegistrationNumber: "",
    deliveryAddress: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (form.password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const email = form.email.trim().toLowerCase();
        if (getDemoApplications().some(item => item.email === email)) {
          throw new Error("A wholesale registration with this email already exists in this demo.");
        }
        const application = {
          id: crypto.randomUUID(), businessName: form.businessName.trim(),
          contactPerson: form.contactPerson.trim(), email,
          phone: form.phone.trim(), businessRegistrationNumber: form.businessRegistrationNumber.trim(),
          deliveryAddress: form.deliveryAddress.trim(), status: "PENDING",
          createdAt: new Date().toISOString(), reviewedAt: null
        };
        saveDemoApplications([application, ...getDemoApplications()]);
        setSuccess({ referenceId: application.id, status: application.status });
        setForm(current => ({ ...current, password: "", confirmPassword: "" }));
        return;
      }
      const csrfToken = await fetchCsrfToken();
      const { confirmPassword, ...fields } = form;
      const response = await fetch(`${AUTH_API}/api/wholesale/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
        body: JSON.stringify({ ...fields, email: fields.email.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to register. Check your details.");
      setSuccess(data);
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err instanceof TypeError
        ? "Cannot connect to the server. Check that Spring Boot is running."
        : err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ws-page">
      <aside className="ws-side">
        <div className="ws-brand">
          <img src="/IMG_2313.PNG" alt="Sathutu Sina logo" />
          <div><strong>Sathutu Sina</strong><span>WHOLESALE PARTNERS</span></div>
        </div>
        <div className="ws-side-copy">
          <span className="ws-tag"><Building2 size={17} /> BUSINESS PARTNERSHIP</span>
          <h1>Grow your business <em>with us.</em></h1>
          <p>Apply to become a registered wholesale customer of Sathutu Sina Dairies.</p>
          <div className="ws-benefit"><BadgeCheck size={22} /> Dedicated wholesale application process</div>
          <div className="ws-benefit"><BadgeCheck size={22} /> Administrator-reviewed accounts</div>
          <div className="ws-benefit"><BadgeCheck size={22} /> One place for your business details</div>
        </div>
        <small>© {new Date().getFullYear()} Sathutu Sina Dairies</small>
      </aside>
      <main className="ws-main">
        <div className="ws-card">
          <button className="ws-back" type="button" onClick={onBack}>
            <ArrowLeft size={18} /> Back to staff login
          </button>
          {success ? (
            <div className="ws-success" role="status">
              <BadgeCheck size={52} />
              <h2>Registration submitted!</h2>
              <p>Your wholesale account application is <strong>pending administrator approval</strong>.</p>
              <p className="ws-reference">Reference: <code>{success.referenceId}</code></p>
              <p>You cannot sign in to the internal staff dashboard with this account.</p>
              <button type="button" className="ws-submit" onClick={onBack}>Return to staff login</button>
            </div>
          ) : (
            <>
              <div className="ws-heading">
                <span>WHOLESALE REGISTRATION</span>
                <h2>Create your business account</h2>
                <p>Complete the form to request wholesale customer access.</p>
              </div>
              <form className="ws-form" onSubmit={submit}>
                <div className="ws-grid">
                  <label>Business name <span>*</span>
                    <input required maxLength={120} value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Business / shop name" />
                  </label>
                  <label>Contact person <span>*</span>
                    <input required maxLength={100} value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} placeholder="Full name" />
                  </label>
                  <label>Business email <span>*</span>
                    <input required type="email" maxLength={150} autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@business.com" />
                  </label>
                  <label>Phone number <span>*</span>
                    <input required type="tel" minLength={7} maxLength={25} autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+94 77 123 4567" />
                  </label>
                  <label className="ws-wide">Business registration number (optional)
                    <input maxLength={80} value={form.businessRegistrationNumber} onChange={(e) => update("businessRegistrationNumber", e.target.value)} placeholder="Business registration reference" />
                  </label>
                  <label className="ws-wide">Delivery address <span>*</span>
                    <textarea required maxLength={600} rows={3} value={form.deliveryAddress} onChange={(e) => update("deliveryAddress", e.target.value)} placeholder="Street, city, district" />
                  </label>
                  <label>Password <span>*</span>
                    <input required minLength={10} maxLength={72} type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 10 characters" />
                  </label>
                  <label>Confirm password <span>*</span>
                    <input required minLength={10} maxLength={72} type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Enter password again" />
                  </label>
                </div>
                <label className="ws-show-password">
                  <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show passwords
                </label>
                {error && <p className="ws-error" role="alert">{error}</p>}
                <button className="ws-submit" type="submit" disabled={loading}>
                  {loading ? "Submitting…" : "Submit wholesale registration"} {!loading && <ChevronRight size={19} />}
                </button>
                <p className="ws-disclaimer">Your application is reviewed before approval. This does not grant access to the internal staff portal.</p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function WholesaleApplicationsPanel({ showAll = false }) {
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function refresh() {
    try {
      if (DEMO_MODE) {
        setItems(getDemoApplications());
        setError("");
        return;
      }
      const response = await fetch(`${AUTH_API}/api/wholesale/applications`, {
        credentials: "include",
      });
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body.message || "Could not load applications");
      setItems(body);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function review(id, action) {
    setBusy(id);
    setError("");
    setInfo("");
    try {
      if (DEMO_MODE) {
        const rows = getDemoApplications().map(item =>
          item.id === id && item.status === "PENDING"
            ? { ...item, status: action === "approve" ? "APPROVED" : "REJECTED", reviewedAt: new Date().toISOString() }
            : item
        );
        saveDemoApplications(rows);
        setInfo(`Application ${action === "approve" ? "approved" : "rejected"}.`);
        await refresh();
        return;
      }
      const csrfToken = await fetchCsrfToken();
      const response = await fetch(`${AUTH_API}/api/wholesale/applications/${encodeURIComponent(id)}/${action}`, {
        method: "POST", credentials: "include", headers: { "X-CSRF-TOKEN": csrfToken },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to review application");
      setInfo(`Application ${action === "approve" ? "approved" : "rejected"}.`);
      await refresh();
    } catch (err) { setError(err.message || "Review failed"); }
    finally { setBusy(""); }
  }

  const pending = items.filter((item) => item.status === "PENDING");
  const visible = (showAll ? items : pending).filter(item =>
    (!showAll || filter === "ALL" || item.status === filter) &&
    [item.businessName, item.contactPerson, item.email, item.phone].some(value =>
      String(value || "").toLowerCase().includes(query.toLowerCase())
    )
  );
  return (
    <section className="ws-review-panel" aria-labelledby="ws-app-heading">
      <div className="ws-review-heading">
        <div><span className="eyebrow">WHOLESALE PARTNERS</span><h3 id="ws-app-heading">{showAll ? "Wholesale customer applications" : "Customer registration requests"}</h3></div>
        <span className="ws-count">{pending.length} pending</span>
      </div>
      {loading && <p>Loading wholesale applications…</p>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {info && <p className="ws-info" role="status">{info}</p>}
      {showAll && <div className="ws-review-tools">
        <input aria-label="Search wholesale customers" placeholder="Search business, contact or email..." value={query} onChange={event => setQuery(event.target.value)} />
        <select aria-label="Filter application status" value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="ALL">All applications</option><option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
        </select>
        <button type="button" className="btn-mini" onClick={refresh}>Refresh</button>
      </div>}
      {!loading && visible.length === 0 && <p>No applications match your selection.</p>}
      {visible.map((app) => (
        <div key={app.id} className="ws-application">
          <div className="ws-app-details">
            <strong>{app.businessName}</strong>
            <span>{app.contactPerson} · {app.email} · {app.phone}</span>
            <small>{app.deliveryAddress}</small>
            {app.businessRegistrationNumber && <small>Business reg. no.: {app.businessRegistrationNumber}</small>}
          </div>
          <div className="ws-app-actions">
            {app.status === "PENDING" ? <>
              <button type="button" disabled={busy === app.id} onClick={() => review(app.id, "approve")}>Approve</button>
              <button type="button" disabled={busy === app.id} onClick={() => review(app.id, "reject")}>Reject</button>
            </> : <Status value={app.status} />}
          </div>
        </div>
      ))}
      <p className="ws-review-footnote">Approving a registration records the decision only. Customer ordering/login requires a separate wholesale portal.</p>
    </section>
  );
}

function Dashboard({ db, user, navigate }) {
  const stock = db.products.reduce((a, x) => a + Number(x.stock || 0), 0);
  const expiring = db.products.filter(
    (x) => dateDiff(x.expiry) >= 0 && dateDiff(x.expiry) <= 14,
  );
  const low = db.materials.filter((x) => Number(x.quantity) < Number(x.min));
  const metrics = [
    {
      label: "Total Employees",
      value: db.employees.length,
      icon: Users,
      color: "purple",
      detail: "Factory workforce",
    },
    {
      label: "Production Batches",
      value: db.batches.length,
      icon: Factory,
      color: "pink",
      detail: "Recorded batches",
    },
    {
      label: "Total Product Stock",
      value: stock.toLocaleString(),
      icon: Package,
      color: "blue",
      detail: "Units available",
    },
    {
      label: "Expiry Alerts",
      value: expiring.length,
      icon: AlertTriangle,
      color: "red",
      detail: "Within next 14 days",
    },
  ];
  const pie = [
    {
      name: "Cool Rooms",
      value: db.rooms.reduce((a, r) => a + Number(r.occupied || 0), 0),
      color: "#8b5cf6",
    },
    {
      name: "Outlets",
      value: db.outlets.reduce((a, r) => a + Number(r.stock || 0), 0),
      color: "#38bdf8",
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FACTORY OVERVIEW</div>
          <h1>
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {user.name.split(" ")[0]} 👋
          </h1>
          <p>Here's what's happening at your factory today.</p>
        </div>
        <span className="role-chip">{user.role}</span>
      </div>
      <div className="metric-grid">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div className={"metric " + m.color} key={m.label}>
              <div className="metric-icon">
                <Icon size={24} />
              </div>
              <span>{m.label}</span>
              <strong>{m.value}</strong>
              <small>{m.detail}</small>
            </div>
          );
        })}
      </div>
      {user.role === "Admin" && <WholesaleApplicationsPanel />}
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-title">
            <h3>Production Overview</h3>
            <span className="subtle-pill">Trend</span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient
                    id="productionFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#9065ef" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#9065ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf0f6" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9065ef"
                  strokeWidth={3}
                  fill="url(#productionFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel inventory-panel">
          <div className="panel-title">
            <h3>Inventory by Location</h3>
          </div>
          <div className="pie-layout">
            <div className="pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    {pie.map((p) => (
                      <Cell key={p.name} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              {pie.map((p) => (
                <div key={p.name}>
                  <i style={{ background: p.color }} />
                  <span>{p.name}</span>
                  <strong>{p.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel alert-panel">
          <div className="panel-title">
            <h3>Notifications</h3>
            <button
              className="text-button"
              onClick={() => navigate("Notifications")}
            >
              View all
            </button>
          </div>
          {[
            ...low.map((x) => ({
              title: `Low stock: ${x.name}`,
              type: "warning",
            })),
            ...expiring.map((x) => ({
              title: `Expiring soon: ${x.name}`,
              type: "warning",
            })),
            ...db.notifications,
          ]
            .slice(0, 4)
            .map((n, i) => (
              <div className="alert-item" key={i}>
                <div className={"alert-icon " + n.type}>
                  {n.type === "warning" ? (
                    <AlertTriangle size={17} />
                  ) : (
                    <Bell size={17} />
                  )}
                </div>
                <span>{n.title}</span>
              </div>
            ))}
          {!low.length && !expiring.length && !db.notifications.length && (
            <p>No active notifications.</p>
          )}
        </section>
        <section className="panel orders-panel">
          <div className="panel-title">
            <h3>Recent Orders</h3>
            <button className="text-button" onClick={() => navigate("Orders")}>
              View all
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer / Outlet</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {db.orders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.id}</strong>
                    </td>
                    <td>{o.customer}</td>
                    <td>{o.quantity}</td>
                    <td>
                      <Status value={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel">
          <div className="panel-title">
            <h3>Top Products</h3>
          </div>
          {[...db.products]
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 4)
            .map((p) => (
              <div className="product-item" key={p.id}>
                <div className="product-emoji">🍨</div>
                <span>{p.name}</span>
                <strong>{Number(p.stock).toLocaleString()} units</strong>
              </div>
            ))}
        </section>
        <section className="panel">
          <div className="panel-title">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-grid">
            {[
              { name: "Production", icon: Factory },
              { name: "Products", icon: Package },
              { name: "Deliveries", icon: Truck },
              { name: "Reports", icon: BarChart3 },
            ]
              .filter(
                (x) => !access[user.role] || access[user.role].includes(x.name),
              )
              .map((x) => {
                const Icon = x.icon;
                return (
                  <button key={x.name} onClick={() => navigate(x.name)}>
                    <Icon size={25} />
                    <span>{x.name}</span>
                  </button>
                );
              })}
          </div>
        </section>
      </div>
    </>
  );
}
function Status({ value }) {
  const s = String(value || "");
  return (
    <span
      className={
        "status " +
        (/^(completed|active|present|approved|available|paid|verified)$/i.test(
          s,
        )
          ? "success"
          : /pending|progress|leave/i.test(s)
            ? "pending"
            : "neutral")
      }
    >
      {s}
    </span>
  );
}
function DataPage({
  title,
  config,
  data,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
  onExport,
}) {
  const filtered = useMemo(
    () =>
      data.filter((x) =>
        Object.values(x).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    [data, search],
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MANAGEMENT MODULE</div>
          <h1>{title}</h1>
          <p>Manage and review your {title.toLowerCase()} records.</p>
          {title === "Payroll" && (
            <p>
              Payroll amounts are manual records. Statutory contribution
              calculations require confirmed rules.
            </p>
          )}
          {title === "Stock Transfers" && (
            <p>
              Transfer log only: balances are not automatically moved.
            </p>
          )}
          {title === "Payments" && (
            <p>Recordkeeping only. This screen does not process payments.</p>
          )}
        </div>
        <button className="primary" onClick={onAdd}>
          <Plus size={18} /> Add Record
        </button>
      </div>
      <div className="panel data-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>
          <button className="outline" onClick={onExport}>
            <Download size={17} /> Export CSV
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c}>{label(c)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  {config.columns.map((c) => (
                    <td key={c}>
                      {c === "status" ? (
                        <Status value={r[c]} />
                      ) : [
                          "salary",
                          "amount",
                          "price",
                          "basic",
                          "overtime",
                          "deductions",
                        ].includes(c) ? (
                        money(r[c])
                      ) : (
                        String(r[c] ?? "—")
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <button title="Edit" onClick={() => onEdit(r)}>
                        <Edit3 size={16} />
                      </button>
                      <button
                        title="Delete"
                        className="danger"
                        onClick={() => onDelete(r.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="empty" colSpan={config.columns.length + 1}>
                    No matching records. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing {filtered.length} of {data.length} records{" "}
          <span>{DEMO_MODE ? "workspace data" : "Records saved to Spring Boot database"}</span>
        </div>
      </div>
    </>
  );
}
const label = (k) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (x) => x.toUpperCase());
function RecordModal({ config, title, record, onClose, onSave }) {
  const [form, setForm] = useState(
    record || Object.fromEntries(config.fields.map((k) => [k, ""])),
  );
  const [error, setError] = useState("");
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title + " record"}
        onSubmit={(e) => {
          e.preventDefault();
          const message = validateRecord(form, config.fields);
          if (message) {
            setError(message);
            return;
          }
          onSave(
            Object.fromEntries(
              Object.entries(form).map(([k, v]) => [
                k,
                typeof v === "string" ? v.trim() : v,
              ]),
            ),
          );
        }}
      >
        <div className="modal-header">
          <h2>
            {record ? "Edit" : "Add"} {title} Record
          </h2>
          <button type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-fields">
          {config.fields.map((k) => (
            <label key={k}>
              {label(k)}
              {choices[title]?.[k] ? (
                <select
                  required
                  value={form[k] ?? ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                >
                  <option value="">Select {label(k).toLowerCase()}</option>
                  {choices[title][k].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  min="0"
                  step="any"
                  required
                  value={form[k] ?? ""}
                  type={
                    [
                      "quantity",
                      "price",
                      "stock",
                      "salary",
                      "amount",
                      "min",
                      "capacity",
                      "occupied",
                      "basic",
                      "overtime",
                      "deductions",
                    ].includes(k)
                      ? "number"
                      : k === "month"
                        ? "month"
                        : k === "checkIn" || k === "checkOut"
                          ? "time"
                          : k === "date" ||
                              k === "expiry" ||
                              k === "from" ||
                              k === "to"
                            ? "date"
                            : "text"
                  }
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  placeholder={`Enter ${label(k).toLowerCase()}`}
                />
              )}
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button className="outline" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}


function Reports({ db }) {
  const cards = [
    { name: "Employee Count", value: db.employees.length },
    {
      name: "Stock Units",
      value: db.products.reduce((a, x) => a + Number(x.stock || 0), 0),
    },
    {
      name: "Sales Revenue",
      value: money(db.sales.reduce((a, x) => a + Number(x.amount || 0), 0)),
    },
    {
      name: "Recorded Wastage",
      value: db.returns.reduce((a, x) => a + Number(x.quantity || 0), 0),
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ANALYTICS</div>
          <h1>Reports & Insights</h1>
          <p>Summary of data recorded.</p>
        </div>
      </div>
      <div className="metric-grid">
        {cards.map((c) => (
          <div className="metric purple" key={c.name}>
            <span>{c.name}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>
      <div className="panel report-panel">
        <h3>Module Reports</h3>
        <p>
          Open a module and select <strong>Export CSV</strong> to download its
          current records. 
        </p>
        <div className="report-list">
          {Object.entries(schema).map(([name, c]) => (
            <div key={name}>
              <span>{name}</span>
              <strong>{db[c.key].length} records</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}



function Notifications({ db, setDb }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">UPDATES</div>
          <h1>Notifications</h1>
          <p>Alerts about factory operations.</p>
        </div>
        <button
          className="outline"
          onClick={() => setDb((d) => ({ ...d, notifications: [] }))}
        >
          Clear All
        </button>
      </div>
      <div className="panel notice-panel">
        {db.notifications.length ? (
          db.notifications.map((n) => (
            <div className="notice-row" key={n.id}>
              <div className={"alert-icon " + n.type}>
                <Bell size={18} />
              </div>
              <div>
                <strong>{n.title}</strong>
                <small>{n.date}</small>
              </div>
              <button
                onClick={() =>
                  setDb((d) => ({
                    ...d,
                    notifications: d.notifications.filter((x) => x.id !== n.id),
                  }))
                }
              >
                <X size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="empty">You're all caught up!</div>
        )}
      </div>
    </>
  );
}
