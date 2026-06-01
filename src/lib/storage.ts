import type { User, Schedule, Attendance, DailyLog, Leave, Assignment, OfficeLocation } from '@/types';

const KEYS = {
  USERS: 'hadir_users',
  SCHEDULES: 'hadir_schedules',
  ATTENDANCES: 'hadir_attendances',
  DAILY_LOGS: 'hadir_daily_logs',
  LEAVES: 'hadir_leaves',
  ASSIGNMENTS: 'hadir_assignments',
  OFFICE_LOCATION: 'hadir_office_location',
  AUTH_USER: 'hadir_auth_user',
  INITIALIZED: 'hadir_initialized',
};

// Generic helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize mock data
export function initializeMockData(): void {
  if (getItem<boolean>(KEYS.INITIALIZED, false)) return;

  // Users
  const users: User[] = [
    { uid: 'admin1', email: 'admin@dispora.salatiga.go.id', name: 'Budi Santoso', role: 'admin', createdAt: '2026-01-15T00:00:00Z' },
    { uid: 'mentor1', email: 'mentor1@email.com', name: 'Dr. Siti Aminah', role: 'mentor', createdAt: '2026-01-15T00:00:00Z' },
    { uid: 'mentor2', email: 'mentor2@email.com', name: 'Ahmad Fauzi', role: 'mentor', createdAt: '2026-01-15T00:00:00Z' },
    { uid: 'mentor3', email: 'mentor3@email.com', name: 'Dewi Kusuma', role: 'mentor', createdAt: '2026-01-20T00:00:00Z' },
    { uid: 'pendamping1', email: 'pendamping1@email.com', name: 'Rina Wulandari', role: 'pendamping', createdAt: '2026-01-15T00:00:00Z' },
    { uid: 'pendamping2', email: 'pendamping2@email.com', name: 'Agus Pratama', role: 'pendamping', createdAt: '2026-01-15T00:00:00Z' },
    { uid: 'pendamping3', email: 'pendamping3@email.com', name: 'Maya Sari', role: 'pendamping', createdAt: '2026-01-18T00:00:00Z' },
    { uid: 'pendamping4', email: 'pendamping4@email.com', name: 'Hadi Wijaya', role: 'pendamping', createdAt: '2026-01-20T00:00:00Z' },
    { uid: 'pendamping5', email: 'pendamping5@email.com', name: 'Lestari Dewi', role: 'pendamping', createdAt: '2026-01-22T00:00:00Z' },
  ];
  setItem(KEYS.USERS, users);

  // Office Location (Dinas Pemuda dan Olahraga Salatiga)
  const officeLocation: OfficeLocation = {
    lat: -7.3305,
    lng: 110.5084,
    radius: 150,
    name: 'Dinas Pemuda dan Olahraga Kota Salatiga',
  };
  setItem(KEYS.OFFICE_LOCATION, officeLocation);

  // Schedules (Juni 2026)
  const schedules: Schedule[] = [
    { scheduleId: 'sch1', title: 'Mentoring Wirausaha Digital', date: '2026-06-02', time: '09:00 - 12:00', location: 'Aula Dispora Salatiga', mentorId: 'mentor1', mentorName: 'Dr. Siti Aminah', status: 'upcoming', description: 'Pembahasan strategi pemasaran digital untuk UMKM' },
    { scheduleId: 'sch2', title: 'Kelas Manajemen Keuangan', date: '2026-06-03', time: '13:00 - 16:00', location: 'Ruang Rapat Dispora', mentorId: 'mentor2', mentorName: 'Ahmad Fauzi', status: 'upcoming', description: 'Pencatatan keuangan dan perencanaan budgeting' },
    { scheduleId: 'sch3', title: 'Visit ke Sentra UMKM', date: '2026-06-05', time: '08:00 - 14:00', location: 'Sentra UMKM Salatiga', mentorId: 'mentor3', mentorName: 'Dewi Kusuma', status: 'upcoming', description: 'Kunjungan lapangan ke sentra UMKM' },
    { scheduleId: 'sch4', title: 'Mentoring Branding Produk', date: '2026-06-09', time: '09:00 - 11:30', location: 'Aula Dispora Salatiga', mentorId: 'mentor1', mentorName: 'Dr. Siti Aminah', status: 'upcoming', description: 'Pembuatan identitas brand dan packaging' },
    { scheduleId: 'sch5', title: 'Workshop E-Commerce', date: '2026-06-10', time: '13:00 - 16:00', location: 'Lab Komputer Dispora', mentorId: 'mentor2', mentorName: 'Ahmad Fauzi', status: 'upcoming', description: 'Praktik membuat toko online' },
    { scheduleId: 'sch6', title: 'Evaluasi dan Coaching', date: '2026-06-12', time: '09:00 - 12:00', location: 'Ruang Rapat Dispora', mentorId: 'mentor3', mentorName: 'Dewi Kusuma', status: 'upcoming', description: 'Evaluasi progress peserta' },
  ];
  setItem(KEYS.SCHEDULES, schedules);

  // Mock attendances (historical data)
  const attendances: Attendance[] = [
    { attendanceId: 'att1', userId: 'mentor1', userName: 'Dr. Siti Aminah', scheduleId: 'sch-may-1', scheduleTitle: 'Mentoring Bulan Mei', type: 'mentor', log: 'Peserta sangat antusias dengan materi pemasaran digital', timestamp: '2026-05-15T09:30:00Z', date: '2026-05-15', status: 'approved', verifiedBy: 'Budi Santoso', verifiedAt: '2026-05-15T14:00:00Z' },
    { attendanceId: 'att2', userId: 'pendamping1', userName: 'Rina Wulandari', type: 'pendamping-checkin', timestamp: '2026-05-28T07:45:00Z', date: '2026-05-28', status: 'approved', location: { lat: -7.3305, lng: 110.5084 }, locationType: 'office' },
    { attendanceId: 'att3', userId: 'pendamping1', userName: 'Rina Wulandari', type: 'pendamping-checkout', timestamp: '2026-05-28T16:00:00Z', date: '2026-05-28', status: 'approved', location: { lat: -7.3305, lng: 110.5084 }, locationType: 'office' },
    { attendanceId: 'att4', userId: 'pendamping2', userName: 'Agus Pratama', type: 'pendamping-checkin', timestamp: '2026-05-29T08:00:00Z', date: '2026-05-29', status: 'approved', location: { lat: -7.3305, lng: 110.5084 }, locationType: 'office' },
    { attendanceId: 'att5', userId: 'pendamping2', userName: 'Agus Pratama', type: 'pendamping-checkout', timestamp: '2026-05-29T15:30:00Z', date: '2026-05-29', status: 'approved', location: { lat: -7.3305, lng: 110.5084 }, locationType: 'office' },
  ];
  setItem(KEYS.ATTENDANCES, attendances);

  // Mock daily logs
  const dailyLogs: DailyLog[] = [
    { logId: 'dl1', userId: 'pendamping1', userName: 'Rina Wulandari', date: '2026-05-28', entries: [
      { time: '08:00', narration: 'Persiapan dokumen mentoring hari ini' },
      { time: '10:30', narration: 'Koordinasi dengan peserta program' },
      { time: '14:00', narration: 'Input data kehadiran peserta' },
    ], checkInTime: '07:45', checkOutTime: '16:00', checkInLocation: { lat: -7.3305, lng: 110.5084 }, checkOutLocation: { lat: -7.3305, lng: 110.5084 }, locationType: 'office', status: 'approved' },
    { logId: 'dl2', userId: 'pendamping2', userName: 'Agus Pratama', date: '2026-05-29', entries: [
      { time: '08:30', narration: 'Pendampingan UMKM di kelurahan' },
      { time: '13:00', narration: 'Dokumentasi kegiatan mentoring' },
    ], checkInTime: '08:00', checkOutTime: '15:30', checkInLocation: { lat: -7.3305, lng: 110.5084 }, checkOutLocation: { lat: -7.3305, lng: 110.5084 }, locationType: 'office', status: 'approved' },
  ];
  setItem(KEYS.DAILY_LOGS, dailyLogs);

  // Mock leaves
  const leaves: Leave[] = [
    { leaveId: 'leave1', userId: 'pendamping3', userName: 'Maya Sari', userRole: 'pendamping', date: '2026-05-27', type: 'sakit', reason: 'Demam dan flu, istirahat di rumah', status: 'approved', verifiedBy: 'Budi Santoso', verifiedAt: '2026-05-26T10:00:00Z', verificationNote: 'Disetujui, semoga lekas sembuh', createdAt: '2026-05-25T08:00:00Z' },
    { leaveId: 'leave2', userId: 'mentor2', userName: 'Ahmad Fauzi', userRole: 'mentor', date: '2026-05-30', type: 'kegiatan_lain', reason: 'Mengikuti seminar nasional di Jakarta', status: 'pending', createdAt: '2026-05-28T09:00:00Z' },
  ];
  setItem(KEYS.LEAVES, leaves);

  // Mock assignments
  const assignments: Assignment[] = [
    { assignmentId: 'asn1', userId: 'pendamping1', userName: 'Rina Wulandari', dateStart: '2026-06-05', dateEnd: '2026-06-05', location: { lat: -7.325, lng: 110.515, name: 'Sentra UMKM Salatiga' }, description: 'Pendampingan visit ke Sentra UMKM bersama mentor', createdBy: 'Budi Santoso', createdAt: '2026-06-01T08:00:00Z' },
  ];
  setItem(KEYS.ASSIGNMENTS, assignments);

  setItem(KEYS.INITIALIZED, true);
}

