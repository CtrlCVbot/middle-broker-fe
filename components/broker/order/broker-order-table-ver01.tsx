"use client";

//react
import React from "react";

//ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsRight as ArrowRight,
  Link2Off,
  Truck,
  PackageCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

//types
import { IBrokerOrder, BrokerOrderStatusType } from "@/types/broker-order";
import { IOrderCharge } from "@/types/order-with-dispatch";

//store
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";

//component
import { BrokerStatusBadge } from "./broker-status-badge";
import { BrokerOrderContextMenu } from "./broker-order-context-menu";
import { getStatusBadge } from "@/components/order/order-table-ver01";

//utils
import { format} from "date-fns";
import { ko } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useBrokerOrderStore } from "@/store/broker-order-store";
import { cn } from "@/lib/utils";
import { ICompanySnapshot } from "@/types/order";

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
  pickupLocation?: string;
  pickupAddress: string;
  pickupDateTime: string;
  deliveryLocation?: string;
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
  isClosed?: boolean;
  // 추가 필드가 있을 수 있음
  charge?: IOrderCharge;
  companySnapshot?: ICompanySnapshot;
  companyId?: string;
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
  onAcceptOrder?: (orderId: string) => void;
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
  onAcceptOrder,
}: BrokerOrderTableProps) {
  // 상세 정보 모달을 위한 스토어 액세스
  const { openSheet } = useBrokerOrderDetailStore();
  
  // 다중 선택을 위한 스토어 액세스
  const { 
    activeTab, 
    selectedOrders, 
    toggleOrderSelection, 
    selectAllOrders, 
    deselectAllOrders 
  } = useBrokerOrderStore();
  
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
  
  console.log("orders 최종-->", orders);
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              {activeTab === 'waiting' && (
                <TableHead className="w-[25px]">
              <Checkbox
                    checked={orders.length > 0 && selectedOrders.length === orders.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllOrders(orders.map(order => order.orderId));
                      } else {
                        deselectAllOrders();
                      }
                    }}
                  />
                </TableHead>
              )}
              {/* <TableHead className="w-[80px] text-center">ID</TableHead> */}
              
              <TableHead className="w-[80px] text-center">상태</TableHead>
              <TableHead className="w-[80px] text-center">화주</TableHead>
              <TableHead className="w-[80px]">일정</TableHead>
              <TableHead className="w-[120px]">시간</TableHead>              
              <TableHead>상차지</TableHead>
              <TableHead className="w-[10px]">{/* 상차지 하차지 흐름 표시 */}</TableHead>
              <TableHead>하차지</TableHead>              
              <TableHead>품목</TableHead>              
              <TableHead className="w-[80px]">차량</TableHead>
              {activeTab != 'waiting' && (
                <>
                  <TableHead>기사</TableHead>
                  <TableHead className="text-center">운송비</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader> 
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={activeTab === 'waiting' ? 12 : 11}
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
                  onAcceptOrder={onAcceptOrder}
                >
                  <TableRow 
                    className={cn(
                      "cursor-pointer hover:bg-primary/10",
                      activeTab === 'waiting' && selectedOrders.includes(order.orderId) && "bg-primary/10",
                      order.isClosed && "bg-muted-foreground/5 text-muted-foreground"
                    )}
                    onClick={() => activeTab === 'waiting' ? toggleOrderSelection(order.orderId) : handleOrderClick(order.orderId)}
                  >
                    {activeTab === 'waiting' && (
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.orderId)}
                          onCheckedChange={() => toggleOrderSelection(order.orderId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {/* <TableCell className="text-center font-medium">
                      #{order.orderId.slice(0, 8)}
                    </TableCell> */}
                    <TableCell className="text-center">
                      {order.isClosed ? (
                        <Badge variant="default" className="text-xs px-3 py-1 border-dashed text-muted-foreground bg-gray-200">
                          <PackageCheck className="h-4 w-4 mr-1" />
                          마감
                        </Badge>
                      ) : (
                        getStatusBadge(order.flowStatus as BrokerOrderStatusType) 
                      )}
                    </TableCell>     
                    <TableCell className="text-left font-medium">
                      {order.companySnapshot?.name || "-"}
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
                          {order.pickupLocation || order.pickupAddress.split(' ')[0] || ""}
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
                          {order.deliveryLocation || order.deliveryAddress.split(' ')[0] || ""}
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
                        <div className="text-md font-bold">
                          {order.vehicleWeight}
                        </div>
                        <div className="text-md font-medium text-shadow-xs">
                          {order.vehicleType}
                        </div>                      
                      </div> 
                    </TableCell>
                    {activeTab != 'waiting' && (
                      <>
                      <TableCell>
                        {order.assignedVehicleNumber ? (
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
                      <TableCell className="text-right font-medium">
                        {order.charge?.summary?.salesAmount ? (
                          <div className="flex flex-col">
                            <div className="flex flex-row items-baseline gap-x-1">
                              <span className="text-muted-foreground text-xs">청구:</span>
                              <span className="text-blue-500 text-base">
                                {formatCurrency(order.charge?.summary?.salesAmount)}원
                              </span>
                            </div>
                            {order.charge?.summary?.purchaseAmount && (
                              <div className="flex flex-row items-baseline gap-x-1">
                                <span className="text-muted-foreground text-xs">배차:</span>
                                <span className="text-pink-500 text-md">
                                  {formatCurrency(order.charge?.summary?.purchaseAmount)}원
                                </span>
                              </div>
                            )}                                                      
                          </div>                          
                        ) : (
                          <span className="text-muted-foreground">협의중...</span>
                        )}
                      </TableCell>
                      </>
                    )}
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