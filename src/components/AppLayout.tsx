'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, ClipboardList, FileText,
  Shield, BarChart3, Settings, Users, MapPin, ChevronLeft,
  Menu, X, LogOut, Bell, Briefcase, LogIn
} from 'lucide-react'
import type { UserRole } from '@/types'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}

function getNavItems(role: UserRole): NavItem[] {
  const all: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'mentor', 'pendamping'] },
    { path: '/attendance', label: 'Absensi', icon: LogIn, roles: ['pendamping'] },
    { path: '/daily-log', label: 'Log Harian', icon: ClipboardList, roles: ['pendamping'] },
    { path: '/mentor-schedule', label: 'Jadwal', icon: Calendar, roles: ['mentor', 'admin'] },
    { path: '/requests', label: 'Pengajuan', icon: FileText, roles: ['mentor', 'pendamping'] },
    { path: '/verification', label: 'Verifikasi', icon: Shield, roles: ['admin'] },
    { path: '/reports', label: 'Laporan', icon: BarChart3, roles: ['admin'] },
    { path: '/assignments', label: 'Penugasan', icon: Briefcase, roles: ['admin'] },
    { path: '/users', label: 'Pengguna', icon: Users, roles: ['admin'] },
    { path: '/settings', label: 'Pengaturan', icon: Settings, roles: ['admin', 'mentor', 'pendamping'] },
  ]
  return all.filter(item => item.roles.includes(role))
}

function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard', '/attendance': 'Absensi', '/daily-log': 'Log Aktivitas Harian',
    '/mentor-schedule': 'Jadwal Mentor', '/requests': 'Pengajuan Izin', '/verification': 'Verifikasi Data',
    '/reports': 'Laporan Bulanan', '/settings': 'Pengaturan', '/users': 'Manajemen Pengguna',
    '/assignments': 'Penugasan Luar Kantor',
  }
  return titles[path] || 'HADIR'
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (!user) return <>{children}</>

  const navItems = getNavItems(user.role)
  const currentPath = pathname

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F8FAFC] flex">
      {isDesktop && (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0A0F1C] border-r border-[#1E293B] flex flex-col z-40">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FBBF24] rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#F8FAFC] tracking-tight">HADIR</h1>
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest">Dispora Salatiga</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPath === item.path
              return (
                <button key={item.path} onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-[#1E293B] text-[#FBBF24] border-l-2 border-[#FBBF24]' : 'text-[#94A3B8] hover:bg-[#1E293B]/50 hover:text-[#F8FAFC]'
                  }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-[#1E293B]">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#FBBF24] flex items-center justify-center text-[#0F172A] font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F8FAFC] truncate">{user.name}</p>
                <p className="text-xs text-[#94A3B8] capitalize">{user.role}</p>
              </div>
              <button onClick={logout}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className={`flex-1 flex flex-col min-h-screen ${isDesktop ? 'ml-64' : ''}`}>
        <header className="sticky top-0 z-30 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-[#1E293B]">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              {!isDesktop && (
                <button onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] transition-all">
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {currentPath !== '/dashboard' && (
                <button onClick={() => router.back()}
                  className="p-2 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-lg font-semibold text-[#F8FAFC]">{getPageTitle(currentPath)}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FBBF24] rounded-full"></span>
              </button>
              {!isDesktop && (
                <div className="w-8 h-8 rounded-full bg-[#FBBF24] flex items-center justify-center text-[#0F172A] font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        {!isDesktop && (
          <nav className="sticky bottom-0 z-30 bg-[#111827] border-t border-[#1E293B]">
            <div className="flex items-center justify-around px-2 py-2">
              {navItems.slice(0, 5).map((item) => {
                const isActive = currentPath === item.path
                return (
                  <button key={item.path} onClick={() => router.push(item.path)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${isActive ? 'text-[#FBBF24]' : 'text-[#64748B]'}`}>
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>

      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen w-[280px] bg-[#111827] z-50 flex flex-col">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FBBF24] rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0F172A]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-[#F8FAFC]">HADIR</h1>
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest">Dispora Salatiga</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-[#94A3B8] hover:bg-[#1E293B]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => (
                  <button key={item.path} onClick={() => { router.push(item.path); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      currentPath === item.path ? 'bg-[#1E293B] text-[#FBBF24]' : 'text-[#94A3B8] hover:bg-[#1E293B]/50 hover:text-[#F8FAFC]'
                    }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-[#1E293B]">
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
