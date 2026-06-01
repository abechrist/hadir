const API_URL = '/api/db'

async function call(op: string, data?: any) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, ...data }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'API request failed')
  }
  return res.json()
}

// ---- Users ----
export async function getUsers() {
  return call('getUsers')
}
export async function deleteUserFromDb(uid: string) {
  return call('deleteUser', { uid })
}

// ---- Schedules ----
export async function getSchedules() {
  return call('getSchedules')
}
export async function addSchedule(schedule: any) {
  return call('addSchedule', schedule)
}
export async function updateSchedule(schedule: any) {
  return call('updateSchedule', schedule)
}
export async function deleteSchedule(scheduleId: string) {
  return call('deleteSchedule', { scheduleId })
}

// ---- Attendances ----
export async function getAttendances() {
  return call('getAttendances')
}
export async function addAttendance(attendance: any) {
  return call('addAttendance', attendance)
}
export async function updateAttendance(attendance: any) {
  return call('updateAttendance', attendance)
}

// ---- Daily Logs ----
export async function getDailyLogs() {
  return call('getDailyLogs')
}
export async function addDailyLog(log: any) {
  return call('addDailyLog', log)
}
export async function updateDailyLog(log: any) {
  return call('updateDailyLog', log)
}

// ---- Leaves ----
export async function getLeaves() {
  return call('getLeaves')
}
export async function addLeave(leave: any) {
  return call('addLeave', leave)
}
export async function updateLeave(leave: any) {
  return call('updateLeave', leave)
}

// ---- Assignments ----
export async function getAssignments() {
  return call('getAssignments')
}
export async function addAssignment(assignment: any) {
  return call('addAssignment', assignment)
}
export async function deleteAssignment(assignmentId: string) {
  return call('deleteAssignment', { assignmentId })
}

// ---- Config ----
export async function getOfficeLocation() {
  return call('getOfficeLocation')
}
export async function updateOfficeLocation(location: any) {
  return call('updateOfficeLocation', location)
}
