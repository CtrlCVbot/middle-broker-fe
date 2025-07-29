"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BrokerDriverStatusBadge, 
  BrokerDriverVehicleTypeBadge, 
  BrokerDriverTonnageBadge
} from './broker-driver-status-badge';
import { IBrokerDriver } from '@/types/broker-driver';
import { useBrokerDriverStore } from '@/store/broker-driver-store';
import { cn } from '@/lib/utils';

interface BrokerDriverTableProps {
  drivers: IBrokerDriver[];
  onDriverClick: (driver: IBrokerDriver) => void;
}

export function BrokerDriverTable({ drivers, onDriverClick }: BrokerDriverTableProps) {
  const { 
    selectedDriverIds, 
    toggleDriverSelection, 
    setSelectedDriverIds, 
    clearSelectedDriverIds 
  } = useBrokerDriverStore();
  
  // 모든 차주 선택 상태
  const allSelected = drivers.length > 0 && selectedDriverIds.length === drivers.length;
  //const someSelected = selectedDriverIds.length > 0 && !allSelected;
  
  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (allSelected) {
      clearSelectedDriverIds();
    } else {
      setSelectedDriverIds(drivers.map(driver => driver.id));
    }
  };
  
  // 개별 선택 핸들러
  const handleSelectDriver = (e: React.MouseEvent, driverId: string) => {
    e.stopPropagation();
    toggleDriverSelection(driverId);
  };
  
  // 차량 번호 클릭 핸들러
  const handleVehicleNumberClick = (e: React.MouseEvent, driver: IBrokerDriver) => {
    e.stopPropagation();
    // 차량 상세 정보 팝업 표시 - 실제 구현은 추후 개발
    alert(`${driver.vehicleNumber} 차량 정보: ${driver.vehicleType} ${driver.tonnage}`);
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="전체 선택"
              />
            </TableHead>
            <TableHead className="w-[110px]">차주 코드</TableHead>
            <TableHead>차주명</TableHead>
            <TableHead>연락처</TableHead>
            <TableHead className="w-[120px]">차량번호</TableHead>
            <TableHead className="w-[90px]">차량 종류</TableHead>
            <TableHead className="w-[90px]">톤수</TableHead>
            {/* <TableHead>주소</TableHead> */}
            <TableHead>업체명</TableHead>
            <TableHead>사업자번호</TableHead>
            <TableHead className="w-[90px] text-right">배차 횟수</TableHead>
            <TableHead className="w-[90px]">차주 상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="h-24 text-center">
                등록된 차주가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((driver) => (
              <TableRow 
                key={driver.id}
                onClick={() => onDriverClick(driver)}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  !driver.isActive && "bg-muted/30 text-muted-foreground"
                )}
              >
                <TableCell className="py-2">
                  <Checkbox 
                    checked={selectedDriverIds.includes(driver.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDriverIds([...selectedDriverIds, driver.id]);
                      } else {
                        setSelectedDriverIds(selectedDriverIds.filter(id => id !== driver.id));
                      }
                    }}
                    onClick={(e) => handleSelectDriver(e, driver.id)}
                    aria-label={`${driver.name} 선택`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {driver.code}
                </TableCell>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.phoneNumber}</TableCell>
                <TableCell>
                  <span
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={(e) => handleVehicleNumberClick(e, driver)}
                  >
                    {driver.vehicleNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <BrokerDriverVehicleTypeBadge type={driver.vehicleType} />
                </TableCell>
                <TableCell>
                  <BrokerDriverTonnageBadge tonnage={driver.tonnage} />
                </TableCell>
                {/* <TableCell className="max-w-[200px] truncate">{driver.address}</TableCell> */}
                <TableCell>{driver.companyName}</TableCell>
                <TableCell>{driver.businessNumber}</TableCell>
                <TableCell className="text-right font-medium">
                  <span className={cn(
                    (driver.dispatchCount || 0) >= 50 ? "text-primary font-bold" :
                    (driver.dispatchCount || 0) >= 30 ? "text-blue-600 font-semibold" :
                    (driver.dispatchCount || 0) >= 10 ? "text-blue-500" : ""
                  )}>
                    {driver.dispatchCount || 0}회
                  </span>
                </TableCell>
                <TableCell>
                  <BrokerDriverStatusBadge status={driver.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 