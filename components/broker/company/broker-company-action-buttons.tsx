"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCompanyStore, useBatchUpdateCompanies } from '@/store/company-store';

interface BrokerCompanyActionButtonsProps {
  onActionSuccess?: () => void;
}

export function BrokerCompanyActionButtons({
  onActionSuccess
}: BrokerCompanyActionButtonsProps) {
  const { 
    selectedCompanyIds, 
    clearSelectedCompanyIds 
  } = useBrokerCompanyStore();
  
  // API 뮤테이션 훅 사용
  const batchUpdateMutation = useBatchUpdateCompanies();
  
  // 상태 관리
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'activate' | 'deactivate' | null>(null);

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

  // 선택된 업체 상태 변경 다이얼로그 열기
  const handleOpenStatusChangeDialog = (action: 'activate' | 'deactivate') => {
    if (selectedCompanyIds.length === 0) {
      toast.error('상태를 변경할 업체를 선택해주세요.');
      return;
    }
    
    setPendingStatus(action);
    setIsStatusChangeDialogOpen(true);
  };
  
  // 상태 변경 확인
  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    
    try {
      // API 호출
      await batchUpdateMutation.mutateAsync({
        companyIds: selectedCompanyIds,
        action: pendingStatus,
        reason: "관리자에 의한 상태 변경"
      });
      
      // 성공 메시지
      const statusLabel = pendingStatus === 'activate' ? '활성화' : '비활성화';
      toast.success(`${selectedCompanyIds.length}개 업체를 ${statusLabel}했습니다.`);
      
      // 선택된 업체 목록 초기화
      clearSelectedCompanyIds();
      
      // 상태 업데이트 콜백
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      toast.error(`업체 상태 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsStatusChangeDialogOpen(false);
      setPendingStatus(null);
    }
  };

  // 선택된 업체 삭제 다이얼로그 열기
  const handleOpenDeleteDialog = () => {
    if (selectedCompanyIds.length === 0) {
      toast.error('삭제할 업체를 선택해주세요.');
      return;
    }
    
    setIsDeleteDialogOpen(true);
  };
  
  // 삭제 확인
  const handleConfirmDelete = async () => {
    try {
      // API 호출
      await batchUpdateMutation.mutateAsync({
        companyIds: selectedCompanyIds,
        action: 'delete',
        reason: "관리자에 의한 삭제"
      });
      
      // 성공 메시지
      toast.success(`${selectedCompanyIds.length}개 업체가 삭제되었습니다.`);
      
      // 선택된 업체 목록 초기화
      clearSelectedCompanyIds();
      
      // 상태 업데이트 콜백
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      toast.error(`업체 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    if (onActionSuccess) onActionSuccess();
  };
  
  // 로딩 상태
  const isLoading = batchUpdateMutation.isPending;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        {/* 좌측 버튼 그룹: 새로고침, 뷰 모드 변경 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
          </Button>
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
              disabled={isLoading}
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
            disabled={isLoading}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">다운로드</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExcelUpload}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">업로드</span>
          </Button>
          
          {/* 선택 업체 상태 변경 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={selectedCompanyIds.length === 0 || isLoading}>
                상태 변경
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenStatusChangeDialog('activate')}>
                활성화
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenStatusChangeDialog('deactivate')}>
                비활성화
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleOpenDeleteDialog}
                className="text-destructive focus:text-white focus:bg-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                선택 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <BrokerCompanyRegisterSheet 
            trigger={
              <Button className="flex items-center gap-1" disabled={isLoading}>
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
      
      {/* 상태 변경 확인 다이얼로그 */}
      <AlertDialog open={isStatusChangeDialogOpen} onOpenChange={setIsStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === 'activate' ? '업체 활성화' : '업체 비활성화'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCompanyIds.length}개 업체의 상태를 {pendingStatus === 'activate' ? '활성화' : '비활성화'}하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmStatusChange}
              disabled={isLoading}
              className={pendingStatus === 'deactivate' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              {isLoading ? '처리 중...' : '확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              업체 삭제 확인
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCompanyIds.length}개 업체를 삭제하시겠습니까?<br />
              이 작업은 되돌릴 수 없으며, 관련된 모든 데이터가 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 