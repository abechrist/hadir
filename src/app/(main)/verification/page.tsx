'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, CheckCircle2, FileText, Clock, MapPin, ClipboardList,
  User, XCircle as XCircleIcon
} from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'
type ItemType = 'attendance' | 'dailylog' | 'leave'

interface VerificationItem {
  id: string; type: ItemType; userName: string; date: string
  title: string; status: 'pending' | 'approved' | 'rejected'; data: any
}

export default function VerificationPage() {
  const { user } = useAuth()
  const [attendances, setAttendances] = useState<any[]>([])
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [selectedItem, setSelectedItem] = useState<VerificationItem | null>(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    async function load() {
      const [att, dl, lv] = await Promise.all([
        firestore.getAttendances(),
        firestore.getDailyLogs(),
        firestore.getLeaves(),
      ])
      setAttendances(att); setDailyLogs(dl); setLeaves(lv)
    }
    load()
  }, [])

  const allItems: VerificationItem[] = [
    ...attendances.map(a => ({ id: a.attendanceId, type: 'attendance' as ItemType, userName: a.userName, date: a.date, title: a.type === 'mentor' ? `Absensi Mentor - ${a.scheduleTitle || 'Kegiatan'}` : a.type === 'pendamping-checkin' ? 'Check-in Pendamping' : 'Check-out Pendamping', status: a.status, data: a })),
    ...dailyLogs.map(d => ({ id: d.logId, type: 'dailylog' as ItemType, userName: d.userName, date: d.date, title: `Log Harian - ${d.entries?.length || 0} entri`, status: d.status, data: d })),
    ...leaves.map(l => ({ id: l.leaveId, type: 'leave' as ItemType, userName: l.userName, date: l.date, title: `Izin ${l.type}`, status: l.status, data: l })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  const filteredItems = filter === 'all' ? allItems : allItems.filter(i => i.status === filter)

  const handleApprove = async () => {
    if (!selectedItem || !user) return
    const update = { ...selectedItem.data, status: 'approved' as const, verifiedBy: user.name, verifiedAt: new Date().toISOString(), verificationNote: note || undefined }
    if (selectedItem.type === 'attendance') await firestore.updateAttendance(update)
    else if (selectedItem.type === 'dailylog') await firestore.updateDailyLog(update)
    else if (selectedItem.type === 'leave') await firestore.updateLeave(update)
    refresh()
    setSelectedItem(null); setNote('')
  }

  const handleReject = async () => {
    if (!selectedItem || !user || !note.trim()) return
    const update = { ...selectedItem.data, status: 'rejected' as const, verifiedBy: user.name, verifiedAt: new Date().toISOString(), verificationNote: note }
    if (selectedItem.type === 'attendance') await firestore.updateAttendance(update)
    else if (selectedItem.type === 'dailylog') await firestore.updateDailyLog(update)
    else if (selectedItem.type === 'leave') await firestore.updateLeave(update)
    refresh()
    setSelectedItem(null); setNote('')
  }

  const refresh = async () => {
    const [att, dl, lv] = await Promise.all([
      firestore.getAttendances(), firestore.getDailyLogs(), firestore.getLeaves(),
    ])
    setAttendances(att); setDailyLogs(dl); setLeaves(lv)
  }

  const statusColors: Record<string, string> = { pending: 'bg-amber-500/20 text-[#FBBF24]', approved: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-red-500/20 text-red-400' }
  const statusLabels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }
  const typeIcons: Record<string, React.ElementType> = { attendance: ClipboardList, dailylog: FileText, leave: FileText }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Verifikasi Data</h2>
            <span className="text-xs text-[#94A3B8] bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1E293B]">{allItems.filter(i => i.status === 'pending').length} menunggu</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === tab ? 'bg-[#FBBF24] text-[#0F172A]' : 'bg-[#111827] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'}`}>
                {tab === 'all' ? 'Semua' : tab === 'pending' ? 'Menunggu' : tab === 'approved' ? 'Disetujui' : 'Ditolak'}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-3">
          {filteredItems.map((item) => {
            const Icon = typeIcons[item.type] || Shield
            return (
              <motion.div key={`${item.type}-${item.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#FBBF24]/20 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-[#FBBF24]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#F8FAFC] truncate">{item.title}</p>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${statusColors[item.status]}`}>{statusLabels[item.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.userName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(parseISO(item.date), 'd MMM yyyy', { locale: id })}</span>
                    </div>
                    {item.status === 'pending' && (
                      <button onClick={() => setSelectedItem(item)}
                        className="mt-3 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-xs font-semibold rounded-lg transition-all">Verifikasi</button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-[#64748B]"><Shield className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">Tidak ada data untuk diverifikasi</p></div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4"
            onClick={() => { setSelectedItem(null); setNote('') }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] border border-[#1E293B] rounded-t-2xl lg:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#111827] p-4 border-b border-[#1E293B] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#F8FAFC]">Detail Verifikasi</h3>
                <button onClick={() => { setSelectedItem(null); setNote('') }} className="p-2 rounded-lg text-[#64748B] hover:bg-[#1E293B]"><XCircleIcon className="w-5 h-5" /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#0A0F1C] rounded-lg">
                  <User className="w-4 h-4 text-[#FBBF24]" />
                  <div><p className="text-xs text-[#64748B]">Pengguna</p><p className="text-sm text-[#F8FAFC] font-medium">{selectedItem.userName}</p></div>
                </div>
                {selectedItem.type === 'attendance' && selectedItem.data.selfieUrl && (
                  <div><p className="text-xs text-[#64748B] mb-2">Foto Selfie</p><img src={selectedItem.data.selfieUrl} alt="" className="w-full max-h-64 object-cover rounded-lg" /></div>
                )}
                {selectedItem.type === 'attendance' && selectedItem.data.log && (
                  <div><p className="text-xs text-[#64748B] mb-1">Catatan Log</p><p className="text-sm text-[#E2E8F0] p-3 bg-[#0A0F1C] rounded-lg">{selectedItem.data.log}</p></div>
                )}
                {selectedItem.type === 'dailylog' && (
                  <div>
                    <p className="text-xs text-[#64748B] mb-2">Entri Log ({selectedItem.data.entries?.length || 0})</p>
                    <div className="space-y-2">
                      {selectedItem.data.entries?.map((entry: any, i: number) => (
                        <div key={i} className="p-3 bg-[#0A0F1C] rounded-lg">
                          <div className="flex items-center gap-2 mb-1"><Clock className="w-3 h-3 text-[#64748B]" /><span className="text-xs text-[#94A3B8] font-mono">{entry.time}</span></div>
                          <p className="text-sm text-[#E2E8F0]">{entry.narration}</p>
                          {entry.attachments?.map((att: string, j: number) => <img key={j} src={att} alt="" className="mt-2 max-h-32 rounded-lg" />)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.type === 'leave' && (
                  <div>
                    <p className="text-xs text-[#64748B] mb-1">Alasan</p>
                    <p className="text-sm text-[#E2E8F0] p-3 bg-[#0A0F1C] rounded-lg">{selectedItem.data.reason}</p>
                    {selectedItem.data.attachmentUrl && <div className="mt-3"><p className="text-xs text-[#64748B] mb-2">Lampiran</p><img src={selectedItem.data.attachmentUrl} alt="" className="max-h-48 rounded-lg" /></div>}
                  </div>
                )}
                {selectedItem.data.location && (
                  <div className="flex items-center gap-2 p-3 bg-[#0A0F1C] rounded-lg">
                    <MapPin className="w-4 h-4 text-[#64748B]" />
                    <span className="text-xs text-[#94A3B8]">Lat: {selectedItem.data.location.lat?.toFixed(4)}, Lng: {selectedItem.data.location.lng?.toFixed(4)}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Catatan Verifikasi {selectedItem.status === 'pending' ? '(wajib jika menolak)' : ''}</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan catatan..." rows={2}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] resize-none" />
                </div>
                {selectedItem.status === 'pending' && (
                  <div className="flex gap-3">
                    <button onClick={handleReject} disabled={!note.trim()}
                      className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-40 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
                      <XCircleIcon className="w-4 h-4" /> Tolak
                    </button>
                    <button onClick={handleApprove}
                      className="flex-1 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Setujui
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

