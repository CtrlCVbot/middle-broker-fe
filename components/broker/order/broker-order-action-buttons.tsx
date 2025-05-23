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
    <div className="flex gap-2 ml-auto">
      <Button
        variant="outline"
        size="sm"
        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 h-8 px-3"
        onClick={handleEditClick}
      >
        <FileEdit className="h-4 w-4 mr-1" />
        수정
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 h-8 px-3"
        onClick={handlePrintClick}
      >
        <Printer className="h-4 w-4 mr-1" />
        인쇄
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 h-8 px-3"
        onClick={handleSettlementClick}
      >
        <FileText className="h-4 w-4 mr-1" />
        정산
      </Button>
    </div>
  );
}