import { create } from 'zustand';
import { toast } from 'sonner';
import { 
  ISettlement, 
  ISettlementChartData, 
  ISettlementFilters, 
  ISettlementState, 
  SettlementStatus
} from '@/types/settlement';
import { 
  fetchMockSettlements, 
  fetchMockSettlementById, 
  fetchMockSettlementChartData, 
  updateMockSettlementStatus 
} from '@/utils/mockdata/mock-settlements';

// 초기 필터 상태
const initialFilters: ISettlementFilters = {
  startDate: null,
  endDate: null,
  companyName: null,
  driverName: null,
  status: null
};

// 엑셀 다운로드 함수
const downloadExcelFile = (settlements: ISettlement[]) => {
  // 실제 구현에서는 엑셀 라이브러리를 사용하여 구현
  // 예: xlsx 라이브러리 활용
  console.log('엑셀 다운로드:', settlements);
  toast.success('엑셀 다운로드가 시작되었습니다.');
};

// PDF 다운로드 함수
const downloadPdfFile = (settlements: ISettlement[]) => {
  // 실제 구현에서는 PDF 라이브러리를 사용하여 구현
  // 예: jspdf 또는 PDF 생성 API 활용
  console.log('PDF 다운로드:', settlements);
  toast.success('PDF 다운로드가 시작되었습니다.');
};

// 정산 관리 스토어 생성
export const useSettlementStore = create<ISettlementState>((set, get) => ({
  // 상태
  settlements: [],
  loading: {
    list: false,
    detail: false,
    chart: false
  },
  selectedSettlement: null,
  chartData: {
    monthlyTrend: [],
    companyDistribution: [],
    driverContribution: [],
    statusDistribution: []
  },
  filters: initialFilters,
  
  // 액션
  // 정산 목록 조회
  fetchSettlements: async () => {
    try {
      set({ loading: { ...get().loading, list: true } });
      const data = await fetchMockSettlements();
      
      // 필터 적용
      const { filters } = get();
      const filteredData = data.filter(settlement => {
        // 회사명 필터
        if (filters.companyName && !settlement.companyName.includes(filters.companyName)) {
          return false;
        }
        
        // 시작일 필터
        if (filters.startDate && settlement.startDate < filters.startDate) {
          return false;
        }
        
        // 종료일 필터
        if (filters.endDate && settlement.endDate > filters.endDate) {
          return false;
        }
        
        // 상태 필터
        if (filters.status && settlement.status !== filters.status) {
          return false;
        }
        
        // 운전기사 필터 (items 내에 driverName이 포함된 항목이 있는지 확인)
        if (filters.driverName) {
          return settlement.items.some(item => 
            item.driverName.includes(filters.driverName as string)
          );
        }
        
        return true;
      });
      
      set({ settlements: filteredData });
    } catch (error) {
      console.error('정산 목록 조회 중 오류 발생:', error);
      toast.error('정산 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      set({ loading: { ...get().loading, list: false } });
    }
  },
  
  // 특정 정산 데이터 조회
  fetchSettlementById: async (id: string) => {
    try {
      set({ loading: { ...get().loading, detail: true } });
      const data = await fetchMockSettlementById(id);
      set({ selectedSettlement: data });
    } catch (error) {
      console.error('정산 상세 조회 중 오류 발생:', error);
      toast.error('정산 상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      set({ loading: { ...get().loading, detail: false } });
    }
  },
  
  // 차트 데이터 조회
  fetchChartData: async () => {
    try {
      set({ loading: { ...get().loading, chart: true } });
      const data = await fetchMockSettlementChartData();
      set({ chartData: data });
    } catch (error) {
      console.error('정산 차트 데이터 조회 중 오류 발생:', error);
      toast.error('차트 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      set({ loading: { ...get().loading, chart: false } });
    }
  },
  
  // 정산 상태 업데이트
  updateSettlementStatus: async (id: string, status: SettlementStatus) => {
    try {
      const { settlements, selectedSettlement } = get();
      
      // API 호출
      const updatedSettlement = await updateMockSettlementStatus(id, status);
      
      if (!updatedSettlement) {
        throw new Error('정산 상태 업데이트에 실패했습니다.');
      }
      
      // 목록 업데이트
      const updatedSettlements = settlements.map(s => 
        s.id === id ? updatedSettlement : s
      );
      
      // 현재 선택된 정산 데이터 업데이트
      const updatedSelected = selectedSettlement?.id === id 
        ? updatedSettlement 
        : selectedSettlement;
      
      set({ 
        settlements: updatedSettlements, 
        selectedSettlement: updatedSelected 
      });
      
      toast.success(`정산이 성공적으로 ${status === 'COMPLETED' ? '완료' : '미완료'}로 변경되었습니다.`);
    } catch (error) {
      console.error('정산 상태 업데이트 중 오류 발생:', error);
      toast.error('정산 상태 변경 중 오류가 발생했습니다.');
    }
  },
  
  // 필터 적용
  applyFilters: (filters: Partial<ISettlementFilters>) => {
    set({ filters: { ...get().filters, ...filters } });
    get().fetchSettlements();
  },
  
  // 필터 초기화
  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchSettlements();
  },
  
  // 엑셀 다운로드
  downloadExcel: async () => {
    const { settlements, selectedSettlement } = get();
    const dataToDownload = selectedSettlement 
      ? [selectedSettlement] 
      : settlements;
    
    downloadExcelFile(dataToDownload);
    return Promise.resolve();
  },
  
  // PDF 다운로드
  downloadPdf: async () => {
    const { settlements, selectedSettlement } = get();
    const dataToDownload = selectedSettlement 
      ? [selectedSettlement] 
      : settlements;
    
    downloadPdfFile(dataToDownload);
    return Promise.resolve();
  }
})); 