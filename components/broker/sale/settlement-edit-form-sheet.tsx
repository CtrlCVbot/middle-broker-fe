"use client";

//react
import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";


//ui
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { 
  CalendarIcon,
  Loader2,
  Save,
  X,
  Ellipsis,
} from "lucide-react";

//components
import { FreightListTable } from "@/components/broker/sale/freight-list-table";
import { BundleAdjustmentManager } from "@/components/broker/sale/bundle-adjustment-manager";
import { ItemAdjustmentDialog } from "@/components/broker/sale/item-adjustment-dialog";
//import { CompanyInfoSection } from "@/components/broker/sale/company-info-section";
import { CompanyInfoSection } from "@/components/broker/sale/company-info-section-ver01";
import { ManagerInfoSection } from "@/components/broker/sale/manager-info-section";

//types
import { IBrokerOrder } from "@/types/broker-order";
import { ISettlementFormData, ISettlementWaitingItem } from "@/types/broker-charge";

//store
import { useCompanies, useCompanyStore } from '@/store/company-store';
import { useBrokerCompanyManagerStore } from '@/store/broker-company-manager-store';
import { useBrokerChargeStore } from '@/store/broker-charge-store';

//utils
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";



// 정산 생성 폼 스키마
const formSchema = z.object({
  shipperName: z.string({
    required_error: "화주명은 필수 입력 항목입니다.",
  }),
  businessNumber: z.string({
    required_error: "사업자번호는 필수 입력 항목입니다.",
  }),
  shipperCeo: z.string().optional(),
  manager: z.string({
    required_error: "담당자명은 필수 입력 항목입니다.",
  }),
  managerContact: z.string({
    required_error: "담당자 연락처는 필수 입력 항목입니다.",
  }),
  managerEmail: z.string().email({
    message: "유효한 이메일 주소를 입력해 주세요.",
  }).optional(),
  periodType: z.enum(["departure", "arrival"], {
    required_error: "정산 구분을 선택해 주세요.",
  }),
  startDate: z.string({
    required_error: "시작일은 필수 입력 항목입니다.",
  }),
  endDate: z.string({
    required_error: "종료일은 필수 입력 항목입니다.",
  }),
  dueDate: z.date({
    required_error: "정산 만료일은 필수 입력 항목입니다.",
  }),
  memo: z.string().optional(),
  taxFree: z.boolean().default(false),
  hasTax: z.boolean().default(true),
  issueInvoice: z.boolean().default(false),
  paymentMethod: z.string().default("BANK_TRANSFER"),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 결제방법 DB/백엔드 값 → Select value 매핑 함수
function mapPaymentMethodToSelectValue(method?: string): string {
  if (!method) return 'BANK_TRANSFER';
  switch (method.toLowerCase()) {
    case 'bank_transfer':
    case '계좌이체':
    case '은행이체':
      return 'BANK_TRANSFER';
    case 'card':
    case 'credit_card':
    case '신용카드':
    case '카드':
      return 'CREDIT_CARD';
    case 'cash':
    case '현금':
      return 'CASH';
    default:
      return 'BANK_TRANSFER';
  }
}

export function SettlementEditFormSheet() {
  // 1. form 선언을 최상단에 위치
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shipperName: "",
      businessNumber: "",
      manager: "",
      managerContact: "",
      managerEmail: "",
      periodType: "departure",
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      memo: "",
      taxFree: false,
      hasTax: true,
      issueInvoice: false,
      paymentMethod: "BANK_TRANSFER",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
    },
  });

  // 실제 store 연동
  const {
    settlementForm,
    closeSettlementForm,
    createSalesBundleFromWaitingItems,
    isLoading,
    selectedSalesBundleId,
    editingSalesBundle,
    updateSalesBundleData,
    deleteSalesBundleData,
    bundleFreightList,
    bundleAdjustments,
    fetchBundleAdjustments
  } = useBrokerChargeStore();

  const { isOpen, selectedItems: orders, formData } = settlementForm;

  
  
  // 편집 모드 여부 확인
  const isEditMode = selectedSalesBundleId !== null;
  
  const [loading, setLoading] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const { setFilter } = useCompanyStore();
  const companiesQuery = useCompanies();

  
  
  // 담당자 관리 store 사용
  const {
    managers: brokerManagers,
    isLoading: isLoadingManagers,
    setFilter: setManagerFilter,
    loadManagers,
    currentCompanyId
  } = useBrokerCompanyManagerStore();

  // 개별 화물 추가금 다이얼로그 상태
  const [itemAdjustmentDialog, setItemAdjustmentDialog] = useState<{
    open: boolean;
    itemId?: string;
    adjustmentId?: string;
  }>({
    open: false
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 개별 추가금 삭제 다이얼로그 상태
  const [itemDeleteDialog, setItemDeleteDialog] = useState<{
    open: boolean;
    itemId?: string;
    adjustmentId?: string;
  }>({ open: false });

  // 개별 추가금 삭제 핸들러
  const handleItemAdjustmentDelete = (itemId: string, adjustmentId: string) => {
    setItemDeleteDialog({ open: true, itemId, adjustmentId });
  };

  const handleConfirmItemDelete = () => {
    const { itemId, adjustmentId } = itemDeleteDialog;
    if (itemId && adjustmentId) {
      const { removeItemAdjustment } = useBrokerChargeStore.getState();
      removeItemAdjustment(itemId, adjustmentId);
      toast.success("추가금이 삭제되었습니다.");
    }
    setItemDeleteDialog({ open: false });
  };

  

  // 정산 생성 이벤트 리스너 추가
  useEffect(() => {
    // 이벤트 핸들러 함수
    const handleOpenSettlementForm = (event: Event) => {
      const customEvent = event as CustomEvent<{orders: IBrokerOrder[]}>;
      
      if (customEvent.detail?.orders && Array.isArray(customEvent.detail.orders)) {
        console.log("정산 폼 열기 이벤트 수신", customEvent.detail.orders.length, "개의 화물");
        
        // 다음 렌더 사이클에서 상태 업데이트 (경쟁 상태 방지)
        // setTimeout(() => {
        //   openForm(customEvent.detail.orders);
        // }, 0);
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('openSettlementForm', handleOpenSettlementForm);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('openSettlementForm', handleOpenSettlementForm);
    };
  }, []);

  // 편집 모드일 때 기존 데이터를 폼에 로드
  useEffect(() => {
    if (isEditMode && editingSalesBundle && isOpen) {
      console.log('편집 모드: 기존 데이터 로드', editingSalesBundle);
      
      //화주 데이터 로드
      setSelectedCompanyId(editingSalesBundle.companyId || '');
      form.setValue('shipperName', editingSalesBundle.companySnapshot?.name || '');
      form.setValue('businessNumber', editingSalesBundle.companySnapshot?.businessNumber || '');
      form.setValue('shipperCeo', editingSalesBundle.companySnapshot?.ceoName || '');
      console.log('selectedCompanyId:', selectedCompanyId);
      // 담당자 데이터 로드
      form.setValue('manager', editingSalesBundle.managerSnapshot?.name || '');
      form.setValue(
        'managerContact',
        editingSalesBundle.managerSnapshot?.contact ||
        editingSalesBundle.managerSnapshot?.phoneNumber ||
        editingSalesBundle.managerSnapshot?.phone ||
        editingSalesBundle.managerSnapshot?.mobile ||
        ''
      );
      form.setValue('managerEmail', editingSalesBundle.managerSnapshot?.email || '');


      form.setValue('periodType', editingSalesBundle.periodType || 'departure');
      form.setValue('startDate', editingSalesBundle.periodFrom || '');
      form.setValue('endDate', editingSalesBundle.periodTo || '');
      form.setValue('memo', editingSalesBundle.settlementMemo || '');
      form.setValue('taxFree', editingSalesBundle.totalTaxAmount === 0);
      form.setValue('paymentMethod', mapPaymentMethodToSelectValue(editingSalesBundle.paymentMethod));
      form.setValue('bankName', editingSalesBundle.bankCode || '');
      form.setValue('accountHolder', editingSalesBundle.bankAccountHolder || '');
      form.setValue('accountNumber', editingSalesBundle.bankAccount || '');
      
      // 만료일 설정 (있는 경우)
      if (editingSalesBundle.depositRequestedAt) {
        form.setValue('dueDate', new Date(editingSalesBundle.depositRequestedAt));
      }
    }
  }, [isEditMode, editingSalesBundle, isOpen, form]);

  // 정산 기간 설정 - 가장 빠른 상차일과 가장 늦은 하차일로 자동 설정 (생성 모드에서만)
  useEffect(() => {
    if (isEditMode || !orders || orders.length === 0 || !isOpen) return;    
    
    let earliestLoadingDate = new Date(orders[0].pickupDate);
    let latestUnloadingDate = new Date(orders[0].deliveryDate);

    orders.forEach(order => {
      const loadingDate = new Date(order.pickupDate);
      const unloadingDate = new Date(order.deliveryDate);

      if (loadingDate < earliestLoadingDate) {
        earliestLoadingDate = loadingDate;
      }
      
      if (unloadingDate > latestUnloadingDate) {
        latestUnloadingDate = unloadingDate;
      }
    });

    const startDate = format(earliestLoadingDate, 'yyyy-MM-dd');
    const endDate = format(latestUnloadingDate, 'yyyy-MM-dd');

    form.setValue('startDate', startDate);
    form.setValue('endDate', endDate);
  }, [orders, isOpen, form]);

  // 정산 구분에 따른 날짜 변경
  const handlePeriodTypeChange = (value: string) => {
    if (value === "departure" || value === "arrival") {
      form.setValue('periodType', value);
    }
    if (!orders || orders.length === 0) return;

    if (value === 'departure') {
      let earliestDate = new Date(orders[0].pickupDate);
      let latestDate = new Date(orders[orders.length - 1].pickupDate);

      orders.forEach(order => {
        const date = new Date(order.pickupDate);
        if (date < earliestDate) earliestDate = date;
        if (date > latestDate) latestDate = date;
      });

      const start = format(earliestDate, 'yyyy-MM-dd');
      const end = format(latestDate, 'yyyy-MM-dd');
      form.setValue('startDate', start);
      form.setValue('endDate', end);

      // ★ 폼 값도 동기화
      form.setValue('startDate', start);
      form.setValue('endDate', end);
    } else {
      let earliestDate = new Date(orders[0].pickupDate);
      let latestDate = new Date(orders[0].pickupDate);

      orders.forEach(order => {
        const date = new Date(order.pickupDate);
        if (date < earliestDate) earliestDate = date;
        if (date > latestDate) latestDate = date;
      });

      const start = format(earliestDate, 'yyyy-MM-dd');
      const end = format(latestDate, 'yyyy-MM-dd');
      form.setValue('startDate', start);
      form.setValue('endDate', end);

      // ★ 폼 값도 동기화
      form.setValue('startDate', start);
      form.setValue('endDate', end);
    }
  };


  // 정산 대사 모드에서 통합 추가금 로딩
  useEffect(() => {
    console.log("정산 대사 모드에서 통합 추가금 로딩");

    if (isEditMode && editingSalesBundle && isOpen) {
      fetchBundleAdjustments(editingSalesBundle.id);
    }
  }, [fetchBundleAdjustments]);

  // 화주 데이터 - 대부분의 화물이 같은 화주일 경우 해당 화주를 기본값으로 설정
  useEffect(() => {
    if (!orders || orders.length === 0 || !isOpen) return;
    
    const shipperCounts: Record<string, { count: number, businessNumber: string, ceo: string }> = {};
    
    orders.forEach(order => {
      if (order.companyName) {
        if (!shipperCounts[order.companyName]) {
          shipperCounts[order.companyName] = { 
            count: 1,
            businessNumber: order.companyBusinessNumber || '',
            ceo: order.companyCeo || ''            
          };
        } else {
          shipperCounts[order.companyName].count++;
        }
      }
    });
    
    let maxCount = 0;
    let mainShipper = '';
    let mainBusinessNumber = '';
    let mainShipperCeo = '';

    for (const shipper in shipperCounts) {
      if (shipperCounts[shipper].count > maxCount) {
        maxCount = shipperCounts[shipper].count;
        mainShipper = shipper;
        mainBusinessNumber = shipperCounts[shipper].businessNumber;
        mainShipperCeo = shipperCounts[shipper].ceo;
      }
    }
    //console.log('mainShipper:', mainShipper);
    //console.log('mainBusinessNumber:', mainBusinessNumber);
    // form.setValue('shipperName', mainShipper);
    // form.setValue('businessNumber', mainBusinessNumber);

    //form.setValue('shipperCeo', mainShipperCeo);
    // 매출 회사 = 화주로 기본 설정
    //form.setValue('billingCompany', mainShipper);
  }, [orders, isOpen, form]);

  // 정산 대상 화물 요약 계산
  const ordersSummary = useMemo(() => {
    if (!orders || orders.length === 0) return { totalOrders: 0, totalFreight: 0, totalDispatch: 0 };
    
    return orders.reduce(
      (acc, order) => {
        acc.totalOrders++;
        acc.totalFreight += Number(order.amount) || 0;
        //acc.totalDispatch += order.fee || 0;
        return acc;
      },
      { totalOrders: 0, totalFreight: 0, totalDispatch: 0 }
    );
  }, [orders]);

  // 추가금 합계 계산
  // const additionalTotal = React.useMemo(() => {
  //   return additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
  // }, [additionalFees]);

  // 세금 계산
  const taxAmount = React.useMemo(() => {
    const baseAmount = ordersSummary.totalFreight - ordersSummary.totalDispatch;// + additionalTotal;
    console.log("baseAmount:", baseAmount);
    return formData.taxFree ? 0 : Math.round(baseAmount * 0.1);
  }, [ordersSummary.totalFreight, ordersSummary.totalDispatch, formData.taxFree]);

  // 최종 금액 계산
  const finalAmount = React.useMemo(() => {
    const baseAmount = ordersSummary.totalFreight - ordersSummary.totalDispatch; //+ additionalTotal;
    console.log("baseAmount:", baseAmount);
    return baseAmount + taxAmount;
  }, [ordersSummary.totalFreight, ordersSummary.totalDispatch, taxAmount]);

  // 정산 대사로 전환 또는 수정
  const handleSubmit = async () => {
    try {
      // 실제 폼에서 입력된 값을 가져옴
      const formValues = form.getValues();
      console.log('formValues:', formValues);
      console.log('formValues.memo:', formValues.memo);

      if (isEditMode && selectedSalesBundleId) {
        console.log("편집 모드: 기존 sales bundle 수정", selectedSalesBundleId);
        // 편집 모드: 기존 sales bundle 수정
        const updateFields: ISettlementFormData = {
          shipperId: selectedCompanyId || '',
          shipperName: formValues.shipperName,
          shipperCeo: formValues.shipperCeo || '',
          businessNumber: formValues.businessNumber,
          billingCompany: formValues.shipperName, // shipperName을 billingCompany로 사용
          managerId: selectedManagerId || '',
          manager: formValues.manager,
          managerContact: formValues.managerContact,
          managerEmail: formValues.managerEmail || '',
          periodType: formValues.periodType,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          dueDate: formValues.dueDate ? format(formValues.dueDate, 'yyyy-MM-dd') : '',
          memo: formValues.memo || '',
          taxFree: formValues.taxFree,
          hasTax: formValues.hasTax,
          issueInvoice: formValues.issueInvoice,
          paymentMethod: formValues.paymentMethod,
          bankName: formValues.bankName || '',
          accountHolder: formValues.accountHolder || '',
          accountNumber: formValues.accountNumber || '',
          totalAmount: calculatedTotals.totalFreight,
          totalTaxAmount: calculatedTotals.tax,
          totalAmountWithTax: calculatedTotals.totalAmount,
        };
        console.log('updateFields:', updateFields);

        const success = await updateSalesBundleData(selectedSalesBundleId, updateFields);
        if (success) {
          toast.success("정산이 성공적으로 수정되었습니다.");
          closeSettlementForm();
        } else {
          toast.error("정산 수정에 실패했습니다.");
        }
      } else {
        // 생성 모드: 새로운 sales bundle 생성
        const formData: ISettlementFormData = {
          shipperId: selectedCompanyId || '',
          managerId: selectedManagerId || '',
          shipperName: formValues.shipperName,
          shipperCeo: formValues.shipperCeo || '', // FormValues에는 없지만 ISettlementFormData에는 있음
          businessNumber: formValues.businessNumber,
          billingCompany: formValues.shipperName, // shipperName을 billingCompany로 사용
          manager: formValues.manager,
          managerContact: formValues.managerContact,
          managerEmail: formValues.managerEmail || '',
          periodType: formValues.periodType,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          dueDate: formValues.dueDate ? format(formValues.dueDate, 'yyyy-MM-dd') : '',
          memo: formValues.memo || '',
          taxFree: formValues.taxFree,
          hasTax: formValues.hasTax,
          issueInvoice: formValues.issueInvoice,
          paymentMethod: formValues.paymentMethod,
          bankName: formValues.bankName || '',
          accountHolder: formValues.accountHolder || '',
          accountNumber: formValues.accountNumber || '',
          totalAmount: ordersSummary.totalFreight,
          totalTaxAmount: taxAmount,
          totalAmountWithTax: finalAmount + taxAmount
        };
        
        console.log("handleSubmit formData:", formData);
        
        const ok = await createSalesBundleFromWaitingItems(formData);
        console.log("ok:", ok);
        if (ok) {
          toast.success("정산이 성공적으로 생성되었습니다.");
          closeSettlementForm();
        } else {
          toast.error("정산 생성에 실패했습니다.");
        }
      }
    } catch (error) {
      toast.error(isEditMode ? "정산 수정 중 오류가 발생했습니다." : "정산 생성 중 오류가 발생했습니다.");
    }
  };

  // 정산 삭제 (취소)
  const handleDelete = async () => {
    if (!selectedSalesBundleId) return;
    setIsDeleteDialogOpen(false);
    try {
      const success = await deleteSalesBundleData(selectedSalesBundleId);
      if (success) {
        toast.success("정산이 성공적으로 삭제되었습니다.");
        closeSettlementForm();
      } else {
        toast.error("정산 삭제에 실패했습니다.");
      }
    } catch (error) {
      toast.error("정산 삭제 중 오류가 발생했습니다.");
    }
  };

  // 화주별 그룹화
  const shipperGroups = useMemo(() => {
    if (!orders || orders.length === 0) return {};
    
    const groups: Record<string, { orders: ISettlementWaitingItem[], total: number, company: { id: string, name: string, businessNumber: string, ceo: string } }> = {};

    console.log("화주별 그룹화 orders", orders);
    
    orders.forEach(order => {
      const shipper = order.companyName || '미지정';
        
      if (!groups[shipper]) {
        groups[shipper] = { orders: [], total: 0, company: { id: order.companyId || '', name: order.companyName || '', businessNumber: order.companyBusinessNumber || '', ceo: order.companyCeo || '' } };
      }
      groups[shipper].orders.push(order);
      groups[shipper].total += order.amount || 0;
    });
    console.log("화주별 그룹화 groups", groups);
    return groups;
  }, [orders]);

  // 수정 모드용 화주별 그룹화 (bundleFreightList 기반)
  const editModeShipperGroups = useMemo(() => {
    if (!isEditMode || !bundleFreightList || bundleFreightList.length === 0) return {};
    
    const groups: Record<string, { orders: any[], total: number, company: { id: string, name: string, businessNumber: string, ceo: string } }> = {};

    console.log("수정 모드 화주별 그룹화 bundleFreightList", bundleFreightList);
    
    bundleFreightList.forEach(item => {
      const shipper = item.orderDetails.companyName || '미지정';
        
      if (!groups[shipper]) {
        groups[shipper] = { 
          orders: [], 
          total: 0, 
          company: { 
            id: item.orderDetails.companyId || '', 
            name: item.orderDetails.companyName || '', 
            businessNumber: editingSalesBundle?.companySnapshot?.businessNumber || '', 
            ceo: editingSalesBundle?.companySnapshot?.ceoName || '' 
          } 
        };
      }
      groups[shipper].orders.push(item);
      groups[shipper].total += item.orderDetails.amount || 0;
    });
    console.log("수정 모드 화주별 그룹화 groups", groups);
    return groups;
  }, [isEditMode, bundleFreightList, editingSalesBundle]);

  // 표시할 shipperGroups 결정
  const displayShipperGroups = isEditMode ? editModeShipperGroups : shipperGroups;
  const hasShipperGroups = Object.keys(displayShipperGroups).length > 0;

  // 선택된 화물의 운임 및 금액 계산
  const hasTax = useWatch({ control: form.control, name: 'hasTax' });
  const calculatedTotals = useMemo(() => {
    const {
      //bundleAdjustments,
      //bundleFreightList
    } = useBrokerChargeStore.getState();

    console.log("calculatedTotals 호출");
    console.log("isEditMode:", isEditMode);
    console.log("editingSalesBundle:", editingSalesBundle);

    if (isEditMode && editingSalesBundle) {
     
      console.log("편집 모드 통합 추가금 계산 bundleAdjustments", bundleAdjustments);
      // 편집 모드: 기존 sales bundle 데이터 + 추가금 계산
      let bundleAdjustmentTotal = 0;
      let bundleAdjustmentTax = 0;
      let itemAdjustmentTotal = 0;
      let itemAdjustmentTax = 0;

      console.log("편집 모드 통합 추가금 계산 bundleAdjustments", bundleAdjustments);
      console.log("편집 모드 개별 화물 추가금 계산 bundleFreightList", bundleFreightList);

      // 통합 추가금 계산
      bundleAdjustments.forEach(adj => {
        if (adj.type === 'surcharge') {
          bundleAdjustmentTotal += adj.amount;
          bundleAdjustmentTax += adj.taxAmount;
        } else {
          bundleAdjustmentTotal -= adj.amount;
          bundleAdjustmentTax -= adj.taxAmount;
        }
      });
      console.log("편집 모드 통합 추가금 계산 bundleAdjustmentTotal", bundleAdjustmentTotal);
      console.log("편집 모드 통합 추가금 계산 bundleAdjustmentTax", bundleAdjustmentTax);

      // 개별 화물 추가금 계산
      bundleFreightList.forEach(item => {
        item.adjustments?.forEach(adj => {
          if (adj.type === 'surcharge') {
            itemAdjustmentTotal += adj.amount;
            itemAdjustmentTax += adj.taxAmount;
          } else {
            itemAdjustmentTotal -= adj.amount;
            itemAdjustmentTax -= adj.taxAmount;
          }
        });
      });

      const baseAmount = editingSalesBundle.totalAmount || 0;
      const totalAdjustments = Number(bundleAdjustmentTotal) + Number(itemAdjustmentTotal) + Number(bundleAdjustmentTax);
      const netAmount = Number(baseAmount) + Number(totalAdjustments);
      const tax = Math.round(Number(baseAmount) * 0.1) + Number(bundleAdjustmentTax);
      const totalAmount = Number(netAmount) + Number(tax);
      

      return {
        totalFreight: baseAmount,
        totalAdjustments,
        totalNet: netAmount,
        tax,
        totalAmount
      };
    }
    
    // 생성 모드: 선택된 화물 기반 계산 (추가금은 아직 없음)
    if (!orders || orders.length === 0) return { 
      totalFreight: 0, 
      totalAdjustments: 0, 
      totalNet: 0, 
      tax: 0, 
      totalAmount: 0 
    };
    
    const totalFreight = orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const tax = hasTax ? Math.round(totalFreight * 0.1) : 0;
    const totalAmount = totalFreight + tax;
    
    return { 
      totalFreight, 
      totalAdjustments: 0, 
      totalNet: totalFreight, 
      tax, 
      totalAmount 
    };
  //}, [orders, isEditMode, editingSalesBundle, hasTax]);
}, [orders, isEditMode, editingSalesBundle, hasTax, bundleAdjustments, bundleFreightList]);
  // 회사 검색 함수
  const handleCompanySearch = () => {
    setFilter({ keyword: companySearchTerm });
  };

  // 회사 선택 시 담당자 목록 로드
  useEffect(() => {
    if (selectedCompanyId) {
      console.log('🔍 선택된 회사 ID로 담당자 목록 로드:', selectedCompanyId);
      loadManagers(selectedCompanyId);
    }
  }, [selectedCompanyId, loadManagers]);

  // 담당자 검색 함수
  const handleManagerSearch = () => {
    if (selectedCompanyId) {
      setManagerFilter({ 
        searchTerm: managerSearchTerm,
        showInactive: false 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          // 먼저 폼 초기화
          form.reset();
          
          // 다음 렌더 사이클에서 상태 업데이트 (경쟁 상태 방지)
          setTimeout(() => {
            closeSettlementForm();
          }, 0);
        }
      }}
    >
      <SheetContent className="sm:max-w-3xl overflow-y-auto p-0" side="right">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-xl font-semibold">
            {isEditMode ? '매출 정산 수정' : '매출 정산 생성'}
          </SheetTitle>
          <SheetDescription>
            {isEditMode 
              ? '선택한 정산 항목의 정보를 수정합니다.' 
              : '선택한 화물을 정산 항목으로 등록합니다.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 pb-20 overflow-y-auto h-[calc(100vh-180px)]">
          {/* 정산 폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">

              <Tabs defaultValue="settlement" className="w-full">
                <TabsList>
                  <TabsTrigger value="settlement">기본 정보</TabsTrigger>
                  <TabsTrigger value="freight">화물 및 추가금</TabsTrigger>
                </TabsList>

                <TabsContent value="settlement">
             
                  {/* 회사 정보와 담당자 정보 섹션을 그리드로 감싸기 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">

                    {/* 회사 정보 섹션 */}
                    <CompanyInfoSection
                      form={form}
                      companySearchTerm={companySearchTerm}
                      setCompanySearchTerm={setCompanySearchTerm}
                      companies={companiesQuery.data?.data ?? []}
                      onSelectCompany={(company) => {
                        form.setValue("shipperName", company.name);
                        form.setValue("businessNumber", company.businessNumber || "-");
                        if (company.ceoName || company.ceo || company.companyCeo) {
                          form.setValue("shipperCeo", company.ceoName || company.ceo || company.companyCeo);
                        }
                        setSelectedCompanyId(company.id);
                        // 회사 선택 시 담당자 목록 로드
                        if (company.id) {
                          loadManagers(company.id);
                        }
                      }}
                      selectedCompanyId={selectedCompanyId}
                      onReset={() => {
                        form.reset({
                          ...form.getValues(),
                          shipperName: "",
                          businessNumber: "",
                          shipperCeo: "",
                          manager: "",
                          managerContact: "",
                          managerEmail: "",
                        });
                        setSelectedCompanyId(null);
                        setSelectedManagerId(null);
                      }}
                      onCompanySearch={handleCompanySearch}
                      isEditMode={isEditMode}
                      editingSalesBundle={editingSalesBundle}
                      displayShipperGroups={displayShipperGroups}
                      hasShipperGroups={hasShipperGroups}
                      loading={loading}
                      isLoadingCompanies={companiesQuery.isLoading}
                    />

                    {/* 담당자 정보 섹션 */}
                    <ManagerInfoSection
                      form={form}
                      managerSearchTerm={managerSearchTerm}
                      setManagerSearchTerm={setManagerSearchTerm}
                      managers={brokerManagers.filter(manager => manager.status === '활성')}
                      onSelectManager={(manager) => {
                        setSelectedManagerId(manager.id);
                        form.setValue("manager", manager.name);
                        form.setValue(
                          "managerContact",
                          manager.phoneNumber || manager.mobile || manager.phone || ""
                        );
                        form.setValue("managerEmail", manager.email || "");
                      }}
                      selectedManagerId={selectedManagerId}
                      onReset={() => {
                        form.reset({
                          ...form.getValues(),
                          manager: "",
                          managerContact: "",
                          managerEmail: "",
                        });
                        setSelectedManagerId(null);
                      }}
                      onManagerSearch={handleManagerSearch}
                      isEditMode={isEditMode}
                      loading={loading}
                      isLoadingManagers={isLoadingManagers}
                      companySelected={!!selectedCompanyId}
                    />                

                  </div>

                  {/* 정산 기간 설정 + 기타 섹션 */}              
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* 정산 기간 설정 섹션 */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-primary">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold">정산 기간 설정</h3>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // 상차 기준으로 기간 자동 설정
                              handlePeriodTypeChange("departure");
                            }}
                            disabled={loading}
                          >
                            자동 설정
                          </Button>
                        </div>
                      </div>

                      {/* 기간 설정 영역 */}
                      <div className="gap-4">                  
                        <div className="border rounded-md bg-muted/30 py-4 px-4">
                          
                          <div className="flex flex-col pb-6">
                            <FormField
                              control={form.control}
                              name="periodType"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex space-x-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id="departure"
                                        value="departure"
                                        checked={field.value === "departure"}
                                        onChange={() => {
                                          field.onChange("departure");
                                          handlePeriodTypeChange("departure");
                                        }}
                                        className="h-4 w-4 text-primary"
                                      />
                                      <label htmlFor="departure" className="text-sm">상차 기준</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id="arrival"
                                        value="arrival"
                                        checked={field.value === "arrival"}
                                        onChange={() => {
                                          field.onChange("arrival");
                                          handlePeriodTypeChange("arrival");
                                        }}
                                        className="h-4 w-4 text-primary"
                                      />
                                      <label htmlFor="arrival" className="text-sm">하차 기준</label>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {/* <FormField
                              control={form.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm font-medium">시작일</div>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      className="h-9"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setFormField('startDate', e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            /> */}
                            {/* <FormField
                              control={form.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm font-medium">시작일</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className="w-full h-9 pl-3 text-left font-normal"
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP", { locale: ko })
                                          ) : (
                                            <span>날짜 선택</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={new Date(field.value)}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            /> */}

                            <FormField
                              control={form.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm font-medium">시작일</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className="w-full h-9 pl-3 text-left font-normal"
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP", { locale: ko })
                                          ) : (
                                            <span>날짜 선택</span>
                                          )}                                      
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={new Date(field.value)}
                                        onSelect={(e) => {
                                          field.onChange(e);
                                          form.setValue('startDate', e ? format(e, 'yyyy-MM-dd') : '');
                                        }}
                                        
                                        //disabled={(date) => date < new Date()}
                                        locale={ko}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}                              
                            />
                            
                            <FormField
                              control={form.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm font-medium">종료일</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className="w-full h-9 pl-3 text-left font-normal"
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP", { locale: ko })
                                          ) : (
                                            <span>날짜 선택</span>
                                          )}                                      
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={new Date(field.value)}
                                        onSelect={(e) => {
                                          field.onChange(e);
                                          form.setValue('endDate', e ? format(e, 'yyyy-MM-dd') : '');
                                        }}
                                        
                                        //disabled={(date) => date < new Date()}
                                        locale={ko}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="text-sm font-medium">만기일</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className="w-full h-9 pl-3 text-left font-normal"
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP", { locale: ko })
                                          ) : (
                                            <span>날짜 선택</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <CalendarComponent
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        //disabled={(date) => date < new Date()}
                                        initialFocus
                                        locale={ko}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          
                        </div>
                      </div>
                    </div>

                    {/* 기타 섹션 */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Ellipsis className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-bold">기타 정보</h3>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.reset({
                              ...form.getValues(),
                              memo: "",
                              paymentMethod: "계좌이체",
                              taxFree: false,
                              hasTax: true,
                              issueInvoice: false,
                            })}
                            disabled={loading}
                          >
                            초기화
                          </Button>
                        </div>
                      </div>

                      {/* 기간 설정 영역 */}
                      <div className="gap-4">                  
                        <div className="border rounded-md bg-muted/30 py-4 px-4">
                          
                          <div className="flex flex-col pb-4">
                            {/* 메모와 결제 방법 - 같은 행에 배치 */}
                            <div className="gap-2 pb-4 w-full">
                              <FormField
                                control={form.control}
                                name="memo"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium">메모 (선택사항)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="메모를 입력하세요" className="h-9" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {/* 메모와 결제 방법 - 같은 행에 배치 */}
                            <div className="gap-2 w-full">
                              
                              <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium">결제 방법</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="결제 방법 선택" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="BANK_TRANSFER">계좌이체</SelectItem>
                                        <SelectItem value="CREDIT_CARD">신용카드</SelectItem>
                                        <SelectItem value="CASH">현금</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          {/* 세금 설정 */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <FormField
                                control={form.control}
                                name="taxFree"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                          field.onChange(checked);
                                          if (checked) {
                                            form.setValue("hasTax", false);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-xs font-medium">
                                      면세 대상
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="hasTax"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                          field.onChange(checked);
                                          if (checked) {
                                            form.setValue("taxFree", false);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-xs font-medium">
                                      부가세 포함
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="space-y-1">
                              {/* 세금계산서 발행 여부 체크박스 추가 */}
                              <FormField
                                control={form.control}
                                name="issueInvoice"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-xs font-medium">
                                      세금계산서 발행
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />

                              
                            </div>                
                          </div>
                          
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </TabsContent>

                <TabsContent value="freight">
                  {/* 화물 목록 컴포넌트 */}
                  <FreightListTable
                    mode={isEditMode ? 'reconciliation' : 'waiting'}
                    orders={orders}
                    bundleId={selectedSalesBundleId || undefined}
                    onAddItemAdjustment={(itemId) => {
                      console.log('개별 추가금 추가 클릭:', itemId);
                      setItemAdjustmentDialog({
                        open: true,
                        itemId
                      });
                    }}
                    onEditItemAdjustment={(itemId, adjustmentId) => {
                      console.log('개별 추가금 수정 클릭:', itemId, adjustmentId);
                      // 수정 모드로 다이얼로그 열기 - adjustment 데이터는 다이얼로그 내부에서 가져오기
                      setItemAdjustmentDialog({
                        open: true,
                        itemId,
                        adjustmentId
                      });
                    }}
                    onDeleteItemAdjustment={handleItemAdjustmentDelete}
                  />

                  {/* 통합 추가금 관리 컴포넌트 */}
                  <BundleAdjustmentManager
                    bundleId={selectedSalesBundleId || undefined}
                    isEditMode={isEditMode}
                  />
                </TabsContent>
              </Tabs>

              
            </form>
          </Form>
        </div>
        
        {/* 하단 고정 영역 - 금액 요약 및 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background px-6 pt-4 pb-8">
          {/* 금액 요약 */}
          <div className="mb-3 grid grid-cols-4 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">총 주선료</div>
              <div className="font-medium">{formatCurrency(calculatedTotals.totalFreight)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">추가금</div>
              <div className="font-medium">{formatCurrency(calculatedTotals.totalAdjustments || 0)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">총 세금</div>
              <div className="font-medium">{formatCurrency(calculatedTotals.tax)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">청구 금액</div>
              <div className="font-medium text-green-600">{formatCurrency(calculatedTotals.totalAmount)}</div>
            </div>
          </div>
          
          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => closeSettlementForm()}
              disabled={loading}
              size="sm"
            >
              <X className="mr-1 h-4 w-4" />
              닫기
            </Button>
            
            {isEditMode ? (
              // 편집 모드: 수정 및 삭제 버튼
              <>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-4 w-4" />
                      삭제
                    </>
                  )}
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="sm"
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-4 w-4" />
                      수정
                    </>
                  )}
                </Button>
              </>
            ) : (
              // 생성 모드: 생성 버튼
              <Button 
                type="submit" 
                disabled={loading}
                size="sm"
                onClick={form.handleSubmit(handleSubmit)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 h-4 w-4" />
                    정산 생성
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* <SettlementAdjustmentsAddForm /> */}
    
    {/* 개별 화물 추가금 관리 다이얼로그 */}
    <ItemAdjustmentDialog
      open={itemAdjustmentDialog.open}
      onOpenChange={(open) => setItemAdjustmentDialog(prev => ({ ...prev, open }))}
      itemId={itemAdjustmentDialog.itemId}
      adjustmentId={itemAdjustmentDialog.adjustmentId}
    />
    {/* 정산 삭제 확인 ConfirmDialog */}
    <ConfirmDialog
      open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
      title="정산 삭제 확인"
      description="정말로 이 정산을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      confirmText="정산 삭제"
      cancelText="취소"
      onConfirm={handleDelete}
      variant="destructive"
    />

    {/* 개별 추가금 삭제 확인 ConfirmDialog */}
    <ConfirmDialog
      open={itemDeleteDialog.open}
      onOpenChange={(open) => setItemDeleteDialog(prev => ({ ...prev, open }))}
      title="추가금 삭제 확인"
      description="정말로 이 추가금을 삭제하시겠습니까?"
      confirmText="삭제"
      cancelText="취소"
      onConfirm={handleConfirmItemDelete}
      variant="destructive"
    />
    </>
  );
} 