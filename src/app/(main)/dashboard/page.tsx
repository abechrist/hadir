'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LogIn, ClipboardList, FileText, Shield, Calendar, Users,
  BarChart3, MapPin, Clock, CheckCircle2, Briefcase, ChevronRight
} from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [attendances, setAttendances] = useState<any[]>([])
  const [dailyLogs, setDailyLogs] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [att, dl, lv, sch, asn, usr] = await Promise.all([
          firestore.getAttendances(),
          firestore.getDailyLogs(),
          firestore.getLeaves(),
          firestore.getSchedules(),
          firestore.getAssignments(),
          firestore.getUsers(),
        ])
        setAttendances(att)
        setDailyLogs(dl)
        setLeaves(lv)
        setSchedules(sch)
        setAssignments(asn)
        setUsers(usr)
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  if (!user) return null

  const pendingVerifications =
    attendances.filter(a => a.status === 'pending').length +
    dailyLogs.filter(d => d.status === 'pending').length +
    leaves.filter(l => l.status === 'pending').length

  const todaySchedule = schedules.filter(s => s.date === todayStr)
  const mySchedule = todaySchedule.filter(s => s.mentorId === user.uid)
  const todayLog = dailyLogs.find(d => d.userId === user.uid && d.date === todayStr)
  const todayLeave = leaves.find(l => l.userId === user.uid && l.date === todayStr)
  const todayCheckIn = attendances.find(a => a.userId === user.uid && a.date === todayStr && a.type === 'pendamping-checkin')
  const todayCheckOut = attendances.find(a => a.userId === user.uid && a.date === todayStr && a.type === 'pendamping-checkout')
  const myAssignments = assignments.filter(a => a.userId === user.uid && a.dateStart <= todayStr && a.dateEnd >= todayStr)

  const recentActivities = [
    ...attendances.slice(-5).map(a => ({ ...a, kind: 'attendance' as const, time: a.timestamp })),
    ...dailyLogs.slice(-5).map(d => ({ ...d, kind: 'dailylog' as const, time: d.date })),
    ...leaves.slice(-5).map(l => ({ ...l, kind: 'leave' as const, time: l.createdAt })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
        <motion.div variants={itemVariants}>
          <p className="text-sm text-[#94A3B8]">{today}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#F8FAFC] mt-1">
            Selamat datang, <span className="text-[#FBBF24]">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-1 capitalize">{user.role} — Program Wirausaha Muda</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          {user.role === 'pendamping' && (
            <div className={`rounded-xl p-5 border ${
              todayCheckOut ? 'bg-emerald-950/30 border-emerald-800/50' :
              todayCheckIn ? 'bg-blue-950/30 border-blue-800/50' : 'bg-[#111827] border-[#1E293B]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    todayCheckOut ? 'bg-emerald-500/20' : todayCheckIn ? 'bg-blue-500/20' : 'bg-[#FBBF24]/20'
                  }`}>
                    {todayCheckOut ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
                     todayCheckIn ? <Clock className="w-6 h-6 text-blue-400" /> : <LogIn className="w-6 h-6 text-[#FBBF24]" />}
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Status Hari Ini</p>
                    <p className="text-lg font-semibold text-[#F8FAFC] mt-0.5">
                      {todayCheckOut ? `Check-out ${todayCheckOut.timestamp?.slice(11, 16)}` :
                       todayCheckIn ? `Check-in ${todayCheckIn.timestamp?.slice(11, 16)} — Menunggu Check-out` :
                       todayLeave ? `Izin (${todayLeave.type})` : 'Belum Check-in'}
                    </p>
                    {myAssignments.length > 0 && (
                      <p className="text-xs text-[#FBBF24] mt-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Penugasan: {myAssignments[0].location.name}
                      </p>
                    )}
                  </div>
                </div>
                {!todayCheckIn && !todayLeave && (
                  <button onClick={() => router.push('/attendance')}
                    className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">Absen</button>
                )}
                {todayCheckIn && !todayCheckOut && (
                  <button onClick={() => router.push('/attendance')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all">Check-out</button>
                )}
              </div>
            </div>
          )}

          {user.role === 'mentor' && (
            <div className={`rounded-xl p-5 border ${mySchedule.length > 0 ? 'bg-[#111827] border-[#FBBF24]/30' : 'bg-[#111827] border-[#1E293B]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#FBBF24]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] uppercase tracking-wider">Jadwal Hari Ini</p>
                    <p className="text-lg font-semibold text-[#F8FAFC] mt-0.5">
                      {mySchedule.length > 0 ? mySchedule[0].title : 'Tidak ada jadwal'}
                    </p>
                    {mySchedule.length > 0 && (
                      <p className="text-xs text-[#94A3B8] mt-1">{mySchedule[0].time} — {mySchedule[0].location}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => router.push('/mentor-schedule')}
                  className="px-4 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] text-sm font-semibold rounded-lg transition-all">Lihat Jadwal</button>
              </div>
            </div>
          )}

          {user.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-[#FBBF24]" /></div>
                  <div><p className="text-xs text-[#94A3B8]">Menunggu Verifikasi</p><p className="text-2xl font-bold text-[#F8FAFC]">{pendingVerifications}</p></div>
                </div>
              </div>
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div>
                  <div><p className="text-xs text-[#94A3B8]">Total Pengguna</p><p className="text-2xl font-bold text-[#F8FAFC]">{users.length}</p></div>
                </div>
              </div>
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Calendar className="w-5 h-5 text-emerald-400" /></div>
                  <div><p className="text-xs text-[#94A3B8]">Jadwal Hari Ini</p><p className="text-2xl font-bold text-[#F8FAFC]">{todaySchedule.length}</p></div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold text-[#E2E8F0] mb-3 uppercase tracking-wider">Aksi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {user.role === 'pendamping' && (
              <><QuickAction icon={LogIn} label="Absensi" onClick={() => router.push('/attendance')} color="#FBBF24" />
                <QuickAction icon={ClipboardList} label="Log Harian" onClick={() => router.push('/daily-log')} color="#3B82F6" />
                <QuickAction icon={FileText} label="Ajukan Izin" onClick={() => router.push('/requests')} color="#EF4444" /></>
            )}
            {user.role === 'mentor' && (
              <><QuickAction icon={Calendar} label="Jadwal Saya" onClick={() => router.push('/mentor-schedule')} color="#FBBF24" />
                <QuickAction icon={FileText} label="Ajukan Izin" onClick={() => router.push('/requests')} color="#EF4444" /></>
            )}
            {user.role === 'admin' && (
              <><QuickAction icon={Shield} label="Verifikasi" onClick={() => router.push('/verification')} color="#FBBF24" />
                <QuickAction icon={BarChart3} label="Laporan" onClick={() => router.push('/reports')} color="#10B981" />
                <QuickAction icon={Users} label="Pengguna" onClick={() => router.push('/users')} color="#3B82F6" />
                <QuickAction icon={Briefcase} label="Penugasan" onClick={() => router.push('/assignments')} color="#8B5CF6" /></>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#E2E8F0] uppercase tracking-wider">Aktivitas Terbaru</h3>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl divide-y divide-[#1E293B]">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-center text-[#64748B] text-sm">Belum ada aktivitas</div>
            ) : (
              recentActivities.map((activity, i) => (
                <div key={`${activity.kind}-${i}`} className="flex items-center gap-3 p-4 hover:bg-[#1E293B]/30 transition-all">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    activity.kind === 'attendance' ? 'bg-emerald-500/20' : activity.kind === 'dailylog' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                  }`}>
                    {activity.kind === 'attendance' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                     activity.kind === 'dailylog' ? <ClipboardList className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-[#FBBF24]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F8FAFC] font-medium truncate">
                      {activity.kind === 'attendance' ? `Absensi — ${activity.userName}` :
                       activity.kind === 'dailylog' ? `Log Harian — ${activity.userName}` : `Izin — ${activity.userName}`}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {activity.kind === 'leave' ? activity.type : activity.date || 'Hari ini'}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        activity.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        activity.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-[#FBBF24]'
                      }`}>
                        {activity.status === 'pending' ? 'Menunggu' : activity.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748B] shrink-0" />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick, color }: {
  icon: React.ElementType; label: string; onClick: () => void; color: string
}) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex flex-col items-start gap-3 hover:border-[#FBBF24]/30 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-sm font-medium text-[#F8FAFC] group-hover:text-[#FBBF24] transition-colors">{label}</span>
    </motion.button>
  )
}

