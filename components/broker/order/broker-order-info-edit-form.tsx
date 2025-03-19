"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ArrowRight, Package, User, ChevronDown, ChevronUp, Search, X, Pencil, AlertTriangle, CreditCard, MessageSquare, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { 
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { BROKER_VEHICLE_TYPES, BROKER_WEIGHT_TYPES } from "@/types/broker-order";
import { LOADING_METHODS, PAYMENT_METHODS } from "@/utils/mockdata/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

// 날짜 선택 컴포넌트
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover as DatePopover,
  PopoverContent as DatePopoverContent,
  PopoverTrigger as DatePopoverTrigger,
} from "@/components/ui/popover";

// 업체 주의사항 인터페이스
interface CompanyWarning {
  id: string;
  date: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

// 폼 유효성 검증 스키마
const formSchema = z.object({
  cargo: z.object({
    type: z.string().min(1, "화물 종류를 입력해주세요"),
    weight: z.string().min(1, "중량을 선택해주세요"),
    options: z.array(z.string()).optional(),
    remark: z.string().optional(),
    vehicleType: z.string().min(1, "차량 종류를 선택해주세요"),
    paymentMethod: z.string().min(1, "결제 방법을 선택해주세요")
  }),
  departure: z.object({
    address: z.string().min(2, { message: "출발지 주소를 입력하세요" }),
    date: z.string().min(1, { message: "출발 날짜를 선택하세요" }),
    time: z.string().min(1, { message: "출발 시간을 입력하세요" }),
    name: z.string().min(1, { message: "담당자 이름을 입력하세요" }),
    company: z.string().min(1, { message: "회사명을 입력하세요" }),
    contact: z.string().min(1, { message: "연락처를 입력하세요" }),
    loadingMethod: z.string().optional()
  }),
  destination: z.object({
    address: z.string().min(2, { message: "도착지 주소를 입력하세요" }),
    date: z.string().min(1, { message: "도착 날짜를 선택하세요" }),
    time: z.string().min(1, { message: "도착 시간을 입력하세요" }),
    name: z.string().min(1, { message: "담당자 이름을 입력하세요" }),
    company: z.string().min(1, { message: "회사명을 입력하세요" }),
    contact: z.string().min(1, { message: "연락처를 입력하세요" }),
    loadingMethod: z.string().optional()
  }),
  shipper: z.object({
    name: z.string().min(1, { message: "화주명을 입력하세요" }),
    manager: z.string().min(1, { message: "담당자를 선택하세요" }),
    contact: z.string().min(1, { message: "연락처를 입력하세요" }),
    email: z.string().email({ message: "올바른 이메일 형식이 아닙니다" }),
    warnings: z.array(z.object({
      id: z.string(),
      date: z.string(),
      content: z.string(),
      severity: z.enum(['low', 'medium', 'high'])
    })).optional()
  })
});

// 운송 옵션 목록
const TRANSPORT_OPTIONS = [
  { id: 'direct', label: '직접운송' },
  { id: 'cod', label: '착불' },
  { id: 'prepaid', label: '선불' },
  { id: 'forklift', label: '지게차하차' },
  { id: 'special', label: '특수화물' }
];

// 담당자 목록 (실제로는 API에서 가져올 데이터)
const MANAGER_LIST = [
  { id: '1', name: '김담당', contact: '010-1234-5678', email: 'kim@example.com' },
  { id: '2', name: '이관리', contact: '010-2345-6789', email: 'lee@example.com' },
  { id: '3', name: '박팀장', contact: '010-3456-7890', email: 'park@example.com' },
  { id: '4', name: '최과장', contact: '010-4567-8901', email: 'choi@example.com' },
  { id: '5', name: '정대리', contact: '010-5678-9012', email: 'jung@example.com' }
];

interface BrokerOrderInfoEditFormProps {
  initialData: {
    departure: {
      address: string;
      name: string;
      company: string;
      contact: string;
      time: string;
      date: string;
      loadingMethod?: string;
    };
    destination: {
      address: string;
      name: string;
      company: string;
      contact: string;
      time: string;
      date: string;
      loadingMethod?: string;
    };
    cargo: {
      type: string;
      options?: string[];
      weight?: string;
      remark?: string;
      vehicleType: string;
      paymentMethod?: string;
    };
    shipper: {
      name: string;
      manager: string;
      contact: string;
      email: string;
      warnings?: CompanyWarning[];
    };
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function BrokerOrderInfoEditForm({ initialData, onSave, onCancel }: BrokerOrderInfoEditFormProps) {
  const [isShipperInfoOpen, setIsShipperInfoOpen] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialData.cargo.options || []);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [companyWarnings, setCompanyWarnings] = useState<CompanyWarning[]>(
    initialData.shipper.warnings || [
      { id: '1', date: '2023-05-15', content: '결제 지연 이력 있음', severity: 'medium' },
      { id: '2', date: '2023-06-20', content: '화물 취소 이력', severity: 'low' },
    ]
  );
  const [newWarning, setNewWarning] = useState({
    content: '',
    severity: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isWarningsDialogOpen, setIsWarningsDialogOpen] = useState(false);
  
  // React Hook Form 설정
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cargo: {
        type: initialData.cargo.type || '',
        weight: initialData.cargo.weight || '',
        options: initialData.cargo.options || [],
        remark: initialData.cargo.remark || '',
        vehicleType: initialData.cargo.vehicleType || '',
        paymentMethod: initialData.cargo.paymentMethod || '인수증'
      },
      departure: {
        address: initialData.departure.address || '',
        date: initialData.departure.date || '',
        time: initialData.departure.time || '',
        name: initialData.departure.name || '',
        company: initialData.departure.company || '',
        contact: initialData.departure.contact || '',
        loadingMethod: initialData.departure.loadingMethod || ''
      },
      destination: {
        address: initialData.destination.address || '',
        date: initialData.destination.date || '',
        time: initialData.destination.time || '',
        name: initialData.destination.name || '',
        company: initialData.destination.company || '',
        contact: initialData.destination.contact || '',
        loadingMethod: initialData.destination.loadingMethod || ''
      },
      shipper: {
        name: initialData.shipper.name || '',
        manager: initialData.shipper.manager || '',
        contact: initialData.shipper.contact || '',
        email: initialData.shipper.email || ''
      }
    }
  });
  
