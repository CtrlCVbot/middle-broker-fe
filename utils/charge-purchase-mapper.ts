import { 
  IAdditionalFeeInput, 
  CreateChargeGroupInput, 
  CreateChargeLineInput, 
  IFinanceItem,
  IFinanceSummary,
  IOrderPurchase,
  IOrderPurchaseSummary,
  ISettlementWaitingItem,
  ICompanySummary,
  ISettlementSummary,
  IChargeGroupWithLines,
  CreatePurchaseBundleInput,
  ISettlementFormData,
  IPurchaseBundleListItem
} from '@/types/broker-charge-purchase';
import { IBrokerOrder } from '@/types/broker-order';
import { IIncome, IncomeStatusType } from '@/types/income';

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

/**
 * 구매 인보이스 데이터를 브로커 주문 형태로 변환
 * @param orderSales 구매 인보이스 데이터 배열
 * @param brokerOrders 브로커 주문 데이터 배열 (상세 정보를 위해)
 */
export function mapOrderSalesToBrokerOrders(
  orderSales: IOrderPurchase[],
  brokerOrders: IBrokerOrder[]
): IBrokerOrder[] {
  // orderId를 키로 하는 brokerOrders 맵 생성
  const orderMap = new Map<string, IBrokerOrder>();
  brokerOrders.forEach(order => {
    orderMap.set(order.id, order);
  });

  // orderSales를 IBrokerOrder 형태로 변환
  return orderSales.map(sale => {
    const order = orderMap.get(sale.orderId);
    if (!order) {
      // 원본 주문 정보가 없는 경우 기본 정보만 포함
      return {
        id: sale.orderId,
        company: "알 수 없음",
        status: "운송완료",
        amount: sale.totalAmount,
        chargeAmount: sale.totalAmount,
        departureLocation: "정보 없음",
        arrivalLocation: "정보 없음",
        departureDateTime: sale.createdAt,
        arrivalDateTime: sale.createdAt,
        vehicle: { type: "정보 없음", weight: "정보 없음" },
        driver: { name: "정보 없음" },
        paymentMethod: "계좌이체",
        manager: sale.createdBy
      } as IBrokerOrder;
    }

    // 원본 주문 정보와 매출 정보를 병합
    return {
      ...order,
      status: "운송완료",
      chargeAmount: sale.totalAmount,
      isSettlementWaiting: true
    };
  });
}

/**
 * 선택된 구매 인보이스 데이터를 회사별로 요약
 * @param sales 선택된 구매 인보이스 데이터
 * @param companies 회사 정보 (id와 이름 매핑을 위한)
 */
export function calculatePurchaseSummary(
  sales: IOrderPurchase[],
  companies: { id: string; name: string }[]
): ISettlementSummary {
  // 회사 ID를 키로 하는 회사 이름 맵 생성
  const companyMap = new Map<string, string>();
  companies.forEach(company => {
    companyMap.set(company.id, company.name);
  });

  // 회사별 요약 데이터 집계
  const companySummaries = new Map<string, ICompanySummary>();
  
  sales.forEach(sale => {
    const companyId = sale.companyId;
    const companyName = companyMap.get(companyId) || "알 수 없음";
    
    // 배차비는 일단 총액의 90%로 가정 (실제로는 다른 방식으로 계산해야 함)
    const chargeAmount = sale.totalAmount;
    const dispatchAmount = Math.round(sale.totalAmount * 0.9); // 예상 배차비
    const profitAmount = chargeAmount - dispatchAmount;
    
    if (companySummaries.has(companyId)) {
      const summary = companySummaries.get(companyId)!;
      summary.items += 1;
      summary.chargeAmount += chargeAmount;
      summary.dispatchAmount += dispatchAmount;
      summary.profitAmount += profitAmount;
    } else {
      companySummaries.set(companyId, {
        companyId,
        companyName,
        items: 1,
        chargeAmount,
        dispatchAmount,
        profitAmount
      });
    }
  });
  
  // 전체 합계 계산
  const companySummariesList = Array.from(companySummaries.values());
  const totalItems = companySummariesList.reduce((sum, company) => sum + company.items, 0);
  const totalChargeAmount = companySummariesList.reduce((sum, company) => sum + company.chargeAmount, 0);
  const totalDispatchAmount = companySummariesList.reduce((sum, company) => sum + company.dispatchAmount, 0);
  const totalProfitAmount = companySummariesList.reduce((sum, company) => sum + company.profitAmount, 0);
  
  return {
    totalItems,
    totalChargeAmount,
    totalDispatchAmount,
    totalProfitAmount,
    companies: companySummariesList
  };
}

