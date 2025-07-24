"use client";

import React, { useState, useEffect } from "react";
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
  SheetTrigger
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Plus, Edit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { BrokerDriverBasicInfoForm } from "./forms/broker-driver-basic-info-form";
import { BrokerDriverVehicleInfoForm } from "./forms/broker-driver-vehicle-info-form";
import { BrokerDriverAccountInfoForm } from "./forms/broker-driver-account-info-form";
import { BrokerDriverNotesForm } from "./forms/broker-driver-notes-form";
import { 
  IBrokerDriver, 
  VehicleType, 
  TonnageType, 
  DriverStatus,
  PermissionType 
} from "@/types/broker-driver";

//store
import { useBrokerDriverStore } from "@/store/broker-driver-store";

//service
import { registerDriver } from "@/services/driver-service";

// 차주 기본 정보 스키마
const basicInfoSchema = z.object({
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  businessNumber: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["활성", "비활성"]).default("활성"),
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
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
// const accountInfoSchema = z.object({
//   id: z.string().min(4, "아이디는 최소 4자 이상이어야 합니다"),
//   password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
//   email: z.string().email("유효한 이메일 주소를 입력해주세요").optional().or(z.literal("")),
//   permission: z.enum(["일반", "관리자"]).default("일반"),
// });

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
  // accountInfo: accountInfoSchema,
  notes: noteSchema,
});

type DriverFormValues = z.infer<typeof driverSchema>;

