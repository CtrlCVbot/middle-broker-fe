"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

// 타입
import { ISettlementWaitingItem, ISalesBundleItemWithDetails } from "@/types/broker-charge";

// 스토어
import { useBrokerChargeStore } from "@/store/broker-charge-store";

// 유틸
import { formatCurrency } from "@/lib/utils";
import { getSchedule } from "@/components/order/order-table-ver01";

interface IFreightListTableProps {
  mode: 'waiting' | 'reconciliation';
  orders?: ISettlementWaitingItem[];
  bundleId?: string;
  onAddItemAdjustment?: (itemId: string) => void;
  onEditItemAdjustment?: (itemId: string, adjustmentId: string) => void;
  onDeleteItemAdjustment?: (itemId: string, adjustmentId: string) => void;
}

export function FreightListTable({
  mode,
  orders = [],
  bundleId,
  onAddItemAdjustment,
  onEditItemAdjustment,
  onDeleteItemAdjustment
}: IFreightListTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    bundleFreightList,
    adjustmentsLoading,
    adjustmentsError,
    fetchBundleFreightList,
    itemAdjustments
  } = useBrokerChargeStore();

  // 정산 대사 모드에서 화물 목록 로딩
  useEffect(() => {
    if (mode === 'reconciliation' && bundleId) {
      fetchBundleFreightList(bundleId);
    }
  }, [mode, bundleId, fetchBundleFreightList]);

  // 표시할 데이터 결정
  const displayData = mode === 'waiting' ? orders : bundleFreightList;
  const itemCount = displayData.length;

  // 디버깅: bundleFreightList 변경 감지
  useEffect(() => {
    if (mode === 'reconciliation') {
      console.log('FreightListTable - bundleFreightList 변경됨:', {
        bundleId,
        itemCount: bundleFreightList.length,
        bundleFreightList: bundleFreightList.map(item => ({
          id: item.id,
          adjustmentsCount: item.adjustments?.length || 0
        }))
      });
    }
  }, [bundleFreightList, mode, bundleId]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md mt-4">
      <div className="flex items-center justify-between p-2 bg-muted/50">
        <h3 className="text-sm font-semibold">
          {mode === 'waiting' ? `선택된 화물` : `정산 화물`} ({itemCount}개)
        </h3>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('화물 목록 토글 버튼 클릭');
            }}
          >
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            <span className="sr-only">토글 화물 목록</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <ScrollArea className="h-64 rounded-b-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-xs">번호</TableHead>
                <TableHead className="text-xs">업체</TableHead>
                <TableHead className="text-xs">일정</TableHead>
                <TableHead className="text-xs">출발지</TableHead>
                <TableHead className="text-xs">도착지</TableHead>
                <TableHead className="text-right text-xs">주선료</TableHead>
                <TableHead className="text-right text-xs">세금</TableHead>
                {mode === 'reconciliation' && (
                  <TableHead className="text-center text-xs">개별 추가금</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustmentsLoading ? (
                <TableRow>
                  <TableCell colSpan={mode === 'reconciliation' ? 8 : 7} className="h-16 text-center text-xs">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : displayData.length > 0 ? (
                displayData.map((item, index) => {
                  // 정산 대기 모드와 정산 대사 모드의 데이터 구조가 다름
                  let displayItem;
                  let itemAdjustmentList: any[] = [];
                  
                  if (mode === 'waiting') {
                    // ISettlementWaitingItem 구조
                    const waitingItem = item as ISettlementWaitingItem;
                    displayItem = {
                      id: waitingItem.id,
                      companyName: waitingItem.companyName,
                      pickupName: waitingItem.pickupName,
                      deliveryName: waitingItem.deliveryName,
                      pickupDate: waitingItem.pickupDate,
                      deliveryDate: waitingItem.deliveryDate,
                      amount: waitingItem.chargeAmount
                    };
                  } else {
                    // ISalesBundleItemWithDetails 구조
                    const freightItem = item as ISalesBundleItemWithDetails;
                    displayItem = {
                      id: freightItem.id,
                      companyName: freightItem.orderDetails.companyName,
                      pickupName: freightItem.orderDetails.pickupName,
                      deliveryName: freightItem.orderDetails.deliveryName,
                      pickupDate: freightItem.orderDetails.pickupDate,
                      deliveryDate: freightItem.orderDetails.deliveryDate,
                      amount: freightItem.orderDetails.amount
                    };
                    itemAdjustmentList = freightItem.adjustments || [];
                  }
                  
                  return (
                    <TableRow key={displayItem.id}>
                      <TableCell className="text-xs">{index + 1}</TableCell>
                      <TableCell className="text-xs">{displayItem.companyName}</TableCell>
                      <TableCell className="text-xs">
                        {getSchedule(
                          displayItem.pickupDate, 
                          displayItem.deliveryDate, 
                          displayItem.pickupDate, 
                          displayItem.deliveryDate
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{displayItem.pickupName}</TableCell>
                      <TableCell className="text-xs">{displayItem.deliveryName}</TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(displayItem.amount || 0)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency((displayItem.amount || 0) * 0.1)}
                      </TableCell>
                      
                      {mode === 'reconciliation' && (
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1">
                            {itemAdjustmentList.length > 0 ? (
                              <>
                                {itemAdjustmentList.map((adj) => (
                                  <div key={adj.id} className="flex items-center gap-1">
                                    <Badge 
                                      variant={adj.type === 'surcharge' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {adj.type === 'surcharge' ? '추가' : '할인'}: {formatCurrency(adj.amount)}
                                    </Badge>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log('개별 추가금 수정 버튼 클릭:', displayItem.id, adj.id);
                                          onEditItemAdjustment?.(displayItem.id, adj.id);
                                        }}
                                      >
                                        <Edit className="h-2 w-2" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-destructive"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log('개별 추가금 삭제 버튼 클릭:', displayItem.id, adj.id);
                                          onDeleteItemAdjustment?.(displayItem.id, adj.id);
                                        }}
                                      >
                                        <Trash2 className="h-2 w-2" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('개별 추가금 추가 버튼 클릭 (기존 있음):', displayItem.id);
                                    onAddItemAdjustment?.(displayItem.id);
                                  }}
                                >
                                  <Plus className="h-2 w-2 mr-1" />
                                  추가
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('개별 추가금 추가 버튼 클릭 (새로 추가):', displayItem.id);
                                  onAddItemAdjustment?.(displayItem.id);
                                }}
                              >
                                <Plus className="h-2 w-2 mr-1" />
                                추가
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={mode === 'reconciliation' ? 8 : 7} className="h-16 text-center text-xs">
                    {mode === 'waiting' ? '선택된 화물이 없습니다.' : '등록된 화물이 없습니다.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
} 