/**
 * 정산 대기 항목을 IBrokerOrder 형태로 변환
 * @param waitingItems 정산 대기 항목 배열
 */
export function mapWaitingItemsToBrokerOrders(
  waitingItems: ISettlementWaitingItem[]
): IBrokerOrder[] {
  return waitingItems.map(item => ({    
    id: item.id,
    status: item.flowStatus,
    statusProgress: item.flowStatus,
    departureDateTime: item.pickupDate + " " + item.pickupTime,
    departureCity: item.pickupName,
    departureLocation: item.pickupAddressSnapshot?.name,
    arrivalDateTime: item.deliveryDate + " " + item.deliveryTime,
    arrivalCity: item.deliveryName,
    arrivalLocation: item.deliveryAddressSnapshot?.name,

    shipperId: item.companyId,
    shipperName: item.companyName,
    shipperBusinessNumber: item.companyBusinessNumber,

    amount: item.amount,
    
    bankName: item.companyBankCode,
    accountHolder: item.companyBankAccountHolder,
    accountNumber: item.companyBankAccount,

    pickupTime: item.pickupTime,
    deliveryTime: item.deliveryTime,
    //shipperCeo: item.companyCeo,
    pickupAddressSnapshot: item.pickupAddressSnapshot,
    deliveryAddressSnapshot: item.deliveryAddressSnapshot,
    
   
  } as IBrokerOrder));
}

/**
 * SettlementEditFormSheet의 formData, waitingItems, additionalFees 등에서 sales bundle 생성 API DTO로 변환
 */
export function mapSettlementFormToPurchaseBundleInput(
  formData: ISettlementFormData,
  selectedWaitingItems: ISettlementWaitingItem[],
  additionalAdjustments?: { type: 'discount' | 'surcharge'; description?: string; amount: number }[]
): CreatePurchaseBundleInput {
  console.log('mapSettlementFormToPurchaseBundleInput - formData:', formData);
  console.log('mapSettlementFormToPurchaseBundleInput - selectedWaitingItems:', selectedWaitingItems);
  
  // totalAmount를 명시적으로 number로 계산
  // const totalAmount = selectedWaitingItems.reduce((sum, item) => {
  //   const amount = Number(item.chargeAmount) || 0;
  //   console.log(`Item ${item.id} chargeAmount: ${item.chargeAmount} -> ${amount}`);
  //   return sum + amount;
  // }, 0);
  
  //console.log('Calculated totalAmount:', totalAmount);
  
  // 날짜 값 검증 및 기본값 설정
  const periodFrom = formData.startDate || new Date().toISOString().split('T')[0];
  const periodTo = formData.endDate || new Date().toISOString().split('T')[0];
  
  console.log('Period dates - from:', periodFrom, 'to:', periodTo);
  
  const result = {
    companyId: formData.shipperId,
    managerId: formData.managerId,
    bankCode: formData.bankName || '',
    bankAccount: formData.accountNumber || '',
    bankAccountHolder: formData.accountHolder || '',
    memo: formData.memo || '',
    periodType: formData.periodType,
    periodFrom,
    periodTo,
    settledAt: formData.dueDate || undefined,
    invoiceNo: undefined, // 추후 구현
    totalAmount: Number(formData.totalAmount) || 0,
    totalTaxAmount: Number(formData.totalTaxAmount) || 0,
    totalAmountWithTax: Number(formData.totalAmountWithTax) || 0,
    status: 'draft' as const,
    items: selectedWaitingItems.map(item => ({
      orderPurchaseId: item.id, // 실제로는 orderPurchaseId, 필요시 매핑 보정
      baseAmount: Number(item.chargeAmount) || 0
    })),
    adjustments: additionalAdjustments || [],
    orderCount: selectedWaitingItems.length,
    invoiceIssuedAt: formData.invoiceIssuedAt || null,
    depositReceivedAt: formData.depositReceivedAt || null,
  };
  
  console.log('Final CreatePurchaseBundleInput:', result);
  return result;
}

