import { NextRequest, NextResponse } from 'next/server';
import { DistanceCalculationService } from '@/services/distance-calculation-service';
import { ApiUsageService } from '@/services/api-usage-service';
import { IDistanceCalculationRequest } from '@/types/distance';
import { headers } from 'next/headers';

/**
 * 거리 계산 API
 * 
 * POST /api/distance/calculate
 * 
 * Request Body:
 * {
 *   pickupAddressId: string,
 *   deliveryAddressId: string,
 *   pickupCoordinates: { lat: number, lng: number },
 *   deliveryCoordinates: { lat: number, lng: number },
 *   priority?: 'RECOMMEND' | 'TIME' | 'DISTANCE',
 *   forceRefresh?: boolean
 * }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 헤더에서 사용자 정보 추출
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      '127.0.0.1';
    
    // 요청 본문 파싱
    const body = await req.json();
    
    // 입력 유효성 검증
    const validation = validateDistanceCalculationRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error,
          errorCode: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }
    
    const request: IDistanceCalculationRequest = validation.data;
    
    // Rate Limiting 체크 (사용자별)
    if (request.pickupAddressId) {
      const rateLimitInfo = ApiUsageService.checkRateLimit(request.pickupAddressId);
      if (rateLimitInfo.isLimited) {
        const responseTime = Date.now() - startTime;
        
        // Rate Limit 기록
        await ApiUsageService.recordUsage({
          apiType: 'directions',
          endpoint: '/api/distance/calculate',
          requestParams: body,
          responseStatus: 429,
          responseTimeMs: responseTime,
          success: false,
          errorMessage: 'Rate limit exceeded',
          ipAddress,
          userAgent,
          userId: request.pickupAddressId
        });
        
        return NextResponse.json(
          { 
            success: false,
            error: 'Rate limit exceeded. Maximum 10 calls per minute.',
            errorCode: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 60
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '60'
            }
          }
        );
      }
    }
    
    console.log(`🔍 거리 계산 요청 시작: ${request.pickupAddressId} -> ${request.deliveryAddressId}`);
    
    // 거리 계산 수행
    const result = await DistanceCalculationService.calculateDistance(request);
    const responseTime = Date.now() - startTime;
    
    // API 사용량 기록 (성공)
    const usageId = await ApiUsageService.recordUsage({
      apiType: 'directions',
      endpoint: '/api/distance/calculate',
      requestParams: body,
      responseStatus: 200,
      responseTimeMs: responseTime,
      success: true,
      resultCount: 1,
      ipAddress,
      userAgent,
      userId: request.pickupAddressId
    });
    
    console.log(`✅ 거리 계산 완료: ${result.distanceKm}km (${result.method})`);
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        usageId,
        responseTimeMs: responseTime
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('❌ 거리 계산 API 오류:', error);
    
    // API 사용량 기록 (실패)
    try {
      const headersList = headers();
      const userAgent = headersList.get('user-agent') || '';
      const ipAddress = headersList.get('x-forwarded-for') || 
                        headersList.get('x-real-ip') || 
                        '127.0.0.1';
      
      await ApiUsageService.recordUsage({
        apiType: 'directions',
        endpoint: '/api/distance/calculate',
        requestParams: {},
        responseStatus: 500,
        responseTimeMs: responseTime,
        success: false,
        errorMessage,
        ipAddress,
        userAgent
      });
    } catch (recordError) {
      console.error('사용량 기록 실패:', recordError);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * 거리 계산 요청 유효성 검증
 */
function validateDistanceCalculationRequest(body: any): {
  isValid: boolean;
  error?: string;
  data?: IDistanceCalculationRequest;
} {
  // 필수 필드 확인
  if (!body.pickupAddressId || typeof body.pickupAddressId !== 'string') {
    return { isValid: false, error: 'pickupAddressId는 필수 문자열입니다.' };
  }
  
  if (!body.deliveryAddressId || typeof body.deliveryAddressId !== 'string') {
    return { isValid: false, error: 'deliveryAddressId는 필수 문자열입니다.' };
  }
  
  if (!body.pickupCoordinates || typeof body.pickupCoordinates !== 'object') {
    return { isValid: false, error: 'pickupCoordinates는 필수 객체입니다.' };
  }
  
  if (!body.deliveryCoordinates || typeof body.deliveryCoordinates !== 'object') {
    return { isValid: false, error: 'deliveryCoordinates는 필수 객체입니다.' };
  }
  
  // 좌표 유효성 확인
  const { lat: pickupLat, lng: pickupLng } = body.pickupCoordinates;
  const { lat: deliveryLat, lng: deliveryLng } = body.deliveryCoordinates;
  
  if (typeof pickupLat !== 'number' || typeof pickupLng !== 'number') {
    return { isValid: false, error: 'pickupCoordinates의 lat, lng는 숫자여야 합니다.' };
  }
  
  if (typeof deliveryLat !== 'number' || typeof deliveryLng !== 'number') {
    return { isValid: false, error: 'deliveryCoordinates의 lat, lng는 숫자여야 합니다.' };
  }
  
  // 좌표 범위 확인 (한국 좌표 범위)
  if (pickupLat < 33 || pickupLat > 39 || pickupLng < 124 || pickupLng > 132) {
    return { isValid: false, error: '출발지 좌표가 유효한 범위를 벗어났습니다.' };
  }
  
  if (deliveryLat < 33 || deliveryLat > 39 || deliveryLng < 124 || deliveryLng > 132) {
    return { isValid: false, error: '도착지 좌표가 유효한 범위를 벗어났습니다.' };
  }
  
  // 선택적 필드 확인
  const validPriorities = ['RECOMMEND', 'TIME', 'DISTANCE'];
  if (body.priority && !validPriorities.includes(body.priority)) {
    return { isValid: false, error: `priority는 ${validPriorities.join(', ')} 중 하나여야 합니다.` };
  }
  
  if (body.forceRefresh && typeof body.forceRefresh !== 'boolean') {
    return { isValid: false, error: 'forceRefresh는 불리언 값이어야 합니다.' };
  }
  
  return {
    isValid: true,
    data: {
      pickupAddressId: body.pickupAddressId,
      deliveryAddressId: body.deliveryAddressId,
      pickupCoordinates: {
        lat: pickupLat,
        lng: pickupLng
      },
      deliveryCoordinates: {
        lat: deliveryLat,
        lng: deliveryLng
      },
      priority: body.priority || 'RECOMMEND',
      forceRefresh: body.forceRefresh || false
    }
  };
}

/**
 * 거리 계산 API 상태 확인
 * 
 * GET /api/distance/calculate
 */
export async function GET() {
  try {
    const stats = await ApiUsageService.getUsageStats('day');
    
    return NextResponse.json({
      success: true,
      message: 'Distance calculation API is operational',
      status: {
        uptime: process.uptime(),
        todayStats: {
          totalCalls: stats.totalCalls,
          successRate: stats.totalCalls > 0 
            ? (stats.successfulCalls / stats.totalCalls) * 100 
            : 0,
          avgResponseTime: stats.avgResponseTime
        },
        rateLimit: {
          windowMs: 60000,
          maxCalls: 10
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get API status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 