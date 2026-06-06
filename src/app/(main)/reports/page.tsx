'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { FileText, Printer, Download } from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'
import { id } from 'date-fns/locale'

export default function ReportsPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState('2026-06')
  const [selectedUser, setSelectedUser] = useState('all')
  const [showPreview, setShowPreview] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const [usr, att, dl, lv, sch] = await Promise.all([
        firestore.getUsers(), firestore.getAttendances(), firestore.getDailyLogs(),
        firestore.getLeaves(), firestore.getSchedules(),
      ])
      setUsers(usr); setAttendances(att); setDailyLogs(dl)
      setLeaves(lv); setSchedules(sch)
      if (user?.role === 'pendamping') {
        setSelectedUser(user.uid)
      }
    }
    load()
  }, [user])

  const [year, month] = selectedMonth.split('-').map(Number)
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(monthStart)

  const filteredAttendances = attendances.filter(a => {
    const d = parseISO(a.date); return isSameMonth(d, monthStart) && (selectedUser === 'all' || a.userId === selectedUser) && a.status === 'approved'
  })
  const filteredDailyLogs = dailyLogs.filter(d => {
    const date = parseISO(d.date); return isSameMonth(date, monthStart) && (selectedUser === 'all' || d.userId === selectedUser) && d.status === 'approved'
  })
  const filteredLeaves = leaves.filter(l => {
    const date = parseISO(l.date); return isSameMonth(date, monthStart) && (selectedUser === 'all' || l.userId === selectedUser)
  })

  const selectedUserName = selectedUser === 'all' ? 'Semua Pengguna' : users.find(u => u.uid === selectedUser)?.name || 'Unknown'

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: format(monthStart, 'MMMM'),
          year,
          userName: selectedUserName,
          attendances: filteredAttendances,
          dailyLogs: filteredDailyLogs,
          leaves: filteredLeaves,
        }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-kehadiran-${selectedMonth}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  const handlePrint = () => {
    const pw = window.open('', '_blank')
    if (!pw || !reportRef.current) return
    pw.document.write(`<html><head><title>Laporan Kehadiran - ${selectedMonth}</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5;font-weight:bold}h1{font-size:18px}h2{font-size:14px;color:#666}.header{margin-bottom:20px}@media print{body{background:white!important;color:black!important}}</style></head><body>${reportRef.current.innerHTML}</body></html>`)
    pw.document.close()
    pw.print()
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">Laporan Bulanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Bulan</label>
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" />
            </div>
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1">Pengguna</label>
              {user?.role === 'pendamping' ? (
                <div className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm opacity-60">
                  {user.name}
                </div>
              ) : (
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]">
                  <option value="all">Semua Pengguna</option>
                  {users.map(u => <option key={u.uid} value={u.uid}>{u.name} ({u.role})</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] uppercase">Total Absensi</p><p className="text-2xl font-bold text-[#FBBF24] mt-1">{filteredAttendances.length}</p>
            </div>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] uppercase">Log Harian</p><p className="text-2xl font-bold text-[#3B82F6] mt-1">{filteredDailyLogs.length}</p>
            </div>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] uppercase">Izin</p><p className="text-2xl font-bold text-[#EF4444] mt-1">{filteredLeaves.length}</p>
            </div>
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4">
              <p className="text-xs text-[#94A3B8] uppercase">Jadwal</p><p className="text-2xl font-bold text-[#10B981] mt-1">{schedules.filter(s => isSameMonth(parseISO(s.date), monthStart)).length}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowPreview(!showPreview)}
              className="flex-1 py-3 bg-[#111827] border border-[#1E293B] hover:border-[#FBBF24]/50 text-[#F8FAFC] font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />{showPreview ? 'Sembunyikan' : 'Preview Laporan'}
            </button>
            {showPreview && (
              <>
                <button onClick={handleDownloadPDF}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />Download PDF
                </button>
                <button onClick={handlePrint}
                  className="flex-1 py-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />Cetak
                </button>
              </>
            )}
          </div>
        </motion.div>

        {showPreview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            ref={reportRef}
            className="bg-white text-[#0F172A] rounded-xl p-6 lg:p-8 shadow-lg">
            <div className="text-center border-b-2 border-[#d97706] pb-4 mb-6">
              <h1 className="text-lg font-bold text-[#0F172A]">LAPORAN KEHADIRAN MENTOR & PENDAMPING</h1>
              <h2 className="text-sm text-[#666] mt-1">Program Penumbuhan Wirausaha Muda Kota Salatiga 2026</h2>
              <p className="text-xs text-[#666] mt-1">Bidang Kepemudaan, Dinas Pemuda dan Olahraga Kota Salatiga</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div><p className="text-[#666]">Periode</p><p className="font-semibold">{format(monthStart, 'MMMM yyyy', { locale: id })}</p></div>
              <div><p className="text-[#666]">Pengguna</p><p className="font-semibold">{selectedUserName}</p></div>
              <div><p className="text-[#666]">Tanggal Cetak</p><p className="font-semibold">{format(new Date(), 'd MMMM yyyy', { locale: id })}</p></div>
              <div><p className="text-[#666]">Dicetak Oleh</p><p className="font-semibold">{user?.name}</p></div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="border border-[#ddd] p-3 rounded text-center min-w-[100px]"><p className="text-[10px] text-[#666] uppercase">Kehadiran</p><p className="text-xl font-bold text-[#d97706]">{filteredAttendances.length}</p></div>
              <div className="border border-[#ddd] p-3 rounded text-center min-w-[100px]"><p className="text-[10px] text-[#666] uppercase">Log Harian</p><p className="text-xl font-bold text-[#3B82F6]">{filteredDailyLogs.length}</p></div>
              <div className="border border-[#ddd] p-3 rounded text-center min-w-[100px]"><p className="text-[10px] text-[#666] uppercase">Izin</p><p className="text-xl font-bold text-[#EF4444]">{filteredLeaves.length}</p></div>
            </div>

            {filteredAttendances.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#0F172A] mb-3">A. Detail Absensi</h3>
                <table><thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Jenis</th><th>Waktu</th><th>Status</th></tr></thead>
                <tbody>{filteredAttendances.map((a, i) => (
                  <tr key={a.attendanceId}><td>{i + 1}</td><td>{format(parseISO(a.date), 'd MMM yyyy', { locale: id })}</td><td>{a.userName}</td>
                    <td>{a.type === 'mentor' ? 'Mentor' : a.type === 'pendamping-checkin' ? 'Check-in' : 'Check-out'}</td>
                    <td>{a.timestamp?.slice(11, 16)}</td><td><span className="text-emerald-600 font-medium">Terverifikasi</span></td></tr>
                ))}</tbody></table>
              </div>
            )}

            {filteredDailyLogs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#0F172A] mb-3">B. Detail Log Aktivitas Harian</h3>
                <table><thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Check-in</th><th>Check-out</th><th>Jumlah Entri</th></tr></thead>
                <tbody>{filteredDailyLogs.map((d, i) => (
                  <tr key={d.logId}><td>{i + 1}</td><td>{format(parseISO(d.date), 'd MMM yyyy', { locale: id })}</td><td>{d.userName}</td>
                    <td>{d.checkInTime || '-'}</td><td>{d.checkOutTime || '-'}</td><td>{d.entries?.length || 0}</td></tr>
                ))}</tbody></table>
              </div>
            )}

            {filteredLeaves.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#0F172A] mb-3">C. Detail Izin</h3>
                <table><thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Jenis</th><th>Status</th></tr></thead>
                <tbody>{filteredLeaves.map((l, i) => (
                  <tr key={l.leaveId}><td>{i + 1}</td><td>{format(parseISO(l.date), 'd MMM yyyy', { locale: id })}</td><td>{l.userName}</td>
                    <td className="capitalize">{l.type?.replace('_', ' ')}</td>
                    <td><span className={l.status === 'approved' ? 'text-emerald-600 font-medium' : l.status === 'rejected' ? 'text-red-600 font-medium' : 'text-amber-600 font-medium'}>
                      {l.status === 'approved' ? 'Disetujui' : l.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></td></tr>
                ))}</tbody></table>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-[#ddd] text-center">
              <p className="text-xs text-[#666]">Dokumen ini digenerate secara otomatis dari sistem HADIR</p>
              <p className="text-xs text-[#666]">Program Penumbuhan Wirausaha Muda Kota Salatiga 2026</p>
            </div>
            <div className="mt-8 flex justify-end">
              <div className="text-center">
                <p className="text-sm text-[#0F172A]">Salatiga, {format(new Date(), 'd MMMM yyyy', { locale: id })}</p>
                <p className="text-sm text-[#666] mt-8">...............................</p>
                <p className="text-sm text-[#0F172A] font-medium">{user?.name}</p>
                <p className="text-xs text-[#666] capitalize">{user?.role === 'pendamping' ? 'Pendamping' : 'Admin'} HADIR</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