/**
 * Purchase Bundle 상태를 Income 상태로 매핑
 */
function mapPurchaseBundleStatusToIncomeStatus(status: string): IncomeStatusType {
  switch (status) {
    case 'draft':
      return 'MATCHING'; // 작성 중 = 정산대사
    case 'issued':
    case 'paid':
      return 'COMPLETED'; // 발행/입금완료 = 정산완료
    case 'canceled':
      return 'WAITING'; // 취소 = 정산대기 (재작업 필요)
    default:
      return 'MATCHING';
  }
}

/**
 * Purchase Bundle 목록을 Income 목록으로 변환
 * @param purchaseBundles Purchase Bundle 목록
 */
export function mapPurchaseBundlesToIncomes(purchaseBundles: IPurchaseBundleListItem[]): IIncome[] {
  return purchaseBundles.map(bundle => {
    const totalAmount = Number(bundle.totalAmount) || 0;
    const totalTaxAmount = Number(bundle.totalTaxAmount) || 0;
    const totalAmountWithTax = Number(bundle.totalAmountWithTax) || 0;

    // 세금계산서 상태 매핑
    let invoiceStatus: '미발행' | '발행대기' | '발행완료' | '발행오류' = '미발행';
    if (bundle.invoiceIssuedAt) {
      invoiceStatus = '발행완료';
    } else if (bundle.status === 'issued') {
      invoiceStatus = '발행대기';
    }

    return {
      id: bundle.id,
      status: mapPurchaseBundleStatusToIncomeStatus(bundle.status),
      orderIds: [], // sales_bundle_items에서 가져와야 하므로 현재는 빈 배열
      orderCount: bundle.orderCount, // 실제로는 sales_bundle_items 개수
      
      // 화주 정보
      shipperId: bundle.companyId,
      shipperName: bundle.companySnapshot?.name || '알 수 없음',
      businessNumber: bundle.companySnapshot?.businessNumber || '000-00-00000',
      
      // 정산 기간
      startDate: bundle.periodFrom || bundle.createdAt.split('T')[0],
      endDate: bundle.periodTo || bundle.createdAt.split('T')[0],
      
      // 금액 정보
      totalBaseAmount: totalAmount, // 기본 운임 (추가금 제외)
      totalAdditionalAmount: Number(bundle.bundleExtraAmount) + Number(bundle.itemExtraAmount) || 0, // 추가금 (bundle_adjustments에서 계산)
      totalAmount: totalAmount,
      tax: totalTaxAmount,
      isTaxFree: totalTaxAmount === 0,
      finalAmount: totalAmountWithTax,
      
      // 추가 정보
      additionalFees: [], // 실제로는 bundle_adjustments에서 변환
      logs: [], // 상태 변경 이력
      
      // 정산서 관련 정보
      invoiceNumber: bundle.invoiceNo,
      invoiceIssuedDate: bundle.invoiceIssuedAt,
      invoiceStatus,

      //걸제 정보
      depositReceivedAt: bundle.depositReceivedAt,
      
      // 관리 정보
      manager: bundle.managerSnapshot?.name || '담당자 미지정',
      managerContact: bundle.managerSnapshot?.mobile,
      createdAt: bundle.createdAt,
      updatedAt: bundle.updatedAt,
      memo: bundle.settlementMemo,
      
    } as IIncome;
  });
}
