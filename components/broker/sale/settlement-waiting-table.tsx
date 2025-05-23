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
  SquareCheckBig,
  Ban,
} from "lucide-react";
import { IBrokerOrder } from "@/types/broker-order";
import { formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { BrokerStatusBadge } from "@/components/broker/order/broker-status-badge";
import { Badge } from "@/components/ui/badge";
import { getTime } from "@/components/order/order-table-ver01";
import { getSchedule } from "@/components/order/order-table-ver01";

interface IWaitingTableProps {
  orders: IBrokerOrder[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedOrders: string[];
  onOrderSelect: (orderId: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
}

export function WaitingTable({
  orders,
  currentPage,
  totalPages,
  onPageChange,
  selectedOrders,
  onOrderSelect,
  onSelectAll,
}: IWaitingTableProps) {
  // 전체 선택 상태 관리
  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const isPartiallySelected = selectedOrders.length > 0 && selectedOrders.length < orders.length;
  
  // 행 선택 처리
  const handleRowSelect = (orderId: string) => {
    const isSelected = selectedOrders.includes(orderId);
    onOrderSelect(orderId, !isSelected);
  };
  
  // 전체 선택 처리
  const handleSelectAll = () => {
    onSelectAll(!isAllSelected);
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
            <TableRow className="bg-slate-50">
              <TableHead className="w-[50px] text-center">
                <Checkbox 
                  checked={isAllSelected}
                  className={isPartiallySelected ? "opacity-80" : ""}
                  onCheckedChange={handleSelectAll}
                  aria-label="전체 선택"
                />
              </TableHead>
              <TableHead>업체명</TableHead>
              <TableHead className="w-[80px] text-center">ID</TableHead>
              <TableHead className="text-center">상태</TableHead>             
              <TableHead className="w-[80px] ">일정</TableHead>
              <TableHead className="w-[120px] ">시간</TableHead>              
              <TableHead>상차지</TableHead>
              <TableHead>{/* 상차지 하차지 흐름 보여주는 이미지 넣는 컬럼! 지우지 마세요!*/}</TableHead>
              <TableHead>하차지</TableHead>         
              <TableHead>차량</TableHead>
              <TableHead>차주</TableHead>              
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
                  정산 대기 중인 화물이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className={`cursor-pointer hover:bg-secondary/20 ${selectedOrders.includes(order.id) ? 'bg-secondary/30' : ''}`}
                  onClick={() => handleRowSelect(order.id)}
                >
                  
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => {
                        onOrderSelect(order.id, !!checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`${order.id} 선택`}
                    />
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate" title={`${order.company}`}>
                    {order.company}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {/* <BrokerStatusBadge status={order.status} size="sm" />                     */}
                    {order.status ? <SquareCheckBig className="h-4 w-4 mr-1 text-purple-700" /> : <Ban className="h-4 w-4 mr-1 text-red-700" />}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getSchedule(order.departureDateTime, order.departureDateTime, order.arrivalDateTime, order.departureDateTime)}
                    
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {getTime(order.departureDateTime, order.departureDateTime, order.arrivalDateTime, order.departureDateTime)}
                  </TableCell>

                  <TableCell className="max-w-[100px] truncate" title={order.departureLocation}>
                    <div className="flex flex-col">
                      <div className="text-md font-medium text-shadow-xs">
                        {order.departureLocation}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.departureLocation}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><ChevronsRight className="h-5 w-5 text-muted-foreground" /></TableCell>
                  <TableCell className="max-w-[100px] truncate" title={order.arrivalLocation}>
                    <div className="flex flex-col">
                      <div className="text-md font-medium text-shadow-xs">
                        {order.arrivalLocation}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.arrivalLocation}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="text-md font-bold text-neutral-800">
                        {order.vehicle.type}
                      </div>
                      <div className="text-md font-medium text-shadow-xs">
                        {order.vehicle.weight}
                      </div>                      
                    </div> 
                  </TableCell>              
                  
                  <TableCell>
                    {order.driver.name || "-"}
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
                  <TableCell className="max-w-[100px] truncate" title={`${order.manager}`}>
                    {order.manager}
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