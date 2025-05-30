import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IBrokerOrderRegisterData, IBrokerTransportOption, BROKER_TRANSPORT_OPTIONS } from "@/types/broker-order";
import { Check, Truck, MapPin, Info, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BrokerOrderRegisterSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onBack: () => void;
  formData: IBrokerOrderRegisterData;
}

export function BrokerOrderRegisterSummary({
  open,
  onOpenChange,
  onConfirm,
  onBack,
  formData,
}: BrokerOrderRegisterSummaryProps) {
  // 선택된 옵션 정보 가져오기
  const selectedOptionDetails = formData.selectedOptions
    .map((optionId) =>
      BROKER_TRANSPORT_OPTIONS.find((option) => option.id === optionId)
    )
    .filter((option): option is IBrokerTransportOption => !!option);

  // 예상 거리 및 금액
  const estimatedDistance = formData.estimatedDistance || 150; // km
  const estimatedAmount = formData.estimatedAmount || 350000; // 원

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">중개 화물 등록 확인</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 차량 및 화물 정보 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <Truck className="mr-2 h-5 w-5" />
              차량 및 화물 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">차량 종류</p>
                <p className="font-medium">{formData.vehicleType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">중량</p>
                <p className="font-medium">{formData.weightType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">화물 종류</p>
                <p className="font-medium">{formData.cargoType}</p>
              </div>
              {formData.remark && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">비고</p>
                  <p className="font-medium">{formData.remark}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 출발지 정보 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <MapPin className="mr-2 h-5 w-5" />
              출발지 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-muted-foreground">주소</p>
                <p className="font-medium">
                  {formData.departure.address}
                  {formData.departure.detailedAddress && ` ${formData.departure.detailedAddress}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">담당자</p>
                <p className="font-medium">{formData.departure.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">업체명</p>
                <p className="font-medium">{formData.departure.company}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">연락처</p>
                <p className="font-medium">{formData.departure.contact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">상차 일시</p>
                <p className="font-medium">
                  {formData.departure.date} {formData.departure.time}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 도착지 정보 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <MapPin className="mr-2 h-5 w-5" />
              도착지 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-muted-foreground">주소</p>
                <p className="font-medium">
                  {formData.destination.address}
                  {formData.destination.detailedAddress && ` ${formData.destination.detailedAddress}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">담당자</p>
                <p className="font-medium">{formData.destination.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">업체명</p>
                <p className="font-medium">{formData.destination.company}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">연락처</p>
                <p className="font-medium">{formData.destination.contact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">하차 일시</p>
                <p className="font-medium">
                  {formData.destination.date} {formData.destination.time}
                </p>
              </div>
            </div>
          </div>

          {/* 선택된 옵션이 있는 경우에만 표시 */}
          {selectedOptionDetails.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="flex items-center text-lg font-medium">
                  <Info className="mr-2 h-5 w-5" />
                  선택된 운송 옵션
                </h3>
                <div className="flex flex-wrap gap-2 pl-7">
                  {selectedOptionDetails.map((option) => (
                    <div
                      key={option.id}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* 예상 거리 및 금액 */}
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-medium">
              <Calculator className="mr-2 h-5 w-5" />
              예상 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">예상 거리</p>
                <p className="font-medium">{estimatedDistance}km</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">예상 금액</p>
                <p className="font-medium text-primary">
                  {formatCurrency(estimatedAmount)}원
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm}>
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 