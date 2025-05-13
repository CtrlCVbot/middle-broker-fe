"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { IBrokerOrder, BrokerOrderStatusType, BROKER_ORDER_STATUS } from "@/types/broker-order";
import { FileText, Truck, DollarSign, AlertCircle, Map, Download, ThumbsUp } from "lucide-react";
import { useBrokerOrderStore } from "@/store/broker-order-store";

interface BrokerOrderContextMenuProps {
  children: React.ReactNode;
  order: IBrokerOrder;
  onStatusChange?: (orderId: string, newStatus: BrokerOrderStatusType) => void;
  onEditTransportFee?: (orderId: string) => void;
  onExportExcel?: (orderId: string) => void;
  onViewMap?: (orderId: string) => void;
  onAcceptOrder?: (orderId: string) => void;
}

export function BrokerOrderContextMenu({
  children,
  order,
  onStatusChange,
  onEditTransportFee,
  onExportExcel,
  onViewMap,
  onAcceptOrder,
}: BrokerOrderContextMenuProps) {
  const { openSheet } = useBrokerOrderDetailStore();
  const { activeTab } = useBrokerOrderStore();

  // 화물 상세 정보 열기
  const handleViewDetail = () => {
    openSheet(order.id);
  };

  // 배차 상태 변경
  const handleStatusChange = (status: BrokerOrderStatusType) => {
    if (onStatusChange) {
      onStatusChange(order.id, status);
    }
  };

  // 운송비 정보 수정
  const handleEditTransportFee = () => {
    if (onEditTransportFee) {
      onEditTransportFee(order.id);
    }
  };

  // 엑셀 내보내기
  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel(order.id);
    }
  };

  // 실시간 위치 확인
  const handleViewMap = () => {
    if (onViewMap) {
      onViewMap(order.id);
    }
  };
  
  // 운송 수락
  const handleAcceptOrder = () => {
    if (onAcceptOrder) {
      onAcceptOrder(order.id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleViewDetail}>
          <FileText className="mr-2 h-4 w-4" />
          <span>화물 상세 정보</span>
        </ContextMenuItem>

        <ContextMenuSeparator />
        
        {activeTab === 'waiting' && (
          <ContextMenuItem onClick={handleAcceptOrder}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            <span>운송 수락</span>
          </ContextMenuItem>
        )}

        {activeTab === 'dispatched' && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Truck className="mr-2 h-4 w-4" />
              <span>배차 상태 변경</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {BROKER_ORDER_STATUS.map((status) => (
                <ContextMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status as BrokerOrderStatusType)}
                  disabled={order.status === status}
                  className={order.status === status ? "font-bold bg-secondary/50" : ""}
                >
                  {status}
                  {order.status === status && (
                    <ContextMenuShortcut>✓</ContextMenuShortcut>
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        <ContextMenuItem onClick={handleEditTransportFee}>
          <DollarSign className="mr-2 h-4 w-4" />
          <span>운송비 정보 수정</span>
        </ContextMenuItem>

        {order.gpsLocation && (
          <ContextMenuItem onClick={handleViewMap}>
            <Map className="mr-2 h-4 w-4" />
            <span>실시간 위치 확인</span>
            {order.gpsLocation.status === "상차 지각" || order.gpsLocation.status === "하차 지각" ? (
              <AlertCircle className="ml-auto h-4 w-4 text-destructive" />
            ) : (
              <ContextMenuShortcut>GPS</ContextMenuShortcut>
            )}
          </ContextMenuItem>
        )}

        {/* <ContextMenuSeparator />

        <ContextMenuItem onClick={handleExportExcel}>
          <Download className="mr-2 h-4 w-4" />
          <span>엑셀 다운로드</span>
        </ContextMenuItem> */}
      </ContextMenuContent>
    </ContextMenu>
  );
} 