"use client";

import * as React from "react";
import { useState } from "react";
import { 
  Download, 
  Filter, 
  PlusCircle, 
  RefreshCcw, 
  UserPlus, 
  UserRoundPlus 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useBrokerDriverStore } from "@/store/broker-driver-store";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrokerDriverActionButtonsProps {
  isLoading?: boolean;
  onRefresh: () => void;
  onExportExcel: () => void;
  onRegisterDriver: () => void;
  onRegisterMultipleDrivers?: () => void;
  disabledExportExcel?: boolean;
}

export function BrokerDriverActionButtons({
  isLoading = false,
  onRefresh,
  onExportExcel,
  onRegisterDriver,
  onRegisterMultipleDrivers,
  disabledExportExcel = false
}: BrokerDriverActionButtonsProps) {
  const { selectedDriverIds } = useBrokerDriverStore();
  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 핸들러
  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  // 데스크톱 UI
  const DesktopActions = () => (
    <div className="hidden sm:flex items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={handleRefresh}
        disabled={isLoading || refreshing}
      >
        <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
        새로고침
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={onExportExcel}
        disabled={isLoading || disabledExportExcel}
      >
        <Download className="h-4 w-4 mr-2" />
        엑셀 다운로드
        {selectedDriverIds.length > 0 && (
          <Badge variant="secondary" className="ml-2 bg-primary/10">
            {selectedDriverIds.length}명 선택됨
          </Badge>
        )}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-9"
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            차주 등록
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>차주 등록 방식</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onRegisterDriver}>
              <UserPlus className="h-4 w-4 mr-2" />
              개별 차주 등록
            </DropdownMenuItem>
            {onRegisterMultipleDrivers && (
              <DropdownMenuItem onClick={onRegisterMultipleDrivers}>
                <UserRoundPlus className="h-4 w-4 mr-2" />
                다중 차주 등록
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // 모바일 UI
  const MobileActions = () => (
    <div className="flex sm:hidden items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={isLoading}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>차주 관리</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleRefresh} disabled={refreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              새로고침
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onExportExcel}
              disabled={disabledExportExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
              {selectedDriverIds.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedDriverIds.length}
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>차주 등록</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onRegisterDriver}>
              <UserPlus className="h-4 w-4 mr-2" />
              개별 차주 등록
            </DropdownMenuItem>
            {onRegisterMultipleDrivers && (
              <DropdownMenuItem onClick={onRegisterMultipleDrivers}>
                <UserRoundPlus className="h-4 w-4 mr-2" />
                다중 차주 등록
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-[100px]" />
        <Skeleton className="h-9 w-[150px]" />
        <Skeleton className="h-9 w-[100px]" />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <DesktopActions />
      <MobileActions />
    </div>
  );
} 