import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken, isTokenExpired } from './utils/jwt'

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

// API 요청 제외 패턴
const apiRoutes = ['/api']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // API 경로는 미들웨어 처리 제외
  if (apiRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }
  
  // 액세스 토큰 쿠키 확인
  const accessTokenCookie = request.cookies.get('access_token')?.value
  let isAuthenticated = false
  let userId = null
  
  // 토큰이 있는 경우 검증
  if (accessTokenCookie) {
    // 토큰 만료 여부 확인
    const isExpired = isTokenExpired(accessTokenCookie)
    
    if (!isExpired) {
      // 토큰이 유효한 경우 검증
      try {
        const payload = await verifyAccessToken(accessTokenCookie)
        if (payload) {
          isAuthenticated = true
          userId = payload.id
        }
      } catch (error) {
        console.error('JWT 토큰 검증 오류:', error)
      }
    } else {
      // 토큰이 만료된 경우 refresh 시도
      const refreshResponse = await tryRefreshToken(request)
      
      if (refreshResponse.success && refreshResponse.accessToken) {
        // 리프레시 성공시 새 토큰으로 인증 상태 설정
        isAuthenticated = true
        userId = refreshResponse.userId
        
        // 리프레시된 액세스 토큰을 쿠키에 설정하는 응답 반환
        const response = NextResponse.next()
        response.cookies.set('access_token', refreshResponse.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 15, // 15분
        })
        
        return response
      }
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

/**
 * 액세스 토큰 새로고침 시도
 * @param request 요청 객체
 * @returns 성공 여부, 새 토큰, 사용자 ID
 */
async function tryRefreshToken(request: NextRequest): Promise<{ 
  success: boolean; 
  accessToken?: string;
  userId?: string;
}> {
  try {
    // 현재 도메인 기반으로 리프레시 API URL 생성
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const refreshUrl = `${protocol}://${host}/api/auth/refresh`
    
    // 쿠키를 포함하여 리프레시 요청
    const response = await fetch(refreshUrl, {
      method: 'GET',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    // 응답 확인
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.token && data.user?.id) {
        return {
          success: true,
          accessToken: data.token,
          userId: data.user.id,
        }
      }
    }
    
    // 실패 처리
    return { success: false }
  } catch (error) {
    console.error('Token refresh error in middleware:', error)
    return { success: false }
  }
}

// 미들웨어가 트리거되는 경로 설정
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 