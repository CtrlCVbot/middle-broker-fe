"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 루트 페이지에 접근하면 로그인 페이지로 리디렉션
    router.replace("/login")
  }, [router])

  return null // 렌더링 없음
}
