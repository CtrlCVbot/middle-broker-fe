import { Metadata } from "next";
import { SettlementDetail } from "@/components/order/settlement-detail";

export const metadata: Metadata = {
  title: "정산 상세 | 중개사 화물 관리 시스템",
  description: "정산 상세 내역을 확인하고 관리합니다.",
};

interface SettlementDetailPageProps {
  params: {
    id: string;
  };
}

export default function SettlementDetailPage({ params }: SettlementDetailPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">정산 상세</h1>
        <p className="text-muted-foreground">
          정산 상세 내역을 확인하고 관리할 수 있습니다.
        </p>
      </header>
      
      <main>
        <SettlementDetail settlementId={params.id} />
      </main>
    </div>
  );
} 