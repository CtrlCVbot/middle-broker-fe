"use client";

import { useState } from "react";
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
  address: z.string().min(1, "주소는 필수입니다"),
  contact: z
    .string()
    .min(1, "연락처는 필수입니다")
    .regex(/^[0-9-]+$/, "올바른 연락처 형식이 아닙니다"),
  manager: z.string().min(1, "담당자는 필수입니다"),
  type: z.string().min(1, "유형은 필수입니다"),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface IAddressFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<IAddress, "id">) => void;
  defaultValues?: IAddress; // 수정 시 사용될 기본값
  title?: string; // 폼 제목 (등록 또는 수정)
}

export function AddressFormSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title = "주소 등록",
}: IAddressFormSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: defaultValues 
      ? {
          name: defaultValues.name,
          address: defaultValues.address,
          contact: defaultValues.contact,
          manager: defaultValues.manager,
          type: defaultValues.type,
        }
      : {
          name: "",
          address: "",
          contact: "",
          manager: "",
          type: "",
        },
  });

  const handleSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    
    try {
      // 폼 데이터 제출
      onSubmit(data);
      
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
            상/하차지 주소 정보를 입력하세요. 모든 필드는 필수입니다.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4 px-4">       


            <div className="flex gap-4">

            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>유형</FormLabel>
                    <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                        <SelectValue placeholder="유형을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="상차지">상차지</SelectItem>
                        <SelectItem value="하차지">하차지</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>상/하차지명</FormLabel>
                    <FormControl>
                    <Input placeholder="상/하차지명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상/하차지명</FormLabel>
                  <FormControl>
                    <Input placeholder="상/하차지명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input placeholder="주소를 입력하세요" className="flex-1" {...field} />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // 주소 검색 기능 추가 예정
                          alert("주소 검색 기능은 백엔드 연동 시 구현 예정입니다.");
                        }}
                      >
                        검색
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="연락처를 입력하세요 (예: 010-1234-5678)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>담당자</FormLabel>
                  <FormControl>
                    <Input placeholder="담당자 이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            
            

            <SheetFooter className="pt-4">
                {/* 취소 */}
                {/*
                <Button
                type="button"
                variant="outline"
                onClick={handleSheetClose}
                disabled={isSubmitting}
                >
                취소
                </Button>
                */}
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