"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { IBrokerOrder, BrokerOrderStatusType } from "@/types/broker-order";
import { formatCurrency } from "@/lib/utils";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { BrokerStatusBadge } from "./broker-status-badge";
import { BrokerOrderContextMenu } from "./broker-order-context-menu";
import { Badge } from "@/components/ui/badge";
import { Truck, Calendar, Clock, ArrowRight, Link2Off, MapPin } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { getStatusBadge } from "@/components/order/order-table-ver01";
import { Checkbox } from "@/components/ui/checkbox";
import { useBrokerOrderStore } from "@/store/broker-order-store";
import { cn } from "@/lib/utils";

// 날짜 포맷팅 유틸리티 함수
const getSchedule = (pickupDateTime: string, deliveryDateTime: string) => {
  try {
    const pickupDate = new Date(pickupDateTime);
    const deliveryDate = new Date(deliveryDateTime);
    
    const pickupDateStr = format(pickupDate, "MM.dd(E)", { locale: ko });
    const deliveryDateStr = format(deliveryDate, "dd", { locale: ko });
    
    if (pickupDate.toDateString() === deliveryDate.toDateString()) {
      return pickupDateStr;
    } else {
      return `${pickupDateStr} - ${deliveryDateStr}`;
    }
  } catch (e) {
    return "-";
  }
};

const getTime = (pickupDateTime: string, deliveryDateTime: string) => {
  try {
    const pickupDate = new Date(pickupDateTime);
    const deliveryDate = new Date(deliveryDateTime);
    
    const pickupTimeStr = format(pickupDate, "HH:mm", { locale: ko });
    let deliveryTimeStr = format(deliveryDate, "HH:mm", { locale: ko });
    
    if (pickupDate.toDateString() !== deliveryDate.toDateString()) {
      const deliveryDateStr = format(deliveryDate, "dd", { locale: ko });
      deliveryTimeStr = `${deliveryTimeStr}(${deliveryDateStr})`;
    }
    
    return `${pickupTimeStr} - ${deliveryTimeStr}`;
  } catch (e) {
    return "-";
  }
};

// API 응답 데이터 타입 정의
interface IDispatchItem {
  orderId: string;
  dispatchId: string;
  flowStatus: string;
  cargoName: string;
  dispatchDate?: string;
  pickupAddress: string;
  pickupDateTime: string;
  deliveryAddress: string;
  deliveryDateTime: string;
  vehicleType: string;
  vehicleWeight: string;
  assignedVehicleNumber?: string;
  assignedVehicleType?: string;
  driverName?: string;
  driverPhone?: string;
  freightCost?: number;
  estimatedAmount?: number;
  memo?: string;
  brokerMemo?: string;
  // 추가 필드가 있을 수 있음
}

interface BrokerOrderCardProps {
  orders: IDispatchItem[]; // IBrokerOrder에서 IDispatchItem으로 변경
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange?: (orderId: string, newStatus: BrokerOrderStatusType) => void;
  onEditTransportFee?: (orderId: string) => void;
  onExportExcel?: (orderId: string) => void;
  onViewMap?: (orderId: string) => void;
  onAcceptOrder?: (orderId: string) => void;
}

export function BrokerOrderCard({
  orders,
  currentPage,
  totalPages,
  onPageChange,
  onStatusChange,
  onEditTransportFee,
  onExportExcel,
  onViewMap,
  onAcceptOrder,
}: BrokerOrderCardProps) {
  const { openSheet } = useBrokerOrderDetailStore();
  const { activeTab, selectedOrders, toggleOrderSelection } = useBrokerOrderStore();

  // 화물 상세 정보 열기
  const handleOrderClick = (orderId: string) => {
    openSheet(orderId);
  };

  // 첫 페이지로 이동
  const handleFirstPage = () => {
    onPageChange(1);
  };

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 마지막 페이지로 이동
  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-lg text-muted-foreground">
        표시할 화물 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <BrokerOrderContextMenu 
            key={order.orderId} 
            order={{
              id: order.orderId,
              status: order.flowStatus as BrokerOrderStatusType,
              departureLocation: order.pickupAddress,
              departureDateTime: order.pickupDateTime,
              arrivalLocation: order.deliveryAddress,
              arrivalDateTime: order.deliveryDateTime,
              vehicle: {
                type: order.vehicleType,
                weight: order.vehicleWeight
              },
              driver: {
                name: order.driverName || "-",
                contact: order.driverPhone || "-"
              },
              amount: order.estimatedAmount || 0,
              chargeAmount: order.freightCost || 0,
              fee: 0
            } as IBrokerOrder}
            onStatusChange={onStatusChange}
            onEditTransportFee={onEditTransportFee}
            onExportExcel={onExportExcel}
            onViewMap={onViewMap}
            onAcceptOrder={onAcceptOrder}
          >
            <Card 
              key={order.orderId} 
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                activeTab === 'waiting' && selectedOrders.includes(order.orderId) && "border-primary border-2"
              )}
              onClick={() => activeTab === 'waiting' ? toggleOrderSelection(order.orderId) : handleOrderClick(order.orderId)}
            >
              <CardHeader className="pb-2">
                {activeTab === 'waiting' && (
                  <div className="absolute top-3 right-3">
                    <Checkbox
                      checked={selectedOrders.includes(order.orderId)}
                      onCheckedChange={() => toggleOrderSelection(order.orderId)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-md flex items-center gap-2">
                      <span className="text-primary underline">#{order.orderId.slice(0, 8)}</span>
                      {getStatusBadge(order.flowStatus as BrokerOrderStatusType)}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">{order.cargoName || "일반 화물"}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-primary font-bold text-right">
                      {formatCurrency(order.freightCost || 0)}원
                    </div>
                    {order.estimatedAmount && order.freightCost !== order.estimatedAmount && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatCurrency(order.estimatedAmount)}원
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-3">
                  {/* 일정 및 시간 */}
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {getSchedule(order.pickupDateTime, order.deliveryDateTime)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getTime(order.pickupDateTime, order.deliveryDateTime)}
                      </div>
                    </div>
                  </div>
                  
                  {/* 상하차지 */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">상차지</div>
                        <div className="text-xs text-muted-foreground">
                          {order.pickupAddress || order.pickupAddress.split(' ').slice(0, 2).join(' ')}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="font-medium">하차지</div>
                        <div className="text-xs text-muted-foreground">
                          {order.deliveryAddress || order.deliveryAddress.split(' ').slice(0, 2).join(' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 차량/기사 정보 */}
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">차량</div>
                        <div className="text-xs text-muted-foreground">
                          {order.vehicleType || order.assignedVehicleType} | {order.vehicleWeight}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="font-medium">기사</div>
                        <div className="text-xs text-muted-foreground">
                          {order.driverName ? `${order.driverName} (${order.driverPhone})` : '미지정'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BrokerOrderContextMenu>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {currentPage} / {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 