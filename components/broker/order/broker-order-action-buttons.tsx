import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useBrokerOrderDetailStore } from "@/store/broker-order-detail-store";
import { Printer, FileEdit, FileText, X } from "lucide-react";

interface BrokerOrderActionButtonsProps {
  orderNumber: string;
}

export function BrokerOrderActionButtons({ orderNumber }: BrokerOrderActionButtonsProps) {
  const router = useRouter();
  const { closeSheet } = useBrokerOrderDetailStore();
  
  // 화물 수정 페이지로 이동
  const handleEditClick = () => {
    closeSheet();
    router.push(`/broker/order/edit/${orderNumber}`);
  };
  
  // 화물 인쇄
  const handlePrintClick = () => {
    window.print();
  };
  
  // 화물 정산 페이지로 이동
  const handleSettlementClick = () => {
    closeSheet();
    router.push(`/broker/settlement?orderId=${orderNumber}`);
  };
  
  return (
    <div className="w-full flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handleEditClick}
      >
        <FileEdit className="h-4 w-4 mr-2" />
        수정
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handlePrintClick}
      >
        <Printer className="h-4 w-4 mr-2" />
        인쇄
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handleSettlementClick}
      >
        <FileText className="h-4 w-4 mr-2" />
        정산
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={closeSheet}
      >
        <X className="h-4 w-4 mr-2" />
        닫기
      </Button>
    </div>
  );
}