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

import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AddressSearch } from "@/components/address/address-search";
import { AddressTable } from "@/components/address/address-table";
import { AddressDeleteModal } from "@/components/address/address-delete-modal";
import { AddressFormSheet } from "@/components/address/address-form-sheet";
import { IAddress } from "@/types/address";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import useAddressStore from "@/store/address-store";

export default function AddressPage() {
  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    addresses,
    totalItems,
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedType,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    editAddress,
    removeAddress,
    batchRemoveAddresses,
    toggleFrequent,
    setCurrentPage,
    setSearchTerm,
    setSelectedType,
    resetState,
  } = useAddressStore();
  
  // 토스트 컴포넌트
  const { toast } = useToast();
  
  // 로컬 상태
  const [addressesToDelete, setAddressesToDelete] = useState<IAddress[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isFormSheetOpen, setIsFormSheetOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | undefined>(undefined);
  const [initialFetchDone, setInitialFetchDone] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 컴포넌트 마운트 시 데이터 로드 - useCallback으로 최적화
  const loadAddresses = useCallback(async () => {
    try {
      await fetchAddresses();
      setInitialFetchDone(true);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      // 에러는 스토어에서 처리되어 error 상태로 설정됨
    }
  }, [fetchAddresses]);

  // 데이터 새로고침
  const refreshAddresses = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchAddresses({
        page: currentPage,
        search: searchTerm,
        type: selectedType as any
      });
      toast({
        title: "새로고침 완료",
        description: "주소 목록이 업데이트되었습니다.",
      });
    } catch (error) {
      console.error("새로고침 실패:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentPage, fetchAddresses, searchTerm, selectedType, toast]);

  useEffect(() => {
    loadAddresses();
    
    // 컴포넌트 언마운트 시 선택된 주소 및 필터 초기화를 위한 클린업 함수
    return () => {
      resetState();
    };
  }, [loadAddresses, resetState]);
  
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

  // 검색 처리 - useCallback으로 최적화
  const handleSearch = useCallback((term: string, type?: string) => {
    setSearchTerm(term);
    setSelectedType(type || "");
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    fetchAddresses({
      page: 1, 
      search: term, 
      type: type as any 
    });
  }, [fetchAddresses, setCurrentPage, setSearchTerm, setSelectedType]);

  // 페이지 변경 처리 - useCallback으로 최적화
  const handlePageChange = useCallback((page: number) => {
    // 유효 페이지 범위 확인
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    fetchAddresses({ page });
  }, [fetchAddresses, itemsPerPage, setCurrentPage, totalItems]);

  // 단일 주소 삭제 처리 - useCallback으로 최적화
  const handleDeleteSingle = useCallback((address: IAddress) => {
    setAddressesToDelete([address]);
    setIsDeleteModalOpen(true);
  }, []);

  // 선택된 주소 일괄 삭제 처리 - useCallback으로 최적화
  const handleDeleteSelected = useCallback((selectedAddresses: IAddress[]) => {
    if (selectedAddresses.length === 0) return;
    
    setAddressesToDelete(selectedAddresses);
    setIsDeleteModalOpen(true);
  }, []);

  // 자주 사용하는 주소 토글 처리 - useCallback으로 최적화
  const handleToggleFrequent = useCallback(async (address: IAddress) => {
    try {
      await toggleFrequent(address.id, !address.isFrequent);
      toast({
        title: address.isFrequent ? "자주 사용 해제" : "자주 사용 설정",
        description: `${address.name} 주소가 성공적으로 ${address.isFrequent ? '해제' : '등록'}되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "설정 실패",
        description: error instanceof Error ? error.message : "자주 사용 주소 설정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }, [toast, toggleFrequent]);

  // 삭제 확인 - useCallback으로 최적화
  const handleConfirmDelete = useCallback(async () => {
    try {
      if (addressesToDelete.length === 0) return;
      
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
  }, [addressesToDelete, batchRemoveAddresses, removeAddress, toast]);

  // 주소 등록/수정 폼 열기 - useCallback으로 최적화
  const handleOpenFormSheet = useCallback((address?: IAddress) => {
    setEditingAddress(address);
    setIsFormSheetOpen(true);
  }, []);

  // 주소 등록/수정 제출 처리 - useCallback으로 최적화
  const handleFormSubmit = useCallback(async (data: Omit<IAddress, "id" | "createdAt" | "updatedAt" | "isFrequent" | "createdBy" | "updatedBy">) => {
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
  }, [addAddress, editAddress, editingAddress, toast]);

  // 폼 닫기 핸들러 - useCallback으로 최적화
  const handleCloseForm = useCallback(() => {
    setIsFormSheetOpen(false);
    setEditingAddress(undefined);
  }, []);

  // 삭제 모달 닫기 핸들러 - useCallback으로 최적화
  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setAddressesToDelete([]);
  }, []);

  // 총 페이지 수 계산 - useMemo로 최적화
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / itemsPerPage)), [totalItems, itemsPerPage]);

  // 현재 표시 중인 주소 범위 계산 - useMemo로 최적화
  const addressRange = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  }, [currentPage, itemsPerPage, totalItems]);

  // 로딩 컴포넌트
  const renderLoading = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );

  // 에러 컴포넌트
  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>에러</AlertTitle>
      <AlertDescription>
        {error || "주소 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."}
      </AlertDescription>
    </Alert>
  );

  // 빈 데이터 컴포넌트
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
      <p className="text-muted-foreground mb-4">
        {searchTerm || selectedType
          ? `'${searchTerm}' ${selectedType ? `(${selectedType})` : ''} 검색 결과가 없습니다.`
          : "등록된 주소가 없습니다."}
      </p>
      <div className="flex gap-2">
        {(searchTerm || selectedType) && (
          <Button variant="outline" onClick={() => handleSearch("", undefined)}>
            검색 초기화
          </Button>
        )}
        <Button onClick={() => handleOpenFormSheet()}>
          <Plus className="mr-2 h-4 w-4" /> 주소 등록
        </Button>
      </div>
    </div>
  );

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
              <CardDescription>
                상/하차지 주소록을 관리합니다. 
                {totalItems > 0 && (
                  <span className="ml-1">
                    총 <strong>{totalItems}</strong>개의 주소가 등록되어 있습니다
                    {addresses.length > 0 && (
                      <span className="ml-1">
                        (현재 {addressRange.start}-{addressRange.end}번 표시 중)
                      </span>
                    )}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={refreshAddresses}
                disabled={isRefreshing || isLoading}
                title="새로고침"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={() => handleOpenFormSheet()}>
                <Plus className="mr-2 h-4 w-4" /> 주소 등록
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AddressSearch 
              onSearch={handleSearch} 
              initialSearchTerm={searchTerm}
              initialType={selectedType}
            />
            
            {error && renderError()}
            
            {isLoading && !initialFetchDone ? (
              renderLoading()
            ) : addresses.length === 0 ? (
              renderEmptyState()
            ) : (
              <AddressTable
                addresses={addresses}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onDeleteSingle={handleDeleteSingle}
                onDeleteSelected={handleDeleteSelected}
                onEdit={handleOpenFormSheet}
                onToggleFrequent={handleToggleFrequent}
              />
            )}
            
            <AddressDeleteModal
              isOpen={isDeleteModalOpen}
              addresses={addressesToDelete}
              onClose={handleCloseDeleteModal}
              onConfirm={handleConfirmDelete}
            />
            
            <AddressFormSheet
              isOpen={isFormSheetOpen}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
              defaultValues={editingAddress}
              title={editingAddress ? "주소 수정" : "주소 등록"}
            />
          </CardContent>
          {isLoading && initialFetchDone && (
            <CardFooter>
              <div className="w-full flex justify-center">
                <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}