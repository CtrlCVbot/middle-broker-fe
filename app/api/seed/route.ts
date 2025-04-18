import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 각 엔드포인트에 대한 요청 처리
    const seedEndpoints = [
      { name: 'addresses', url: '/api/seed/addresses' }
    ];
    
    const results = [];
    
    // 각 엔드포인트에 순차적으로 요청
    for (const endpoint of seedEndpoints) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint.url}`);
        const data = await response.json();
        
        results.push({
          endpoint: endpoint.name,
          success: response.ok,
          status: response.status,
          message: data.message,
          count: data.count
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          success: false,
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // 모든 결과 반환
    return NextResponse.json({
      success: true,
      message: '시드 데이터 생성이 완료되었습니다.',
      results
    });
    
  } catch (error) {
    console.error('시드 데이터 생성 중 오류 발생:', error);
    
    return NextResponse.json({
      success: false,
      message: '시드 데이터 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 