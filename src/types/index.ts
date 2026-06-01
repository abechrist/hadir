export type UserRole = 'admin' | 'mentor' | 'pendamping';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Schedule {
  scheduleId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  mentorId: string;
  mentorName: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
}

export interface Attendance {
  attendanceId: string;
  userId: string;
  userName: string;
  scheduleId?: string;
  scheduleTitle?: string;
  type: 'mentor' | 'pendamping-checkin' | 'pendamping-checkout';
  selfieUrl?: string;
  photos?: string[];
  log?: string;
  timestamp: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
  location?: { lat: number; lng: number };
  locationType?: 'office' | 'assignment';
  assignmentId?: string;
}

export interface DailyLogEntry {
  time: string;
  narration: string;
  attachments?: string[];
}

export interface DailyLog {
  logId: string;
  userId: string;
  userName: string;
  date: string;
  entries: DailyLogEntry[];
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: { lat: number; lng: number };
  checkOutLocation?: { lat: number; lng: number };
  locationType?: 'office' | 'assignment';
  assignmentId?: string;
  assignmentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
}

export interface Leave {
  leaveId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: string;
  type: 'sakit' | 'kegiatan_lain' | 'cuti' | 'darurat';
  reason: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
  createdAt: string;
}

export interface Assignment {
  assignmentId: string;
  userId: string;
  userName: string;
  dateStart: string;
  dateEnd: string;
  location: { lat: number; lng: number; name: string };
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface OfficeLocation {
  lat: number;
  lng: number;
  radius: number;
  name: string;
}

export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
}
