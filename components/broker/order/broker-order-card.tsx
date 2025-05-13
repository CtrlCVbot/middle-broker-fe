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

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="py-12 text-center text-lg text-muted-foreground">
          표시할 중개 화물 정보가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  fee: 0, // 수수료 정보는 계산이 필요할 수 있음
                  cargoItem: order.cargoName,
                  createdAt: order.dispatchDate || "",
                } as IBrokerOrder}
                onStatusChange={onStatusChange}
                onEditTransportFee={onEditTransportFee}
                onExportExcel={onExportExcel}
                onViewMap={onViewMap}
              >
                <Card
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => handleOrderClick(order.orderId)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base text-primary underline">
                        {order.orderId.slice(0, 8)}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <BrokerStatusBadge status={order.flowStatus as BrokerOrderStatusType} size="sm" />
                      </div>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>등록일: {order.dispatchDate || "N/A"}</span>
                      <Badge variant="outline" className="font-normal">
                        {order.assignedVehicleNumber || "차량 미지정"}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">출발지</div>
                        <div className="truncate font-medium" title={order.pickupAddress}>
                          {order.pickupAddress}
                        </div>
                        <div className="text-xs">{order.pickupDateTime}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">도착지</div>
                        <div className="truncate font-medium" title={order.deliveryAddress}>
                          {order.deliveryAddress}
                        </div>
                        <div className="text-xs">{order.deliveryDateTime}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">차량</div>
                        <div className="font-medium">
                          {order.vehicleType} {order.vehicleWeight}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">차주</div>
                        <div className="font-medium">{order.driverName || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">화물명</div>
                        <div className="truncate font-medium" title={order.cargoName}>
                          {order.cargoName || "미지정"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">메모</div>
                        <div className="truncate font-medium" title={order.memo || order.brokerMemo || ""}>
                          {order.memo || order.brokerMemo || "-"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 justify-between">
                    <div className="text-xs text-muted-foreground">
                      운송비
                    </div>
                    <div className="font-medium">
                      {formatCurrency(order.freightCost || 0)}원
                      {order.estimatedAmount && order.estimatedAmount !== order.freightCost && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (견적: {formatCurrency(order.estimatedAmount)}원)
                        </span>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </BrokerOrderContextMenu>
            ))}
          </div>

          {/* 페이지네이션 */}
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
        </>
      )}
    </div>
  );
} 