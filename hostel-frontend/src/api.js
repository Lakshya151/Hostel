import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/user",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

export const auth = {

  loginAdmin: (d) =>
    api.post("/loginAdmin", d),

  loginStudent: (d) =>
    api.post("/loginStudent", d),

  loginWorker: (d) =>
    api.post("/login/worker", d),

  verifyOtp: (d) =>
    api.post("/verifyOtp", d),

  resendOtp: (d) =>
    api.post("/resendOtp", d),

  logout: () =>
    api.post("/logout"),
};

/*
|--------------------------------------------------------------------------
| ADMIN APIs
|--------------------------------------------------------------------------
*/

export const adminApi = {

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  dashboard: () =>
    api.get("/adminDashboard"),

  profile: () =>
    api.get("/adminProfile"),

  /*
  |--------------------------------------------------------------------------
  | Students
  |--------------------------------------------------------------------------
  */

  students: (p) =>
    api.get("/allResidentStudents", {
      params: p,
    }),

  pastStudents: (p) =>
    api.get("/pastStudents", {
      params: p,
    }),

  searchStudents: (p) =>
    api.get("/searchStudent", {
      params: p,
    }),

  studentProfile: (id) =>
    api.get(`/studentProfile/${id}`),

  /*
  |--------------------------------------------------------------------------
  | Register New Student
  |--------------------------------------------------------------------------
  */

  registerStudent: (d) =>
    api.post("/registerStudent", d),

  /*
  |--------------------------------------------------------------------------
  | Update / Delete Student
  |--------------------------------------------------------------------------
  */

  deleteStudent: (id) =>
    api.delete(`/deleteStudent/${id}`),

  updateStudent: (id, d) =>
    api.patch(
      `/updateProfileByAdmin/${id}`,
      d
    ),

  /*
  |--------------------------------------------------------------------------
  | Rooms
  |--------------------------------------------------------------------------
  */

  rooms: (p) =>
    api.get("/getAllRooms", {
      params: p,
    }),

  room: (n) =>
    api.get(`/getRoomByNumber/${n}`),

  createRoom: (d) =>
    api.post("/createRoom", d),

  updateRoom: (n, d) =>
    api.patch(`/updateRoom/${n}`, d),

  deleteRoom: (n) =>
    api.delete(`/deleteRoom/${n}`),

  shiftStudent: (id, d) =>
    api.patch(
      `/shiftStudentRoom/${id}`,
      d
    ),

  /*
  |--------------------------------------------------------------------------
  | Fees
  |--------------------------------------------------------------------------
  */

  pendingFees: (p) =>
    api.get("/getPendingFees", {
      params: p,
    }),

  createFee: (d) =>
    api.post("/createFeeStructure", d),

  studentPendingFees: (studentId) =>
    api.get(
      `/studentPendingFees/${studentId}`
    ),

  /*
  |--------------------------------------------------------------------------
  | Complaints
  |--------------------------------------------------------------------------
  */

  complaints: (p) =>
    api.get("/viewComplaint", {
      params: p,
    }),

  complaintStats: () =>
    api.get("/complaintStats"),

  resolveComplaint: (id) =>
    api.patch(
      `/resolveComplaint/${id}`
    ),

  /*
  |--------------------------------------------------------------------------
  | Mess Menu
  |--------------------------------------------------------------------------
  */

  menu: (p) =>
    api.get("/getMenu", {
      params: p,
    }),

  createMenu: (d) =>
    api.post("/createMenu", d),

  updateMenu: (day, type, d) =>
    api.patch(
      `/updateMessMenu/${encodeURIComponent(
        day
      )}/${encodeURIComponent(type)}`,
      d
    ),

  deleteMenu: (day, type) =>
    api.delete(
      `/deleteMenu/${encodeURIComponent(
        day
      )}/${encodeURIComponent(type)}`
    ),

  /*
  |--------------------------------------------------------------------------
  | Bus
  |--------------------------------------------------------------------------
  */

  buses: (p) =>
    api.get("/viewBus", {
      params: p,
    }),

  createBus: (d) =>
    api.post("/createBus", d),

  updateBus: (id, d) =>
    api.patch(`/updateBus/${id}`, d),

  deleteBus: (id) =>
    api.delete(`/deleteBus/${id}`),

  /*
  |--------------------------------------------------------------------------
  | Outings
  |--------------------------------------------------------------------------
  */

  outings: (p) =>
    api.get("/studentOnLeave", {
      params: p,
    }),

  /*
  |--------------------------------------------------------------------------
  | KYC
  |--------------------------------------------------------------------------
  */

  pendingKyc: (p) =>
    api.get("/getPendingKyc", {
      params: p,
    }),

  approveKyc: (id) =>
    api.post(`/approveKyc/${id}`),

  rejectKyc: (id, d) =>
    api.post(
      `/rejectKyc/${id}`,
      d
    ),

  /*
  |--------------------------------------------------------------------------
  | Announcements
  |--------------------------------------------------------------------------
  */

  announcements: (p) =>
    api.get("/getAnnouncement", {
      params: p,
    }),

  createAnnouncement: (d) =>
    api.post(
      "/createAnnouncement",
      d
    ),

  updateAnnouncement: (id, d) =>
    api.patch(
      `/updateAnnouncement/${id}`,
      d
    ),

  deleteAnnouncement: (id) =>
    api.delete(
      `/deleteAnnouncement/${id}`
    ),

  /*
  |--------------------------------------------------------------------------
  | Workers
  |--------------------------------------------------------------------------
  */

  registerWorker: (d) =>
    api.post(
      "/register/worker",
      d
    ),

  removeWorker: (id) =>
    api.patch(
      `/remove/worker/${id}`
    ),
};

