'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, MapPin, Camera, FileText, Plus, X,
  CheckCircle2, Edit3, Trash2
} from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { processImage } from '@/lib/services/upload-service'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default function MentorSchedulePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [schedules, setSchedules] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])

  const [showForm, setShowForm] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [logText, setLogText] = useState('')
  const [success, setSuccess] = useState(false)

  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formMentorId, setFormMentorId] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [sch, att, usr] = await Promise.all([
        firestore.getSchedules(),
        firestore.getAttendances(),
        firestore.getUsers(),
      ])
      setSchedules(sch)
      setAttendances(att)
      setMentors(usr.filter(u => u.role === 'mentor'))
    }
    load()
  }, [])

  const sortedSchedules = [...schedules].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const mySchedules = isAdmin ? sortedSchedules : sortedSchedules.filter(s => s.mentorId === user?.uid)
  const upcomingSchedules = mySchedules.filter(s => s.status === 'upcoming' || s.status === 'ongoing')
  const pastSchedules = mySchedules.filter(s => s.status === 'completed')

  const handleSaveSchedule = async () => {
    if (!formTitle || !formDate || !formTime || !formLocation || !formMentorId) return
    const mentor = mentors.find(m => m.uid === formMentorId)
    const schedule = {
      scheduleId: editingId || `sch-${Date.now()}`,
      title: formTitle, date: formDate, time: formTime, location: formLocation,
      mentorId: formMentorId, mentorName: mentor?.name || '', status: 'upcoming' as const,
      description: formDesc,
    }
    if (editingId) await firestore.updateSchedule(schedule)
    else await firestore.addSchedule(schedule)
    const updated = await firestore.getSchedules()
    setSchedules(updated)
    resetForm()
  }

  const resetForm = () => {
    setFormTitle(''); setFormDate(''); setFormTime(''); setFormLocation('')
    setFormMentorId(''); setFormDesc(''); setEditingId(null); setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Hapus jadwal ini?')) {
      await firestore.deleteSchedule(id)
      setSchedules(await firestore.getSchedules())
    }
  }

  const handleAbsen = async (scheduleId: string) => {
    if (!capturedImage || !logText.trim() || !user) return
    const selfieUrl = await processImage(capturedImage)
    const schedule = schedules.find(s => s.scheduleId === scheduleId)
    await firestore.addAttendance({
      attendanceId: `att-${Date.now()}`, userId: user.uid, userName: user.name,
      scheduleId, scheduleTitle: schedule?.title, type: 'mentor',
      selfieUrl, log: logText.trim(), timestamp: new Date().toISOString(),
      date: schedule?.date || format(new Date(), 'yyyy-MM-dd'), status: 'pending',
    })
    setSuccess(true)
    const updatedAtt = await firestore.getAttendances()
    setAttendances(updatedAtt)
    setTimeout(() => { setSuccess(false); setShowAbsenForm(false); setSelectedSchedule(null); setCapturedImage(null); setLogText('') }, 2000)
  }

  const [showAbsenForm, setShowAbsenForm] = useState(false)

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F8FAFC]">Jadwal Mentoring</h2>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Tutup' : 'Tambah Jadwal'}
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {showForm && isAdmin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">{editingId ? 'Edit' : 'Tambah'} Jadwal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Judul Kegiatan</label>
                  <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Contoh: Mentoring Digital"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Mentor</label>
                  <select value={formMentorId} onChange={(e) => setFormMentorId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]">
                    <option value="">Pilih Mentor</option>
                    {mentors.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Tanggal</label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Waktu</label>
                  <input value={formTime} onChange={(e) => setFormTime(e.target.value)} placeholder="09:00 - 12:00"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-[#94A3B8] mb-1">Lokasi</label>
                  <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Aula Dispora Salatiga"
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-[#94A3B8] mb-1">Deskripsi</label>
                  <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Deskripsi kegiatan..." rows={2}
                    className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={resetForm} className="px-4 py-2 border border-[#1E293B] text-[#94A3B8] rounded-lg hover:bg-[#1E293B] text-sm">Batal</button>
                <button onClick={handleSaveSchedule} disabled={!formTitle || !formDate || !formTime || !formLocation || !formMentorId}
                  className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-40 text-[#0F172A] font-semibold rounded-lg text-sm">Simpan</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Jadwal Mendatang</h3>
          {upcomingSchedules.map((schedule) => {
            const isAttended = attendances.some(a => a.scheduleId === schedule.scheduleId && a.userId === user?.uid)
            const isSelected = selectedSchedule === schedule.scheduleId
            return (
              <motion.div key={schedule.scheduleId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-1 self-stretch bg-[#FBBF24] rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[#F8FAFC] truncate">{schedule.title}</h4>
                      {isAdmin && (
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => { setFormTitle(schedule.title); setFormDate(schedule.date); setFormTime(schedule.time); setFormLocation(schedule.location); setFormMentorId(schedule.mentorId); setFormDesc(schedule.description || ''); setEditingId(schedule.scheduleId); setShowForm(true) }}
                            className="p-1.5 text-[#64748B] hover:text-[#FBBF24]"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(schedule.scheduleId)} className="p-1.5 text-[#64748B] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">{format(parseISO(schedule.date), 'EEEE, d MMM yyyy', { locale: id })} • {schedule.time}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-[#64748B]" />
                      <span className="text-xs text-[#64748B]">{schedule.location}</span>
                    </div>
                    {isAdmin && <p className="text-xs text-[#94A3B8] mt-1">Mentor: {schedule.mentorName}</p>}
                    {!isAdmin && !isAttended && (
                      <button onClick={() => { setSelectedSchedule(isSelected ? null : schedule.scheduleId); setShowAbsenForm(isSelected ? false : true) }}
                        className="mt-3 px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-xs font-semibold rounded-lg transition-all">
                        {isSelected ? 'Tutup' : 'Isi Absensi'}
                      </button>
                    )}
                    {isAttended && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Sudah diabsen — Menunggu verifikasi</span>
                      </div>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && showAbsenForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#1E293B]">
                      <div className="p-4 space-y-4">
                        {success ? (
                          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Absensi berhasil dikirim!</span>
                          </div>
                        ) : (
                          <>
                            <div>
                              <label className="block text-xs text-[#94A3B8] mb-1">Selfie</label>
                              {capturedImage ? (
                                <div className="relative">
                                  <img src={capturedImage} alt="" className="w-full max-h-48 object-cover rounded-lg" />
                                  <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"><X className="w-3 h-3 text-white" /></button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center gap-2 w-full py-6 border-2 border-dashed border-[#1E293B] rounded-lg cursor-pointer hover:border-[#FBBF24]/50 transition-all">
                                  <Camera className="w-5 h-5 text-[#64748B]" /><span className="text-sm text-[#64748B]">Ambil selfie</span>
                                  <input type="file" accept="image/*" capture="user" onChange={(e) => {
                                    const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onloadend = () => setCapturedImage(r.result as string); r.readAsDataURL(f) }
                                  }} className="hidden" />
                                </label>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-[#94A3B8] mb-1">Catatan Log</label>
                              <textarea value={logText} onChange={(e) => setLogText(e.target.value)} placeholder="Deskripsikan kegiatan mentoring..." rows={3}
                                className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#FBBF24] resize-none" />
                            </div>
                            <button onClick={() => handleAbsen(schedule.scheduleId)} disabled={!capturedImage || !logText.trim()}
                              className="w-full py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] disabled:opacity-40 text-[#0F172A] font-semibold rounded-lg text-sm transition-all">Kirim Absensi</button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
          {upcomingSchedules.length === 0 && <div className="text-center py-8 text-[#64748B]"><Calendar className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">Tidak ada jadwal mendatang</p></div>}
        </div>

        {pastSchedules.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">Riwayat</h3>
            {pastSchedules.map((schedule) => (
              <div key={schedule.scheduleId} className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 opacity-70">
                <h4 className="text-sm font-medium text-[#F8FAFC]">{schedule.title}</h4>
                <p className="text-xs text-[#64748B] mt-1">{format(parseISO(schedule.date), 'd MMM yyyy', { locale: id })} • {schedule.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

