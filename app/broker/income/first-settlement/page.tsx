"use client";

import React, { useEffect } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIncomeWaitingStore } from "@/store/income-waiting-store";
import { IncomeWaitingTable } from "@/components/broker/income/income-waiting-table";
import { IncomeWaitingSearch } from "@/components/broker/income/income-waiting-search";

export default function FirstSettlementPage() {
  const {
    filter,
    filterOptions,
    currentPage,
    totalPages,
    isLoading,
    selectedOrderIds,
    fetchWaitingOrders,
    getOrdersByPage,
    setFilter,
    setCurrentPage,
    selectOrder,
    selectAllOrders,
    createIncome,
  } = useIncomeWaitingStore();

  // 최초 로드 시 데이터 가져오기
  useEffect(() => {
    fetchWaitingOrders();
  }, [fetchWaitingOrders]);

  // 현재 페이지의 주문 목록
  const currentPageOrders = getOrdersByPage(currentPage);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">정산 대기 화물</h1>
          <p className="text-muted-foreground">
            운송이 완료된 화물 중 정산 대기 상태인 화물을 확인하고 정산 항목으로 등록할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={createIncome}
            disabled={selectedOrderIds.length === 0}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            선택한 화물 정산하기 ({selectedOrderIds.length})
          </Button>
        </div>
      </div>

      {/* 검색 필터 */}
      <IncomeWaitingSearch
        filter={filter}
        setFilter={setFilter}
        filterOptions={filterOptions}
      />
      
      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      ) : (
        <IncomeWaitingTable
          orders={currentPageOrders}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          selectedOrders={selectedOrderIds}
          onOrderSelect={selectOrder}
          onSelectAll={selectAllOrders}
        />
      )}
    </div>
  );
} 