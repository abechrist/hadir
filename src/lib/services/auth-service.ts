import type { User, UserRole } from '@/types'

const AUTH_TOKEN_KEY = 'hadir-auth-token'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function setToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

async function apiAuth(body: any, token?: string | null): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch('/api/auth', { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw { code: res.status.toString(), message: data.error || 'Request failed' }
  return data
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const data = await apiAuth({ op: 'login', email, password })
  if (data.token) setToken(data.token)
  return data.user || null
}

export async function logoutUser(): Promise<void> {
  const token = getToken()
  try { await apiAuth({ op: 'logout' }, token) } catch {}
  clearToken()
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const token = getToken()
  if (!token) {
    callback(null)
    return () => {}
  }

  apiAuth({ op: 'me' }, token)
    .then((data) => callback(data.user || null))
    .catch(() => { clearToken(); callback(null) })

  return () => {}
}

export async function createUserWithRole(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<void> {
  const token = getToken()
  await apiAuth({ op: 'register', email, password, name, role }, token)
}
