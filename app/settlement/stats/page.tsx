import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "정산 통계 | 중개사 화물 관리 시스템",
  description: "정산 관련 통계 정보를 조회합니다.",
};

export default function SettlementStatsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">정산 통계</h1>
        <p className="text-muted-foreground">
          정산 관련 통계 정보를 조회할 수 있습니다.
        </p>
      </header>
      
      <main className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>정산 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">준비 중입니다.</p>
              <p className="text-sm text-muted-foreground mt-2">정산 통계 기능이 곧 제공될 예정입니다.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 