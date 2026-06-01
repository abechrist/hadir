'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { MapPin, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [showRegister, setShowRegister] = useState(false)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState('')

  useEffect(() => {
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'checkUsers' }),
    }).then(r => r.json()).then(d => {
      if (d.noUsers) setShowRegister(true)
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        router.replace('/dashboard')
      } else {
        setError('Email atau password salah.')
      }
    } catch (err: any) {
      setError(err?.message || err?.code || 'Terjadi kesalahan saat login')
    }
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setRegSuccess('')
    setRegLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'register', email: regEmail, password: regPassword, name: regName, role: 'admin' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar')
      setRegSuccess('Akun admin berhasil dibuat! Silakan login.')
      setShowRegister(false)
      setEmail(regEmail)
      setPassword(regPassword)
    } catch (err: any) {
      setError(err.message)
    }
    setRegLoading(false)
  }

  const demoAccounts = [
    { role: 'Admin', email: 'admin@hadir.app', pass: 'password123' },
    { role: 'Mentor', email: 'mentor@hadir.app', pass: 'password123' },
    { role: 'Pendamping', email: 'pendamping@hadir.app', pass: 'password123' },
  ]

  const fillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email)
    setPassword(acc.pass)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-[#FBBF24] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FBBF24]/20"
          >
            <MapPin className="w-10 h-10 text-[#0F172A]" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#F8FAFC] tracking-tight">HADIR</h1>
          <p className="text-sm text-[#94A3B8] mt-1">HADIR — Sistem Kehadiran Mentor & Pendamping</p>
          <p className="text-xs text-[#64748B] mt-0.5">Dispora Kota Salatiga 2026</p>
        </div>

        {regSuccess && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{regSuccess}</span>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#EF4444]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#111827] border border-[#1E293B] rounded-xl p-6"
        >
          {showRegister ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-[#FBBF24]" />
                <h2 className="text-lg font-semibold text-[#F8FAFC]">Buat Akun Admin</h2>
              </div>
              <p className="text-sm text-[#94A3B8] mb-5">Isi data untuk membuat akun admin pertama</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Nama Lengkap</label>
                  <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Nama Anda" required
                    className="w-full px-4 py-3 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="email@domain.com" required
                      className="w-full pl-10 pr-4 py-3 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Min 6 karakter" required minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
                  </div>
                </div>
                <button type="submit" disabled={regLoading}
                  className="w-full py-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {regLoading ? 'Mendaftarkan...' : 'Buat Akun Admin'}
                </button>
              </form>
              <button onClick={() => { setShowRegister(false); setError('') }}
                className="w-full mt-3 py-2 text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">
                Sudah punya akun? Masuk
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-1">Masuk</h2>
              <p className="text-sm text-[#94A3B8] mb-5">Silakan masukkan kredensial Anda</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com" required
                      className="w-full pl-10 pr-4 py-3 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24]/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full pl-10 pr-10 py-3 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24]/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-3 bg-[#FBBF24] hover:bg-[#F59E0B] active:bg-[#D97706] text-[#0F172A] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-[#0F172A] border-t-transparent rounded-full" />
                  ) : 'Masuk'}
                </button>
              </form>
            </>
          )}
        </motion.div>

        {!showRegister && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6">
              <p className="text-xs text-[#64748B] text-center mb-3">Akun Demo</p>
              <div className="space-y-2">
                {demoAccounts.map((acc) => (
                  <button key={acc.email} onClick={() => fillDemo(acc)}
                    className="w-full flex items-center gap-3 p-3 bg-[#111827]/50 border border-[#1E293B] rounded-lg hover:border-[#FBBF24]/50 hover:bg-[#1E293B]/50 transition-all text-left">
                    <div className="w-8 h-8 rounded-full bg-[#FBBF24]/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#FBBF24]">{acc.role[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F8FAFC]">{acc.role}</p>
                      <p className="text-xs text-[#64748B] truncate">{acc.email}</p>
                    </div>
                    <span className="text-[10px] text-[#64748B] bg-[#1E293B] px-2 py-0.5 rounded">{acc.pass}</span>
                  </button>
                ))}
              </div>
            </motion.div>
            <p className="text-center mt-4">
              <button onClick={() => setShowRegister(true)}
                className="text-xs text-[#FBBF24] hover:text-[#F59E0B] transition-colors">
                Belum punya akun? Daftar
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
