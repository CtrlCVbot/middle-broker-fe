import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z, ZodError } from 'zod';
import { createDispatchSchema } from '@/types/broker-dispatch';
import { createDispatch, getDispatchDetail } from '@/services/broker-dispatch-service';
// import { authOptions } from '@/lib/auth';

// orderId 파라미터 검증 스키마
const orderIdSchema = z.string().uuid('유효한 주문 ID 형식이 아닙니다.');

/**
 * 특정 주문에 대해 새로운 배차 정보를 생성합니다.
 * 
 * @method POST
 * @route /api/orders/:orderId/dispatch
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // 1. 인증 확인
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { success: false, error: '인증이 필요합니다.' },
    //     { status: 401 }
    //   );
    // }
    
    const userId = request.headers.get('x-user-id') || '';
    
    // 2. orderId 유효성 검증
    const orderId = orderIdSchema.parse(params.orderId);
    
    // 3. 요청 본문 파싱 및 검증
    const body = await request.json();
    const validatedData = createDispatchSchema.parse(body);
    
    // 4. 서비스 호출
    const dispatchId = await createDispatch(orderId, validatedData, userId);
    
    // 5. 생성된 데이터 조회
    const dispatchDetail = await getDispatchDetail(dispatchId);
    
    // 6. 응답 반환
    return NextResponse.json({
      success: true,
      data: dispatchDetail,
      error: null
    }, { status: 201 });
  } catch (error) {
    // 오류 응답 처리
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 요청 데이터입니다.',
        details: error.errors
      }, { status: 400 });
    }
    
    // 비즈니스 로직 오류 처리
    if (error instanceof Error) {
      // 이미 배차된 주문인 경우 Conflict 응답
      if (error.message.includes('이미 배차가 완료된 주문입니다')) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 409 });
      }
      
      // 주문을 찾을 수 없는 경우
      if (error.message.includes('주문을 찾을 수 없습니다')) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 404 });
      }
      
      // 참조 데이터 유효성 오류
      if (error.message.includes('유효하지 않은')) {
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 400 });
      }
    }
    
    // 그 외 오류 처리
    console.error('배차 생성 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '배차를 생성하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 