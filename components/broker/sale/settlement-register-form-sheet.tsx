"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle,
  CalendarIcon,
  Loader2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Map,
  Search,
  User,
  Phone,
  Mail,
  Building,
  Landmark,
  Hash,
  Ellipsis
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency, cn } from "@/lib/utils";
import { IBrokerOrder } from "@/types/broker-order";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useIncomeStore } from "@/store/income-store";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCompanies, useCompanyStore } from '@/store/company-store';
import { useBrokerCompanyManagerStore } from '@/store/broker-company-manager-store';
import { IBrokerCompanyManager } from '@/types/broker-company';
import { getSchedule } from "@/components/order/order-table-ver01";
import { Separator } from "@/components/ui/separator";
import { useBrokerChargeStore } from '@/store/broker-charge-store';
import { ISettlementFormData, ISettlementWaitingItem } from "@/types/broker-charge";

// TypeScript로 인터페이스 정의
interface IAdditionalFee {
  id: string;
  type: string;
  amount: number;
  memo?: string;
  orderId?: string;
  createdAt: string;
  createdBy: string;
}


// 목업 데이터를 위한 임시 솔루션 (실제 구현시 제거)
interface IMockStoreState {
  isOpen: boolean;
  selectedOrders: IBrokerOrder[];
  formData: {
    shipperName: string;
    shipperCeo: string;
    businessNumber: string;    
    billingCompany: string;
    manager: string;
    managerContact: string;
    periodType: 'departure' | 'arrival';
    startDate: string;
    endDate: string;
    isTaxFree: boolean;
    memo: string;
  };
  additionalFees: IAdditionalFee[];
  companies: string[];
  managers: string[];
}

interface MockIncomeFormStore extends IMockStoreState {
  setFormField: (key: string, value: any) => void;
  openForm: (orders: IBrokerOrder[]) => void;
  closeForm: () => void;
  addAdditionalFee: (fee: any) => void;
  removeAdditionalFee: (id: string) => void;
  submitForm: (data: any) => void;
  isLoading: boolean;
  resetForm: () => void;
}

