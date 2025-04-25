"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Truck, 
  MapPin, 
  Star, 
  Clock,
  Pin,
  Building,
  ChevronDown,
  ChevronUp,
  Navigation,
  Circle
} from "lucide-react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { BrokerOrderStatusType } from "@/types/broker-order";
import { formatCurrency } from "@/lib/utils";

interface VehicleInfo {
  type: string;
  weight?: string;
  licensePlate?: string;
  driver?: {
    name: string;
    contact: string;
  };
}

interface DriverInfo {
  name: string;
  contact?: string;
  company?: string;
  carModel?: string;
}

interface BrokerOrderDriverInfoCardProps {
  vehicle: VehicleInfo;
  status: BrokerOrderStatusType;
  amount: string;
  driver: DriverInfo;
  onSendMessage: () => void;
}

// 목업 데이터 - 위치 정보
const locationData = {
  departure: { name: "서울시 중구 을지로 123" },
  destination: { name: "대구시 중구 동성로 456" },
  current: { name: "경기도 용인시 처인구" }
};

export function BrokerOrderDriverInfoCard({ vehicle, status, amount, driver, onSendMessage }: BrokerOrderDriverInfoCardProps) {
  const [activeTab, setActiveTab] = useState("history");
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  // 배차 전 상태인지 확인 (배차대기 상태이고 차주 정보가 없는 경우)
  const isBeforeAssignment = status === '배차대기' || !vehicle.driver;

  //console.log(vehicle.driver);
  
  // 배차 알림 전송 함수
  const handleSendAlert = () => {
    alert("배차 알림이 전송되었습니다.");
  };
  
  // 배차 진행 함수
  const handleAssignment = () => {
    alert("배차 진행 페이지로 이동합니다.");
  };
  
  // 지도 토글 함수
  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };
  
  // 목업 데이터 - 차주 배차 이력
  const driverHistory = [
    { id: "ORD-001", date: "2023-03-01", route: "서울 → 부산", amount: "850,000원", status: "완료" },
    { id: "ORD-002", date: "2023-02-15", route: "인천 → 대구", amount: "720,000원", status: "완료" },
    { id: "ORD-003", date: "2023-01-20", route: "광주 → 대전", amount: "550,000원", status: "완료" },
  ];
  
  // 목업 데이터 - 차주 특이사항
  const driverWarnings = [
    { date: "2023-02-10", content: "하차 지연 (30분)", severity: "low" },
    { date: "2023-01-05", content: "화주 컴플레인 - 불친절", severity: "medium" },
  ];
  
  // 문자열 금액을 숫자로 변환 (콤마 제거)
  const amountNumber = parseInt(amount.replace(/,/g, ''), 10) || 0;
  
  return (
    <div className="space-y-4">
      {isBeforeAssignment ? (
        // 배차 전 상태 UI
        
          <div className="p-4">
            <div className="flex items-center gap-2 text-amber-500 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-medium">아직 배차가 완료되지 않았습니다.</h4>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-muted-foreground">예상 배차 금액</div>
                <div className="col-span-2 font-medium">{formatCurrency(amountNumber)}원</div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleAssignment}
              >
                배차 진행하기
              </Button>
            </div>
          </div>
        
      ) : (
        // 배차 후 상태 UI
        <>
          {/* 차주 및 차량 정보 */}          
          <div className="space-y-4">
            
            
            {/* 차주 정보 */}
            {vehicle.driver && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">차량</h4>
                </div>                
                

                <div className="grid grid-cols-3 gap-2 text-sm">

                  <div className="text-muted-foreground">차주명</div>
                  <div className="col-span-2 font-medium">{vehicle.driver.name} / {vehicle.driver.contact}</div>

                  {vehicle.licensePlate && (
                  <>
                    <div className="text-muted-foreground">차량 번호</div>
                    <div className="col-span-2 font-medium">{vehicle.licensePlate}</div>
                  </>
                  )}               
                  
                  <div className="text-muted-foreground">차량 종류</div>
                  <div className="col-span-2 font-medium">{vehicle.type} / {vehicle.weight && (vehicle.weight)}</div>

                  
                  
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* 운송 거래처 정보*/}
            <div>      
                <div className="space-y-3">
                  {/* 운송 거래처 정보 */}
                  <div className="flex items-center gap-2 text-primary">
                    <Building className="h-4 w-4" />
                    <h4 className="font-medium">운송 거래처 정보</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-muted-foreground">사업자/번호</div>
                    <div className="col-span-2 font-bold">재형운송(111-11-11111)</div>

                    <div className="text-muted-foreground">유형/대표자</div>
                    <div className="col-span-2 font-medium">일반사업자/박재형</div>

                    <div className="text-muted-foreground">은행 정보</div>
                    <div className="col-span-2 font-medium">국민/재형운송/1111111111</div>

                    <div className="text-muted-foreground">계산서/우편</div>
                    <div className="col-span-2 font-medium">수기/종이</div>
                  </div>
                </div>
            </div>

          </div>
          
          <Separator />
          
          {/* 차주 배차 이력과 특이사항 */}
          <div className="">
            <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  상태
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  이력
                </TabsTrigger>
                <TabsTrigger value="warnings" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  특이사항
                </TabsTrigger>
                
              </TabsList>

              <TabsContent value="status" className="mt-2">
                {/* 차량 정보 */}
                <div className="space-y-3">
                        
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    
                    <div className="text-muted-foreground">차량 상태</div>
                      <div className="col-span-2 font-medium">
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        운행중
                      </Badge>
                    </div>

                    <div className="text-muted-foreground">현재 위치</div>
                    <div className="col-span-2 font-medium">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer flex items-center gap-1 hover:bg-primary/10 transition-colors"
                        onClick={toggleMap}
                      >
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>경기도 용인시 (10분 전 업데이트)</span>
                        {isMapVisible ? 
                          <ChevronUp className="h-3.5 w-3.5 ml-1" /> : 
                          <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        }
                      </Badge>
                    </div>
                    
                    {/* 지도 표시 영역 */}
                    {isMapVisible && (
                      <div className="col-span-3 mt-2 bg-slate-50 rounded-md overflow-hidden transition-all duration-300 ease-in-out">
                        <div className="relative h-64 w-full p-2">
                          {/* 상차지 마커 */}
                          <div className="absolute top-6 left-6 flex flex-col items-center">
                            <div className="flex items-center">
                              <Pin className="h-5 w-5 text-green-600" />
                              <div className="ml-1 text-xs font-medium bg-white p-1 rounded shadow-sm">
                                상차지: {locationData.departure.name}
                              </div>
                            </div>
                          </div>
                          
                          {/* 하차지 마커 */}
                          <div className="absolute bottom-6 right-6 flex flex-col items-center">
                            <div className="flex items-center">
                              <Pin className="h-5 w-5 text-red-600" />
                              <div className="ml-1 text-xs font-medium bg-white p-1 rounded shadow-sm">
                                하차지: {locationData.destination.name}
                              </div>
                            </div>
                          </div>
                          
                          {/* 현재 위치 마커 */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="flex items-center">
                              <Navigation className="h-6 w-6 text-blue-600" />
                              <div className="ml-1 text-xs font-medium bg-white p-1 rounded shadow-sm">
                                현재 위치: {locationData.current.name}
                              </div>
                            </div>
                          </div>
                          
                          {/* 경로 표시 (상차지 → 현재 위치) */}
                          <div className="absolute top-12 left-12 w-[calc(50%-24px)] h-[calc(50%-24px)] border-t-2 border-l-2 border-dashed border-blue-400"></div>
                          
                          {/* 경로 표시 (현재 위치 → 하차지) */}
                          <div className="absolute bottom-12 right-12 w-[calc(50%-24px)] h-[calc(50%-24px)] border-b-2 border-r-2 border-dashed border-blue-400"></div>
                          
                          {/* 지도 워터마크 */}
                          <div className="absolute bottom-2 left-2 opacity-50 text-xs text-slate-500">
                            * 실제 지도 연동 시 정확한 경로가 표시됩니다
                          </div>
                        </div>
                        
                        {/* 지도 컨트롤 */}
                        <div className="p-2 bg-white border-t flex justify-between items-center">
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <div className="flex items-center">
                              <Circle className="h-3 w-3 text-green-600 fill-green-600" />
                              <span className="ml-1">상차지</span>
                            </div>
                            <div className="flex items-center">
                              <Circle className="h-3 w-3 text-blue-600 fill-blue-600" />
                              <span className="ml-1">현재 위치</span>
                            </div>
                            <div className="flex items-center">
                              <Circle className="h-3 w-3 text-red-600 fill-red-600" />
                              <span className="ml-1">하차지</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={toggleMap}>
                            닫기
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="text-muted-foreground">평가</div>
                    <div className="col-span-2 font-medium flex items-center">
                        <div className="flex text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5" />
                        </div>
                        <span className="ml-1 text-xs">(4.0)</span>
                    </div>

                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">주문번호</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">날짜</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">경로</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">금액</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverHistory.map((history) => (
                        <tr key={history.id} className="border-b">
                          <td className="py-2">{history.id}</td>
                          <td className="py-2">{history.date}</td>
                          <td className="py-2">{history.route}</td>
                          <td className="py-2 text-right">{history.amount}</td>
                          <td className="py-2 text-right">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              {history.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="warnings" className="mt-2">
                {driverWarnings.length > 0 ? (
                  <ul className="space-y-2">
                    {driverWarnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${warning.severity === 'high' ? 'bg-red-50 text-red-700' : 
                              warning.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 
                              'bg-blue-50 text-blue-700'}
                          `}
                        >
                          {warning.date}
                        </Badge>
                        <span>{warning.content}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">특이사항이 없습니다.</p>
                )}
              </TabsContent>

              
            </Tabs>
          </div>
          
        </>
      )}
    </div>
  );
} 