"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
import { 
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  AlertTriangle, 
  Calendar,
  Search,
  Plus,
  Trash,
  User,
  Truck,
  X,
  Info,
  Factory
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BROKER_VEHICLE_TYPES, BROKER_WEIGHT_TYPES } from "@/types/broker-order";
import { Textarea } from "@/components/ui/textarea";

// 콜센터 목록
const CALL_CENTER_OPTIONS = [
  "24시",
  "화물맨",
  "오늘의화물",
  "화물25",
  "화물119",
  "직접입력"
];

// 차주 목록 (실제로는 API에서 가져올 데이터)
const DRIVER_LIST = [
  { id: '1', name: '김운송', contact: '010-1234-5678', vehicle: { type: '카고', weight: '5톤', licensePlate: '서울12가3456' } },
  { id: '2', name: '이차주', contact: '010-2345-6789', vehicle: { type: '윙바디', weight: '8톤', licensePlate: '경기34나5678' } },
  { id: '3', name: '박기사', contact: '010-3456-7890', vehicle: { type: '카고', weight: '2.5톤', licensePlate: '인천56다7890' } },
  { id: '4', name: '최드라', contact: '010-4567-8901', vehicle: { type: '탑차', weight: '4.5톤', licensePlate: '서울78라9012' } },
  { id: '5', name: '정기사', contact: '010-5678-9012', vehicle: { type: '윙바디', weight: '11톤', licensePlate: '경기90마1234' } }
];

// 운송 거래처 목록 (실제로는 API에서 가져올 데이터)
const CARRIER_LIST = [
  { 
    id: '1', 
    businessName: '화물왕운송', 
    businessNumber: '123-45-67890', 
    businessType: '일반사업자',
    representative: '김대표',
    bankName: '국민',
    accountHolder: '화물왕운송',
    accountNumber: '123456789012',
    taxInvoiceType: '전자',
    deliveryMethod: '이메일'
  },
  { 
    id: '2', 
    businessName: '신속물류', 
    businessNumber: '234-56-78901', 
    businessType: '법인사업자',
    representative: '이사장',
    bankName: '신한',
    accountHolder: '신속물류(주)',
    accountNumber: '234567890123',
    taxInvoiceType: '전자',
    deliveryMethod: '이메일'
  },
  { 
    id: '3', 
    businessName: '민트익스프레스', 
    businessNumber: '345-67-89012', 
    businessType: '개인사업자',
    representative: '박사장',
    bankName: '우리',
    accountHolder: '민트익스프레스',
    accountNumber: '345678901234',
    taxInvoiceType: '수기',
    deliveryMethod: '종이'
  },
  { 
    id: '4', 
    businessName: '한국종합물류', 
    businessNumber: '456-78-90123', 
    businessType: '법인사업자',
    representative: '최회장',
    bankName: '하나',
    accountHolder: '한국종합물류(주)',
    accountNumber: '456789012345',
    taxInvoiceType: '전자',
    deliveryMethod: '이메일'
  },
  { 
    id: '5', 
    businessName: '드림로지스', 
    businessNumber: '567-89-01234', 
    businessType: '개인사업자',
    representative: '정사업',
    bankName: '농협',
    accountHolder: '드림로지스',
    accountNumber: '567890123456',
    taxInvoiceType: '면세',
    deliveryMethod: '팩스'
  }
];

// 중요도 옵션
const SEVERITY_OPTIONS = [
  { value: 'low', label: '낮음', color: 'bg-blue-50 text-blue-700' },
  { value: 'medium', label: '중간', color: 'bg-amber-50 text-amber-700' },
  { value: 'high', label: '높음', color: 'bg-red-50 text-red-700' }
];

// 폼 유효성 검증 스키마
const formSchema = z.object({
  driver: z.object({
    name: z.string().min(1, "차주명을 입력해주세요"),
    contact: z.string().min(1, "연락처를 입력해주세요")
  }),
  vehicle: z.object({
    type: z.string().min(1, "차량 종류를 선택해주세요"),
    weight: z.string().min(1, "중량을 선택해주세요"),
    licensePlate: z.string().min(1, "차량번호를 입력해주세요")
  }),
  callCenter: z.string().optional(),
  carrier: z.object({
    businessName: z.string().min(1, "사업자명을 입력해주세요"),
    businessNumber: z.string().min(1, "사업자번호를 입력해주세요"),
    businessType: z.string().min(1, "유형을 선택해주세요"),
    representative: z.string().min(1, "대표자명을 입력해주세요"),
    bankName: z.string().min(1, "은행명을 입력해주세요"),
    accountHolder: z.string().min(1, "예금주를 입력해주세요"),
    accountNumber: z.string().min(1, "계좌번호를 입력해주세요"),
    taxInvoiceType: z.string().min(1, "계산서 유형을 선택해주세요"),
    deliveryMethod: z.string().min(1, "배송 방법을 선택해주세요")
  })
});

