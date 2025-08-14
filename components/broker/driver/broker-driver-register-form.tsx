"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// 타입 및 스키마
import { 
  driverRegisterSchema, 
  DriverFormValues, 
  getFormDefaultValues 
} from "@/types/driver-form-schema";
import { IBrokerDriver, VehicleType, TonnageType, DriverStatus } from "@/types/broker-driver";

// 섹션 컴포넌트
import { BrokerDriverBasicInfoSection } from "./sections/broker-driver-basic-info-section";
import { BrokerDriverAdditionalInfoSection } from "./sections/broker-driver-additional-info-section";
import { BrokerDriverNotesSection } from "./sections/broker-driver-notes-section";

// 스토어 및 서비스
import { useBrokerDriverStore } from "@/store/broker-driver-store";
import { mapDriverFormToApiRequest } from "@/utils/driver-mapper";
import { isRequiredFieldsValid } from "@/utils/driver-form-utils";

interface IBrokerDriverRegisterFormProps {
  onRegisterSuccess?: (driver: IBrokerDriver) => void;
  onUpdateSuccess?: (driver: IBrokerDriver) => void;
  driver?: IBrokerDriver;
  mode?: 'register' | 'edit';
  containerType?: 'dialog' | 'sheet' | 'drawer';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function BrokerDriverRegisterForm({
  onRegisterSuccess,
  onUpdateSuccess,
  driver,
  mode = 'register',
  containerType = 'sheet',
  open,
  onOpenChange,
  trigger
}: IBrokerDriverRegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequiredValid, setIsRequiredValid] = useState(false);

  const { registerDriverWithAPI, updateDriverWithAPI } = useBrokerDriverStore();

  // 폼 초기화
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: getFormDefaultValues(driver),
  });

  // 수정 모드일 때 폼 초기값 설정
  useEffect(() => {
    if (mode === 'edit' && driver) {
      form.reset(getFormDefaultValues(driver));
    }
  }, [driver, mode, form]);

  // 필수 필드 검증 실시간 체크
  useEffect(() => {
    const subscription = form.watch((value) => {
      const isValid = isRequiredFieldsValid({
        name: value.name,
        phone: value.phone,
        vehicleNumber: value.vehicleNumber,
        vehicleType: value.vehicleType,
        tonnage: value.tonnage,
      });
      setIsRequiredValid(isValid);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // 폼 제출 핸들러
  const onSubmit = async (data: DriverFormValues) => {
    setIsSubmitting(true);
    console.log("제출된 폼 데이터:", data);

    try {
      if (mode === 'register') {
        // 차주 등록 모드
        const driverData = {
          name: data.name,
          phoneNumber: data.phone,
          businessNumber: data.businessNumber || "",
          address: "", // 주소는 별도 입력으로 분리
          status: "활성" as DriverStatus,
          vehicleNumber: data.vehicleNumber,
          vehicleType: data.vehicleType as VehicleType,
          tonnage: data.tonnage as TonnageType,
          cargoBox: {
            type: data.cargoBoxType || "",
            length: data.cargoBoxLength || ""
          },
          manufactureYear: data.manufactureYear || "",
          bankCode: data.bankCode || "",
          bankAccountNumber: data.bankAccountNumber || "",
          bankAccountHolder: data.bankAccountHolder || "",
        };

        const registeredDriver = await registerDriverWithAPI(driverData);
        
        toast.success("차주가 성공적으로 등록되었습니다", {
          description: `${data.name} 차주가 등록되었습니다.`,
        });

        if (onRegisterSuccess) {
          onRegisterSuccess(registeredDriver);
        }

        // 폼 닫기
        if (onOpenChange) {
          onOpenChange(false);
        }
      } else {
        // 차주 수정 모드
        if (!driver?.id) {
          throw new Error("차주 ID가 없습니다.");
        }

        const driverData = {
          name: data.name,
          phoneNumber: data.phone,
          businessNumber: data.businessNumber || "",
          address: driver.address || "",
          status: driver.status,
          vehicleNumber: data.vehicleNumber,
          vehicleType: data.vehicleType as VehicleType,
          tonnage: data.tonnage as TonnageType,
          cargoBox: {
            type: data.cargoBoxType || "",
            length: data.cargoBoxLength || ""
          },
          manufactureYear: data.manufactureYear || "",
          bankCode: data.bankCode || "",
          bankAccountNumber: data.bankAccountNumber || "",
          bankAccountHolder: data.bankAccountHolder || "",
        };

        const updatedDriver = await updateDriverWithAPI(driver.id, driverData);

        toast.success("차주 정보가 성공적으로 수정되었습니다", {
          description: `${data.name} 차주 정보가 수정되었습니다.`,
        });

        if (onUpdateSuccess) {
          onUpdateSuccess(updatedDriver);
        }

        // 폼 닫기
        if (onOpenChange) {
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("차주 등록/수정 처리 중 오류 발생:", error);
      toast.error(`차주 ${mode === 'register' ? '등록' : '수정'}에 실패했습니다`, {
        description: error instanceof Error ? error.message : "서버와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 제목과 설명 설정
  const title = mode === 'register' ? '차주 등록' : '차주 정보 수정';
  const description = mode === 'register' 
    ? '운송 업무를 수행할 차주의 정보를 등록합니다.'
    : '차주의 정보를 수정합니다.';

  // 트리거 버튼 설정
  const defaultTrigger = mode === 'register' ? (
    <Button className="flex items-center gap-1">
      <Plus className="h-4 w-4" />
      <span>차주 등록</span>
    </Button>
  ) : (
    <Button variant="outline" className="flex items-center gap-1">
      <Edit className="h-4 w-4" />
      <span>수정</span>
    </Button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      {/* 폼 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <BrokerDriverBasicInfoSection form={form} />

          {/* 등록 버튼 (기본 정보 바로 아래) */}
          <div className="flex justify-center">
            <Button 
              type="submit"
              disabled={!isRequiredValid || isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리중...
                </>
              ) : (
                mode === 'register' ? "등록하기" : "수정하기"
              )}
            </Button>
          </div>

          <Separator />

          {/* 추가 정보 섹션 */}
          <BrokerDriverAdditionalInfoSection form={form} />

          <Separator />

          {/* 특이사항 섹션 */}
          <BrokerDriverNotesSection form={form} />

          {/* 하단 버튼들 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              * 표시는 필수 입력 항목입니다
            </div>
            <div className="flex gap-2">
              {onOpenChange && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
              )}
              <Button 
                type="submit"
                disabled={!isRequiredValid || isSubmitting}
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 