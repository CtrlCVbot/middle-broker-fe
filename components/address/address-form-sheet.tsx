"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { IAddress } from "@/types/address";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { LoaderCircle, X, Map, Phone, Building2, Info, ChevronLeft, User } from "lucide-react";
import { cn } from "@/lib/utils";
import useAddressStore from "@/store/address-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon } from 'lucide-react';
import { SearchLocationDialog, IKakaoAddressResult } from './search-location-dialog';

// 폼 유효성 검증을 위한 스키마 - 강화된 버전
const addressFormSchema = z.object({
  name: z.string()
    .min(1, "상/하차지명은 필수입니다")
    .max(50, "상/하차지명은 50자 이내로 입력해주세요"),
  roadAddress: z.string()
    .min(1, "도로명 주소는 필수입니다")
    .max(200, "도로명 주소는 200자 이내로 입력해주세요"),
  jibunAddress: z.string()
    .min(1, "지번 주소는 필수입니다")
    .max(200, "지번 주소는 200자 이내로 입력해주세요"),
  detailAddress: z.string().max(100, "상세 주소는 100자 이내로 입력해주세요").optional(),
  postalCode: z.string().regex(/^\d{5}$/, "우편번호는 5자리 숫자로 입력해주세요").optional(),
  contactName: z.string().max(50, "담당자명은 50자 이내로 입력해주세요").optional(),
  contactPhone: z
    .string()
    .min(1, "연락처는 필수입니다")
    .regex(/^[0-9-]+$/, "올바른 연락처 형식이 아닙니다 (숫자와 하이픈만 가능)"),
  type: z.enum(["load", "drop", "any"] as const, {
    required_error: "주소 유형을 선택해주세요",
  }),
  memo: z.string().max(500, "메모는 500자 이내로 입력해주세요").optional(),
  metadata: z.object({
    originalInput: z.string().optional(),
    source: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    buildingName: z.string().optional(),
    floor: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface IAddressFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<IAddress, "id" | "createdAt" | "updatedAt" | "isFrequent" | "createdBy" | "updatedBy">) => void;
  defaultValues?: IAddress;
  title?: string;
}

export function AddressFormSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title = "주소 등록"
}: IAddressFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  
  // 주소 검색 여부 체크 (검색 결과가 있는지)
  const [hasSearchedAddress, setHasSearchedAddress] = useState(!!defaultValues?.id);

  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      roadAddress: defaultValues.roadAddress,
      jibunAddress: defaultValues.jibunAddress,
      detailAddress: defaultValues.detailAddress || undefined,
      postalCode: defaultValues.postalCode || undefined,
      contactName: defaultValues.contactName || undefined,
      contactPhone: defaultValues.contactPhone || undefined,
      type: defaultValues.type,
      memo: defaultValues.memo || undefined,
      metadata: defaultValues.metadata
    } : {
      type: "load",
      metadata: {
        tags: []
      }
    }
  });

  // useEffect 추가하여 defaultValues가 변경될 때 폼 값 업데이트
  useEffect(() => {
    if (defaultValues && isOpen) {
      setHasSearchedAddress(true);
      form.reset({
        name: defaultValues.name,
        roadAddress: defaultValues.roadAddress,
        jibunAddress: defaultValues.jibunAddress,
        detailAddress: defaultValues.detailAddress || undefined,
        postalCode: defaultValues.postalCode || undefined,
        contactName: defaultValues.contactName || undefined,
        contactPhone: defaultValues.contactPhone || undefined,
        type: defaultValues.type,
        memo: defaultValues.memo || undefined,
        metadata: defaultValues.metadata
      });
      setValidationError(null);
    } else if (!defaultValues && isOpen) {
      setHasSearchedAddress(false);
      form.reset({
        type: "load",
        metadata: {
          tags: []
        }
      });
      setValidationError(null);
    }
  }, [defaultValues, form, isOpen]);

  const handleSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    setValidationError(null);
    
    try {
      // // 서버 측 유효성 검사 추가 (선택 사항)
      // try {
      //   const validationResult = await validateAddressData(data);
      //   if (!validationResult.isValid && validationResult.errors?.length) {
      //     setValidationError(validationResult.errors.join('\n'));
      //     setIsSubmitting(false);
      //     return;
      //   }
      // } catch (error) {
      //   // 유효성 검사 API 호출 실패 시 클라이언트 측 검증으로만 진행
      //   console.warn('주소 유효성 검증 API 호출 실패:', error);
      // }
      
      // 폼 데이터 제출 - undefined를 null로 변환
      onSubmit({
        ...data,
        detailAddress: data.detailAddress || null,
        postalCode: data.postalCode || null,
        contactName: data.contactName || null,
        contactPhone: data.contactPhone || null,
        memo: data.memo || null
      });
      
      // 폼 초기화 및 시트 닫기
      form.reset();
      onClose();
    } catch (error) {
      console.error("주소 저장 중 오류 발생:", error);
      setValidationError(error instanceof Error ? error.message : "주소를 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 주소 검색 결과 선택 시 폼에 반영
  const handleSelectLocation = (result: IKakaoAddressResult) => {
    form.setValue('name', result.place_name || '');
    form.setValue('roadAddress', result.road_address?.address_name || '');
    form.setValue('jibunAddress', result.address?.address_name || '');
    form.setValue('contactPhone', result.phone || '');
    form.setValue('postalCode', result.road_address?.zone_no || '');
    form.setValue('metadata', {
      ...form.getValues('metadata'),
      lat: parseFloat(result.y),
      lng: parseFloat(result.x),
      originalInput: result.road_address?.address_name || result.address?.address_name,
      source: 'kakao',
      buildingName: result.place_name,
    });
    setHasSearchedAddress(true);
  };

  // 전화번호 자동 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자와 하이픈만 남기기
    const cleaned = value.replace(/[^\d-]/g, '');
    // 하이픈 제거
    const numbersOnly = cleaned.replace(/-/g, '');
    
    // 전화번호 형식에 맞게 하이픈 추가
    if (numbersOnly.length <= 3) {
      return numbersOnly;
    } else if (numbersOnly.length <= 7) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
    } else {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
    }
  };

  // 전화번호 변경 시 자동 포맷팅 적용
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    onChange(formattedValue);
  };

  // 시트가 닫힐 때 폼 초기화
  const handleSheetClose = () => {
    form.reset();
    setValidationError(null);
    onClose();
  };

  

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto"
        onPointerDownCapture={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center">
          <SheetHeader className="mb-5">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              상/하차지 주소 정보를 입력해주세요. <span className="text-destructive">*</span> 표시는 필수 입력 항목입니다.
            </SheetDescription>
          </SheetHeader>
          {/* <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </Button>
          </SheetClose> */}
        </div>

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }} className="space-y-6">
            {validationError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
                <p className="text-sm font-medium">유효성 검사 오류</p>
                <p className="text-sm mt-1 whitespace-pre-line">{validationError}</p>
              </div>
            )}

            <div className="px-6 space-y-6">
              {/* 기본 정보 영역 */}
              <div className="border rounded-lg p-4 bg-muted/30">

                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Building2 className="h-5 w-5" />
                  <h3 className="font-medium">기본 정보</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* 유형 영역 */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          유형 <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="유형을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="load">상차지</SelectItem>
                            <SelectItem value="drop">하차지</SelectItem>
                            <SelectItem value="any">상/하차지</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          화물의 상차/하차 위치 유형을 선택하세요
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 상/하차지명 영역 */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          상/하차지명 <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="상/하차지명을 입력하세요" {...field} />
                        </FormControl>
                        <FormDescription>
                          회사명, 창고명 등 장소를 식별할 수 있는 이름
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>

              {/* 주소 정보 영역 */}              
              <div className="border rounded-lg p-4 bg-muted/30">

                <div className="flex items-center justify-between mb-4">

                  <div className="flex items-center gap-2 text-primary">
                    <Map className="h-5 w-5" />
                    <h3 className="font-medium">주소 정보</h3>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsSearchDialogOpen(true)}
                  >
                    <SearchIcon className="h-4 w-4 mr-2" />
                    주소 검색
                  </Button>
                </div>

                {hasSearchedAddress ? (
                  <>
                    {/* 도로명/지번 주소 표시 영역 */}
                    <div className="mb-6 space-y-4">
                      <div className="p-4 rounded-lg shadow-md bg-background border bg-muted">
                        <div className="text-primary font-semibold text-lg mb-1">
                          {form.getValues('roadAddress') || '주소를 입력하세요'}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          (지번) {form.getValues('jibunAddress') || '지번 주소 없음'}
                        </div>
                      </div>
                    </div>

                    {/* 상세 주소 및 우편번호 입력 */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="detailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>상세 주소</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="상세 주소를 입력하세요" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>건물명, 동/호수 등 세부 위치정보를 입력하세요.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>우편번호</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="우편번호 5자리" 
                                {...field} 
                                value={field.value || ''}
                                maxLength={5}
                                className="max-w-[200px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-md">
                    <Map className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">주소를 먼저 검색해주세요</p>
                    <Button 
                      type="button" 
                      onClick={() => setIsSearchDialogOpen(true)}
                    >
                      <SearchIcon className="h-4 w-4 mr-2" />
                      주소 검색하기
                    </Button>
                  </div>
                )}


                

              </div>

              {/* 연락처 정보 영역 */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <User className="h-5 w-5" />
                  <h3 className="font-medium">연락처 정보</h3>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>담당자명</FormLabel>
                        <FormControl>
                          <Input placeholder="담당자명을 입력하세요" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          연락처 <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="연락처를 입력하세요" 
                              className="pl-10" 
                              value={field.value || ''} 
                              onChange={(e) => handlePhoneChange(e, field.onChange)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          숫자와 하이픈(-)만 입력 가능합니다 (예: 010-1234-5678)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 추가 정보 영역 */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Info className="h-5 w-5" />
                  <h3 className="font-medium">추가 정보</h3>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="memo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>메모</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="배송이나 위치에 관한 추가 정보" 
                            className="resize-none min-h-[100px]" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="px-6 py-4 border-t mt-6 flex gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSheetClose}
                disabled={isSubmitting}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                목록으로
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(isSubmitting && "opacity-70")}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {defaultValues ? "주소 수정 중..." : "주소 등록 중..."}
                  </>
                ) : (
                  defaultValues ? "주소 수정" : "주소 등록"
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>

        {/* 주소 검색 다이얼로그 분리 컴포넌트 */}
        <SearchLocationDialog
          open={isSearchDialogOpen}
          onOpenChange={setIsSearchDialogOpen}
          onSelect={handleSelectLocation}
        />
      </SheetContent>
    </Sheet>
  );
} 