interface SpecialNote {
  id: string;
  date: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

interface BrokerOrderDriverInfoEditFormProps {
  initialData: {
    driver: {
      name: string;
      contact: string;
    };
    vehicle: {
      type: string;
      weight: string;
      licensePlate: string;
    };
    callCenter?: string;
    specialNotes?: SpecialNote[];
    carrier?: {
      businessName: string;
      businessNumber: string;
      businessType: string;
      representative: string;
      bankName: string;
      accountHolder: string;
      accountNumber: string;
      taxInvoiceType: string;
      deliveryMethod: string;
    };
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function BrokerOrderDriverInfoEditForm({ initialData, onSave, onCancel }: BrokerOrderDriverInfoEditFormProps) {
  // 특이사항 상태 관리
  const [specialNotes, setSpecialNotes] = useState<SpecialNote[]>(
    initialData.specialNotes || []
  );
  
  // 새 특이사항 입력 상태
  const [newNote, setNewNote] = useState({
    content: '',
    severity: 'medium' as 'low' | 'medium' | 'high'
  });
  
  // React Hook Form 설정
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      driver: {
        name: initialData.driver.name || "",
        contact: initialData.driver.contact || ""
      },
      vehicle: {
        type: initialData.vehicle.type || "",
        weight: initialData.vehicle.weight || "",
        licensePlate: initialData.vehicle.licensePlate || ""
      },
      callCenter: initialData.callCenter || "24시",
      carrier: {
        businessName: initialData.carrier?.businessName || "재형운송",
        businessNumber: initialData.carrier?.businessNumber || "111-11-11111",
        businessType: initialData.carrier?.businessType || "일반사업자",
        representative: initialData.carrier?.representative || "박재형",
        bankName: initialData.carrier?.bankName || "국민",
        accountHolder: initialData.carrier?.accountHolder || "재형운송",
        accountNumber: initialData.carrier?.accountNumber || "1111111111",
        taxInvoiceType: initialData.carrier?.taxInvoiceType || "수기",
        deliveryMethod: initialData.carrier?.deliveryMethod || "종이"
      }
    }
  });
  
  // 차주 조회 선택 시 정보 채우기
  const selectDriver = (driver: any) => {
    form.setValue('driver.name', driver.name);
    form.setValue('driver.contact', driver.contact);
    form.setValue('vehicle.type', driver.vehicle.type);
    form.setValue('vehicle.weight', driver.vehicle.weight);
    form.setValue('vehicle.licensePlate', driver.vehicle.licensePlate);
  };
  
  // 운송 거래처 선택 시 정보 채우기
  const selectCarrier = (carrier: any) => {
    form.setValue('carrier.businessName', carrier.businessName);
    form.setValue('carrier.businessNumber', carrier.businessNumber);
    form.setValue('carrier.businessType', carrier.businessType);
    form.setValue('carrier.representative', carrier.representative);
    form.setValue('carrier.bankName', carrier.bankName);
    form.setValue('carrier.accountHolder', carrier.accountHolder);
    form.setValue('carrier.accountNumber', carrier.accountNumber);
    form.setValue('carrier.taxInvoiceType', carrier.taxInvoiceType);
    form.setValue('carrier.deliveryMethod', carrier.deliveryMethod);
    
    toast({
      title: "거래처 정보 불러오기 완료",
      description: `${carrier.businessName} 정보가 적용되었습니다.`,
    });
  };
  
