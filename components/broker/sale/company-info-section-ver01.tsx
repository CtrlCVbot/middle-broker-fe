//react
import React from 'react';

//ui
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Building2, Search, CheckCircle, Hash, User, Landmark } from 'lucide-react';

//utils
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
  editingSalesBundle?: any;
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
  editingSalesBundle,
  displayShipperGroups = {},
  hasShipperGroups = false,
  loading,
  isLoadingCompanies
}: ICompanyInfoSectionProps) {
  // 은행 코드와 은행명 매핑
  const BANK_CODES = [
    { code: '001', name: '한국은행' },
    { code: '002', name: '산업은행' },
    { code: '003', name: '기업은행' },
    { code: '004', name: '국민은행' },
    { code: '007', name: '수협은행' },
    { code: '008', name: '수출입은행' },
    { code: '011', name: '농협은행' },
    { code: '020', name: '우리은행' },
    { code: '023', name: 'SC제일은행' },
    { code: '027', name: '씨티은행' },
    { code: '031', name: '대구은행' },
    { code: '032', name: '부산은행' },
    { code: '034', name: '광주은행' },
    { code: '035', name: '제주은행' },
    { code: '037', name: '전북은행' },
    { code: '039', name: '경남은행' },
    { code: '045', name: '새마을금고중앙회' },
    { code: '048', name: '신협중앙회' },
    { code: '050', name: '상호저축은행' },
    { code: '071', name: '우체국' },
    { code: '081', name: '하나은행' },
    { code: '088', name: '신한은행' },
    { code: '089', name: '케이뱅크' },
    { code: '090', name: '카카오뱅크' },
    { code: '092', name: '토스뱅크' },
  ];

  console.log("displayShipperGroups", displayShipperGroups);
  console.log("editingSalesBundle", editingSalesBundle);

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
                //console.log("displayShipperGroups[shipper].company", displayShipperGroups[shipper]);
                if (isEditMode && displayShipperGroups[shipper]) {
                  // 편집 모드: editingSalesBundle의 회사 정보 사용
                  console.log("displayShipperGroups", displayShipperGroups);
                  console.log("편집 모드", displayShipperGroups[shipper].company);
                  onSelectCompany({
                    id: displayShipperGroups[shipper].company.id || '',
                    name: displayShipperGroups[shipper].company.name || '',
                    businessNumber: displayShipperGroups[shipper].company.businessNumber || '',
                    ceoName: displayShipperGroups[shipper].company.ceo || '',
                    bankCode: displayShipperGroups[shipper].company.bankCode || '',
                    bankAccountHolder: displayShipperGroups[shipper].company.accountHolder || '',
                    bankAccount: displayShipperGroups[shipper].company.accountNumber || ''
                  });
                } else {
                  // 생성 모드: 기존 로직 유지
                  console.log("생성", displayShipperGroups[shipper].company);
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button">
                        <Search className="h-4 w-4 mr-2" />
                        회사 조회
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>회사 검색</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="회사명 검색"
                            className="h-9"
                            type="text"
                            value={companySearchTerm}
                            onChange={e => setCompanySearchTerm(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                onCompanySearch();
                              }
                            }}
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            className="h-9 px-3" 
                            onClick={onCompanySearch}
                          >
                            검색
                          </Button>
                        </div>
                        <ScrollArea className="h-60 border rounded-md">
                          <div className="p-2">
                            {companies.map((company) => (
                              <div
                                key={company.id}
                                className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                                onClick={() => {
                                  // form.reset({
                                  //   ...form.getValues(),
                                  //   // shipperName: company.name,
                                  //   // businessNumber: company.businessNumber,
                                  //   // shipperCeo: company.ceoName,
                                  //   // accountHolder: company.bankAccountHolder,
                                  //   // accountNumber: company.bankAccountNumber,
                                  //   // bankCode: company.bankCode,
                                  // });
                                  console.log("company!!!", company);
                                  console.log("form!!!", form.getValues());
                                  
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
                      </div>
                    </DialogContent>
                  </Dialog>
                </FormItem>
              )}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="border p-4 rounded-md bg-background bg-muted/30 flex flex-col gap-4">
            {/* 회사 정보 영역: 한 줄 정보 표시 */}
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground/90 min-h-[32px]">
              {form.watch("shipperName") || form.watch("businessNumber") || form.watch("shipperCeo") ? (
                <>
                  <Building2 className="inline-block mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{form.watch("shipperName") || <span className="text-muted-foreground">회사명 없음</span>}</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <Hash className="inline-block mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{form.watch("businessNumber") || <span className="text-muted-foreground">사업자번호 없음</span>}</span>
                  {/* <span className="mx-2 text-muted-foreground">|</span>
                  <User className="inline-block mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{form.watch("shipperCeo") || <span className="text-muted-foreground">대표자 없음</span>}</span> */}
                </>
              ) : (
                <span className="text-muted-foreground">회사 정보가 없습니다.</span>
              )}
            </div>
            {/* 계좌 정보 영역: 2행 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* 은행 */}
              <div>
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value} // defaultValue 대신 value 사용
                          >
                            <SelectTrigger className="h-9 pl-10 w-full">
                              <SelectValue placeholder="은행 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {BANK_CODES.map((bank) => (
                                <SelectItem key={bank.code} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* 예금주 */}
              <div>
                <FormField
                  control={form.control}
                  name="accountHolder"
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
              {/* 계좌번호 (2행) */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="accountNumber"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 