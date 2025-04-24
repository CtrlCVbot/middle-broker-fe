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
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useAddressStore from "@/store/address-store";
import { LocationForm } from "@/components/address/search-location-form";

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
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  
  // 주소 유효성 검사 함수 가져오기
  //const { validateAddressData } = useAddressStore();

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

  const handleSelectedLocation = (locationData: any) => {
    form.setValue('name', locationData.name || '');
    form.setValue('roadAddress', locationData.roadAddress || '');
    form.setValue('jibunAddress', locationData.jibunAddress || '');
    form.setValue('contactPhone', locationData.contactPhone || '');
    
    // metadata 정보 설정
    if (locationData.metadata) {
      form.setValue('metadata', {
        ...form.getValues('metadata'),
        ...locationData.metadata,
      });
    }
    
    setShowLocationSearch(false);
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
          // 시트 내부 클릭 이벤트가 상위로 전파되지 않도록 방지
          e.stopPropagation();
        }}
      >
        <SheetHeader className="mb-5">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            상/하차지 주소 정보를 입력해주세요. *표시는 필수 입력 항목입니다.
          </SheetDescription>
        </SheetHeader>

        {showLocationSearch ? (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">주소 검색</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLocationSearch(false)}
              >
                돌아가기
              </Button>
            </div>
            <LocationForm 
              type="any" 
              locationInfo={{}} 
              onChange={() => {}}
              onSelectLocation={handleSelectedLocation}
            />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation(); // 이벤트 버블링 방지
              console.log('폼 제출 이벤트 발생, 기본 동작 및 버블링 방지');
              form.handleSubmit(handleSubmit)(e);
            }} className="space-y-6">
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  <p className="text-sm font-medium">유효성 검사 오류</p>
                  <p className="text-sm mt-1 whitespace-pre-line">{validationError}</p>
                </div>
              )}

              <div className="space-x-4 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>유형 *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>상/하차지명 *</FormLabel>
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

                <Accordion type="multiple" defaultValue={["addresses"]} className="w-full">
                  <AccordionItem value="addresses">
                    <AccordionTrigger className="text-sm font-medium">주소 정보</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex justify-end mb-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowLocationSearch(true)}
                        >
                          주소 검색
                        </Button>
                      </div>
                    
                      <FormField
                        control={form.control}
                        name="roadAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>도로명 주소 *</FormLabel>
                            <FormControl>
                              <Input placeholder="도로명 주소를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jibunAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>지번 주소 *</FormLabel>
                            <FormControl>
                              <Input placeholder="지번 주소를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="detailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>상세 주소</FormLabel>
                            <FormControl>
                              <Input placeholder="상세 주소를 입력하세요" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              건물명, 동/호수 등 세부 위치정보
                            </FormDescription>
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="contact">
                    <AccordionTrigger className="text-sm font-medium">연락처 정보</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
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
                            <FormLabel>연락처 *</FormLabel>
                            <FormControl>
                              <Input placeholder="연락처를 입력하세요" {...field} />
                            </FormControl>
                            <FormDescription>
                              숫자와 하이픈(-)만 입력 가능합니다 (예: 010-1234-5678)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="additional">
                    <AccordionTrigger className="text-sm font-medium">추가 정보</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </div>

              <SheetFooter className="pt-4 px-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSheetClose}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={cn(isSubmitting && "opacity-70")}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      {defaultValues ? "수정 중..." : "등록 중..."}
                    </>
                  ) : (
                    defaultValues ? "수정" : "등록"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
} 