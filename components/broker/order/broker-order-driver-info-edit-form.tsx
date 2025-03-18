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
  Info
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
  callCenter: z.string().optional()
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
      callCenter: initialData.callCenter || "24시"
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
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