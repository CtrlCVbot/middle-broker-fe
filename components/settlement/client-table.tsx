"use client";

import { useState, useEffect } from "react";
import { SettlementTable } from "@/components/settlement/table";
import { useSettlementStore } from "@/store/settlement-store";

export function ClientSettlementTable() {
  const { settlements, loading, fetchSettlements } = useSettlementStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 페이지 로드 시 정산 목록 조회
  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);
  
  // 현재 페이지에 해당하는 정산 목록
  const paginatedSettlements = settlements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // 총 페이지 수
  const totalPages = Math.ceil(settlements.length / itemsPerPage);
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 로딩 상태
  if (loading.list) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>정산 내역을 불러오는 중입니다...</p>
      </div>
    );
  }
  
  return (
    <SettlementTable
      settlements={paginatedSettlements}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
} 