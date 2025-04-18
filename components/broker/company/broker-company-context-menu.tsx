"use client";

import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { IBrokerCompany } from '@/types/broker-company';
import { ILegacyCompany } from '@/types/company';
import { FileSpreadsheet, Pencil, Eye, Power, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface BrokerCompanyContextMenuProps {
  company: IBrokerCompany | ILegacyCompany;
  children: React.ReactNode;
}

export function BrokerCompanyContextMenu({ company, children }: BrokerCompanyContextMenuProps) {
  // 상세 정보 보기
  const handleViewDetails = () => {
    toast.info(`${company.name} 상세 정보 보기 (추후 구현 예정)`);
  };

  // 수정 기능
  const handleEdit = () => {
    toast.info(`${company.name} 수정하기 (추후 구현 예정)`);
  };

  // 상태 변경 기능
  const handleToggleStatus = () => {
    // 레거시 포맷에서 한글로 된 상태 텍스트 가져오기
    const currentStatus = company.status as string;
    const isActive = currentStatus === '활성' || currentStatus === 'active';
    const newStatus = isActive ? '비활성' : '활성';
    toast.success(`${company.name}의 상태가 ${newStatus}로 변경되었습니다.`);
  };

  // 엑셀 다운로드 기능
  const handleExcelDownload = () => {
    toast.success(`${company.name} 업체 정보 엑셀 다운로드 시작`);
  };
  
  // 삭제 기능
  const handleDelete = () => {
    toast.warning(`${company.name} 삭제 (관리자 권한 필요)`);
  };

  // 레거시 포맷에서 상태 텍스트 가져오기
  const getStatusText = () => {
    const status = company.status as string;
    const isActive = status === '활성' || status === 'active';
    return isActive ? '비활성화' : '활성화';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleViewDetails} className="flex items-center gap-2 cursor-pointer">
          <Eye className="h-4 w-4" />
          <span>업체 정보 보기</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleEdit} className="flex items-center gap-2 cursor-pointer">
          <Pencil className="h-4 w-4" />
          <span>수정</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleToggleStatus} className="flex items-center gap-2 cursor-pointer">
          <Power className="h-4 w-4" />
          <span>{getStatusText()}</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleExcelDownload} className="flex items-center gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          <span>엑셀 다운로드</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={handleDelete} 
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-white focus:bg-destructive"
        >
          <Trash className="h-4 w-4" />
          <span>삭제</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 