/*
|--------------------------------------------------------------------------
| STUDENT APIs
|--------------------------------------------------------------------------
*/

export const studentApi = {

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  dashboard: () =>
    api.get("/studentDashboard"),

  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  profile: (id) =>
    api.get(
      `/studentProfile/${id}`
    ),

  updateProfile: (d) =>
    api.patch(
      "/updateMyProfile",
      d
    ),

  /*
  |--------------------------------------------------------------------------
  | Fees
  |--------------------------------------------------------------------------
  */

  fees: () =>
    api.get("/getMyFees"),

  pendingFees: () =>
    api.get(
      "/studentPendingFees"
    ),

  payFee: (
    feeId,
    installmentId
  ) =>
    api.post(
      `/payFee/${feeId}/${installmentId}`
    ),

  /*
  |--------------------------------------------------------------------------
  | Complaints
  |--------------------------------------------------------------------------
  */

  complaints: (p) =>
    api.get("/myComplaints", {
      params: p,
    }),

  fileComplaint: (d) =>
    api.post(
      "/fileComplaint",
      d
    ),

  updateComplaint: (id, d) =>
    api.patch(
      `/updateComplaint/${id}`,
      d
    ),

  deleteComplaint: (id) =>
    api.delete(
      `/deleteComplaint/${id}`
    ),

  resolveComplaint: (id) =>
    api.patch(
      `/resolveComplaint/${id}`
    ),

  /*
  |--------------------------------------------------------------------------
  | Mess
  |--------------------------------------------------------------------------
  */

  menu: () =>
    api.get("/getMenu"),

  todayMenu: () =>
    api.get("/todayMenu"),

  /*
  |--------------------------------------------------------------------------
  | Lunchbox
  |--------------------------------------------------------------------------
  */

  bookLunchBox: () =>
    api.post("/lunchbox/book"),

  cancelLunchBox: () =>
    api.delete("/lunchbox/cancel"),

  lunchBoxStatus: () =>
    api.get("/lunchbox/my-status"),

  /*
  |--------------------------------------------------------------------------
  | Bus
  |--------------------------------------------------------------------------
  */

  buses: () =>
    api.get("/viewBus"),

  /*
  |--------------------------------------------------------------------------
  | Outing
  |--------------------------------------------------------------------------
  */

  applyLeave: (d) =>
    api.post(
      "/applyLeave",
      d
    ),

  returnToHostel: (id) =>
    api.post(
      `/returnToHostel/${id}`
    ),

  /*
  |--------------------------------------------------------------------------
  | KYC
  |--------------------------------------------------------------------------
  */

  kyc: () =>
    api.get("/getMyKyc"),

  submitKyc: (d) =>
    api.post(
      "/submitKyc",
      d
    ),

  /*
  |--------------------------------------------------------------------------
  | Announcements
  |--------------------------------------------------------------------------
  */

  announcements: () =>
    api.get(
      "/getAnnouncement"
    ),

  /*
  |--------------------------------------------------------------------------
  | Admin Contacts
  |--------------------------------------------------------------------------
  */

  contacts: () =>
    api.get(
      "/getAdminContacts"
    ),
};

/*
|--------------------------------------------------------------------------
| WORKER APIs
|--------------------------------------------------------------------------
*/

export const workerApi = {

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  login: (d) =>
    api.post(
      "/login/worker",
      d
    ),

  /*
  |--------------------------------------------------------------------------
  | Today's Lunchboxes
  |--------------------------------------------------------------------------
  */

  todayLunchBoxes: () =>
    api.get(
      "/lunchbox/today"
    ),

  /*
  |--------------------------------------------------------------------------
  | Today's Lunchboxes By College
  |--------------------------------------------------------------------------
  */

  todayLunchBoxesByCollege: (
    collegeName
  ) =>
    api.get(
      "/lunchbox/today/college",
      {
        params: {
          collegeName,
        },
      }
    ),

  /*
  |--------------------------------------------------------------------------
  | Lunchbox Summary
  |--------------------------------------------------------------------------
  */

  lunchBoxSummary: () =>
    api.get(
      "/lunchbox/today/summary"
    ),

  /*
  |--------------------------------------------------------------------------
  | Collect Lunchbox
  |--------------------------------------------------------------------------
  */

  collectLunchBox: (
    lunchBoxId
  ) =>
    api.patch(
      `/lunchbox/collect/${lunchBoxId}`
    ),
};