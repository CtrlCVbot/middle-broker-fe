"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Search, UserPlus, Filter, X } from 'lucide-react';
import { IBrokerCompanyManager, ManagerRole } from '@/types/broker-company';
import { useBrokerCompanyManagerStore } from '@/store/broker-company-manager-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { BrokerCompanyManagerDialog } from './broker-company-manager-dialog';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface BrokerCompanyManagerListProps {
  companyId: string;
}

export function BrokerCompanyManagerList({ companyId }: BrokerCompanyManagerListProps) {
  const { 
    managers, 
    isLoading, 
    filter,
    selectedManagerIds,
    toggleManagerSelection,
    clearSelection,
    setFilter,
    loadManagers,
    setCurrentCompanyId,
    changeManagerStatus,
    pagination,
    setPage,
    error,
  } = useBrokerCompanyManagerStore();
  
  // 초기 로딩
  useEffect(() => {
    setCurrentCompanyId(companyId);
    
    // 디버깅용 로그 추가
    console.log('🔍 담당자 목록 컴포넌트 마운트, 회사 ID:', companyId);
    console.log('🔍 담당자 목록 컴포넌트 마운트, 담당자 목록:', managers);
    
    // 초기 데이터 로딩
    loadManagers(companyId);
    
    
    
    return () => {
      console.log('🧹 담당자 목록 컴포넌트 언마운트');
      
    };
  }, [companyId, setCurrentCompanyId, loadManagers]);
  
  // 담당자 추가 완료 핸들러
  const handleAddSuccess = (manager: IBrokerCompanyManager) => {
    console.log('✅ 담당자 추가 완료:', manager.name);
    // 이미 Dialog 컴포넌트에서 toast와 loadManagers가 실행되므로 추가 작업 불필요
  };
  
  // 담당자 수정 완료 핸들러
  const handleUpdateSuccess = (manager: IBrokerCompanyManager) => {
    console.log('✅ 담당자 수정 완료:', manager.name);
    // 이미 Dialog 컴포넌트에서 toast와 loadManagers가 실행되므로 추가 작업 불필요
  };
  
  // 담당자 활성화/비활성화 핸들러
  const handleToggleStatus = async (manager: IBrokerCompanyManager) => {
    try {
      const newStatus = manager.status === '활성' ? '비활성' : '활성';
      console.log(`🔄 담당자 상태 변경 시도: ${manager.name} => ${newStatus}`);
      
      await changeManagerStatus(manager.id, newStatus);
      toast.success(`${manager.name} 담당자 상태가 ${newStatus}으로 변경되었습니다.`);
    } catch (error) {
      console.error('❌ 담당자 상태 변경 오류:', error);
      toast.error('상태 변경 중 오류가 발생했습니다.');
    }
  };
  
  // 필터링된 담당자 목록
  const filteredManagers = managers.filter(manager => {
    // 검색어 필터링
    if (filter.searchTerm && 
        !manager.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) &&
        !manager.email.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
      return false;
    }
    
    // 역할 필터링
    if ((filter.roles ?? []).length > 0 && 
        !manager.roles.some(role => (filter.roles ?? []).includes(role))) {
      return false;
    }
    
    // 상태 필터링
    if (filter.status && manager.status !== filter.status) {
      return false;
    }
    
    // 비활성화된 담당자 필터링
    if (!filter.showInactive && manager.status === '비활성') {
      return false;
    }
    
    return true;
  });
  
  // 담당자 역할 뱃지 렌더링
  const renderRoleBadges = (roles: ManagerRole[]) => {
    return roles.map(role => {
      let color = '';
      switch (role) {
        case '배차':
          color = 'bg-blue-100 text-blue-800';
          break;
        case '정산':
          color = 'bg-green-100 text-green-800';
          break;
        case '관리':
          color = 'bg-purple-100 text-purple-800';
          break;
      }
      
      return (
        <Badge key={role} className={`mr-1 ${color}`} variant="outline">
          {role}
        </Badge>
      );
    });
  };
  
  // 모든 담당자 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      useBrokerCompanyManagerStore.setState({ 
        selectedManagerIds: filteredManagers.map(m => m.id) 
      });
    } else {
      clearSelection();
    }
  };
  
  // 필터 초기화
  const resetFilters = () => {
    setFilter({
      searchTerm: '',
      roles: [],
      status: '',
      showInactive: false
    });
  };
  
  // 페이지네이션 링크 렌더링 함수 추가
  const renderPaginationLinks = () => {
    const { page, totalPages } = pagination;
    const items = [];
    
    // 처음 페이지
    if (totalPages > 3 && page > 2) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setPage(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // 처음 페이지와 현재 페이지 사이에 많은 페이지가 있으면 생략 표시
      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // 이전 페이지, 현재 페이지, 다음 페이지 렌더링
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setPage(i)} isActive={page === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // 마지막 페이지
    if (totalPages > 3 && page < totalPages - 1) {
      // 현재 페이지와 마지막 페이지 사이에 많은 페이지가 있으면 생략 표시
      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setPage(totalPages)} isActive={page === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  // 담당자 없음 또는 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 에러 처리 추가 */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* 툴바: 검색 및 필터링 */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이름, ID, 이메일 검색..."
              value={filter.searchTerm}
              onChange={(e) => setFilter({ searchTerm: e.target.value })}
              className="pl-8"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>필터</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">역할</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {
                  const updatedRoles: ManagerRole[] = (filter.roles ?? []).includes('배차') 
                    ? (filter.roles ?? []).filter(r => r !== '배차')
                    : [...(filter.roles ?? []), '배차'];
                  setFilter({ roles: updatedRoles });
                }}>
                  <Checkbox
                    checked={(filter.roles ?? []).includes('배차')}
                    className="mr-2 h-4 w-4"
                  />
                  배차
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const updatedRoles: ManagerRole[] = (filter.roles ?? []).includes('정산') 
                    ? (filter.roles ?? []).filter(r => r !== '정산')
                    : [...(filter.roles ?? []), '정산'];
                  setFilter({ roles: updatedRoles });
                }}>
                  <Checkbox
                    checked={(filter.roles ?? []).includes('정산')}
                    className="mr-2 h-4 w-4"
                  />
                  정산
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const updatedRoles: ManagerRole[] = (filter.roles ?? []).includes('관리') 
                    ? (filter.roles ?? []).filter(r => r !== '관리')
                    : [...(filter.roles ?? []), '관리'];
                  setFilter({ roles: updatedRoles });
                }}>
                  <Checkbox
                    checked={(filter.roles ?? []).includes('관리')}
                    className="mr-2 h-4 w-4"
                  />
                  관리
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">상태</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilter({ status: '활성' })}>
                  <Checkbox
                    checked={filter.status === '활성'}
                    className="mr-2 h-4 w-4"
                  />
                  활성
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({ status: '비활성' })}>
                  <Checkbox
                    checked={filter.status === '비활성'}
                    className="mr-2 h-4 w-4"
                  />
                  비활성
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter({ status: '' })}>
                  <Checkbox
                    checked={filter.status === ''}
                    className="mr-2 h-4 w-4"
                  />
                  모두
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setFilter({ showInactive: !filter.showInactive })}>
                <Checkbox
                  checked={filter.showInactive}
                  className="mr-2 h-4 w-4"
                />
                비활성 담당자 표시
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={resetFilters}>
                필터 초기화
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedManagerIds.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedManagerIds.length}개 선택됨
            </span>
          )}
          
          <BrokerCompanyManagerDialog
            companyId={companyId}
            mode="add"
            onSuccess={handleAddSuccess}
          />
        </div>
      </div>
      
      {/* 담당자 필터 표시 */}
      {(filter.searchTerm || (filter.roles ?? []).length > 0 || filter.status || filter.showInactive) && (
        <div className="flex flex-wrap gap-2 my-2">
          {filter.searchTerm && (
            <Badge variant="outline" className="bg-muted/50">
              검색: {filter.searchTerm}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilter({ searchTerm: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filter.roles ?? []).map(role => (
            <Badge key={role} variant="outline" className="bg-muted/50">
              역할: {role}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilter({ 
                  roles: (filter.roles ?? []).filter(r => r !== role) 
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filter.status && (
            <Badge variant="outline" className="bg-muted/50">
              상태: {filter.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilter({ status: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filter.showInactive && (
            <Badge variant="outline" className="bg-muted/50">
              비활성 담당자 표시
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => setFilter({ showInactive: false })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6"
            onClick={resetFilters}
          >
            모두 지우기
          </Button>
        </div>
      )}
      
      {/* 담당자 목록 */}
      {filteredManagers.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredManagers.length > 0 && 
                      filteredManagers.every(m => selectedManagerIds.includes(m.id))
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="모든 담당자 선택"
                  />
                </TableHead>
                <TableHead>이름</TableHead>                
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>부서/직급</TableHead>
                <TableHead>활성화</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManagers.map((manager) => (
                <TableRow 
                  key={manager.id}
                  className={manager.status === '비활성' ? 'bg-muted/30 text-muted-foreground' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedManagerIds.includes(manager.id)}
                      onCheckedChange={() => toggleManagerSelection(manager.id)}
                      aria-label={`${manager.name} 선택`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{manager.name}</TableCell>                  
                  <TableCell>
                    <a 
                      href={`mailto:${manager.email}`} 
                      className="flex items-center hover:underline text-blue-600"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {manager.email}
                    </a>
                  </TableCell>
                  <TableCell>{manager.phoneNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {renderRoleBadges(manager.roles)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {manager.department && manager.rank ? 
                      `${manager.department} / ${manager.rank}` : 
                      (manager.department || manager.rank || '-')}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={manager.status === '활성'}
                      onCheckedChange={() => handleToggleStatus(manager)}
                      aria-label="로그인 활성화 상태"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <BrokerCompanyManagerDialog
                      companyId={companyId}
                      manager={manager}
                      mode="edit"
                      onSuccess={handleUpdateSuccess}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border rounded-md">
          <p className="text-muted-foreground mb-4">등록된 담당자가 없습니다.</p>
          <BrokerCompanyManagerDialog
            companyId={companyId}
            mode="add"
            onSuccess={handleAddSuccess}
            trigger={
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                <span>담당자 추가</span>
              </Button>
            }
          />
        </div>
      )}
      
      {/* 페이지네이션 추가 */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, pagination.page - 1))}
                  aria-disabled={pagination.page === 1}
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {renderPaginationLinks()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                  aria-disabled={pagination.page === pagination.totalPages}
                  className={pagination.page === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
} 