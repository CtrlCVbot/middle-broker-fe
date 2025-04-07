"use client";

import * as React from "react";
import {
  Truck,
  CreditCard,
  Edit,
  Trash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { IBrokerDriver } from "@/types/broker-driver";

interface BrokerDriverContextMenuProps {
  children: React.ReactNode;
  driver: IBrokerDriver;
  onEdit?: (driver: IBrokerDriver) => void;
  onDelete?: (driver: IBrokerDriver) => void;
  onStatusChange?: (driver: IBrokerDriver, newStatus: '활성' | '비활성') => void;
  onViewDispatch?: (driver: IBrokerDriver) => void;
  onViewSettlement?: (driver: IBrokerDriver) => void;
}

export function BrokerDriverContextMenu({
  children,
  driver,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDispatch,
  onViewSettlement,
}: BrokerDriverContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          onClick={() => onViewDispatch?.(driver)}
          className="cursor-pointer"
        >
          <Truck className="mr-2 h-4 w-4" />
          <span>배차 이력 조회</span>
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onViewSettlement?.(driver)}
          className="cursor-pointer"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>정산 내역 조회</span>
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onEdit?.(driver)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>차주 정보 수정</span>
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onStatusChange?.(driver, driver.status === '활성' ? '비활성' : '활성')}
          className="cursor-pointer"
        >
          {driver.status === '활성' ? (
            <ToggleLeft className="mr-2 h-4 w-4" />
          ) : (
            <ToggleRight className="mr-2 h-4 w-4" />
          )}
          <span>{driver.status === '활성' ? '비활성화' : '활성화'}</span>
          <ContextMenuShortcut>⌘T</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => onDelete?.(driver)}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>차주 삭제</span>
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 