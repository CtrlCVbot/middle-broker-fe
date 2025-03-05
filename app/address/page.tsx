"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useState, useEffect } from "react";
import { AddressSearch } from "@/components/address/address-search";
import { AddressTable } from "@/components/address/address-table";
import { AddressDeleteModal } from "@/components/address/address-delete-modal";
import { getAddressesByPage } from "@/utils/mock-data";
import { IAddress, IAddressResponse } from "@/types/address";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AddressPage() {
  // 상태 관리
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [addressesToDelete, setAddressesToDelete] = useState<IAddress[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 한 페이지당 표시할 항목 수
  const ITEMS_PER_PAGE = 10;

  // 주소록 데이터 로드
  const loadAddresses = () => {
    setLoading(true);
    
    // 모킹 데이터 사용 (백엔드 구현 시 API 호출로 대체)
    const response: IAddressResponse = getAddressesByPage(
      currentPage,
      ITEMS_PER_PAGE,
      searchTerm,
      selectedType
    );
    
    setAddresses(response.data);
    setTotalPages(Math.ceil(response.pagination.total / ITEMS_PER_PAGE));
    setLoading(false);
  };

  // 페이지 로드 시 데이터 로드
  useEffect(() => {
    loadAddresses();
  }, [currentPage, searchTerm, selectedType]);

  // 검색 처리
  const handleSearch = (term: string, type?: string) => {
    setSearchTerm(term);
    setSelectedType(type || "");
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 단일 주소 삭제 처리
  const handleDeleteSingle = (address: IAddress) => {
    setAddressesToDelete([address]);
    setIsDeleteModalOpen(true);
  };

  // 선택된 주소 일괄 삭제 처리
  const handleDeleteSelected = (selectedAddresses: IAddress[]) => {
    setAddressesToDelete(selectedAddresses);
    setIsDeleteModalOpen(true);
  };

  // 삭제 확인
  const handleConfirmDelete = () => {
    // 현재는 클라이언트 사이드에서만 처리
    // 백엔드 구현 시 API 호출로 대체
    const addressIdsToDelete = addressesToDelete.map((address) => address.id);
    
    setAddresses((prevAddresses) =>
      prevAddresses.filter((address) => !addressIdsToDelete.includes(address.id))
    );
    
    setAddressesToDelete([]);
    setIsDeleteModalOpen(false);
    
    // 새로운 데이터 로드 (백엔드 구현 시 사용)
    // loadAddresses();
  };

  return (
    <>
        <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">홈</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>주소록</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        
            <Card className="container py-6">
                <CardHeader>
                    <CardTitle>주소록 관리</CardTitle>
                    <CardDescription>상/하차지 주소록을 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddressSearch onSearch={handleSearch} />
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                        <p>데이터를 불러오는 중...</p>
                        </div>
                    ) : (
                        <AddressTable
                        addresses={addresses}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onDeleteSingle={handleDeleteSingle}
                        onDeleteSelected={handleDeleteSelected}
                        />
                    )}
                    
                    <AddressDeleteModal
                        isOpen={isDeleteModalOpen}
                        addresses={addressesToDelete}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                    />
                </CardContent>
            </Card> 
              
        </div>
        
    </>
  );
}