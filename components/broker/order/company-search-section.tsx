import React from 'react';

export interface ICompanySearchSectionProps {
  selectedCompany?: any;
  onSelectCompany: (company: any) => void;
}

export function CompanySearchSection({ selectedCompany, onSelectCompany }: ICompanySearchSectionProps) {
  // TODO: 실제 검색/선택 UI 및 로직 구현
  return (
    <div>
      <div className="mb-2 font-semibold">업체 검색/선택</div>
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded"
        onClick={() => onSelectCompany({ id: 'sample', name: '샘플회사' })}
      >
        샘플 회사 선택
      </button>
      {selectedCompany && (
        <div className="mt-2 text-sm text-gray-700">선택된 회사: {selectedCompany.name}</div>
      )}
    </div>
  );
} 