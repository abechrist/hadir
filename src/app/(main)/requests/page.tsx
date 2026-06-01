'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, X, CheckCircle2, Camera, ChevronDown, ChevronUp } from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { processImage } from '@/lib/services/upload-service'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function RequestsPage() {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState('')
  const [type, setType] = useState<'sakit' | 'kegiatan_lain' | 'cuti' | 'darurat'>('sakit')
  const [reason, setReason] = useState('')
  const [attachment, setAttachment] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    firestore.getLeaves().then(setLeaves)
  }, [])

  const myLeaves = leaves.filter(l => l.userId === user?.uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const handleSubmit = async () => {
    if (!date || !reason.trim() || !user) return
    let attachmentUrl: string | undefined
    if (attachment) {
      attachmentUrl = await processImage(attachment)
    }
    await firestore.addLeave({
      leaveId: `leave-${Date.now()}`, userId: user.uid, userName: user.name,
      userRole: user.role, date, type, reason: reason.trim(),
      attachmentUrl, status: 'pending', createdAt: new Date().toISOString(),
    })
    setDate(''); setType('sakit'); setReason(''); setAttachment(null); setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    firestore.getLeaves().then(setLeaves)
  }

  const typeLabels: Record<string, string> = { sakit: 'Sakit', kegiatan_lain: 'Kegiatan Lain', cuti: 'Cuti', darurat: 'Darurat' }
  const typeColors: Record<string, string> = { sakit: 'bg-red-500/20 text-red-400', kegiatan_lain: 'bg-blue-500/20 text-blue-400', cuti: 'bg-purple-500/20 text-purple-400', darurat: 'bg-orange-500/20 text-orange-400' }
  const statusColors: Record<string, string> = { pending: 'bg-amber-500/20 text-[#FBBF24]', approved: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-red-500/20 text-red-400' }
  const statusLabels: Record<string, string> = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F8FAFC]">Pengajuan Izin</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? 'Tutup' : 'Ajukan Izin'}
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Tanggal</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Jenis Izin</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]">
                    <option value="sakit">Sakit</option>
                    <option value="kegiatan_lain">Kegiatan Lain</option>
                    <option value="cuti">Cuti</option>
                    <option value="darurat">Darurat</option>
                  </select>
                </div>
              </div>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Jelaskan alasan izin..." rows={3}
                className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] resize-none" />
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Lampiran (Opsional)</label>
                {attachment ? (
                  <div className="relative">
                    <img src={attachment} alt="" className="w-full max-h-40 object-cover rounded-lg" />
                    <button onClick={() => setAttachment(null)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"><X className="w-3 h-3 text-white" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[#1E293B] rounded-lg cursor-pointer hover:border-[#FBBF24]/50 transition-all">
                    <Camera className="w-4 h-4 text-[#64748B]" /><span className="text-sm text-[#64748B]">Ambil foto bukti</span>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setAttachment(r.result as string); r.readAsDataURL(f) } }} className="hidden" />
                  </label>
                )}
              </div>
              {success && <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Pengajuan berhasil dikirim!</span></div>}
              <button onClick={handleSubmit} disabled={!date || !reason.trim()}
                className="w-full py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-40 text-[#0F172A] font-semibold rounded-lg text-sm transition-all">Kirim Pengajuan</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Riwayat Pengajuan</h3>
          {myLeaves.map((leave) => {
            const isExpanded = expandedId === leave.leaveId
            return (
              <motion.div key={leave.leaveId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : leave.leaveId)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#1E293B]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/20 flex items-center justify-center"><FileText className="w-4 h-4 text-[#FBBF24]" /></div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#F8FAFC]">{format(parseISO(leave.date), 'EEEE, d MMM yyyy', { locale: id })}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[leave.type]}`}>{typeLabels[leave.type]}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[leave.status]}`}>{statusLabels[leave.status]}</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-sm text-[#E2E8F0]">{leave.reason}</p>
                        {leave.attachmentUrl && <img src={leave.attachmentUrl} alt="" className="w-full max-h-48 object-cover rounded-lg" />}
                        {leave.verifiedBy && (
                          <div className="pt-2 border-t border-[#1E293B]">
                            <p className="text-xs text-[#94A3B8]">Diverifikasi oleh: {leave.verifiedBy}</p>
                            {leave.verificationNote && <p className="text-xs text-[#64748B] mt-1">Catatan: {leave.verificationNote}</p>}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
          {myLeaves.length === 0 && <div className="text-center py-8 text-[#64748B]"><FileText className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">Belum ada pengajuan izin</p></div>}
        </div>
      </div>
    </div>
  )
}

