import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { op } = body
    const sql = neon(process.env.DATABASE_URL || '')

    switch (op) {
      case 'getUsers': {
        const rows = await sql`SELECT * FROM users ORDER BY name ASC`
        return NextResponse.json(rows)
      }
      case 'deleteUser': {
        const { uid } = body
        await sql`DELETE FROM users WHERE uid = ${uid}`
        return NextResponse.json({ success: true })
      }

      case 'getSchedules': {
        const rows = await sql`SELECT * FROM schedules ORDER BY date ASC`
        return NextResponse.json(rows)
      }
      case 'addSchedule': {
        const s = body
        await sql`
          INSERT INTO schedules (schedule_id, title, date, time, location, mentor_id, status, created_by)
          VALUES (${s.scheduleId}, ${s.title}, ${s.date}, ${s.time},
                  ${s.location ? JSON.stringify(s.location) : null},
                  ${s.mentorId}, ${s.status || 'active'}, ${s.createdBy})
        `
        return NextResponse.json({ success: true })
      }
      case 'updateSchedule': {
        const s = body
        await sql`
          UPDATE schedules SET title = ${s.title}, date = ${s.date}, time = ${s.time},
            location = ${s.location ? JSON.stringify(s.location) : null},
            mentor_id = ${s.mentorId}, status = ${s.status}
          WHERE schedule_id = ${s.scheduleId}
        `
        return NextResponse.json({ success: true })
      }
      case 'deleteSchedule': {
        const { scheduleId } = body
        await sql`DELETE FROM schedules WHERE schedule_id = ${scheduleId}`
        return NextResponse.json({ success: true })
      }

      case 'getAttendances': {
        const rows = await sql`SELECT * FROM attendances ORDER BY timestamp DESC`
        return NextResponse.json(rows)
      }
      case 'addAttendance': {
        const a = body
        await sql`
          INSERT INTO attendances (attendance_id, user_id, user_name, type, selfie_url, log,
            timestamp, date, status, location, location_type, assignment_id, schedule_id, schedule_title)
          VALUES (${a.attendanceId}, ${a.userId}, ${a.userName}, ${a.type}, ${a.selfieUrl},
            ${a.log}, ${a.timestamp}, ${a.date}, ${a.status || 'pending'},
            ${a.location ? JSON.stringify(a.location) : null}, ${a.locationType},
            ${a.assignmentId}, ${a.scheduleId}, ${a.scheduleTitle})
        `
        return NextResponse.json({ success: true })
      }
      case 'updateAttendance': {
        const a = body
        await sql`
          UPDATE attendances SET status = ${a.status}, verification_note = ${a.verificationNote},
            verified_by = ${a.verifiedBy}, verified_at = ${a.verifiedAt}
          WHERE attendance_id = ${a.attendanceId}
        `
        return NextResponse.json({ success: true })
      }

      case 'getDailyLogs': {
        const rows = await sql`SELECT * FROM daily_logs ORDER BY date DESC`
        return NextResponse.json(rows)
      }
      case 'addDailyLog': {
        const d = body
        await sql`
          INSERT INTO daily_logs (log_id, user_id, user_name, date, entries, status)
          VALUES (${d.logId}, ${d.userId}, ${d.userName}, ${d.date},
                  ${JSON.stringify(d.entries || [])}, ${d.status || 'pending'})
        `
        return NextResponse.json({ success: true })
      }
      case 'updateDailyLog': {
        const d = body
        await sql`
          UPDATE daily_logs SET entries = ${JSON.stringify(d.entries || [])},
            status = ${d.status}, check_in_time = ${d.checkInTime},
            check_out_time = ${d.checkOutTime}, verification_note = ${d.verificationNote},
            verified_by = ${d.verifiedBy}
          WHERE log_id = ${d.logId}
        `
        return NextResponse.json({ success: true })
      }

      case 'getLeaves': {
        const rows = await sql`SELECT * FROM leaves ORDER BY created_at DESC`
        return NextResponse.json(rows)
      }
      case 'addLeave': {
        const l = body
        await sql`
          INSERT INTO leaves (leave_id, user_id, user_name, user_role, date, type, reason,
            attachment_url, status, created_at)
          VALUES (${l.leaveId}, ${l.userId}, ${l.userName}, ${l.userRole}, ${l.date},
            ${l.type}, ${l.reason}, ${l.attachmentUrl}, ${l.status || 'pending'}, ${l.createdAt})
        `
        return NextResponse.json({ success: true })
      }
      case 'updateLeave': {
        const l = body
        await sql`
          UPDATE leaves SET status = ${l.status}, verification_note = ${l.verificationNote},
            verified_by = ${l.verifiedBy}
          WHERE leave_id = ${l.leaveId}
        `
        return NextResponse.json({ success: true })
      }

      case 'getAssignments': {
        const rows = await sql`SELECT * FROM assignments`
        return NextResponse.json(rows)
      }
      case 'addAssignment': {
        const a = body
        await sql`
          INSERT INTO assignments (assignment_id, user_id, date_start, date_end, location, description, created_by)
          VALUES (${a.assignmentId}, ${a.userId}, ${a.dateStart}, ${a.dateEnd},
                  ${a.location ? JSON.stringify(a.location) : null},
                  ${a.description}, ${a.createdBy})
        `
        return NextResponse.json({ success: true })
      }
      case 'deleteAssignment': {
        const { assignmentId } = body
        await sql`DELETE FROM assignments WHERE assignment_id = ${assignmentId}`
        return NextResponse.json({ success: true })
      }

      case 'getOfficeLocation': {
        const rows = await sql`SELECT * FROM config WHERE id = 'officeLocation'`
        if (rows.length > 0) {
          return NextResponse.json(rows[0])
        }
        return NextResponse.json({
          id: 'officeLocation', lat: -7.3305, lng: 110.5084,
          radius: 150, name: 'Dinas Pemuda dan Olahraga Kota Salatiga',
        })
      }
      case 'updateOfficeLocation': {
        const loc = body
        await sql`
          UPDATE config SET lat = ${loc.lat}, lng = ${loc.lng}, radius = ${loc.radius}, name = ${loc.name}
          WHERE id = 'officeLocation'
        `
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: `Unknown operation: ${op}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('DB API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
