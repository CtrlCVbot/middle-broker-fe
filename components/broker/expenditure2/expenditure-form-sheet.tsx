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
  ChevronUp
} from "lucide-react";

import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";
import { IBrokerOrder } from "@/types/broker-order";
import { ExpenditureAdditionalCost } from "./expenditure-additional-cost";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useExpenditureStore } from "@/store/expenditure-store";
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
import { IExpenditure, IAdditionalFee, AdditionalFeeType } from "@/types/expenditure";
import { useExpenditureFormStore } from "@/store/expenditure-form-store";

// TypeScript로 인터페이스 정의
interface IExpenditureCreateRequest {
  orderIds: string[];
  shipperName: string;
  businessNumber: string;
  billingCompany: string;
  manager: string;
  managerContact: string;
  managerEmail?: string;
  periodType: "departure" | "arrival";
  startDate: string;
  endDate: string;
  dueDate: Date;
  memo?: string;
  taxFree: boolean;
  hasTax: boolean;
  invoiceNumber?: string;
  paymentMethod: string;
  totalBaseAmount?: number;
  totalAdditionalAmount?: number;
  tax?: number;
  finalAmount?: number;
  orderCount?: number;
}

// 목업 데이터를 위한 임시 솔루션 (실제 구현시 제거)
interface IMockStoreState {
  isOpen: boolean;
  selectedOrders: IBrokerOrder[];
  formData: {
    shipperName: string;
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

interface MockExpenditureFormStore extends IMockStoreState {
  setFormField: (key: string, value: any) => void;
  openForm: (orders: IBrokerOrder[]) => void;
  closeForm: () => void;
  addAdditionalFee: (fee: any) => void;
  removeAdditionalFee: (id: string) => void;
  submitForm: (data: any) => void;
  isLoading: boolean;
  resetForm: () => void;
}

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
});

type FormValues = z.infer<typeof formSchema>;

