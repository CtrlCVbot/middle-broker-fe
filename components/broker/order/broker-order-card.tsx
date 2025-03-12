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

interface BrokerOrderCardProps {
  orders: IBrokerOrder[];
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
                key={order.id}
                order={order}
                onStatusChange={onStatusChange}
                onEditTransportFee={onEditTransportFee}
                onExportExcel={onExportExcel}
                onViewMap={onViewMap}
              >
                <Card
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base text-primary underline">
                        {order.id}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <BrokerStatusBadge status={order.status} size="sm" />
                        {order.gpsLocation?.status === "상차 지각" || order.gpsLocation?.status === "하차 지각" ? (
                          <Badge variant="destructive" className="text-[10px] px-1">지각</Badge>
                        ) : null}
                      </div>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>등록일: {order.createdAt}</span>
                      <Badge variant="outline" className="font-normal">
                        {order.callCenter}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">출발지</div>
                        <div className="truncate font-medium" title={order.departureLocation}>
                          {order.departureLocation}
                        </div>
                        <div className="text-xs">{order.departureDateTime}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">도착지</div>
                        <div className="truncate font-medium" title={order.arrivalLocation}>
                          {order.arrivalLocation}
                        </div>
                        <div className="text-xs">{order.arrivalDateTime}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">차량</div>
                        <div className="font-medium">
                          {order.vehicle.type} {order.vehicle.weight}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">차주</div>
                        <div className="font-medium">{order.driver.name || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">업체</div>
                        <div className="truncate font-medium" title={`${order.company} (${order.contactPerson})`}>
                          {order.company}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.contactPerson}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">품목</div>
                        <div className="truncate font-medium" title={order.cargoItem}>
                          {order.cargoItem}
                        </div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {order.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 justify-between">
                    <div className="text-xs text-muted-foreground">
                      담당: {order.manager}
                    </div>
                    <div className="font-medium">
                      {formatCurrency(order.chargeAmount || order.amount)}원
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