import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, AlertTriangle } from "lucide-react";

interface IDriverHistory {
  id: string;
  date: string;
  route: string;
  amount: string;
  status: string;
}

interface IDriverWarning {
  date: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

interface DriverHistoryProps {
  history?: IDriverHistory[];
  warnings?: IDriverWarning[];
}

export function DriverHistory({ 
  history = [], 
  warnings = [] 
}: DriverHistoryProps) {
  const [activeTab, setActiveTab] = useState("history");

  // 기본 목업 데이터 - 배차 이력
  const defaultHistory = [
    { id: "ORD-001", date: "2023-03-01", route: "서울 → 부산", amount: "850,000원", status: "완료" },
    { id: "ORD-002", date: "2023-02-15", route: "인천 → 대구", amount: "720,000원", status: "완료" },
    { id: "ORD-003", date: "2023-01-20", route: "광주 → 대전", amount: "550,000원", status: "완료" },
  ];
  
  // 기본 목업 데이터 - 특이사항
  const defaultWarnings = [
    { date: "2023-02-10", content: "하차 지연 (30분)", severity: "low" },
    { date: "2023-01-05", content: "화주 컴플레인 - 불친절", severity: "medium" },
  ];

  // 목업 데이터와 사용자 제공 데이터 병합
  const driverHistory = history.length > 0 ? history : defaultHistory;
  const driverWarnings = warnings.length > 0 ? warnings : defaultWarnings;

  return (
    <div className="bg-white rounded-b-lg">
      <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            이력
          </TabsTrigger>
          <TabsTrigger value="warnings" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            특이사항
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">주문번호</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">날짜</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">경로</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">금액</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {driverHistory.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.id}</td>
                    <td className="py-2">{item.date}</td>
                    <td className="py-2">{item.route}</td>
                    <td className="py-2 text-right">{item.amount}</td>
                    <td className="py-2 text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="warnings" className="mt-1">
          {driverWarnings.length > 0 ? (
            <ul className="space-y-2">
              {driverWarnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Badge 
                    variant="outline" 
                    className={`
                      ${warning.severity === 'high' ? 'bg-red-50 text-red-700' : 
                        warning.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 
                        'bg-blue-50 text-blue-700'}
                    `}
                  >
                    {warning.date}
                  </Badge>
                  <span>{warning.content}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">특이사항이 없습니다.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 