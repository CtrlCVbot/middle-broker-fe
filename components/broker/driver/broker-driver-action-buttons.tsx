"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Plus,
  RefreshCcw,
  MoreHorizontal,
  Upload,
} from "lucide-react";

import { BrokerDriverRegisterSheetNew } from "./broker-driver-register-sheet-new";

interface IBrokerDriverActionButtonsProps {
  isLoading?: boolean;
  onRefresh?: () => void;
  onExportExcel?: () => void;
  onRegisterDriver?: () => void;
  onRegisterMultipleDrivers?: () => void;
  disabledExportExcel?: boolean;
}

export function BrokerDriverActionButtons({
  isLoading = false,
  onRefresh,
  onExportExcel,
  //onRegisterDriver,
  onRegisterMultipleDrivers,
  disabledExportExcel = false,
}: IBrokerDriverActionButtonsProps) {
  const [isRegisterSheetOpen, setIsRegisterSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 핸들러
  const handleRefresh = () => {
    if (onRefresh) {
      setRefreshing(true);
      onRefresh();
      setTimeout(() => setRefreshing(false), 500);
    }
  };
  
  // 차주 등록 성공 핸들러
  const handleRegisterSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // 데스크톱 UI
  const DesktopActions = () => {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          새로고침
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          disabled={isLoading || disabledExportExcel}
        >
          <Download className="h-4 w-4 mr-2" />
          엑셀
        </Button>

        {/* 차주 등록 시트 */}
        <BrokerDriverRegisterSheetNew
          open={isRegisterSheetOpen}
          onOpenChange={setIsRegisterSheetOpen}
          onRegisterSuccess={handleRegisterSuccess}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRegisterMultipleDrivers}>
              <Upload className="h-4 w-4 mr-2" />
              다중 차주 등록
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportExcel} disabled={disabledExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              엑셀 다운로드
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // 모바일 UI
  const MobileActions = () => {
    return (
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              disabled={isLoading}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                새로고침
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRegisterMultipleDrivers}>
                <Upload className="h-4 w-4 mr-2" />
                다중 차주 등록
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onExportExcel}
                disabled={disabledExportExcel}
              >
                <Download className="h-4 w-4 mr-2" />
                엑셀 다운로드
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div>
      <DesktopActions />
      <MobileActions />
      
      
    </div>
  );
} 