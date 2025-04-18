import { useCompanyStore } from './company-store';

// 레거시 호환성을 위한 export - useBrokerCompanyStore를 useCompanyStore로 연결
export const useBrokerCompanyStore = useCompanyStore;

// 새로운 스토어로 export
export { useCompanyStore }; 