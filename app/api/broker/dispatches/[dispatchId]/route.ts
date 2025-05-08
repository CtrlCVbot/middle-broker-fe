import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z, ZodError } from 'zod';
import { getDispatchDetail, updateDispatch, deleteDispatch } from '@/services/broker-dispatch-service';
import { updateDispatchSchema } from '@/types/broker-dispatch';
//import { authOptions } from '@/lib/auth';

// dispatchId 파라미터 검증 스키마
const dispatchIdSchema = z.string().uuid('유효한 배차 ID 형식이 아닙니다.');

/**
 * 특정 배차 정보를 상세 조회합니다.
 * 
 * @method GET
 * @route /api/broker/dispatches/:dispatchId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { dispatchId: string } }
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

    // 2. dispatchId 유효성 검증
    const dispatchId = dispatchIdSchema.parse(params.dispatchId);
    
    // 3. 서비스 호출
    const dispatchDetail = await getDispatchDetail(dispatchId);
    
    // 4. 데이터 없음 처리
    if (!dispatchDetail) {
      return NextResponse.json(
        { success: false, error: '해당 배차 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 5. 권한 검증 (여기서는 단순화를 위해 생략, 실제로는 권한 검증 로직 필요)
    // 예: 해당 배차의 주선사에 소속된 사용자인지 확인
    
    // 6. 응답 반환
    return NextResponse.json({
      success: true,
      data: dispatchDetail,
      error: null
    }, { status: 200 });
  } catch (error) {
    // Zod 유효성 검증 오류 처리
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 배차 ID 형식입니다.',
        details: error.errors
      }, { status: 400 });
    }
    
    // 그 외 오류 처리
    console.error('배차 상세 조회 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '배차 정보를 조회하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 배차 정보를 수정합니다.
 * 
 * @method PATCH
 * @route /api/broker/dispatches/:dispatchId
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { dispatchId: string } }
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
    
    // 2. dispatchId 유효성 검증
    const dispatchId = dispatchIdSchema.parse(params.dispatchId);
    
    // 3. 요청 본문 파싱 및 검증
    const body = await request.json();
    const validatedData = updateDispatchSchema.parse(body);
    
    // 4. 서비스 호출
    await updateDispatch(dispatchId, validatedData, userId);
    
    // 5. 수정된 데이터 조회 (선택적)
    const updatedData = await getDispatchDetail(dispatchId);
    
    // 6. 응답 반환
    return NextResponse.json({
      success: true,
      data: updatedData,
      error: null
    }, { status: 200 });
  } catch (error) {
    // 오류 응답 처리
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 요청 데이터입니다.',
        details: error.errors
      }, { status: 400 });
    }
    
    // 데이터 존재 여부 오류
    if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 404 });
    }
    
    // 그 외 오류 처리
    console.error('배차 정보 수정 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '배차 정보를 수정하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * 배차를 취소/삭제합니다.
 * 
 * @method DELETE
 * @route /api/broker/dispatches/:dispatchId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { dispatchId: string } }
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
    
    // 2. dispatchId 유효성 검증
    const dispatchId = dispatchIdSchema.parse(params.dispatchId);
    
    // 3. 서비스 호출
    await deleteDispatch(dispatchId, userId);
    
    // 4. 응답 반환
    return NextResponse.json({
      success: true,
      data: { id: dispatchId, deleted: true },
      error: null
    }, { status: 200 });
  } catch (error) {
    // 오류 응답 처리
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 배차 ID 형식입니다.',
        details: error.errors
      }, { status: 400 });
    }
    
    // 데이터 존재 여부 오류
    if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 404 });
    }
    
    // 그 외 오류 처리
    console.error('배차 삭제 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '배차를 삭제하는 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 