interface IBrokerDriverRegisterSheetProps {
  onRegisterSuccess?: (driver: IBrokerDriver) => void;
  onUpdateSuccess?: (driver: IBrokerDriver) => void;
  driver?: IBrokerDriver;
  trigger?: React.ReactNode;
  mode?: 'register' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BrokerDriverRegisterSheet({ 
  onRegisterSuccess,
  onUpdateSuccess,
  driver,
  trigger,
  mode = 'register',
  open,
  onOpenChange
}: IBrokerDriverRegisterSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
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
  
  const { updateDriverWithAPI, registerDriverWithAPI } = useBrokerDriverStore();

  // 외부에서 제어되는 경우 내부 상태 동기화
  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open);
    }
  }, [open]);
  
  // 내부 상태 변경 시 외부 핸들러 호출
  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }

    // 시트가 닫힐 때 상태 초기화
    if (!newOpen) {
      setActiveTab("basic-info");
      setFormStatus({
        basic: false,
        vehicle: false,
        account: false,
        notes: false,
      });
      form.reset();
    }
  };

  // 폼 기본값 설정
  const getFormDefaultValues = () => {
    if (mode === 'edit' && driver) {
      console.log("driver!!!", driver);
      return {
        basicInfo: {
          name: driver.name || "",
          phone: driver.phoneNumber || "",
          businessNumber: driver.businessNumber || "",
          address: driver.address || "",
          status: driver.status || "활성",
          bankCode: driver.bankCode || "",
          bankAccountNumber: driver.bankAccountNumber || "",
          bankAccountHolder: driver.bankAccountHolder || "",
        },
        vehicleInfo: {
          vehicleNumber: driver.vehicleNumber || "",
          vehicleType: driver.vehicleType || "",
          tonnage: driver.tonnage || "",
          cargoBoxType: driver.cargoBox?.type || "",
          cargoBoxLength: driver.cargoBox?.length || "",
          manufactureYear: driver.manufactureYear || "",
        },
        accountInfo: {
          id: driver.account?.id || "",
          password: "",  // 보안상 빈 값으로 설정
          email: driver.account?.email || "",
          permission: driver.account?.permission || "일반",
        },
        notes: {
          notes: driver.notes || [],
        },
      };
    }
    
    return {
      basicInfo: {
        name: "",
        phone: "",
        businessNumber: "",
        address: "",
        status: "활성" as DriverStatus,
        bankCode: "",
        bankAccountNumber: "",
        bankAccountHolder: "",
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
        permission: "일반" as PermissionType,
      },
      notes: {
        notes: [],
      },
    };
  };

  // 폼 초기화
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: getFormDefaultValues(),
  });

  // 편집 모드일 때 폼 초기값 설정
  useEffect(() => {
    if (mode === 'edit' && driver) {
      form.reset(getFormDefaultValues());
      
      // 데이터가 있는 경우 각 탭의 상태를 완료로 표시
      setFormStatus({
        basic: true,
        vehicle: true,
        account: true,
        notes: true,
      });
    }
  }, [driver, mode]);

  // 완료한 단계 체크
  const checkStepCompletion = (step: 'basic' | 'vehicle' | 'account' | 'notes', isValid: boolean) => {
    setFormStatus(prev => ({
      ...prev,
      [step]: isValid,
    }));
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: DriverFormValues) => {
    setIsSubmitting(true);
    console.log("제출된 폼 데이터:", data);
    
    try {
      if (mode === 'register') {
        // 차주 등록 모드
        try {
          console.log("차주 등록 서비스 호출 시작");
          
          // 서비스 레이어 직접 호출 (driver-service.ts의 registerDriver 함수)
          // getAuthHeaders()를 통해 현재 로그인한 사용자 정보가 자동으로 요청에 포함됨
          const registeredDriver = await registerDriver({
            basicInfo: {
              name: data.basicInfo.name,
              phone: data.basicInfo.phone,
              businessNumber: data.basicInfo.businessNumber || "0000000000",
              address: data.basicInfo.address || "",
              status: data.basicInfo.status,
              // 은행 정보 추가
              bankCode: data.basicInfo.bankCode || "",
              bankAccountNumber: data.basicInfo.bankAccountNumber || "",
              bankAccountHolder: data.basicInfo.bankAccountHolder || "",
            },
            vehicleInfo: {
              vehicleNumber: data.vehicleInfo.vehicleNumber,
              vehicleType: data.vehicleInfo.vehicleType,
              tonnage: data.vehicleInfo.tonnage, // API에서는 vehicleWeight로 매핑됨
              cargoBoxType: data.vehicleInfo.cargoBoxType || "",
              cargoBoxLength: data.vehicleInfo.cargoBoxLength || "",
              manufactureYear: data.vehicleInfo.manufactureYear || ""
            }
          });
          
          console.log("차주 등록 성공:", registeredDriver);
          
          // 성공 메시지 표시
          toast.success("차주가 성공적으로 등록되었습니다", {
            description: `${data.basicInfo.name} 차주가 등록되었습니다.`,
          });
          
          // 성공 콜백 호출
          if (onRegisterSuccess) {
            onRegisterSuccess(registeredDriver);
          }
          
          // 폼 닫기
          handleOpenChange(false);
        } catch (apiError) {
          console.error("차주 등록 API 오류:", apiError);
          // 오류 메시지 표시
          toast.error("차주 등록에 실패했습니다", {
            description: apiError instanceof Error 
              ? apiError.message 
              : "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          });
        }
      } else {
        // 차주 수정 모드 (기존 코드 유지)
        // IBrokerDriver 형식으로 변환
        const formattedDriver: IBrokerDriver = {
          id: driver?.id || Math.random().toString(36).substring(2, 11),
          name: data.basicInfo.name,
          phoneNumber: data.basicInfo.phone,
          businessNumber: data.basicInfo.businessNumber || "",
          address: data.basicInfo.address || "",
          status: data.basicInfo.status as DriverStatus,
          vehicleNumber: data.vehicleInfo.vehicleNumber,
          vehicleType: data.vehicleInfo.vehicleType as VehicleType,
          tonnage: data.vehicleInfo.tonnage as TonnageType,
          cargoBox: {
            type: data.vehicleInfo.cargoBoxType || "",
            length: data.vehicleInfo.cargoBoxLength || ""
          },
          manufactureYear: data.vehicleInfo.manufactureYear || "",
          // 은행 정보 추가
          bankCode: data.basicInfo.bankCode || "",
          bankAccountNumber: data.basicInfo.bankAccountNumber || "",
          bankAccountHolder: data.basicInfo.bankAccountHolder || "",
          // account: {
          //   id: data.accountInfo.id,
          //   email: data.accountInfo.email || "",
          //   permission: data.accountInfo.permission as PermissionType
          // },
          notes: data.notes.notes,
        };
        
        // 성공 메시지 표시
        toast.success("차주 정보가 성공적으로 수정되었습니다", {
          description: `${data.basicInfo.name} 차주 정보가 수정되었습니다.`,
        });
        
        // 스토어 업데이트
        updateDriverWithAPI(driver?.id || "", formattedDriver);
        
        // 성공 콜백 호출
        if (onUpdateSuccess) {
          onUpdateSuccess(formattedDriver);
        }
        
        // 폼 닫기
        handleOpenChange(false);
      }
    } catch (error) {
      console.error("차주 등록/수정 처리 중 오류 발생:", error);
      // 오류 메시지 표시
      toast.error(`차주 ${mode === 'register' ? '등록' : '수정'}에 실패했습니다`, {
        description: "서버와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
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
        // 수정 모드일 때만 특이사항 탭으로 이동, 등록 모드에서는 완료 처리
        if (mode === 'edit') {
          setActiveTab("notes");
        } else {
          // 등록 모드에서는 차량 정보까지 입력 후 제출
          await form.handleSubmit(onSubmit)();
        }
      }
    } 
    // else if (activeTab === "account-info") {
    //   isValid = await form.trigger("accountInfo", { shouldFocus: true });
    //   if (isValid) {
    //     checkStepCompletion('account', true);
    //     setActiveTab("notes");
    //   }
    // }
  };

  // 이전 탭으로 이동
  const handlePreviousTab = () => {
    if (activeTab === "vehicle-info") {
      setActiveTab("basic-info");
    } else if (activeTab === "account-info") {
      setActiveTab("vehicle-info");
    } else if (activeTab === "notes") {
      setActiveTab("vehicle-info");
    }
  };

  // 제목과 설명 설정
  const title = mode === 'register' ? '차주 등록' : '차주 정보 수정';
  const description = mode === 'register' 
    ? '운송 업무를 수행할 차주의 정보를 등록합니다.'
    : '차주의 정보를 수정합니다.';

  // 트리거 버튼 설정 (차주 등록 버튼으로 통일)
  const defaultTrigger = mode === 'register' ? (
    <Button className="flex items-center gap-1">
      <Plus className="h-4 w-4" />
      <span>차주 등록</span>
    </Button>
  ) : (
    <Button hidden={true} variant="outline" className="flex items-center gap-1">
      <Edit className="h-4 w-4" />
      <span>수정</span>
    </Button>
    
  );

  return (
    <Sheet open={open !== undefined ? open : internalOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        
        <SheetHeader className="mb-5">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}  className="space-y-6">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full px-6"
              >
                <TabsList className={`grid ${mode === 'edit' ? 'grid-cols-3' : 'grid-cols-2'} mb-4`}>
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
                  {/* <TabsTrigger 
                    value="account-info"
                    className="relative"
                  >
                    계정 정보
                    {formStatus.account && (
                      <Check className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                    )}
                  </TabsTrigger> */}
                  {mode === 'edit' && (
                    <TabsTrigger 
                      value="notes"
                      className="relative"
                    >
                      특이사항
                      {formStatus.notes && (
                        <Check className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                      )}
                    </TabsTrigger>
                  )}
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

                {/* <TabsContent value="account-info">
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
                </TabsContent> */}

                {mode === 'edit' && (
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
                      driverId={mode === 'edit' ? driver?.id : undefined}
                    />
                  </TabsContent>
                )}
            </Tabs>

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
                {(mode === 'edit' && activeTab !== "notes") || (mode === 'register' && activeTab !== "vehicle-info") ? (
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
                      mode === 'register' ? "등록 완료" : "수정 완료"
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