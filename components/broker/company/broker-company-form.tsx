"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  IBrokerCompany, 
  CompanyStatus,
  StatementType
} from '@/types/broker-company';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { BrokerCompanyManagerList } from './broker-company-manager-list';
import { getCurrentUser } from '@/utils/auth';
import { BrokerCompanyWarning } from './broker-company-warning';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

// 상수 배열 추가
const COMPANY_TYPE_OPTIONS = ['화주', '운송사', '주선사'] as const;
type CompanyTypeOption = typeof COMPANY_TYPE_OPTIONS[number];

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


interface BrokerCompanyFormProps {
  isSubmitting?: boolean;
  onSubmit: (data: IBrokerCompany) => void;
  initialData?: Partial<IBrokerCompany>;
  mode?: 'register' | 'edit';
}

// 고유 ID 생성 함수 (uuid 대신 사용)
const generateId = () => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// 업체 등록 폼 스키마 정의
const companyFormSchema = z.object({
  name: z.string().min(1, { message: '업체명은 필수 입력 항목입니다.' }).max(50, { message: '업체명은 최대 50자까지 입력 가능합니다.' }),
  businessNumber: z.string().min(10, { message: '사업자번호는 10자리 숫자로 입력해주세요.' }).max(12, { message: '사업자번호는 최대 12자리까지 입력 가능합니다.' }),
  type: z.enum(COMPANY_TYPE_OPTIONS),
  statementType: z.enum(['매입처', '매출처']),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }).optional().or(z.literal('')),
  phoneNumber: z.string().min(1, { message: '전화번호는 필수 입력 항목입니다.' }),
  //faxNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  status: z.enum(['활성', '비활성']).default('활성'),
  //managerName: z.string().optional(),
  //managerPhoneNumber: z.string().optional(),
  representative: z.string().min(1, { message: '대표자명은 필수 입력 항목입니다.' }),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  bankCode: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAccountHolder: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

/**
 * 다양한 회사 데이터 형식을 폼 데이터 형식으로 정규화하는 함수
 * ILegacyCompany나 IBrokerCompany 등 여러 타입을 지원
 */
function normalizeCompanyData(data: any): Partial<IBrokerCompany> {
  if (!data) return {};

  console.log('data:', data);
  
  // 필드 매핑을 위한 객체
  const normalized = {
    // 기본 필드들
    id: data.id || '',
    code: data.code || '',
    name: data.name || '',
    businessNumber: data.businessNumber || '',
    
    // 타입 필드 - 영문이나 한글 모두 지원
    type: (() => {
      const t = (data.type || '').toLowerCase();
      if (t === 'broker' || t === '주선사') return '주선사';
      if (t === 'shipper' || t === '화주') return '화주';
      if (t === 'carrier' || t === '운송사') return '운송사';
      return '운송사'; // fallback
    })() as CompanyTypeOption,
    
    // 전표 타입
    statementType: (() => {
      const t = (data.statementType || '').toLowerCase();
      if (t === 'purchase' || t === '매입처') return '매입처';
      if (t === 'sales' || t === '매출처') return '매출처';
      return '매출처'; // 기본값
    })() as StatementType,
    
    // 대표자명 - 필드명이 다른 경우를 모두 지원
    representative: data.representative || data.ceoName || '',
    
    // 연락처 정보
    email: data.email || (data.contact?.email) || '',
    phoneNumber: data.phoneNumber || (data.contact?.tel) || '',
    //faxNumber: data.faxNumber || '',    
    mobileNumber: (data.contact?.mobile) || '',
    
    // 상태 - 영문이나 한글 모두 지원
    status: (
      data.status === 'active' || data.status === '활성'
        ? '활성'
        : data.status === 'inactive' || data.status === '비활성'
        ? '비활성'
        : '활성'
    ) as CompanyStatus,
    
    // 등록일
    registeredDate: data.registeredDate || data.registeredAt || '',
    
    // 추가 데이터
    files: data.files || [],
    managers: data.managers || [],
  };
  
  console.log('정규화된 회사 데이터:', normalized);
  return normalized;
}

