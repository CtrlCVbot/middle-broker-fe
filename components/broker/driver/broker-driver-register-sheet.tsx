"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { BrokerDriverBasicInfoForm } from "./forms/broker-driver-basic-info-form";
import { BrokerDriverVehicleInfoForm } from "./forms/broker-driver-vehicle-info-form";
import { BrokerDriverAccountInfoForm } from "./forms/broker-driver-account-info-form";
import { BrokerDriverNotesForm } from "./forms/broker-driver-notes-form";

// 차주 기본 정보 스키마
const basicInfoSchema = z.object({
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  businessNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["활성", "비활성"]).default("활성"),
});

// 차량 정보 스키마
const vehicleInfoSchema = z.object({
  vehicleNumber: z.string().min(1, "차량번호는 필수입니다"),
  vehicleType: z.string().min(1, "차량종류는 필수입니다"),
  tonnage: z.string().min(1, "톤수는 필수입니다"),
  cargoBoxType: z.string().optional(),
  cargoBoxLength: z.string().optional(),
  manufactureYear: z.string().optional(),
});

// 계정 정보 스키마
const accountInfoSchema = z.object({
  id: z.string().min(4, "아이디는 최소 4자 이상이어야 합니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  email: z.string().email("유효한 이메일 주소를 입력해주세요").optional().or(z.literal("")),
  permission: z.enum(["일반", "관리자"]).default("일반"),
});

// 특이사항 스키마
const noteSchema = z.object({
  notes: z.array(
    z.object({
      id: z.string(),
      content: z.string().min(1, "특이사항 내용은 필수입니다"),
      date: z.date(),
    })
  ).default([]),
});

// 전체 스키마
const driverSchema = z.object({
  basicInfo: basicInfoSchema,
  vehicleInfo: vehicleInfoSchema,
  accountInfo: accountInfoSchema,
  notes: noteSchema,
});

type DriverFormValues = z.infer<typeof driverSchema>;

interface IBrokerDriverRegisterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BrokerDriverRegisterSheet({ 
  open, 
  onOpenChange,
  onSuccess 
}: IBrokerDriverRegisterSheetProps) {
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    basic: boolean;
    vehicle: boolean;
    account: boolean;
    notes: boolean;
  }>({
    basic: false,
    vehicle: false,
    account: false,
    notes: false,
  });

  // 폼 초기화
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      basicInfo: {
        name: "",
        phone: "",
        businessNumber: "",
        address: "",
        status: "활성",
      },
      vehicleInfo: {
        vehicleNumber: "",
        vehicleType: "",
        tonnage: "",
        cargoBoxType: "",
        cargoBoxLength: "",
        manufactureYear: "",
      },
      accountInfo: {
        id: "",
        password: "",
        email: "",
        permission: "일반",
      },
      notes: {
        notes: [],
      },
    },
  });

  // 완료한 단계 체크
  const checkStepCompletion = (step: 'basic' | 'vehicle' | 'account' | 'notes', isValid: boolean) => {
    setFormStatus(prev => ({
      ...prev,
      [step]: isValid,
    }));
  };

  // 시트가 닫힐 때 초기화
  const handleSheetClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setActiveTab("basic-info");
      setFormStatus({
        basic: false,
        vehicle: false,
        account: false,
        notes: false,
      });
    }
    onOpenChange(open);
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: DriverFormValues) => {
    setIsSubmitting(true);
    
    try {
      // API 호출 등의 로직 (실제 개발시 추가)
      console.log("등록할 차주 데이터:", data);
      
      // 성공 처리 (목업)
      setTimeout(() => {
        toast.success("차주가 성공적으로 등록되었습니다", {
          description: `${data.basicInfo.name} 차주가 등록되었습니다.`,
        });
        
        handleSheetClose(false);
        if (onSuccess) {
          onSuccess();
        }
        
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("차주 등록 오류:", error);
      toast.error("차주 등록에 실패했습니다", {
        description: "잠시 후 다시 시도해주세요.",
      });
      setIsSubmitting(false);
    }
  };

  // 다음 탭으로 이동
  const handleNextTab = async () => {
    let isValid = false;
    
    if (activeTab === "basic-info") {
      isValid = await form.trigger("basicInfo", { shouldFocus: true });
      if (isValid) {
        checkStepCompletion('basic', true);
        setActiveTab("vehicle-info");
      }
    } else if (activeTab === "vehicle-info") {
      isValid = await form.trigger("vehicleInfo", { shouldFocus: true });
      if (isValid) {
        checkStepCompletion('vehicle', true);
        setActiveTab("account-info");
      }
    } else if (activeTab === "account-info") {
      isValid = await form.trigger("accountInfo", { shouldFocus: true });
      if (isValid) {
        checkStepCompletion('account', true);
        setActiveTab("notes");
      }
    }
  };

  // 이전 탭으로 이동
  const handlePreviousTab = () => {
    if (activeTab === "vehicle-info") {
      setActiveTab("basic-info");
    } else if (activeTab === "account-info") {
      setActiveTab("vehicle-info");
    } else if (activeTab === "notes") {
      setActiveTab("account-info");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader>
              <SheetTitle>차주 등록</SheetTitle>
              <SheetDescription>
                운송 업무를 수행할 차주의 정보를 등록합니다.
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger 
                    value="basic-info"
                    className="relative"
                  >
                    기본 정보
                    {formStatus.basic && (
                      <Check className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="vehicle-info"
                    className="relative"
                  >
                    차량 정보
                    {formStatus.vehicle && (
                      <Check className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="account-info"
                    className="relative"
                  >
                    계정 정보
                    {formStatus.account && (
                      <Check className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes"
                    className="relative"
                  >
                    특이사항
                    {formStatus.notes && (
                      <Check className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic-info">
                  <Alert className="mb-4">
                    <AlertTitle>기본 정보 입력</AlertTitle>
                    <AlertDescription>
                      차주의 이름, 연락처 등 기본 정보를 입력하세요.
                    </AlertDescription>
                  </Alert>
                  <BrokerDriverBasicInfoForm 
                    form={form} 
                    onComplete={() => checkStepCompletion('basic', true)}
                  />
                </TabsContent>

                <TabsContent value="vehicle-info">
                  <Alert className="mb-4">
                    <AlertTitle>차량 정보 입력</AlertTitle>
                    <AlertDescription>
                      차량번호, 차종, 톤수 등 차량 정보를 입력하세요.
                    </AlertDescription>
                  </Alert>
                  <BrokerDriverVehicleInfoForm 
                    form={form}
                    onComplete={() => checkStepCompletion('vehicle', true)}
                  />
                </TabsContent>

                <TabsContent value="account-info">
                  <Alert className="mb-4">
                    <AlertTitle>계정 정보 입력</AlertTitle>
                    <AlertDescription>
                      차주의 로그인 정보를 설정하세요.
                    </AlertDescription>
                  </Alert>
                  <BrokerDriverAccountInfoForm 
                    form={form}
                    onComplete={() => checkStepCompletion('account', true)}
                  />
                </TabsContent>

                <TabsContent value="notes">
                  <Alert className="mb-4">
                    <AlertTitle>특이사항 입력</AlertTitle>
                    <AlertDescription>
                      차주에 대한 특이사항이 있다면 기록해주세요.
                    </AlertDescription>
                  </Alert>
                  <BrokerDriverNotesForm 
                    form={form}
                    onComplete={() => checkStepCompletion('notes', true)}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <SheetFooter className="flex flex-row justify-between mt-6 gap-2">
              <div className="flex gap-2">
                {activeTab !== "basic-info" && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreviousTab}
                    disabled={isSubmitting}
                  >
                    이전
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {activeTab !== "notes" ? (
                  <Button 
                    type="button" 
                    onClick={handleNextTab}
                    disabled={isSubmitting}
                  >
                    다음
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        처리중...
                      </>
                    ) : (
                      "등록 완료"
                    )}
                  </Button>
                )}
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
} 