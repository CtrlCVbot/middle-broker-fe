import { create } from 'zustand';
import { 
  getAddresses, 
  getAddress, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  batchProcessAddresses 
} from '@/services/address-service';
import { IAddress, IAddressResponse, IAddressSearchParams, AddressType } from '@/types/address';

interface AddressState {
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
  
  // 액션
  fetchAddresses: (params?: IAddressSearchParams) => Promise<void>;
  fetchAddress: (id: string) => Promise<IAddress>;
  addAddress: (address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'isFrequent' | 'createdBy' | 'updatedBy'>) => Promise<IAddress>;
  editAddress: (id: string, address: Omit<IAddress, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<IAddress>;
  removeAddress: (id: string) => Promise<void>;
  batchRemoveAddresses: (ids: string[]) => Promise<void>;
  setSelectedAddresses: (addresses: IAddress[]) => void;
  setSearchTerm: (term: string) => void;
  setSelectedType: (type: string) => void;
  setCurrentPage: (page: number) => void;
}

const useAddressStore = create<AddressState>((set, get) => ({
  // 초기 상태
  addresses: [],
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 10,
  searchTerm: '',
  selectedType: '',
  isLoading: false,
  error: null,
  selectedAddresses: [],
  
  // 액션 구현
  fetchAddresses: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await getAddresses({
        page: params?.page || get().currentPage,
        limit: params?.limit || get().itemsPerPage,
        search: params?.search || get().searchTerm,
        type: params?.type as AddressType || (get().selectedType as AddressType),
      });
      
      set({
        addresses: response.data,
        totalItems: response.pagination.total,
        currentPage: response.pagination.page,
        itemsPerPage: response.pagination.limit,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '주소 목록을 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
    }
  },
  
  fetchAddress: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const address = await getAddress(id);
      set({ isLoading: false });
      return address;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '주소를 불러오는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  addAddress: async (address) => {
    set({ isLoading: true, error: null });
    
    try {
      const newAddress = await createAddress(address);
      
      // 현재 페이지가 1이고 검색어가 없을 때만 상태 업데이트
      if (get().currentPage === 1 && !get().searchTerm && !get().selectedType) {
        set((state) => ({
          addresses: [newAddress, ...state.addresses].slice(0, state.itemsPerPage),
          totalItems: state.totalItems + 1,
        }));
      } else {
        // 다른 경우에는 페이지를 새로고침
        await get().fetchAddresses();
      }
      
      set({ isLoading: false });
      return newAddress;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '주소를 추가하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  editAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedAddress = await updateAddress(id, { ...address, isFrequent: !!address.isFrequent });
      
      // 주소 목록 업데이트
      set((state) => ({
        addresses: state.addresses.map((addr) => 
          addr.id === id ? updatedAddress : addr
        ),
        isLoading: false,
      }));
      
      return updatedAddress;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '주소를 수정하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  removeAddress: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await deleteAddress(id);
      
      // 주소 목록에서 제거
      set((state) => ({
        addresses: state.addresses.filter((addr) => addr.id !== id),
        totalItems: state.totalItems - 1,
        selectedAddresses: state.selectedAddresses.filter((addr) => addr.id !== id),
        isLoading: false,
      }));
      
      // 필요한 경우 페이지를 새로고침
      if (get().addresses.length === 0 && get().currentPage > 1) {
        await get().fetchAddresses({ page: get().currentPage - 1 });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '주소를 삭제하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  batchRemoveAddresses: async (ids) => {
    set({ isLoading: true, error: null });
    
    try {
      await batchProcessAddresses(ids, 'delete');
      
      // 주소 목록에서 제거
      set((state) => ({
        addresses: state.addresses.filter((addr) => !ids.includes(addr.id)),
        totalItems: state.totalItems - ids.length,
        selectedAddresses: [],
        isLoading: false,
      }));
      
      // 필요한 경우 페이지를 새로고침
      if (get().addresses.length === 0 && get().currentPage > 1) {
        await get().fetchAddresses({ page: get().currentPage - 1 });
      } else if (get().addresses.length < get().itemsPerPage / 2) {
        await get().fetchAddresses();
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '주소를 일괄 삭제하는 중 오류가 발생했습니다.',
        isLoading: false 
      });
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
  },
}));

export default useAddressStore; 