"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3x3, FileSpreadsheet, RotateCcw, Plus, Download, Upload, Trash2 } from 'lucide-react';
import { CompanyStatus } from '@/types/broker-company';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBrokerCompanyStore } from '@/store/broker-company-store';
import { BrokerCompanyRegisterSheet } from './broker-company-register-sheet';

interface BrokerCompanyActionButtonsProps {
  onActionSuccess?: () => void;
}

export function BrokerCompanyActionButtons({
  onActionSuccess
}: BrokerCompanyActionButtonsProps) {
  const { 
    viewMode, 
    setViewMode, 
    selectedCompanyIds, 
    clearSelectedCompanyIds 
  } = useBrokerCompanyStore();

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    toast.success('업체 목록 엑셀 다운로드 완료');
    if (onActionSuccess) onActionSuccess();
  };

  // 엑셀 업로드 핸들러
  const handleExcelUpload = () => {
    toast.info('업체 목록 엑셀 업로드 기능 (추후 구현 예정)');
    if (onActionSuccess) onActionSuccess();
  };

  // 선택된 업체 상태 변경 핸들러
  const handleChangeStatus = (status: CompanyStatus) => {
    if (selectedCompanyIds.length === 0) {
      toast.error('상태를 변경할 업체를 선택해주세요.');
      return;
    }
    
    toast.success(`${selectedCompanyIds.length}개 업체 상태를 ${status}로 변경했습니다.`);
    clearSelectedCompanyIds();
    if (onActionSuccess) onActionSuccess();
  };

  // 선택된 업체 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedCompanyIds.length === 0) {
      toast.error('삭제할 업체를 선택해주세요.');
      return;
    }
    
    toast.warning(`${selectedCompanyIds.length}개 업체 삭제 (관리자 권한 필요)`);
    if (onActionSuccess) onActionSuccess();
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    if (onActionSuccess) onActionSuccess();
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
      {/* 좌측 버튼 그룹: 새로고침, 뷰 모드 변경 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">새로고침</span>
        </Button>
        
        {/* <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('table')}
          className="h-9 w-9"
        >
          <Grid3x3 className="h-4 w-4" />
          <span className="sr-only">테이블 뷰</span>
        </Button> */}
        
        {/* <Button
          variant={viewMode === 'card' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('card')}
          className="h-9 w-9"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
          <span className="sr-only">카드 뷰</span>
        </Button> */}
      </div>
      
      {/* 선택 항목 수 표시 */}
      {selectedCompanyIds.length > 0 && (
        <div className="text-sm font-medium ml-2 mr-auto">
          {selectedCompanyIds.length}개 항목 선택됨
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelectedCompanyIds}
            className="text-xs h-6 ml-2"
          >
            선택 해제
          </Button>
        </div>
      )}
      
      {/* 우측 버튼 그룹: 엑셀 업로드/다운로드, 등록, 상태 변경 등 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExcelDownload}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">다운로드</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExcelUpload}
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">업로드</span>
        </Button>
        
        {/* 선택 업체 상태 변경 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={selectedCompanyIds.length === 0}>
              상태 변경
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleChangeStatus('활성')}>
              활성화
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeStatus('비활성')}>
              비활성화
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteSelected}
              className="text-destructive focus:text-white focus:bg-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              선택 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <BrokerCompanyRegisterSheet 
          trigger={
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">신규 등록</span>
            </Button>
          }
          onRegisterSuccess={(company) => {
            handleRefresh();
          }}
        />
      </div>
    </div>
  );
} 