import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const TOKEN_EXPIRY_HOURS = 24

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const key = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

function verifyPassword(password: string, hash: string | null): boolean {
  if (!hash) return false
  const [salt, key] = hash.split(':')
  return crypto.scryptSync(password, salt, 64).toString('hex') === key
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { op } = body
    const sql = neon(process.env.DATABASE_URL || '')

    switch (op) {
      case 'login': {
        const { email, password } = body
        if (!email || !password) {
          return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
        }

        const rows = await sql`SELECT * FROM users WHERE email = ${email}`
        if (rows.length === 0) {
          return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
        }

        const user = rows[0]
        if (!verifyPassword(password, user.password_hash)) {
          return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
        }

        await sql`DELETE FROM sessions WHERE user_id = ${user.uid} AND expires_at < NOW()`

        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
        await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${user.uid}, ${expiresAt})`

        return NextResponse.json({
          user: { uid: user.uid, email: user.email, name: user.name, role: user.role, createdAt: user.created_at },
          token,
        })
      }

      case 'register': {
        const authHeader = req.headers.get('authorization')
        let isAdmin = false
        if (authHeader?.startsWith('Bearer ')) {
          const sessions = await sql`
            SELECT u.role FROM sessions s
            JOIN users u ON s.user_id = u.uid
            WHERE s.token = ${authHeader.slice(7)} AND s.expires_at > NOW()
          `
          isAdmin = sessions.length > 0 && sessions[0].role === 'admin'
        }

        const count = await sql`SELECT COUNT(*) AS cnt FROM users`
        const noUsers = parseInt(count[0].cnt) === 0

        if (!isAdmin && !noUsers) {
          return NextResponse.json({ error: 'Hanya admin yang dapat mendaftarkan pengguna baru' }, { status: 403 })
        }

        const { email, password, name, role } = body
        if (!email || !password || !name) {
          return NextResponse.json({ error: 'Email, password, dan nama harus diisi' }, { status: 400 })
        }

        const uid = crypto.randomUUID()
        await sql`
          INSERT INTO users (uid, email, name, password_hash, role)
          VALUES (${uid}, ${email}, ${name}, ${hashPassword(password)}, ${role || 'pendamping'})
        `

        return NextResponse.json({ success: true, uid })
      }

      case 'me': {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
        }

        const sessions = await sql`
          SELECT s.*, u.email, u.name, u.role, u.created_at
          FROM sessions s JOIN users u ON s.user_id = u.uid
          WHERE s.token = ${authHeader.slice(7)} AND s.expires_at > NOW()
        `
        if (sessions.length === 0) {
          return NextResponse.json({ error: 'Sesi tidak valid atau sudah kedaluwarsa' }, { status: 401 })
        }

        const r = sessions[0]
        return NextResponse.json({
          user: { uid: r.user_id, email: r.email, name: r.name, role: r.role, createdAt: r.created_at },
        })
      }

      case 'checkUsers': {
        const count = await sql`SELECT COUNT(*) AS cnt FROM users`
        return NextResponse.json({ noUsers: parseInt(count[0].cnt) === 0 })
      }

      case 'logout': {
        const authHeader = req.headers.get('authorization')
        if (authHeader?.startsWith('Bearer ')) {
          await sql`DELETE FROM sessions WHERE token = ${authHeader.slice(7)}`
        }
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: `Unknown operation: ${op}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Auth API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
