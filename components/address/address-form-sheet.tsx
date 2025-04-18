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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// 폼 유효성 검증을 위한 스키마
const addressFormSchema = z.object({
  name: z.string().min(1, "상/하차지명은 필수입니다"),
  roadAddress: z.string().min(1, "도로명 주소는 필수입니다"),
  jibunAddress: z.string().min(1, "지번 주소는 필수입니다"),
  detailAddress: z.string().optional(),
  postalCode: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z
    .string()
    .min(1, "연락처는 필수입니다")
    .regex(/^[0-9-]+$/, "올바른 연락처 형식이 아닙니다"),
  type: z.enum(["load", "drop", "any"] as const),
  memo: z.string().optional(),
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
      type: "load"
    }
  });

  // useEffect 추가하여 defaultValues가 변경될 때 폼 값 업데이트
  useEffect(() => {
    if (defaultValues) {
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
    }
  }, [defaultValues, form]);

  const handleSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    
    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // 시트가 닫힐 때 폼 초기화
  const handleSheetClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetClose}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            상/하차지 주소 정보를 입력해주세요. *표시는 필수 입력 항목입니다.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상/하차지명 *</FormLabel>
                  <FormControl>
                    <Input placeholder="상/하차지명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input placeholder="상세 주소를 입력하세요" {...field} />
                  </FormControl>
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
                    <Input placeholder="우편번호를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당자명</FormLabel>
                  <FormControl>
                    <Input placeholder="담당자명을 입력하세요" {...field} />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Input placeholder="메모를 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : defaultValues ? "수정" : "등록"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
} 