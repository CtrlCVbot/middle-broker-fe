import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AddressService } from '@/services/address-service';
import { IAddress, IAddressResponse, IAddressSearchParams } from '@/types/address';
import { ToastUtils } from '@/utils/toast-utils';
import { IApiError } from '@/utils/api-client';
import { toast } from 'sonner';
import { getCurrentUser } from '@/utils/auth';
import { IUser } from '@/types/user';



interface AddressState {
  // 상태
  addresses: IAddress[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  selectedType: string;
  isLoading: boolean;
  error: IApiError | null;
  selectedAddresses: IAddress[];
  frequentAddresses: IAddress[];
  isLoadingFrequent: boolean;
  currentUser: IUser | null;

  // 액션
  fetchAddresses: (params?: Partial<IAddressSearchParams>) => Promise<void>;
  fetchAddress: (id: string) => Promise<IAddress | null>;
  fetchFrequentAddresses: (companyId?: string) => Promise<void>;
  addAddress: (address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'isFrequent' | 'createdBy' | 'updatedBy'>) => Promise<IAddress>;
  editAddress: (id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IAddress>;
  removeAddress: (id: string) => Promise<void>;
  batchRemoveAddresses: (ids: string[]) => Promise<void>;
  setAddressFrequent: (id: string, isFrequent: boolean) => Promise<void>;
  batchSetAddressesFrequent: (ids: string[], isFrequent: boolean) => Promise<void>;
  setSelectedAddresses: (addresses: IAddress[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
  clearSelectedAddresses: () => void;
  refreshAddresses: () => Promise<void>;
}

/**
 * 주소록 상태 관리 저장소
 * - 주소 목록 및 검색, 필터, 페이지네이션 상태 관리
 * - 주소 CRUD 작업 및 배치 작업 처리
 * - 에러 핸들링 및 사용자 피드백
 */
const useAddressStore = create<AddressState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      addresses: [],
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 10,
      searchTerm: '',
      selectedType: 'all',
      isLoading: false,
      error: null,
      selectedAddresses: [],
      frequentAddresses: [],
      isLoadingFrequent: false,
      currentUser: getCurrentUser(),

      // 액션 구현
      fetchAddresses: async (params?: Partial<IAddressSearchParams>) => {
        try {
          set({ isLoading: true, error: null });
          
          // 현재 상태와 파라미터를 병합
          const { currentPage, itemsPerPage, searchTerm, selectedType } = get();
          const queryParams: IAddressSearchParams = {
            page: params?.page || currentPage,
            limit: params?.limit || itemsPerPage,
            search: params?.search !== undefined ? params.search : searchTerm,
              
            type: params?.type !== undefined 
              ? params.type 
              : selectedType !== "all" 
                ? selectedType as any 
                : undefined,
            companyId: params?.companyId || undefined,
          };
          
          // API 호출
          const response = await AddressService.getAddresses(queryParams);
          
          // 상태 업데이트 (페이지 정보도 함께 업데이트)
          set({ 
            addresses: response.data, 
            totalItems: response.pagination.total,
            currentPage: response.pagination.page,
            error: null,
            isLoading: false
          });
          
          // 선택된 주소들 중 이미 삭제된 주소는 제거
          const currentAddressIds = new Set(response.data.map(a => a.id));
          const validSelectedAddresses = get().selectedAddresses.filter(
            sa => currentAddressIds.has(sa.id)
          );
          
          if (validSelectedAddresses.length !== get().selectedAddresses.length) {
            set({ selectedAddresses: validSelectedAddresses });
          }
        } catch (error: any) {
          console.error("[AddressStore] 주소 목록 조회 실패:", error);
          set({ 
            error: error.message || "주소 목록을 불러오는 중 오류가 발생했습니다.", 
            isLoading: false
          });
          ToastUtils.error("주소 목록을 불러오는데 실패했습니다.");
        }
      },
      
      fetchAddress: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const address = await AddressService.getAddress(id);
          set({ isLoading: false });
          return address;
        } catch (error) {
          set({ 
            error: error as IApiError,
            isLoading: false 
          });
          
          // 토스트 에러 표시
          ToastUtils.apiError(error, '주소 로드 실패');
          return null;
        }
      },
      
      fetchFrequentAddresses: async (companyId?: string) => {
        set({ isLoadingFrequent: true });
        
        try {
          const frequentAddresses = await AddressService.getFrequentAddresses({
            companyId: companyId || undefined
          });
          set({ frequentAddresses: frequentAddresses.data, isLoadingFrequent: false });
        } catch (error: any) {
          console.error("[AddressStore] 자주 사용하는 주소 목록 조회 실패:", error);
          set({ isLoadingFrequent: false });
          // 자주 사용 목록 실패는 toast로만 표시 (크리티컬 에러 아님)
          ToastUtils.error("자주 사용하는 주소 목록을 불러오는데 실패했습니다.");
        }
      },
      
      addAddress: async (address) => {
        try {
          // 낙관적 UI 업데이트를 위한 임시 ID (실제로는 사용하지 않음)
          const tempId = `temp-${Date.now()}`;
          
          // API 호출
          const newAddress = await AddressService.createAddress({
            ...address
          });
          
          // 성공 메시지
          toast.success("주소가 추가되었습니다.");
          
          // 자동 새로고침
          await get().refreshAddresses();
          
          // 새 주소가 자주 사용인 경우 자주 사용 목록도 새로고침
          if (newAddress.isFrequent) {
            get().fetchFrequentAddresses();
          }
          
          return newAddress;
        } catch (error: any) {
          console.error("[AddressStore] 주소 추가 실패:", error);
          
          if (error.details) {
            ToastUtils.formError("주소 추가 실패", error.details);
          } else {
            ToastUtils.error(error.message || "주소 추가에 실패했습니다.");
          }
          
          throw error;
        }
      },
      
      editAddress: async (id, address) => {
        try {
          // 낙관적 UI 업데이트
          const currentAddresses = [...get().addresses];
          const updatedAddressIndex = currentAddresses.findIndex(a => a.id === id);
          
          // API 호출
          const updatedAddress = await AddressService.updateAddress(id, address);
          
          // 성공 메시지
          toast.success("주소가 수정되었습니다.");
          
          // 상태 새로고침 (변경사항 반영)
          await get().refreshAddresses();
          
          // 자주 사용 상태가 변경되었거나 자주 사용 목록에 있는 주소인 경우
          if (address.isFrequent !== undefined || get().frequentAddresses.some(a => a.id === id)) {
            get().fetchFrequentAddresses();
          }
          
          return updatedAddress;
        } catch (error: any) {
          console.error("[AddressStore] 주소 수정 실패:", error);
          
          if (error.details) {
            ToastUtils.formError("주소 수정 실패", error.details);
          } else {
            ToastUtils.error(error.message || "주소 수정에 실패했습니다.");
          }
          
          throw error;
        }
      },
      
      removeAddress: async (id) => {
        try {
          // 낙관적 UI 업데이트
          const currentAddresses = [...get().addresses];
          const filteredAddresses = currentAddresses.filter(a => a.id !== id);
          set({ addresses: filteredAddresses });
          
          // API 호출
          await AddressService.deleteAddress(id);
          
          // 성공 메시지
          toast.success("주소가 삭제되었습니다.");
          
          // 상태 새로고침
          await get().refreshAddresses();
          get().fetchFrequentAddresses();
          
          // 선택된 주소에서도 제거
          const updatedSelected = get().selectedAddresses.filter(a => a.id !== id);
          if (updatedSelected.length !== get().selectedAddresses.length) {
            set({ selectedAddresses: updatedSelected });
          }
        } catch (error: any) {
          console.error("[AddressStore] 주소 삭제 실패:", error);
          ToastUtils.error(error.message || "주소 삭제에 실패했습니다.");
          
          // 실패 시 원래 상태로 복구
          await get().refreshAddresses();
          
          throw error;
        }
      },
      
      batchRemoveAddresses: async (ids) => {
        try {
          // 낙관적 UI 업데이트
          const currentAddresses = [...get().addresses];
          const filteredAddresses = currentAddresses.filter(a => !ids.includes(a.id));
          set({ addresses: filteredAddresses });
          
          // API 호출
          const result = await AddressService.batchDelete(ids);
          
          // 처리 결과에 따른 메시지
          if (result.success && result.failed.length === 0) {
            toast.success(`${result.processed.length}개의 주소가 삭제되었습니다.`);
          } else if (result.processed.length > 0) {
            toast.success(`${result.processed.length}개의 주소가 삭제되었습니다.`);
            if (result.failed.length > 0) {
              toast.error(`${result.failed.length}개의 주소는 삭제하지 못했습니다.`);
            }
          } else {
            ToastUtils.error("주소 삭제에 실패했습니다.");
          }
          
          // 상태 새로고침
          await get().refreshAddresses();
          get().fetchFrequentAddresses();
          
          // 선택된 주소 초기화
          set({ selectedAddresses: [] });
        } catch (error: any) {
          console.error("[AddressStore] 다중 주소 삭제 실패:", error);
          ToastUtils.error(error.message || "주소 삭제에 실패했습니다.");
          
          // 실패 시 원래 상태로 복구
          await get().refreshAddresses();
          
          throw error;
        }
      },
      
      setAddressFrequent: async (id, isFrequent) => {
        try {
          // 낙관적 UI 업데이트 (현재 목록에서 상태 변경)
          const currentAddresses = [...get().addresses];
          const addressIndex = currentAddresses.findIndex(a => a.id === id);
          
          if (addressIndex !== -1) {
            const updatedAddresses = [...currentAddresses];
            updatedAddresses[addressIndex] = {
              ...updatedAddresses[addressIndex],
              isFrequent
            };
            set({ addresses: updatedAddresses });
          }
          
          // API 호출
          if (isFrequent) {
            await AddressService.setFrequent([id]);
            toast.success("자주 사용 주소로 설정되었습니다.");
          } else {
            await AddressService.unsetFrequent([id]);
            toast.success("자주 사용 주소에서 해제되었습니다.");
          }
          
          // 자주 사용 목록 새로고침
          await get().fetchFrequentAddresses();
        } catch (error: any) {
          console.error("[AddressStore] 자주 사용 설정 변경 실패:", error);
          ToastUtils.error(error.message || "자주 사용 설정을 변경하는데 실패했습니다.");
          
          // 실패 시 원래 상태로 복구
          await get().refreshAddresses();
          
          throw error;
        }
      },
      
      batchSetAddressesFrequent: async (ids, isFrequent) => {
        try {
          // 낙관적 UI 업데이트
          const currentAddresses = [...get().addresses];
          const updatedAddresses = currentAddresses.map(address => {
            if (ids.includes(address.id)) {
              return { ...address, isFrequent };
            }
            return address;
          });
          set({ addresses: updatedAddresses });
          
          // API 호출
          let result;
          if (isFrequent) {
            result = await AddressService.setFrequent(ids);
            toast.success(`${result.processed.length}개 주소가 자주 사용 주소로 설정되었습니다.`);
          } else {
            result = await AddressService.unsetFrequent(ids);
            toast.success(`${result.processed.length}개 주소가 자주 사용 주소에서 해제되었습니다.`);
          }
          
          // 실패한 항목이 있는 경우
          if (result.failed.length > 0) {
            toast.error(`${result.failed.length}개 주소는 처리하지 못했습니다.`);
          }
          
          // 자주 사용 목록 새로고침
          await get().fetchFrequentAddresses();
          
          // 선택된 주소 초기화
          set({ selectedAddresses: [] });
        } catch (error: any) {
          console.error("[AddressStore] 다중 자주 사용 설정 변경 실패:", error);
          ToastUtils.error(error.message || "자주 사용 설정을 변경하는데 실패했습니다.");
          
          // 실패 시 원래 상태로 복구
          await get().refreshAddresses();
          
          throw error;
        }
      },
      
      setSelectedAddresses: (addresses) => {
        set({ selectedAddresses: addresses });
      },
      
      setSearchTerm: (term) => {
        set({ searchTerm: term, currentPage: 1 });
      },
      
      setSelectedType: (type) => {
        set({ selectedType: type, currentPage: 1 });
      },
      
      setCurrentPage: (page) => {
        set({ currentPage: page });
        get().fetchAddresses({ page });
      },
      
      clearSelectedAddresses: () => {
        set({ selectedAddresses: [] });
      },
      
      refreshAddresses: async () => {
        const params = {
          page: get().currentPage,
          search: get().searchTerm,
          type: get().selectedType === 'all' ? undefined : get().selectedType as any,
          companyId: get().currentUser?.companyId || undefined,
        };
        await get().fetchAddresses(params);
      },
    }),
    { name: "address-store" }
  )
);

export default useAddressStore; 