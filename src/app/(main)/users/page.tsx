'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, X, Search, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { createUserWithRole } from '@/lib/services/auth-service'
import type { UserRole } from '@/types'

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState<UserRole>('pendamping')
  const [success, setSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => { firestore.getUsers().then(setUsers) }, [])

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddUser = async () => {
    if (!name.trim() || !email.trim()) return
    setSubmitError('')
    try {
      await createUserWithRole(email.trim(), password, name.trim(), role)
      await new Promise(r => setTimeout(r, 1000))
      await firestore.getUsers().then(setUsers)
      setName(''); setEmail(''); setRole('pendamping')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal membuat pengguna')
    }
  }

  const handleDelete = async (uid: string) => {
    try {
      await firestore.deleteUserFromDb(uid)
      setUsers(await firestore.getUsers())
    } catch {}
    setDeleteConfirm(null)
  }

  const roleColors: Record<string, string> = { admin: 'bg-purple-500/20 text-purple-400', mentor: 'bg-blue-500/20 text-blue-400', pendamping: 'bg-emerald-500/20 text-emerald-400' }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Manajemen Pengguna</h2>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? 'Tutup' : 'Tambah Pengguna'}
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
          </div>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Tambah Pengguna Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs text-[#94A3B8] mb-1">Nama Lengkap</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password123"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-[#94A3B8] mb-1">Role</label>
                  <div className="flex gap-3">
                    {(['admin', 'mentor', 'pendamping'] as UserRole[]).map((r) => (
                      <button key={r} onClick={() => setRole(r)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${role === r ? 'bg-[#FBBF24] text-[#0F172A]' : 'bg-[#0A0F1C] border border-[#1E293B] text-[#94A3B8]'}`}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
              {submitError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{submitError}</div>}
              {success && <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Pengguna berhasil ditambahkan!</span></div>}
              <button onClick={handleAddUser} disabled={!name.trim() || !email.trim()}
                className="w-full py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-40 text-[#0F172A] font-semibold rounded-lg text-sm transition-all">Simpan Pengguna</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <motion.div key={u.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FBBF24]/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#FBBF24]">{u.name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F8FAFC] truncate">{u.name}</p>
                <p className="text-xs text-[#94A3B8] truncate">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${roleColors[u.role] || ''}`}>{u.role}</span>
              {u.uid !== currentUser?.uid && (
                <button onClick={() => setDeleteConfirm(u.uid)}
                  className="p-2 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"><Trash2 className="w-4 h-4" /></button>
              )}
            </motion.div>
          ))}
          {filteredUsers.length === 0 && <div className="text-center py-8 text-[#64748B]"><Users className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">Tidak ada pengguna ditemukan</p></div>}
        </div>

        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()} className="bg-[#111827] border border-[#1E293B] rounded-xl p-6 w-full max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                  <h3 className="text-lg font-semibold text-[#F8FAFC]">Hapus Pengguna</h3>
                </div>
                <p className="text-sm text-[#94A3B8] mb-6">Apakah Anda yakin ingin menghapus pengguna ini?</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-[#1E293B] text-[#94A3B8] rounded-lg hover:bg-[#1E293B] text-sm font-medium">Batal</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded-lg text-sm">Hapus</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

