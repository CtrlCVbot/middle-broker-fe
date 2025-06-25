import React from 'react';

export interface IRegisterEstimateInfoCardProps {
  estimatedDistance?: number;
  estimatedAmount?: number;
  isCalculating?: boolean;
}

export function RegisterEstimateInfoCard({ estimatedDistance, estimatedAmount, isCalculating }: IRegisterEstimateInfoCardProps) {
  return (
    <div className="space-y-2 p-4 border rounded">
      <div className="font-semibold mb-2">예상 정보</div>
      {isCalculating ? (
        <div className="text-blue-500">계산 중...</div>
      ) : (
        <>
          <div>예상 거리: <span className="font-bold">{estimatedDistance ?? '-'} km</span></div>
          <div>예상 금액: <span className="font-bold">{estimatedAmount ? estimatedAmount.toLocaleString() : '-'} 원</span></div>
        </>
      )}
    </div>
  );
} 