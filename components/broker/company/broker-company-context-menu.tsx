"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { IBrokerCompany } from "@/types/broker-company";
import { ILegacyCompany } from "@/types/company";
import { useCompanyStore, useDeleteCompany, useChangeCompanyStatus } from "@/store/company-store";
import { Eye, Trash, Edit, ClipboardCopy, RefreshCw, Download, Ban } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BrokerCompanyContextMenuProps {
  company: IBrokerCompany | ILegacyCompany;
  children: React.ReactNode;
}

export function BrokerCompanyContextMenu({ company, children }: BrokerCompanyContextMenuProps) {
  const { toast } = useToast();
  const { fetchCompanies } = useCompanyStore();
  const deleteCompanyMutation = useDeleteCompany();
  const changeStatusMutation = useChangeCompanyStatus();

  const handleViewDetails = () => {
    // 상세 정보 보기 기능은 아직 구현되지 않았으므로 토스트만 표시
    toast({
      title: "회사 상세 정보",
      description: `${company.name} 회사의 상세 정보를 불러왔습니다.`,
    });
  };

  const handleCopyBusinessNumber = () => {
    if (company.businessNumber) {
      navigator.clipboard.writeText(company.businessNumber);
      toast({
        title: "클립보드에 복사됨",
        description: `사업자번호 ${company.businessNumber}가 클립보드에 복사되었습니다.`,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCompanyMutation.mutateAsync({ id: company.id });
      toast({
        title: "회사 삭제됨",
        description: `${company.name} 회사가 삭제되었습니다.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: "회사를 삭제하는 중 오류가 발생했습니다.",
      });
    }
  };

  const handleStatusChange = async (statusLabel: string) => {
    try {
      const status = statusLabel === "활성" ? "active" : "inactive";
      await changeStatusMutation.mutateAsync({
        id: company.id,
        data: {
          status,
          reason: `상태가 ${statusLabel}으로 변경됨`,
          requestUserId: "system" // 실제 사용자 ID로 대체 필요
        }
      });
      
      toast({
        title: "상태 변경됨",
        description: `${company.name} 회사의 상태가 ${statusLabel}로 변경되었습니다.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "상태 변경 실패",
        description: "회사 상태를 변경하는 중 오류가 발생했습니다.",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchCompanies();
      toast({
        title: "새로고침 완료",
        description: "중개사 회사 목록이 새로고침되었습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "새로고침 실패",
        description: "목록을 새로고침하는 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          상세 정보 보기
        </ContextMenuItem>
        {company.businessNumber && (
          <ContextMenuItem onClick={handleCopyBusinessNumber}>
            <ClipboardCopy className="mr-2 h-4 w-4" />
            사업자번호 복사
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => handleStatusChange("활성")}>
          <RefreshCw className="mr-2 h-4 w-4 text-green-500" />
          활성화
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleStatusChange("비활성")}>
          <Ban className="mr-2 h-4 w-4 text-red-500" />
          비활성화
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}