export function BrokerCompanyForm({ 
  isSubmitting = false, 
  onSubmit, 
  initialData = {},
  mode = 'register'
}: BrokerCompanyFormProps) {
  // 파일 업로드 상태
  const [files, setFiles] = useState<{ id: string; name: string; url: string; type: string }[]>(
    initialData.files || []
  );

  // 폼 설정
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialData.name || '',
      businessNumber: initialData.businessNumber || '',
      type: (() => {
        if (!initialData.type) return '운송사';
        const t = (initialData.type as string).toLowerCase();
        if (t === 'broker' || t === '주선사') return '주선사';
        if (t === 'shipper' || t === '화주') return '화주';
        if (t === 'carrier' || t === '운송사') return '운송사';
        return '운송사';
      })() as CompanyTypeOption,
      statementType: (() => {
        if (!initialData.statementType) return '매입처';
        const t = (initialData.statementType as string).toLowerCase();
        if (t === 'purchase' || t === '매입처') return '매입처';
        if (t === 'sales' || t === '매출처') return '매출처';
        return '매입처';
      })() as StatementType,
      email: initialData.email || '',
      phoneNumber: initialData.phoneNumber || '',
      //faxNumber: initialData.faxNumber || '',
      mobileNumber: initialData.mobileNumber || '',
      status: (initialData.status as CompanyStatus) || '활성',
      //managerName: initialData.managerName || '',
      //managerPhoneNumber: initialData.managerPhoneNumber || '',
      representative: initialData.representative || '',
      files: [],
    },
  });
  
  // initialData가 변경될 때 폼 값을 업데이트하기 위한 useEffect 추가
  useEffect(() => {
    // 회사 데이터가 있을 때만 폼을 재설정
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('초기 데이터 로드:', initialData);
      
      // 데이터 정규화 - 다양한 형식의 데이터를 폼에 맞게 변환
      const normalizedData = normalizeCompanyData(initialData);
      
      // 파일 상태 업데이트
      if (normalizedData.files && normalizedData.files.length > 0) {
        setFiles(normalizedData.files);
      }
      
      // 폼 값 재설정 - 정규화된 데이터 사용
      form.reset({
        name: normalizedData.name,
        businessNumber: normalizedData.businessNumber,
        type: normalizedData.type as CompanyTypeOption,
        statementType: normalizedData.statementType as StatementType,
        email: normalizedData.email,
        phoneNumber: normalizedData.phoneNumber,
        //faxNumber: normalizedData.faxNumber,
        mobileNumber: normalizedData.mobileNumber,
        status: normalizedData.status as CompanyStatus,
        //managerName: normalizedData.managerName,
        //managerPhoneNumber: normalizedData.managerPhoneNumber,
        representative: normalizedData.representative,
        files: [],
      }, {
        keepDirtyValues: false, // 이 옵션을 false로 설정해 모든 값을 새로 설정
        keepErrors: false, // 모든 에러 초기화
      });
      
      // 디버깅용 로그 - 폼 값 확인
      console.log('폼 값 설정 완료:', form.getValues());
    }
  }, [initialData, form]);

  // 전화번호 자동 하이픈 추가 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 폼 제출 핸들러
  const handleSubmit = (data: CompanyFormValues, e?: React.BaseSyntheticEvent) => {
    // 기본 제출 동작 방지
    if (e) {
      e.preventDefault();
    }
    
    // 현재 로그인된 사용자 정보 가져오기
    const currentUser = getCurrentUser();
    
    // ID 추가 (실제 구현에서는 백엔드에서 생성된 ID를 사용)
    const newCompany: IBrokerCompany = {
      ...data,
      email: data.email || '',
      //faxNumber: data.faxNumber || '',
      //managerName: data.managerName || '',
      //managerPhoneNumber: data.managerPhoneNumber || '',
      mobileNumber: data.mobileNumber || '',
      id: initialData.id || generateId(),
      code: initialData.code || `CM${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      registeredDate: initialData.registeredDate || new Date().toISOString().split('T')[0],
      files,
      managers: initialData.managers || [],
    };
    
    onSubmit(newCompany);
  };

  // 파일 업로드 완료 핸들러
  const handleFileUpload = (uploadedFiles: { id: string; name: string; url: string; type: string }[]) => {
    setFiles([...files, ...uploadedFiles]);
  };

  // 파일 삭제 핸들러
  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  // 버튼 텍스트 설정
  const submitButtonText = mode === 'register' ? '업체 등록' : '업체 정보 수정';

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링 방지
        console.log('폼 제출 이벤트 발생, 기본 동작 및 버블링 방지');
        form.handleSubmit(handleSubmit)(e);
      }} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full px-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="warning">업체 주의사항</TabsTrigger>
            <TabsTrigger value="documents">파일 등록</TabsTrigger>
            <TabsTrigger value="managers">사용자 관리</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>업체 기본 정보</CardTitle>
                <CardDescription>업체 기본 정보를 입력합니다. (*) 표시는 필수 입력 항목입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 업체명 */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업체명 *</FormLabel>
                        <FormControl>
                          <Input placeholder="업체명을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 사업자번호 */}
                  <FormField
                    control={form.control}
                    name="businessNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          사업자번호 *
                          <FormDescription>
                          (하이픈(-) 포함하여 입력 가능)
                        </FormDescription>

                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="000-00-00000" 
                            {...field} 
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d-]/g, '');
                              if (value.length <= 12) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 대표자 */}
                  <FormField
                    control={form.control}
                    name="representative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>대표자 *</FormLabel>
                        <FormControl>
                          <Input placeholder="대표자명을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  
                  
                  {/* 업체 타입 */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업체 타입 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="업체 타입을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPANY_TYPE_OPTIONS.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>                
                
                
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>연락처 정보</CardTitle>
                <CardDescription>업체 및 담당자 연락처 정보를 입력합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 전화번호 */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전화번호 *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="02-0000-0000" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(formatPhoneNumber(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* 담당자 전화번호 */}
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>담당자 전화번호 *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="010-0000-0000" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(formatPhoneNumber(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* 이메일 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          type="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 은행 정보 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>은행 정보</CardTitle>
                <CardDescription>정산 및 송금에 필요한 계좌 정보를 입력합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 은행 코드(Select) */}
                  <FormField
                    control={form.control}
                    name="bankCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>은행 *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* 예금주 */}
                  <FormField
                    control={form.control}
                    name="bankAccountHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>예금주 *</FormLabel>
                        <FormControl>
                          <Input placeholder="예금주명" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* 계좌번호 (2열 전체) */}
                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계좌번호 *</FormLabel>
                      <FormControl>
                        <Input placeholder="계좌번호를 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  
                  {/* 로그인 활성화 상태 */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>로그인 활성화</FormLabel>
                          <FormDescription>
                            비활성화 시 해당 담당자는 로그인할 수 없습니다.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === '활성'}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? '활성' : '비활성');
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
            
            
          </TabsContent>
          
          <TabsContent value="warning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>업체 주의사항</CardTitle>
                <CardDescription>해당 업체에 대한 주의사항을 등록합니다. 여러 개의 주의사항을 추가할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {initialData.id ? (
                  <BrokerCompanyWarning companyId={initialData.id} />
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    업체를 등록한 후 주의사항을 관리할 수 있습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>파일 등록</CardTitle>
                <CardDescription>사업자등록증, 계약서 등의 파일을 업로드합니다. 지원 형식: PDF, JPG, PNG (최대 5MB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 파일 업로드 컴포넌트 */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        const file = e.target.files[0];
                        // 실제 구현에서는 API 호출로 대체
                        const uploadedFile = {
                          id: generateId(),
                          name: file.name,
                          url: URL.createObjectURL(file),
                          type: file.type
                        };
                        handleFileUpload([uploadedFile]);
                      }
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <PlusCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">파일 선택 또는 여기로 드래그하세요</span>
                    <span className="text-xs text-muted-foreground mt-1">최대 5개 파일, 개별 파일 5MB 이하</span>
                  </label>
                </div>
                
                {/* 업로드된 파일 목록 */}
                {files.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    {files.map((file) => (
                      <div 
                        key={file.id} 
                        className="flex items-center p-2 rounded border border-gray-200 bg-gray-50"
                      >
                        <span className="flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    업로드된 파일이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>담당자 관리</CardTitle>
                <CardDescription>업체 담당자 정보를 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {initialData.id ? (
                  <BrokerCompanyManagerList companyId={initialData.id} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    업체 등록 후 담당자를 추가할 수 있습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 