import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Search, CheckCircle, Hash, User, Phone, Mail, Loader2, UserPlus } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';
// 담당자 추가 다이얼로그 import
import { BrokerCompanyManagerDialog } from '@/components/broker/company/broker-company-manager-dialog';
import { IBrokerCompanyManager } from '@/types/broker-company';

export interface ICompanyManagerInfoSectionProps {
  form: any;
  // 회사 관련 props
  companySearchTerm: string;
  setCompanySearchTerm: (v: string) => void;
  companies: any[];
  onSelectCompany: (company: any) => void;
  selectedCompanyId: string | null;
  onCompanySearch: () => void;
  isLoadingCompanies?: boolean;
  // 담당자 관련 props
  managerSearchTerm: string;
  setManagerSearchTerm: (v: string) => void;
  managers: any[];
  onSelectManager: (manager: any) => void;
  selectedManagerId: string | null;
  onManagerSearch: () => void;
  isLoadingManagers?: boolean;
  // 공통 props
  onReset: () => void;
  isEditMode?: boolean;
  loading?: boolean;
  // 선택적 props (settlement에서 사용)
  editingSalesBundle?: any;
  displayShipperGroups?: Record<string, any>;
  hasShipperGroups?: boolean;
  // 추가: 자동 설정 관련 props
  isAutoSettingLoading?: boolean;
  autoSettingError?: string | null;
  isCompanyAutoSet?: boolean;
  isManagerAutoSet?: boolean;
  // 추가: 담당자 목록 리로드 함수
  onManagerListReload?: () => void;
}