// Auth
export function getAuthUser(): User | null {
  return getItem<User | null>(KEYS.AUTH_USER, null);
}

export function setAuthUser(user: User | null): void {
  if (user) {
    setItem(KEYS.AUTH_USER, user);
  } else {
    localStorage.removeItem(KEYS.AUTH_USER);
  }
}

export function loginUser(email: string, password: string): User | null {
  const users = getItem<User[]>(KEYS.USERS, []);
  const user = users.find(u => u.email === email);
  if (user && password === 'password123') {
    setAuthUser(user);
    return user;
  }
  return null;
}

// CRUD helpers
export function getUsers(): User[] {
  return getItem<User[]>(KEYS.USERS, []);
}

export function getSchedules(): Schedule[] {
  return getItem<Schedule[]>(KEYS.SCHEDULES, []);
}

export function addSchedule(schedule: Schedule): void {
  const schedules = getSchedules();
  schedules.push(schedule);
  setItem(KEYS.SCHEDULES, schedules);
}

export function updateSchedule(updated: Schedule): void {
  const schedules = getSchedules();
  const idx = schedules.findIndex(s => s.scheduleId === updated.scheduleId);
  if (idx >= 0) {
    schedules[idx] = updated;
    setItem(KEYS.SCHEDULES, schedules);
  }
}

