import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Circle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSchedule } from "@/components/order/order-table-ver01";

interface IScheduleInfo {
  from: {
    fromDate: string;
    fromTime: string;
  };
  to: {
    toDate: string;
    toTime: string;
  };
}

interface ITimelineEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  isActive?: boolean;
}

interface IBrokerOrderTimelineProps {
  scheduleInfo: IScheduleInfo;
  events: ITimelineEvent[];
  totalTime?: string;
  onRefresh?: () => void;
}

function calculateTotalTime(schedule: IScheduleInfo): string {
  // 시작 시간과 종료 시간을 합쳐서 Date 객체로 변환
  const start = new Date(`${schedule.from.fromDate}T${schedule.from.fromTime}:00`);
  const end = new Date(`${schedule.to.toDate}T${schedule.to.toTime}:00`);

  // 시간 차이를 밀리초 단위로 계산
  const diffMs = Math.abs(end.getTime() - start.getTime());

  // 밀리초를 시간과 분으로 변환
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}시간 ${minutes}분`;
}


export function BrokerOrderTimeline({ 
  scheduleInfo,
  events,   
  onRefresh 
}: IBrokerOrderTimelineProps) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  
  if (!events || events.length === 0) {
    return null;
  }
  console.log("scheduleInfo", scheduleInfo);
  // 각 이벤트에 대한 상태 텍스트 매핑
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      "in_delivery": "배송지로 배송 중",
      "arrived": "물류 센터 도착",
      "in_transit": "운송사와 운송 중",
      "confirmed": "패키지 확인됨",
      // 추가 상태는 필요에 따라 확장
    };
    
    return statusMap[status] || status;
  };

  // 상태에 따른 아이콘 스타일 결정
  const getStatusIconStyle = (status: string) => {
    switch (status) {
      case "in_delivery":
        return "bg-orange-100 text-orange-500 border-orange-200";
      case "confirmed":
        return "bg-orange-100 text-orange-500 border-orange-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white px-4 py-4 rounded-b-lg ">
      

      <div >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-base font-medium text-gray-900">일정</h3>
            <Badge className="ml-2 text-md bg-gray-100 text-gray-900 hover:bg-gray-200" variant="secondary">
              {getSchedule(scheduleInfo.from.fromDate, scheduleInfo.from.fromTime, scheduleInfo.to.toDate, scheduleInfo.to.toTime)}
            </Badge>
            
          </div>
          

          <div className="flex items-center gap-2">
                
            {isTimelineOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" onClick={() => setIsTimelineOpen(false)} />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" onClick={() => setIsTimelineOpen(true)} />
            )}
          </div>
        </div>

        {/* 타임라인 프로그레스 바 */}
        <div className="mb-4">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full mb-2">
            <div className="bg-gray-900 w-[10%]"></div>
            <div className="bg-gray-500 w-[90%]"></div>
          </div>
          
          {/* 시간 레이블 */}
          <div className="flex justify-between text-xs text-gray-900 mb-4">
            <span>{scheduleInfo.from.fromTime}</span>            
            <span>{scheduleInfo.to.toTime}</span>
          </div>

          {/* 총 시간 */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">총 소요 시간</p>
            <p className="text-lg font-semibold">{calculateTotalTime(scheduleInfo)}</p>
          </div>

          {/* 상태 표시기 */}
          <div className="flex items-center gap-4 text-xs mb-4">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
              <span>빠름</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-violet-500 mr-1.5"></div>
              <span>지연</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-rose-500 mr-1.5"></div>
              <span>정체</span>
            </div>
          </div>
        </div>      
      </div>

      {isTimelineOpen && (
        <>
          <Separator className="my-3" />

          {/* 이벤트 목록 */}
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={index} className="relative pl-8">
                {/* 연결선 */}
                {index < events.length - 1 && (
                  <div className="absolute left-4 top-8 w-[1px] h-[calc(100%+0.75rem)] bg-gray-300 border-dashed border-l border-gray-300 -translate-x-1/2"></div>
                )}
                
                {/* 이벤트 표시 아이콘 */}
                <div className={`absolute left-4 top-1 -translate-x-1/2 w-8 h-8 flex items-center justify-center`}>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${getStatusIconStyle(event.status)}`}>
                    {event.status === 'in_delivery' || event.status === 'confirmed' ? (
                      <span className="text-xs">●</span>
                    ) : (
                      <span className="text-xs">↑</span>
                    )}
                  </div>
                </div>
                
                {/* 이벤트 내용 */}
                <div>
                  <div className="mb-1 flex justify-between items-center">
                    <p className="font-medium">{event.date}</p>
                    <p className={`${event.status === 'in_delivery' ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
                      {getStatusText(event.status)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">{event.time}</p>
                  <p className="text-sm mt-1">{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      
    </div>
  );
} 