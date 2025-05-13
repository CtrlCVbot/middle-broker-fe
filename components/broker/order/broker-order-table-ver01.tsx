"use client";

import React from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsRight as ArrowRight,
  Link2Off,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IBrokerOrder, BrokerOrderStatusType } from "@/types/broker-order";
import { formatCurrency } from "@/lib/utils";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { BrokerStatusBadge } from "./broker-status-badge";
import { BrokerOrderContextMenu } from "./broker-order-context-menu";
import { getStatusBadge } from "@/components/order/order-table-ver01";
import { ko } from "date-fns/locale";

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

interface BrokerOrderTableProps {
  orders: IDispatchItem[]; // IBrokerOrder에서 IDispatchItem으로 변경
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onStatusChange?: (orderId: string, newStatus: BrokerOrderStatusType) => void;
  onEditTransportFee?: (orderId: string) => void;
  onExportExcel?: (orderId: string) => void;
  onViewMap?: (orderId: string) => void;
}

export function BrokerOrderTable({
  orders,
  currentPage,
  totalPages,
  onPageChange,
  onStatusChange,
  onEditTransportFee,
  onExportExcel,
  onViewMap,
}: BrokerOrderTableProps) {
  // 상세 정보 모달을 위한 스토어 액세스
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

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="w-[80px] text-center">ID</TableHead>
              <TableHead className="w-[80px] text-center">상태</TableHead>
              <TableHead className="w-[80px]">일정</TableHead>
              <TableHead className="w-[120px]">시간</TableHead>              
              <TableHead>상차지</TableHead>
              <TableHead>{/* 상차지 하차지 흐름 표시 */}</TableHead>
              <TableHead>하차지</TableHead>              
              <TableHead className="w-[100px]">품목</TableHead>              
              <TableHead className="w-[80px]">차량</TableHead>
              <TableHead>기사</TableHead>
              <TableHead className="text-right">운송비</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 화물 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
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
                    fee: 0 // 수수료 정보는 계산이 필요할 수 있음
                  } as IBrokerOrder}
                  onStatusChange={onStatusChange}
                  onEditTransportFee={onEditTransportFee}
                  onExportExcel={onExportExcel}
                  onViewMap={onViewMap}
                >                  
                  <TableRow key={order.orderId} className="cursor-pointer hover:bg-secondary/80" onClick={() => handleOrderClick(order.orderId)}>
                    <TableCell className="font-medium text-primary underline">{order.orderId.slice(0, 8)}</TableCell>
                    <TableCell className="text-center scale-90">
                      {getStatusBadge(order.flowStatus as BrokerOrderStatusType)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getSchedule(order.pickupDateTime, order.deliveryDateTime)}
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {getTime(order.pickupDateTime, order.deliveryDateTime)}
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate" title={order.pickupAddress}>
                      <div className="flex flex-col">
                        <div className="text-md font-medium text-shadow-xs">
                          {order.pickupAddress.split(' ')[0] || ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.pickupAddress}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate" title={order.deliveryAddress}>
                      <div className="flex flex-col">
                        <div className="text-md font-medium text-shadow-xs">
                          {order.deliveryAddress.split(' ')[0] || ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.deliveryAddress}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {order.cargoName || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="text-md font-bold text-neutral-800">
                          {order.vehicleWeight}
                        </div>
                        <div className="text-md font-medium text-shadow-xs">
                          {order.vehicleType}
                        </div>                      
                      </div> 
                    </TableCell>
                    <TableCell>
                      {order.driverName ? (
                        <div className="flex flex-col">
                          <div className="text-md font-medium">
                            {order.driverName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.driverPhone || "-"}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs px-3 py-1 border-dashed text-muted-foreground">
                          <Link2Off className="h-4 w-4 mr-1" />
                          배차전                      
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-primary font-bold text-md text-shadow-xs">
                      {formatCurrency(order.freightCost || 0)}원
                      {order.estimatedAmount && order.freightCost !== order.estimatedAmount && (
                        <div className="text-xs text-muted-foreground">
                          견적: {formatCurrency(order.estimatedAmount)}원
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                </BrokerOrderContextMenu>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between">
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
      )}
    </div>
  );
} 