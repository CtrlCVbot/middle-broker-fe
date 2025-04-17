import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// JWT 페이로드 타입 정의
export interface JWTPayload {
  id: string;
  email: string;
}

// 시크릿 키 가져오기
const getJWTSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
};

/**
 * JWT 액세스 토큰 생성 함수
 * @param payload 사용자 ID와 이메일이 포함된 페이로드
 * @returns 생성된 JWT 토큰 문자열
 */
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  try {
    const secret = getJWTSecret();
    
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // 15분 후 만료
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('JWT 토큰 생성 중 오류:', error);
    throw new Error('Failed to sign JWT token');
  }
}

/**
 * JWT 액세스 토큰 검증 함수
 * @param token 검증할 JWT 토큰
 * @returns 검증된 JWT 페이로드 (id, email) 또는 오류시 null
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret();
    
    const { payload } = await jwtVerify(token, secret);
    
    // 페이로드에서 필요한 정보 추출
    return { 
      id: payload.id as string,
      email: payload.email as string
    };
  } catch (error) {
    console.error('JWT 토큰 검증 중 오류:', error);
    return null;
  }
}

/**
 * 쿠키에서 액세스 토큰 추출 함수
 * @returns 액세스 토큰 또는 undefined
 */
export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * 쿠키에서 액세스 토큰 검증 함수
 * @returns 검증된 JWT 페이로드 또는 null
 */
export async function verifyAccessTokenFromCookies(): Promise<JWTPayload | null> {
  const token = await getAccessTokenFromCookies();
  if (!token) return null;
  
  return await verifyAccessToken(token);
} 