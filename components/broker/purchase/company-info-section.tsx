import React from 'react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Search, CheckCircle, Hash, User, Landmark } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";

export interface ICompanyInfoSectionProps {
  form: any;
  companySearchTerm: string;
  setCompanySearchTerm: (v: string) => void;
  companies: any[];
  onSelectCompany: (company: any) => void;
  selectedCompanyId: string | null;
  onReset: () => void;
  onCompanySearch: () => void;
  isEditMode?: boolean;
  editingBundle?: any;
  displayShipperGroups?: Record<string, any>;
  hasShipperGroups?: boolean;
  loading?: boolean;
  isLoadingCompanies?: boolean;
}

export function CompanyInfoSection({
  form,
  companySearchTerm,
  setCompanySearchTerm,
  companies,
  onSelectCompany,
  selectedCompanyId,
  onReset,
  onCompanySearch,
  isEditMode,
  editingBundle,
  displayShipperGroups = {},
  hasShipperGroups = false,
  loading,
  isLoadingCompanies
}: ICompanyInfoSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">회사 정보</h3>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={loading}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* 선택된 업체 배지 표시 */}
      {hasShipperGroups ? (
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(displayShipperGroups).map((shipper) => (
            <Badge 
              key={shipper} 
              variant="outline"
              className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
              onClick={() => {
                if (isEditMode && editingBundle) {
                  // 편집 모드: editingSalesBundle의 회사 정보 사용
                  onSelectCompany({
                    id: editingBundle.companyId || '',
                    name: editingBundle.companySnapshot?.name || '',
                    businessNumber: editingBundle.companySnapshot?.businessNumber || '',
                    ceoName: editingBundle.companySnapshot?.ceoName || ''
                  });
                } else {
                  // 생성 모드: 기존 로직 유지
                  onSelectCompany(displayShipperGroups[shipper].company);
                }
              }}
            >                          
              {shipper} ({displayShipperGroups[shipper].orders.length}건)
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          
        </p>
      )}    

      {form.watch("shipperName") === "기본 화주" || form.watch("shipperName") === "" ? (
        <div className="flex flex-col items-center justify-center py-4 border-5 border-dashed border-gray-300 rounded-md bg-gray-100 mb-2">
          <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">청구 회사 정보를 검색해주세요</p>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="shipperName"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button">
                        <Search className="h-4 w-4 mr-2" />
                        회사 조회
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
        <div className="mb-4">                      
          {/* 회사 정보 + 계좌 정보 (세로 정렬) */}
          <div className="flex items-center justify-between border p-4 rounded-md bg-background bg-muted/30">
            {/* 회사 영역 */}                      
            <div className={cn("grid gap-2", "grid-cols-1", "w-full")}>
              <div>
                <FormField
                  control={form.control}
                  name="shipperName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>                                      
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="회사명을 입력해주세요." 
                            className="h-9 pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="businessNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="000-0000-0000" 
                            className="h-9 pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-1">
                <FormField
                  control={form.control}
                  name="shipperCeo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="대표자명" 
                            className="h-9 pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 계좌 정보 영역 */}                      
            <div className={cn("grid gap-2", "grid-cols-1", "w-full")}>
              <div>
                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>                                      
                        <div className="relative">
                          <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="은행명을 입력해주세요." 
                            className="h-9 pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="계좌번호를 입력해주세요." 
                            className="h-9 pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-1">
                <FormField
                  control={form.control}
                  name="bankAccountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="예금주명" 
                            className="h-9 pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 