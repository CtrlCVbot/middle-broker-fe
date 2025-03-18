"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Star, 
  Bell, 
  Clock,
  MessageSquare
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

export function BrokerOrderDriverInfoCard({ vehicle, status, amount, driver, onSendMessage }: BrokerOrderDriverInfoCardProps) {
  const [activeTab, setActiveTab] = useState("history");
  
  // 배차 전 상태인지 확인 (배차대기 상태이고 차주 정보가 없는 경우)
  const isBeforeAssignment = status === '배차대기' || !vehicle.driver;
  
  // 배차 알림 전송 함수
  const handleSendAlert = () => {
    alert("배차 알림이 전송되었습니다.");
  };
  
  // 배차 진행 함수
  const handleAssignment = () => {
    alert("배차 진행 페이지로 이동합니다.");
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
          <div className="p-4 space-y-4">
            
            
            {/* 차주 정보 */}
            {vehicle.driver && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">차주 정보</h4>
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
            
            {/* 차량 정보 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h4 className="font-medium">차량 정보</h4>
              </div>

              
              
              <div className="grid grid-cols-3 gap-2 text-sm">

                
                <div className="text-muted-foreground">차량 상태</div>
                  <div className="col-span-2 font-medium">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    운행중
                  </Badge>
                </div>

                <div className="text-muted-foreground">현재 위치</div>
                <div className="col-span-2 font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>경기도 용인시 (10분 전 업데이트)</span>
                </div>

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
          </div>
          
          
          {/* 차주 배차 이력과 특이사항 */}
          <div className="px-4">
            <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  차주 배차 이력
                </TabsTrigger>
                <TabsTrigger value="warnings" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  차주 특이사항
                </TabsTrigger>
              </TabsList>
              
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