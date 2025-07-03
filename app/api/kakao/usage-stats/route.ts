import { NextRequest, NextResponse } from 'next/server';
import { ApiUsageService } from '@/services/api-usage-service';
import { IApiUsageFilter } from '@/types/api-usage';

/**
 * API 사용량 통계 조회 API
 * 
 * GET /api/kakao/usage-stats
 * 
 * Query Parameters:
 * - period: 'day' | 'week' | 'month' (기본: day)
 * - type: 'summary' | 'daily' | 'records' | 'errors' | 'slow' (기본: summary)
 * - days: number (일별 통계 조회 시 기간, 기본: 7)
 * - limit: number (레코드 조회 시 제한, 기본: 50)
 * - apiType: 'directions' | 'search-address' (특정 API 타입)
 * - success: 'true' | 'false' (성공/실패 필터)
 * - thresholdMs: number (느린 API 기준 시간, 기본: 5000ms)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 쿼리 파라미터 파싱
    const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';
    const type = searchParams.get('type') || 'summary';
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '50');
    const apiType = searchParams.get('apiType') as 'directions' | 'search-address' | null;
    const successParam = searchParams.get('success');
    const thresholdMs = parseInt(searchParams.get('thresholdMs') || '5000');
    
    console.log(`📊 API 사용량 통계 요청: type=${type}, period=${period}`);
    
    let result;
    
    switch (type) {
      case 'summary':
        // 요약 통계 (오늘, 이번주, 이번달)
        result = await ApiUsageService.getUsageSummary();
        break;
        
      case 'daily':
        // 일별 통계
        result = await ApiUsageService.getDailyStats(days);
        break;
        
      case 'records':
        // 상세 기록 조회
        const filter: IApiUsageFilter = {
          limit,
          offset: 0
        };
        
        if (apiType) filter.apiType = apiType;
        if (successParam !== null) filter.success = successParam === 'true';
        
        result = await ApiUsageService.getUsageRecords(filter);
        break;
        
      case 'errors':
        // 에러 로그 조회
        result = await ApiUsageService.getErrorLogs(limit);
        break;
        
      case 'slow':
        // 느린 API 호출 조회
        result = await ApiUsageService.getSlowCalls(thresholdMs, limit);
        break;
        
      case 'monthly-report':
        // 월별 리포트
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
        result = await ApiUsageService.getMonthlyReport(year, month);
        break;
        
      default:
        // 기본 통계 (기간별)
        result = await ApiUsageService.getUsageStats(period);
    }
    
    return NextResponse.json({
      success: true,
      type,
      period: type !== 'daily' && type !== 'records' && type !== 'errors' && type !== 'slow' ? period : undefined,
      data: result,
      metadata: {
        requestedAt: new Date().toISOString(),
        parameters: {
          period,
          type,
          days,
          limit,
          apiType,
          success: successParam,
          thresholdMs
        }
      }
    });
    
  } catch (error) {
    console.error('❌ API 사용량 통계 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'STATS_QUERY_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * API 사용량 실시간 상태 조회
 * 
 * GET /api/kakao/usage-stats/realtime
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    
    if (action === 'realtime') {
      // 실시간 통계 조회
      const [todayStats, recentErrors, slowCalls] = await Promise.all([
        ApiUsageService.getUsageStats('day'),
        ApiUsageService.getErrorLogs(10),
        ApiUsageService.getSlowCalls(5000, 10)
      ]);
      
      return NextResponse.json({
        success: true,
        data: {
          today: todayStats,
          recentErrors: recentErrors.slice(0, 5), // 최근 에러 5개만
          slowCalls: slowCalls.slice(0, 5), // 느린 호출 5개만
          health: {
            successRate: todayStats.totalCalls > 0 
              ? (todayStats.successfulCalls / todayStats.totalCalls) * 100 
              : 100,
            avgResponseTime: todayStats.avgResponseTime,
            errorCount: recentErrors.length,
            slowCallCount: slowCalls.length
          }
        },
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'cache-stats') {
      // 캐시 통계 조회 (구현 예정)
      return NextResponse.json({
        success: true,
        data: {
          message: 'Cache statistics feature coming soon'
        }
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action. Supported actions: realtime, cache-stats',
        errorCode: 'INVALID_ACTION'
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ 실시간 통계 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'REALTIME_STATS_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * API 사용량 통계 내보내기
 * 
 * PUT /api/kakao/usage-stats
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, dateFrom, dateTo, apiType } = body;
    
    // 날짜 범위 설정
    const startDate = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 기본 30일 전
    const endDate = dateTo ? new Date(dateTo) : new Date();
    
    // 필터 구성
    const filter: IApiUsageFilter = {
      dateFrom: startDate,
      dateTo: endDate,
      limit: 10000 // 대량 데이터 내보내기를 위한 높은 제한
    };
    
    if (apiType) {
      filter.apiType = apiType as 'directions' | 'search-address';
    }
    
    // 데이터 조회
    const records = await ApiUsageService.getUsageRecords(filter);
    const stats = await ApiUsageService.getUsageStats('month'); // 전체 기간 통계
    
    const exportData = {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: startDate.toISOString(),
          to: endDate.toISOString()
        },
        recordCount: records.length,
        format: format || 'json'
      },
      summary: stats,
      records: records
    };
    
    console.log(`📤 API 사용량 데이터 내보내기: ${records.length}개 레코드`);
    
    if (format === 'csv') {
      // CSV 형태로 반환
      const csvHeaders = [
        'ID', 'API Type', 'Endpoint', 'Response Status', 'Response Time (ms)',
        'Success', 'Error Message', 'IP Address', 'Created At'
      ];
      
      const csvRows = records.map(record => [
        record.id,
        record.apiType,
        record.endpoint || '',
        record.responseStatus,
        record.responseTimeMs,
        record.success,
        record.errorMessage || '',
        record.ipAddress,
        record.createdAt.toISOString()
      ]);
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="api-usage-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // JSON 형태로 반환 (기본)
    return NextResponse.json({
      success: true,
      data: exportData
    });
    
  } catch (error) {
    console.error('❌ API 사용량 데이터 내보내기 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'EXPORT_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * API 사용량 통계 초기화 (개발/테스트용)
 * 
 * DELETE /api/kakao/usage-stats
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const confirm = searchParams.get('confirm');
    const olderThan = searchParams.get('olderThan'); // 특정 날짜 이전 데이터만 삭제
    
    if (confirm !== 'yes') {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation required. Add ?confirm=yes to proceed.',
          errorCode: 'CONFIRMATION_REQUIRED'
        },
        { status: 400 }
      );
    }
    
    // 실제 삭제 로직은 보안상 주석 처리
    // 운영 환경에서는 이 기능을 제거하거나 관리자 권한 확인 필요
    
    console.log('⚠️ API 사용량 데이터 삭제 요청 (실제 삭제는 수행되지 않음)');
    
    return NextResponse.json({
      success: false,
      message: 'Data deletion is disabled for security reasons. Use database admin tools if necessary.',
      errorCode: 'DELETION_DISABLED'
    });
    
  } catch (error) {
    console.error('❌ API 사용량 데이터 삭제 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'DELETION_FAILED'
      },
      { status: 500 }
    );
  }
} 