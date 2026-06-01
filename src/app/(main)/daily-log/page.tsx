'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Plus, Clock, FileText, X, Camera,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { processImage } from '@/lib/services/upload-service'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function DailyLogPage() {
  const { user } = useAuth()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [narration, setNarration] = useState('')
  const [entries, setEntries] = useState<Array<{ time: string; narration: string; attachments?: string[] }>>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [expandedDate, setExpandedDate] = useState<string | null>(todayStr)

  useEffect(() => {
    firestore.getDailyLogs().then(setDailyLogs)
  }, [])

  const myLogs = dailyLogs.filter(d => d.userId === user?.uid).sort((a, b) => b.date.localeCompare(a.date))
  const todayLog = myLogs.find(d => d.date === todayStr)

  const handleAddEntry = async () => {
    if (!narration.trim() || !user) return
    let attachments: string[] | undefined
    if (capturedImage) {
      const url = await processImage(capturedImage)
      attachments = [url]
    }
    const newEntry = { time: format(new Date(), 'HH:mm'), narration: narration.trim(), attachments }
    const allEntries = [...entries, newEntry]

    if (todayLog) {
      await firestore.updateDailyLog({ ...todayLog, entries: [...todayLog.entries, newEntry] })
    } else {
      await firestore.addDailyLog({
        logId: `dl-${Date.now()}`, userId: user.uid, userName: user.name,
        date: todayStr, entries: allEntries, status: 'pending',
      })
    }
    setNarration(''); setCapturedImage(null); setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    firestore.getDailyLogs().then(setDailyLogs)
  }

  const handleCaptureFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onloadend = () => setCapturedImage(r.result as string); r.readAsDataURL(file) }
  }

  const groupedLogs = myLogs.reduce<Record<string, any[]>>((acc, log) => {
    if (!acc[log.date]) acc[log.date] = []
    acc[log.date].push(log)
    return acc
  }, {})

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider">{format(parseISO(todayStr), 'EEEE, d MMMM yyyy', { locale: id })}</p>
            <h2 className="text-xl font-bold text-[#F8FAFC] mt-1">Log Aktivitas</h2>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Tutup' : 'Tambah'}
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Waktu</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg">
                  <Clock className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm text-[#F8FAFC]">{format(new Date(), 'HH:mm')} WIB</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Narasi Kegiatan</label>
                <textarea value={narration} onChange={(e) => setNarration(e.target.value)}
                  placeholder="Deskripsikan aktivitas yang dilakukan..." rows={4}
                  className="w-full px-4 py-3 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24]/20 transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Lampiran (Opsional)</label>
                {capturedImage ? (
                  <div className="relative">
                    <img src={capturedImage} alt="" className="w-full max-h-48 object-cover rounded-lg" />
                    <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"><X className="w-3 h-3 text-white" /></button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-[#1E293B] rounded-lg cursor-pointer hover:border-[#FBBF24]/50 transition-all">
                    <Camera className="w-5 h-5 text-[#64748B]" />
                    <span className="text-sm text-[#64748B]">Ambil foto atau pilih file</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleCaptureFromInput} className="hidden" />
                  </label>
                )}
              </div>
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Entri berhasil ditambahkan!</span>
                </motion.div>
              )}
              <button onClick={handleAddEntry} disabled={!narration.trim()}
                className="w-full py-3 bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F172A] font-semibold rounded-lg transition-all text-sm">Simpan Entri</button>
              {todayLog && todayLog.entries.length >= 5 && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
                  <span className="text-xs text-[#FBBF24]">Batas maksimal 5 entri per hari tercapai</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {Object.entries(groupedLogs).map(([date, logs]) => {
            const isExpanded = expandedDate === date
            const allEntries = logs.flatMap(l => l.entries)
            return (
              <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedDate(isExpanded ? null : date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#1E293B]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/20 flex items-center justify-center"><FileText className="w-4 h-4 text-[#FBBF24]" /></div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#F8FAFC]">{format(parseISO(date), 'EEEE, d MMM yyyy', { locale: id })}</p>
                      <p className="text-xs text-[#94A3B8]">{allEntries.length} entri</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3">
                        {allEntries.length === 0 ? (
                          <p className="text-sm text-[#64748B] py-2">Tidak ada entri</p>
                        ) : (
                          allEntries.map((entry: any, i: number) => (
                            <div key={i} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                                {i < allEntries.length - 1 && <div className="w-px h-full bg-[#1E293B]" />}
                              </div>
                              <div className="flex-1 pb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-3 h-3 text-[#64748B]" />
                                  <span className="text-xs text-[#94A3B8] font-mono">{entry.time}</span>
                                </div>
                                <p className="text-sm text-[#E2E8F0]">{entry.narration}</p>
                                {entry.attachments?.map((att: string, j: number) => (
                                  <img key={j} src={att} alt="" className="mt-2 w-full max-h-40 object-cover rounded-lg" />
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                        {logs[0]?.checkInTime && (
                          <div className="flex items-center gap-2 pt-2 border-t border-[#1E293B]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-[#94A3B8]">Check-in: {logs[0].checkInTime}{logs[0].checkOutTime ? ` — Check-out: ${logs[0].checkOutTime}` : ' (Belum check-out)'}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
          {myLogs.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
              <p className="text-sm text-[#94A3B8]">Belum ada log aktivitas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

