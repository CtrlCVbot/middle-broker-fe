import React from "react";
import { Badge } from "@/components/ui/badge";
import { ExpenditureStatusType } from "@/types/expenditure";

interface ExpenditureStatusBadgeProps {
  status: ExpenditureStatusType;
  size?: "default" | "sm" | "lg";
  hidden?: boolean; // 숨김 여부
}

export function ExpenditureStatusBadge({ status, size = "default", hidden = false }: ExpenditureStatusBadgeProps) {
  // 숨김 상태면 렌더링하지 않음
  if (hidden) return null;

  // 사이즈에 따른 클래스 설정
  const sizeClasses = {
    default: "px-2 py-1 text-xs",
    sm: "px-1.5 py-0.5 text-[10px]",
    lg: "px-2.5 py-1.5 text-sm",
  };
  
  // 상태에 따른 배지 스타일 및 텍스트 설정
  let badgeStyle = "";
  let statusText = "";
  
  switch (status) {
    case "WAITING":
      badgeStyle = "bg-slate-100 text-slate-800 hover:bg-slate-100";
      statusText = "정산대기";
      break;
    case "MATCHING":
      badgeStyle = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      statusText = "정산대사";
      break;
    case "COMPLETED":
      badgeStyle = "bg-green-100 text-green-800 hover:bg-green-100";
      statusText = "정산완료";
      break;
    default:
      badgeStyle = "bg-slate-100 text-slate-800";
      statusText = status;
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${badgeStyle} ${sizeClasses[size]}`}
    >
      {statusText}
    </Badge>
  );
} 