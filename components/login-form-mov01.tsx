"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginWithEmail } from "@/utils/auth"
import { useToast } from "@/components/ui/use-toast"
import { GalleryVerticalEnd, Truck } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // 인증 API를 호출하여 로그인
      const result = await loginWithEmail(email, password)
      
      if (result.success) {
        // 로그인 성공 시 토스트 메시지 표시
        toast({
          title: "로그인 성공",
          description: "환영합니다! 이동합니다.",
          variant: "default",
        })
        
        // 리다이렉트 경로로 이동
        router.push(redirectPath)
      } else {
        // 로그인 실패 메시지 표시
        setError(result.message || result.error || "로그인에 실패했습니다.")
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestCredentials = () => {
    setEmail('beckmin@naver.com');
    setPassword('12341234');
  };
  const fillTestCredentials2 = () => {
    setEmail('park1@naver.com');
    setPassword('12341234');
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex items-center gap-2 self-center font-medium text-black text-3xl font-semibold">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Truck className="size-4" />
        </div>
        THE - U
      </div>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            {/* <CardTitle className="text-sm text-muted-foreground">Transport Manager System</CardTitle> */}
            <CardDescription>
            Transport Manager System
              {/* 이메일과 비밀번호로 로그인하세요 */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "로그인 중..." : "로그인"}
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    {/* <span className="bg-background px-2 text-muted-foreground">
                      소셜 로그인
                    </span> */}
                    <span className="bg-background px-2 text-muted-foreground">비밀번호를 잊으셨나요?</span>
                    
                  </div>
                  
                </div>
              
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="flex justify-center text-sm text-muted-foreground mt-2">
          {/* <span>🔐 비밀번호를 잊으셨나요?</span> */}
            <button onClick={fillTestCredentials} className="text-blue-500 hover:underline on cursor-pointer text-sm text-muted-foreground">
              주선사 테스트 계정: beckmin@naver.com / 12341234
            </button>
            <button onClick={fillTestCredentials2} className="text-blue-500 hover:underline on cursor-pointer text-sm text-muted-foreground">
              화주 테스트 계정: park1@example.com / 12341234
            </button>
        </div>
      </div>
    </div>
    
  )
}
