'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/AppLayout'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return <AppLayout>{children}</AppLayout>
}
