import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaitingTab } from "@/components/broker/expenditure/tabs/waiting-tab";
import { MatchingTab } from "@/components/broker/expenditure/tabs/matching-tab";
import { CompletedTab } from "@/components/broker/expenditure/tabs/completed-tab";

export default function ExpenditurePage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">화물 매입 정산</h1>
        <p className="text-muted-foreground">
          세금계산서 기준으로 화물을 매칭하고 정산을 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="waiting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waiting">정산 대기</TabsTrigger>
          <TabsTrigger value="matching">정산 대사</TabsTrigger>
          <TabsTrigger value="completed">정산 완료</TabsTrigger>
        </TabsList>

        <TabsContent value="waiting">
          <WaitingTab />
        </TabsContent>
        
        <TabsContent value="matching">
          <MatchingTab />
        </TabsContent>
        
        <TabsContent value="completed">
          <CompletedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
} 