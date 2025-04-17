import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from './utils/jwt'

// 로그인이 필요한 경로
const protectedRoutes = [
  '/dashboard', 
  '/profile', 
  '/orders',
  '/addresses',
  '/companies',
  '/users',
  '/settings',
  '/notifications',
  '/payments',
  '/invoices',
  '/settlements',
]

// 로그인 상태에서 접근 불가능한 경로
const authRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // 액세스 토큰 쿠키 확인
  const accessTokenCookie = request.cookies.get('access_token')?.value
  let isAuthenticated = false
  let userId = null
  
  // 토큰이 있는 경우 검증
  if (accessTokenCookie) {
    try {
      const payload = await verifyAccessToken(accessTokenCookie)
      if (payload) {
        isAuthenticated = true
        userId = payload.id
      }
    } catch (error) {
      console.error('JWT 토큰 검증 오류:', error)
    }
  }

  // 보호된 경로에 접근하려고 하는데 인증이 안 되어 있는 경우
  if (protectedRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
    // 현재 URL을 redirect 파라미터로 추가하여 로그인 후 해당 페이지로 이동할 수 있도록 함
    const redirectUrl = new URL(`/login?redirect=${encodeURIComponent(request.nextUrl.pathname)}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 이미 인증된 경우 로그인 페이지 접근 제한
  if (authRoutes.some(route => path.startsWith(route)) && isAuthenticated) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

// 미들웨어가 트리거되는 경로 설정
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 