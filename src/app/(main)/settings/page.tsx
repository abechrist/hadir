'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { MapPin, Save, CheckCircle2, Info, Database } from 'lucide-react'
import * as firestore from '@/lib/services/api-service'

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [lat, setLat] = useState('-7.3305')
  const [lng, setLng] = useState('110.5084')
  const [radius, setRadius] = useState('150')
  const [name, setName] = useState('Dinas Pemuda dan Olahraga Kota Salatiga')
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState({ users: 0, attendances: 0, dailyLogs: 0, leaves: 0 })

  useEffect(() => {
    async function load() {
      const office = await firestore.getOfficeLocation()
      setLat(office.lat.toString())
      setLng(office.lng.toString())
      setRadius(office.radius.toString())
      setName(office.name)
      if (isAdmin) {
        const [usr, att, dl, lv] = await Promise.all([
          firestore.getUsers(), firestore.getAttendances(),
          firestore.getDailyLogs(), firestore.getLeaves(),
        ])
        setStats({ users: usr.length, attendances: att.length, dailyLogs: dl.length, leaves: lv.length })
      }
    }
    load()
  }, [isAdmin])

  const handleSaveLocation = async () => {
    await firestore.updateOfficeLocation({
      lat: parseFloat(lat), lng: parseFloat(lng),
      radius: parseInt(radius), name,
    })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-6">Pengaturan</h2>
        </motion.div>

        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#FBBF24]/20 flex items-center justify-center"><MapPin className="w-4 h-4 text-[#FBBF24]" /></div>
              <div><h3 className="text-sm font-semibold text-[#F8FAFC]">Lokasi Kantor</h3><p className="text-xs text-[#94A3B8]">Koordinat untuk validasi absensi pendamping</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs text-[#94A3B8] mb-1">Nama Lokasi</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
              <div><label className="block text-xs text-[#94A3B8] mb-1">Radius (meter)</label><input type="number" value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
              <div><label className="block text-xs text-[#94A3B8] mb-1">Latitude</label><input value={lat} onChange={(e) => setLat(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
              <div><label className="block text-xs text-[#94A3B8] mb-1">Longitude</label><input value={lng} onChange={(e) => setLng(e.target.value)} className="w-full px-3 py-2.5 bg-[#0A0F1C] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm focus:outline-none focus:border-[#FBBF24]" /></div>
            </div>
            {success && <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Lokasi berhasil diperbarui!</span></div>}
            <button onClick={handleSaveLocation} className="flex items-center gap-2 px-4 py-2.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all"><Save className="w-4 h-4" /> Simpan Lokasi</button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center"><Info className="w-4 h-4 text-blue-400" /></div>
            <div><h3 className="text-sm font-semibold text-[#F8FAFC]">Tentang Aplikasi</h3></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-[#1E293B]"><span className="text-[#94A3B8]">Nama Aplikasi</span><span className="text-[#F8FAFC] font-medium">HADIR</span></div>
            <div className="flex justify-between py-2 border-b border-[#1E293B]"><span className="text-[#94A3B8]">Versi</span><span className="text-[#F8FAFC] font-medium">3.0.0</span></div>
            <div className="flex justify-between py-2 border-b border-[#1E293B]"><span className="text-[#94A3B8]">Program</span><span className="text-[#F8FAFC] font-medium">Wirausaha Muda Salatiga 2026</span></div>
            <div className="flex justify-between py-2 border-b border-[#1E293B]"><span className="text-[#94A3B8]">Instansi</span><span className="text-[#F8FAFC] font-medium">Dispora Kota Salatiga</span></div>
            <div className="flex justify-between py-2"><span className="text-[#94A3B8]">Stack</span><span className="text-[#F8FAFC] font-medium">Next.js + Neon + Tailwind</span></div>
          </div>
        </motion.div>

        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#111827] border border-[#1E293B] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Database className="w-4 h-4 text-emerald-400" /></div>
              <div><h3 className="text-sm font-semibold text-[#F8FAFC]">Statistik Data</h3></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[#94A3B8]">Pengguna</span><span className="text-[#F8FAFC] font-medium">{stats.users}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#94A3B8]">Absensi</span><span className="text-[#F8FAFC] font-medium">{stats.attendances}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#94A3B8]">Log Harian</span><span className="text-[#F8FAFC] font-medium">{stats.dailyLogs}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#94A3B8]">Izin</span><span className="text-[#F8FAFC] font-medium">{stats.leaves}</span></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

