"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { 
  IBrokerCompany, 
  CompanyType, 
  StatementType, 
  CompanyStatus 
} from '@/types/broker-company';
import { COMPANY_TYPES, STATEMENT_TYPES, COMPANY_STATUS } from '@/utils/mockdata/mock-broker-companies';

interface BrokerCompanyFormProps {
  isSubmitting?: boolean;
  onSubmit: (data: IBrokerCompany) => void;
  initialData?: Partial<IBrokerCompany>;
}

// 고유 ID 생성 함수 (uuid 대신 사용)
const generateId = () => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// 업체 등록 폼 스키마 정의
const companyFormSchema = z.object({
  name: z.string().min(1, { message: '업체명은 필수 입력 항목입니다.' }).max(50, { message: '업체명은 최대 50자까지 입력 가능합니다.' }),
  businessNumber: z.string().min(10, { message: '사업자번호는 10자리 숫자로 입력해주세요.' }).max(12, { message: '사업자번호는 최대 12자리까지 입력 가능합니다.' }),
  type: z.enum(['화주', '운송사', '주선사']),
  statementType: z.enum(['매입처', '매출처']),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }).optional().or(z.literal('')),
  phoneNumber: z.string().min(1, { message: '전화번호는 필수 입력 항목입니다.' }),
  faxNumber: z.string().optional(),
  status: z.enum(['활성', '비활성']).default('활성'),
  managerName: z.string().min(1, { message: '담당자명은 필수 입력 항목입니다.' }),
  managerPhoneNumber: z.string().min(1, { message: '담당자 전화번호는 필수 입력 항목입니다.' }),
  representative: z.string().min(1, { message: '대표자명은 필수 입력 항목입니다.' }),
  warnings: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(500)
  })).optional(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export function BrokerCompanyForm({ 
  isSubmitting = false, 
  onSubmit, 
  initialData = {} 
}: BrokerCompanyFormProps) {
  // 주의사항 관리 상태
  const [warnings, setWarnings] = useState<{ id: string; text: string }[]>([]);
  const [newWarning, setNewWarning] = useState('');
  
  // 파일 업로드 상태
  const [files, setFiles] = useState<{ id: string; name: string; url: string; type: string }[]>([]);

  // 폼 설정
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialData.name || '',
      businessNumber: initialData.businessNumber || '',
      type: (initialData.type as CompanyType) || '운송사',
      statementType: (initialData.statementType as StatementType) || '매입처',
      email: initialData.email || '',
      phoneNumber: initialData.phoneNumber || '',
      faxNumber: initialData.faxNumber || '',
      status: (initialData.status as CompanyStatus) || '활성',
      managerName: initialData.managerName || '',
      managerPhoneNumber: initialData.managerPhoneNumber || '',
      representative: initialData.representative || '',
      warnings: [],
      files: [],
    },
  });

  // 전화번호 자동 하이픈 추가 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 주의사항 추가 핸들러
  const handleAddWarning = () => {
    if (newWarning.trim()) {
      const warning = {
        id: generateId(),
        text: newWarning.trim()
      };
      setWarnings([...warnings, warning]);
      setNewWarning('');
    }
  };

  // 주의사항 삭제 핸들러
  const handleDeleteWarning = (id: string) => {
    setWarnings(warnings.filter(warning => warning.id !== id));
  };

  // 폼 제출 핸들러
  const handleSubmit = (data: CompanyFormValues) => {
    // ID 추가 (실제 구현에서는 백엔드에서 생성된 ID를 사용)
    const newCompany: IBrokerCompany = {
      ...data,
      id: initialData.id || generateId(),
      code: initialData.code || `CM${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      registeredDate: initialData.registeredDate || new Date().toISOString().split('T')[0],
      warnings,
      files,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="warning">업체 주의사항</TabsTrigger>
            <TabsTrigger value="documents">파일 등록</TabsTrigger>
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
                        <FormLabel>사업자번호 *</FormLabel>
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
                        <FormDescription>
                          하이픈(-) 포함하여 입력 가능
                        </FormDescription>
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
                  
                  {/* 업체 상태 */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업체 상태</FormLabel>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value === '활성'}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? '활성' : '비활성');
                            }}
                          />
                          <span>{field.value === '활성' ? '활성' : '비활성'}</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 업체 구분 */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>업체 구분 *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="업체 구분을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPANY_TYPES.map((type) => (
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
                  
                  {/* 전표 구분 */}
                  <FormField
                    control={form.control}
                    name="statementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>전표 구분 *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="전표 구분을 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STATEMENT_TYPES.map((type) => (
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
                  
                  {/* 팩스번호 */}
                  <FormField
                    control={form.control}
                    name="faxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>팩스번호</FormLabel>
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
            
            <Card>
              <CardHeader>
                <CardTitle>담당자 정보</CardTitle>
                <CardDescription>업체 담당자 정보를 입력합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 담당자명 */}
                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>담당자명 *</FormLabel>
                        <FormControl>
                          <Input placeholder="담당자명을 입력하세요" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 담당자 전화번호 */}
                  <FormField
                    control={form.control}
                    name="managerPhoneNumber"
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="warning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>업체 주의사항</CardTitle>
                <CardDescription>해당 업체에 대한 주의사항을 등록합니다. 여러 개의 주의사항을 추가할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    placeholder="주의사항을 입력하세요"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddWarning();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddWarning}
                    variant="secondary"
                  >
                    추가
                  </Button>
                </div>
                
                {warnings.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    {warnings.map((warning) => (
                      <div 
                        key={warning.id} 
                        className="flex items-center p-2 rounded border border-gray-200 bg-gray-50"
                      >
                        <span className="flex-1">{warning.text}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWarning(warning.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    등록된 주의사항이 없습니다. 주의사항을 추가해주세요.
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
        </Tabs>
        
        <div className="flex items-center justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            등록하기
          </Button>
        </div>
      </form>
    </Form>
  );
} 