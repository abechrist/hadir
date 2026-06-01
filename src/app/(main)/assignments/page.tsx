'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, X, MapPin, Calendar, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function AssignmentPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [pendampings, setPendampings] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const [asn, usr] = await Promise.all([
        firestore.getAssignments(),
        firestore.getUsers(),
      ])
      setAssignments(asn)
      setPendampings(usr.filter((u: any) => u.role === 'pendamping'))
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!userId || !dateStart || !locationName || !lat || !lng) return
    const selectedUser = pendampings.find(u => u.uid === userId)
    await firestore.addAssignment({
      assignmentId: `asn-${Date.now()}`, userId, userName: selectedUser?.name || '',
      dateStart, dateEnd: dateEnd || dateStart,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), name: locationName },
      description, createdBy: user?.name || 'Admin', createdAt: new Date().toISOString(),
    })
    setAssignments(await firestore.getAssignments())
    setUserId(''); setDateStart(''); setDateEnd(''); setLocationName('')
    setLat(''); setLng(''); setDescription('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const handleDelete = async (id: string) => {
    await firestore.deleteAssignment(id)
    setAssignments(await firestore.getAssignments())
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Penugasan Luar Kantor</h2>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? 'Tutup' : 'Tambah Penugasan'}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Tambah Penugasan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs text-[#94A3B8] mb-1">Pendamping</label>
                  <select value={userId} onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]">
                    <option value="">Pilih Pendamping</option>
                    {pendampings.map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
                  </select></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Nama Lokasi</label>
                  <input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Contoh: Sentra UMKM"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Tanggal Mulai</label>
                  <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Tanggal Selesai</label>
                  <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Latitude</label>
                  <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-7.3305"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
                <div><label className="block text-xs text-[#94A3B8] mb-1">Longitude</label>
                  <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="110.5084"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
              </div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi penugasan..." rows={2}
                className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] resize-none" />
              {success && <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Penugasan berhasil dibuat!</span></div>}
              <button onClick={handleAdd} disabled={!userId || !dateStart || !locationName || !lat || !lng}
                className="w-full py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-40 text-[#0F172A] font-semibold rounded-lg text-sm transition-all">Simpan Penugasan</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Daftar Penugasan</h3>
          {[...assignments].sort((a, b) => b.createdAt?.localeCompare(a.createdAt) || 0).map((asn) => {
            const isExpanded = expandedId === asn.assignmentId
            return (
              <motion.div key={asn.assignmentId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : asn.assignmentId)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#1E293B]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-400" /></div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#F8FAFC]">{asn.location?.name}</p>
                      <p className="text-xs text-[#94A3B8]">{asn.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(asn.assignmentId) }}
                      className="p-1.5 text-[#64748B] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><Calendar className="w-3 h-3" />{format(parseISO(asn.dateStart), 'd MMM yyyy', { locale: id })} {asn.dateEnd !== asn.dateStart && `— ${format(parseISO(asn.dateEnd), 'd MMM yyyy', { locale: id })}`}</div>
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><MapPin className="w-3 h-3" />Lat: {asn.location?.lat}, Lng: {asn.location?.lng}</div>
                        {asn.description && <p className="text-xs text-[#E2E8F0] mt-1">{asn.description}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
          {assignments.length === 0 && <div className="text-center py-8 text-[#64748B]"><Briefcase className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">Belum ada penugasan</p></div>}
        </div>
      </div>
    </div>
  )
}

