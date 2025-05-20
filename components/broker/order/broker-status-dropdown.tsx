import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getStatusColor } from '@/components/order/order-table-ver01';
import { ORDER_FLOW_STATUSES } from '@/types/order-ver01';
import { updateDispatchFields } from '@/services/broker-dispatch-service';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Box, 
  PackageCheck, 
  Building, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';

interface BrokerStatusDropdownProps {
  currentStatus: string;
  dispatchId: string;
  onStatusChange?: (newStatus: string) => void;
}

// getStatusColor 함수를 활용하여 상태별 스타일 클래스를 반환하는 함수
const getStatusStyleClasses = (status: string) => {
  const color = getStatusColor(status);
  return {
    text: `text-${color}-700`,
    bg: `bg-${color}-100`,
    border: `border-${color}-300`,
    hover: `hover:bg-${color}-200`
  };
};

// 상태별 아이콘을 반환하는 함수
const getStatusIcon = (status: string) => {
  switch (status) {
    case '운송요청':
      return <Clock className="h-4 w-4 mr-2" />;
    case '배차대기':
      return <Clock className="h-4 w-4 mr-2" />;
    case '배차완료':
      return <CheckCircle className="h-4 w-4 mr-2" />;
    case '상차대기':
      return <Building className="h-4 w-4 mr-2" />;
    case '상차완료':
      return <Box className="h-4 w-4 mr-2" />;
    case '운송중':
      return <Truck className="h-4 w-4 mr-2" />;
    case '하차완료':
      return <PackageCheck className="h-4 w-4 mr-2" />;
    case '운송완료':
      return <CheckCheck className="h-4 w-4 mr-2" />;
    default:
      return <Clock className="h-4 w-4 mr-2" />;
  }
};

// UUID 검증을 위한 유틸리티 함수
function isValidUUID(uuid: string | undefined): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function BrokerStatusDropdown({ 
  currentStatus, 
  dispatchId,
  onStatusChange 
}: BrokerStatusDropdownProps) {
  const { toast } = useToast();
  
  const getStatusText = (status: string) => {
    return status;
  };
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      if (newStatus === currentStatus) return;
      
      // dispatchId 유효성 검사
      if (!dispatchId || !isValidUUID(dispatchId)) {
        toast({
          variant: "destructive",
          title: "상태 변경 실패",
          description: "유효하지 않은 배차 ID입니다.",
        });
        console.error("유효하지 않은 배차 ID:", dispatchId);
        return;
      }
      
      await updateDispatchFields(
        dispatchId, 
        { 
          brokerFlowStatus: newStatus 
        }
      );
      
      toast({
        title: "상태 변경 완료",
        description: `배차 상태가 ${newStatus}(으)로 변경되었습니다.`,
      });
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error("배차 상태 변경 중 오류:", error);
      toast({
        variant: "destructive",
        title: "상태 변경 실패",
        description: "배차 상태 변경 중 오류가 발생했습니다.",
      });
    }
  };

  const currentStyles = getStatusStyleClasses(currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="sm"          
          className={`px-3 py-1 text-sm border ${currentStyles.text} ${currentStyles.bg} ${currentStyles.border} min-w-[100px] flex justify-between items-center`}
        >
          <span className="flex items-center">
            {getStatusIcon(currentStatus)}
            {getStatusText(currentStatus)}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">배차 상태 변경</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ORDER_FLOW_STATUSES.map((status) => {
          const styles = getStatusStyleClasses(status);
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={status === currentStatus}
              className={`my-1 ${styles.hover} ${status === currentStatus ? 'font-bold' : ''}`}
            >
              <div className={`w-full px-3 py-1 rounded-sm ${styles.text} ${styles.bg} flex items-center`}>
                {getStatusIcon(status)}
                {status}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 