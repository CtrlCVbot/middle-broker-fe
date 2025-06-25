import React from 'react';

export interface IManagerInfoSectionProps {
  managerInfo: {
    name: string;
    contact?: string;
  };
  onChange: (info: Partial<IManagerInfoSectionProps['managerInfo']>) => void;
}

export function ManagerInfoSection({ managerInfo, onChange }: IManagerInfoSectionProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold">담당자 정보</div>
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="담당자명"
        value={managerInfo.name}
        onChange={e => onChange({ name: e.target.value })}
      />
      <input
        className="border px-2 py-1 rounded w-full"
        placeholder="연락처"
        value={managerInfo.contact || ''}
        onChange={e => onChange({ contact: e.target.value })}
      />
    </div>
  );
} 