"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { IBrokerCompanyManager } from '@/types/broker-company';
import { MANAGER_ROLES } from '@/utils/mockdata/mock-broker-company-managers';
import { useBrokerCompanyManagerStore } from '@/store/broker-company-manager-store';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
// 백엔드 타입 참조를 위한 임포트 추가
import { IUser, UserDomain, UserStatus, SystemAccessLevel } from '@/types/user';
import { v4 as uuidv4 } from 'uuid';

interface BrokerCompanyManagerFormProps {
  companyId: string;
  manager?: IBrokerCompanyManager;
  onSubmit: (formData: IBrokerCompanyManager) => void;
  isSubmitting?: boolean;
  globalError?: string | null;
  onCancel?: () => void;
}

const emailOptionalSchema = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }).optional()
);

// 담당자 등록/수정 폼 스키마 정의 - 단순화
const managerFormSchema = z.object({
  name: z.string().min(1, { message: '이름은 필수 입력 항목입니다.' }),  
  phoneNumber: z.string().min(1, { message: '연락처는 필수 입력 항목입니다.' }),
  email: emailOptionalSchema,
  password: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  rank: z.string().optional(),
  status: z.enum(['활성', '비활성']).default('활성'),
  roles: z.array(z.enum(['배차', '정산', '관리'])).min(1, { message: '역할을 최소 하나 이상 선택해주세요.' })
});

type ManagerFormValues = z.infer<typeof managerFormSchema>;

export function BrokerCompanyManagerForm({ 
  companyId, 
  manager, 
  onSubmit,
  isSubmitting = false,
  globalError = null,
  onCancel
}: BrokerCompanyManagerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string>('');
  
  const { addManager, updateManager } = useBrokerCompanyManagerStore();
  console.log('manager :', manager);
  
  // 폼 설정
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      name: manager?.name || '',      
      phoneNumber: manager?.phoneNumber || '',
      email: manager?.email || '',
      password: '', // 수정 시 비밀번호는 비워두고 변경할 때만 입력
      department: manager?.department || '',
      position: manager?.position || '',
      rank: manager?.rank || '',
      status: manager?.status || '활성',
      roles: manager?.roles || []
    },
  });
  
  // 전화번호 자동 하이픈 추가 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (data: ManagerFormValues, e?: React.BaseSyntheticEvent) => {
    // 기본 제출 동작 방지
    if (e) {
      e.preventDefault();
    }
    
    console.log('📝 폼 데이터 제출:', { 
      name: data.name,
      email: data.email,      
      roles: data.roles
    });
    
    // 수정 모드인 경우
    if (manager) {
      // 비밀번호가 입력되지 않은 경우 기존 비밀번호 유지
      const updatedManager: IBrokerCompanyManager = {
        ...manager,
        name: data.name,
        email: data.email || '',
        phoneNumber: data.phoneNumber,
        department: data.department || '',
        position: data.position || '',
        rank: data.rank || '',
        status: data.status,
        roles: data.roles,
      };
      
      // 비밀번호가 입력된 경우에만 업데이트
      if (data.password) {
        updatedManager.password = data.password;
      }
      
      onSubmit(updatedManager);
    } 
    // 신규 등록 모드인 경우
    else {
      const newManager: IBrokerCompanyManager = {
        id: uuidv4(), // 클라이언트에서 임시 ID 생성
        name: data.name,
        email: data.email || '',
        phoneNumber: data.phoneNumber,
        password: data.password || '',
        department: data.department || '',
        position: data.position || '',
        rank: data.rank || '',
        status: data.status,
        roles: data.roles,
        companyId: companyId,
        systemAccessLevel: 'broker_member' as SystemAccessLevel,
        registeredDate: new Date().toISOString() // 현재 날짜를 등록일로 설정
      };
      
      console.log('📤 폼에서 생성된 신규 담당자 데이터:', {
        name: newManager.name,
        email: newManager.email,
        roles: newManager.roles
      });
      
      onSubmit(newManager);
    }
  };
  
  return (
    <Form {...form}>
      <form id="manager-form" onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링 방지
        console.log('담당자 폼 제출 이벤트 발생, 기본 동작 및 버블링 방지');
        form.handleSubmit(handleSubmit)(e);
      }} className="space-y-6">
        {globalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}
        
        {/* 필수 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">필수 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 이름 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">이름 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="홍길동" 
                      className="h-10" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 연락처 */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">연락처 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="010-0000-0000" 
                      className="h-10"
                      onChange={(e) => {
                        field.onChange(formatPhoneNumber(e.target.value));
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* 역할 선택 - 칩 형태로 변경 */}
          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">역할 *</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MANAGER_ROLES.map((role) => (
                    <Badge
                      key={role}
                      variant={field.value?.includes(role) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-3 h-8 rounded-full text-sm font-medium transition-all duration-200",
                        field.value?.includes(role)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-secondary hover:text-secondary-foreground"
                      )}
                      onClick={() => {
                        const updatedRoles = field.value?.includes(role)
                          ? field.value?.filter((value) => value !== role)
                          : [...(field.value || []), role];
                        field.onChange(updatedRoles);
                      }}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 로그인 활성화 상태 */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">로그인 활성화</FormLabel>
                  <FormDescription className="text-xs text-gray-500">
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
        
        {/* 부가 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">부가 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 부서 */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">부서</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예: 영업팀" 
                      className="h-10"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 직책 */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">직책</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예: 대리" 
                      className="h-10"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 직급 */}
            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">직급</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="예: 사원" 
                      className="h-10"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* 계정 정보 섹션 - Accordion */}
        <Accordion 
          type="single" 
          collapsible 
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="w-full"
        >
          <AccordionItem value="account" className="border-none">
            <AccordionTrigger className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">계정 (선택)</span>
              {/* {accordionValue === 'account' ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )} */}
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 이메일 */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">이메일</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="hong@example.com" 
                            type="email" 
                            className="h-10"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* 비밀번호 */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {manager ? '새 비밀번호' : '비밀번호'}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder={manager ? "변경 시에만 입력하세요" : "비밀번호를 입력하세요"} 
                              type={showPassword ? "text" : "password"}
                              className="h-10 pr-10"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                  미입력 시 로그인 계정이 생성되지 않습니다.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* 하단 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 