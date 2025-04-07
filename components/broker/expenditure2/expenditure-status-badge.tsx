"use client";

import { Badge } from "@/components/ui/badge";
import { ExpenditureStatusType } from "@/types/expenditure";

interface IExpenditureStatusBadgeProps {
  status: ExpenditureStatusType;
  size?: string;
}

export function ExpenditureStatusBadge({ status, size = "default" }: IExpenditureStatusBadgeProps) {
  const getStatusColor = (status: ExpenditureStatusType) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const getStatusText = (status: ExpenditureStatusType) => {
    switch (status) {
      case "pending":
        return "정산 대기";
      case "processing":
        return "정산 처리 중";
      case "completed":
        return "정산 완료";
      case "cancelled":
        return "정산 취소";
      default:
        return "알 수 없음";
    }
  };

  return (
    <Badge
      variant="secondary"
      className={`font-medium ${getStatusColor(status)}`}
    >
      {getStatusText(status)}
    </Badge>
  );
} 