  // 업체 주의사항 추가 함수
  const addCompanyWarning = () => {
    if (!newWarning.content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    const warning: CompanyWarning = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: newWarning.content,
      severity: newWarning.severity
    };
    
    setCompanyWarnings([...companyWarnings, warning]);
    setNewWarning({ content: '', severity: 'medium' });
  };
  
  // 업체 주의사항 삭제 함수
  const removeCompanyWarning = (id: string) => {
    setCompanyWarnings(companyWarnings.filter(warning => warning.id !== id));
  };

  // 폼 제출 핸들러
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // 선택된 옵션과 주의사항을 데이터에 추가
    const formData = {
      ...data,
      cargo: {
        ...data.cargo,
        options: selectedOptions
      },
      shipper: {
        ...data.shipper,
        warnings: companyWarnings
      }
    };
    
    // 폼 데이터 저장
    onSave(formData);
    toast({
      title: "화물 정보가 수정되었습니다",
      description: "변경사항이 저장되었습니다.",
    });
  };
  
  // 옵션 토글 핸들러
  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };
  
  // 담당자 선택 시 연락처와 이메일 자동 입력
  const selectManager = (manager: { id: string; name: string; contact: string; email: string }) => {
    form.setValue('shipper.manager', manager.name);
    form.setValue('shipper.contact', manager.contact);
    form.setValue('shipper.email', manager.email);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* 화주 정보 */}
          <div>
            <div className="flex items-center justify-between w-full">
              <button 
                type="button"
                className="flex items-center gap-2"
                onClick={() => setIsShipperInfoOpen(!isShipperInfoOpen)}
              >
                <User className="h-4 w-4 text-primary" />
                <h4 className="font-medium">화주 정보</h4>
              </button>
              <div className="flex items-center gap-2">
                {/* 주의사항 버튼 */}
                <Dialog open={isWarningsDialogOpen} onOpenChange={setIsWarningsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <AlertTriangle className="mr-1 h-3.5 w-3.5 text-amber-500" />
                      주의사항 관리
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>업체 주의사항 관리</DialogTitle>
                      <DialogDescription>
                        {initialData.shipper.name} 업체에 대한 주의사항을 관리합니다.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      {/* 기존 주의사항 목록 */}
                      {companyWarnings.length > 0 ? (
                        <ul className="space-y-2 mb-4">
                          {companyWarnings.map((warning) => (
                            <li key={warning.id} className="flex items-start gap-2 text-sm">
                              <Badge 
                                variant="outline" 
                                className={`
                                  ${warning.severity === 'high' ? 'bg-red-50 text-red-700' : 
                                    warning.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 
                                    'bg-blue-50 text-blue-700'}
                                `}
                              >
                                {warning.date}
                              </Badge>
                              <span className="flex-grow">{warning.content}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCompanyWarning(warning.id)}
                                className="h-5 w-5"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground mb-4">주의사항이 없습니다.</p>
                      )}
                      
                      {/* 새 주의사항 추가 */}
                      <div className="flex items-center gap-2">
                        <Select
                          value={newWarning.severity}
                          onValueChange={(value) => setNewWarning({...newWarning, severity: value as any})}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="중요도" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">낮음</SelectItem>
                            <SelectItem value="medium">중간</SelectItem>
                            <SelectItem value="high">높음</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={newWarning.content}
                          onChange={(e) => setNewWarning({...newWarning, content: e.target.value})}
                          placeholder="주의사항 내용"
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          size="sm"
                          onClick={addCompanyWarning}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {isShipperInfoOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(false)} />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" onClick={() => setIsShipperInfoOpen(true)} />
                )}
              </div>
            </div>
            
            {isShipperInfoOpen && (
              <div className="mt-3 space-y-4">
                <div className="grid grid-cols-3 gap-3 items-center">
                  <FormLabel className="text-muted-foreground text-sm">화주명</FormLabel>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="shipper.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormLabel className="text-muted-foreground text-sm">담당자</FormLabel>
                  <div className="col-span-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !form.getValues("shipper.manager") && "text-muted-foreground"
                            )}
                          >
                            {form.getValues("shipper.manager") || "담당자 선택"}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="담당자 검색..." />
                          <CommandEmpty>담당자를 찾을 수 없습니다.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {MANAGER_LIST.map(manager => (
                                <CommandItem
                                  key={manager.id}
                                  value={manager.name}
                                  onSelect={() => {
                                    selectManager(manager);
                                  }}
                                >
                                  {manager.name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormField
                      control={form.control}
                      name="shipper.manager"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormLabel className="text-muted-foreground text-sm">연락처</FormLabel>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="shipper.contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormLabel className="text-muted-foreground text-sm">이메일</FormLabel>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="shipper.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 분리선 */}
          <Separator className="my-4" />

          {/* 출발지/도착지 정보 */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 출발지 정보 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <h4 className="font-medium">출발지</h4>
                </div>
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="departure.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="주소 입력" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="departure.date"
                      render={({ field }) => (
                        <FormItem>
                          <DatePopover>
                            <DatePopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value || "날짜 선택"}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </DatePopoverTrigger>
                            <DatePopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={new Date(field.value)}
                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                locale={ko}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </DatePopoverContent>
                          </DatePopover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="departure.time"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="시간 (HH:MM)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="departure.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="담당자 이름" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="departure.company"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="회사명" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="departure.contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="연락처" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 상차 방법 추가 */}
                  <FormField
                    control={form.control}
                    name="departure.loadingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-sm">상차 방법</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="상차 방법 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOADING_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* 도착지 정보 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4" />
                  <h4 className="font-medium">도착지</h4>
                </div>
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="destination.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="주소 입력" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="destination.date"
                      render={({ field }) => (
                        <FormItem>
                          <DatePopover>
                            <DatePopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value || "날짜 선택"}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </DatePopoverTrigger>
                            <DatePopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={new Date(field.value)}
                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                locale={ko}
                                disabled={(date) => {
                                  const departureDate = new Date(form.getValues("departure.date"));
                                  return date < departureDate;
                                }}
                                initialFocus
                              />
                            </DatePopoverContent>
                          </DatePopover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="destination.time"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="시간 (HH:MM)" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="destination.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder="담당자 이름" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="destination.company"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="회사명" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="destination.contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="연락처" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 하차 방법 추가 */}
                  <FormField
                    control={form.control}
                    name="destination.loadingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-sm">하차 방법</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="하차 방법 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOADING_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* 화살표 표시 (모바일에서만) */}
            <div className="md:hidden flex justify-center py-2 bg-muted/30 mt-4">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* 분리선 */}
          <Separator className="my-4" />

          {/* 화물 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-4 w-4 text-primary" />
              <h4 className="font-medium">화물 상세</h4>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cargo.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm">화물 종류</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="화물 종류 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 결제 방법 추가 */}
                <FormField
                  control={form.control}
                  name="cargo.paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm">결제 방법</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="결제 방법 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cargo.vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm">차량 종류</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="차량 종류 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BROKER_VEHICLE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cargo.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-sm">중량</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="중량 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BROKER_WEIGHT_TYPES.map((weight) => (
                            <SelectItem key={weight} value={weight}>
                              {weight}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel className="text-muted-foreground text-sm">옵션</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TRANSPORT_OPTIONS.map((option) => (
                    <Badge
                      key={option.id}
                      variant={selectedOptions.includes(option.label) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => toggleOption(option.label)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="cargo.remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-sm">비고</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="추가 정보 입력"
                        className="resize-none h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
            <Button type="submit">저장</Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 