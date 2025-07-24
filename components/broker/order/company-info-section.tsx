import React from 'react';

export interface ICompanyInfoSectionProps {
  companyInfo: {
    name: string;
    address?: string;
    contact?: string;
  };
  onChange: (info: Partial<ICompanyInfoSectionProps['companyInfo']>) => void;
}

export function CompanyInfoSection({ companyInfo, onChange }: ICompanyInfoSectionProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold">회사 정보</div>
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="회사명"
        value={companyInfo.name}
        onChange={e => onChange({ name: e.target.value })}
      />
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="주소"
        value={companyInfo.address || ''}
        onChange={e => onChange({ address: e.target.value })}
      />
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="연락처"
        value={companyInfo.contact || ''}
        onChange={e => onChange({ contact: e.target.value })}
      />
    </div>
  );
} 