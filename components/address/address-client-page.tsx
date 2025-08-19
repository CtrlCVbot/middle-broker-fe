"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingOverlay, Skeleton } from "@/components/ui/loading";
import { AddressSearch } from "@/components/address/address-search";
import { AddressTable } from "@/components/address/address-table";
import { AddressDeleteModal } from "@/components/address/address-delete-modal";
import { AddressFormSheet } from "@/components/address/address-form-sheet";
import { IAddress } from "@/types/address";
import useAddressStore from "@/store/address-store";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, Star, StarOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "../ui/sidebar";
import { getCurrentUser } from "@/utils/auth";

const currentUser = getCurrentUser();

/**
 * 주소록 클라이언트 페이지 컴포넌트
 * - API 연동 및 주소 CRUD 작업 처리
 * - 자주 사용하는 주소 관리
 * - 검색 및 필터링
 * - 사용자 피드백 (로딩, 에러, 토스트 등)
 */
export default function AddressClientPage() {
  // Zustand 스토어에서 상태 및 액션 가져오기
  const {
    // 상태
    addresses,
    totalItems,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    selectedAddresses,
    frequentAddresses,
    isLoadingFrequent,
    
    // 액션
    fetchAddresses,
    fetchFrequentAddresses,
    addAddress,
    editAddress,
    removeAddress,
    batchRemoveAddresses,
    setAddressFrequent,
    batchSetAddressesFrequent,
    setCurrentPage,
    setSearchTerm,
    setSelectedType,
    setSelectedAddresses,
    clearSelectedAddresses,
    refreshAddresses,
  } = useAddressStore();
  
  // 로컬 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressesToDelete, setAddressesToDelete] = useState<IAddress[]>([]);
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | undefined>();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // 컴포넌트 마운트 시 주소 목록 로드
  useEffect(() => {
    fetchAddresses({companyId: currentUser?.companyId});
    fetchFrequentAddresses(currentUser?.companyId);
  }, [fetchAddresses, fetchFrequentAddresses]);
  
  // 검색 핸들러
  const handleSearch = useCallback((term: string, type?: string) => {
    setSearchTerm(term);
    setSelectedType(type || "all");
    fetchAddresses({ page: 1, search: term, type: type as any, companyId: currentUser?.companyId });
  }, [setSearchTerm, setSelectedType, fetchAddresses]);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);
  
  // 단일 주소 삭제 핸들러
  const handleDeleteSingle = useCallback((address: IAddress) => {
    setAddressesToDelete([address]);
    setIsDeleteModalOpen(true);
  }, []);
  
  // 다중 주소 삭제 핸들러
  const handleDeleteSelected = useCallback((selectedAddresses: IAddress[]) => {
    setAddressesToDelete(selectedAddresses);
    setIsDeleteModalOpen(true);
  }, []);
  
  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async () => {
    if (addressesToDelete.length === 1) {
      // 단일 삭제
      await removeAddress(addressesToDelete[0].id);
    } else {
      // 다중 삭제
      const ids = addressesToDelete.map((addr) => addr.id);
      await batchRemoveAddresses(ids);
    }
    setIsDeleteModalOpen(false);
    setAddressesToDelete([]);
  }, [addressesToDelete, removeAddress, batchRemoveAddresses]);
  
  // 주소 폼 열기 핸들러
  const handleOpenFormSheet = useCallback((address?: IAddress) => {
    setEditingAddress(address);
    setIsFormSheetOpen(true);
  }, []);
  
  // 주소 폼 제출 핸들러
  const handleFormSubmit = useCallback(async (data: Omit<IAddress, "id" | "createdAt" | "updatedAt" | "isFrequent" | "createdBy" | "updatedBy">) => {
    let success = false;
    
    if (editingAddress) {
      // 주소 수정
      const result = await editAddress(editingAddress.id, { 
        ...data, 
        isFrequent: editingAddress.isFrequent,
        createdBy: editingAddress.createdBy || '',
        updatedBy: ''
      });
      success = !!result;
    } else {
      // 주소 추가
      const result = await addAddress({
        ...data
      });
      success = !!result;
    }
    
    if (success) {
      setIsFormSheetOpen(false);
      setEditingAddress(undefined);
    }
  }, [editingAddress, editAddress, addAddress]);
  
  // 자주 사용하는 주소 토글 핸들러
  const handleToggleFrequent = useCallback(async (address: IAddress) => {
    await setAddressFrequent(address.id, !address.isFrequent);
  }, [setAddressFrequent]);
  
  // 선택한 주소 자주 사용 토글 핸들러
  const handleToggleSelectedFrequent = useCallback(async (isFrequent: boolean) => {
    const ids = selectedAddresses.map(addr => addr.id);
    if (ids.length > 0) {
      await batchSetAddressesFrequent(ids, isFrequent);
      clearSelectedAddresses();
    }
  }, [selectedAddresses, batchSetAddressesFrequent, clearSelectedAddresses]);
  
  // 데이터 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAddresses();
    await fetchFrequentAddresses(currentUser?.companyId);
    setRefreshing(false);
  }, [refreshAddresses, fetchFrequentAddresses]);
  
  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === "frequent") {
      fetchFrequentAddresses(currentUser?.companyId);
    }
  }, [fetchFrequentAddresses]);
  
  // 로딩 중 렌더링
  const renderLoading = () => (
    <div className="space-y-3 py-6">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
  
  // 에러 렌더링
  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-destructive mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
      <Button onClick={() => handleSearch("", "all")} variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" /> 다시 시도
      </Button>
    </div>
  );
  
  // 주소 없음 렌더링
  const renderEmpty = (message: string = "등록된 주소가 없습니다") => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <p className="mb-4">{message}</p>
      <Button onClick={() => handleOpenFormSheet()} variant="outline">
        주소 등록하기
      </Button>
    </div>
  );
  
  // 빈 검색 결과 렌더링
  const renderEmptySearch = () => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <p className="mb-4">검색 결과가 없습니다.</p>
      <Button onClick={() => handleSearch("", "all")} variant="outline" size="sm">
        검색 초기화
      </Button>
    </div>
  );
  
  return (
    <>
      
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">                  
                  홈
                </BreadcrumbLink>
              </BreadcrumbItem>
             
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>주소록 관리</BreadcrumbPage>
                
              </BreadcrumbItem>
              
            </BreadcrumbList>
            
          </Breadcrumb>
          
        </div>
      </header>

      <Card className="border-none shadow-none">
        <LoadingOverlay isLoading={refreshing} text="새로고침 중...">
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>주소록 관리</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  상/하차지 주소를 관리합니다.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => handleOpenFormSheet()}>주소 등록</Button>
            </div>
          </CardHeader>
        </LoadingOverlay>

        <CardContent>

          <Card>                  
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-2 ">
                <AddressSearch onSearch={handleSearch} />

              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
                
                <TabsList className="mb-1">
                  <TabsTrigger value="all">
                    전체 주소
                    <Badge className="ml-2" variant="outline">{totalItems}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="frequent">
                    자주 사용
                    <Badge className="ml-2" variant="outline">{frequentAddresses.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="m-0">
                  {isLoading && addresses.length === 0 ? (
                    renderLoading()
                  ) : error ? (
                    renderError()
                  ) : addresses.length === 0 ? (
                    totalItems === 0 ? renderEmpty() : renderEmptySearch()
                  ) : (
                    <AddressTable
                      addresses={addresses}
                      totalPages={Math.ceil(totalItems / itemsPerPage)}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                      onDeleteSingle={handleDeleteSingle}
                      onDeleteSelected={handleDeleteSelected}
                      onEdit={handleOpenFormSheet}
                      onToggleFrequent={handleToggleFrequent}
                      selectedAddresses={selectedAddresses}
                      onSelectAddresses={setSelectedAddresses}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="frequent" className="m-0">
                  {isLoadingFrequent ? (
                    renderLoading()
                  ) : frequentAddresses.length === 0 ? (
                    renderEmpty("자주 사용하는 주소가 없습니다")
                  ) : (
                    <AddressTable
                      addresses={frequentAddresses}
                      totalPages={1}
                      currentPage={1}
                      onPageChange={() => {}}
                      onDeleteSingle={handleDeleteSingle}
                      onDeleteSelected={handleDeleteSelected}
                      onEdit={handleOpenFormSheet}
                      onToggleFrequent={handleToggleFrequent}
                      selectedAddresses={selectedAddresses}
                      onSelectAddresses={setSelectedAddresses}
                      hidePagenation
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>   
                 
        </CardContent>
      </Card>
            
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
    </>
  );
} 