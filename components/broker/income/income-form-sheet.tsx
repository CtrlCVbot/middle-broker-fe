"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  PlusCircle, 
  MinusCircle, 
  CheckCircle,
  Truck,
  DollarSign,
  FileText,
  Calendar,
  Building,
  User,
  CalendarIcon,
  Loader2,
  Save,
  X
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIncomeFormStore } from "@/store/income-form-store";
import { formatCurrency } from "@/lib/utils";
import { IBrokerOrder } from "@/types/broker-order";
import { IncomeAdditionalCost } from "./income-additional-cost";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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

// 정산 생성 폼 스키마
const formSchema = z.object({
  dueDate: z.date({
    required_error: "정산 만료일은 필수 입력 항목입니다.",
  }),
  memo: z.string().optional(),
  taxFree: z.boolean().default(false),
  hasTax: z.boolean().default(true),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.string().default("BANK_TRANSFER"),
});

type FormValues = z.infer<typeof formSchema>;

export function IncomeFormSheet() {
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
  } = useIncomeFormStore();
  const { createIncome } = useIncomeStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditingAdditionalFee, setIsEditingAdditionalFee] = useState(false);
  const [loading, setLoading] = useState(false);

  // 정산 기간 설정 - 가장 빠른 상차일과 가장 늦은 하차일로 자동 설정
  useEffect(() => {
    if (!orders || orders.length === 0 || !isOpen) return;
    
    let earliestLoadingDate = new Date(orders[0].departureDateTime);
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
  const handlePeriodTypeChange = (value: string) => {
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
            businessNumber: order.businessNumber || '000-00-00000'
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
    submitForm({
      ...formData,
      totalBaseAmount: ordersSummary.totalFreight - ordersSummary.totalDispatch,
      totalAdditionalAmount: additionalTotal,
      tax: taxAmount,
      finalAmount: finalAmount,
      orderCount: orders.length,
      orderIds: orders.map(order => order.id),
    });
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
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 기본값: 오늘로부터 30일 후
      memo: "",
      taxFree: false,
      hasTax: true,
      invoiceNumber: "",
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
      const incomeData = {
        orderIds,
        dueDate: values.dueDate,
        memo: values.memo,
        taxFree: values.taxFree,
        hasTax: values.hasTax,
        invoiceNumber: values.invoiceNumber,
        paymentMethod: values.paymentMethod,
      };
      
      // 정산 생성 호출
      await createIncome(incomeData);
      
      toast.success("정산이 성공적으로 생성되었습니다.");
      closeForm();
    } catch (error) {
      console.error("정산 생성 중 오류 발생:", error);
      toast.error("정산 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 시트 닫기 처리
  const handleClose = () => {
    form.reset();
    closeForm();
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto" side="right">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-semibold">정산 생성</SheetTitle>
          <SheetDescription>
            선택한 화물을 정산 항목으로 등록합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* 선택된 화물 목록 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">선택된 화물 ({orders?.length || 0}개)</h3>
            <ScrollArea className="h-64 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">번호</TableHead>
                    <TableHead>화물 번호</TableHead>
                    <TableHead>출발지</TableHead>
                    <TableHead>도착지</TableHead>
                    <TableHead className="text-right">운송료</TableHead>
                    <TableHead className="text-right">배차료</TableHead>
                    <TableHead className="text-right">순수익</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders && orders.length > 0 ? (
                    orders.map((order, index) => (
                      <TableRow key={order.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.departureLocation.split(' ')[0]}</TableCell>
                        <TableCell>{order.arrivalLocation.split(' ')[0]}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.amount || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.fee || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency((order.amount || 0) - (order.fee || 0))}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-16 text-center">
                        선택된 화물이 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* 금액 요약 */}
          <div className="bg-muted p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 운송료:</span>
                <span className="font-medium">{formatCurrency(calculatedTotals.totalFreight)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 배차료:</span>
                <span className="font-medium">{formatCurrency(calculatedTotals.totalDispatch)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">순 이익:</span>
                <span className="font-medium">{formatCurrency(calculatedTotals.totalNet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">부가세(10%):</span>
                <span className="font-medium">{formatCurrency(calculatedTotals.tax)}</span>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-semibold">총 정산 금액:</span>
                  <span className="font-bold text-lg">{formatCurrency(calculatedTotals.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 정산 폼 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 만기일 선택 */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>정산 만기일</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
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
                        <Calendar
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

              {/* 세금 설정 */}
              <div className="flex space-x-4">
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
                      <FormLabel className="font-normal cursor-pointer">
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
                      <FormLabel className="font-normal cursor-pointer">
                        부가세 포함
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* 결제 방법 */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>결제 방법</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              {/* 세금계산서 번호 */}
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>세금계산서 번호 (선택사항)</FormLabel>
                    <FormControl>
                      <Input placeholder="세금계산서 번호를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 메모 */}
              <FormField
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메모 (선택사항)</FormLabel>
                    <FormControl>
                      <Input placeholder="메모를 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 버튼 그룹 */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={loading}
                >
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      정산 생성
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
} 