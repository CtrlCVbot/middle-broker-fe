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
import { useToast } from "@/components/ui/use-toast";
import { AddressSearch } from "@/components/address/address-search";
import { AddressTable } from "@/components/address/address-table";
import { AddressDeleteModal } from "@/components/address/address-delete-modal";
import { AddressFormSheet } from "@/components/address/address-form-sheet";
// import { getAddressesByPage } from "@/utils/mock-data"; // 모킹 데이터 대신 API 사용
import { IAddress } from "@/types/address";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useAddressStore from "@/store/address-store";

export default function AddressPage() {
  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    addresses,
    totalItems,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    editAddress,
    removeAddress,
    batchRemoveAddresses,
    setCurrentPage,
    setSearchTerm,
    setSelectedType,
  } = useAddressStore();
  
  // 토스트 컴포넌트
  const { toast } = useToast();
  
  // 로컬 상태
  const [addressesToDelete, setAddressesToDelete] = useState<IAddress[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isFormSheetOpen, setIsFormSheetOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | undefined>(undefined);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  
  // 에러 발생 시 토스트 표시
  useEffect(() => {
    if (error) {
      toast({
        title: "오류 발생",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // 검색 처리
  const handleSearch = (term: string, type?: string) => {
    setSearchTerm(term);
    setSelectedType(type || "");
    fetchAddresses({
      page: 1, 
      search: term, 
      type: type as any 
    });
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAddresses({ page });
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
  const handleConfirmDelete = async () => {
    try {
      if (addressesToDelete.length === 1) {
        // 단일 삭제
        await removeAddress(addressesToDelete[0].id);
        toast({
          title: "삭제 완료",
          description: "주소가 성공적으로 삭제되었습니다.",
        });
      } else {
        // 다중 삭제
        const ids = addressesToDelete.map((addr) => addr.id);
        await batchRemoveAddresses(ids);
        toast({
          title: "일괄 삭제 완료",
          description: `${ids.length}개의 주소가 성공적으로 삭제되었습니다.`,
        });
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "주소 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setAddressesToDelete([]);
    }
  };

  // 주소 등록/수정 폼 열기
  const handleOpenFormSheet = (address?: IAddress) => {
    setEditingAddress(address);
    setIsFormSheetOpen(true);
  };

  // 주소 등록/수정 제출 처리
  const handleFormSubmit = async (data: Omit<IAddress, "id" | "createdAt" | "updatedAt" | "isFrequent" | "createdBy" | "updatedBy">) => {
    try {
      if (editingAddress) {
        // 주소 수정
        await editAddress(editingAddress.id, { 
          ...data, 
          isFrequent: editingAddress.isFrequent 
        });
        toast({
          title: "수정 완료",
          description: "주소가 성공적으로 수정되었습니다.",
        });
      } else {
        // 주소 추가
        await addAddress(data);
        toast({
          title: "등록 완료",
          description: "새 주소가 성공적으로 등록되었습니다.",
        });
      }
      
      setIsFormSheetOpen(false);
      setEditingAddress(undefined);
    } catch (error) {
      toast({
        title: editingAddress ? "수정 실패" : "등록 실패",
        description: error instanceof Error ? error.message : "주소 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
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
        
            <Card>
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
                    
                    {isLoading && addresses.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                        <p>데이터를 불러오는 중...</p>
                        </div>
                    ) : (
                        <AddressTable
                        addresses={addresses}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
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