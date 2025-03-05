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
import { AddressFormSheet } from "@/components/address/address-form-sheet";
import { getAddressesByPage } from "@/utils/mock-data";
import { IAddress, IAddressResponse } from "@/types/address";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [isFormSheetOpen, setIsFormSheetOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | undefined>(undefined);
  
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
    loadAddresses(); // 모든 주소를 다시 로드
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

  // 주소 등록/수정 폼 열기
  const handleOpenFormSheet = (address?: IAddress) => {
    console.log("handleOpenFormSheet called with address:", address);
    setEditingAddress(address);
    setIsFormSheetOpen(true);
  };

  // 주소 등록/수정 제출 처리
  const handleFormSubmit = (data: Omit<IAddress, "id">) => {
    console.log("handleFormSubmit called with data:", data, "editingAddress:", editingAddress);
    // 백엔드 구현 시 API 호출로 대체
    if (editingAddress) {
      setAddresses((prevAddresses) =>
        prevAddresses.map((address) =>
          address.id === editingAddress.id ? { ...address, ...data } : address
        )
      );
    } else {
      setAddresses((prevAddresses) => [...prevAddresses, { id: Date.now(), ...data }]);
    }
    
    setIsFormSheetOpen(false);
    setEditingAddress(undefined);
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>주소록 관리</CardTitle>
                        <CardDescription>상/하차지 주소록을 관리합니다.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenFormSheet()}>
                        주소 등록
                    </Button>
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
                        onEdit={handleOpenFormSheet}
                        />
                    )}
                    
                    <AddressDeleteModal
                        isOpen={isDeleteModalOpen}
                        addresses={addressesToDelete}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                    />
                    
                    <AddressFormSheet
                        isOpen={isFormSheetOpen}
                        onClose={() => {
                            setIsFormSheetOpen(false);
                            setEditingAddress(undefined);
                        }}
                        onSubmit={handleFormSubmit}
                        defaultValues={editingAddress}
                        title={editingAddress ? "주소 수정" : "주소 등록"}
                    />
                </CardContent>
            </Card> 
              
        </div>
        
    </>
  );
}