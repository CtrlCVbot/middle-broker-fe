import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';
import { cookies } from 'next/headers';

// JWT 페이로드 타입 정의
export interface JWTPayload {
  id: string;
  email: string;
}

// 더 상세한 JWT 페이로드 타입 정의 (Refresh Token용)
export interface RefreshTokenPayload extends JWTPayload {
  tokenId: string; // 데이터베이스에 저장된 토큰 ID
  exp?: number;     // 만료 시간
  iat?: number;     // 발행 시간
}

// 액세스 토큰 시크릿 키 가져오기
const getAccessTokenSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
};

// 리프레시 토큰 시크릿 키 가져오기
const getRefreshTokenSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
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
    const secret = getAccessTokenSecret();
    
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // 15분 후 만료
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('JWT 액세스 토큰 생성 중 오류:', error);
    throw new Error('Failed to sign JWT access token');
  }
}

/**
 * JWT 리프레시 토큰 생성 함수
 * @param payload 사용자 정보와 토큰 ID가 포함된 페이로드
 * @param expiresIn 만료 시간 (기본값: '7d')
 * @returns 생성된 리프레시 토큰 문자열
 */
export async function signRefreshToken(payload: RefreshTokenPayload, expiresIn: string = '7d'): Promise<string> {
  try {
    const secret = getRefreshTokenSecret();
    
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('JWT 리프레시 토큰 생성 중 오류:', error);
    throw new Error('Failed to sign JWT refresh token');
  }
}

/**
 * JWT 액세스 토큰 검증 함수
 * @param token 검증할 JWT 토큰
 * @returns 검증된 JWT 페이로드 (id, email) 또는 오류시 null
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getAccessTokenSecret();
    
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
 * JWT 리프레시 토큰 검증 함수
 * @param token 검증할 리프레시 토큰
 * @returns 검증된 리프레시 토큰 페이로드 또는 오류시 null
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const secret = getRefreshTokenSecret();
    
    const { payload } = await jwtVerify(token, secret);
    
    return { 
      id: payload.id as string,
      email: payload.email as string,
      tokenId: payload.tokenId as string,
      exp: payload.exp as number,
      iat: payload.iat as number
    };
  } catch (error) {
    console.error('리프레시 토큰 검증 중 오류:', error);
    return null;
  }
}

/**
 * 토큰에서 만료 시간 추출 함수
 * @param token JWT 토큰
 * @returns 만료 시간 또는 null
 */
export function getTokenExpiration(token: string): number | null {
  try {
    // JWT 토큰의 페이로드 파싱 (서명 검증 없이)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    return payload.exp || null;
  } catch (error) {
    console.error('토큰 만료 시간 추출 오류:', error);
    return null;
  }
}

/**
 * 토큰이 만료되었는지 확인
 * @param token JWT 토큰 
 * @returns 만료되었으면 true, 아니면 false
 */
export function isTokenExpired(token: string): boolean {
  try {
    const exp = getTokenExpiration(token);
    if (!exp) return true;
    
    // 현재 시간 (초 단위)과 비교
    const now = Math.floor(Date.now() / 1000);
    return exp <= now;
  } catch (error) {
    console.error('토큰 만료 확인 오류:', error);
    return true; // 오류 발생 시 만료된 것으로 간주
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
 * 쿠키에서 리프레시 토큰 추출 함수
 * @returns 리프레시 토큰 또는 undefined
 */
export async function getRefreshTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value;
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