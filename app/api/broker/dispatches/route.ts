import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ZodError } from 'zod';
import { dispatchListQuerySchema } from '@/types/broker-dispatch';
import { getDispatchList } from '@/services/broker-dispatch-service';
import { authOptions } from '@/lib/auth';

/**
 * 주선사 담당 배차 목록을 조회합니다.
 * 
 * @method GET
 * @route /api/broker/dispatches
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 2. 쿼리 파라미터 파싱 및 검증
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string | string[]> = {};
    
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    // 3. Zod로 쿼리 유효성 검증
    const validatedQuery = dispatchListQuerySchema.parse(queryParams);
    
    // 4. 서비스 호출
    const result = await getDispatchList(validatedQuery, userId);
    
    // 5. 응답 반환
    return NextResponse.json({
      success: true,
      data: result,
      error: null
    }, { status: 200 });
  } catch (error) {
    // Zod 유효성 검증 오류 처리
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 요청 파라미터입니다.',
        details: error.errors
      }, { status: 400 });
    }
    
    // 그 외 오류 처리
    console.error('배차 목록 조회 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '배차 목록을 조회하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 