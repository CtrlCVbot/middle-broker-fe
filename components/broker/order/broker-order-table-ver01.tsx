"use client";

import React from "react";
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
} from "lucide-react";
import { IBrokerOrder, BrokerOrderStatusType } from "@/types/broker-order";
import { formatCurrency } from "@/lib/utils";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { BrokerStatusBadge } from "./broker-status-badge";
import { BrokerOrderContextMenu } from "./broker-order-context-menu";
import { Badge } from "@/components/ui/badge";
import { getStatusBadge } from "@/components/order/order-table-ver01";

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
              <TableHead className="w-[80px] ">상차지</TableHead>
              <TableHead className="w-[120px] ">상차일시</TableHead>              
              <TableHead>하차지</TableHead>              
              <TableHead className="w-[120px] ">하차일시</TableHead>
              <TableHead>차량</TableHead>
              <TableHead>차주</TableHead>
              <TableHead>차량번호</TableHead>
              <TableHead>운송비</TableHead>
              <TableHead>메모</TableHead>
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
                    <TableCell className="max-w-[150px] truncate" title={order.pickupAddress}>
                      {order.pickupAddress}
                    </TableCell>
                    <TableCell>{order.pickupDateTime}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={order.deliveryAddress}>
                      {order.deliveryAddress}
                    </TableCell>
                    <TableCell>{order.deliveryDateTime}</TableCell>
                    <TableCell>
                      {order.vehicleType} {order.vehicleWeight}
                    </TableCell>
                    <TableCell>
                      {order.driverName || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {order.assignedVehicleNumber || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {formatCurrency(order.freightCost || 0)}원
                        </span>
                        {order.estimatedAmount && order.freightCost !== order.estimatedAmount && (
                          <span className="text-xs text-muted-foreground">
                            견적: {formatCurrency(order.estimatedAmount)}원
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate" title={order.memo || order.brokerMemo || ''}>
                      {order.memo || order.brokerMemo || "-"}
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