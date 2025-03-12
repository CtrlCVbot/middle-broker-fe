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
import { IBrokerOrder } from "@/types/broker-order";
import { formatCurrency } from "@/lib/utils";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { BrokerStatusBadge } from "./broker-status-badge";

interface BrokerOrderTableProps {
  orders: IBrokerOrder[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BrokerOrderTable({
  orders,
  currentPage,
  totalPages,
  onPageChange,
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">화물 ID</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>출발지</TableHead>
              <TableHead>출발 일시</TableHead>
              <TableHead>도착지</TableHead>
              <TableHead>도착 일시</TableHead>
              <TableHead>차량</TableHead>
              <TableHead>차주</TableHead>
              <TableHead className="text-right">운송비</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  표시할 중개 화물 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-secondary/20" onClick={() => handleOrderClick(order.id)}>
                  <TableCell className="font-medium text-primary underline">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <BrokerStatusBadge status={order.status} size="sm" />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={order.departureLocation}>
                    {order.departureLocation}
                  </TableCell>
                  <TableCell>{order.departureDateTime}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={order.arrivalLocation}>
                    {order.arrivalLocation}
                  </TableCell>
                  <TableCell>{order.arrivalDateTime}</TableCell>
                  <TableCell>
                    {order.vehicle.type} {order.vehicle.weight}
                  </TableCell>
                  <TableCell>
                    {order.driver.name || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.amount)}원
                  </TableCell>
                </TableRow>
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