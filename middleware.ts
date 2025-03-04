import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 로그인이 필요한 경로
const protectedRoutes = ['/dashboard', '/profile']
// 로그인 상태에서 접근 불가능한 경로
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('user')?.value
  const isLoggedIn = !!currentUser
  const path = request.nextUrl.pathname

  // 보호된 경로에 접근하려고 하는데 로그인이 안 되어 있는 경우
  if (protectedRoutes.some(route => path.startsWith(route)) && !isLoggedIn) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // 이미 로그인되어 있는 경우 로그인 페이지 접근 제한
  if (authRoutes.some(route => path.startsWith(route)) && isLoggedIn) {
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

// 미들웨어가 트리거되는 경로 설정
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 