import React from "react";
import { Badge } from "@/components/ui/badge";
import { IncomeStatusType } from "@/types/income";

interface IncomeStatusBadgeProps {
  status: IncomeStatusType;
  size?: "default" | "sm" | "lg";
}

export function IncomeStatusBadge({ status, size = "default" }: IncomeStatusBadgeProps) {
  // 사이즈에 따른 클래스 설정
  const sizeClasses = {
    default: "px-2 py-1 text-xs",
    sm: "px-1.5 py-0.5 text-[10px]",
    lg: "px-2.5 py-1.5 text-sm",
  };
  
  // 상태에 따른 배지 스타일 및 텍스트 설정
  let badgeStyle = "";
  
  switch (status) {
    case "정산대기":
      badgeStyle = "bg-slate-100 text-slate-800 hover:bg-slate-100";
      break;
    case "정산대사":
      badgeStyle = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      break;
    case "정산완료":
      badgeStyle = "bg-green-100 text-green-800 hover:bg-green-100";
      break;
    default:
      badgeStyle = "bg-slate-100 text-slate-800";
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${badgeStyle} ${sizeClasses[size]}`}
    >
      {status}
    </Badge>
  );
} 