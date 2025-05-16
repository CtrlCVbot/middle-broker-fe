import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DriverStatus, IBrokerDriver, IBrokerDriverFilter, TonnageType, VehicleType, IDriverNote } from '@/types/broker-driver';
import { DRIVER_STATUS, DISPATCH_COUNT_OPTIONS, TONNAGE_TYPES, VEHICLE_TYPES, getBrokerDriverById, updateBrokerDriver } from '@/utils/mockdata/mock-broker-drivers';
import { registerDriver, updateDriver as updateDriverApi, deleteDriver, getDriverNotes, addDriverNote, updateDriverNote, deleteDriverNote } from '@/services/driver-service';
import { toast } from 'sonner';
import { mapApiResponseToNotesList } from '@/utils/driver-mapper';

// 필터 요약 문구 생성 함수
export const getFilterSummaryText = (filter: IBrokerDriverFilter): string => {
  if (!filter.searchTerm && !filter.vehicleType && !filter.tonnage && 
      !filter.status && !filter.dispatchCount && !filter.startDate && !filter.endDate) {
    return "모든 차주";
  }
  
  const parts = [];
  
  if (filter.searchTerm) {
    parts.push(`'${filter.searchTerm}' 검색결과`);
  }
  
  if (filter.vehicleType) {
    parts.push(`${filter.vehicleType} 차량`);
  }
  
  if (filter.tonnage) {
    parts.push(`${filter.tonnage} 차량`);
  }
  
  if (filter.status) {
    parts.push(filter.status === '활성' ? '활성 차주' : '비활성 차주');
  }
  
  if (filter.dispatchCount) {
    parts.push(filter.dispatchCount);
  }
  
  if (filter.startDate && filter.endDate) {
    parts.push(`${filter.startDate} ~ ${filter.endDate}`);
  } else if (filter.startDate) {
    parts.push(`${filter.startDate} 이후`);
  } else if (filter.endDate) {
    parts.push(`${filter.endDate} 이전`);
  }
  
  return parts.join(', ');
};

// 스토어 인터페이스 정의
interface IBrokerDriverState {
  // 화면 표시 상태
  viewMode: 'table' | 'card';
  
  // 검색 필터
  filter: IBrokerDriverFilter;
  tempFilter: IBrokerDriverFilter; // 임시 필터 (적용 전)
  
  // 페이지네이션 상태
  currentPage: number;
  pageSize: number;
  
  // 선택된 차주 ID 목록
  selectedDriverIds: string[];
  
  // 특이사항 관련 상태
  driverNotes: Record<string, IDriverNote[]>; // 차주 ID를 키로 하는 특이사항 맵
  isLoadingNotes: boolean;
  notesError: string | null;
  
  // 액션
  setViewMode: (mode: 'table' | 'card') => void;
  setFilter: (filter: Partial<IBrokerDriverFilter>) => void;
  setTempFilter: (filter: Partial<IBrokerDriverFilter>) => void;
  applyTempFilter: () => void;
  resetFilter: () => void;
  resetTempFilter: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSelectedDriverIds: (ids: string[]) => void;
  toggleDriverSelection: (id: string) => void;
  clearSelectedDriverIds: () => void;
  
  // 차주 데이터 관리
  updateDriver: (driver: IBrokerDriver) => void;
  
  // API 호출 메서드 (실제 백엔드 통신)
  registerDriverWithAPI: (driverData: any) => Promise<IBrokerDriver>;
  updateDriverWithAPI: (driverId: string, driverData: any) => Promise<IBrokerDriver>;
  deleteDriverWithAPI: (driverId: string, reason?: string) => Promise<void>;
  
  // 특이사항 관련 메서드
  fetchDriverNotes: (driverId: string) => Promise<IDriverNote[]>;
  addDriverNote: (driverId: string, content: string) => Promise<IDriverNote>;
  updateDriverNote: (noteId: string, content: string, driverId: string) => Promise<IDriverNote>;
  deleteDriverNote: (noteId: string, driverId: string) => Promise<void>;
  
  // 필터 옵션
  filterOptions: {
    vehicleTypes: VehicleType[];
    tonnageTypes: TonnageType[];
    statuses: DriverStatus[];
    dispatchCountOptions: typeof DISPATCH_COUNT_OPTIONS;
  };
}

// 목업 데이터 저장소 (실제 구현에서는 API 호출로 대체)
let mockDriversData: IBrokerDriver[] = [];

