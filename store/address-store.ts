import { create } from 'zustand';
import { AddressService } from '@/services/address-service';
import { IAddress, IAddressResponse, IAddressSearchParams } from '@/types/address';
import { ToastUtils } from '@/utils/toast-utils';
import { IApiError } from '@/utils/api-client';

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
  
  // 액션
  fetchAddresses: (params?: IAddressSearchParams) => Promise<void>;
  fetchAddress: (id: string) => Promise<IAddress | null>;
  fetchFrequentAddresses: () => Promise<void>;
  addAddress: (address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'isFrequent'>) => Promise<IAddress | null>;
  editAddress: (id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt'>) => Promise<IAddress | null>;
  removeAddress: (id: string) => Promise<boolean>;
  batchRemoveAddresses: (ids: string[]) => Promise<boolean>;
  setAddressFrequent: (id: string, isFrequent: boolean) => Promise<boolean>;
  batchSetAddressesFrequent: (ids: string[], isFrequent: boolean) => Promise<boolean>;
  setSelectedAddresses: (addresses: IAddress[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
  clearSelectedAddresses: () => void;
  refreshAddresses: () => Promise<void>;
}

const useAddressStore = create<AddressState>((set, get) => ({
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
  
  // 액션 구현
  fetchAddresses: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await AddressService.getAddresses({
        page: params?.page || get().currentPage,
        limit: params?.limit || get().itemsPerPage,
        search: params?.search !== undefined ? params.search : get().searchTerm,
        type: params?.type !== undefined ? params.type : get().selectedType === 'all' ? undefined : get().selectedType,
      });
      
      set({
        addresses: response.data,
        totalItems: response.pagination.total,
        currentPage: response.pagination.page,
        itemsPerPage: response.pagination.limit,
        isLoading: false,
        // 선택된 주소 목록 필터링 (삭제된 주소가 있을 수 있으므로)
        selectedAddresses: get().selectedAddresses.filter(
          selected => response.data.some(addr => addr.id === selected.id)
        ),
      });
    } catch (error) {
      set({ 
        error: error as IApiError,
        isLoading: false 
      });
      
      // 토스트 에러 표시
      ToastUtils.apiError(error, '주소 목록 로드 실패');
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
  
  fetchFrequentAddresses: async () => {
    set({ isLoadingFrequent: true });
    
    try {
      const frequentAddresses = await AddressService.getFrequentAddresses();
      set({ frequentAddresses, isLoadingFrequent: false });
    } catch (error) {
      set({ isLoadingFrequent: false });
      ToastUtils.apiError(error, '자주 사용하는 주소 로드 실패');
    }
  },
  
  addAddress: async (address) => {
    set({ isLoading: true, error: null });
    
    try {
      const newAddress = await AddressService.createAddress({
        ...address,
        isFrequent: false, // 새 주소는 기본적으로 자주 사용 안함
      });
      
      // 주소 추가 성공 알림
      ToastUtils.saveSuccess('주소', true);
      
      // 현재 페이지가 1이고 검색어가 없을 때만 상태 업데이트
      if (get().currentPage === 1 && !get().searchTerm && get().selectedType === 'all') {
        set((state) => ({
          addresses: [newAddress, ...state.addresses].slice(0, state.itemsPerPage),
          totalItems: state.totalItems + 1,
        }));
      } else {
        // 다른 경우에는 페이지를 새로고침
        await get().fetchAddresses({ page: 1 });
      }
      
      set({ isLoading: false });
      return newAddress;
    } catch (error) {
      set({ 
        error: error as IApiError,
        isLoading: false 
      });
      
      // 폼 오류 토스트 표시
      ToastUtils.formError(error);
      return null;
    }
  },
  
  editAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedAddress = await AddressService.updateAddress(id, address);
      
      // 주소 수정 성공 알림
      ToastUtils.saveSuccess('주소', false);
      
      // 주소 목록 업데이트
      set((state) => ({
        addresses: state.addresses.map((addr) => 
          addr.id === id ? updatedAddress : addr
        ),
        // 자주 사용하는 주소 목록도 업데이트
        frequentAddresses: state.frequentAddresses.map((addr) =>
          addr.id === id ? updatedAddress : addr
        ),
        isLoading: false,
      }));
      
      return updatedAddress;
    } catch (error) {
      set({ 
        error: error as IApiError,
        isLoading: false 
      });
      
      // 폼 오류 토스트 표시
      ToastUtils.formError(error);
      return null;
    }
  },
  
  removeAddress: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await AddressService.deleteAddress(id);
      
      // 주소 삭제 성공 알림
      ToastUtils.deleteSuccess('주소');
      
      // 주소 목록에서 제거
      set((state) => ({
        addresses: state.addresses.filter((addr) => addr.id !== id),
        totalItems: state.totalItems - 1,
        selectedAddresses: state.selectedAddresses.filter((addr) => addr.id !== id),
        frequentAddresses: state.frequentAddresses.filter((addr) => addr.id !== id),
        isLoading: false,
      }));
      
      // 필요한 경우 페이지를 새로고침
      if (get().addresses.length === 0 && get().currentPage > 1) {
        await get().fetchAddresses({ page: get().currentPage - 1 });
      }

      return true;
    } catch (error) {
      set({ 
        error: error as IApiError,
        isLoading: false 
      });
      
      // 토스트 에러 표시
      ToastUtils.apiError(error, '주소 삭제 실패');
      return false;
    }
  },
  
  batchRemoveAddresses: async (ids) => {
    set({ isLoading: true, error: null });
    
    try {
      await AddressService.batchDelete(ids);
      
      // 다중 주소 삭제 성공 알림
      ToastUtils.deleteSuccess('주소', ids.length);
      
      // 주소 목록에서 제거
      set((state) => ({
        addresses: state.addresses.filter((addr) => !ids.includes(addr.id)),
        totalItems: state.totalItems - ids.length,
        selectedAddresses: [],
        frequentAddresses: state.frequentAddresses.filter((addr) => !ids.includes(addr.id)),
        isLoading: false,
      }));
      
      // 필요한 경우 페이지를 새로고침
      if (get().addresses.length === 0 && get().currentPage > 1) {
        await get().fetchAddresses({ page: get().currentPage - 1 });
      } else if (get().addresses.length < get().itemsPerPage / 2) {
        await get().fetchAddresses();
      }

      return true;
    } catch (error) {
      set({ 
        error: error as IApiError,
        isLoading: false 
      });
      
      // 토스트 에러 표시
      ToastUtils.apiError(error, '주소 일괄 삭제 실패');
      return false;
    }
  },
  
  setAddressFrequent: async (id, isFrequent) => {
    try {
      if (isFrequent) {
        await AddressService.setFrequent([id]);
      } else {
        await AddressService.unsetFrequent([id]);
      }
      
      // 주소 목록 업데이트
      set((state) => ({
        addresses: state.addresses.map((addr) => 
          addr.id === id ? { ...addr, isFrequent } : addr
        ),
        frequentAddresses: isFrequent 
          ? [...state.frequentAddresses, state.addresses.find(addr => addr.id === id)!]
          : state.frequentAddresses.filter(addr => addr.id !== id)
      }));
      
      ToastUtils.success(
        isFrequent ? '자주 사용하는 주소로 설정' : '자주 사용하는 주소에서 제거',
        '주소 설정이 변경되었습니다.'
      );
      
      return true;
    } catch (error) {
      ToastUtils.apiError(error, '주소 설정 변경 실패');
      return false;
    }
  },
  
  batchSetAddressesFrequent: async (ids, isFrequent) => {
    set({ isLoading: true, error: null });
    
    try {
      if (isFrequent) {
        await AddressService.setFrequent(ids);
      } else {
        await AddressService.unsetFrequent(ids);
      }
      
      // 주소 목록 업데이트
      set((state) => {
        const updatedAddresses = state.addresses.map((addr) => 
          ids.includes(addr.id) ? { ...addr, isFrequent } : addr
        );
        
        // 자주 사용하는 주소 목록 업데이트
        const updatedFrequentAddresses = isFrequent
          ? [...state.frequentAddresses, ...updatedAddresses.filter(addr => ids.includes(addr.id))]
          : state.frequentAddresses.filter(addr => !ids.includes(addr.id));
          
        return {
          addresses: updatedAddresses,
          frequentAddresses: updatedFrequentAddresses,
          isLoading: false,
        };
      });
      
      ToastUtils.success(
        isFrequent ? '자주 사용하는 주소로 설정' : '자주 사용하는 주소에서 제거',
        `${ids.length}개의 주소 설정이 변경되었습니다.`
      );
      
      return true;
    } catch (error) {
      set({ 
        error: error as IApiError,
        isLoading: false 
      });
      
      ToastUtils.apiError(error, '주소 일괄 설정 변경 실패');
      return false;
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
      type: get().selectedType === 'all' ? undefined : get().selectedType,
    };
    await get().fetchAddresses(params);
  },
}));

export default useAddressStore; 