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
      : navStudent;

  const current = nav.find(
    (item) =>
      item[1] === location.pathname
  );

  return (
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
    <div className="overlay">
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
                    <td className="actions">
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
  const [data, setData] =
    useState(null);

  const [err, setErr] =
    useState("");

  useEffect(() => {
    studentApi
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

  const profile =
    data.profile?.userId;

  return (
    <>
      <div className="welcome">
        <p className="muted">
          Good to see you
        </p>

        <h1>
          Hello,{" "}
          {profile?.username ||
            "Student"}{" "}
          👋
        </h1>

        <p>
          Here is your hostel
          overview.
        </p>
      </div>

      <div className="stats">
        <Stat
          label="Room"
          value={
            data.room?.roomNo
          }
          icon={BedDouble}
        />

        <Stat
          label="Complaints"
          value={
            data.complaints
              ?.totalComplaints
          }
          icon={
            MessageSquareWarning
          }
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
        />
      </div>

      <Card title="Today's Mess Menu">
        {data.messMenu?.length ? (
          <div className="menu-grid">
            {data.messMenu.map(
              (menu, index) => (
                <div
                  className="meal"
                  key={index}
                >
                  <b>
                    {menu.type ||
                      "Menu"}
                  </b>

                  <p>
                    {menu.breakfast?.join(
                      ", "
                    ) || "—"}
                  </p>

                  <p>
                    {menu.lunch?.join(
                      ", "
                    ) || "—"}
                  </p>

                  <p>
                    {menu.snacks?.join(
                      ", "
                    ) || "—"}
                  </p>

                  <p>
                    {menu.dinner?.join(
                      ", "
                    ) || "—"}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <Empty
            text="Today's menu is not available."
          />
        )}
      </Card>
    </>
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
        <Modal
          title="Register New Student"
          close={() =>
            setShowRegister(false)
          }
        >
          <form
            onSubmit={
              registerStudent
            }
          >
            <div className="formgrid">
              <label>
                Student Name *

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
                  type="email"
                  required
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
                Aadhaar *

                <input
                  required
                  minLength={12}
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
                Room Number *

                <input
                  required
                  value={
                    form.roomNo
                  }
                  onChange={(e) =>
                    updateField(
                      "roomNo",
                      e.target.value
                    )
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
                    updateField(
                      "floor",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Capacity *

                <select
                  value={
                    form.capacity
                  }
                  onChange={(e) =>
                    updateField(
                      "capacity",
                      e.target.value
                    )
                  }
                >
                  <option value="2">
                    2 Students
                  </option>

                  <option value="3">
                    3 Students
                  </option>
                </select>
              </label>

              <label>
                Room Type

                <select
                  value={form.type}
                  onChange={(e) =>
                    updateField(
                      "type",
                      e.target.value
                    )
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
                    updateField(
                      "isAC",
                      e.target.checked
                    )
                  }
                />
                AC Room
              </label>

              <label>
                Course *

                <input
                  required
                  value={
                    form.course
                  }
                  onChange={(e) =>
                    updateField(
                      "course",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                College *

                <input
                  required
                  value={
                    form.collegeName
                  }
                  onChange={(e) =>
                    updateField(
                      "collegeName",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Year *

                <select
                  value={form.year}
                  onChange={(e) =>
                    updateField(
                      "year",
                      e.target.value
                    )
                  }
                >
                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>

                  <option value="5">
                    5th Year
                  </option>
                </select>
              </label>

              <label>
                Guardian Name *

                <input
                  required
                  value={
                    form.guardianName
                  }
                  onChange={(e) =>
                    updateField(
                      "guardianName",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Guardian Phone *

                <input
                  required
                  value={
                    form.guardianPhone
                  }
                  onChange={(e) =>
                    updateField(
                      "guardianPhone",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Registration Fee *

                <input
                  type="number"
                  min="0"
                  required
                  value={
                    form.registrationFee
                  }
                  onChange={(e) =>
                    updateField(
                      "registrationFee",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Total Hostel Fee *

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={
                    form.totalFee
                  }
                  onChange={(e) =>
                    updateField(
                      "totalFee",
                      e.target.value
                    )
                  }
                  placeholder="Enter total hostel fee"
                />

                <small className="muted">
                  The backend will divide this into 4 installments.
                </small>
              </label>

              <label>
                Profile Picture URL

                <input
                  type="url"
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
                City *

                <input
                  required
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
                State *

                <input
                  required
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
                Pincode *

                <input
                  required
                  minLength={6}
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
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Register Student"}
            </button>
          </form>
        </Modal>
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
                  className="details-grid"
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

function Fees({
  student = false,
}) {
  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const request = student
      ? studentApi.fees()
      : adminApi.pendingFees({
          page: 1,
          limit: 50,
        });

    request
      .then((response) =>
        setData(response.data || {})
      )
      .catch((e) => {
        if (e.response?.status === 404) {
          setData({
            totalPendingFees: 0,
            totalPendingRecords: 0,
            totalPages: 0,
            currentPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
            pendingFees: [],
            fees: [],
            totalPending: 0,
          });
          setError("");
          return;
        }

        setError(
          e.response?.data?.message ||
            "No fees found"
        );
      });
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

  const rows = student
    ? data.fees || []
    : data.pendingFees || [];

  const pendingTotal = student
    ? Number(data.totalPending || 0)
    : Number(data.totalPendingFees || 0);

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>
            {student
              ? "My Fees"
              : "Pending Fees"}
          </h1>

          <p className="muted">
            {student
              ? "View your fee structures and installments."
              : "Students with outstanding installments."}
          </p>
        </div>
      </div>

      <div className="stats">
        <Stat
          label={
            student
              ? "My Pending Fees"
              : "Total Pending Fees"
          }
          value={`₹${pendingTotal.toLocaleString(
            "en-IN"
          )}`}
          icon={IndianRupee}
        />

        {!student && (
          <Stat
            label="Pending Fee Records"
            value={
              Number(
                data.totalPendingRecords
              ) || rows.length
            }
            icon={IndianRupee}
          />
        )}
      </div>

      <Card title="Fee Records">
        <Table
          columns={
            student
              ? [
                  {
                    key: "feeType",
                    label: "Type",
                  },
                  {
                    key: "totalAmount",
                    label: "Total",
                    render: (fee) =>
                      `₹${Number(
                        fee.totalAmount || 0
                      ).toLocaleString("en-IN")}`,
                  },
                  {
                    key: "totalPaid",
                    label: "Paid",
                    render: (fee) =>
                      `₹${Number(
                        fee.totalPaid || 0
                      ).toLocaleString("en-IN")}`,
                  },
                  {
                    key: "installments",
                    label: "Installments",
                    render: (fee) => (
                      <div>
                        {(fee.installments || []).map(
                          (installment) => (
                            <span
                              className="installment"
                              key={
                                installment._id
                              }
                            >
                              ₹
                              {Number(
                                installment.amount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              ·{" "}
                              {installment.status}
                            </span>
                          )
                        )}
                      </div>
                    ),
                  },
                ]
              : [
                  {
                    key: "studentId",
                    label: "Student",
                    render: (fee) =>
                      fee.studentId
                        ?.userId
                        ?.username ||
                      "—",
                  },
                  {
                    key: "studentId",
                    label: "Email",
                    render: (fee) =>
                      fee.studentId
                        ?.userId
                        ?.email ||
                      "—",
                  },
                  {
                    key: "feeType",
                    label: "Type",
                  },
                  {
                    key: "installments",
                    label: "Pending Amount",
                    render: (fee) => {
                      const pendingAmount =
                        (
                          fee.installments ||
                          []
                        ).reduce(
                          (
                            total,
                            installment
                          ) =>
                            String(
                              installment.status
                            ).toLowerCase() ===
                            "pending"
                              ? total +
                                Number(
                                  installment.amount ||
                                    0
                                )
                              : total,
                          0
                        );

                      return `₹${pendingAmount.toLocaleString(
                        "en-IN"
                      )}`;
                    },
                  },
                  {
                    key: "installments",
                    label: "Pending Installments",
                    render: (fee) => {
                      const pending =
                        (
                          fee.installments ||
                          []
                        ).filter(
                          (installment) =>
                            String(
                              installment.status
                            ).toLowerCase() ===
                            "pending"
                        );

                      if (!pending.length) {
                        return "—";
                      }

                      return (
                        <div>
                          {pending.map(
                            (installment) => (
                              <span
                                className="installment"
                                key={
                                  installment._id
                                }
                              >
                                ₹
                                {Number(
                                  installment.amount ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )
                          )}
                        </div>
                      );
                    },
                  },
                ]
          }
          rows={rows}
        />
      </Card>
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

function Mess({
  student = false,
}) {
  const [data, setData] =
    useState(null);

  const [show, setShow] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [error, setError] =
    useState("");

  const emptyForm = {
    day: "Monday",
    type: "veg",
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  };

  const [form, setForm] =
    useState(emptyForm);

  function load() {
    const request = student
      ? studentApi.menu()
      : adminApi.menu({
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
            "Menu unavailable"
        )
      );
  }

  useEffect(() => {
    load();
  }, [student]);

  function arrayToString(
    value
  ) {
    return Array.isArray(value)
      ? value.join(", ")
      : value || "";
  }

  function stringToArray(
    value
  ) {
    return value
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  async function submit(e) {
    e.preventDefault();

    const menuData = {
      breakfast:
        stringToArray(
          form.breakfast
        ),
      lunch:
        stringToArray(
          form.lunch
        ),
      snacks:
        stringToArray(
          form.snacks
        ),
      dinner:
        stringToArray(
          form.dinner
        ),
    };

    try {
      if (editing) {
        await adminApi.updateMenu(
          editing.day,
          editing.type,
          menuData
        );
      } else {
        await adminApi.createMenu({
          day: form.day,
          type: form.type,
          ...menuData,
        });
      }

      setShow(false);
      setEditing(null);

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to save menu"
      );
    }
  }

  const menus =
    data?.menu ||
    data?.menus ||
    [];

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>Mess Menu</h1>

          <p className="muted">
            Weekly breakfast,
            lunch, snacks and
            dinner.
          </p>
        </div>

        {!student && (
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              setForm(
                emptyForm
              );
              setShow(true);
            }}
          >
            <Plus size={17} />
            Add Menu
          </button>
        )}
      </div>

      {error && (
        <ErrorBox>
          {error}
        </ErrorBox>
      )}

      <div className="menu-grid">
        {menus.map(
          (menu, index) => (
            <Card
              key={
                menu._id ||
                index
              }
              title={
                <>
                  {menu.day}{" "}
                  <span className="badge">
                    {menu.type}
                  </span>
                </>
              }
              action={
                !student && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setEditing(
                        menu
                      );

                      setForm({
                        day: menu.day,
                        type: menu.type,
                        breakfast:
                          arrayToString(
                            menu.breakfast
                          ),
                        lunch:
                          arrayToString(
                            menu.lunch
                          ),
                        snacks:
                          arrayToString(
                            menu.snacks
                          ),
                        dinner:
                          arrayToString(
                            menu.dinner
                          ),
                      });

                      setShow(true);
                    }}
                  >
                    <Edit size={15} />
                    Edit Menu
                  </button>
                )
              }
            >
              <div className="meal-lines">
                <p>
                  <b>
                    Breakfast
                  </b>

                  {arrayToString(
                    menu.breakfast
                  ) || "—"}
                </p>

                <p>
                  <b>
                    Lunch
                  </b>

                  {arrayToString(
                    menu.lunch
                  ) || "—"}
                </p>

                <p>
                  <b>
                    Snacks
                  </b>

                  {arrayToString(
                    menu.snacks
                  ) || "—"}
                </p>

                <p>
                  <b>
                    Dinner
                  </b>

                  {arrayToString(
                    menu.dinner
                  ) || "—"}
                </p>
              </div>
            </Card>
          )
        )}
      </div>

      {!menus.length && (
        <Empty
          text="No menu available."
        />
      )}

      {show && (
        <Modal
          title={
            editing
              ? "Update Mess Menu"
              : "Add Mess Menu"
          }
          close={() =>
            setShow(false)
          }
        >
          <form
            onSubmit={submit}
          >
            <label>
              Day

              <select
                disabled={
                  !!editing
                }
                value={form.day}
                onChange={(e) =>
                  setForm({
                    ...form,
                    day: e.target.value,
                  })
                }
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type

              <select
                disabled={
                  !!editing
                }
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option value="veg">
                  Veg
                </option>

                <option value="non-veg">
                  Non-Veg
                </option>
              </select>
            </label>

            <label>
              Breakfast

              <input
                required
                value={
                  form.breakfast
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    breakfast:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Lunch

              <input
                required
                value={form.lunch}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lunch:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Snacks

              <input
                required
                value={
                  form.snacks
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    snacks:
                      e.target.value,
                  })
                }
              />
            </label>

            <label>
              Dinner

              <input
                required
                value={
                  form.dinner
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    dinner:
                      e.target.value,
                  })
                }
              />
            </label>

            <button
              className="primary full"
              type="submit"
            >
              {editing
                ? "Update Menu"
                : "Create Menu"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

/* =========================================================
   BUS
========================================================= */

function BusPage({
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
      busNo: "",
      route: "",
      hostelToCollege: "",
      collegeToHostel: "",
    });

  function load() {
    const request = student
      ? studentApi.buses()
      : adminApi.buses({
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
            "No buses"
        )
      );
  }

  useEffect(() => {
    load();
  }, [student]);

  async function create(e) {
    e.preventDefault();

    try {
      await adminApi.createBus(
        form
      );

      setShow(false);

      load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed"
      );
    }
  }

  const rows =
    data?.busSchedule ||
    data?.buses ||
    [];

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>
            Bus Schedule
          </h1>

          <p className="muted">
            Hostel to college and
            return timings.
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
            Add Bus
          </button>
        )}
      </div>

      {error && (
        <ErrorBox>
          {error}
        </ErrorBox>
      )}

      <Card title="Schedules">
        <Table
          columns={[
            {
              key: "busNo",
              label: "Bus",
            },
            {
              key: "route",
              label: "Route",
            },
            {
              key:
                "hostelToCollege",
              label:
                "Hostel → College",
            },
            {
              key:
                "collegeToHostel",
              label:
                "College → Hostel",
            },
          ]}
          rows={rows}
        />
      </Card>

      {show && (
        <Modal
          title="Create Bus Schedule"
          close={() =>
            setShow(false)
          }
        >
          <form onSubmit={create}>
            {Object.keys(form).map(
              (key) => (
                <label key={key}>
                  {key}

                  <input
                    required
                    value={form[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:
                          e.target.value,
                      })
                    }
                  />
                </label>
              )
            )}

            <button className="primary full">
              Create
            </button>
          </form>
        </Modal>
      )}
    </>
  );
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
  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    adminApi
      .outings({
        page: 1,
        limit: 50,
      })
      .then((response) =>
        setData(response.data)
      )
      .catch((e) =>
        setError(
          e.response?.data?.message ||
            "Failed"
        )
      );
  }, []);

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
      <h1>
        Students on Leave
      </h1>

      <p className="muted">
        Currently marked outside
        the hostel.
      </p>

      <Card title="Outings">
        <Table
          columns={[
            {
              key: "studentId",
              label: "Student",
              render: (item) =>
                item.studentId
                  ?.userId
                  ?.username ||
                "—",
            },
            {
              key: "category",
              label: "Reason",
            },
            {
              key:
                "expectedReturnTime",
              label:
                "Expected Return",
              render: (item) =>
                item.expectedReturnTime
                  ? new Date(
                      item.expectedReturnTime
                    ).toLocaleString()
                  : "—",
            },
            {
              key: "status",
              label: "Status",
            },
          ]}
          rows={
            data.students ||
            data.outings ||
            []
          }
        />
      </Card>
    </>
  );
}

/* =========================================================
   STUDENT OUTING
========================================================= */

function SimpleOuting() {
  const [form, setForm] =
    useState({
      category: "home",
      customReason: "",
      expectedReturnTime: "",
    });

  const [message, setMessage] =
    useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      await studentApi.applyLeave(
        form
      );

      setMessage(
        "Outing informed successfully."
      );
    } catch (e) {
      setMessage(
        e.response?.data?.message ||
          "Failed to submit outing"
      );
    }
  }

  return (
    <>
      <h1>
        Apply Outing
      </h1>

      <Card title="Outing Information">
        <form onSubmit={submit}>
          <label>
            Reason

            <select
              value={
                form.category
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >
              <option value="home">
                Home
              </option>

              <option value="college">
                College
              </option>

              <option value="medical">
                Medical
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </label>

          <label>
            Details

            <textarea
              value={
                form.customReason
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  customReason:
                    e.target.value,
                })
              }
            />
          </label>

          <label>
            Expected Return

            <input
              type="datetime-local"
              value={
                form.expectedReturnTime
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  expectedReturnTime:
                    e.target.value,
                })
              }
            />
          </label>

          {message && (
            <div className="successbox">
              {message}
            </div>
          )}

          <button className="primary full">
            Submit Outing
          </button>
        </form>
      </Card>
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

  return (
    <Shell>
      <Routes>
        <Route
          path="/"
          element={
            isAdmin ? (
              <AdminDashboard />
            ) : (
              <StudentDashboard />
            )
          }
        />

        {isAdmin && (
          <>
            <Route
              path="/students"
              element={
                <Students />
              }
            />

            <Route
              path="/students/:id"
              element={
                <StudentDetails />
              }
            />

            <Route
              path="/rooms"
              element={
                <Rooms />
              }
            />

            <Route
              path="/fees"
              element={
                <Fees />
              }
            />

            <Route
              path="/complaints"
              element={
                <Complaints />
              }
            />

            <Route
              path="/mess"
              element={
                <Mess />
              }
            />

            <Route
              path="/bus"
              element={
                <BusPage />
              }
            />

            <Route
              path="/kyc"
              element={
                <KYC />
              }
            />

            <Route
              path="/outings"
              element={
                <Outings />
              }
            />

            <Route
              path="/announcements"
              element={
                <Announcements />
              }
            />

            <Route
              path="/profile"
              element={
                <Profile />
              }
            />
          </>
        )}

        {!isAdmin && (
          <>
            <Route
              path="/fees"
              element={
                <Fees student />
              }
            />

            <Route
              path="/complaints"
              element={
                <Complaints student />
              }
            />

            <Route
              path="/mess"
              element={
                <Mess student />
              }
            />

            <Route
              path="/bus"
              element={
                <BusPage student />
              }
            />

            <Route
              path="/outing"
              element={
                <SimpleOuting />
              }
            />

            <Route
              path="/kyc"
              element={
                <KYC student />
              }
            />

            <Route
              path="/announcements"
              element={
                <Announcements
                  student
                />
              }
            />

            <Route
              path="/profile"
              element={
                <Profile
                  student
                />
              }
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