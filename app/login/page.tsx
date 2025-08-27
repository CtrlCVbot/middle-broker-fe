'use client'

import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { LoginForm as LoginFormMov01 } from '@/components/login-form-mov01'

export default function LoginPage() {
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const [isVideoA, setIsVideoA] = useState(true)
  const [fadeOutA, setFadeOutA] = useState(false)

  useEffect(() => {
    const currentVideo = isVideoA ? videoARef.current : videoBRef.current
    if (!currentVideo) return

    const handleTimeUpdate = () => {
      if (currentVideo.duration - currentVideo.currentTime <= 0.5) {
        const nextVideo = isVideoA ? videoBRef.current : videoARef.current
        if (nextVideo && nextVideo.paused) {
          nextVideo.currentTime = 0
          nextVideo.play()
          setFadeOutA(true)
        }
      }
    }

    const handleEnded = () => {
      setIsVideoA(prev => !prev)
      setFadeOutA(false)
    }

    currentVideo.addEventListener('timeupdate', handleTimeUpdate)
    currentVideo.addEventListener('ended', handleEnded)

    return () => {
      currentVideo.removeEventListener('timeupdate', handleTimeUpdate)
      currentVideo.removeEventListener('ended', handleEnded)
    }
  }, [isVideoA])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {/* 정적인 FHD 썸네일 이미지 배경 */}
      <motion.img
        src="/images/thumbnail_fhd.jpg"
        alt="Background thumbnail"
        initial={{ width: '100%' }}
        animate={{ width: '500px' }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 h-full object-cover z-0"
        style={{ transform: 'translateX(-50%)' }}
      />

      {/* 로그인 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative z-10 flex items-center justify-center h-full"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-sm w-full">
          <LoginFormMov01 />
        </div>
      </motion.div>
    </div>
  )
}
