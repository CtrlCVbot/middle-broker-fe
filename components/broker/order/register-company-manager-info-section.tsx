import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Search, CheckCircle, Hash, User, Phone, Mail, Loader2 } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';

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
}: ICompanyManagerInfoSectionProps) {
  const companySelected = !!selectedCompanyId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">회사 및 담당자 정보</h3>
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
        <div className="space-y-2">
          <Separator className="my-2"/>      
          <p className="text-xs text-gray-500">담당자</p>
          {/* 담당자 배지 표시 */}
          <div className="flex flex-wrap gap-1.5 min-h-[24px]">
            {isAutoSettingLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">담당자 로드 중...</span>
              </div>
            ) : (
              managers.filter((m: any) => m.status === '활성').map((manager) => (
                <Badge
                  key={manager.id}
                  variant="outline"
                  className={cn(
                    "cursor-pointer px-2 py-1 text-xs hover:bg-secondary",
                    manager.id === selectedManagerId
                      ? "bg-primary text-white border-primary hover:bg-primary/90"
                      : ""
                  )}
                  onClick={() => onSelectManager(manager)}
                >
                  {manager.name}
                </Badge>
              ))
            )}
          </div>

          {(!form.watch('manager') || form.watch('manager') === '김중개') ? (
            <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <p className="text-sm text-muted-foreground">
                {isAutoSettingLoading ? "담당자 자동 설정 중..." : "담당자 선택해주세요"}
              </p>              
            </div>
          ) : (
            <div>
            <div className="flex items-center justify-between rounded-md border-2 border-gray-100 p-1 px-2">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-lg">👤</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{form.watch('manager')}</p>
                  {/* 자동 설정 완료 배지 (담당자) */}
                  {isManagerAutoSet && !isAutoSettingLoading && !autoSettingError && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      자동 설정됨
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{form.watch('managerContact')}</p>
                <p className="text-xs text-gray-500 truncate">{form.watch('managerEmail')}</p>
              </div>
            </div>
            </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 