export function deleteSchedule(scheduleId: string): void {
  const schedules = getSchedules().filter(s => s.scheduleId !== scheduleId);
  setItem(KEYS.SCHEDULES, schedules);
}

export function getAttendances(): Attendance[] {
  return getItem<Attendance[]>(KEYS.ATTENDANCES, []);
}

export function addAttendance(attendance: Attendance): void {
  const attendances = getAttendances();
  attendances.push(attendance);
  setItem(KEYS.ATTENDANCES, attendances);
}

export function updateAttendance(updated: Attendance): void {
  const attendances = getAttendances();
  const idx = attendances.findIndex(a => a.attendanceId === updated.attendanceId);
  if (idx >= 0) {
    attendances[idx] = updated;
    setItem(KEYS.ATTENDANCES, attendances);
  }
}

export function getDailyLogs(): DailyLog[] {
  return getItem<DailyLog[]>(KEYS.DAILY_LOGS, []);
}

export function addDailyLog(log: DailyLog): void {
  const logs = getDailyLogs();
  logs.push(log);
  setItem(KEYS.DAILY_LOGS, logs);
}

export function updateDailyLog(updated: DailyLog): void {
  const logs = getDailyLogs();
  const idx = logs.findIndex(l => l.logId === updated.logId);
  if (idx >= 0) {
    logs[idx] = updated;
    setItem(KEYS.DAILY_LOGS, logs);
  }
}

export function getLeaves(): Leave[] {
  return getItem<Leave[]>(KEYS.LEAVES, []);
}

export function addLeave(leave: Leave): void {
  const leaves = getLeaves();
  leaves.push(leave);
  setItem(KEYS.LEAVES, leaves);
}

export function updateLeave(updated: Leave): void {
  const leaves = getLeaves();
  const idx = leaves.findIndex(l => l.leaveId === updated.leaveId);
  if (idx >= 0) {
    leaves[idx] = updated;
    setItem(KEYS.LEAVES, leaves);
  }
}

export function getAssignments(): Assignment[] {
  return getItem<Assignment[]>(KEYS.ASSIGNMENTS, []);
}

export function addAssignment(assignment: Assignment): void {
  const assignments = getAssignments();
  assignments.push(assignment);
  setItem(KEYS.ASSIGNMENTS, assignments);
}

export function deleteAssignment(assignmentId: string): void {
  const assignments = getAssignments().filter(a => a.assignmentId !== assignmentId);
  setItem(KEYS.ASSIGNMENTS, assignments);
}

export function getOfficeLocation(): OfficeLocation {
  return getItem<OfficeLocation>(KEYS.OFFICE_LOCATION, { lat: -7.3305, lng: 110.5084, radius: 150, name: 'Dinas Pemuda dan Olahraga Kota Salatiga' });
}

export function updateOfficeLocation(location: OfficeLocation): void {
  setItem(KEYS.OFFICE_LOCATION, location);
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  setItem(KEYS.USERS, users);
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.uid !== userId);
  setItem(KEYS.USERS, users);
}