export function CompanyManagerInfoSection({
  form,
  companySearchTerm,
  setCompanySearchTerm,
  companies,
  onSelectCompany,
  selectedCompanyId,
  onCompanySearch,
  isLoadingCompanies,
  managerSearchTerm,
  setManagerSearchTerm,
  managers,
  onSelectManager,
  selectedManagerId,
  onManagerSearch,
  isLoadingManagers,
  onReset,
  isEditMode,
  loading,
  editingSalesBundle,
  displayShipperGroups = {},
  hasShipperGroups = false,

  // 추가: 자동 설정 관련 props
  isAutoSettingLoading = false,
  autoSettingError = null,
  isCompanyAutoSet = false,
  isManagerAutoSet = false,
  // 추가: 담당자 목록 리로드 함수
  onManagerListReload,
  //
}: ICompanyManagerInfoSectionProps) {
  const companySelected = !!selectedCompanyId;
  const activeManagers = managers.filter((m: any) => m.status === '활성');
  const hasManagers = activeManagers.length > 0;
  const selectedManager = managers.find((m: any) => m.id === selectedManagerId);

  // 담당자 추가 성공 핸들러
  const handleAddManagerSuccess = (newManager: IBrokerCompanyManager) => {
    console.log('✅ 담당자 추가 완료:', newManager.name);
    
    // 담당자 목록 리로드
    if (onManagerListReload) {
      onManagerListReload();
    }
    
    // 새로 추가된 담당자를 자동으로 선택
    onSelectManager(newManager);
    
    // 폼 필드 자동 업데이트
    form.setValue('manager', newManager.name);
    form.setValue('managerContact', newManager.phoneNumber || '');
    form.setValue('managerEmail', newManager.email || '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">회사 및 담당자 정보</h3><span className="text-destructive">*</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={loading || isAutoSettingLoading}
        >
          전체 초기화
        </Button>
      </div>

      {/* 자동 설정 상태 표시 */}
      {isAutoSettingLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 p-2 bg-blue-50 rounded-md border border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-700">로그인 정보로 자동 설정 중...</span>
        </div>
      )}

      {/* 자동 설정 에러 표시 */}
      {autoSettingError && (
        <div className="text-sm text-red-600 mb-2 p-2 bg-red-50 rounded-md border border-red-200">
          {autoSettingError}
        </div>
      )}

      {/* 회사 정보 섹션 */}
      <div className="space-y-2">        

        {/* 선택된 업체 배지 표시 (settlement에서 사용) */}
        {hasShipperGroups ? (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Object.keys(displayShipperGroups).map((shipper) => (
              <Badge 
                key={shipper} 
                variant="outline"
                className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
                onClick={() => {
                  if (isEditMode && editingSalesBundle) {
                    onSelectCompany({
                      id: editingSalesBundle.companyId || '',
                      name: editingSalesBundle.companySnapshot?.name || '',
                      businessNumber: editingSalesBundle.companySnapshot?.businessNumber || '',
                      ceoName: editingSalesBundle.companySnapshot?.ceoName || ''
                    });
                  } else {
                    onSelectCompany(displayShipperGroups[shipper].company);
                  }
                }}
              >                          
                {shipper} ({displayShipperGroups[shipper].orders.length}건)
              </Badge>
            ))}
          </div>
        ) : null}

        {form.watch("shipperName") === "기본 화주" || form.watch("shipperName") === "" ? (
          <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 mb-2 mt-6">
            <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {isAutoSettingLoading ? "자동 설정 중..." : "요청 화주 정보를 검색해주세요"}
            </p>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="shipperName"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" disabled={isAutoSettingLoading}>
                          <Search className="h-4 w-4 mr-2" />
                          화주 조회
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="border-b p-2">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="회사명 검색"
                              className="h-8"
                              type="search"
                              value={companySearchTerm}
                              onChange={e => setCompanySearchTerm(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  onCompanySearch();
                                }
                              }}
                            />
                            <Button size="sm" className="h-8 px-2" onClick={onCompanySearch}>검색</Button>
                          </div>
                        </div>
                        <ScrollArea className="h-60">
                          <div className="p-2">
                            {companies.map((company) => (
                              <div
                                key={company.id}
                                className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                                onClick={() => {
                                  field.onChange(company.name);
                                  form.setValue("businessNumber", company.businessNumber || "-");
                                  onSelectCompany(company);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{company.name}</span>
                                  <span className="text-xs text-muted-foreground">{company.businessNumber}</span>
                                </div>
                                {company.name === field.value && (
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            ))}
                            {isLoadingCompanies && (
                              <div className="text-xs text-muted-foreground p-2">검색 중...</div>
                            )}
                            {!isLoadingCompanies && companies.length === 0 && (
                              <div className="text-xs text-muted-foreground p-2">검색 결과가 없습니다.</div>
                            )}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mt-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-500">회사명</p>
                  {/* 자동 설정 완료 배지 (실제로 자동 설정된 경우만 표시) */}
                  {isCompanyAutoSet && !isAutoSettingLoading && !autoSettingError && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      자동 설정됨
                    </Badge>
                  )}
                </div>
                <p className="text-base font-semibold">{form.watch("shipperName")}</p>                            
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 담당자 정보 섹션 - 회사 선택 시에만 표시 */}
      {companySelected && (
        <div className="space-y-4">
          <Separator className="my-4" />
          
          {/* 담당자 섹션 헤더 - 개선된 레이아웃 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-gray-900">
                담당자 {hasManagers && `(활성 ${activeManagers.length})`}
              </h4>
            </div>
            
            {/* 담당자 추가 버튼 - Primary 스타일로 개선 */}
            {!isAutoSettingLoading && (
              <BrokerCompanyManagerDialog
                companyId={selectedCompanyId!}
                mode="add"
                onSuccess={handleAddManagerSuccess}
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    className="flex items-center gap-1.5 h-8 px-3 text-sm font-medium w-full sm:w-auto justify-center"
                    disabled={loading || isAutoSettingLoading}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    담당자 추가
                  </Button>
                }
              />
            )}
          </div>

          {/* 선택된 담당자 카드 - 상단 고정 */}
          {selectedManager && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selectedManager.name}
                    </p>
                    {/* 자동 설정 완료 배지 (담당자) */}
                    {isManagerAutoSet && !isAutoSettingLoading && !autoSettingError && (
                      <Badge variant="secondary" className="text-xs w-fit">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        자동 설정됨
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {selectedManager.phoneNumber && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 break-all">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{selectedManager.phoneNumber}</span>
                      </p>
                    )}
                    {selectedManager.email && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 break-all">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{selectedManager.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 담당자 후보 목록 */}
          <div className="space-y-3">
            {isAutoSettingLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>담당자 로드 중...</span>
              </div>
            ) : hasManagers ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">담당자 후보</p>
                {/* 모바일에서 가로 스크롤 허용 */}
                <div className="overflow-x-auto">
                  <div className="flex gap-2 min-w-max pb-1">
                    {activeManagers.map((manager) => (
                      <Badge
                        key={manager.id}
                        variant={manager.id === selectedManagerId ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                          manager.id === selectedManagerId
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-secondary hover:text-secondary-foreground"
                        )}
                        onClick={() => onSelectManager(manager)}
                      >
                        {manager.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 빈 상태 개선 - 중앙 정렬된 안내와 강조 버튼 */
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <User className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2 font-medium text-center">
                  아직 등록된 담당자가 없습니다
                </p>
                <p className="text-xs text-gray-500 mb-4 text-center px-4">
                  새 담당자를 추가하면 화물 등록이 더 편리해집니다
                </p>
                <BrokerCompanyManagerDialog
                  companyId={selectedCompanyId!}
                  mode="add"
                  onSuccess={handleAddManagerSuccess}
                  trigger={
                    <Button
                      type="button"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={loading || isAutoSettingLoading}
                    >
                      <UserPlus className="h-4 w-4" />
                      담당자 추가
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          {/* 담당자 미선택 상태 - 선택된 담당자가 없을 때만 표시 */}
          {!selectedManager && hasManagers && (
            <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <p className="text-sm text-muted-foreground">
                {isAutoSettingLoading ? "담당자 자동 설정 중..." : "담당자를 선택해주세요"}
              </p>              
            </div>
          )}
        </div>
      )}
    </div>
  );
} 