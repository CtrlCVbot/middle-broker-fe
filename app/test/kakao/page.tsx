'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, MapPin, Route, Clock, DollarSign, Car } from 'lucide-react';
import { IKakaoDirectionsParams, IKakaoDirectionsResponse } from '@/types/kakao-directions';
import { KakaoDirectionsService } from '@/services/kakao-directions-service';

interface ITestResult {
  success: boolean;
  data?: IKakaoDirectionsResponse;
  error?: string;
  requestTime: number;
}

export default function KakaoDirectionsTestPage() {
  // 기본 파라미터 상태
  const [params, setParams] = useState<IKakaoDirectionsParams>({
    origin: '127.111202,37.394912', // 판교역 좌표
    destination: '127.108678,37.402001', // 판교테크노밸리 좌표
    priority: 'RECOMMEND',
    car_fuel: 'GASOLINE'
  });

  // 테스트 결과 상태
  const [testResult, setTestResult] = useState<ITestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 미리 정의된 테스트 케이스
  const presetTestCases = {
    basic: {
      origin: '127.111202,37.394912',
      destination: '127.108678,37.402001',
      priority: 'RECOMMEND' as const,
      car_fuel: 'GASOLINE' as const
    },
    withWaypoints: {
      origin: '127.111202,37.394912',
      destination: '127.108678,37.402001',
      waypoints: '127.109,37.395|127.110,37.396',
      priority: 'TIME' as const,
      car_fuel: 'GASOLINE' as const
    },
    advancedOptions: {
      origin: '127.111202,37.394912',
      destination: '127.108678,37.402001',
      priority: 'DISTANCE' as const,
      avoid: 'toll|motorway',
      alternatives: true,
      road_details: true,
      car_fuel: 'DIESEL' as const,
      car_hipass: true,
      summary: false
    }
  };

  // 유명한 장소 좌표 프리셋
  const locationPresets = {
    '판교역': '127.111202,37.394912',
    '판교테크노밸리': '127.108678,37.402001',
    '강남역': '127.027926,37.497952',
    '서울역': '126.970734,37.554648',
    '인천공항': '126.450797,37.469221',
    '김포공항': '126.80165,37.558311',
    '잠실역': '127.100479,37.513292',
    '홍대입구역': '126.925331,37.556984',
    '명동': '126.985302,37.563600',
    '부산역': '129.040276,35.115417'
  };

  // API 호출 함수
  const testDirectionsAPI = async (testParams: IKakaoDirectionsParams) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // URL 파라미터 구성
      const searchParams = new URLSearchParams();
      
      // 필수 파라미터
      searchParams.append('origin', testParams.origin);
      searchParams.append('destination', testParams.destination);

      // 선택 파라미터 추가
      Object.entries(testParams).forEach(([key, value]) => {
        if (key !== 'origin' && key !== 'destination' && value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/external/kakao/local/directions?${searchParams.toString()}`);
      const requestTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        setTestResult({
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          requestTime
        });
        return;
      }

      const data: IKakaoDirectionsResponse = await response.json();
      setTestResult({
        success: true,
        data,
        requestTime
      });

    } catch (error) {
      const requestTime = Date.now() - startTime;
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestTime
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 파라미터 업데이트 함수
  const updateParam = (key: keyof IKakaoDirectionsParams, value: string | boolean | number) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 프리셋 로드 함수
  const loadPreset = (presetKey: keyof typeof presetTestCases) => {
    setParams(presetTestCases[presetKey]);
    setTestResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">카카오모빌리티 길찾기 API 테스트</h1>
        <p className="text-muted-foreground">
          카카오모빌리티 자동차 길찾기 API의 다양한 기능을 테스트할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 왼쪽: 입력 폼 */}
        <div className="space-y-6">
          {/* 프리셋 테스트 케이스 */}
          <Card>
            <CardHeader>
              <CardTitle>프리셋 테스트 케이스</CardTitle>
              <CardDescription>미리 정의된 테스트 케이스로 빠르게 테스트해보세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => loadPreset('basic')}
              >
                <Route className="mr-2 h-4 w-4" />
                기본 길찾기
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => loadPreset('withWaypoints')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                경유지가 있는 길찾기
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => loadPreset('advancedOptions')}
              >
                <Car className="mr-2 h-4 w-4" />
                고급 옵션 길찾기
              </Button>
            </CardContent>
          </Card>

          {/* 파라미터 입력 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>API 파라미터</CardTitle>
              <CardDescription>길찾기 요청에 사용할 파라미터를 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="required" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="required">필수 파라미터</TabsTrigger>
                  <TabsTrigger value="optional">선택 파라미터</TabsTrigger>
                </TabsList>

                <TabsContent value="required" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">출발지 좌표 (경도,위도)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="origin"
                        value={params.origin}
                        onChange={(e) => updateParam('origin', e.target.value)}
                        placeholder="127.111202,37.394912"
                        className="flex-1"
                      />
                      <Select onValueChange={(value) => updateParam('origin', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="장소선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(locationPresets).map(([name, coords]) => (
                            <SelectItem key={name} value={coords}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">목적지 좌표 (경도,위도)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="destination"
                        value={params.destination}
                        onChange={(e) => updateParam('destination', e.target.value)}
                        placeholder="127.108678,37.402001"
                        className="flex-1"
                      />
                      <Select onValueChange={(value) => updateParam('destination', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="장소선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(locationPresets).map(([name, coords]) => (
                            <SelectItem key={name} value={coords}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="optional" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="waypoints">경유지 좌표들 (|로 구분)</Label>
                    <Input
                      id="waypoints"
                      value={params.waypoints || ''}
                      onChange={(e) => updateParam('waypoints', e.target.value)}
                      placeholder="127.109,37.395|127.110,37.396"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">경로 탐색 우선순위</Label>
                    <Select 
                      value={params.priority || 'RECOMMEND'} 
                      onValueChange={(value) => updateParam('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECOMMEND">추천</SelectItem>
                        <SelectItem value="TIME">최단시간</SelectItem>
                        <SelectItem value="DISTANCE">최단거리</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="car_fuel">차량 유종</Label>
                    <Select 
                      value={params.car_fuel || 'GASOLINE'} 
                      onValueChange={(value) => updateParam('car_fuel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GASOLINE">휘발유</SelectItem>
                        <SelectItem value="DIESEL">경유</SelectItem>
                        <SelectItem value="LPG">LPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avoid">회피 옵션 (|로 구분)</Label>
                    <Input
                      id="avoid"
                      value={params.avoid || ''}
                      onChange={(e) => updateParam('avoid', e.target.value)}
                      placeholder="toll|motorway|ferries"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alternatives"
                        checked={params.alternatives || false}
                        onCheckedChange={(checked) => updateParam('alternatives', checked)}
                      />
                      <Label htmlFor="alternatives">대안 경로 제공</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="road_details"
                        checked={params.road_details || false}
                        onCheckedChange={(checked) => updateParam('road_details', checked)}
                      />
                      <Label htmlFor="road_details">상세 도로 정보 제공</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="car_hipass"
                        checked={params.car_hipass || false}
                        onCheckedChange={(checked) => updateParam('car_hipass', checked)}
                      />
                      <Label htmlFor="car_hipass">하이패스 장착</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="summary"
                        checked={params.summary || false}
                        onCheckedChange={(checked) => updateParam('summary', checked)}
                      />
                      <Label htmlFor="summary">요약 정보만 제공</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-4" />

              <Button 
                onClick={() => testDirectionsAPI(params)} 
                disabled={isLoading || !params.origin || !params.destination}
                className="w-full"
              >
                {isLoading ? '길찾기 중...' : '길찾기 테스트 실행'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 결과 표시 */}
        <div className="space-y-6">
          {/* 요청 정보 */}
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {testResult.success ? (
                    <Badge variant="default">성공</Badge>
                  ) : (
                    <Badge variant="destructive">실패</Badge>
                  )}
                  <span className="text-sm font-normal">
                    응답 시간: {testResult.requestTime}ms
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {/* 에러 표시 */}
          {testResult && !testResult.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API 호출 실패</AlertTitle>
              <AlertDescription>{testResult.error}</AlertDescription>
            </Alert>
          )}

          {/* 성공 결과 표시 */}
          {testResult && testResult.success && testResult.data && (
            <>
              {/* 포맷된 결과 */}
              <Card>
                <CardHeader>
                  <CardTitle>길찾기 결과 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResult.data.routes.map((route, index) => (
                    <div key={index} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">거리</div>
                            <div className="font-semibold">
                              {KakaoDirectionsService.formatDistance(route.summary.distance)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">소요 시간</div>
                            <div className="font-semibold">
                              {KakaoDirectionsService.formatDuration(route.summary.duration)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-yellow-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">택시 요금</div>
                            <div className="font-semibold">
                              {KakaoDirectionsService.formatFare(route.summary.fare.taxi)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-orange-500" />
                          <div>
                            <div className="text-sm text-muted-foreground">통행 요금</div>
                            <div className="font-semibold">
                              {KakaoDirectionsService.formatFare(route.summary.fare.toll)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <Badge variant="outline">{route.summary.priority}</Badge>
                        <span className="ml-2 text-muted-foreground">
                          {route.result_msg}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* JSON 응답 */}
              <Card>
                <CardHeader>
                  <CardTitle>JSON 응답</CardTitle>
                  <CardDescription>원본 API 응답 데이터</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    readOnly
                    value={JSON.stringify(testResult.data, null, 2)}
                    className="font-mono text-xs min-h-[400px]"
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* 기본 안내 */}
          {!testResult && (
            <Card>
              <CardHeader>
                <CardTitle>테스트 안내</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  왼쪽에서 파라미터를 설정하고 "길찾기 테스트 실행" 버튼을 클릭하세요.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">주요 기능:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 기본 출발지-목적지 길찾기</li>
                    <li>• 경유지를 포함한 다중 경로 탐색</li>
                    <li>• 우선순위별 경로 옵션 (추천/시간/거리)</li>
                    <li>• 차량 유종 및 하이패스 옵션</li>
                    <li>• 회피 경로 설정</li>
                    <li>• 상세 도로 정보 및 대안 경로</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 