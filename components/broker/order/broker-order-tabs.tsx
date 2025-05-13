"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrokerOrderStore, DispatchTabType } from "@/store/broker-order-store";
import { Badge } from "@/components/ui/badge";

export function BrokerOrderTabs() {
  const { activeTab, setActiveTab } = useBrokerOrderStore();
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as DispatchTabType);
  };
  
  return (
    <Tabs 
      defaultValue={activeTab} 
      onValueChange={handleTabChange} 
      className="w-full mb-4"
    >
      <TabsList className="grid grid-cols-3 w-full md:w-auto">
        <TabsTrigger value="all" className="px-4">
          전체 화물
        </TabsTrigger>
        <TabsTrigger value="dispatched" className="px-4">
          배차 완료
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">완료</Badge>
        </TabsTrigger>
        <TabsTrigger value="waiting" className="px-4">
          배차 대기
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">대기</Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 