export function ExpenditureFormSheet() {
  const {
    isOpen,
    selectedOrders: orders,
    formData,
    additionalFees,
    companies,
    managers,
    setFormField,
    addAdditionalFee,
    removeAdditionalFee,
    closeForm,
    submitForm,
    isLoading,
    resetForm,
    openForm,
  } = useExpenditureFormStore();
  const { addExpenditure } = useExpenditureStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditingAdditionalFee, setIsEditingAdditionalFee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);

  // 정산 생성 이벤트 리스너 추가
  useEffect(() => {
    // 이벤트 핸들러 함수
    const handleOpenExpenditureForm = (event: Event) => {
      const customEvent = event as CustomEvent<{orders: IBrokerOrder[]}>;
      
      if (customEvent.detail?.orders && Array.isArray(customEvent.detail.orders)) {
        console.log("정산 폼 열기 이벤트 수신", customEvent.detail.orders.length, "개의 화물");
        
        // 다음 렌더 사이클에서 상태 업데이트 (경쟁 상태 방지)
        setTimeout(() => {
          openForm(customEvent.detail.orders);
        }, 0);
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('openExpenditureForm', handleOpenExpenditureForm);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('openExpenditureForm', handleOpenExpenditureForm);
    };
  }, []);

  // 정산 기간 설정 - 가장 빠른 상차일과 가장 늦은 하차일로 자동 설정
  useEffect(() => {
    if (!orders || orders.length === 0 || !isOpen) return;
    
    let earliestLoadingDate = parseISO(orders[0].departureDateTime);
    let latestUnloadingDate = new Date(orders[0].arrivalDateTime);

    orders.forEach(order => {
      const loadingDate = new Date(order.departureDateTime);
      const unloadingDate = new Date(order.arrivalDateTime);

      if (loadingDate < earliestLoadingDate) {
        earliestLoadingDate = loadingDate;
      }
      
      if (unloadingDate > latestUnloadingDate) {
        latestUnloadingDate = unloadingDate;
      }
    });

    const startDate = format(earliestLoadingDate, 'yyyy-MM-dd');
    const endDate = format(latestUnloadingDate, 'yyyy-MM-dd');

    setFormField('startDate', startDate);
    setFormField('endDate', endDate);
  }, [orders, isOpen, setFormField]);

  // 정산 구분에 따른 날짜 변경
  const handlePeriodTypeChange = (value: "departure" | "arrival") => {
    setFormField('periodType', value);
    
    if (!orders || orders.length === 0) return;
    
    // 상차 기준일 경우
    if (value === 'departure') {
      let earliestDate = new Date(orders[0].departureDateTime);
      let latestDate = new Date(orders[0].departureDateTime);
      
      orders.forEach(order => {
        const date = new Date(order.departureDateTime);
        if (date < earliestDate) earliestDate = date;
        if (date > latestDate) latestDate = date;
      });
      
      setFormField('startDate', format(earliestDate, 'yyyy-MM-dd'));
      setFormField('endDate', format(latestDate, 'yyyy-MM-dd'));
    } 
    // 하차 기준일 경우
    else {
      let earliestDate = new Date(orders[0].arrivalDateTime);
      let latestDate = new Date(orders[0].arrivalDateTime);
      
      orders.forEach(order => {
        const date = new Date(order.arrivalDateTime);
        if (date < earliestDate) earliestDate = date;
        if (date > latestDate) latestDate = date;
      });
      
      setFormField('startDate', format(earliestDate, 'yyyy-MM-dd'));
      setFormField('endDate', format(latestDate, 'yyyy-MM-dd'));
    }
  };

  // 화주 데이터 - 대부분의 화물이 같은 화주일 경우 해당 화주를 기본값으로 설정
  useEffect(() => {
    if (!orders || orders.length === 0 || !isOpen) return;
    
    const shipperCounts: Record<string, { count: number, businessNumber: string }> = {};
    
    orders.forEach(order => {
      if (order.company) {
        if (!shipperCounts[order.company]) {
          shipperCounts[order.company] = { 
            count: 1,
            businessNumber: '000-00-00000'
          };
        } else {
          shipperCounts[order.company].count++;
        }
      }
    });
    
    let maxCount = 0;
    let mainShipper = '';
    let mainBusinessNumber = '';
    
    for (const shipper in shipperCounts) {
      if (shipperCounts[shipper].count > maxCount) {
        maxCount = shipperCounts[shipper].count;
        mainShipper = shipper;
        mainBusinessNumber = shipperCounts[shipper].businessNumber;
      }
    }
    
    setFormField('shipperName', mainShipper);
    setFormField('businessNumber', mainBusinessNumber);
    // 매출 회사 = 화주로 기본 설정
    setFormField('billingCompany', mainShipper);
  }, [orders, isOpen, setFormField]);

  // 정산 대상 화물 요약 계산
  const ordersSummary = useMemo(() => {
    if (!orders || orders.length === 0) return { totalOrders: 0, totalFreight: 0, totalDispatch: 0 };
    
    return orders.reduce(
      (acc, order) => {
        acc.totalOrders++;
        acc.totalFreight += order.amount || 0;
        acc.totalDispatch += order.fee || 0;
        return acc;
      },
      { totalOrders: 0, totalFreight: 0, totalDispatch: 0 }
    );
  }, [orders]);

  // 추가금 합계 계산
  const additionalTotal = React.useMemo(() => {
    return additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
  }, [additionalFees]);

  // 세금 계산
  const taxAmount = React.useMemo(() => {
    const baseAmount = ordersSummary.totalFreight - ordersSummary.totalDispatch + additionalTotal;
    return formData.isTaxFree ? 0 : Math.round(baseAmount * 0.1);
  }, [ordersSummary.totalFreight, ordersSummary.totalDispatch, additionalTotal, formData.isTaxFree]);

  // 최종 금액 계산
  const finalAmount = React.useMemo(() => {
    const baseAmount = ordersSummary.totalFreight - ordersSummary.totalDispatch + additionalTotal;
    return baseAmount + taxAmount;
  }, [ordersSummary.totalFreight, ordersSummary.totalDispatch, additionalTotal, taxAmount]);

  // 정산 대사로 전환
  const handleSubmit = () => {
    const submitData: IExpenditureCreateRequest = {
      orderIds: orders.map(order => order.id),
      shipperName: formData.shipperName,
      businessNumber: formData.businessNumber,
      billingCompany: formData.billingCompany,
      manager: formData.manager,
      managerContact: formData.managerContact,
      periodType: formData.periodType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      dueDate: new Date(),
      memo: formData.memo,
      taxFree: formData.isTaxFree,
      hasTax: true,
      paymentMethod: "BANK_TRANSFER",
      totalBaseAmount: ordersSummary.totalFreight - ordersSummary.totalDispatch,
      totalAdditionalAmount: additionalTotal,
      tax: taxAmount,
      finalAmount: finalAmount,
      orderCount: orders.length,
    };
    submitForm(submitData);
  };

  // 화주별 그룹화
  const shipperGroups = useMemo(() => {
    if (!orders || orders.length === 0) return {};
    
    const groups: Record<string, { orders: IBrokerOrder[], total: number }> = {};
    
    orders.forEach(order => {
      const shipper = order.company || '미지정';
      if (!groups[shipper]) {
        groups[shipper] = { orders: [], total: 0 };
      }
      groups[shipper].orders.push(order);
      groups[shipper].total += order.amount || 0;
    });
    
    return groups;
  }, [orders]);

  // 선택된 화물의 운임 및 금액 계산
  const calculatedTotals = useMemo(() => {
    if (!orders || orders.length === 0) return { totalFreight: 0, totalDispatch: 0, totalNet: 0, tax: 0, totalAmount: 0 };
    
    const totalFreight = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalDispatch = orders.reduce((sum, order) => sum + (order.fee || 0), 0);
    const totalNet = totalFreight - totalDispatch;
    const tax = Math.round(totalNet * 0.1);
    const totalAmount = totalNet + tax;
    
    return { totalFreight, totalDispatch, totalNet, tax, totalAmount };
  }, [orders]);

  // 폼 초기화
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shipperName: formData.shipperName || "",
      businessNumber: formData.businessNumber || "",
      manager: formData.manager || managers[0] || "",
      managerContact: formData.managerContact || "",
      managerEmail: "",
      periodType: formData.periodType || "departure",
      startDate: formData.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: formData.endDate || format(new Date(), 'yyyy-MM-dd'),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 기본값: 오늘로부터 30일 후
      memo: formData.memo || "",
      taxFree: formData.isTaxFree || false,
      hasTax: true,
      issueInvoice: true,
      paymentMethod: "BANK_TRANSFER",
    },
  });

  // 폼 제출 처리
  const onSubmit = async (values: FormValues) => {
    if (!orders || orders.length === 0) {
      toast.error("선택된 화물이 없습니다.");
      return;
    }

    setLoading(true);
    try {
      // 주문 ID 목록 추출
      const orderIds = orders.map(order => order.id);
      
      // 정산 생성 요청 데이터 생성
      const ExpenditureData: IExpenditure = {
        id: crypto.randomUUID(),
        orderId: orders[0].id,
        amount: ordersSummary.totalFreight,
        description: values.memo || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        additionalFees: additionalFees,
        orderIds: orderIds,
        totalAmount: ordersSummary.totalFreight,
        totalAdditionalAmount: additionalTotal,
        finalAmount: finalAmount,
        isTaxFree: values.taxFree,
        createdBy: 'system',
        updatedBy: 'system',
        orderCount: orders.length,
        shipperName: values.shipperName,
        businessNumber: values.businessNumber,
        startDate: values.startDate,
        endDate: values.endDate,
        manager: values.manager,
        managerContact: values.managerContact,
        tax: taxAmount,
        totalBaseAmount: ordersSummary.totalFreight - ordersSummary.totalDispatch,
      };
      
      // 정산 생성 호출
      await addExpenditure(ExpenditureData);
      
      toast.success("정산이 성공적으로 생성되었습니다.");
      closeForm();
    } catch (error) {
      console.error("정산 생성 중 오류 발생:", error);
      toast.error("정산 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
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
            closeForm();
          }, 0);
        }
      }}
    >
      <SheetContent className="sm:max-w-3xl overflow-y-auto p-0" side="right">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-xl font-semibold">정산 생성</SheetTitle>
          <SheetDescription>
            선택한 화물을 정산 항목으로 등록합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 pb-20 overflow-y-auto h-[calc(100vh-180px)]">
          {/* 정산 폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {/* 회사 정보 섹션 */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold mb-1">회사 정보</h3>
                
                {/* 선택된 업체 배지 표시 */}
                {orders && orders.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {Object.keys(shipperGroups).map((shipper) => (
                      <Badge 
                        key={shipper} 
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
                        onClick={() => {
                          form.setValue("shipperName", shipper);
                          form.setValue("businessNumber", "000-00-00000"); // 실제로는 해당 업체의 사업자번호
                        }}
                      >
                        {shipper} ({shipperGroups[shipper].orders.length}건)
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* 화주 정보 - Popover 형식으로 변경 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="shipperName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-medium">화주명</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={`w-full justify-between h-9 font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value || "회사 조회"}
                                <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  조회
                                </span>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <div className="border-b p-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="회사명 검색"
                                  className="h-8"
                                  type="search"
                                />
                                <Button size="sm" className="h-8 px-2">검색</Button>
                              </div>
                            </div>
                            <ScrollArea className="h-60">
                              <div className="p-2">
                                {companies.map((company) => (
                                  <div
                                    key={company}
                                    className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                                    onClick={() => {
                                      field.onChange(company);
                                      form.setValue("businessNumber", "000-00-00000"); // 실제로는 해당 기업의 사업자번호
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{company}</span>
                                      <span className="text-xs text-muted-foreground">000-00-00000</span>
                                    </div>
                                    {company === field.value && (
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">사업자등록번호</FormLabel>
                        <FormControl>
                          <Input placeholder="000-00-00000" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 담당자 정보 섹션 */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold mb-1">담당자 정보</h3>
                
                {/* 선택된 업체의 담당자 배지 표시 (회사별로 담당자가 있다고 가정) */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {managers.map((manager) => (
                    <Badge 
                      key={manager} 
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
                      onClick={() => {
                        form.setValue("manager", manager);
                        form.setValue("managerContact", "010-1234-5678"); // 실제로는 해당 담당자의 연락처
                        form.setValue("managerEmail", `${manager.toLowerCase()}@example.com`); // 실제로는 해당 담당자의 이메일
                      }}
                    >
                      {manager}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-medium">담당자명</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={`w-full justify-between h-9 font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value || "담당자 조회"}
                                <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  조회
                                </span>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <div className="border-b p-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="담당자명 검색"
                                  className="h-8"
                                  type="search"
                                />
                                <Button size="sm" className="h-8 px-2">검색</Button>
                              </div>
                            </div>
                            <ScrollArea className="h-60">
                              <div className="p-2">
                                {managers.map((manager) => (
                                  <div
                                    key={manager}
                                    className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                                    onClick={() => {
                                      field.onChange(manager);
                                      form.setValue("managerContact", "010-1234-5678"); // 실제로는 해당 담당자의 연락처
                                      form.setValue("managerEmail", `${manager.toLowerCase()}@example.com`); // 실제로는 해당 담당자의 이메일
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{manager}</span>
                                      <span className="text-xs text-muted-foreground">010-1234-5678</span>
                                    </div>
                                    {manager === field.value && (
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="managerContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">연락처</FormLabel>
                        <FormControl>
                          <Input placeholder="010-0000-0000" className="h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="managerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">이메일 (선택사항)</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 정산 기간 설정 섹션 */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold mb-1">정산 기간 설정</h3>
                
                <FormField
                  control={form.control}
                  name="periodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">정산 구분</FormLabel>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">시작일</FormLabel>
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
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">종료일</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="h-9"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setFormField('endDate', e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 만기일 선택 */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">정산 만기일</FormLabel>
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
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

              {/* 메모와 결제 방법 - 같은 행에 배치 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

              {/* 선택된 화물 목록 - 컴팩트하게 표시 */}
              <Collapsible className="border rounded-md mt-2">
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
                          <TableHead className="text-xs">화물 번호</TableHead>
                          <TableHead className="text-xs">출발지</TableHead>
                          <TableHead className="text-xs">도착지</TableHead>
                          <TableHead className="text-right text-xs">운송료</TableHead>
                          <TableHead className="text-right text-xs">배차료</TableHead>
                          <TableHead className="text-right text-xs">순수익</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders && orders.length > 0 ? (
                          orders.map((order, index) => (
                            <TableRow key={order.id}>
                              <TableCell className="text-xs">{index + 1}</TableCell>
                              <TableCell className="text-xs">{order.id.slice(0, 8)}</TableCell>
                              <TableCell className="text-xs">{order.departureLocation.split(' ')[0]}</TableCell>
                              <TableCell className="text-xs">{order.arrivalLocation.split(' ')[0]}</TableCell>
                              <TableCell className="text-right text-xs">{formatCurrency(order.amount || 0)}</TableCell>
                              <TableCell className="text-right text-xs">{formatCurrency(order.fee || 0)}</TableCell>
                              <TableCell className="text-right text-xs">{formatCurrency((order.amount || 0) - (order.fee || 0))}</TableCell>
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
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-3">
          {/* 금액 요약 */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">총 운송료</div>
              <div className="font-medium">{formatCurrency(calculatedTotals.totalFreight)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">총 배차료</div>
              <div className="font-medium">{formatCurrency(calculatedTotals.totalDispatch)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">예상 수익</div>
              <div className="font-medium text-green-600">{formatCurrency(calculatedTotals.totalNet)}</div>
            </div>
          </div>
          
          {/* 버튼 그룹 */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => closeForm()}
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
              onClick={form.handleSubmit(onSubmit)}
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