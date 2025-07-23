'use client'

import { GalleryVerticalEnd, Truck } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { LoginForm as LoginFormMov01 } from "@/components/login-form-mov01"
import { motion } from "framer-motion"


import dynamic from 'next/dynamic'

const MotionDiv = dynamic(() =>
  import('framer-motion').then(mod => mod.motion.div), { ssr: false }
)

export default function LoginPage() {
  return (
    // <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <>
    

    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {/* 배경 이미지: width 줄이기 애니메이션 */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: `${500}px` }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 h-full z-0"
        style={{
          transform: 'translateX(-50%)',
          backgroundImage: "url('/images/truck-road.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
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
    
    </>

    
    
  )
}
