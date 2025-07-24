import React from 'react';

export interface IRegisterEstimateInfoCardProps {
  estimatedDistance?: number;
  estimatedAmount?: number;
  isCalculating?: boolean;
}

export function RegisterEstimateInfoCard({ estimatedDistance, estimatedAmount, isCalculating }: IRegisterEstimateInfoCardProps) {
  // 예상 거리 표시 텍스트 결정
  let distanceText = '측정 전';
  if (typeof estimatedDistance === 'number' && estimatedDistance > 0) {
    distanceText = `${estimatedDistance} km`;
  } else if (estimatedDistance === 0) {
    distanceText = '측정 전';
  }

  // 예상 금액 표시 텍스트 결정
  let amountText = '-';
  if (typeof estimatedAmount === 'number') {
    amountText = estimatedAmount === 0 ? '협의' : `${estimatedAmount.toLocaleString()} 원`;
  }

  return (
    <div className="space-y-2 p-4 border rounded">
      
      {isCalculating ? (
        <div className="text-blue-500">계산 중...</div>
      ) : (
        <>
          <div>예상 거리: <span className="font-bold">{distanceText}</span></div>
          <div>예상 금액: <span className="font-bold">{amountText}</span></div>
        </>
      )}
    </div>
  );
} 