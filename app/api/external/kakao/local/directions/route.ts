import { NextResponse } from 'next/server';
import { KakaoDirectionsService } from '@/services/kakao-directions-service';
import { IKakaoDirectionsParams } from '@/types/kakao-directions';

/**
 * 카카오모빌리티 자동차 길찾기 API
 * @param req - 요청 객체
 * @returns 길찾기 결과 응답
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 필수 파라미터 검증
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');

    if (!origin) {
      return NextResponse.json(
        { error: 'Origin parameter is required' }, 
        { status: 400 }
      );
    }

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination parameter is required' }, 
        { status: 400 }
      );
    }

    // 좌표 형식 검증
    if (!KakaoDirectionsService.isValidCoordinate(origin)) {
      return NextResponse.json(
        { error: 'Invalid origin coordinate format' },
        { status: 400 }
      );
    }

    if (!KakaoDirectionsService.isValidCoordinate(destination)) {
      return NextResponse.json(
        { error: 'Invalid destination coordinate format' },
        { status: 400 }
      );
    }

    // 선택 파라미터들
    const waypoints = searchParams.get('waypoints');
    const priority = searchParams.get('priority') || 'RECOMMEND';
    const avoid = searchParams.get('avoid');
    const roadevent = searchParams.get('roadevent') || '0';
    const alternatives = searchParams.get('alternatives');
    const roadDetails = searchParams.get('road_details');
    const carType = searchParams.get('car_type');
    const carFuel = searchParams.get('car_fuel') || 'GASOLINE';
    const carHipass = searchParams.get('car_hipass');
    const summary = searchParams.get('summary');

    // 선택 파라미터 검증
    if (priority && !KakaoDirectionsService.isValidPriority(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value. Use RECOMMEND, TIME, or DISTANCE' },
        { status: 400 }
      );
    }

    if (carFuel && !KakaoDirectionsService.isValidCarFuel(carFuel)) {
      return NextResponse.json(
        { error: 'Invalid car_fuel value. Use GASOLINE, DIESEL, or LPG' },
        { status: 400 }
      );
    }

    if (waypoints && !KakaoDirectionsService.isValidWaypoints(waypoints)) {
      return NextResponse.json(
        { error: 'Invalid waypoints format' },
        { status: 400 }
      );
    }

    // API 파라미터 구성
    const params: IKakaoDirectionsParams = {
      origin,
      destination,
      ...(waypoints && { waypoints }),
      ...(priority && { priority: priority as 'RECOMMEND' | 'TIME' | 'DISTANCE' }),
      ...(avoid && { avoid }),
      ...(roadevent && { roadevent: roadevent as '0' | '1' | '2' }),
      ...(alternatives && { alternatives: alternatives === 'true' }),
      ...(roadDetails && { road_details: roadDetails === 'true' }),
      ...(carType && { car_type: parseInt(carType) }),
      ...(carFuel && { car_fuel: carFuel as 'GASOLINE' | 'DIESEL' | 'LPG' }),
      ...(carHipass && { car_hipass: carHipass === 'true' }),
      ...(summary && { summary: summary === 'true' })
    };

    // 서비스를 통한 API 호출
    const data = await KakaoDirectionsService.getDirections(params);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in directions API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch directions',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 