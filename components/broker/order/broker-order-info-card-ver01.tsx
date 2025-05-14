import React, { useState } from "react";

import { 
  MapPin, 
  Package,
  ChevronDown, 
  ChevronUp, 
  Factory, 
  MessageSquare,
  AlertTriangle,
  CreditCard,
  User,
  Warehouse,
  LogOut,
  Link2Off,
  Truck,
  ArrowDown,
  ChevronsRight,
  ArrowUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { PaymentMethodType, LoadingMethodType } from "@/types/broker-order-updated";
import { CardContent } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { ko } from "date-fns/locale";
import { getSchedule, getStatusColor } from "@/components/order/order-table-ver01";
import { format, isValid, parseISO } from "date-fns";

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
  const [isWarningsVisible, setIsWarningsVisible] = useState(false);

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
        <CardHeader className="p-3">
            
          <CardTitle>

            <div className="flex items-center justify-between w-full">
              <button 
                className="flex items-center gap-2"
                onClick={() => setIsShipperInfoOpen(!isShipperInfoOpen)}
              >
                <Warehouse className="h-4 w-4 mr-2 text-gray-500" />
                {shipper.name}
              </button>
              <div className="flex items-center gap-2">
                {/* 주의사항 버튼 */}
                <Button
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWarningsVisible(!isWarningsVisible);
                    if (!isShipperInfoOpen) {
                      setIsShipperInfoOpen(true);
                    }
                  }}
                >
                  <AlertTriangle className="mr-1 h-3.5 w-3.5 text-amber-500" />
                  주의사항 {isWarningsVisible ? '접기' : '보기'}
                </Button>
                {isShipperInfoOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(false)} />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(true)} />
                )}
              </div>
            </div>
          
          </CardTitle>
        </CardHeader>

        

        {isShipperInfoOpen && (
        <div> 
        <Separator className="" /> 
        <CardContent className="p-3">     

          {/* 기본 화주 정보 */}
            <div className="grid grid-cols-3 gap-2 text-sm">              
              <div className="text-muted-foreground">담당자</div>
              <div className="col-span-2 font-medium">{shipper.manager} / {shipper.contact}</div>
              <div className="text-muted-foreground">이메일</div>
              <div className="col-span-2 font-medium">{shipper.email}</div>
            </div>       

          
          {/* 주의사항 섹션 - 확장 시 표시 */}
          {isWarningsVisible && (
            <>
              <Separator className="my-3" />
              <div className="mt-3 space-y-2 bg-muted/10 rounded-md">
                <h5 className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  업체 주의사항
                </h5>
                
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
            </>
            )}
        </CardContent>
        </div>
        )}
      </div>  

      {/* 분리선 */}
      <Separator className="my-4" />

        {/* <div> 
          <div className="h-full bg-white  rounded-md ">
            
            <div className={cn("bg-green-100 text-green-700" + " text-sm p-2 rounded-t-md flex items-center")}>          
              <Badge variant="default" className="mr-2 bg-green-700 text-white">
              <LogOut className="inline h-4 w-4" />
              </Badge>
              <span className="text-sm text-gray-700">{departureDateTime}</span>
            </div>

            <CardHeader className="p-3 flex justify-between items-center">            
              <CardTitle className="text-md font-semibold flex items-center">
              
                <Warehouse className="h-4 w-4 mr-2 text-gray-500" />
                {departure.company}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                >
                </Button>
              
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 border-t border-gray-200">            

              
              <div className="text-md font-medium mt-2">
                주소
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />              
                {departure.address}
              </div>
            </CardContent>
          </div>
        </div> */}

        <div               
              className="h-full bg-white  rounded-md "
              //onClick={() => handleOrderClick(order.id)}
            >   

              {/* <div className={cn("bg-gray-100" + " text-gray-700" + " text-sm p-2 rounded-t-md flex items-center")}>
                                
                 <button 
                  className="flex items-center gap-2"
                  onClick={() => setIsShipperInfoOpen(!isShipperInfoOpen)}
                >
                  <LogOut className="h-4 w-4 mr-2 text-gray-500" />
                  <div className="text-md">상,하차지 정보</div>
                </button>
                
              </div> */}

              <CardHeader className="p-3">
                  
                <CardTitle>

                  <div className="flex items-center justify-between w-full">
                    <button 
                      className="flex items-center gap-2"
                      onClick={() => setIsShipperInfoOpen(!isShipperInfoOpen)}
                    >
                      <MapPin className="h-4 w-4" />
                      상/하차 정보                      
                    </button>
                    <div className="flex items-center gap-2">
                      
                      {isShipperInfoOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(false)} />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(true)} />
                      )}
                    </div>
                  </div>
                
                  
                
                </CardTitle>
              </CardHeader>
              
              <div className=" px-3 py-2 space-y-4 border-b border-gray-200 ">
                
                <div className="flex items-center justify-between  ">
                  {/* 상차지 정보 */}
                  <div className="grid grid-cols-3 flex items-center gap-5">                    

                    {/* <ArrowUp className="h-8 w-8 text-green-500" /> */}
                    <div>
                      <div className="font-medium text-gray-700 line-clamp-1 ml-0">{format(departure.date, "MM.dd(E)", { locale: ko })}</div>
                      <div className="text-sm text-muted-foreground truncate">({departure.time})</div>                
                    </div>
                    <div className="col-span-2 items-left">
                      <div className="font-medium line-clamp-1 ml-0"> {departure.company}</div>
                      <div className="text-sm text-muted-foreground truncate">({departure.address})</div>    
                      <div className="text-sm text-muted-foreground truncate">{departure.name}/{departure.contact}</div>             
                    </div>
                    
                  </div>
                 
                </div>
              </div>

              <div className=" px-3 py-2 space-y-4 border-b border-gray-200 ">
                
                <div className="flex items-center justify-between  ">
                  {/* 상차지 정보 */}
                  <div className="grid grid-cols-3 flex items-center gap-5">                    

                    {/* <ArrowUp className="h-8 w-8 text-green-500" /> */}
                    <div>
                      <div className="font-medium text-gray-700 line-clamp-1 ml-0">{format(destination.date, "MM.dd(E)", { locale: ko })}</div>
                      <div className="text-sm text-muted-foreground truncate">({destination.time})</div>                
                    </div>
                    <div className="col-span-2 items-left">
                      <div className="font-medium line-clamp-1 ml-0"> {destination.company}</div>
                      <div className="text-sm text-muted-foreground truncate">({destination.address})</div>    
                      <div className="text-sm text-muted-foreground truncate">{destination.name}/{destination.contact}</div>             
                    </div>
                    
                  </div>
                 
                </div>
              </div>
            
              {/* 하단 정보: 차량 및 차주 */}
              <div className="flex items-center justify-between px-4  pt-2 pb-2">
                <div className="text-sm font-medium px-2 py-1 rounded-md text-foreground flex items-center">
                  <Truck className="h-4 w-4 mr-1" />
                  <span className="text-lg font-medium">{cargo.weight}/{cargo.vehicleType}</span>
                </div>

                {/* 차주명/연락처 */}                
                <Button variant="outline" size="sm" className="text-xs px-3 py-1 border-dashed">
                  <Link2Off className="h-4 w-4 mr-1" />
                  배차전
                </Button>
              </div>

            </div>

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