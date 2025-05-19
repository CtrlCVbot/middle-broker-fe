"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Search,
  Plus,
  User,
  X,
  Info,
  Factory,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BROKER_VEHICLE_TYPES, BROKER_WEIGHT_TYPES } from "@/types/broker-order";
import { Textarea } from "@/components/ui/textarea";
import { useBrokerDriverStore } from "@/store/broker-driver-store";
import { mapDriversForDispatchForm } from "@/utils/driver-mapper";
import { updateDispatchFields } from "@/services/broker-dispatch-service";

// 콜센터 목록
const CALL_CENTER_OPTIONS = [
  "화물맨",
  "원콜",
  "24시",  
  "기타"
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
    dispatchId?: string;
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
  
  // 선택된 차주 정보 상태 추가
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  
  // 차주 검색 관련 상태 가져오기
  const { searchDrivers, searchResults, isSearching, searchError, clearSearchResults } = useBrokerDriverStore();
  
  // 차주 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // 디버깅 추가: 원본 검색 결과 출력
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      console.log("원본 검색 결과:", searchResults);
    }
  }, [searchResults]);
  
  // 차주 검색 결과를 폼에서 사용 가능한 형태로 변환
  const formattedDrivers = mapDriversForDispatchForm(searchResults);
  
  // 디버깅 추가: 변환된 검색 결과 출력
  useEffect(() => {
    if (formattedDrivers && formattedDrivers.length > 0) {
      console.log("변환된 검색 결과:", formattedDrivers);
    }
  }, [formattedDrivers]);
  
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
      
    }
  });
  
  // 디바운스 적용된 검색어 변경 핸들러
  const debouncedSearch = useCallback(
    (value: string) => {
      const timeoutId = setTimeout(() => {
        if (value.trim()) {
          searchDrivers(value);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    },
    [searchDrivers]
  );
  
  // 검색어 변경 시 디바운스 적용 검색 실행
  useEffect(() => {
    const cleanup = debouncedSearch(searchTerm);
    return cleanup;
  }, [searchTerm, debouncedSearch]);
  
  // 팝오버가 닫힐 때 검색 결과 초기화
  useEffect(() => {
    if (!isOpen) {
      clearSearchResults();
      setSearchTerm('');
    }
  }, [isOpen, clearSearchResults]);
  
  // 차주 검색 입력 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };
  
  // 차주 조회 선택 시 정보 채우기
  const selectDriver = (driver: any) => {
    // 변환된 드라이버 객체에서 원본 검색 결과에서의 인덱스 찾기
    const originalIndex = formattedDrivers.findIndex(d => d.id === driver.id);
    
    // 원본 검색 결과가 있으면 그것을 사용
    const originalDriver = originalIndex !== -1 ? searchResults[originalIndex] : null;
    
    console.log("선택된 차주 (변환된):", driver);
    console.log("선택된 차주 (원본):", originalDriver);
    
    // 선택된 차주 정보 저장 - 원본 데이터 우선 사용
    setSelectedDriver(originalDriver || driver);
    
    form.setValue('driver.name', driver.name);
    form.setValue('driver.contact', driver.contact);
    form.setValue('vehicle.type', driver.vehicle.type);
    form.setValue('vehicle.weight', driver.vehicle.weight);
    form.setValue('vehicle.licensePlate', driver.vehicle.licensePlate);
    
    // 팝오버 닫기
    setIsOpen(false);
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
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // 로딩 상태 표시
      toast({
        title: "저장 중...",
        description: "배차 정보를 저장하고 있습니다.",
      });
  
      console.log("selectedDriver : ", selectedDriver);
      
      // 선택된 차주가 없으면 알림 표시
      if (!selectedDriver) {
        toast({
          title: "차주 정보 필요",
          description: "차주 검색을 통해 차주를 선택해주세요.",
          variant: "destructive"
        });
        return;
      }
      
      // 사용자 ID 필드 찾기
      const driverId = selectedDriver.id || selectedDriver.userId || null;
      
      console.log("사용할 차주 ID:", driverId);
      
      // 폼 데이터에서 업데이트할 필드 추출
      const fields = {    
        assignedDriverId: driverId, 
        assignedDriverSnapshot: selectedDriver ? JSON.stringify(selectedDriver) : null,   
        assignedDriverPhone: data.driver.contact,
        assignedVehicleNumber: data.vehicle.licensePlate,
        assignedVehicleType: data.vehicle.type,
        assignedVehicleWeight: data.vehicle.weight,
        assignedVehicleConnection: data.callCenter || "기타"
      };
      
      console.log("업데이트할 필드:", fields);
      
      // 특이사항이 있는 경우 메모로 추가
      // if (specialNotes.length > 0) {
      //   const noteTexts = specialNotes.map(note => 
      //     `[${note.date}] ${note.severity === 'high' ? '⚠️ ' : note.severity === 'medium' ? '⚠ ' : 'ℹ️ '}${note.content}`
      //   );
      //   fields.brokerMemo = noteTexts.join('\n');
      // }
      
      // 배차 상태가 '배차대기'인 경우 '배차완료'로 변경
      //fields.brokerFlowStatus = '배차완료';
      
      // API 호출하여 배차 정보 업데이트
      const dispatchId = initialData.dispatchId;
      if (!dispatchId) {
        throw new Error("배차 ID가 없습니다.");
      }
      
      // 배차 필드 업데이트 API 호출
      await updateDispatchFields(dispatchId, fields, "배차 정보 등록");
      
      // 성공 메시지 표시
      toast({
        title: "배차 정보 저장 완료",
        description: "배차 정보가 성공적으로 업데이트되었습니다.",
        variant: "default"
      });
      
      // 폼 데이터 저장
      onSave(data);
    } catch (error) {
      console.error("배차 정보 저장 중 오류:", error);
      
      // 오류 메시지 표시
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "배차 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
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
                <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                      <CommandInput 
                        placeholder="차주 검색..." 
                        value={searchTerm}
                        onValueChange={handleSearchChange}
                      />
                      {isSearching && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">검색 중...</span>
                        </div>
                      )}
                      {searchError && (
                        <div className="py-2 px-3 text-sm text-red-500">
                          오류: {searchError}
                        </div>
                      )}
                      <CommandEmpty>차주를 찾을 수 없습니다.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {formattedDrivers.map(driver => (
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