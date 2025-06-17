"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Download, Upload, Trash2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { CompanyStatus } from '@/types/company';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompanyStore, useBatchUpdateCompanies } from '@/store/company-store';
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
import {
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface BrokerCompanyActionButtonsProps {
  onActionSuccess?: () => void;
  createButtonVisible?: boolean;
  onCreateClick?: () => void;
}

export function BrokerCompanyActionButtons({
  onActionSuccess,
  createButtonVisible = true,
  onCreateClick
}: BrokerCompanyActionButtonsProps) {
  const { 
    selectedCompanyIds, 
    clearSelectedCompanyIds,
    fetchCompanies
  } = useCompanyStore();
  
  const batchUpdateCompaniesMutation = useBatchUpdateCompanies();
  
  // 상태 관리
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusValue, setStatusValue] = useState<CompanyStatus>('active');
  const [statusReason, setStatusReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    try {
      const action = 'export';
      await batchUpdateCompaniesMutation.mutateAsync({ 
        companyIds: selectedCompanyIds, 
        action 
      });
      toast.success('엑셀 파일 다운로드가 시작되었습니다.');
    } catch (error) {
      toast.error('엑셀 다운로드 중 오류가 발생했습니다.');
      console.error('Excel download error:', error);
    }
  };

  // 엑셀 업로드 핸들러
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // 업로드 프로그레스 시뮬레이션
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      const action = 'import';
      const formData = new FormData();
      formData.append('file', file);
      await batchUpdateCompaniesMutation.mutateAsync({ 
        companyIds: [], 
        action, 
        formData 
      });
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        toast.success('엑셀 파일이 성공적으로 업로드되었습니다.');
        // 파일 인풋 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // 목록 갱신
        fetchCompanies();
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('엑셀 업로드 중 오류가 발생했습니다.');
      console.error('Excel upload error:', error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 상태 변경 다이얼로그 열기
  const handleOpenStatusChangeDialog = (action: 'activate' | 'deactivate') => {
    if (selectedCompanyIds.length === 0) {
      toast.error('상태를 변경할 업체를 선택해주세요.');
      return;
    }
    
    setStatusValue(action === 'activate' ? 'active' : 'inactive');
    setIsStatusDialogOpen(true);
  };
  
  // 상태 변경 확인
  const handleConfirmStatusChange = async () => {
    if (selectedCompanyIds.length === 0) {
      toast.error('변경할 업체를 선택해주세요.');
      return;
    }

    try {
      const action = statusValue === 'active' ? 'activate' : 'deactivate';
      await batchUpdateCompaniesMutation.mutateAsync({ 
        companyIds: selectedCompanyIds, 
        action, 
        reason: statusReason 
      });

      setIsStatusDialogOpen(false);
      clearSelectedCompanyIds();
      toast.success(`선택한 업체의 상태가 "${statusValue === 'active' ? '활성' : '비활성'}"으로 변경되었습니다.`);
      setStatusReason('');
    } catch (error) {
      toast.error('상태 변경 중 오류가 발생했습니다.');
      console.error('Status change error:', error);
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
      await batchUpdateCompaniesMutation.mutateAsync({ 
        companyIds: selectedCompanyIds, 
        action: 'delete', 
        reason: deleteReason 
      });
      
      setIsDeleteDialogOpen(false);
      clearSelectedCompanyIds();
      toast.success('선택한 업체가 삭제되었습니다.');
      setDeleteReason('');
    } catch (error) {
      toast.error('업체 삭제 중 오류가 발생했습니다.');
      console.error('Delete error:', error);
    }
  };

  // 새로고침 핸들러
  const handleRefresh = async () => {
    await fetchCompanies();
    toast.success('업체 목록이 새로고침되었습니다.');
  };
  
  // 로딩 상태
  const isLoading = batchUpdateCompaniesMutation.isPending;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
            disabled={selectedCompanyIds.length === 0 || isLoading}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">다운로드</span>
          </Button>
          
          <div className="relative">
            <input
              type="file"
              id="excel-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              disabled={isUploading}
              ref={fileInputRef}
            />
            <Button variant="outline" size="sm" disabled={isUploading}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">업로드</span>
            </Button>
          </div>
          
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
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>업체 상태 변경</DialogTitle>
            <DialogDescription>
              선택한 {selectedCompanyIds.length}개 업체의 상태를 변경합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">변경할 상태</Label>
              <Select 
                value={statusValue} 
                onValueChange={(val) => setStatusValue(val as CompanyStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">변경 사유</Label>
              <Input
                id="reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="상태 변경 사유를 입력하세요"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleConfirmStatusChange}>
              변경 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              업체 삭제 확인
            </DialogTitle>
            <DialogDescription>
              선택한 {selectedCompanyIds.length}개 업체를 정말 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            <Label htmlFor="delete-reason">삭제 사유</Label>
            <Input
              id="delete-reason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="삭제 사유를 입력하세요"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <XCircle className="mr-2 h-4 w-4" />
              삭제 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 업로드 프로그레스 표시 */}
      {isUploading && (
        <div className="mt-2 w-full max-w-xs">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            엑셀 파일 업로드 중... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </>
  );
} 