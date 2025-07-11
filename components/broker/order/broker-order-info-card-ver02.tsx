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
import { BrokerOrderStatusCard } from "./broker-order-info-status-card";
import { CompanyCard } from "./broker-order-info-company-card";
import { CargoCard } from "./broker-order-info-cargo-card";
import { BrokerOrderTimeline } from "./broker-order-info-timeline";

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
  id?: string;
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
  status: string;
  orderId: string;
  dispatchId?: string;
  onStatusChange?: (newStatus: string) => void;
  isSaleClosed?: boolean; // 매출 정산 마감 여부 추가
}

export function BrokerOrderInfoCard({ 
  departure, 
  destination, 
  cargo, 
  shipper, 
  status, 
  orderId, 
  dispatchId,
  onStatusChange,
  isSaleClosed = false // 기본값 false
}: BrokerOrderInfoCardProps) {
  const [isShipperInfoOpen, setIsShipperInfoOpen] = useState(true);
  const [isWarningsVisible, setIsWarningsVisible] = useState(false);
  const [isLocationInfoOpen, setIsLocationInfoOpen] = useState(true);
  const [isCargoInfoOpen, setIsCargoInfoOpen] = useState(true);

  // 날짜와 시간을 합쳐서 dateTime 형식으로 변환
  const departureDateTime = `${departure.date} ${departure.time}${departure.loadingMethod ? ` / ${departure.loadingMethod}` : ''}`;
  const destinationDateTime = `${destination.date} ${destination.time}${destination.loadingMethod ? ` / ${destination.loadingMethod}` : ''}`;

  // 상태 변경 핸들러
  const handleStatusChange = (newStatus: string) => {
    console.log(`BrokerOrderInfoCard: 상태 변경 ${status} -> ${newStatus}`);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // 상하차 담당자에게 문자 보내기 함수
  const handleSendMessage = (name: string, contact: string, type: '상차' | '하차') => {
    toast({
      title: `${type} 담당자에게 문자 발송`,
      description: `${name}님(${contact})에게 문자가 발송되었습니다.`,
    });
  };

  // 운전자에게 전화/문자 보내기 함수
  const handleCallDriver = (driverName: string) => {
    toast({
      title: "운전자에게 전화 발신",
      description: `${driverName} 운전자에게 전화를 발신합니다.`,
    });
  };

  const handleMessageDriver = (driverName: string) => {
    toast({
      title: "운전자에게 메시지 발송",
      description: `${driverName} 운전자에게 메시지를 발송합니다.`,
    });
  };

  // 타임라인 새로고침 함수
  const handleRefreshTimeline = () => {
    toast({
      title: "타임라인 새로고침",
      description: "배송 상태 정보가 업데이트되었습니다.",
    });
  };

  // 목업 데이터 - 화주 주의사항
  const companyWarnings = shipper.warnings || [
    { id: '1', date: '2023-05-15', content: '결제 지연 이력 있음', severity: 'medium' },
    { id: '2', date: '2023-06-20', content: '화물 취소 이력', severity: 'low' },
  ];

  // 배송 상태 카드에 전달할 주소 데이터
  const fromAddressData = {
    address: departure.address.split(',')[0] || departure.address,
    name: departure.company,
    state: departure.address.split(',')[1] || 'IL',
    zipCode: '62702',
    country: '대한민국',
    contactName: departure.name,
    contactPhone: departure.contact,
  };

  const toAddressData = {
    address: destination.address.split(',')[0] || destination.address,
    name: destination.company,
    state: destination.address.split(',')[1] || 'MA',
    zipCode: '01103',
    country: '대한민국',
    contactName: destination.name,
    contactPhone: destination.contact,
  };

  // 업체 정보 데이터
  const companyInfo = {
    name: shipper.name,
    year: "2018",
    id: shipper.id,
    isLive: true,
    fuelLevel: 87,
    warnings: companyWarnings
  };

  // 담당자 정보 데이터
  const managerInfo = {
    name: shipper.manager,
    contact: shipper.contact,
    email: shipper.email,
    role: "Carrier",
    avatar: "/images/driver-placeholder.png"
  };

  const cargoInfo = {
    name: cargo.type,
    vehicleType: cargo.vehicleType || "",
    weight: cargo.weight || "",
    options: cargo.options || [],
    remark: cargo.remark || "",
    paymentMethod: cargo.paymentMethod || "인수증"
  };

  const scheduleInfo = {
    from: {
      fromDate : departure.date, 
      fromTime : departure.time
    },
    to: {
      toDate : destination.date,
      toTime : destination.time
    }
  };
  

  // 타임라인 데이터
  const timelineEvents = [
    {
      date: "Nov 19, 2024",
      time: "09:15",
      status: "in_delivery",
      location: "6841 Oak Avenue, Springfield",
      isActive: true
    },
    {
      date: "Nov 18, 2024",
      time: "10:21",
      status: "arrived",
      location: "1352 Elm Street, Springfield",
      isActive: false
    },
    {
      date: "Nov 17, 2024",
      time: "17:04",
      status: "in_transit",
      location: "6813 Oakmont Avenue, Springfield",
      isActive: false
    },
    {
      date: "Nov 17, 2024",
      time: "12:18",
      status: "confirmed",
      location: "8429 Maple Lane, Springfield",
      isActive: false
    }
  ];

  console.log('status1', status);

  return (
    <div className="space-y-4">

      <div className="bg-muted/50 rounded-lg border border-gray-100 shadow-sm">
        {/* 회사 정보 카드 추가 */}
        <div className="mb-2 rounded-t-lg">
          <CompanyCard 
            orderId={orderId}
            companyInfo={companyInfo}
            managerInfo={managerInfo}
            onCall={handleCallDriver}
            onMessage={handleMessageDriver}
          />
        </div>

        {/* 화물 정보 */}
        <div className="rounded-b-lg">
          <CargoCard
            orderId={orderId}
            cargoInfo={cargoInfo}          
          />
        </div>
      </div>
     
      <div className="bg-muted/50 rounded-lg border border-gray-100 shadow-sm">
        {/* 배송 상태 카드 추가 */}
        <div className="mb-2 rounded-t-lg">
          <BrokerOrderStatusCard 
            status={status}
            dispatchId={dispatchId}
            from={fromAddressData}
            to={toAddressData}
            onStatusChange={handleStatusChange}
            isSaleClosed={isSaleClosed} // 전달
          />
        </div>

        {/* 타임라인 추가 */}
        <div className="rounded-b-lg">
          <BrokerOrderTimeline 
            scheduleInfo={scheduleInfo}
            events={timelineEvents}
            onRefresh={handleRefreshTimeline}
          />
        </div>
      </div>

      
    </div>
  );
} 