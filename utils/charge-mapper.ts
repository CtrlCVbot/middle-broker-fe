import { 
  IAdditionalFeeInput, 
  CreateChargeGroupInput, 
  CreateChargeLineInput, 
  IFinanceItem,
  IFinanceSummary
} from '@/types/broker-charge';

/**
 * 프론트엔드 추가 비용 입력을 백엔드 운임 그룹 요청으로 변환
 */
export function mapAdditionalFeeToChargeGroup(
  fee: IAdditionalFeeInput,
  orderId: string,
  dispatchId?: string
): CreateChargeGroupInput {
  // 추가 비용 타입을 ChargeReason으로 매핑
  const reasonMap: Record<string, any> = {
    '기본': 'base_freight',
    '대기': 'extra_wait',
    '수작업': 'etc',
    '왕복': 'etc',
    '톨비': 'toll',
    '수수료': 'etc',
    '현장착불': 'etc',
    '기타': 'etc'
  };

  return {
    orderId,
    dispatchId,
    stage: 'estimate', // 견적 단계로 초기화
    reason: reasonMap[fee.type] || 'etc',
    description: fee.memo
  };
}

/**
 * 프론트엔드 추가 비용 입력을 백엔드 운임 라인 요청으로 변환
 */
export function mapAdditionalFeeToChargeLine(
  fee: IAdditionalFeeInput,
  groupId: string,
  side: 'sales' | 'purchase'
): CreateChargeLineInput | null {
  // 해당 side에 대한 금액이 없으면 null 반환
  if (
    (side === 'sales' && !fee.target.charge) || 
    (side === 'purchase' && !fee.target.dispatch)
  ) {
    return null;
  }

  // amounts가 있으면 해당 side의 금액 사용, 없으면 공통 amount 사용
  let amount = parseFloat(fee.amount || '0');
  
  if (fee.amounts) {
    if (side === 'sales' && fee.amounts.charge) {
      amount = parseFloat(fee.amounts.charge || '0');
    } else if (side === 'purchase' && fee.amounts.dispatch) {
      amount = parseFloat(fee.amounts.dispatch || '0');
    }
  }
  
  // 유효한 숫자가 아니면 0으로 설정
  if (isNaN(amount)) {
    amount = 0;
  }

  return {
    groupId,
    side,
    amount,
    memo: fee.memo,
    taxRate: 10 // 기본 세율 10%
  };
}

/**
 * 운임 데이터를 FinanceSummaryCard에 표시할 형식으로 변환
 */
export function mapChargeDataToFinanceSummary(chargeGroups: any[]): IFinanceSummary {
  const income: IFinanceItem[] = [];
  const expense: IFinanceItem[] = [];
  
  chargeGroups.forEach(group => {
    const reasonLabels: Record<string, string> = {
      'base_freight': '기본',
      'extra_wait': '대기',
      'night_fee': '야간',
      'toll': '톨비',
      'discount': '할인',
      'penalty': '패널티',
      'etc': '기타'
    };
    
    const label = reasonLabels[group.reason] || group.reason;
    
    // 운임 라인 처리
    group.chargeLines?.forEach((line: any) => {
      if (line.side === 'sales') {
        income.push({
          label,
          amount: Number(line.amount)
        });
      } else if (line.side === 'purchase') {
        expense.push({
          label,
          amount: Number(line.amount)
        });
      }
    });
  });
  
  // 총액 계산
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;
  
  return {
    title: '운임 정산',
    date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ' 기준',
    income,
    expense,
    balance
  };
}

/**
 * 숫자 형식의 금액을 포맷팅
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
} 