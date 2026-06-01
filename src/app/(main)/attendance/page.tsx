'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Camera, X, CheckCircle2, AlertTriangle, Clock,
  Navigation, Briefcase, Loader2
} from 'lucide-react'
import * as firestore from '@/lib/services/api-service'
import { processImage } from '@/lib/services/upload-service'
import { getDistanceFromLatLng } from '@/lib/haversine'
import { format } from 'date-fns'

export default function AttendancePage() {
  const { user } = useAuth()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [office, setOffice] = useState<{ lat: number; lng: number; radius: number } | null>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])

  const [location, setLocation] = useState<GeolocationPosition | null>(null)
  const [locError, setLocError] = useState('')
  const [distance, setDistance] = useState<number | null>(null)
  const [isInRange, setIsInRange] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [attendanceType, setAttendanceType] = useState<'checkin' | 'checkout'>('checkin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const [off, asn, att] = await Promise.all([
        firestore.getOfficeLocation(),
        firestore.getAssignments(),
        firestore.getAttendances(),
      ])
      setOffice(off)
      setAssignments(asn.filter((a: any) => a.userId === user?.uid && a.dateStart <= todayStr && a.dateEnd >= todayStr))
      setAttendances(att)
    }
    load()
  }, [user?.uid, todayStr])

  const activeAssignment = assignments[0]
  const targetLocation = activeAssignment ? activeAssignment.location : office
  const targetRadius = office?.radius || 150

  useEffect(() => {
    if (!targetLocation) return
    if (!navigator.geolocation) {
      setLocError('Geolocation tidak didukung di perangkat ini')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos)
        const dist = getDistanceFromLatLng(
          pos.coords.latitude, pos.coords.longitude,
          targetLocation.lat, targetLocation.lng
        )
        setDistance(Math.round(dist))
        setIsInRange(dist <= targetRadius)
        setLocError('')
      },
      (err) => {
        setLocError(err.code === 1 ? 'Izin lokasi ditolak' : 'Gagal mendeteksi lokasi')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [targetLocation?.lat, targetLocation?.lng, targetRadius])

  const todayCheckIn = attendances.find(a => a.userId === user?.uid && a.date === todayStr && a.type === 'pendamping-checkin')
  const todayCheckOut = attendances.find(a => a.userId === user?.uid && a.date === todayStr && a.type === 'pendamping-checkout')
  const canCheckIn = !todayCheckIn
  const canCheckOut = !!todayCheckIn && !todayCheckOut

  const handleCapture = useCallback((imageData: string) => {
    setCapturedImage(imageData)
    setShowCamera(false)
  }, [])

  const handleSubmit = async () => {
    if (!capturedImage || !user || !location || !office) return
    setIsSubmitting(true)
    try {
      const selfieUrl = await processImage(capturedImage)
      await firestore.addAttendance({
        attendanceId: `att-${Date.now()}`,
        userId: user.uid,
        userName: user.name,
        type: attendanceType === 'checkin' ? 'pendamping-checkin' : 'pendamping-checkout',
        selfieUrl,
        timestamp: new Date().toISOString(),
        date: todayStr,
        status: 'pending',
        location: { lat: location.coords.latitude, lng: location.coords.longitude },
        locationType: activeAssignment ? 'assignment' : 'office',
        assignmentId: activeAssignment?.assignmentId,
      })
      setSuccess(true)
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">{attendanceType === 'checkin' ? 'Check-in Berhasil!' : 'Check-out Berhasil!'}</h2>
          <p className="text-sm text-[#94A3B8] mb-1">Data absensi telah dicatat</p>
          <p className="text-xs text-[#64748B]">Menunggu verifikasi admin</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] border border-[#1E293B] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInRange ? 'bg-emerald-500/20' : locError ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
              {isInRange ? <MapPin className="w-5 h-5 text-emerald-400" /> :
               locError ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Navigation className="w-5 h-5 text-[#FBBF24]" />}
            </div>
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">
                {activeAssignment ? `Lokasi Penugasan: ${activeAssignment.location.name}` : 'Area Kantor Dispora'}
              </p>
              <p className="text-xs text-[#94A3B8]">
                {distance !== null ? `Jarak: ${distance}m (Toleransi: ${targetRadius}m)` : 'Mendeteksi lokasi...'}
              </p>
            </div>
          </div>

          {activeAssignment && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-3">
              <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-300">Anda memiliki penugasan hari ini di lokasi ini</p>
            </div>
          )}

          {locError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{locError}</p>
            </div>
          )}

          {distance !== null && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isInRange ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {isInRange ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {isInRange ? 'Dalam area yang diizinkan' : 'Di luar area'}
            </div>
          )}
        </motion.div>

        {!showCamera && !capturedImage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            {canCheckIn && (
              <button onClick={() => { setAttendanceType('checkin'); setShowCamera(true) }}
                disabled={!isInRange && !locError}
                className="w-full py-4 bg-[#FBBF24] hover:bg-[#F59E0B] active:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F172A] font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg">
                <motion.div animate={{ boxShadow: ['0 0 0 0 rgba(251,191,36,0.4)', '0 0 0 20px rgba(251,191,36,0)'] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="w-8 h-8 rounded-full bg-[#0F172A]/20 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </motion.div>
                Check-in Sekarang
              </button>
            )}
            {todayCheckIn && (
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                <div><p className="text-sm font-medium text-[#F8FAFC]">Check-in Berhasil</p><p className="text-xs text-[#94A3B8]">{todayCheckIn.timestamp?.slice(11, 16)} WIB</p></div>
              </div>
            )}
            {canCheckOut && (
              <button onClick={() => { setAttendanceType('checkout'); setShowCamera(true) }}
                disabled={!isInRange && !locError}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg">
                <Camera className="w-5 h-5" /> Check-out Sekarang
              </button>
            )}
            {todayCheckOut && (
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-blue-400" /></div>
                <div><p className="text-sm font-medium text-[#F8FAFC]">Check-out Berhasil</p><p className="text-xs text-[#94A3B8]">{todayCheckOut.timestamp?.slice(11, 16)} WIB</p></div>
              </div>
            )}
            {!canCheckIn && !canCheckOut && (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-[#F8FAFC]">Absensi Hari Ini Selesai</p>
                <p className="text-sm text-[#94A3B8] mt-1">Anda sudah check-in dan check-out</p>
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {showCamera && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="bg-[#111827] border border-[#1E293B] rounded-xl overflow-hidden">
              <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {capturedImage && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4">
                <p className="text-sm font-medium text-[#F8FAFC] mb-3">Preview Selfie</p>
                <img src={capturedImage} alt="Selfie" className="w-full max-h-80 object-cover rounded-lg" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setCapturedImage(null); setShowCamera(true) }}
                  className="flex-1 py-3 border border-[#1E293B] text-[#94A3B8] rounded-lg hover:bg-[#1E293B] transition-all text-sm font-medium">Ulangi</button>
                <button onClick={handleSubmit} disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-semibold rounded-lg transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function CameraCapture({ onCapture, onCancel }: { onCapture: (img: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Tidak dapat mengakses kamera'))
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      onCapture(canvas.toDataURL('image/jpeg', 0.7))
    }
  }

  return (
    <div className="relative">
      {error ? (
        <div className="p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-[#94A3B8]">{error}</p>
          <input type="file" accept="image/*" capture="user" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) { const r = new FileReader(); r.onloadend = () => onCapture(r.result as string); r.readAsDataURL(file) }
          }} className="mt-3 text-sm text-[#94A3B8]" />
        </div>
      ) : (
        <>
          <div className="relative aspect-[3/4] bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white font-medium">REC</span>
            </div>
            <button onClick={onCancel} className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <motion.button whileTap={{ scale: 0.9 }} onClick={takePhoto}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white" />
              </motion.button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  )
}

import { useRef } from 'react'

