import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Package, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Factory, 
  MessageSquare,
  AlertTriangle,
  CreditCard 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { PaymentMethodType, LoadingMethodType } from "@/types/broker-order-updated";

// 업체 주의사항 인터페이스
interface CompanyWarning {
  id: string;
  date: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

interface LocationInfo {
  address: string;
  name?: string;
  contact?: string;
  dateTime: string;
  loadingMethod?: LoadingMethodType; // 상하차 방법 추가
}

interface CargoInfo {
  type: string;
  options?: string[];
  weight?: string;
  remark?: string;
  vehicleType?: string;
  paymentMethod?: PaymentMethodType; // 결제 방법 추가
}

interface ShipperInfo {
  name: string;
  manager: string;
  contact: string;
  email: string;
  warnings?: CompanyWarning[]; // 업체 주의사항 추가
}

interface BrokerOrderInfoCardProps {
  departure: {
    address: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
    loadingMethod?: LoadingMethodType; // 상차 방법 추가
  };
  destination: {
    address: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
    loadingMethod?: LoadingMethodType; // 하차 방법 추가
  };
  cargo: CargoInfo;
  shipper: ShipperInfo;
}

export function BrokerOrderInfoCard({ departure, destination, cargo, shipper }: BrokerOrderInfoCardProps) {
  const [isShipperInfoOpen, setIsShipperInfoOpen] = useState(true);
  const [isWarningsOpen, setIsWarningsOpen] = useState(false);

  // 날짜와 시간을 합쳐서 dateTime 형식으로 변환
  const departureDateTime = `${departure.date} ${departure.time}${departure.loadingMethod ? ` / ${departure.loadingMethod}` : ''}`;
  const destinationDateTime = `${destination.date} ${destination.time}${destination.loadingMethod ? ` / ${destination.loadingMethod}` : ''}`;

  // 상하차 담당자에게 문자 보내기 함수
  const handleSendMessage = (name: string, contact: string, type: '상차' | '하차') => {
    toast({
      title: `${type} 담당자에게 문자 발송`,
      description: `${name}님(${contact})에게 문자가 발송되었습니다.`,
    });
  };

  // 목업 데이터 - 화주 주의사항
  const companyWarnings = shipper.warnings || [
    { id: '1', date: '2023-05-15', content: '결제 지연 이력 있음', severity: 'medium' },
    { id: '2', date: '2023-06-20', content: '화물 취소 이력', severity: 'low' },
  ];

  return (
    <div className="space-y-4">
      {/* 화주 정보 */}
      <div>        
        <div className="flex items-center justify-between w-full">
          <button 
            className="flex items-center gap-2"
            onClick={() => setIsShipperInfoOpen(!isShipperInfoOpen)}
          >
            <Factory className="h-4 w-4 text-primary" />
            <h4 className="font-medium">화주 정보</h4>
          </button>
          <div className="flex items-center gap-2">
            {/* 주의사항 버튼 */}
            <Dialog open={isWarningsOpen} onOpenChange={setIsWarningsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  <AlertTriangle className="mr-1 h-3.5 w-3.5 text-amber-500" />
                  주의사항
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>업체 주의사항</DialogTitle>
                  <DialogDescription>
                    {shipper.name} 업체에 대한 주의사항 목록입니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {companyWarnings.length > 0 ? (
                    <ul className="space-y-2">
                      {companyWarnings.map((warning) => (
                        <li key={warning.id} className="flex items-start gap-2 text-sm">
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
                    <p className="text-sm text-muted-foreground">주의사항이 없습니다.</p>
                  )}
                </div>
                <DialogFooter>
                  <Button size="sm" onClick={() => setIsWarningsOpen(false)}>닫기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {isShipperInfoOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(false)} />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(true)} />
            )}
          </div>
        </div>
          
        {isShipperInfoOpen && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">화주명</div>
            <div className="col-span-2 font-medium">{shipper.name}</div>
            
            <div className="text-muted-foreground">담당자</div>
            <div className="col-span-2 font-medium">{shipper.manager} / {shipper.contact}</div>
            <div className="text-muted-foreground">이메일</div>
            <div className="col-span-2 font-medium">{shipper.email}</div>
          </div>
        )}
      </div>

      {/* 분리선 */}
      <Separator className="my-4" />

      {/* 상/하차지 정보*/}
      <div>      
        <div className="space-y-3">
          {/* 상차지 정보 */}
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-4 w-4" />
            <h4 className="font-medium">상/하차 정보</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-muted-foreground">상차 주소</div>
            <div className="col-span-2 font-bold">{departure.address}</div>

            <div className="text-muted-foreground">하차 주소</div>
            <div className="col-span-2 font-bold">{destination.address}</div>

            <div className="text-muted-foreground">상차 일시</div>
            <div className="col-span-2 font-medium">{departureDateTime}</div>

            <div className="text-muted-foreground">하차 일시</div>
            <div className="col-span-2 font-medium">{destinationDateTime}</div>
            
            {departure.name && (
              <>
                <div className="text-muted-foreground">상차 담당</div>
                <div className="col-span-2 font-medium flex items-center gap-2">
                  <span>
                    {departure.name}
                    {departure.contact && ` / ${departure.contact}`}
                  </span>
                  {departure.contact && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleSendMessage(departure.name, departure.contact || '', '상차')}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      문자
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {destination.name && (
              <>
                <div className="text-muted-foreground">하차 담당</div>
                <div className="col-span-2 font-medium flex items-center gap-2">
                  <span>
                    {destination.name}
                    {destination.contact && ` / ${destination.contact}`}
                  </span>
                  {destination.contact && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleSendMessage(destination.name, destination.contact || '', '하차')}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      문자
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 분리선 */}
      <Separator className="my-4" />

      {/* 화물 정보 */}
      <div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <h4 className="font-medium">화물 상세</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm py-2">
          <div className="text-muted-foreground">운송 옵션</div>
          <div className="col-span-2 font-medium">
            <div className="flex flex-wrap items-center gap-2">
              {cargo.vehicleType && (
                <span className="inline-flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm">
                  {cargo.vehicleType}
                </span>
              )}
              {cargo.weight && (
                <span className="inline-flex items-center bg-primary/10 px-2 py-0.5 rounded text-sm">
                  {cargo.weight}
                </span>
              )}
              {cargo.options && cargo.options.length > 0 && cargo.options.map((option, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-muted-foreground">화물 종류</div>
          <div className="col-span-2 font-medium">{cargo.type}</div>
          
          {cargo.remark && (
            <>
              <div className="text-muted-foreground">비고</div>
              <div className="col-span-2 font-medium text-xs">
                {cargo.remark}
              </div>
            </>
          )}
          
          {/* 결제 방법 추가 */}
          <div className="text-muted-foreground">결제 방법</div>
          <div className="col-span-2 font-medium flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5 text-primary" />
            <span>{cargo.paymentMethod || "인수증"}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 