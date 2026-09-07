

// export default App;
import React, {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  auth,
  api,
  adminApi,
  studentApi,
  workerApi,
} from "./api";

import {
  LayoutDashboard,
  Users,
  BedDouble,
  IndianRupee,
  MessageSquareWarning,
  Utensils,
  Bus,
  ShieldCheck,
  LogOut,
  Megaphone,
  CalendarDays,
  UserRound,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Edit,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  BadgeCheck,
} from "lucide-react";

/* =========================================================
   AUTH
========================================================= */

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("hostelUser") || "null"
      );
    } catch {
      return null;
    }
  });

  function saveUser(u) {
    setUser(u);

    if (u) {
      localStorage.setItem(
        "hostelUser",
        JSON.stringify(u)
      );
    } else {
      localStorage.removeItem("hostelUser");
    }
  }

  const value = {
    user,

    login: saveUser,

    logout: async () => {
      try {
        await auth.logout();
      } catch {}

      saveUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function Protected({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    role &&
    user.role !== role
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

/* =========================================================
   NAVIGATION
========================================================= */

const navAdmin = [
  ["Dashboard", "/", LayoutDashboard],
  ["Students", "/students", Users],
  ["Rooms", "/rooms", BedDouble],
  ["Fees", "/fees", IndianRupee],
  [
    "Complaints",
    "/complaints",
    MessageSquareWarning,
  ],
  ["Mess", "/mess", Utensils],
  ["Bus", "/bus", Bus],
  ["KYC", "/kyc", ShieldCheck],
  ["Outings", "/outings", CalendarDays],
  [
    "Announcements",
    "/announcements",
    Megaphone,
  ],
  ["Workers", "/workers", Users],
  ["Profile", "/profile", UserRound],
];

const navWorker = [
  ["Dashboard", "/", LayoutDashboard],
  ["Lunchboxes", "/lunchboxes", Utensils],
  ["Profile", "/profile", UserRound],
];

const navStudent = [
  ["Dashboard", "/", LayoutDashboard],
  ["My Fees", "/fees", IndianRupee],
  [
    "Complaints",
    "/complaints",
    MessageSquareWarning,
  ],
  ["Mess", "/mess", Utensils],
  ["Bus", "/bus", Bus],
  ["Outing", "/outing", CalendarDays],
  ["KYC", "/kyc", ShieldCheck],
  [
    "Announcements",
    "/announcements",
    Megaphone,
  ],
  ["Profile", "/profile", UserRound],
];

/* =========================================================
   SHELL
========================================================= */

function Shell({ children }) {
  const { user, logout } = useAuth();

  const location = useLocation();

  const nav =
    user?.role === "admin"
      ? navAdmin
      : user?.role === "worker"
      ? navWorker
      : navStudent;

  const current = nav.find(
    (item) =>
      item[1] === location.pathname
  );

  return (
    <>
      <style>{`
        /* =====================================================
           MOBILE RESPONSIVE TABLES + SIDEBAR
        ===================================================== */

        @media (max-width: 700px) {
          .table-wrap {
            width: 100%;
            overflow-x: visible !important;
          }

          .table-wrap table {
            width: 100% !important;
            min-width: 0 !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
          }

          .table-wrap thead {
            display: none;
          }

          .table-wrap tbody,
          .table-wrap tr,
          .table-wrap td {
            display: block;
            width: 100%;
            box-sizing: border-box;
          }

          .table-wrap tbody tr {
            margin: 0 0 14px;
            padding: 8px 0;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: #fff;
            overflow: hidden;
          }

          .table-wrap tbody tr:last-child {
            margin-bottom: 0;
          }

          .table-wrap tbody td {
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr);
            align-items: center;
            gap: 12px;
            min-height: 42px;
            padding: 9px 14px;
            border: 0 !important;
            border-bottom: 1px solid #edf1f5 !important;
            color: #172b46;
            overflow-wrap: anywhere;
          }

          .table-wrap tbody td:last-child {
            border-bottom: 0 !important;
          }

          .table-wrap tbody td::before {
            content: attr(data-label);
            color: #7183a0;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .55px;
            text-transform: uppercase;
          }

          .table-wrap tbody td.actions {
            display: grid !important;
            grid-template-columns: 92px minmax(0, 1fr) !important;
            align-items: center;
            gap: 12px;
          }

          .table-wrap tbody td.actions > * {
            justify-self: start;
          }

          .table-wrap tbody td.actions::before {
            content: "Actions";
          }

          .table-wrap tbody td[colspan] {
            display: block;
            border: 0 !important;
          }

          .table-wrap tbody td[colspan]::before {
            display: none;
          }

          .table-wrap .icon {
            width: 38px;
            height: 38px;
            min-width: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .table-wrap .badge {
            width: fit-content;
            max-width: 100%;
            white-space: normal;
          }

          /* Mobile sidebar: icons remain visible, text is hidden. */
          .app > aside {
            width: 72px !important;
            min-width: 72px !important;
            padding: 16px 8px !important;
          }

          .app > aside .brand {
            justify-content: center;
          }

          .app > aside .brand > div:not(.logo) {
            display: none;
          }

          .app > aside .nav a {
            width: 56px;
            min-height: 48px;
            box-sizing: border-box;
            padding: 12px !important;
            margin: 2px auto;
            justify-content: center !important;
            gap: 0 !important;
            font-size: 0 !important;
          }

          .app > aside .nav a svg {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px;
            display: block !important;
            flex: 0 0 20px;
            stroke-width: 2;
          }

          .app > aside .logout {
            width: 56px;
            min-height: 48px;
            margin: 8px auto 0;
            padding: 12px !important;
            justify-content: center !important;
            gap: 0 !important;
            font-size: 0 !important;
          }

          .app > aside .logout svg {
            width: 20px !important;
            height: 20px !important;
            min-width: 20px;
            display: block !important;
            flex: 0 0 20px;
          }

          .app > main {
            min-width: 0;
          }

          .app > main .content {
            min-width: 0;
            overflow-x: hidden;
          }
        }

        /* =====================================================
           EXTRA MOBILE POLISH
        ===================================================== */

        @media (max-width: 700px) {
          .app > main {
            width: calc(100vw - 72px);
            max-width: calc(100vw - 72px);
          }

          .app > main .content {
            width: 100%;
            box-sizing: border-box;
            padding-left: 14px !important;
            padding-right: 14px !important;
            padding-bottom: 24px !important;
          }

          .app > main .content > * {
            max-width: 100%;
            box-sizing: border-box;
          }

          .app > main h1 {
            font-size: clamp(25px, 7vw, 34px) !important;
            line-height: 1.15 !important;
          }

          .app > main h2 {
            font-size: 20px !important;
          }

          .app > main h3 {
            font-size: 17px !important;
          }

          .app button,
          .app input,
          .app select,
          .app textarea {
            max-width: 100%;
            box-sizing: border-box;
          }

          .app button {
            min-height: 42px;
          }

          /* Prevent large desktop cards from creating cramped mobile layouts. */
          .app .card,
          .app .panel,
          .app .table-card {
            max-width: 100%;
            box-sizing: border-box;
          }

          /* Worker registration */
          .worker-registration-layout {
            grid-template-columns: 1fr !important;
            border-radius: 14px !important;
          }

          .worker-registration-layout > div:first-child {
            border-right: 0 !important;
            border-bottom: 1px solid #e2e8f0;
            padding: 22px 18px !important;
          }

          .worker-registration-layout > div:last-child {
            padding: 0 !important;
          }

          .worker-registration-layout .worker-form-grid,
          .worker-registration-layout .worker-address-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .worker-registration-layout label {
            min-width: 0;
          }

          .worker-registration-layout input,
          .worker-registration-layout select {
            width: 100% !important;
          }

          /* Make page action rows wrap instead of overflowing. */
          .app .page-actions,
          .app .actions-row {
            flex-wrap: wrap !important;
          }

          /* Search/filter sections become one column. */
          .app .search-grid,
          .app .filter-grid {
            grid-template-columns: 1fr !important;
          }

          /* Fee pills and long values should wrap naturally. */
          .app .fee-installments,
          .app .installments,
          .app .badges {
            flex-wrap: wrap !important;
          }

          /* Worker lunchbox table uses its own table wrapper. */
          .worker-lunch-table-wrap {
            overflow-x: visible !important;
          }

          .worker-lunch-table-wrap table {
            min-width: 0 !important;
          }

          .worker-lunch-table-wrap thead {
            display: none;
          }

          .worker-lunch-table-wrap tbody,
          .worker-lunch-table-wrap tr,
          .worker-lunch-table-wrap td {
            display: block;
            width: 100%;
            box-sizing: border-box;
          }

          .worker-lunch-table-wrap tbody tr {
            margin-bottom: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
          }

          .worker-lunch-table-wrap td {
            display: grid;
            grid-template-columns: 82px minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            padding: 10px 12px;
            border-bottom: 1px solid #edf1f5;
            overflow-wrap: anywhere;
          }

          .worker-lunch-table-wrap td:last-child {
            border-bottom: 0;
          }

          .worker-lunch-table-wrap td:nth-child(1)::before { content: "Student"; }
          .worker-lunch-table-wrap td:nth-child(2)::before { content: "Room"; }
          .worker-lunch-table-wrap td:nth-child(3)::before { content: "College"; }
          .worker-lunch-table-wrap td:nth-child(4)::before { content: "Phone"; }
          .worker-lunch-table-wrap td:nth-child(5)::before { content: "Status"; }

          .worker-lunch-table-wrap td::before {
            color: #7183a0;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: .55px;
            text-transform: uppercase;
          }

          /* Keep important icons/buttons visible and touch friendly. */
          .app svg {
            flex-shrink: 0;
          }

          .app .icon-button,
          .app button.icon,
          .app .icon {
            flex-shrink: 0;
          }
        }

        @media (max-width: 480px) {
          .app > main .content {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .app > aside {
            width: 64px !important;
            min-width: 64px !important;
            padding-left: 5px !important;
            padding-right: 5px !important;
          }

          .app > main {
            width: calc(100vw - 64px);
            max-width: calc(100vw - 64px);
          }

          .app > aside .nav a,
          .app > aside .logout {
            width: 50px !important;
          }

          .app > main h1 {
            font-size: 27px !important;
          }

          .worker-lunch-table-wrap td {
            grid-template-columns: 76px minmax(0, 1fr);
            padding: 9px 10px;
          }

          .worker-lunch-search-head,
          .worker-lunch-table-head {
            padding: 16px;
          }

          .worker-lunch-search-form {
            padding: 14px 16px;
          }
        }

        .fee-installments-grid {
          min-width: 0;
          width: 100%;
        }

        .fee-installments-grid > div {
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          overflow-wrap: anywhere;
        }

        /* =====================================================
           MOBILE MODALS
           Keep modal overlays inside the actual content area so
           they never extend underneath/outside the mobile sidebar.
        ===================================================== */
        .modal-overlay-responsive {
          box-sizing: border-box !important;
        }

        .modal-overlay-responsive .modal {
          box-sizing: border-box !important;
          max-width: 100% !important;
          max-height: calc(100vh - 32px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        .modal-overlay-responsive .modal form {
          width: 100%;
          min-width: 0;
        }

        .modal-overlay-responsive .modal label {
          min-width: 0;
        }

        .modal-overlay-responsive .modal input,
        .modal-overlay-responsive .modal textarea,
        .modal-overlay-responsive .modal select {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        @media (max-width: 700px) {
          .modal-overlay-responsive {
            left: 72px !important;
            right: 0 !important;
            width: calc(100vw - 72px) !important;
            max-width: calc(100vw - 72px) !important;
            padding: 14px !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }

          .modal-overlay-responsive .modal {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 16px !important;
            padding: 20px 16px !important;
          }

          .modal-overlay-responsive .modal h2 {
            padding-right: 38px;
            font-size: 20px !important;
            line-height: 1.25 !important;
            overflow-wrap: anywhere;
          }

          .modal-overlay-responsive .modal .close {
            top: 12px !important;
            right: 12px !important;
            width: 34px !important;
            height: 34px !important;
          }

          .modal-overlay-responsive .modal textarea {
            min-height: 110px;
            resize: vertical;
          }
        }

        @media (max-width: 480px) {
          .modal-overlay-responsive {
            left: 64px !important;
            width: calc(100vw - 64px) !important;
            max-width: calc(100vw - 64px) !important;
            padding: 10px !important;
          }

          .modal-overlay-responsive .modal {
            padding: 18px 13px !important;
            border-radius: 14px !important;
            max-height: calc(100vh - 20px) !important;
          }
        }

        @media (max-width: 480px) {
          .table-wrap tbody td {
            grid-template-columns: 82px minmax(0, 1fr);
            gap: 10px;
            padding: 8px 12px;
          }

          .table-wrap tbody td.actions {
            grid-template-columns: 82px minmax(0, 1fr) !important;
            gap: 10px;
          }

          .table-wrap tbody td::before {
            font-size: 9px;
          }
        }
      `}</style>

      <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">H</div>

          <div>
            <b>Hostel ERP</b>

            <small>
              Management System
            </small>
          </div>
        </div>

        <div className="nav">
          {nav.map(
            ([name, path, Icon]) => (
              <Link
                key={path}
                to={path}
                className={
                  location.pathname === path
                    ? "active"
                    : ""
                }
              >
                <Icon size={18} />
                {name}
              </Link>
            )
          )}
        </div>

        <button
          className="logout"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main>
        <header>
          <div>
            <span className="muted">
              Hostel Management
            </span>

            <h2>
              {current?.[0] ||
                "Dashboard"}
            </h2>
          </div>

          <div className="user">
            <div className="avatar">
              {user?.username?.[0]?.toUpperCase() ||
                "U"}
            </div>

            <span>
              {user?.username}
            </span>
          </div>
        </header>

        <section className="content">
          {children}
        </section>
      </main>
      </div>
    </>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const [role, setRole] =
    useState("student");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [err, setErr] =
    useState("");

  const navigate =
    useNavigate();

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setErr("");

    try {
      if (role === "admin") {
        await auth.loginAdmin({
          email,
        });
      } else if (role === "worker") {
        await auth.loginWorker({
          email,
        });
      } else {
        await auth.loginStudent({
          email,
        });
      }

      localStorage.setItem(
        "otpEmail",
        email
      );

      localStorage.setItem(
        "otpRole",
        role
      );

      navigate("/verify-otp");
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Unable to send OTP"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="logo big">
          H
        </div>

        <h1>Hostel ERP</h1>

        <p className="muted">
          Secure hostel management portal
        </p>

        <div className="tabs">
          <button
            className={
              role === "student"
                ? "selected"
                : ""
            }
            onClick={() =>
              setRole("student")
            }
          >
            Student
          </button>

          <button
            className={
              role === "admin"
                ? "selected"
                : ""
            }
            onClick={() =>
              setRole("admin")
            }
          >
            Admin
          </button>

          <button
            className={
              role === "worker"
                ? "selected"
                : ""
            }
            onClick={() =>
              setRole("worker")
            }
          >
            Worker
          </button>
        </div>

        <form onSubmit={submit}>
          <label>
            Email

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter registered email"
            />
          </label>

          {err && (
            <ErrorBox>
              {err}
            </ErrorBox>
          )}

          <button
            className="primary full"
            disabled={loading}
          >
            {loading
              ? "Sending OTP..."
              : "Continue with OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   OTP
========================================================= */

function VerifyOTP() {
  const [otp, setOtp] =
    useState("");

  const [err, setErr] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const email =
    localStorage.getItem(
      "otpEmail"
    );

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setErr("");

    try {
      const response =
        await auth.verifyOtp({
          email,
          otp,
        });

      login(response.data.user);

      navigate("/");
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      await auth.resendOtp({
        email,
      });

      setErr("");
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          "Could not resend OTP"
      );
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="logo big">
          H
        </div>

        <h1>Verify OTP</h1>

        <p className="muted">
          OTP sent to {email}
        </p>

        <form onSubmit={submit}>
          <label>
            6-digit OTP

            <input
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                )
              }
              placeholder="••••••"
            />
          </label>

          {err && (
            <ErrorBox>
              {err}
            </ErrorBox>
          )}

          <button
            className="primary full"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify & Login"}
          </button>

          <button
            type="button"
            className="linkbtn"
            onClick={resend}
          >
            Resend OTP
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function Loading() {
  return (
    <div className="loading">
      Loading...
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div className="error">
      {children}
    </div>
  );
}

function Empty({
  text = "No data found",
}) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  onClick,
}) {
  return (
    <div
      className={
        "stat" +
        (onClick
          ? " stat-clickable"
          : "")
      }
      onClick={onClick}
      role={
        onClick
          ? "button"
          : undefined
      }
      tabIndex={
        onClick
          ? 0
          : undefined
      }
      onKeyDown={(e) => {
        if (
          onClick &&
          (e.key === "Enter" ||
            e.key === " ")
        ) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div>
        <span>{label}</span>

        <strong>
          {value ?? "—"}
        </strong>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  action,
}) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>

        {action}
      </div>

      {children}
    </div>
  );
}

function Modal({
  title,
  close,
  children,
}) {
  return (
    <div className="overlay modal-overlay-responsive">
      <div className="modal">
        <button
          className="close"
          type="button"
          onClick={close}
        >
          <X size={20} />
        </button>

        <h2>{title}</h2>

        {children}
      </div>
    </div>
  );
}

function Table({
  columns,
  rows = [],
  actions,
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(
              (column) => (
                <th
                  key={column.key}
                >
                  {column.label}
                </th>
              )
            )}

            {actions && (
              <th>
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map(
              (row, index) => (
                <tr
                  key={
                    row._id ||
                    index
                  }
                >
                  {columns.map(
                    (column) => (
                      <td
                        key={
                          column.key
                        }
                        data-label={column.label}
                      >
                        {column.render
                          ? column.render(
                              row
                            )
                          : row[
                              column.key
                            ] ??
                            "—"}
                      </td>
                    )
                  )}

                  {actions && (
                    <td
                      className="actions"
                      data-label="Actions"
                    >
                      {actions(row)}
                    </td>
                  )}
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (actions
                    ? 1
                    : 0)
                }
              >
                <Empty />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const navigate =
    useNavigate();

  const [data, setData] =
    useState(null);

  const [err, setErr] =
    useState("");

  useEffect(() => {
    adminApi
      .dashboard()
      .then((response) =>
        setData(response.data)
      )
      .catch((e) =>
        setErr(
          e.response?.data?.message ||
            "Failed to load dashboard"
        )
      );
  }, []);

  if (err) {
    return (
      <ErrorBox>
        {err}
      </ErrorBox>
    );
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="welcome">
        <p className="muted">
          Welcome back
        </p>

        <h1>
          Admin Dashboard
        </h1>

        <p>
          Manage students, rooms,
          fees and hostel operations.
        </p>
      </div>

      <div className="stats">
        <Stat
          label="Total Students"
          value={
            data.students
              ?.totalStudents
          }
          icon={Users}
        />

        <Stat
          label="Active Students"
          value={
            data.students
              ?.activeStudents
          }
          icon={Users}
        />

        <Stat
          label="Available Rooms"
          value={
            data.rooms
              ?.availableRooms
          }
          icon={BedDouble}
        />

        <Stat
          label="Pending Complaints"
          value={
            data.complaints
              ?.pendingComplaints
          }
          icon={
            MessageSquareWarning
          }
          onClick={() =>
            navigate(
              "/complaints?status=pending"
            )
          }
        />

        <Stat
          label="Total Pending Fees"
          value={`₹${Number(
            data.fees?.pendingFees || 0
          ).toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />
      </div>

      <div className="grid2">
        <Card title="Complaint Overview">
          <div className="big-number">
            {data.complaints
              ?.totalComplaints ||
              0}
          </div>

          <p className="muted">
            Total complaints
          </p>

          <div className="row">
            <span>
              Pending{" "}
              <b>
                {data.complaints
                  ?.pendingComplaints ||
                  0}
              </b>
            </span>

            <span>
              Resolved{" "}
              <b>
                {data.complaints
                  ?.resolvedComplaints ||
                  0}
              </b>
            </span>
          </div>
        </Card>

        <Card title="Room Occupancy">
          <div className="big-number">
            {data.rooms
              ?.occupiedRooms ||
              0}{" "}
            /{" "}
            {data.rooms
              ?.totalRooms ||
              0}
          </div>

          <p className="muted">
            Occupied rooms
          </p>

          <div className="progress">
            <i
              style={{
                width: `${
                  data.rooms
                    ?.totalRooms
                    ? (data.rooms
                        .occupiedRooms /
                        data.rooms
                          .totalRooms) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    studentApi
      .dashboard()
      .then((response) => setData(response.data))
      .catch((e) =>
        setErr(
          e.response?.data?.message ||
            "Failed to load dashboard"
        )
      );
  }, []);

  if (err) return <ErrorBox>{err}</ErrorBox>;
  if (!data) return <Loading />;

  const profile = data.profile?.userId;
  const menus = data.messMenu || [];
  const todayMenu = menus[0];

  return (
    <>
      <style>{`
        .student-dashboard-page {
          max-width: 1180px;
          margin: 0 auto;
        }
        .student-dashboard-hero {
          margin-bottom: 28px;
        }
        .student-dashboard-hero .eyebrow {
          margin: 0 0 8px;
          color: #7183a0;
          font-size: 14px;
          font-weight: 600;
        }
        .student-dashboard-hero h1 {
          margin: 0;
          color: #10233f;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1.08;
          letter-spacing: -1.5px;
        }
        .student-dashboard-hero p:last-child {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 16px;
        }
        .student-dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .student-dashboard-stat {
          min-height: 92px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 8px 24px rgba(15,23,42,.05);
        }
        .student-dashboard-stat-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          flex: 0 0 48px;
          border-radius: 14px;
          background: #eef0ff;
          color: #4f46e5;
        }
        .student-dashboard-stat span {
          display: block;
          color: #7183a0;
          font-size: 13px;
          margin-bottom: 5px;
        }
        .student-dashboard-stat strong {
          color: #10233f;
          font-size: 24px;
        }
        .student-dashboard-menu {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 10px 28px rgba(15,23,42,.05);
        }
        .student-dashboard-menu-head {
          padding: 24px 26px 20px;
          border-bottom: 1px solid #edf1f5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .student-dashboard-menu-head h2 {
          margin: 0;
          color: #10233f;
          font-size: 20px;
        }
        .student-dashboard-menu-head span {
          padding: 7px 10px;
          border-radius: 999px;
          background: #f0efff;
          color: #4f46e5;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .student-meal-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 14px;
          padding: 22px 26px 26px;
        }
        .student-meal {
          padding: 17px;
          border: 1px solid #e8edf3;
          border-radius: 14px;
          background: #fbfcfe;
        }
        .student-meal small {
          display: block;
          margin-bottom: 9px;
          color: #7183a0;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .7px;
        }
        .student-meal p {
          margin: 0;
          color: #172b46;
          line-height: 1.5;
        }
        @media (max-width: 900px) {
          .student-dashboard-stats { grid-template-columns: 1fr; }
          .student-meal-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .student-meal-grid { grid-template-columns: 1fr; padding: 18px; }
          .student-dashboard-menu-head { padding: 20px; }
        }
      `}</style>

      <div className="student-dashboard-page">
        <div className="student-dashboard-hero">
          <p className="eyebrow">Good to see you</p>
          <h1>Hello, {profile?.username || "Student"} 👋</h1>
          <p>Here is your hostel overview for today.</p>
        </div>

        <div className="student-dashboard-stats">
          <div className="student-dashboard-stat">
            <div className="student-dashboard-stat-icon"><BedDouble size={21} /></div>
            <div><span>Room</span><strong>{data.room?.roomNo || "—"}</strong></div>
          </div>
          <div className="student-dashboard-stat">
            <div className="student-dashboard-stat-icon"><MessageSquareWarning size={21} /></div>
            <div><span>Complaints</span><strong>{data.complaints?.totalComplaints ?? 0}</strong></div>
          </div>
          <div className="student-dashboard-stat">
            <div className="student-dashboard-stat-icon"><MessageSquareWarning size={21} /></div>
            <div><span>Pending Complaints</span><strong>{data.complaints?.pendingComplaints ?? 0}</strong></div>
          </div>
        </div>

        <div className="student-dashboard-menu">
          <div className="student-dashboard-menu-head">
            <h2>Today's Mess Menu</h2>
            <span>{todayMenu?.type || "Menu"}</span>
          </div>

          {todayMenu ? (
            <div className="student-meal-grid">
              {[
                ["Breakfast", todayMenu.breakfast],
                ["Lunch", todayMenu.lunch],
                ["Snacks", todayMenu.snacks],
                ["Dinner", todayMenu.dinner],
              ].map(([label, items]) => (
                <div className="student-meal" key={label}>
                  <small>{label}</small>
                  <p>{items?.join(", ") || "Not available"}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Today's menu is not available." />
          )}
        </div>
      </div>
    </>
  );
}


/* =========================================================
   WORKER REGISTRATION - ADMIN
========================================================= */

function WorkerRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    username: "",
    email: "",
    phoneNumber: "",
    aadhar: "",
    profilePic: "",
    address: {
      village: "",
      city: "",
      state: "",
      pincode: "",
    },
  };

  const [form, setForm] = useState(emptyForm);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateAddress(field, value) {
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  }

  async function registerWorker(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (form.aadhar.length !== 12) {
        throw new Error("Aadhaar number must be 12 digits.");
      }

      if (form.phoneNumber.length !== 10) {
        throw new Error("Phone number must be 10 digits.");
      }

      if (form.address.pincode.length !== 6) {
        throw new Error("Pincode must be 6 digits.");
      }

      await adminApi.registerWorker({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        aadhar: form.aadhar.trim(),
        profilePic: form.profilePic.trim(),
        address: {
          village: form.address.village.trim(),
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          pincode: form.address.pincode.trim(),
          country: "India",
        },
      });

      setSuccess(
        "Worker registered successfully. An OTP has been sent to the worker's email."
      );

      setForm(emptyForm);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Failed to register worker"
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  };

  const iconBoxStyle = {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    color: "#475569",
  };

  const sectionStyle = {
    padding: "22px 24px",
    borderBottom: "1px solid #eef2f7",
  };

  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto",
        paddingBottom: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "22px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Hostel Staff
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              lineHeight: 1.2,
              color: "#0f172a",
            }}
          >
            Register Worker
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Add a new staff member to your hostel operations team.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "10px 14px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#475569",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <Users size={17} />
          Staff Account
        </div>
      </div>

      <div
        className="worker-registration-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr)",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            padding: "28px 24px",
            background: "#f8fafc",
            borderRight: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e2e8f0",
              color: "#334155",
              marginBottom: "18px",
            }}
          >
            <UserRound size={28} />
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              color: "#0f172a",
            }}
          >
            Worker profile
          </h2>

          <p
            style={{
              margin: "0 0 24px",
              color: "#64748b",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            Enter the worker's basic information, identity details and current
            address. An OTP will be sent to the registered email after creation.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {[
              ["01", "Personal information"],
              ["02", "Contact & identity"],
              ["03", "Address details"],
            ].map(([number, text]) => (
              <div
                key={number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    minWidth: "28px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  {number}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={registerWorker}>
          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                marginBottom: "18px",
              }}
            >
              <div style={iconBoxStyle}>
                <UserRound size={18} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "16px",
                  }}
                >
                  Personal information
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Basic details of the worker
                </p>
              </div>
            </div>

            <div
              className="worker-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <label style={labelStyle}>
                Full Name <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="Enter worker name"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Profile Picture URL
                <input
                  type="url"
                  value={form.profilePic}
                  onChange={(e) => updateField("profilePic", e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                marginBottom: "18px",
              }}
            >
              <div style={iconBoxStyle}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "16px",
                  }}
                >
                  Contact & identity
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Contact and verification information
                </p>
              </div>
            </div>

            <div
              className="worker-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <label style={labelStyle}>
                Email <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="worker@example.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Phone Number <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phoneNumber}
                  onChange={(e) =>
                    updateField(
                      "phoneNumber",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10 digit phone number"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Aadhaar Number <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={form.aadhar}
                  onChange={(e) =>
                    updateField("aadhar", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="12 digit Aadhaar number"
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          <div style={{ ...sectionStyle, borderBottom: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                marginBottom: "18px",
              }}
            >
              <div style={iconBoxStyle}>
                <MapPin size={18} />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "16px",
                  }}
                >
                  Address details
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Current residential address
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr .8fr",
                gap: "18px",
              }}
            >
              <label style={labelStyle}>
                Village <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  value={form.address.village}
                  onChange={(e) => updateAddress("village", e.target.value)}
                  placeholder="Enter village"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                City <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  value={form.address.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                  placeholder="Enter city"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                State <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  value={form.address.state}
                  onChange={(e) => updateAddress("state", e.target.value)}
                  placeholder="Enter state"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Pincode <span style={{ color: "#ef4444" }}>*</span>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  minLength={6}
                  maxLength={6}
                  value={form.address.pincode}
                  onChange={(e) =>
                    updateAddress(
                      "pincode",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="6 digit pincode"
                  style={inputStyle}
                />
              </label>
            </div>

            {error && (
              <div style={{ marginTop: "18px" }}>
                <ErrorBox>{error}</ErrorBox>
              </div>
            )}

            {success && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #bbf7d0",
                  background: "#f0fdf4",
                  color: "#166534",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {success}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid #eef2f7",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#475569",
                  borderRadius: "10px",
                  padding: "11px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  border: "none",
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "10px",
                  padding: "11px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Check size={16} />
                {loading ? "Registering..." : "Register Worker"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .worker-registration-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   STUDENTS
========================================================= */

function Students() {
  const navigate =
    useNavigate();

  const [data, setData] =
    useState(null);

  const [query, setQuery] =
    useState("");

  const [searchField, setSearchField] =
    useState("name");

  const [studentStatus, setStudentStatus] =
    useState("resident");

  const [feeStatus, setFeeStatus] =
    useState("all");

  const [error, setError] =
    useState("");

  const [showRegister, setShowRegister] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const emptyForm = {
    username: "",
    email: "",
    phoneNumber: "",
    aadhar: "",
    roomNo: "",
    floor: "",
    capacity: 2,
    type: "double",
    isAC: false,
    course: "",
    collegeName: "",
    year: 1,
    guardianName: "",
    guardianPhone: "",
    totalFee: 0,
    registrationFee: 0,
    profilePic: "",
    address: {
      village: "",
      city: "",
      state: "",
      pincode: "",
    },
  };

  const [form, setForm] =
    useState(emptyForm);

  async function loadStudents(
    status = studentStatus,
    fee = feeStatus,
    search = query
  ) {
    setError("");

    try {
      const response =
        status === "past"
          ? await adminApi.pastStudents({
              page: 1,
              limit: 100,
            })
          : await adminApi.students({
              page: 1,
              limit: 100,
            });

      let students =
        response.data?.students ||
        response.data?.user ||
        response.data?.users ||
        [];

      const normalizedSearch =
        search.trim().toLowerCase();

      if (normalizedSearch) {
        students =
          students.filter(
            (student) => {
              const user =
                student.userId ||
                {};

              const name =
                user.username ||
                student.username ||
                "";

              const college =
                student.collegeName ||
                student.college ||
                "";

              const email =
                user.email ||
                student.email ||
                "";

              const phone =
                user.phoneNumber ||
                student.phoneNumber ||
                "";

              const room =
                student.roomNo || "";

              let value = "";

              switch (
                searchField
              ) {
                case "college":
                  value = college;
                  break;

                case "email":
                  value = email;
                  break;

                case "phone":
                  value = phone;
                  break;

                case "room":
                  value = room;
                  break;

                case "name":
                default:
                  value = name;
              }

              return String(value)
                .toLowerCase()
                .includes(
                  normalizedSearch
                );
            }
          );
      }

      if (fee !== "all") {
        students =
          students.filter(
            (student) => {
              const feeDue =
                Number(
                  student.feeDue ??
                    student.pendingFee ??
                    student.totalPending ??
                    0
                );

              const paymentStatus =
                String(
                  student.feeStatus ||
                    student.paymentStatus ||
                    ""
                ).toLowerCase();

              const pending =
                feeDue > 0 ||
                paymentStatus ===
                  "pending" ||
                paymentStatus ===
                  "unpaid";

              return fee ===
                "pending"
                ? pending
                : !pending;
            }
          );
      }

      setData({
        ...response.data,
        students,
        totalStudents:
          students.length,
      });
    } catch (e) {
      const statusCode = e.response?.status;
      const message =
        e.response?.data?.message ||
        "Failed to load students";

      // The backend returns 404 when there are no active
      // residents. Clear the old table instead of showing
      // a deleted/stale student.
      if (
        statusCode === 404 &&
        (
          message
            .toLowerCase()
            .includes("active student") ||
          message
            .toLowerCase()
            .includes("no resident")
        )
      ) {
        setData({
          students: [],
          totalStudents: 0,
        });
        setError("");
        return;
      }

      setError(message);
    }
  }

  useEffect(() => {
    loadStudents(
      studentStatus,
      feeStatus,
      query
    );
  }, [
    studentStatus,
    feeStatus,
  ]);

  function updateField(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateAddress(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [field]: value,
      },
    }));
  }

  async function registerStudent(
    event
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await adminApi.registerStudent({
        ...form,
        year: Number(form.year),
        feeDue: Number(form.feeDue),
        registrationFee: Number(
          form.registrationFee
        ),
        floor: form.floor,
        capacity: Number(
          form.capacity
        ),
        type: form.type,
        isAC: Boolean(form.isAC),
      });

      alert(
        "Student registered successfully!"
      );

      setShowRegister(false);

      setForm({
        ...emptyForm,
        address: {
          ...emptyForm.address,
        },
      });

      loadStudents(
        studentStatus,
        feeStatus,
        query
      );
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to register student"
      );
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setSearchField("name");
    setStudentStatus("resident");
    setFeeStatus("all");

    loadStudents(
      "resident",
      "all",
      ""
    );
  }

  const students =
    data?.students || [];

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>Students</h1>

          <p className="muted">
            Search and filter hostel
            students.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => {
            setError("");
            setForm({
              ...emptyForm,
            });
            setShowRegister(true);
          }}
        >
          <Plus size={17} />
          Register Student
        </button>
      </div>

      <Card title="Search & Filter Students">
        <div className="student-filter-bar">
          <label>
            Search By

            <select
              value={searchField}
              onChange={(e) =>
                setSearchField(
                  e.target.value
                )
              }
            >
              <option value="name">
                Student Name
              </option>

              <option value="college">
                College Name
              </option>

              <option value="email">
                Email
              </option>

              <option value="phone">
                Phone Number
              </option>

              <option value="room">
                Room Number
              </option>
            </select>
          </label>

          <label className="filter-search">
            Search

            <div className="search">
              <Search size={17} />

              <input
                placeholder={
                  searchField ===
                  "college"
                    ? "Search college..."
                    : searchField ===
                      "email"
                    ? "Search email..."
                    : searchField ===
                      "phone"
                    ? "Search phone..."
                    : searchField ===
                      "room"
                    ? "Search room..."
                    : "Search student name..."
                }
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    loadStudents();
                  }
                }}
              />
            </div>
          </label>

          <label>
            Student Status

            <select
              value={studentStatus}
              onChange={(e) =>
                setStudentStatus(
                  e.target.value
                )
              }
            >
              <option value="resident">
                Resident Students
              </option>

              <option value="past">
                Past Students
              </option>
            </select>
          </label>

          <label>
            Fee Status

            <select
              value={feeStatus}
              onChange={(e) =>
                setFeeStatus(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Fee Status
              </option>

              <option value="pending">
                Fee Pending
              </option>

              <option value="paid">
                Fee Paid
              </option>
            </select>
          </label>

          <div className="filter-buttons">
            <button
              className="primary"
              onClick={() =>
                loadStudents()
              }
            >
              <Search size={16} />
              Search
            </button>

            <button
              className="secondary"
              onClick={
                clearFilters
              }
            >
              Clear
            </button>
          </div>
        </div>

        <div className="filter-summary">
          Showing{" "}
          <b>{students.length}</b>{" "}
          students
        </div>
      </Card>

      {error && (
        <ErrorBox>{error}</ErrorBox>
      )}

      <Card
        title={
          studentStatus === "past"
            ? `Past Students (${students.length})`
            : `Resident Students (${students.length})`
        }
      >
        <Table
          columns={[
            {
              key: "user",
              label: "Student",

              render: (student) => {
                const studentId =
                  student._id;

                const username =
                  student.userId
                    ?.username ||
                  student.username ||
                  "—";

                const email =
                  student.userId
                    ?.email ||
                  student.email ||
                  "—";

                return (
                  <div>
                    <button
                      type="button"
                      className="student-name"
                      onClick={() => {
                        navigate(
                          `/students/${studentId}`
                        );
                      }}
                    >
                      {username}
                    </button>

                    <small>
                      {email}
                    </small>
                  </div>
                );
              },
            },

            {
              key: "collegeName",
              label: "College",

              render: (student) =>
                student.collegeName ||
                student.college ||
                "—",
            },

            {
              key: "roomNo",
              label: "Room",

              render: (student) =>
                student.roomNo ||
                "—",
            },

            {
              key: "course",
              label: "Course",
            },

            {
              key: "year",
              label: "Year",
            },

            {
              key: "fee",
              label: "Fee Status",

              render: (student) => {
                const pendingAmount =
                  Number(
                    student.totalPending ??
                      student.pendingFee ??
                      student.feeDue ??
                      0
                  );

                return (
                  <span
                    className={
                      "badge " +
                      (pendingAmount > 0
                        ? "red"
                        : "green")
                    }
                  >
                    {pendingAmount > 0
                      ? `Pending ₹${pendingAmount.toLocaleString("en-IN")}`
                      : "Paid"}
                  </span>
                );
              },
            },
          ]}
          rows={students}
          actions={(student) => (
            <button
              className="icon danger"
              type="button"
              onClick={async () => {
                const id =
                  student.userId?._id ||
                  student.userId ||
                  student._id;

                if (
                  !window.confirm(
                    "Remove this student?"
                  )
                ) {
                  return;
                }

                try {
                  await adminApi.deleteStudent(
                    id
                  );

                  loadStudents();
                } catch (e) {
                  setError(
                    e.response?.data
                      ?.message ||
                      "Failed to delete student"
                  );
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        />
      </Card>

      {showRegister && (
        <div
          className="overlay"
          style={{
            alignItems: "flex-start",
            padding: "28px 20px",
            overflowY: "auto",
          }}
        >
          <div
            className="student-register-modal"
            style={{
              width: "min(1180px, 100%)",
              maxHeight: "calc(100vh - 56px)",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.16)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                width: "38px",
                height: "38px",
                border: "none",
                borderRadius: "10px",
                background: "#f1f5f9",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <X size={19} />
            </button>

            <div
              style={{
                padding: "28px 32px 22px",
                borderBottom: "1px solid #eef2f7",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: "6px",
                }}
              >
                Student Registration
              </div>
              <h2
                style={{
                  margin: 0,
                  paddingRight: "55px",
                  fontSize: "27px",
                  lineHeight: 1.2,
                  color: "#0f172a",
                }}
              >
                Register New Student
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Add a student with room, academic, guardian and fee details.
              </p>
            </div>

            <div
              className="student-register-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "250px minmax(0, 1fr)",
              }}
            >
              <div
                style={{
                  padding: "28px 22px",
                  background: "#f8fafc",
                  borderRight: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e2e8f0",
                    color: "#334155",
                    marginBottom: "18px",
                  }}
                >
                  <UserRound size={28} />
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "18px",
                    color: "#0f172a",
                  }}
                >
                  Student profile
                </h3>

                <p
                  style={{
                    margin: "0 0 24px",
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  Enter the student's personal information, hostel allocation,
                  academic details and fee information.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {[
                    ["01", "Personal information"],
                    ["02", "Hostel allocation"],
                    ["03", "Academic & guardian"],
                    ["04", "Fees & address"],
                  ].map(([number, text]) => (
                    <div
                      key={number}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "11px",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          minWidth: "28px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        {number}
                      </span>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={registerStudent}>
                <div
                  style={{
                    padding: "24px 28px",
                    borderBottom: "1px solid #eef2f7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        minWidth: "36px",
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      <UserRound size={18} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        Personal information
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#94a3b8",
                          fontSize: "12px",
                        }}
                      >
                        Basic details and contact information
                      </p>
                    </div>
                  </div>

                  <div className="student-register-grid-2">
                    <label className="student-register-label">
                      Student Name <span>*</span>
                      <input
                        required
                        value={form.username}
                        onChange={(e) =>
                          updateField("username", e.target.value)
                        }
                        placeholder="Enter student name"
                      />
                    </label>

                    <label className="student-register-label">
                      Profile Picture URL
                      <input
                        type="url"
                        value={form.profilePic}
                        onChange={(e) =>
                          updateField("profilePic", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </label>

                    <label className="student-register-label">
                      Email <span>*</span>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          updateField("email", e.target.value)
                        }
                        placeholder="student@example.com"
                      />
                    </label>

                    <label className="student-register-label">
                      Phone Number <span>*</span>
                      <input
                        required
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phoneNumber}
                        onChange={(e) =>
                          updateField(
                            "phoneNumber",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="10 digit phone number"
                      />
                    </label>

                    <label className="student-register-label">
                      Aadhaar Number <span>*</span>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        minLength={12}
                        maxLength={12}
                        value={form.aadhar}
                        onChange={(e) =>
                          updateField(
                            "aadhar",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="12 digit Aadhaar number"
                      />
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    padding: "24px 28px",
                    borderBottom: "1px solid #eef2f7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        minWidth: "36px",
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      <BedDouble size={18} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        Hostel allocation
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#94a3b8",
                          fontSize: "12px",
                        }}
                      >
                        Assign the student's room and accommodation type
                      </p>
                    </div>
                  </div>

                  <div className="student-register-grid-2">
                    <label className="student-register-label">
                      Room Number <span>*</span>
                      <input
                        required
                        value={form.roomNo}
                        onChange={(e) =>
                          updateField("roomNo", e.target.value)
                        }
                        placeholder="e.g. B515"
                      />
                    </label>

                    <label className="student-register-label">
                      Floor
                      <input
                        value={form.floor}
                        onChange={(e) =>
                          updateField("floor", e.target.value)
                        }
                        placeholder="e.g. 5th Floor"
                      />
                    </label>

                    <label className="student-register-label">
                      Capacity <span>*</span>
                      <select
                        value={form.capacity}
                        onChange={(e) =>
                          updateField("capacity", e.target.value)
                        }
                      >
                        <option value="2">2 Students</option>
                        <option value="3">3 Students</option>
                      </select>
                    </label>

                    <label className="student-register-label">
                      Room Type
                      <select
                        value={form.type}
                        onChange={(e) =>
                          updateField("type", e.target.value)
                        }
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="triple">Triple</option>
                      </select>
                    </label>

                    <label
                      className="student-register-check"
                      style={{
                        minHeight: "44px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.isAC}
                        onChange={(e) =>
                          updateField("isAC", e.target.checked)
                        }
                      />
                      <span>AC Room</span>
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    padding: "24px 28px",
                    borderBottom: "1px solid #eef2f7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        minWidth: "36px",
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        Academic & guardian
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#94a3b8",
                          fontSize: "12px",
                        }}
                      >
                        College, course, year and emergency contact details
                      </p>
                    </div>
                  </div>

                  <div className="student-register-grid-2">
                    <label className="student-register-label">
                      Course <span>*</span>
                      <input
                        required
                        value={form.course}
                        onChange={(e) =>
                          updateField("course", e.target.value)
                        }
                        placeholder="e.g. B.Tech CSE"
                      />
                    </label>

                    <label className="student-register-label">
                      College <span>*</span>
                      <input
                        required
                        value={form.collegeName}
                        onChange={(e) =>
                          updateField("collegeName", e.target.value)
                        }
                        placeholder="Enter college name"
                      />
                    </label>

                    <label className="student-register-label">
                      Year <span>*</span>
                      <select
                        value={form.year}
                        onChange={(e) =>
                          updateField("year", e.target.value)
                        }
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                      </select>
                    </label>

                    <label className="student-register-label">
                      Guardian Name <span>*</span>
                      <input
                        required
                        value={form.guardianName}
                        onChange={(e) =>
                          updateField("guardianName", e.target.value)
                        }
                        placeholder="Enter guardian name"
                      />
                    </label>

                    <label className="student-register-label">
                      Guardian Phone <span>*</span>
                      <input
                        required
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.guardianPhone}
                        onChange={(e) =>
                          updateField(
                            "guardianPhone",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="10 digit phone number"
                      />
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    padding: "24px 28px 28px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        minWidth: "36px",
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      <IndianRupee size={18} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        Fees & address
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#94a3b8",
                          fontSize: "12px",
                        }}
                      >
                        Fee structure and residential address
                      </p>
                    </div>
                  </div>

                  <div className="student-register-grid-2">
                    <label className="student-register-label">
                      Registration Fee <span>*</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={form.registrationFee}
                        onChange={(e) =>
                          updateField("registrationFee", e.target.value)
                        }
                        placeholder="0"
                      />
                    </label>

                    <label className="student-register-label">
                      Total Hostel Fee <span>*</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={form.totalFee}
                        onChange={(e) =>
                          updateField("totalFee", e.target.value)
                        }
                        placeholder="Enter total hostel fee"
                      />
                      <small
                        style={{
                          color: "#64748b",
                          fontSize: "12px",
                          lineHeight: 1.4,
                        }}
                      >
                        The backend will divide this into 4 installments.
                      </small>
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      margin: "24px 0 18px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        minWidth: "36px",
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "16px",
                        }}
                      >
                        Address details
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#94a3b8",
                          fontSize: "12px",
                        }}
                      >
                        Current residential address
                      </p>
                    </div>
                  </div>

                  <div className="student-register-grid-address">
                    <label className="student-register-label">
                      Village <span>*</span>
                      <input
                        required
                        value={form.address.village}
                        onChange={(e) =>
                          updateAddress("village", e.target.value)
                        }
                        placeholder="Enter village"
                      />
                    </label>

                    <label className="student-register-label">
                      City <span>*</span>
                      <input
                        required
                        value={form.address.city}
                        onChange={(e) =>
                          updateAddress("city", e.target.value)
                        }
                        placeholder="Enter city"
                      />
                    </label>

                    <label className="student-register-label">
                      State <span>*</span>
                      <input
                        required
                        value={form.address.state}
                        onChange={(e) =>
                          updateAddress("state", e.target.value)
                        }
                        placeholder="Enter state"
                      />
                    </label>

                    <label className="student-register-label">
                      Pincode <span>*</span>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        minLength={6}
                        maxLength={6}
                        value={form.address.pincode}
                        onChange={(e) =>
                          updateAddress(
                            "pincode",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="6 digit pincode"
                      />
                    </label>
                  </div>

                  {error && (
                    <div style={{ marginTop: "18px" }}>
                      <ErrorBox>{error}</ErrorBox>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "12px",
                      marginTop: "24px",
                      paddingTop: "20px",
                      borderTop: "1px solid #eef2f7",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          ...emptyForm,
                          address: {
                            ...emptyForm.address,
                          },
                        });
                        setError("");
                      }}
                      disabled={loading}
                      style={{
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        color: "#475569",
                        borderRadius: "10px",
                        padding: "11px 18px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Clear
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        border: "none",
                        background: "#0f172a",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "11px 20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      <Check size={16} />
                      {loading ? "Registering..." : "Register Student"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <style>{`
            .student-register-label {
              display: flex;
              flex-direction: column;
              gap: 7px;
              font-size: 13px;
              font-weight: 600;
              color: #334155;
            }

            .student-register-label > span {
              color: #ef4444;
              margin-left: 2px;
            }

            .student-register-label input,
            .student-register-label select {
              width: 100%;
              box-sizing: border-box;
              min-height: 44px;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 11px 13px;
              font-size: 14px;
              color: #0f172a;
              background: #ffffff;
              outline: none;
            }

            .student-register-label input::placeholder {
              color: #94a3b8;
            }

            .student-register-label input:focus,
            .student-register-label select:focus {
              border-color: #94a3b8;
              box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.14);
            }

            .student-register-grid-2 {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 18px;
            }

            .student-register-grid-address {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr .8fr;
              gap: 18px;
            }

            .student-register-check {
              display: flex;
              align-items: center;
              gap: 9px;
              font-size: 13px;
              font-weight: 600;
              color: #334155;
              cursor: pointer;
            }

            .student-register-check input {
              width: 16px;
              height: 16px;
              accent-color: #0f172a;
            }

            @media (max-width: 900px) {
              .student-register-layout {
                grid-template-columns: 1fr !important;
              }

              .student-register-layout > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid #e2e8f0;
              }
            }

            @media (max-width: 650px) {
              .student-register-modal {
                border-radius: 12px !important;
              }

              .student-register-grid-2,
              .student-register-grid-address {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

/* =========================================================
   STUDENT DETAILS - ADMIN
========================================================= */

function StudentDetails() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [student, setStudent] =
    useState(null);

  const [fees, setFees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [feeLoading, setFeeLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [feeError, setFeeError] =
    useState("");

  const [showEdit, setShowEdit] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editingInstallment, setEditingInstallment] =
    useState(null);

  const [installmentForm, setInstallmentForm] =
    useState({
      amount: "",
      markAsPaid: false,
    });

  const [installmentSaving, setInstallmentSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      username: "",
      email: "",
      phoneNumber: "",
      role: "student",
      profilePic: "",
      aadhar: "",
      address: {
        village: "",
        city: "",
        state: "",
        pincode: "",
      },
    });

  async function loadStudent() {
    try {
      setLoading(true);
      setError("");

      const response =
        await adminApi.studentProfile(id);

      setStudent(response.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to load student details"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentFees() {
    try {
      setFeeLoading(true);
      setFeeError("");

      const response =
        await adminApi.studentPendingFees(id);

      setFees(response.data?.fees || []);
    } catch (e) {
      // A student without pending fees is a valid state.
      if (e.response?.status === 404) {
        setFees([]);
        setFeeError("");
      } else {
        setFeeError(
          e.response?.data?.message ||
            "Failed to load student fees"
        );
      }
    } finally {
      setFeeLoading(false);
    }
  }

  useEffect(() => {
    loadStudent();
    loadStudentFees();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <>
        <button
          className="secondary"
          onClick={() =>
            navigate("/students")
          }
        >
          <ArrowLeft size={16} />
          Back to Students
        </button>

        <ErrorBox>
          {error}
        </ErrorBox>
      </>
    );
  }

  if (!student) {
    return (
      <Empty text="Student not found" />
    );
  }

  const data =
    student.student ||
    student;

  const user =
    data.userId ||
    student.user ||
    {};

  const username =
    user.username ||
    data.username ||
    "—";

  const email =
    user.email ||
    data.email ||
    "—";

  const phone =
    user.phoneNumber ||
    data.phoneNumber ||
    "—";

  const role =
    user.role ||
    data.role ||
    "student";

  const aadhar =
    user.aadhar ||
    data.aadhar ||
    "—";

  const profilePic =
    user.profilePic ||
    data.profilePic ||
    "";

  const address =
    user.address ||
    data.address ||
    {};

  function openEdit() {
    setForm({
      username:
        username === "—"
          ? ""
          : username,

      email:
        email === "—"
          ? ""
          : email,

      phoneNumber:
        phone === "—"
          ? ""
          : phone,

      role,

      profilePic,

      aadhar:
        aadhar === "—"
          ? ""
          : aadhar,

      address: {
        village:
          address.village || "",

        city:
          address.city || "",

        state:
          address.state || "",

        pincode:
          address.pincode || "",
      },
    });

    setShowEdit(true);
  }

  function openInstallmentEdit(fee, installment) {
    setEditingInstallment({
      feeId: fee._id,
      installmentId: installment._id,
      currentAmount: Number(
        installment.amount || 0
      ),
    });

    setInstallmentForm({
      amount: Number(
        installment.amount || 0
      ),
      markAsPaid: false,
    });

    setFeeError("");
  }

  function closeInstallmentEdit() {
    if (installmentSaving) {
      return;
    }

    setEditingInstallment(null);
    setInstallmentForm({
      amount: "",
      markAsPaid: false,
    });
  }

  async function updateInstallment(e) {
    e.preventDefault();

    if (!editingInstallment) {
      return;
    }

    const amount = Number(
      installmentForm.amount
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      setFeeError(
        "Enter a valid installment amount."
      );
      return;
    }

    try {
      setInstallmentSaving(true);
      setFeeError("");

      /*
       * This calls the new admin installment API:
       * PUT /students/:studentId/installments/:installmentId
       *
       * The existing `api` instance already contains the
       * backend base URL and credentials.
       */
      await api.put(
        `/students/${id}/installments/${editingInstallment.installmentId}`,
        {
          amount,
          markAsPaid:
            installmentForm.markAsPaid,
        }
      );

      setEditingInstallment(null);
      setInstallmentForm({
        amount: "",
        markAsPaid: false,
      });

      await loadStudentFees();
    } catch (e) {
      setFeeError(
        e.response?.data?.message ||
          "Failed to update installment"
      );
    } finally {
      setInstallmentSaving(false);
    }
  }

  async function updateStudent(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await adminApi.updateStudent(
        id,
        {
          username:
            form.username,

          email:
            form.email,

          phoneNumber:
            form.phoneNumber,

          role:
            form.role,

          profilePic:
            form.profilePic,

          aadhar:
            form.aadhar,

          address: {
            village:
              form.address.village,

            city:
              form.address.city,

            state:
              form.address.state,

            pincode:
              form.address.pincode,
          },
        }
      );

      setShowEdit(false);

      await loadStudent();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to update student"
      );
    } finally {
      setSaving(false);
    }
  }

  function updateField(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateAddress(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [field]: value,
      },
    }));
  }

  const totalPending = fees.reduce(
    (total, fee) =>
      total +
      (fee.installments || []).reduce(
        (sum, installment) =>
          String(
            installment.status
          ).toLowerCase() === "pending"
            ? sum +
              Number(
                installment.amount || 0
              )
            : sum,
        0
      ),
    0
  );

  return (
    <>
      <div className="toolbar">
        <div>
          <button
            className="secondary"
            onClick={() =>
              navigate("/students")
            }
          >
            <ArrowLeft size={16} />
            Back to Students
          </button>

          <h1>Student Profile</h1>
        </div>

        <button
          className="primary"
          onClick={openEdit}
        >
          <Edit size={16} />
          Update Student
        </button>
      </div>

      <Card title="Profile Information">
        <div className="profile">
          {profilePic ? (
            <img
              src={profilePic}
              alt={username}
              className="avatar xl"
              style={{
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="avatar xl">
              {username
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <h2>{username}</h2>

            <p>
              <b>Email:</b>{" "}
              {email}
            </p>

            <p>
              <b>Phone:</b>{" "}
              {phone}
            </p>

            <p>
              <b>Role:</b>{" "}
              {role}
            </p>
          </div>
        </div>

        <div
          className="details-grid"
          style={{
            marginTop: "24px",
          }}
        >
          <div>
            <span>Username</span>
            <strong>
              {username}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>
              {email}
            </strong>
          </div>

          <div>
            <span>Phone Number</span>
            <strong>
              {phone}
            </strong>
          </div>

          <div>
            <span>Role</span>
            <strong>
              {role}
            </strong>
          </div>

          <div>
            <span>Aadhaar</span>
            <strong>
              {aadhar}
            </strong>
          </div>

          <div>
            <span>Profile Picture</span>
            <strong>
              {profilePic
                ? "Available"
                : "Not Available"}
            </strong>
          </div>
        </div>
      </Card>

      <Card title="Address">
        <div className="details-grid">
          <div>
            <span>Village</span>
            <strong>
              {address.village ||
                "—"}
            </strong>
          </div>

          <div>
            <span>City</span>
            <strong>
              {address.city ||
                "—"}
            </strong>
          </div>

          <div>
            <span>State</span>
            <strong>
              {address.state ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Pincode</span>
            <strong>
              {address.pincode ||
                "—"}
            </strong>
          </div>
        </div>
      </Card>

      <Card title="Academic Information">
        <div className="details-grid">
          <div>
            <span>Course</span>
            <strong>
              {data.course ||
                "—"}
            </strong>
          </div>

          <div>
            <span>College</span>
            <strong>
              {data.collegeName ||
                data.college ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Year</span>
            <strong>
              {data.year ||
                "—"}
            </strong>
          </div>
        </div>
      </Card>

      <Card title="Hostel Information">
        <div className="details-grid">
          <div>
            <span>Student ID</span>
            <strong>
              {data._id ||
                id ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Room Number</span>
            <strong>
              {data.roomNo ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Pending Fee</span>
            <strong>
              {feeLoading
                ? "Loading..."
                : `₹${totalPending.toLocaleString("en-IN")}`}
            </strong>
          </div>

          <div>
            <span>Leave Status</span>
            <strong>
              {data.onLeave
                ? "On Leave"
                : "In Hostel"}
            </strong>
          </div>
        </div>
      </Card>

      <Card
        title="Fee & Installments"
        action={
          !feeLoading && (
            <span className="muted">
              Pending: ₹
              {totalPending.toLocaleString(
                "en-IN"
              )}
            </span>
          )
        }
      >
        {feeLoading ? (
          <Loading />
        ) : feeError ? (
          <ErrorBox>
            {feeError}
          </ErrorBox>
        ) : fees.length === 0 ? (
          <Empty text="No pending installments" />
        ) : (
          <div>
            {fees.map((fee) => (
              <div
                key={fee._id}
                style={{
                  padding: "16px 0",
                  borderBottom:
                    "1px solid var(--border, #e5e7eb)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <strong>
                      {fee.feeType ||
                        "Hostel Fee"}
                    </strong>
                    <div className="muted">
                      Total: ₹
                      {Number(
                        fee.totalAmount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                      {" · "}
                      Paid: ₹
                      {Number(
                        fee.totalPaid || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="details-grid fee-installments-grid"
                >
                  {(fee.installments || []).map(
                    (installment, index) => {
                      const isPending =
                        String(
                          installment.status
                        ).toLowerCase() ===
                        "pending";

                      return (
                        <div
                          key={
                            installment._id ||
                            index
                          }
                          style={{
                            border:
                              "1px solid var(--border, #e5e7eb)",
                            borderRadius:
                              "10px",
                            padding: "12px",
                          }}
                        >
                          <span>
                            Installment {index + 1}
                          </span>

                          <strong>
                            ₹
                            {Number(
                              installment.amount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>

                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              gap: "8px",
                              marginTop:
                                "8px",
                            }}
                          >
                            <span
                              className="muted"
                            >
                              {installment.status ||
                                "pending"}
                            </span>

                            {isPending && (
                              <button
                                type="button"
                                className="secondary"
                                onClick={() =>
                                  openInstallmentEdit(
                                    fee,
                                    installment
                                  )
                                }
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Guardian Information">
        <div className="details-grid">
          <div>
            <span>
              Guardian Name
            </span>
            <strong>
              {data.guardianName ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Guardian Phone
            </span>
            <strong>
              {data.guardianPhone ||
                "—"}
            </strong>
          </div>
        </div>
      </Card>

      <Card title="Additional Information">
        <div className="details-grid">
          <div>
            <span>
              Registration Fee
            </span>
            <strong>
              {data.registrationFee !==
                undefined &&
              data.registrationFee !==
                null
                ? `₹${data.registrationFee}`
                : "—"}
            </strong>
          </div>

          <div>
            <span>
              Account Created
            </span>
            <strong>
              {data.createdAt
                ? new Date(
                    data.createdAt
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>

          <div>
            <span>
              Last Updated
            </span>
            <strong>
              {data.updatedAt
                ? new Date(
                    data.updatedAt
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>
        </div>
      </Card>

      {showEdit && (
        <Modal
          title="Update Student Profile"
          close={() =>
            setShowEdit(false)
          }
        >
          <form
            onSubmit={
              updateStudent
            }
          >
            <div className="formgrid">
              <label>
                Username *
                <input
                  required
                  value={
                    form.username
                  }
                  onChange={(e) =>
                    updateField(
                      "username",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Email *
                <input
                  required
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Phone Number *
                <input
                  required
                  value={
                    form.phoneNumber
                  }
                  onChange={(e) =>
                    updateField(
                      "phoneNumber",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Role
                <select
                  value={form.role}
                  onChange={(e) =>
                    updateField(
                      "role",
                      e.target.value
                    )
                  }
                >
                  <option value="student">
                    Student
                  </option>
                  <option value="admin">
                    Admin
                  </option>
                </select>
              </label>

              <label>
                Aadhaar
                <input
                  maxLength={12}
                  value={
                    form.aadhar
                  }
                  onChange={(e) =>
                    updateField(
                      "aadhar",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Profile Picture URL
                <input
                  value={
                    form.profilePic
                  }
                  onChange={(e) =>
                    updateField(
                      "profilePic",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>

            <h3>Address</h3>

            <div className="formgrid">
              <label>
                Village
                <input
                  value={
                    form.address.village
                  }
                  onChange={(e) =>
                    updateAddress(
                      "village",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                City
                <input
                  value={
                    form.address.city
                  }
                  onChange={(e) =>
                    updateAddress(
                      "city",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                State
                <input
                  value={
                    form.address.state
                  }
                  onChange={(e) =>
                    updateAddress(
                      "state",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Pincode
                <input
                  maxLength={6}
                  value={
                    form.address
                      .pincode
                  }
                  onChange={(e) =>
                    updateAddress(
                      "pincode",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>

            {error && (
              <ErrorBox>
                {error}
              </ErrorBox>
            )}

            <button
              className="primary full"
              disabled={saving}
            >
              {saving
                ? "Updating..."
                : "Update Student"}
            </button>
          </form>
        </Modal>
      )}

      {editingInstallment && (
        <Modal
          title="Update Installment"
          close={
            closeInstallmentEdit
          }
        >
          <form
            onSubmit={
              updateInstallment
            }
          >
            <label>
              Installment Amount *
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={
                  installmentForm.amount
                }
                onChange={(e) =>
                  setInstallmentForm(
                    (previous) => ({
                      ...previous,
                      amount:
                        e.target.value,
                    })
                  )
                }
              />
            </label>

            <div
              className="muted"
              style={{
                margin: "8px 0 16px",
              }}
            >
              Current amount: ₹
              {Number(
                editingInstallment.currentAmount ||
                  0
              ).toLocaleString(
                "en-IN"
              )}
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  installmentForm.markAsPaid
                }
                onChange={(e) =>
                  setInstallmentForm(
                    (previous) => ({
                      ...previous,
                      markAsPaid:
                        e.target.checked,
                    })
                  )
                }
              />
              Cash received — mark installment as paid
            </label>

            {feeError && (
              <ErrorBox>
                {feeError}
              </ErrorBox>
            )}

            <button
              className="primary full"
              disabled={
                installmentSaving
              }
            >
              {installmentSaving
                ? "Saving..."
                : installmentForm.markAsPaid
                ? "Save & Mark Paid"
                : "Update Amount"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
   ROOMS
========================================================= */

function Rooms() {
  const [data, setData] =
    useState(null);

  const [show, setShow] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      roomNo: "",
      floor: "",
      capacity: 2,
      type: "double",
      isAC: false,
    });

  function load() {
    adminApi
      .rooms({
        page: 1,
        limit: 50,
      })
      .then((response) =>
        setData(
          response.data
        )
      )
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "Failed to load rooms"
        )
      );
  }

  useEffect(() => {
    load();
  }, []);

  async function createRoom(e) {
    e.preventDefault();

    try {
      await adminApi.createRoom({
        ...form,
        capacity: Number(
          form.capacity
        ),
      });

      setShow(false);

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to create room"
      );
    }
  }

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>Rooms</h1>

          <p className="muted">
            Manage hostel room
            inventory and occupancy.
          </p>
        </div>

        <button
          className="primary"
          onClick={() =>
            setShow(true)
          }
        >
          <Plus size={17} />
          Add Room
        </button>
      </div>

      {error && (
        <ErrorBox>
          {error}
        </ErrorBox>
      )}

      <Card title="All Rooms">
        <Table
          columns={[
            {
              key: "roomNo",
              label: "Room",
            },
            {
              key: "floor",
              label: "Floor",
            },
            {
              key: "capacity",
              label: "Capacity",
            },
            {
              key: "student",
              label: "Occupied",
              render: (room) =>
                room.student
                  ?.length || 0,
            },
            {
              key: "status",
              label: "Status",
              render: (room) => (
                <span
                  className={
                    "badge " +
                    (room.status ===
                    "full"
                      ? "red"
                      : "green")
                  }
                >
                  {room.status ||
                    "available"}
                </span>
              ),
            },
            {
              key: "isAC",
              label: "AC",
              render: (room) =>
                room.isAC
                  ? "Yes"
                  : "No",
            },
          ]}
          rows={data?.rooms}
        />
      </Card>

      {show && (
        <Modal
          title="Create Room"
          close={() =>
            setShow(false)
          }
        >
          <form
            onSubmit={createRoom}
            className="formgrid"
          >
            <label>
              Room No

              <input
                required
                value={
                  form.roomNo
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    roomNo:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Floor

              <input
                value={
                  form.floor
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    floor:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Capacity

              <select
                value={
                  form.capacity
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    capacity:
                      e.target.value,
                  })
                }
              >
                <option value="2">
                  2
                </option>

                <option value="3">
                  3
                </option>
              </select>
            </label>

            <label>
              Type

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type:
                      e.target.value,
                  })
                }
              >
                <option value="single">
                  Single
                </option>

                <option value="double">
                  Double
                </option>

                <option value="triple">
                  Triple
                </option>
              </select>
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  form.isAC
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    isAC:
                      e.target
                        .checked,
                  })
                }
              />
              AC
            </label>

            <button className="primary">
              Create Room
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
   FEES
========================================================= */

function Fees({ student = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = student
      ? studentApi.fees()
      : adminApi.pendingFees({ page: 1, limit: 50 });

    request
      .then((response) => setData(response.data || {}))
      .catch((e) => {
        if (e.response?.status === 404) {
          setData({ totalPendingFees: 0, totalPendingRecords: 0, pendingFees: [], fees: [], totalPending: 0 });
          return;
        }
        setError(e.response?.data?.message || "No fees found");
      });
  }, [student]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data) return <Loading />;

  const rows = student ? data.fees || [] : data.pendingFees || [];
  const pendingTotal = student ? Number(data.totalPending || 0) : Number(data.totalPendingFees || 0);

  return (
    <>
      <style>{`
        .fees-page { max-width: 1180px; margin: 0 auto; }
        .fees-hero { margin-bottom: 26px; }
        .fees-hero .eyebrow { margin:0 0 8px; color:#7183a0; font-size:14px; font-weight:600; }
        .fees-hero h1 { margin:0; color:#10233f; font-size:clamp(34px,4vw,46px); letter-spacing:-1.4px; }
        .fees-hero p:last-child { margin:10px 0 0; color:#64748b; }
        .fees-summary { display:grid; grid-template-columns:repeat(2,minmax(0,260px)); gap:16px; margin-bottom:24px; }
        .fees-summary-card { display:flex; align-items:center; gap:15px; padding:20px; border:1px solid #e2e8f0; border-radius:18px; background:#fff; box-shadow:0 8px 24px rgba(15,23,42,.05); }
        .fees-summary-icon { width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#eef0ff;color:#4f46e5; }
        .fees-summary-card span { display:block;color:#7183a0;font-size:13px;margin-bottom:4px; }
        .fees-summary-card strong { color:#10233f;font-size:24px; }
        .fees-record-card { overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.05); }
        .fees-record-head { padding:22px 26px;border-bottom:1px solid #edf1f5; }
        .fees-record-head h2 { margin:0;color:#10233f;font-size:20px; }
        .fees-table { width:100%; overflow-x:auto; }
        .fees-table table { width:100%; min-width:760px; border-collapse:collapse; }
        .fees-table th { padding:15px 20px;text-align:left;color:#7183a0;font-size:11px;letter-spacing:.7px;text-transform:uppercase;border-bottom:1px solid #e8edf3; }
        .fees-table td { padding:18px 20px;color:#172b46;border-bottom:1px solid #edf1f5;vertical-align:top; }
        .fees-table tr:last-child td { border-bottom:0; }
        .fee-pill { display:inline-flex;align-items:center;justify-content:center;margin:0 6px 6px 0;padding:7px 9px;border-radius:8px;background:#f4f6fa;color:#52637c;font-size:12px;line-height:1.2;white-space:normal;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere; }
        .fee-paid { color:#277449;font-weight:700; }
        .fee-pending { color:#b45309;font-weight:700; }
        @media(max-width:700px){
          .fees-page { width:100%; max-width:100%; min-width:0; box-sizing:border-box; }
          .fees-summary { grid-template-columns:1fr; width:100%; }
          .fees-summary-card { min-width:0; width:100%; box-sizing:border-box; }
          .fees-record-card { width:100%; max-width:100%; min-width:0; box-sizing:border-box; overflow:hidden; }
          .fees-record-head { padding:18px 16px; }
          .fees-table { width:100% !important; max-width:100% !important; overflow:visible !important; min-width:0 !important; box-sizing:border-box; }
          .fees-table .table-wrap { width:100% !important; max-width:100% !important; overflow:visible !important; min-width:0 !important; }
          .fees-table table { width:100% !important; min-width:0 !important; max-width:100% !important; table-layout:fixed !important; }
          .fees-table tbody td { min-width:0 !important; max-width:100% !important; overflow-wrap:anywhere !important; word-break:break-word !important; }
          .fees-table tbody td > div { min-width:0; max-width:100%; display:flex; flex-wrap:wrap; gap:4px; }
          .fees-table .fee-pill { margin:0 2px 4px 0; padding:6px 8px; font-size:11px; max-width:100%; }
        }
      `}</style>

      <div className="fees-page">
        <div className="fees-hero">
          <p className="eyebrow">Hostel Finance</p>
          <h1>{student ? "My Fees" : "Pending Fees"}</h1>
          <p>{student ? "View your fee structures and installment status." : "Review students with outstanding installments."}</p>
        </div>

        <div className="fees-summary">
          <div className="fees-summary-card">
            <div className="fees-summary-icon"><IndianRupee size={22} /></div>
            <div><span>{student ? "My Pending Fees" : "Total Pending Fees"}</span><strong>₹{pendingTotal.toLocaleString("en-IN")}</strong></div>
          </div>
          {!student && (
            <div className="fees-summary-card">
              <div className="fees-summary-icon"><IndianRupee size={22} /></div>
              <div><span>Pending Fee Records</span><strong>{Number(data.totalPendingRecords) || rows.length}</strong></div>
            </div>
          )}
        </div>

        <div className="fees-record-card">
          <div className="fees-record-head"><h2>Fee Records</h2></div>
          <div className="fees-table">
            <Table
              columns={student ? [
                { key:"feeType", label:"Type" },
                { key:"totalAmount", label:"Total", render:(fee)=>`₹${Number(fee.totalAmount||0).toLocaleString("en-IN")}` },
                { key:"totalPaid", label:"Paid", render:(fee)=>`₹${Number(fee.totalPaid||0).toLocaleString("en-IN")}` },
                { key:"installments", label:"Installments", render:(fee)=><div>{(fee.installments||[]).map(i=><span className={`fee-pill ${String(i.status).toLowerCase()==="paid"?"fee-paid":"fee-pending"}`} key={i._id}>₹{Number(i.amount||0).toLocaleString("en-IN")} · {i.status}</span>)}</div> },
              ] : [
                { key:"studentId", label:"Student", render:(fee)=>fee.studentId?.userId?.username||"—" },
                { key:"studentId", label:"Email", render:(fee)=>fee.studentId?.userId?.email||"—" },
                { key:"feeType", label:"Type" },
                { key:"installments", label:"Pending Amount", render:(fee)=>{ const amount=(fee.installments||[]).reduce((t,i)=>String(i.status).toLowerCase()==="pending"?t+Number(i.amount||0):t,0); return `₹${amount.toLocaleString("en-IN")}`; } },
                { key:"installments", label:"Pending Installments", render:(fee)=>{ const pending=(fee.installments||[]).filter(i=>String(i.status).toLowerCase()==="pending"); return pending.length ? <div>{pending.map(i=><span className="fee-pill fee-pending" key={i._id}>₹{Number(i.amount||0).toLocaleString("en-IN")}</span>)}</div> : "—"; } },
              ]}
              rows={rows}
            />
          </div>
        </div>
      </div>
    </>
  );
}


/* =========================================================
   COMPLAINTS
========================================================= */

function Complaints({
  student = false,
}) {
  const location =
    useLocation();

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [roomNo, setRoomNo] =
    useState("");

  const [show, setShow] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  function load() {
    const request = student
      ? studentApi.complaints({
          page: 1,
          limit: 50,
        })
      : adminApi.complaints({
          page: 1,
          limit: 50,
        });

    request
      .then((response) => {
        const responseData =
          response.data || {};

        const allComplaints =
          responseData.complaints ||
          [];

        const params =
          new URLSearchParams(
            location.search
          );

        const statusFilter =
          params.get("status");

        const complaints =
          statusFilter
            ? allComplaints.filter(
                (complaint) =>
                  String(
                    complaint.status ||
                      ""
                  ).toLowerCase() ===
                  statusFilter.toLowerCase()
              )
            : allComplaints;

        setData({
          ...responseData,
          complaints,
        });
      })
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "No complaints"
        )
      );
  }

  useEffect(() => {
    load();
  }, [
    student,
    location.search,
  ]);

  async function submitComplaint(e) {
    e.preventDefault();

    try {
      await studentApi.fileComplaint({
        roomNo,
        title,
        description,
      });

      setTitle("");
      setDescription("");
      setRoomNo("");
      setShow(false);

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to submit complaint"
      );
    }
  }

  function openEdit(complaint) {
    setEditing(complaint);

    setEditTitle(
      complaint.title || ""
    );

    setEditDescription(
      complaint.description || ""
    );
  }

  async function updateComplaint(e) {
    e.preventDefault();

    try {
      await studentApi.updateComplaint(
        editing._id,
        {
          title: editTitle,
          description:
            editDescription,
        }
      );

      setEditing(null);

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to update complaint"
      );
    }
  }

  async function deleteComplaint(
    id
  ) {
    if (
      !window.confirm(
        "Delete this complaint?"
      )
    ) {
      return;
    }

    try {
      await studentApi.deleteComplaint(
        id
      );

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to delete complaint"
      );
    }
  }

  async function resolveComplaint(
    id
  ) {
    try {
      if (student) {
        await studentApi.resolveComplaint(
          id
        );
      } else {
        await adminApi.resolveComplaint(
          id
        );
      }

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to resolve complaint"
      );
    }
  }

  const rows =
    data?.complaints || [];

  const pending =
    new URLSearchParams(
      location.search
    ).get("status") ===
    "pending";

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>
            {pending
              ? "Pending Complaints"
              : "Complaints"}
          </h1>

          <p className="muted">
            {pending
              ? "Showing all unresolved hostel complaints."
              : "Track and resolve hostel complaints."}
          </p>
        </div>

        {student && (
          <button
            className="primary"
            onClick={() =>
              setShow(true)
            }
          >
            <Plus size={17} />
            New Complaint
          </button>
        )}
      </div>

      {error && (
        <ErrorBox>
          {error}
        </ErrorBox>
      )}

      <Card
        title={
          pending
            ? `Pending Complaints (${rows.length})`
            : "Complaint List"
        }
      >
        <Table
          columns={[
            {
              key: "title",
              label: "Title",
            },
            {
              key: "roomNo",
              label: "Room",
            },
            {
              key: "description",
              label: "Description",
            },
            {
              key: "status",
              label: "Status",
              render: (complaint) => (
                <span
                  className={
                    "badge " +
                    (complaint.status ===
                    "resolved"
                      ? "green"
                      : "red")
                  }
                >
                  {complaint.status}
                </span>
              ),
            },
            {
              key: "createdAt",
              label: "Created",
              render: (complaint) =>
                complaint.createdAt
                  ? new Date(
                      complaint.createdAt
                    ).toLocaleDateString()
                  : "—",
            },
          ]}
          rows={rows}
          actions={(complaint) => (
            <div className="actions">
              {student &&
                complaint.status !==
                  "resolved" && (
                  <>
                    <button
                      className="icon"
                      onClick={() =>
                        openEdit(
                          complaint
                        )
                      }
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="icon danger"
                      onClick={() =>
                        deleteComplaint(
                          complaint._id
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}

              {complaint.status !==
                "resolved" && (
                <button
                  className="icon success"
                  onClick={() =>
                    resolveComplaint(
                      complaint._id
                    )
                  }
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          )}
        />
      </Card>

      {show && (
        <Modal
          title="File Complaint"
          close={() =>
            setShow(false)
          }
        >
          <form
            onSubmit={
              submitComplaint
            }
          >
            <label>
              Room Number

              <input
                required
                value={roomNo}
                onChange={(e) =>
                  setRoomNo(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Title

              <input
                required
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Description

              <textarea
                required
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </label>

            <button className="primary full">
              Submit Complaint
            </button>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal
          title="Edit Complaint"
          close={() =>
            setEditing(null)
          }
        >
          <form
            onSubmit={
              updateComplaint
            }
          >
            <label>
              Title

              <input
                required
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Description

              <textarea
                required
                value={
                  editDescription
                }
                onChange={(e) =>
                  setEditDescription(
                    e.target.value
                  )
                }
              />
            </label>

            <button
              className="primary full"
              type="submit"
            >
              Update Complaint
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
   MESS
========================================================= */

function Mess({ student = false }) {
  const [data, setData] = useState(null);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const emptyForm = { day:"Monday", type:"veg", breakfast:"", lunch:"", snacks:"", dinner:"" };
  const [form, setForm] = useState(emptyForm);

  function load() {
    const request = student ? studentApi.menu() : adminApi.menu({ page:1, limit:50 });
    request.then((response)=>setData(response.data)).catch((e)=>setError(e.response?.data?.message||"Menu unavailable"));
  }
  useEffect(()=>{ load(); },[student]);

  const arrayToString=(value)=>Array.isArray(value)?value.join(", "):value||"";
  const stringToArray=(value)=>value.split(",").map((item)=>item.trim()).filter(Boolean);

  async function submit(e){
    e.preventDefault();
    const menuData={ breakfast:stringToArray(form.breakfast), lunch:stringToArray(form.lunch), snacks:stringToArray(form.snacks), dinner:stringToArray(form.dinner) };
    try{
      if(editing) await adminApi.updateMenu(editing.day, editing.type, menuData);
      else await adminApi.createMenu({day:form.day,type:form.type,...menuData});
      setShow(false); setEditing(null); load();
    }catch(e){ setError(e.response?.data?.message||"Failed to save menu"); }
  }

  const menus=data?.menu||data?.menus||[];

  return (
    <>
      <style>{`
        .mess-page{max-width:1180px;margin:0 auto;}
        .mess-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:26px;}
        .mess-hero h1{margin:0;color:#10233f;font-size:clamp(34px,4vw,46px);letter-spacing:-1.4px;}
        .mess-hero p{margin:9px 0 0;color:#64748b;}
        .mess-menu-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;}
        .mess-menu-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 9px 26px rgba(15,23,42,.05);}
        .mess-menu-head{padding:20px 22px;border-bottom:1px solid #edf1f5;display:flex;align-items:center;justify-content:space-between;gap:12px;}
        .mess-menu-head h2{margin:0;color:#10233f;font-size:19px;}
        .mess-type{padding:6px 9px;border-radius:999px;background:#f0efff;color:#4f46e5;font-size:11px;font-weight:800;text-transform:uppercase;}
        .mess-edit{padding:6px 9px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#52637c;cursor:pointer;}
        .mess-meals{padding:19px 22px 22px;}
        .mess-meal{padding:13px 0;border-bottom:1px solid #edf1f5;}
        .mess-meal:last-child{border-bottom:0;padding-bottom:0;}
        .mess-meal:first-child{padding-top:0;}
        .mess-meal small{display:block;margin-bottom:5px;color:#7183a0;font-size:10px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;}
        .mess-meal p{margin:0;color:#172b46;line-height:1.5;}
        .mess-empty{grid-column:1/-1;}
        @media(max-width:950px){.mess-menu-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
        @media(max-width:620px){.mess-menu-grid{grid-template-columns:1fr;}.mess-hero{align-items:flex-start;flex-direction:column;}}
      `}</style>

      <div className="mess-page">
        {student && <LunchBoxBooking />}

        <div className="mess-hero">
          <div><h1>Mess Menu</h1><p>Weekly breakfast, lunch, snacks and dinner.</p></div>
          {!student && <button className="primary" onClick={()=>{setEditing(null);setForm(emptyForm);setShow(true);}}><Plus size={17}/> Add Menu</button>}
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <div className="mess-menu-grid">
          {menus.map((menu,index)=>(
            <div className="mess-menu-card" key={menu._id||index}>
              <div className="mess-menu-head">
                <div><h2>{menu.day}</h2></div>
                <span className="mess-type">{menu.type}</span>
                {!student && <button className="mess-edit" onClick={()=>{setEditing(menu);setForm({day:menu.day,type:menu.type,breakfast:arrayToString(menu.breakfast),lunch:arrayToString(menu.lunch),snacks:arrayToString(menu.snacks),dinner:arrayToString(menu.dinner)});setShow(true);}}><Edit size={14}/></button>}
              </div>
              <div className="mess-meals">
                {[["Breakfast",menu.breakfast],["Lunch",menu.lunch],["Snacks",menu.snacks],["Dinner",menu.dinner]].map(([label,items])=><div className="mess-meal" key={label}><small>{label}</small><p>{arrayToString(items)||"Not available"}</p></div>)}
              </div>
            </div>
          ))}
          {!menus.length && <div className="mess-empty"><Empty text="No menu available."/></div>}
        </div>

        {show && <Modal title={editing?"Update Mess Menu":"Add Mess Menu"} close={()=>setShow(false)}>
          <form onSubmit={submit}>
            <label>Day<select disabled={!!editing} value={form.day} onChange={(e)=>setForm({...form,day:e.target.value})}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day=><option key={day}>{day}</option>)}</select></label>
            <label>Type<select disabled={!!editing} value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}><option value="veg">Veg</option><option value="non-veg">Non-Veg</option></select></label>
            {[["Breakfast","breakfast"],["Lunch","lunch"],["Snacks","snacks"],["Dinner","dinner"]].map(([label,key])=><label key={key}>{label}<input required value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})}/></label>)}
            <button className="primary full" type="submit">{editing?"Update Menu":"Create Menu"}</button>
          </form>
        </Modal>}
      </div>
    </>
  );
}


/* =========================================================
   STUDENT LUNCHBOX
========================================================= */

function LunchBoxBooking() {
  const [data,setData]=useState(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [actionLoading,setActionLoading]=useState(false);

  async function load(){try{setLoading(true);setError("");const response=await studentApi.lunchBoxStatus();setData(response.data);}catch(e){setError(e.response?.data?.message||"Unable to load lunchbox status");}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);
  async function book(){try{setActionLoading(true);setError("");const response=await studentApi.bookLunchBox();setData(response.data);}catch(e){setError(e.response?.data?.message||"Unable to book lunchbox");}finally{setActionLoading(false);}}
  async function cancel(){try{setActionLoading(true);setError("");const response=await studentApi.cancelLunchBox();setData(response.data);}catch(e){setError(e.response?.data?.message||"Unable to cancel lunchbox");}finally{setActionLoading(false);}}

  if(loading) return <Card title="Today's Lunchbox"><Loading/></Card>;
  const booked=Boolean(data?.booked);
  const status=data?.status||data?.lunchBox?.status;

  return <>
    <style>{`
      .lunchbox-card{margin-bottom:30px;padding:0;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 9px 26px rgba(15,23,42,.05);overflow:hidden;}
      .lunchbox-head{padding:20px 24px;border-bottom:1px solid #edf1f5;display:flex;align-items:center;gap:12px;}
      .lunchbox-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#eef0ff;color:#4f46e5;}
      .lunchbox-head h2{margin:0;color:#10233f;font-size:19px;}
      .lunchbox-body{padding:22px 24px;}
      .lunchbox-status{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 16px;margin-bottom:16px;border:1px solid #e5eaf0;border-radius:13px;background:#fbfcfe;}
      .lunchbox-status span{color:#7183a0;font-size:13px;}.lunchbox-status strong{text-transform:capitalize;color:#172b46;}
      .lunchbox-note{margin:0 0 17px;color:#64748b;line-height:1.55;}
      .lunchbox-status-badge{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:#eef8f1;color:#277449;font-size:12px;font-weight:800;}
    `}</style>
    <div className="lunchbox-card">
      <div className="lunchbox-head"><div className="lunchbox-icon"><Utensils size={19}/></div><h2>Today's Lunchbox</h2></div>
      <div className="lunchbox-body">
        {error&&<ErrorBox>{error}</ErrorBox>}
        {booked ? <>
          <div className="lunchbox-status"><span>Status</span><span className="lunchbox-status-badge"><Check size={13}/>{status||"Booked"}</span></div>
          {status==="collected" ? <p className="lunchbox-note">Your lunchbox has been collected successfully.</p> : <><p className="lunchbox-note">Your lunchbox is booked for today. You can cancel it before 9:00 AM.</p><button className="secondary" disabled={actionLoading} onClick={cancel}><X size={16}/>{actionLoading?"Cancelling...":"Cancel Lunchbox"}</button></>}
        </> : <><p className="lunchbox-note">Do you want a lunchbox for today? Booking is available until 9:00 AM.</p><button className="primary" disabled={actionLoading} onClick={book}><Check size={16}/>{actionLoading?"Booking...":"Yes, Book Lunchbox"}</button></>}
      </div>
    </div>
  </>;
}


/* =========================================================
   BUS
========================================================= */

function BusPage({ student = false }) {
  const [data,setData]=useState(null); const [show,setShow]=useState(false); const [error,setError]=useState("");
  const [form,setForm]=useState({busNo:"",route:"",hostelToCollege:"",collegeToHostel:""});
  function load(){const request=student?studentApi.buses():adminApi.buses({page:1,limit:50});request.then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||"No buses"));}
  useEffect(()=>{load();},[student]);
  async function create(e){e.preventDefault();try{await adminApi.createBus(form);setShow(false);load();}catch(e){setError(e.response?.data?.message||"Failed");}}
  const rows=data?.busSchedule||data?.buses||[];

  return <>
    <style>{`
      .bus-page{max-width:1180px;margin:0 auto;}
      .bus-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:28px;}
      .bus-hero h1{margin:0;color:#10233f;font-size:clamp(34px,4vw,46px);letter-spacing:-1.4px;}.bus-hero p{margin:9px 0 0;color:#64748b;}
      .bus-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.05);}
      .bus-card-head{padding:22px 26px;border-bottom:1px solid #edf1f5;display:flex;align-items:center;gap:12px;}.bus-card-head h2{margin:0;color:#10233f;font-size:20px;}.bus-card-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#eef0ff;color:#4f46e5;}
      .bus-table{width:100%;overflow-x:auto;}.bus-table table{width:100%;min-width:650px;border-collapse:collapse;}.bus-table th{padding:14px 20px;text-align:left;color:#7183a0;font-size:11px;letter-spacing:.7px;text-transform:uppercase;border-bottom:1px solid #e8edf3;}.bus-table td{padding:19px 20px;color:#172b46;border-bottom:1px solid #edf1f5;}.bus-table tr:last-child td{border-bottom:0;}.bus-time{display:inline-flex;padding:7px 10px;border-radius:8px;background:#f4f6fa;font-weight:700;color:#52637c;}
      @media(max-width:650px){.bus-hero{align-items:flex-start;flex-direction:column;}}
    `}</style>
    <div className="bus-page">
      <div className="bus-hero"><div><h1>Bus Schedule</h1><p>Hostel to college and return timings.</p></div>{!student&&<button className="primary" onClick={()=>setShow(true)}><Plus size={17}/> Add Bus</button>}</div>
      {error&&<ErrorBox>{error}</ErrorBox>}
      <div className="bus-card">
        <div className="bus-card-head"><div className="bus-card-icon"><Bus size={19}/></div><h2>Schedules</h2></div>
        <div className="bus-table"><Table columns={[{key:"busNo",label:"Bus"},{key:"route",label:"Route"},{key:"hostelToCollege",label:"Hostel → College",render:(row)=><span className="bus-time">{row.hostelToCollege||"—"}</span>},{key:"collegeToHostel",label:"College → Hostel",render:(row)=><span className="bus-time">{row.collegeToHostel||"—"}</span>}]} rows={rows}/></div>
      </div>
      {show&&<Modal title="Create Bus Schedule" close={()=>setShow(false)}><form onSubmit={create}>{Object.keys(form).map(key=><label key={key}>{key.replace(/([A-Z])/g," $1")}<input required value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})}/></label>)}<button className="primary full">Create Schedule</button></form></Modal>}
    </div>
  </>;
}


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

function Announcements({
  student = false,
}) {
  const [data, setData] =
    useState(null);

  const [show, setShow] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      title: "",
      description: "",
    });

  function load() {
    const request = student
      ? studentApi.announcements()
      : adminApi.announcements({
          page: 1,
          limit: 50,
        });

    request
      .then((response) =>
        setData(response.data)
      )
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "No announcements"
        )
      );
  }

  useEffect(() => {
    load();
  }, [student]);

  async function create(e) {
    e.preventDefault();

    try {
      await adminApi.createAnnouncement(
        form
      );

      setShow(false);

      setForm({
        title: "",
        description: "",
      });

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed"
      );
    }
  }

  const announcements =
    data?.announcements ||
    [];

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>
            Announcements
          </h1>

          <p className="muted">
            Important hostel
            updates.
          </p>
        </div>

        {!student && (
          <button
            className="primary"
            onClick={() =>
              setShow(true)
            }
          >
            <Plus size={17} />
            New Announcement
          </button>
        )}
      </div>

      {error && (
        <ErrorBox>
          {error}
        </ErrorBox>
      )}

      <div className="announcement-list">
        {announcements.map(
          (announcement) => (
            <Card
              key={
                announcement._id
              }
              title={
                announcement.title
              }
            >
              <p>
                {
                  announcement.description
                }
              </p>

              <small className="muted">
                {announcement.createdAt
                  ? new Date(
                      announcement.createdAt
                    ).toLocaleString()
                  : ""}
              </small>
            </Card>
          )
        )}
      </div>

      {!announcements.length && (
        <Empty />
      )}

      {show && (
        <Modal
          title="Create Announcement"
          close={() =>
            setShow(false)
          }
        >
          <form onSubmit={create}>
            <label>
              Title

              <input
                required
                value={
                  form.title
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    title:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Description

              <textarea
                required
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
              />
            </label>

            <button className="primary full">
              Publish
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
   PROFILE
   ADMIN + STUDENT
========================================================= */

function Profile({
  student = false,
}) {
  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        /*
         * IMPORTANT:
         *
         * Previously for student we were doing:
         *
         * response.data.profile?.userId
         *
         * That throws away the Student document,
         * including feeDue, roomNo, course, college,
         * guardian etc.
         *
         * Now we keep the COMPLETE profile object.
         */

        const response = student
          ? await studentApi.dashboard()
          : await adminApi.profile();

        if (student) {
          const profile =
            response.data?.profile;

          setData(profile);
        } else {
          setData(
            response.data
          );
        }
      } catch (e) {
        setError(
          e.response?.data?.message ||
            "Failed to load profile"
        );
      }
    }

    loadProfile();
  }, [student]);

  if (error) {
    return (
      <ErrorBox>
        {error}
      </ErrorBox>
    );
  }

  if (!data) {
    return <Loading />;
  }

  /*
   * Student profile normally looks like:
   *
   * {
   *   userId: {
   *      username,
   *      email,
   *      phoneNumber,
   *      role,
   *      aadhar,
   *      profilePic,
   *      address
   *   },
   *   roomNo,
   *   course,
   *   collegeName,
   *   year,
   *   feeDue,
   *   guardianName,
   *   guardianPhone,
   *   onLeave
   * }
   *
   * Admin profile may directly contain
   * user information.
   */

  const user =
    data.userId ||
    data.user ||
    {};

  const username =
    user.username ||
    data.username ||
    "—";

  const email =
    user.email ||
    data.email ||
    "—";

  const phone =
    user.phoneNumber ||
    data.phoneNumber ||
    "—";

  const role =
    user.role ||
    data.role ||
    "student";

  const aadhar =
    user.aadhar ||
    data.aadhar ||
    "—";

  const profilePic =
    user.profilePic ||
    data.profilePic ||
    "";

  const address =
    user.address ||
    data.address ||
    {};

  /*
   * DO NOT use:
   *
   * data.feeDue || 0
   *
   * because that displays ₹0 when feeDue
   * doesn't exist.
   *
   * Instead we check whether the value
   * actually exists.
   */

  const hasFeeDue =
    data.feeDue !==
      undefined &&
    data.feeDue !== null;

  const feeDue =
    data.feeDue;

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>
            {student
              ? "My Profile"
              : "Profile"}
          </h1>

          <p className="muted">
            {student
              ? "View your complete hostel profile."
              : "View administrator profile."}
          </p>
        </div>
      </div>

      {/* =====================================================
          PROFILE INFORMATION
      ===================================================== */}

      <Card title="Profile Information">
        <div className="profile">
          {profilePic ? (
            <img
              src={profilePic}
              alt={username}
              className="avatar xl"
              style={{
                objectFit: "cover",
              }}
            />
          ) : (
            <div className="avatar xl">
              {username
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>
          )}

          <div>
            <h2>
              {username}
            </h2>

            <p>
              <b>Email:</b>{" "}
              {email}
            </p>

            <p>
              <b>
                Phone Number:
              </b>{" "}
              {phone}
            </p>

            <p>
              <b>Role:</b>{" "}
              {role}
            </p>
          </div>
        </div>

        <div
          className="details-grid"
          style={{
            marginTop: "24px",
          }}
        >
          <div>
            <span>
              Username
            </span>

            <strong>
              {username}
            </strong>
          </div>

          <div>
            <span>
              Email
            </span>

            <strong>
              {email}
            </strong>
          </div>

          <div>
            <span>
              Phone Number
            </span>

            <strong>
              {phone}
            </strong>
          </div>

          <div>
            <span>
              Role
            </span>

            <strong>
              {role}
            </strong>
          </div>

          <div>
            <span>
              Aadhaar
            </span>

            <strong>
              {aadhar}
            </strong>
          </div>

          <div>
            <span>
              Profile Picture
            </span>

            <strong>
              {profilePic
                ? "Available"
                : "Not Available"}
            </strong>
          </div>
        </div>
      </Card>

      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <Card title="Address">
        <div className="details-grid">
          <div>
            <span>
              City
            </span>

            <strong>
              {address.city ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              State
            </span>

            <strong>
              {address.state ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Pincode
            </span>

            <strong>
              {address.pincode ||
                "—"}
            </strong>
          </div>
        </div>
      </Card>

      {/* =====================================================
          STUDENT ONLY INFORMATION
      ===================================================== */}

      {student && (
        <>
          <Card title="Academic Information">
            <div className="details-grid">
              <div>
                <span>
                  Course
                </span>

                <strong>
                  {data.course ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  College
                </span>

                <strong>
                  {data.collegeName ||
                    data.college ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Year
                </span>

                <strong>
                  {data.year ||
                    "—"}
                </strong>
              </div>
            </div>
          </Card>

          {/* =================================================
              HOSTEL INFORMATION

              Resident Status has deliberately been removed.
              Fee Due remains.
          ================================================= */}

          <Card title="Hostel Information">
            <div className="details-grid">
              <div>
                <span>
                  Student ID
                </span>

                <strong>
                  {data._id ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Room Number
                </span>

                <strong>
                  {data.roomNo ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Fee Due
                </span>

                <strong>
                  {hasFeeDue
                    ? `₹${feeDue}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Leave Status
                </span>

                <strong>
                  {data.onLeave
                    ? "On Leave"
                    : "In Hostel"}
                </strong>
              </div>
            </div>
          </Card>

          <Card title="Guardian Information">
            <div className="details-grid">
              <div>
                <span>
                  Guardian Name
                </span>

                <strong>
                  {data.guardianName ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Guardian Phone
                </span>

                <strong>
                  {data.guardianPhone ||
                    "—"}
                </strong>
              </div>
            </div>
          </Card>

          <Card title="Additional Information">
            <div className="details-grid">
              <div>
                <span>
                  Registration Fee
                </span>

                <strong>
                  {data.registrationFee !==
                    undefined &&
                  data.registrationFee !==
                    null
                    ? `₹${data.registrationFee}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Account Created
                </span>

                <strong>
                  {data.createdAt
                    ? new Date(
                        data.createdAt
                      ).toLocaleString()
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Last Updated
                </span>

                <strong>
                  {data.updatedAt
                    ? new Date(
                        data.updatedAt
                      ).toLocaleString()
                    : "—"}
                </strong>
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}

/* =========================================================
   KYC
========================================================= */

function KYC({
  student = false,
}) {
  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const request = student
      ? studentApi.kyc()
      : adminApi.pendingKyc({
          page: 1,
          limit: 50,
        });

    request
      .then((response) =>
        setData(response.data)
      )
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "No KYC records"
        )
      );
  }, [student]);

  if (error) {
    return (
      <ErrorBox>
        {error}
      </ErrorBox>
    );
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>KYC</h1>

          <p className="muted">
            {student
              ? "Your KYC verification status."
              : "Pending KYC verification requests."}
          </p>
        </div>
      </div>

      <Card
        title={
          student
            ? "My KYC"
            : "Pending KYC"
        }
      >
        {student ? (
          <pre className="json">
            {JSON.stringify(
              data.kyc ||
                data,
              null,
              2
            )}
          </pre>
        ) : (
          <Table
            columns={[
              {
                key: "userId",
                label: "Student",
                render: (item) =>
                  item.userId
                    ?.username ||
                  "—",
              },
              {
                key: "status",
                label: "Status",
                render: (item) => (
                  <span className="badge yellow">
                    {item.status}
                  </span>
                ),
              },
              {
                key: "createdAt",
                label: "Submitted",
                render: (item) =>
                  item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleDateString()
                    : "—",
              },
            ]}
            rows={
              data.kyc ||
              data.requests ||
              []
            }
          />
        )}
      </Card>
    </>
  );
}

/* =========================================================
   OUTINGS
========================================================= */

function Outings() {
  const [data,setData]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{adminApi.outings({page:1,limit:50}).then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||"Failed"));},[]);
  if(error)return <ErrorBox>{error}</ErrorBox>; if(!data)return <Loading/>;
  const rows=data.students||data.outings||[];
  return <>
    <style>{`
      .outings-page{max-width:1180px;margin:0 auto;}.outings-hero{margin-bottom:27px;}.outings-hero h1{margin:0;color:#10233f;font-size:clamp(34px,4vw,46px);letter-spacing:-1.4px;}.outings-hero p{margin:9px 0 0;color:#64748b;}
      .outings-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.05);}.outings-head{padding:22px 26px;border-bottom:1px solid #edf1f5;display:flex;align-items:center;gap:12px;}.outings-head h2{margin:0;color:#10233f;font-size:20px;}.outings-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#eef0ff;color:#4f46e5;}.outing-status{display:inline-flex;padding:6px 9px;border-radius:999px;background:#f4f6fa;color:#52637c;font-size:12px;font-weight:700;text-transform:capitalize;}
    `}</style>
    <div className="outings-page"><div className="outings-hero"><h1>Students on Leave</h1><p>Currently marked outside the hostel.</p></div><div className="outings-card"><div className="outings-head"><div className="outings-icon"><CalendarDays size={19}/></div><h2>Outings</h2></div><Table columns={[{key:"studentId",label:"Student",render:i=>i.studentId?.userId?.username||"—"},{key:"category",label:"Reason"},{key:"expectedReturnTime",label:"Expected Return",render:i=>i.expectedReturnTime?new Date(i.expectedReturnTime).toLocaleString():"—"},{key:"status",label:"Status",render:i=><span className="outing-status">{i.status||"—"}</span>}]} rows={rows}/></div></div>
  </>;
}


/* =========================================================
   STUDENT OUTING
========================================================= */

function SimpleOuting() {
  const [form,setForm]=useState({category:"home",customReason:"",expectedReturnTime:""}); const [message,setMessage]=useState("");
  async function submit(e){e.preventDefault();try{await studentApi.applyLeave(form);setMessage("Outing informed successfully.");}catch(e){setMessage(e.response?.data?.message||"Failed to submit outing");}}
  return <>
    <style>{`
      .simple-outing-page{max-width:900px;margin:0 auto;}.simple-outing-hero{margin-bottom:24px;}.simple-outing-hero h1{margin:0;color:#10233f;font-size:clamp(34px,4vw,46px);letter-spacing:-1.4px;}.simple-outing-hero p{margin:9px 0 0;color:#64748b;}.outing-form-card{border:1px solid #e2e8f0;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.05);padding:26px;}.outing-form-head{display:flex;align-items:center;gap:12px;margin-bottom:24px;}.outing-form-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#eef0ff;color:#4f46e5;}.outing-form-head h2{margin:0;color:#10233f;font-size:20px;}.outing-form-card label{display:block;margin-bottom:18px;}.outing-form-card label:last-of-type{margin-bottom:22px;}.outing-submit{margin-top:4px;}.outing-success{padding:12px 14px;margin-bottom:17px;border:1px solid #d9ebdf;border-radius:10px;background:#f2faf4;color:#277449;font-size:14px;}
    `}</style>
    <div className="simple-outing-page"><div className="simple-outing-hero"><h1>Apply Outing</h1><p>Submit your outing details and expected return time.</p></div><div className="outing-form-card"><div className="outing-form-head"><div className="outing-form-icon"><CalendarDays size={19}/></div><h2>Outing Information</h2></div><form onSubmit={submit}><label>Reason<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="home">Home</option><option value="college">College</option><option value="medical">Medical</option><option value="other">Other</option></select></label><label>Details<textarea value={form.customReason} onChange={e=>setForm({...form,customReason:e.target.value})}/></label><label>Expected Return<input type="datetime-local" value={form.expectedReturnTime} onChange={e=>setForm({...form,expectedReturnTime:e.target.value})}/></label>{message&&<div className="outing-success">{message}</div>}<button className="primary full outing-submit">Submit Outing</button></form></div></div>
  </>;
}


/* =========================================================
   WORKER DASHBOARD
========================================================= */

function WorkerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    workerApi
      .lunchBoxSummary()
      .then((response) =>
        setData(response.data)
      )
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "Failed to load lunchbox summary"
        )
      );
  }, []);

  if (error) {
    return <ErrorBox>{error}</ErrorBox>;
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <div className="welcome">
        <p className="muted">
          Welcome back
        </p>

        <h1>
          Lunchbox Dashboard
        </h1>

        <p>
          Manage today's student lunchboxes.
        </p>
      </div>

      <div className="stats">
        <Stat
          label="Total Booked"
          value={data.totalBooked ?? data.total ?? 0}
          icon={Utensils}
        />

        <Stat
          label="Collected"
          value={data.totalCollected ?? 0}
          icon={Check}
        />

        <Stat
          label="Pending"
          value={data.totalPending ?? 0}
          icon={Utensils}
        />
      </div>

      <Card title="Today's Summary">
        <p>
          Date: <b>{data.date || "Today"}</b>
        </p>

        <Link
          className="primary"
          to="/lunchboxes"
        >
          View Today's Lunchboxes
        </Link>
      </Card>
    </>
  );
}

/* =========================================================
   WORKER LUNCHBOXES
========================================================= */

function WorkerLunchBoxes() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const search = collegeName.trim();

      const [listResponse, summaryResponse] =
        await Promise.all([
          search
            ? workerApi.todayLunchBoxesByCollege(search)
            : workerApi.todayLunchBoxes(),
          workerApi.lunchBoxSummary(),
        ]);

      let result = listResponse.data;
      let lunchBoxes =
        result?.lunchBoxes ||
        result?.data ||
        (Array.isArray(result) ? result : []);

      if (search && lunchBoxes.length === 0) {
        const allResponse =
          await workerApi.todayLunchBoxes();

        const allData = allResponse.data;
        const allLunchBoxes =
          allData?.lunchBoxes ||
          allData?.data ||
          (Array.isArray(allData) ? allData : []);

        const normalize = (value) =>
          String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        const wanted = normalize(search);

        lunchBoxes = allLunchBoxes.filter((item) => {
          const college = normalize(
            item.studentId?.collegeName ||
            item.collegeName ||
            item.studentId?.college ||
            item.college ||
            ""
          );

          return (
            college === wanted ||
            college.includes(wanted) ||
            wanted.includes(college)
          );
        });

        result = {
          ...(allData || {}),
          lunchBoxes,
          total: lunchBoxes.length,
        };
      }

      setData(result);
      setSummary(summaryResponse.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Unable to load today's lunchboxes"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function searchCollege(e) {
    e.preventDefault();
    await load();
  }

  async function clearSearch() {
    setCollegeName("");
    try {
      setLoading(true);
      setError("");

      const [listResponse, summaryResponse] =
        await Promise.all([
          workerApi.todayLunchBoxes(),
          workerApi.lunchBoxSummary(),
        ]);

      setData(listResponse.data);
      setSummary(summaryResponse.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Unable to load today's lunchboxes"
      );
    } finally {
      setLoading(false);
    }
  }

  async function collect(id) {
    try {
      setCollecting(id);
      setError("");
      await workerApi.collectLunchBox(id);
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
        "Unable to collect lunchbox"
      );
    } finally {
      setCollecting("");
    }
  }

  const lunchBoxes =
    data?.lunchBoxes ||
    data?.data ||
    (Array.isArray(data) ? data : []);

  const booked =
    summary?.totalBooked ??
    data?.total ??
    lunchBoxes.length;

  const collected =
    summary?.totalCollected ?? 0;

  const pending =
    summary?.totalPending ?? 0;

  const currentSearch = collegeName.trim();

  return (
    <>
      <style>{`
        .wlx-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .wlx-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .wlx-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .wlx-hero h1 {
          margin: 0;
          color: #10233f;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.05;
          letter-spacing: -1.3px;
        }

        .wlx-hero p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .wlx-refresh {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px !important;
          border-radius: 12px !important;
          border: 1px solid #d9def0 !important;
          background: #fff !important;
          color: #24324a !important;
          font-weight: 700 !important;
          box-shadow: 0 3px 10px rgba(15,23,42,.05);
          transition: transform .18s ease, box-shadow .18s ease,
                      border-color .18s ease, background .18s ease;
        }

        .wlx-refresh:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(79,70,229,.12);
        }

        .wlx-refresh:active:not(:disabled) {
          transform: translateY(0);
        }

        .wlx-refresh.loading svg {
          animation: wlx-spin .8s linear infinite;
        }

        @keyframes wlx-spin {
          to { transform: rotate(360deg); }
        }

        .wlx-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .wlx-stat {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 76px;
          padding: 15px 17px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          cursor: default;
          transition: transform .18s ease, box-shadow .18s ease,
                      border-color .18s ease;
        }

        .wlx-stat:hover {
          transform: translateY(-2px);
          border-color: #d7def0;
          box-shadow: 0 10px 24px rgba(15,23,42,.07);
        }

        .wlx-stat-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eef0ff;
          color: #4f46e5;
        }

        .wlx-stat:nth-child(2) .wlx-stat-icon {
          background: #eef8f1;
          color: #277449;
        }

        .wlx-stat:nth-child(3) .wlx-stat-icon {
          background: #fff7e8;
          color: #b7791f;
        }

        .wlx-stat-label {
          display: block;
          color: #7183a0;
          font-size: 12px;
          font-weight: 600;
        }

        .wlx-stat-value {
          display: block;
          margin-top: 2px;
          color: #10233f;
          font-size: 24px;
          line-height: 1;
          font-weight: 800;
        }

        .wlx-stat:nth-child(2) .wlx-stat-value {
          color: #277449;
        }

        .wlx-stat:nth-child(3) .wlx-stat-value {
          color: #a16207;
        }

        .wlx-search-card {
          margin-bottom: 18px;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 7px 22px rgba(15,23,42,.04);
        }

        .wlx-search-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .wlx-search-title {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .wlx-search-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #eef0ff;
          color: #4f46e5;
        }

        .wlx-search-title h2 {
          margin: 0;
          color: #10233f;
          font-size: 16px;
        }

        .wlx-active-filter {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          max-width: 45%;
          padding: 6px 9px;
          border-radius: 999px;
          background: #eef0ff;
          color: #4f46e5;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wlx-search-form {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 9px;
        }

        .wlx-input-wrap {
          position: relative;
          min-width: 0;
        }

        .wlx-input-wrap > svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .wlx-input-wrap input {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          min-height: 44px;
          padding: 10px 38px 10px 40px !important;
          border: 1px solid #d9def0 !important;
          border-radius: 12px !important;
          background: #fff !important;
          color: #172b46 !important;
          font-size: 15px;
          transition: border-color .18s ease, box-shadow .18s ease,
                      background .18s ease;
        }

        .wlx-input-wrap input::placeholder {
          color: #94a3b8;
        }

        .wlx-input-wrap input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,.10);
          outline: none;
        }

        .wlx-clear-input {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: background .15s ease, color .15s ease;
        }

        .wlx-clear-input:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .wlx-search-btn,
        .wlx-clear-btn {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 18px !important;
          border-radius: 12px !important;
          white-space: nowrap;
          font-weight: 700 !important;
          transition: transform .18s ease, box-shadow .18s ease,
                      background .18s ease, border-color .18s ease;
        }

        .wlx-clear-btn {
          border: 1px solid #d9def0 !important;
          background: #fff !important;
          color: #24324a !important;
        }

        .wlx-refresh:hover:not(:disabled),
        .wlx-clear-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #c9d0e5 !important;
          background: #f8f9ff !important;
          box-shadow: 0 7px 16px rgba(15,23,42,.08);
        }

        .wlx-search-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(79,70,229,.18);
        }

        .wlx-refresh:active:not(:disabled),
        .wlx-search-btn:active:not(:disabled),
        .wlx-clear-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .wlx-results {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 12px;
          color: #7183a0;
          font-size: 12px;
        }

        .wlx-results strong {
          color: #10233f;
        }

        .wlx-results-count {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .wlx-table-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 7px 22px rgba(15,23,42,.04);
        }

        .wlx-table-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 19px;
          border-bottom: 1px solid #edf1f5;
        }

        .wlx-table-head h2 {
          margin: 0;
          color: #10233f;
          font-size: 17px;
        }

        .wlx-table-head span {
          color: #7183a0;
          font-size: 12px;
        }

        .wlx-table {
          width: 100%;
          border-collapse: collapse;
        }

        .wlx-table th {
          padding: 11px 17px;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .55px;
          border-bottom: 1px solid #e2e8f0;
        }

        .wlx-table td {
          padding: 13px 17px;
          color: #172b46;
          font-size: 13px;
          border-bottom: 1px solid #edf1f5;
        }

        .wlx-table tbody tr {
          transition: background .15s ease;
        }

        .wlx-table tbody tr:hover {
          background: #fafbff;
        }

        .wlx-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .wlx-student {
          color: #10233f;
          font-weight: 700;
        }

        .wlx-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #52637c;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .wlx-status.collected {
          background: #eef8f1;
          color: #277449;
        }

        .wlx-collect {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 11px !important;
          font-size: 12px !important;
        }

        .wlx-empty {
          padding: 38px 18px;
          text-align: center;
          color: #64748b;
        }

        .wlx-empty-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          margin: 0 auto 9px;
          border-radius: 12px;
          background: #f1f5f9;
          color: #94a3b8;
        }

        .wlx-mobile-list {
          display: none;
        }

        @media (max-width: 700px) {
          .wlx-page {
            padding: 0;
          }

          .wlx-hero {
            align-items: stretch;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }

          .wlx-hero h1 {
            font-size: 29px;
          }

          .wlx-hero p {
            max-width: 330px;
            line-height: 1.5;
          }

          .wlx-refresh {
            width: 100%;
            border-radius: 12px !important;
          }

          .wlx-stats {
            gap: 7px;
            margin-bottom: 12px;
          }

          .wlx-stat {
            min-height: 67px;
            padding: 10px 8px;
            gap: 7px;
            border-radius: 12px;
          }

          .wlx-stat-icon {
            display: none;
          }

          .wlx-stat-label {
            font-size: 9px;
            line-height: 1.1;
          }

          .wlx-stat-value {
            font-size: 20px;
            margin-top: 4px;
          }

          .wlx-search-card {
            padding: 13px;
            margin-bottom: 12px;
            border-radius: 14px;
          }

          .wlx-search-top {
            margin-bottom: 10px;
          }

          .wlx-search-icon {
            width: 30px;
            height: 30px;
          }

          .wlx-search-title h2 {
            font-size: 14px;
          }

          .wlx-active-filter {
            max-width: 42%;
          }

          .wlx-search-form {
            grid-template-columns: 1fr 1fr;
          }

          .wlx-input-wrap {
            grid-column: 1 / -1;
          }

          .wlx-search-btn,
          .wlx-clear-btn {
            width: 100%;
            border-radius: 12px !important;
          }

          .wlx-results {
            margin-top: 9px;
          }

          .wlx-table-head {
            padding: 13px;
          }

          .wlx-table-head h2 {
            font-size: 15px;
          }

          .wlx-table-head span {
            font-size: 10px;
          }

          .wlx-desktop-table {
            display: none;
          }

          .wlx-mobile-list {
            display: block;
          }

          .wlx-mobile-header,
          .wlx-mobile-row {
            display: grid;
            grid-template-columns:
              minmax(0, 1.35fr)
              minmax(42px, .65fr)
              minmax(60px, .8fr)
              minmax(68px, .8fr);
            align-items: center;
            column-gap: 6px;
          }

          .wlx-mobile-header {
            padding: 9px 10px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }

          .wlx-mobile-header span {
            min-width: 0;
            color: #64748b;
            font-size: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: .3px;
          }

          .wlx-mobile-row {
            min-height: 48px;
            padding: 5px 10px;
            border-bottom: 1px solid #edf1f5;
            transition: background .15s ease;
          }

          .wlx-mobile-row:last-child {
            border-bottom: 0;
          }

          .wlx-mobile-row:hover {
            background: #fafbff;
          }

          .wlx-mobile-cell {
            min-width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #172b46;
            font-size: 11px;
          }

          .wlx-mobile-cell.student {
            color: #10233f;
            font-weight: 700;
          }

          .wlx-mobile-status {
            justify-self: start;
          }

          .wlx-mobile-action {
            justify-self: end;
            overflow: visible;
          }

          .wlx-mobile-action button {
            min-height: 32px;
            padding: 5px 7px !important;
            font-size: 10px !important;
            white-space: nowrap;
          }

          .wlx-mobile-empty {
            padding: 30px 12px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
        }

        @media (max-width: 360px) {
          .wlx-hero h1 {
            font-size: 26px;
          }

          .wlx-stat {
            padding-left: 6px;
            padding-right: 6px;
          }

          .wlx-stat-label {
            font-size: 8px;
          }

          .wlx-stat-value {
            font-size: 18px;
          }

          .wlx-mobile-header,
          .wlx-mobile-row {
            grid-template-columns:
              minmax(0, 1.3fr)
              minmax(38px, .6fr)
              minmax(56px, .75fr)
              minmax(64px, .75fr);
            column-gap: 4px;
            padding-left: 7px;
            padding-right: 7px;
          }

          .wlx-mobile-cell {
            font-size: 10px;
          }

          .wlx-mobile-header span {
            font-size: 7px;
          }
        }
      `}</style>

      <div className="wlx-page">
        <div className="wlx-hero">
          <div>
            <div className="wlx-eyebrow">
              <Utensils size={14} />
              Daily meal collection
            </div>

            <h1>Today's Lunchboxes</h1>

            <p>
              Manage today's bookings and quickly mark
              each lunchbox as collected.
            </p>
          </div>

          <button
            className={`secondary wlx-refresh ${
              loading ? "loading" : ""
            }`}
            onClick={load}
            disabled={loading}
            title="Refresh today's lunchbox data"
          >
            <Check size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <div className="wlx-stats">
          <div className="wlx-stat">
            <div className="wlx-stat-icon">
              <Utensils size={19} />
            </div>
            <div>
              <span className="wlx-stat-label">
                Total booked
              </span>
              <strong className="wlx-stat-value">
                {booked}
              </strong>
            </div>
          </div>

          <div className="wlx-stat">
            <div className="wlx-stat-icon">
              <Check size={19} />
            </div>
            <div>
              <span className="wlx-stat-label">
                Collected
              </span>
              <strong className="wlx-stat-value">
                {collected}
              </strong>
            </div>
          </div>

          <div className="wlx-stat">
            <div className="wlx-stat-icon">
              <Utensils size={19} />
            </div>
            <div>
              <span className="wlx-stat-label">
                Pending
              </span>
              <strong className="wlx-stat-value">
                {pending}
              </strong>
            </div>
          </div>
        </div>

        <div className="wlx-search-card">
          <div className="wlx-search-top">
            <div className="wlx-search-title">
              <div className="wlx-search-icon">
                <Search size={16} />
              </div>

              <h2>Search By College</h2>
            </div>

            {currentSearch && (
              <span
                className="wlx-active-filter"
                title={currentSearch}
              >
                Filter: {currentSearch}
              </span>
            )}
          </div>

          <form
            className="wlx-search-form"
            onSubmit={searchCollege}
          >
            <div className="wlx-input-wrap">
              <Search size={17} />

              <input
                value={collegeName}
                onChange={(e) =>
                  setCollegeName(e.target.value)
                }
                placeholder="Enter college name"
                aria-label="Search by college"
              />

              {collegeName && (
                <button
                  type="button"
                  className="wlx-clear-input"
                  onClick={clearSearch}
                  aria-label="Clear college search"
                  title="Clear"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              className="primary wlx-search-btn"
              type="submit"
              disabled={loading}
            >
              <Search size={16} />
              {loading ? "Searching..." : "Search"}
            </button>

            <button
              className="secondary wlx-clear-btn"
              type="button"
              onClick={clearSearch}
              disabled={!collegeName && !loading}
            >
              Clear
            </button>
          </form>

          <div className="wlx-results">
            <span className="wlx-results-count">
              Showing <strong>{lunchBoxes.length}</strong> students
            </span>

            {currentSearch && (
              <span>
                Results for <strong>{currentSearch}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="wlx-table-card">
          <div className="wlx-table-head">
            <h2>
              {currentSearch
                ? `Lunchboxes · ${currentSearch}`
                : "Booked Students"}
            </h2>

            <span>
              {lunchBoxes.length}{" "}
              {lunchBoxes.length === 1
                ? "student"
                : "students"}
            </span>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="wlx-table-box">
              <div className="wlx-desktop-table">
                <table className="wlx-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Room</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lunchBoxes.length ? (
                      lunchBoxes.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <span className="wlx-student">
                              {item.studentId?.userId?.username ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            {item.studentId?.roomNo || "—"}
                          </td>

                          <td>
                            <span
                              className={`wlx-status ${
                                item.status === "collected"
                                  ? "collected"
                                  : ""
                              }`}
                            >
                              {item.status || "booked"}
                            </span>
                          </td>

                          <td>
                            {item.status === "collected" ? (
                              <span className="wlx-status collected">
                                <Check size={12} />
                                Collected
                              </span>
                            ) : (
                              <button
                                className="primary wlx-collect"
                                disabled={
                                  collecting === item._id
                                }
                                onClick={() =>
                                  collect(item._id)
                                }
                              >
                                <Check size={14} />
                                {collecting === item._id
                                  ? "Collecting..."
                                  : "Collect"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="wlx-empty"
                        >
                          <div className="wlx-empty-icon">
                            <Utensils size={19} />
                          </div>
                          No booked students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="wlx-mobile-list">
                <div className="wlx-mobile-header">
                  <span>Student</span>
                  <span>Room</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {lunchBoxes.length ? (
                  lunchBoxes.map((item) => (
                    <div
                      className="wlx-mobile-row"
                      key={item._id}
                    >
                      <div className="wlx-mobile-cell student">
                        {item.studentId?.userId?.username ||
                          "—"}
                      </div>

                      <div className="wlx-mobile-cell">
                        {item.studentId?.roomNo || "—"}
                      </div>

                      <div className="wlx-mobile-cell wlx-mobile-status">
                        <span
                          className={`wlx-status ${
                            item.status === "collected"
                              ? "collected"
                              : ""
                          }`}
                        >
                          {item.status || "booked"}
                        </span>
                      </div>

                      <div className="wlx-mobile-cell wlx-mobile-action">
                        {item.status === "collected" ? (
                          <span className="wlx-status collected">
                            <Check size={11} />
                            Collected
                          </span>
                        ) : (
                          <button
                            className="primary"
                            disabled={
                              collecting === item._id
                            }
                            onClick={() =>
                              collect(item._id)
                            }
                          >
                            <Check size={12} />
                            {collecting === item._id
                              ? "..."
                              : "Collect"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="wlx-mobile-empty">
                    No booked students found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   WORKER PROFILE
========================================================= */

function WorkerProfile() {
  const { user } = useAuth();

  const name = user?.username || "Worker";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "W";

  return (
    <>
      <style>{`
        .worker-profile-page {
          max-width: 1180px;
          margin: 0 auto;
        }

        .worker-profile-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .worker-profile-title {
          margin: 0;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -1.5px;
        }

        .worker-profile-subtitle {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 16px;
        }

        .worker-profile-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1px solid #dbe7df;
          border-radius: 999px;
          background: #f3faf5;
          color: #247044;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .worker-profile-card {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.07);
        }

        .worker-profile-side {
          position: relative;
          padding: 34px 30px;
          background: linear-gradient(145deg, #f8fafc 0%, #eef2f7 100%);
          border-right: 1px solid #e2e8f0;
        }

        .worker-profile-avatar {
          width: 92px;
          height: 92px;
          display: grid;
          place-items: center;
          margin-bottom: 22px;
          border-radius: 24px;
          background: #10233f;
          color: #fff;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
          box-shadow: 0 10px 22px rgba(16, 35, 63, 0.18);
        }

        .worker-profile-side h2 {
          margin: 0;
          color: #10233f;
          font-size: 25px;
          line-height: 1.2;
        }

        .worker-profile-side p {
          margin: 9px 0 0;
          color: #64748b;
          line-height: 1.55;
        }

        .worker-profile-type {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 22px;
          padding: 8px 11px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }

        .worker-profile-main {
          padding: 34px;
        }

        .worker-profile-main-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .worker-profile-main-head h3 {
          margin: 0;
          color: #10233f;
          font-size: 21px;
        }

        .worker-profile-main-head span {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .worker-profile-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .worker-profile-field {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          padding: 17px;
          border: 1px solid #e5eaf0;
          border-radius: 14px;
          background: #fbfcfe;
        }

        .worker-profile-field-icon {
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #edf2f7;
          color: #10233f;
        }

        .worker-profile-field small {
          display: block;
          margin-bottom: 6px;
          color: #7a8aa0;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .worker-profile-field strong {
          display: block;
          overflow-wrap: anywhere;
          color: #172b46;
          font-size: 16px;
          font-weight: 600;
        }

        .worker-profile-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #edf1f5;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 800px) {
          .worker-profile-hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .worker-profile-card {
            grid-template-columns: 1fr;
          }

          .worker-profile-side {
            border-right: 0;
            border-bottom: 1px solid #e2e8f0;
          }
        }

        @media (max-width: 560px) {
          .worker-profile-main,
          .worker-profile-side {
            padding: 24px 20px;
          }

          .worker-profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="worker-profile-page">
        <div className="worker-profile-hero">
          <div>
            <p className="muted" style={{ marginBottom: 8 }}>
              Hostel Staff
            </p>
            <h1 className="worker-profile-title">
              Worker Profile
            </h1>
            <p className="worker-profile-subtitle">
              Your worker account information and role details.
            </p>
          </div>

          <div className="worker-profile-status">
            <BadgeCheck size={17} />
            Active Worker Account
          </div>
        </div>

        <div className="worker-profile-card">
          <div className="worker-profile-side">
            <div className="worker-profile-avatar">
              {initials}
            </div>

            <h2>{name}</h2>
            <p>
              Hostel staff member responsible for lunchbox
              operations.
            </p>

            <div className="worker-profile-type">
              <Utensils size={15} />
              Lunchbox Worker
            </div>
          </div>

          <div className="worker-profile-main">
            <div className="worker-profile-main-head">
              <h3>Profile Information</h3>
              <span>Account Details</span>
            </div>

            <div className="worker-profile-grid">
              <div className="worker-profile-field">
                <div className="worker-profile-field-icon">
                  <UserRound size={18} />
                </div>
                <div>
                  <small>Name</small>
                  <strong>{name}</strong>
                </div>
              </div>

              <div className="worker-profile-field">
                <div className="worker-profile-field-icon">
                  <Mail size={18} />
                </div>
                <div>
                  <small>Email</small>
                  <strong>{user?.email || "—"}</strong>
                </div>
              </div>

              <div className="worker-profile-field">
                <div className="worker-profile-field-icon">
                  <Phone size={18} />
                </div>
                <div>
                  <small>Phone</small>
                  <strong>{user?.phoneNumber || "—"}</strong>
                </div>
              </div>

              <div className="worker-profile-field">
                <div className="worker-profile-field-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <small>Role</small>
                  <strong>Worker</strong>
                </div>
              </div>

              <div className="worker-profile-field">
                <div className="worker-profile-field-icon">
                  <Briefcase size={18} />
                </div>
                <div>
                  <small>Worker Type</small>
                  <strong>Lunchbox</strong>
                </div>
              </div>

              {user?.address?.city || user?.address?.state ? (
                <div className="worker-profile-field">
                  <div className="worker-profile-field-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <small>Location</small>
                    <strong>
                      {[user?.address?.city, user?.address?.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="worker-profile-footer">
              <ShieldCheck size={16} />
              Your account is configured for hostel lunchbox operations.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   ROUTER
========================================================= */

function PageRouter() {
  const { user } =
    useAuth();

  const isAdmin =
    user?.role === "admin";

  const isWorker =
    user?.role === "worker";

  return (
    <Shell>
      <Routes>
        <Route
          path="/"
          element={
            isAdmin ? (
              <AdminDashboard />
            ) : isWorker ? (
              <WorkerDashboard />
            ) : (
              <StudentDashboard />
            )
          }
        />

        {isAdmin && (
          <>
            <Route
              path="/students"
              element={<Students />}
            />

            <Route
              path="/workers"
              element={<WorkerRegistration />}
            />

            <Route
              path="/students/:id"
              element={<StudentDetails />}
            />

            <Route
              path="/rooms"
              element={<Rooms />}
            />

            <Route
              path="/fees"
              element={<Fees />}
            />

            <Route
              path="/complaints"
              element={<Complaints />}
            />

            <Route
              path="/mess"
              element={<Mess />}
            />

            <Route
              path="/bus"
              element={<BusPage />}
            />

            <Route
              path="/kyc"
              element={<KYC />}
            />

            <Route
              path="/outings"
              element={<Outings />}
            />

            <Route
              path="/announcements"
              element={<Announcements />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />
          </>
        )}

        {isWorker && (
          <>
            <Route
              path="/lunchboxes"
              element={<WorkerLunchBoxes />}
            />

            <Route
              path="/profile"
              element={<WorkerProfile />}
            />
          </>
        )}

        {!isAdmin && !isWorker && (
          <>
            <Route
              path="/fees"
              element={<Fees student />}
            />

            <Route
              path="/complaints"
              element={<Complaints student />}
            />

            <Route
              path="/mess"
              element={<Mess student />}
            />

            <Route
              path="/bus"
              element={<BusPage student />}
            />

            <Route
              path="/outing"
              element={<SimpleOuting />}
            />

            <Route
              path="/kyc"
              element={<KYC student />}
            />

            <Route
              path="/announcements"
              element={
                <Announcements student />
              }
            />

            <Route
              path="/profile"
              element={<Profile student />}
            />
          </>
        )}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </Shell>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/verify-otp"
          element={
            <VerifyOTP />
          }
        />

        <Route
          path="/*"
          element={
            <Protected>
              <PageRouter />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;