// Zustand 스토어 생성
export const useBrokerDriverStore = create<IBrokerDriverState>()(
  persist(
    (set, get) => ({
      // 기본 상태
      viewMode: 'table',
      filter: {
        searchTerm: '',
        vehicleType: '',
        tonnage: '',
        status: '',
        dispatchCount: '',
        startDate: null,
        endDate: null,
      },
      tempFilter: {
        searchTerm: '',
        vehicleType: '',
        tonnage: '',
        status: '',
        dispatchCount: '',
        startDate: null,
        endDate: null,
      },
      currentPage: 1,
      pageSize: 10,
      selectedDriverIds: [],
      
      // 특이사항 관련 상태
      driverNotes: {},
      isLoadingNotes: false,
      notesError: null,
      
      // 필터 옵션
      filterOptions: {
        vehicleTypes: VEHICLE_TYPES,
        tonnageTypes: TONNAGE_TYPES,
        statuses: DRIVER_STATUS,
        dispatchCountOptions: DISPATCH_COUNT_OPTIONS,
      },
      
      // 액션 메서드
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setFilter: (newFilter) => set((state) => ({
        filter: { ...state.filter, ...newFilter },
        currentPage: 1, // 필터 변경 시 1페이지로 이동
      })),
      
      setTempFilter: (newFilter) => set((state) => ({
        tempFilter: { ...state.tempFilter, ...newFilter },
      })),
      
      applyTempFilter: () => set((state) => ({
        filter: { ...state.tempFilter },
        currentPage: 1, // 필터 적용 시 1페이지로 이동
      })),
      
      resetFilter: () => set({
        filter: {
          searchTerm: '',
          vehicleType: '',
          tonnage: '',
          status: '',
          dispatchCount: '',
          startDate: null,
          endDate: null,
        },
        currentPage: 1,
      }),
      
      resetTempFilter: () => set((state) => ({
        tempFilter: { ...state.filter },
      })),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setPageSize: (size) => set({ 
        pageSize: size,
        currentPage: 1, // 페이지 크기 변경 시 1페이지로 이동
      }),
      
      setSelectedDriverIds: (ids) => set({ selectedDriverIds: ids }),
      
      toggleDriverSelection: (id) => set((state) => {
        const isSelected = state.selectedDriverIds.includes(id);
        
        return {
          selectedDriverIds: isSelected
            ? state.selectedDriverIds.filter(driverId => driverId !== id)
            : [...state.selectedDriverIds, id],
        };
      }),
      
      clearSelectedDriverIds: () => set({ selectedDriverIds: [] }),
      
      // 차주 데이터 업데이트 (기존 Mock 메서드 유지)
      updateDriver: (updatedDriver) => {
        try {
          // 목업 데이터 업데이트
          updateBrokerDriver(updatedDriver);
          
          // 선택된 차주 ID 목록에서 해당 차주가 있으면 유지
          set((state) => ({
            selectedDriverIds: state.selectedDriverIds.includes(updatedDriver.id)
              ? state.selectedDriverIds
              : state.selectedDriverIds
          }));
        } catch (error) {
          console.error('차주 정보 업데이트 실패:', error);
        }
      },
      
      // 실제 API 호출 메서드 추가
      registerDriverWithAPI: async (driverData) => {
        try {
          console.log('registerDriverWithAPI 호출됨 - 입력 데이터:', driverData);
          
          // API 호출하여 차주 등록
          const registeredDriver = await registerDriver(driverData);
          
          console.log('API 응답 성공 - 등록된 차주:', registeredDriver);
          
          // 선택적으로 성공 메시지 표시
          toast.success(`${registeredDriver.name} 차주가 성공적으로 등록되었습니다.`);
          
          return registeredDriver;
        } catch (error) {
          console.error('차주 등록 API 호출 실패:', error);
          console.error('오류 세부 정보:', {
            name: error instanceof Error ? error.name : 'UnknownError',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          
          toast.error('차주 등록에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          throw error;
        }
      },
      
      updateDriverWithAPI: async (driverId, driverData) => {
        try {
          // API 호출하여 차주 정보 수정
          const updatedDriver = await updateDriverApi(driverId, driverData);
          
          // 선택적으로 성공 메시지 표시
          toast.success(`${updatedDriver.name} 차주 정보가 성공적으로 수정되었습니다.`);
          
          return updatedDriver;
        } catch (error) {
          console.error('차주 정보 수정 API 호출 실패:', error);
          toast.error('차주 정보 수정에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          throw error;
        }
      },
      
      deleteDriverWithAPI: async (driverId, reason) => {
        try {
          // API 호출하여 차주 삭제
          await deleteDriver(driverId, reason);
          
          // 선택된 차주 ID 목록에서 삭제된 차주 제거
          set((state) => ({
            selectedDriverIds: state.selectedDriverIds.filter(id => id !== driverId)
          }));
          
          // 선택적으로 성공 메시지 표시
          toast.success('차주가 성공적으로 삭제되었습니다.');
        } catch (error) {
          console.error('차주 삭제 API 호출 실패:', error);
          toast.error('차주 삭제에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          throw error;
        }
      },
      
      // 특이사항 관련 메서드
      fetchDriverNotes: async (driverId) => {
        try {
          set({ isLoadingNotes: true, notesError: null });
          
          console.log('fetchDriverNotes 호출됨:', driverId);
          
          // API 호출하여 특이사항 목록 조회
          const apiResponse = await getDriverNotes(driverId);
          console.log('특이사항 API 응답:', apiResponse);
          
          // API 응답 데이터를 프론트엔드 형식으로 변환
          const notes = mapApiResponseToNotesList(apiResponse);
          console.log('변환된 특이사항 목록:', notes);
          
          // 상태 업데이트
          set(state => {
            console.log('특이사항 상태 업데이트 전:', state.driverNotes[driverId] || []);
            
            const updated = {
              driverNotes: {
                ...state.driverNotes,
                [driverId]: notes
              },
              isLoadingNotes: false
            };
            
            console.log('특이사항 상태 업데이트 후:', updated.driverNotes[driverId]);
            return updated;
          });
          
          return notes;
        } catch (error) {
          console.error('특이사항 목록 조회 API 오류:', error);
          
          set({
            isLoadingNotes: false,
            notesError: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          
          toast.error('특이사항 목록 조회에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          
          return [];
        }
      },
      
      addDriverNote: async (driverId, content) => {
        try {
          console.log('addDriverNote 호출됨:', { driverId, content });
          
          // API 호출하여 특이사항 추가
          const addedNote = await addDriverNote(driverId, content);
          console.log('API 응답 (추가된 특이사항):', addedNote);
          
          // 특이사항 목록 상태 업데이트 (이전 상태 확인)
          const state = get();
          const currentNotes = state.driverNotes[driverId] || [];
          console.log('추가 전 특이사항 목록:', currentNotes);
          
          // 새 특이사항 객체 생성
          const newNote = {
            id: addedNote.id,
            content: addedNote.content,
            date: addedNote.date ? new Date(addedNote.date) : new Date()
          };
          
          // 최신 항목이 맨 위에 오도록 목록 업데이트
          const updatedNotes = [newNote, ...currentNotes];
          console.log('추가 후 특이사항 목록:', updatedNotes);
          
          // 상태 업데이트
          set({
            driverNotes: {
              ...state.driverNotes,
              [driverId]: updatedNotes
            }
          });
          
          toast.success('특이사항이 추가되었습니다.');
          return newNote;
        } catch (error) {
          console.error('특이사항 추가 API 오류:', error);
          
          toast.error('특이사항 추가에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          
          throw error;
        }
      },
      
      updateDriverNote: async (noteId, content, driverId) => {
        try {
          console.log('updateDriverNote 호출됨:', { noteId, content, driverId });
          
          // 기존 상태 확인
          const state = get();
          const currentNotes = state.driverNotes[driverId] || [];
          console.log('수정 전 특이사항 목록:', currentNotes);
          
          // 먼저 UI 업데이트를 위해 로컬 상태 변경
          const updatedLocalNotes = currentNotes.map(note => 
            note.id === noteId
              ? {
                  ...note,
                  content,
                  date: new Date()
                }
              : note
          );
          
          console.log('로컬 상태 업데이트 후:', updatedLocalNotes);
          
          // 로컬 상태 먼저 업데이트
          set({
            driverNotes: {
              ...state.driverNotes,
              [driverId]: updatedLocalNotes
            }
          });
          
          // API 호출하여 특이사항 수정
          const updatedNote = await updateDriverNote(noteId, content);
          console.log('API 응답 (수정된 특이사항):', updatedNote);
          
          // 서버 응답과 동기화할 필요가 있을 경우
          if (updatedNote && updatedNote.date) {
            const serverDate = new Date(updatedNote.date);
            
            // 응답의 date로 로컬 상태 재조정
            const syncedNotes = updatedLocalNotes.map(note => 
              note.id === noteId
                ? {
                    ...note,
                    date: serverDate
                  }
                : note
            );
            
            // 상태 최종 업데이트
            set({
              driverNotes: {
                ...state.driverNotes,
                [driverId]: syncedNotes
              }
            });
            
            console.log('서버 응답 동기화 후:', syncedNotes);
          }
          
          toast.success('특이사항이 수정되었습니다.');
          
          return {
            id: updatedNote.id,
            content: updatedNote.content,
            date: updatedNote.date ? new Date(updatedNote.date) : new Date()
          };
        } catch (error) {
          console.error('특이사항 수정 API 오류:', error);
          
          toast.error('특이사항 수정에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          
          throw error;
        }
      },
      
      deleteDriverNote: async (noteId, driverId) => {
        try {
          console.log('deleteDriverNote 호출됨:', { noteId, driverId });
          
          // 기존 상태 확인
          const state = get();
          const currentNotes = state.driverNotes[driverId] || [];
          console.log('삭제 전 특이사항 목록:', currentNotes);
          
          // 먼저 UI 업데이트를 위해 로컬 상태 변경
          const updatedNotes = currentNotes.filter(note => note.id !== noteId);
          console.log('삭제 후 특이사항 목록:', updatedNotes);
          
          // 상태 업데이트
          set({
            driverNotes: {
              ...state.driverNotes,
              [driverId]: updatedNotes
            }
          });
          
          // API 호출하여 특이사항 삭제
          await deleteDriverNote(noteId);
          console.log('API 삭제 완료');
          
          toast.success('특이사항이 삭제되었습니다.');
        } catch (error) {
          console.error('특이사항 삭제 API 오류:', error);
          
          toast.error('특이사항 삭제에 실패했습니다.', {
            description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          });
          
          throw error;
        }
      },
    }),
    {
      name: 'broker-driver-storage',
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        filter: state.filter,
        pageSize: state.pageSize
      }),
    }
  )
); 