  // 특이사항 추가
  const addSpecialNote = () => {
    if (!newNote.content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive"
      });
      return;
    }
    
    const note: SpecialNote = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: newNote.content,
      severity: newNote.severity
    };
    
    setSpecialNotes([...specialNotes, note]);
    setNewNote({ content: '', severity: 'medium' });
  };
  
  // 특이사항 삭제
  const removeSpecialNote = (id: string) => {
    setSpecialNotes(specialNotes.filter(note => note.id !== id));
  };
  
  // 폼 제출 핸들러
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // 특이사항을 데이터에 추가
    const formData = {
      ...data,
      specialNotes
    };
    
    // 폼 데이터 저장
    onSave(formData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* 차주 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-primary" />
              <h4 className="font-medium">차주 정보</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-3 items-center mb-3">
              <Label className="text-muted-foreground text-sm">차주 조회</Label>
              <div className="col-span-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      차주 검색
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="차주 검색..." />
                      <CommandEmpty>차주를 찾을 수 없습니다.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {DRIVER_LIST.map(driver => (
                            <CommandItem
                              key={driver.id}
                              value={driver.name}
                              onSelect={() => selectDriver(driver)}
                            >
                              {driver.name} ({driver.contact})
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 items-center">
              <FormLabel className="text-muted-foreground text-sm">차주명</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="driver.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          //readOnly
                          className="bg-muted/30"
                        />
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
                  name="driver.contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="연락처 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">차량번호</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="vehicle.licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="차량번호 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">차량종류</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="vehicle.type"
                  render={({ field }) => (
                    <FormItem>
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
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">중량</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="vehicle.weight"
                  render={({ field }) => (
                    <FormItem>
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
              
              <FormLabel className="text-muted-foreground text-sm">배차콜센터</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="callCenter"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="콜센터 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CALL_CENTER_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
          
          {/* 분리선 */}
          <Separator className="my-4" />
          
          {/* 운송 거래처 정보 추가 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Factory className="h-4 w-4 text-primary" />
              <h4 className="font-medium">운송 거래처 정보</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-3 items-center mb-3">
              <Label className="text-muted-foreground text-sm">업체 조회</Label>
              <div className="col-span-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      거래처 검색
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0">
                    <Command>
                      <CommandInput placeholder="거래처명 또는 사업자번호 검색..." />
                      <CommandEmpty>거래처를 찾을 수 없습니다.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {CARRIER_LIST.map(carrier => (
                            <CommandItem
                              key={carrier.id}
                              value={carrier.businessName}
                              onSelect={() => selectCarrier(carrier)}
                            >
                              <div className="flex flex-col">
                                <span>{carrier.businessName}</span>
                                <span className="text-xs text-muted-foreground">{carrier.businessNumber} ({carrier.businessType})</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 items-center">
              <FormLabel className="text-muted-foreground text-sm">사업자명</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="사업자명 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">사업자번호</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.businessNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="사업자번호 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">유형</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.businessType"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="개인사업자">개인사업자</SelectItem>
                          <SelectItem value="일반사업자">일반사업자</SelectItem>
                          <SelectItem value="법인사업자">법인사업자</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">대표자</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.representative"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="대표자명 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">은행명</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.bankName"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="은행 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="국민">국민은행</SelectItem>
                          <SelectItem value="신한">신한은행</SelectItem>
                          <SelectItem value="우리">우리은행</SelectItem>
                          <SelectItem value="하나">하나은행</SelectItem>
                          <SelectItem value="기업">기업은행</SelectItem>
                          <SelectItem value="농협">농협은행</SelectItem>
                          <SelectItem value="카카오">카카오뱅크</SelectItem>
                          <SelectItem value="토스">토스뱅크</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">예금주</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.accountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="예금주 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">계좌번호</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="계좌번호 입력" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">계산서</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.taxInvoiceType"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="계산서 유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="전자">전자세금계산서</SelectItem>
                          <SelectItem value="수기">수기세금계산서</SelectItem>
                          <SelectItem value="면세">면세계산서</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormLabel className="text-muted-foreground text-sm">배송 방법</FormLabel>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="carrier.deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="배송 방법 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="이메일">이메일</SelectItem>
                          <SelectItem value="종이">종이</SelectItem>
                          <SelectItem value="팩스">팩스</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* 분리선 */}
          <Separator className="my-4" />
          
          {/* 차주 특이사항 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-primary" />
              <h4 className="font-medium">차주 특이사항</h4>
            </div>
            
            {/* 특이사항 목록 */}
            {specialNotes.length > 0 ? (
              <div className="space-y-2 mb-4">
                {specialNotes.map((note) => (
                  <div key={note.id} className="flex items-start gap-2 bg-muted/20 p-2 rounded">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        note.severity === 'high' ? 'bg-red-50 text-red-700' : 
                        note.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 
                        'bg-blue-50 text-blue-700'
                      )}
                    >
                      {note.date}
                    </Badge>
                    <span className="flex-grow">{note.content}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSpecialNote(note.id)}
                      className="h-5 w-5"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center p-4 bg-muted/10 rounded mb-4">
                등록된 특이사항이 없습니다.
              </div>
            )}
            
            {/* 특이사항 추가 */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-2">
                {/* 중요도 추가 */}
                <Select
                  value={newNote.severity}
                  onValueChange={(value) => setNewNote({...newNote, severity: value as any})}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="중요도" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="특이사항 내용을 입력하세요"
                  className="flex-grow resize-none h-10"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSpecialNote}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 