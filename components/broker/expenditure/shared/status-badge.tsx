import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IStatusBadgeProps {
  status: 'WAITING' | 'MATCHING' | 'COMPLETED';
  className?: string;
}

export const StatusBadge = ({ status, className }: IStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'WAITING':
        return { label: '정산 대기', variant: 'secondary' };
      case 'MATCHING':
        return { label: '정산 대사', variant: 'default' };
      case 'COMPLETED':
        return { label: '정산 완료', variant: 'success' };
      default:
        return { label: '알 수 없음', variant: 'destructive' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant as any}
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  );
}; 