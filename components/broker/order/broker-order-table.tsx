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

interface BrokerOrderTableProps {
  orders: IBrokerOrder[];
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
              <TableHead className="w-[80px] ">일정</TableHead>
              <TableHead className="w-[120px] ">시간</TableHead>              
              <TableHead>상차지</TableHead>
              <TableHead>{/* 상차지 하차지 흐름 보여주는 이미지 넣는 컬럼! 지우지 마세요!*/}</TableHead>
              <TableHead>하차지</TableHead>     
              <TableHead>차량</TableHead>
              <TableHead>차주</TableHead>
              <TableHead>콜센터</TableHead>
              <TableHead>업체명</TableHead>
              <TableHead>운송비</TableHead>
              <TableHead>결제방식</TableHead>
              <TableHead>관리자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 화물 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <BrokerOrderContextMenu 
                  key={order.id} 
                  order={order}
                  onStatusChange={onStatusChange}
                  onEditTransportFee={onEditTransportFee}
                  onExportExcel={onExportExcel}
                  onViewMap={onViewMap}
                >                  
                  <TableRow key={order.id} className="cursor-pointer hover:bg-secondary/80" onClick={() => handleOrderClick(order.id)}>
                    <TableCell className="font-medium text-primary underline">{order.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-center scale-90">
                      {getStatusBadge(order.status)}
                      {order.gpsLocation?.status === "상차 지각" || order.gpsLocation?.status === "하차 지각" ? (
                        <Badge variant="destructive" className="ml-1 text-[10px] px-1">지각</Badge>
                      ) : null}
                    </TableCell>
                    {/* <TableCell>
                      <BrokerStatusBadge status={order.status} size="sm" />
                      {order.gpsLocation?.status === "상차 지각" || order.gpsLocation?.status === "하차 지각" ? (
                        <Badge variant="destructive" className="ml-1 text-[10px] px-1">지각</Badge>
                      ) : null}
                    </TableCell> */}
                    <TableCell className="max-w-[150px] truncate" title={order.departureLocation}>
                      {order.departureLocation}
                    </TableCell>
                    <TableCell>{order.departureDateTime}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={order.arrivalLocation}>
                      {order.arrivalLocation}
                    </TableCell>
                    <TableCell>{order.arrivalDateTime}</TableCell>
                    <TableCell>
                      {order.vehicle.type} {order.vehicle.weight}
                    </TableCell>
                    <TableCell>
                      {order.driver.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {order.callCenter}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate" title={`${order.company} (${order.contactPerson})`}>
                      {order.company}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({order.contactPerson})
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {formatCurrency(order.chargeAmount || order.amount)}원
                        </span>
                        {order.chargeAmount !== order.amount && (
                          <span className="text-xs text-muted-foreground">
                            견적: {formatCurrency(order.amount)}원
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate" title={`${order.manager} (${order.managerContact})`}>
                      {order.manager}
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