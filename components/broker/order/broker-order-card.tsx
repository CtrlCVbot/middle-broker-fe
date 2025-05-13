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
}: BrokerOrderCardProps) {
  const { openSheet } = useBrokerOrderDetailStore();

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
          >
            <Card 
              key={order.orderId} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOrderClick(order.orderId)}
            >
              <CardHeader className="pb-2">
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
                      <div className="text-xs text-muted-foreground">
                        견적: {formatCurrency(order.estimatedAmount)}원
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-2 items-center mb-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{getSchedule(order.pickupDateTime, order.deliveryDateTime)}</span>
                  <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                  <span className="text-muted-foreground">{getTime(order.pickupDateTime, order.deliveryDateTime)}</span>
                </div>
                
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium">{order.pickupAddress.split(' ')[0] || ""}</div>
                      <div className="text-xs text-muted-foreground">{order.pickupAddress}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium">{order.deliveryAddress.split(' ')[0] || ""}</div>
                      <div className="text-xs text-muted-foreground">{order.deliveryAddress}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-2 border-t">
                <div className="flex flex-row items-center gap-1">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{order.vehicleWeight}</span>
                  <span className="text-xs text-muted-foreground">{order.vehicleType}</span>
                </div>

                <div>
                  {order.driverName ? (
                    <div className="text-sm">
                      <span className="font-medium">{order.driverName}</span>
                      <span className="text-xs text-muted-foreground ml-1">{order.driverPhone}</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs px-2 py-1 border-dashed text-muted-foreground">
                      <Link2Off className="h-3 w-3 mr-1" />
                      배차전                      
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          </BrokerOrderContextMenu>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          {totalPages > 0
            ? `페이지 ${currentPage} / ${totalPages}`
            : "데이터 없음"}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 