// 목업 useIncomeFormStore (실제 구현시 제거)
const useIncomeFormStore = (): MockIncomeFormStore => {
  const [state, setState] = React.useState<IMockStoreState>({
    isOpen: false,
    selectedOrders: [] as IBrokerOrder[],
    formData: { 
      shipperName: "기본 화주", 
      shipperCeo: "김중개",
      businessNumber: "123-45-67890",
      
      billingCompany: "기본 화주",
      manager: "김중개",
      managerContact: "010-1234-5678",
      periodType: "departure" as const,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      isTaxFree: false,
      memo: ""
    },
    additionalFees: [],
    companies: ["화주A", "화주B", "화주C"],
    managers: ["김중개", "이중개", "박중개"],
  });

  // 실제로 작동하는 함수들 구현
  const setFormField = React.useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [key]: value
      }
    }));
  }, []);

  const openForm = React.useCallback((orders: IBrokerOrder[]) => {
    // 화주별로 그룹핑
    const shipperCounts: Record<string, { count: number, businessNumber: string, ceo: string }> = {};
    orders.forEach(order => {
      const shipper = order.shipperName || '미지정';
      const businessNumber = order.shipperBusinessNumber || '000-00-00000';
      const ceo = order.shipperCeo || '미지정';
      if (!shipperCounts[shipper]) {
        shipperCounts[shipper] = { count: 1, businessNumber, ceo };
      } else {
        shipperCounts[shipper].count++;
      }
    });
    // 가장 많은 화주 찾기
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
    setState(prev => ({
      ...prev,
      isOpen: true,
      selectedOrders: orders,
      formData: {
        ...prev.formData,
        shipperName: mainShipper,
        shipperCeo: mainShipperCeo,
        businessNumber: mainBusinessNumber,        
        billingCompany: mainShipper
      }
    }));
  }, []);

  const closeForm = React.useCallback(() => {
    console.log("closeForm 호출됨");
    setState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const addAdditionalFee = React.useCallback((fee: any) => {
    console.log('addAdditionalFee', fee);
  }, []);

  const removeAdditionalFee = React.useCallback((id: string) => {
    console.log('removeAdditionalFee', id);
  }, []);

  const submitForm = React.useCallback((data: any) => {
    console.log('submitForm', data);
  }, []);

  const resetForm = React.useCallback(() => {
    console.log('resetForm');
  }, []);

  return {
    ...state,
    setFormField,
    openForm,
    closeForm,
    addAdditionalFee,
    removeAdditionalFee,
    submitForm,
    isLoading: false,
    resetForm
  };
};

// 정산 생성 폼 스키마
const formSchema = z.object({
  shipperName: z.string({
    required_error: "화주명은 필수 입력 항목입니다.",
  }),
  businessNumber: z.string({
    required_error: "사업자번호는 필수 입력 항목입니다.",
  }),
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
  issueInvoice: z.boolean().default(true),
  paymentMethod: z.string().default("BANK_TRANSFER"),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SettlementRegisterFormSheet() {
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
      issueInvoice: true,
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
    isLoading
  } = useBrokerChargeStore();

  const { isOpen, selectedItems: orders, formData } = settlementForm;

  const { createIncome } = useIncomeStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditingAdditionalFee, setIsEditingAdditionalFee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const { setFilter } = useCompanyStore();
  const companiesQuery = useCompanies();

  console.log('선택된 orders:', orders);
  
  // 담당자 관리 store 사용
  const {
    managers: brokerManagers,
    isLoading: isLoadingManagers,
    setFilter: setManagerFilter,
    loadManagers,
    currentCompanyId
  } = useBrokerCompanyManagerStore();

  // 정산 생성 이벤트 리스너 추가
  useEffect(() => {
    // 이벤트 핸들러 함수
    const handleOpenIncomeForm = (event: Event) => {
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
    window.addEventListener('openIncomeForm', handleOpenIncomeForm);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('openIncomeForm', handleOpenIncomeForm);
    };
  }, []);

  // 정산 기간 설정 - 가장 빠른 상차일과 가장 늦은 하차일로 자동 설정
  useEffect(() => {
    if (!orders || orders.length === 0 || !isOpen) return;
    
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

  // 화주 데이터 - 대부분의 화물이 같은 화주일 경우 해당 화주를 기본값으로 설정
  useEffect(() => {
    if (!orders || orders.length === 0 || !isOpen) return;
    
    const shipperCounts: Record<string, { count: number, businessNumber: string, ceo: string }> = {};
    
    orders.forEach(order => {
      if (order.companyName) {
        if (!shipperCounts[order.companyName]) {
          shipperCounts[order.companyName] = { 
            count: 1,
            businessNumber: '000-00-00000',
            ceo: '미지정'
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
    
    form.setValue('shipperName', mainShipper);
    form.setValue('businessNumber', mainBusinessNumber);
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

  // 정산 대사로 전환
  const handleSubmit = async () => {
    try {
      // 실제 폼에서 입력된 값을 가져옴
      const formValues = form.getValues();
      
      // FormValues를 ISettlementFormData 형태로 변환
      const formData: ISettlementFormData = {
        shipperId: selectedCompanyId || '',
        managerId: selectedManagerId || '',
        shipperName: formValues.shipperName,
        shipperCeo: '', // FormValues에는 없지만 ISettlementFormData에는 있음
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
    } catch (error) {
      toast.error("정산 생성 중 오류가 발생했습니다.");
    }
  };

  // 화주별 그룹화
  const shipperGroups = useMemo(() => {
    if (!orders || orders.length === 0) return {};
    
    const groups: Record<string, { orders: ISettlementWaitingItem[], total: number }> = {};

    console.log("화주별 그룹화 orders", orders);
    
    orders.forEach(order => {
      const shipper = order.companyName || '미지정';
        
      if (!groups[shipper]) {
        groups[shipper] = { orders: [], total: 0 };
      }
      groups[shipper].orders.push(order);
      groups[shipper].total += order.amount || 0;
    });
    console.log("화주별 그룹화 groups", groups);
    return groups;
  }, [orders]);

  // 선택된 화물의 운임 및 금액 계산
  const calculatedTotals = useMemo(() => {
    if (!orders || orders.length === 0) return { totalFreight: 0, totalDispatch: 0, totalNet: 0, tax: 0, totalAmount: 0 };
    
    const totalFreight = orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const totalDispatch = orders.reduce((sum, order) => sum + (Number(order.dispatchAmount) || 0), 0);
    const totalNet = totalFreight - totalDispatch;
    const tax = Math.round(totalNet * 0.1);
    const totalAmount = totalFreight + tax;
    
    return { totalFreight, totalDispatch, totalNet, tax, totalAmount };
  }, [orders]);

  // 검색어 변경 함수
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
          <SheetTitle className="text-xl font-semibold">매출 정산 생성</SheetTitle>
          <SheetDescription>
            선택한 화물을 정산 항목으로 등록합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 pb-20 overflow-y-auto h-[calc(100vh-180px)]">
          {/* 정산 폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">

              {/* 회사 정보와 담당자 정보 섹션을 그리드로 감싸기 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">

                {/* 회사 정보 섹션 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold">회사 정보</h3>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.reset({
                          ...form.getValues(),
                          shipperName: "",                          
                          businessNumber: "",
                          manager: "",
                          managerContact: "",
                          managerEmail: "",
                          });
                          setSelectedCompanyId(null);
                          setSelectedManagerId(null);
                        }}
                        disabled={loading}
                      >
                        초기화
                      </Button>
                    </div>
                  </div>

                  {/* 선택된 업체 배지 표시 */}
                  {orders && orders.length > 0 && (
                    <>                    
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(shipperGroups).map((shipper) => (
                        <Badge 
                          key={shipper} 
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
                          onClick={() => {
                            setSelectedCompanyId(shipperGroups[shipper].orders[0].companyId || null);
                            form.setValue("shipperName", shipperGroups[shipper].orders[0].companyName);
                            form.setValue("businessNumber", shipperGroups[shipper].orders[0].companyBusinessNumber || "000-00-00000"); // 실제로는 해당 업체의 사업자번호
                          }}
                        >                          
                          {shipper} ({shipperGroups[shipper].orders.length}건)
                        </Badge>
                      ))}
                    </div>
                    </>
                  )}

                  {form.watch("shipperName") === "기본 화주" || form.watch("shipperName") === "" ? (
                    <div className="flex flex-col items-center justify-center py-4 border-5 border-dashed border-gray-300 rounded-md bg-gray-100 mb-2">
                      <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">청구 회사 정보를 검색해주세요</p>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="shipperName"
                          render={({ field }) => (
                            <FormItem>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button type="button">
                                    <Search className="h-4 w-4 mr-2" />
                                    회사 조회
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <div className="border-b p-2">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        placeholder="회사명 검색"
                                        className="h-8"
                                        type="search"
                                        value={companySearchTerm}
                                        onChange={e => setCompanySearchTerm(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            handleCompanySearch();
                                          }
                                        }}
                                      />
                                      <Button size="sm" className="h-8 px-2" onClick={handleCompanySearch}>검색</Button>
                                    </div>
                                  </div>
                                  <ScrollArea className="h-60">
                                    <div className="p-2">
                                      {companiesQuery.data?.data.map((company) => (
                                        <div
                                          key={company.id}
                                          className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                                          onClick={() => {
                                            field.onChange(company.name);
                                            form.setValue("businessNumber", company.businessNumber || "-");
                                            setSelectedCompanyId(company.id);
                                          }}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">{company.name}</span>
                                            <span className="text-xs text-muted-foreground">{company.businessNumber}</span>
                                          </div>
                                          {company.name === field.value && (
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                          )}
                                        </div>
                                      ))}
                                      {companiesQuery.isLoading && (
                                        <div className="text-xs text-muted-foreground p-2">검색 중...</div>
                                      )}
                                      {!companiesQuery.isLoading && companiesQuery.data?.data.length === 0 && (
                                        <div className="text-xs text-muted-foreground p-2">검색 결과가 없습니다.</div>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">                      
                      {/* 회사 정보 + 계좌 정보 (세로 정렬) */}
                      <div className="flex flex-col px-4 pt-2 border rounded-md bg-muted/30">

                        {/* 회사 정보 영역 */}
                        <div>
                          <div className="flex justify-between items-center text-sm pb-2">
                            
                            {/* 회사명 및 사업자번호*/}
                            <div className="font-medium text-base text-primary truncate">
                              <div className="text-md whitespace-nowrap ">
                                {form.watch("shipperName") || '회사를 검색해주세요'}
                              </div>
                              <div className="text-muted-foreground text-sm whitespace-nowrap">
                                {form.watch("businessNumber")}
                              </div>
                            </div>

                            {/* 사업자명 */}
                            {/* {form.watch("shipperCeo") && (
                              <div className="text-muted-foreground text-sm whitespace-nowrap pl-4">
                                {form.watch("shipperCeo")}
                              </div>
                            )} */}
                            
                          </div>

                          {/* 선택된 회사의 담당자 뱃지 표시 */}
                          {selectedCompanyId && brokerManagers.length > 0 && (
                            // <div className="pb-3">
                            //   <div className="text-xs text-muted-foreground mb-2">담당자 목록</div>
                            //   <div className="flex flex-wrap gap-1.5">
                            //     {selectedCompanyId && brokerManagers.filter(manager => manager.status === '활성').map((manager) => (
                            //       <Badge 
                            //         key={manager.id} 
                            //         variant="outline"
                            //         className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
                            //         onClick={() => {
                            //           form.setValue("manager", manager.name);
                            //           form.setValue("managerContact", manager.phoneNumber || "");
                            //           form.setValue("managerEmail", manager.email || "");
                            //         }}
                            //       >
                            //         {manager.name}
                            //       </Badge>
                            //     ))}
                            //   </div>
                            // </div>
                            <></>
                          )}
                        </div>

                        <Separator className="mb-4" />

                        {/* 계좌 정보 영역 */}
                        <div>
                          <div className="text-sm font-medium text-gray-500 pb-2">계좌 정보</div>
                          <div className="grid grid-cols-1 gap-2 w-full pb-5">

                            {/* 은행 + 계좌명 (한 줄 두 컬럼) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                              {/* 은행 */}
                              <FormField
                                control={form.control}
                                name="bankName"  //"bankName"
                                render={({ field }) => (
                                  

                                  <FormItem>
                                    
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>                                          
                                          <SelectValue placeholder="은행을 선택하세요" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {/* <SelectItem value="001">한국은행</SelectItem> */}
                                        <SelectItem value="002">산업은행</SelectItem>
                                        <SelectItem value="003">기업은행</SelectItem>
                                        <SelectItem value="004">국민은행</SelectItem>
                                        <SelectItem value="007">수협은행</SelectItem>
                                        <SelectItem value="008">수출입은행</SelectItem>
                                        <SelectItem value="011">농협은행</SelectItem>
                                        <SelectItem value="020">우리은행</SelectItem>
                                        <SelectItem value="023">SC제일은행</SelectItem>
                                        <SelectItem value="027">씨티은행</SelectItem>
                                        <SelectItem value="031">대구은행</SelectItem>
                                        <SelectItem value="032">부산은행</SelectItem>
                                        <SelectItem value="034">광주은행</SelectItem>
                                        <SelectItem value="035">제주은행</SelectItem>
                                        <SelectItem value="037">전북은행</SelectItem>
                                        <SelectItem value="039">경남은행</SelectItem>
                                        <SelectItem value="045">새마을금고중앙회</SelectItem>
                                        <SelectItem value="048">신협중앙회</SelectItem>
                                        <SelectItem value="050">상호저축은행</SelectItem>
                                        <SelectItem value="071">우체국</SelectItem>
                                        <SelectItem value="081">하나은행</SelectItem>
                                        <SelectItem value="088">신한은행</SelectItem>
                                        <SelectItem value="089">케이뱅크</SelectItem>
                                        <SelectItem value="090">카카오뱅크</SelectItem>
                                        <SelectItem value="092">토스뱅크</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* 계좌명 */}
                              <FormField
                                control={form.control}
                                name="accountHolder"//"accountHolder"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="예금주명" 
                                          className="h-9 pl-10" 
                                          {...field} 
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                            </div>

                            {/* 계좌번호 (한 줄) */}
                            <FormField
                              control={form.control}
                              name="accountNumber" //"accountNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="relative">
                                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input 
                                        placeholder="계좌번호" 
                                        className="h-9 pl-10" 
                                        {...field} 
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                {/* 담당자 정보 섹션 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold">담당자 정보</h3>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        
                        onClick={() => {
                          form.reset({
                          ...form.getValues(),
                          manager: "",
                          managerContact: "",
                          managerEmail: "",
                          });
                          setSelectedManagerId(null);
                        }}
                        disabled={loading}
                      >
                        초기화
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompanyId && brokerManagers.filter(manager => manager.status === '활성').map((manager) => (
                      <Badge 
                        key={manager.id} 
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
                        onClick={() => {
                          setSelectedManagerId(manager.id);
                          form.setValue("manager", manager.name);
                          form.setValue("managerContact", manager.phoneNumber || "");
                          form.setValue("managerEmail", manager.email || "");
                        }}
                      >
                        {manager.name}
                      </Badge>
                    ))}
                    {!selectedCompanyId && (
                      <div className="text-xs text-muted-foreground py-1">먼저 회사를 선택해주세요</div>
                    )}
                  </div>
                  
                  {!form.watch("manager") || form.watch("manager") === "김중개" ? (
                    <div className="flex flex-col items-center justify-center py-4 border-5 border-dashed rounded-md bg-muted/30 mb-2">
                      <User className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {!selectedCompanyId ? '먼저 회사를 선택해주세요' : '담당자 정보를 입력해주세요'}
                      </p>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="manager"
                          render={({ field }) => (
                            <FormItem>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button type="button" disabled={!selectedCompanyId}>
                                    <Search className="h-4 w-4 mr-2" />
                                    담당자 조회
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0" align="start">
                                  <div className="border-b p-2">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        placeholder="담당자명 검색"
                                        className="h-8"
                                        type="search"
                                        value={managerSearchTerm}
                                        onChange={e => setManagerSearchTerm(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            handleManagerSearch();
                                          }
                                        }}
                                      />
                                      <Button size="sm" className="h-8 px-2" onClick={handleManagerSearch}>검색</Button>
                                    </div>
                                  </div>
                                  <ScrollArea className="h-60">
                                    <div className="p-2">
                                      {isLoadingManagers ? (
                                        <div className="text-xs text-muted-foreground p-2">검색 중...</div>
                                      ) : brokerManagers.filter(manager => manager.status === '활성').length > 0 ? (
                                        brokerManagers.filter(manager => manager.status === '활성').map((manager) => (
                                          <div
                                            key={manager.id}
                                            className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                                            onClick={() => {
                                              field.onChange(manager.name);
                                              form.setValue("managerContact", manager.phoneNumber || "");
                                              form.setValue("managerEmail", manager.email || "");
                                            }}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">{manager.name}</span>
                                              <span className="text-xs text-muted-foreground">{manager.phoneNumber}</span>
                                              <span className="text-xs text-muted-foreground">{manager.roles.join(', ')}</span>
                                            </div>
                                            {manager.name === field.value && (
                                              <CheckCircle className="h-4 w-4 text-primary" />
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-xs text-muted-foreground p-2">담당자가 없습니다.</div>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 담당자 정보 표시 영역 */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between border p-4 rounded-md bg-background bg-muted/30">
                          
                          {/* 담당자 영역 */}                      
                          <div className={cn("grid gap-2", "grid-cols-1", "w-full")}>
                            <div>
                              
                              <FormField
                                control={form.control}
                                name="manager"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>                                      
                                      <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="담당자 이름을 입력해주세요." 
                                          className="h-9 pl-10" 
                                          {...field} 
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div>
                              
                              <FormField
                                control={form.control}
                                name="managerContact"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="010-0000-0000" 
                                          className="h-9 pl-10" 
                                          {...field} 
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="mb-1">
                              
                              <FormField
                                control={form.control}
                                name="managerEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="example@email.com" 
                                          className="h-9 pl-10" 
                                          {...field} 
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                          </div>
                          
                        </div>
                        
                      </div>
                    </>
                  )}
                </div>                

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

              {/* 선택된 화물 목록 - 컴팩트하게 표시 */}
              <Collapsible className="border rounded-md mt-4">
                <div className="flex items-center justify-between p-2 bg-muted/50">
                  <h3 className="text-sm font-semibold">선택된 화물 ({orders?.length || 0}개)</h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setIsOrderListOpen(!isOrderListOpen)}>
                      {isOrderListOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      <span className="sr-only">토글 화물 목록</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <ScrollArea className="h-36 rounded-b-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px] text-xs">번호</TableHead>
                          <TableHead className="text-xs">일정</TableHead>
                          <TableHead className="text-xs">출발지</TableHead>
                          <TableHead className="text-xs">도착지</TableHead>
                          <TableHead className="text-right text-xs">운송료</TableHead>
                          <TableHead className="text-right text-xs">배차료</TableHead>
                          
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders && orders.length > 0 ? (
                          orders.map((order, index) => (
                            <TableRow key={order.id}>
                              <TableCell className="text-xs">{index + 1}</TableCell>                              
                              <TableCell className="text-xs">
                                {getSchedule(order.pickupDate, order.deliveryDate, order.pickupDate, order.deliveryDate)}
                              </TableCell>
                              <TableCell className="text-xs">{order.pickupName}</TableCell>
                              <TableCell className="text-xs">{order.deliveryName}</TableCell>
                              <TableCell className="text-right text-xs">
                                {formatCurrency(order.amount || 0)}
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {formatCurrency(order.dispatchAmount || 0)}
                              </TableCell>                              
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-16 text-center text-xs">
                              선택된 화물이 없습니다.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </form>
          </Form>
        </div>
        
        {/* 하단 고정 영역 - 금액 요약 및 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background px-6 pt-4 pb-8">
          {/* 금액 요약 */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">총 운송료</div>
              <div className="font-medium">{formatCurrency(calculatedTotals.totalFreight)}</div>
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
              취소
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
                  처리 중...
                </>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  정산 생성
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 