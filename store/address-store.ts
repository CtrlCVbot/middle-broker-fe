import { create } from 'zustand';
import { 
  getAddresses, 
  getAddress, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  batchProcessAddresses,
  validateAddress 
} from '@/services/address-service';
import { 
  IAddress, 
  IAddressResponse, 
  IAddressSearchParams, 
  AddressType,
  IAddressBatchResponse
} from '@/types/address';

interface IAddressState {
  // 상태
  addresses: IAddress[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  selectedType: string;
  isLoading: boolean;
  error: string | null;
  selectedAddresses: IAddress[];
  lastFetchTime: number | null; // 캐싱을 위한 마지막 데이터 로드 시간
  
  // 액션
  fetchAddresses: (params?: IAddressSearchParams) => Promise<void>;
  fetchAddress: (id: string) => Promise<IAddress>;
  addAddress: (address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'isFrequent' | 'createdBy' | 'updatedBy'>) => Promise<IAddress>;
  editAddress: (id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<IAddress>;
  removeAddress: (id: string) => Promise<void>;
  batchRemoveAddresses: (ids: string[]) => Promise<void>;
  toggleFrequent: (id: string, isFrequent: boolean) => Promise<IAddress>;
  validateAddressData: (address: Partial<IAddress>) => Promise<{ isValid: boolean; errors?: string[] }>;
  setSelectedAddresses: (addresses: IAddress[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
  resetState: () => void;
}

const initialState = {
  addresses: [],
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 10,
  searchTerm: '',
  selectedType: '',
  isLoading: false,
  error: null,
  selectedAddresses: [],
  lastFetchTime: null,
};

const useAddressStore = create<IAddressState>((set, get) => ({
  ...initialState,
  
  // 주소 목록 조회
  fetchAddresses: async (params) => {
    // API 요청 전 로딩 상태 설정
    set({ isLoading: true, error: null });
    
    try {
      // 검색 파라미터 준비
      const searchParams: IAddressSearchParams = {
        page: params?.page || get().currentPage,
        limit: params?.limit || get().itemsPerPage,
        search: params?.search !== undefined ? params.search : get().searchTerm,
        type: (params?.type || get().selectedType) as AddressType,
      };
      
      // API 호출
      const response = await getAddresses(searchParams);
      
      // 상태 업데이트
      set({
        addresses: response.data,
        totalItems: response.pagination.total,
        currentPage: response.pagination.page,
        itemsPerPage: response.pagination.limit,
        isLoading: false,
        lastFetchTime: Date.now(),
      });
    } catch (error) {
      // 에러 처리
      console.error('주소 목록 조회 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '주소 목록을 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  // 개별 주소 조회
  fetchAddress: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const address = await getAddress(id);
      set({ isLoading: false });
      return address;
    } catch (error) {
      console.error('개별 주소 조회 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '주소를 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 새 주소 추가
  addAddress: async (address) => {
    set({ isLoading: true, error: null });
    
    try {
      // 주소 생성 API 호출
      const newAddress = await createAddress(address);
      
      // 현재 페이지가 1이고 검색어가 없을 때만 상태 즉시 업데이트 
      if (get().currentPage === 1 && !get().searchTerm && !get().selectedType) {
        set((state) => ({
          addresses: [newAddress, ...state.addresses].slice(0, state.itemsPerPage),
          totalItems: state.totalItems + 1,
        }));
      } else {
        // 다른 경우에는 페이지 새로고침 (데이터 일관성을 위해)
        await get().fetchAddresses();
      }
      
      set({ isLoading: false });
      return newAddress;
    } catch (error) {
      console.error('주소 추가 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '주소를 추가하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 주소 수정
  editAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    
    try {
      // 주소 수정 API 호출
      const updatedAddress = await updateAddress(id, address);
      
      // 현재 표시된 주소 목록 업데이트
      set((state) => ({
        addresses: state.addresses.map((addr) => 
          addr.id === id ? updatedAddress : addr
        ),
        isLoading: false,
      }));
      
      return updatedAddress;
    } catch (error) {
      console.error('주소 수정 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '주소를 수정하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 주소 삭제
  removeAddress: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // 주소 삭제 API 호출
      await deleteAddress(id);
      
      // 주소 목록에서 삭제된 항목 제거
      set((state) => ({
        addresses: state.addresses.filter((addr) => addr.id !== id),
        totalItems: state.totalItems - 1,
        selectedAddresses: state.selectedAddresses.filter((addr) => addr.id !== id),
        isLoading: false,
      }));
      
      // 페이지 업데이트 로직: 현재 페이지에 항목이 없는 경우 이전 페이지로 이동
      const { addresses, currentPage, totalItems, itemsPerPage } = get();
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      
      if (addresses.length === 0 && currentPage > 1 && currentPage > totalPages) {
        await get().fetchAddresses({ page: currentPage - 1 });
      }
    } catch (error) {
      console.error('주소 삭제 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '주소를 삭제하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 다중 주소 삭제
  batchRemoveAddresses: async (ids) => {
    if (ids.length === 0) return;
    
    set({ isLoading: true, error: null });
    
    try {
      // 배치 처리 API 호출
      const result = await batchProcessAddresses(ids, 'delete');
      
      // 주소 목록에서 성공적으로 삭제된 항목만 제거
      if (result.success) {
        const processedIds = result.processed || ids;
        
        set((state) => ({
          addresses: state.addresses.filter((addr) => !processedIds.includes(addr.id)),
          totalItems: state.totalItems - processedIds.length,
          selectedAddresses: [],
          isLoading: false,
        }));
        
        // 페이지 업데이트 로직
        const { addresses, currentPage, totalItems, itemsPerPage } = get();
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (addresses.length === 0 && currentPage > 1 && currentPage > totalPages) {
          await get().fetchAddresses({ page: currentPage - 1 });
        } else if (addresses.length < itemsPerPage / 2) {
          // 현재 페이지의 항목이 절반 이하로 남은 경우 목록 새로고침
          await get().fetchAddresses();
        }
      } else {
        throw new Error('일부 주소를 삭제하는데 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('주소 일괄 삭제 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '주소를 일괄 삭제하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 자주 사용하는 주소 토글
  toggleFrequent: async (id, isFrequent) => {
    set({ isLoading: true, error: null });
    
    try {
      // 현재 주소 찾기
      const addressToUpdate = get().addresses.find(addr => addr.id === id);
      if (!addressToUpdate) {
        throw new Error('주소를 찾을 수 없습니다.');
      }
      
      // 주소 업데이트
      const updatedAddress = await updateAddress(id, { 
        ...addressToUpdate,
        isFrequent 
      });
      
      // 주소 목록 업데이트
      set((state) => ({
        addresses: state.addresses.map((addr) => 
          addr.id === id ? updatedAddress : addr
        ),
        isLoading: false,
      }));
      
      return updatedAddress;
    } catch (error) {
      console.error('자주 사용 설정 에러:', error);
      set({ 
        error: error instanceof Error ? error.message : '자주 사용 주소 설정 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  // 주소 데이터 유효성 검증
  validateAddressData: async (address) => {
    try {
      return await validateAddress(address);
    } catch (error) {
      console.error('주소 유효성 검증 에러:', error);
      throw error;
    }
  },
  
  // 선택된 주소 설정
  setSelectedAddresses: (addresses) => {
    set({ selectedAddresses: addresses });
  },
  
  // 검색어 설정
  setSearchTerm: (term) => {
    set({ searchTerm: term, currentPage: 1 });
  },
  
  // 주소 유형 필터 설정
  setSelectedType: (type) => {
    set({ selectedType: type, currentPage: 1 });
  },
  
  // 현재 페이지 설정
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  // 상태 초기화
  resetState: () => {
    set(initialState);
  },
}));

export default useAddressStore; 