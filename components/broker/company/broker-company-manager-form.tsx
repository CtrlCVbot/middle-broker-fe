"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { IBrokerCompanyManager } from '@/types/broker-company';
import { MANAGER_ROLES } from '@/utils/mockdata/mock-broker-company-managers';
import { useBrokerCompanyManagerStore } from '@/store/broker-company-manager-store';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface BrokerCompanyManagerFormProps {
  companyId: string;
  manager?: IBrokerCompanyManager;
  onComplete: () => void;
  onCancel: () => void;
}

// 담당자 등록/수정 폼 스키마 정의
const managerFormSchema = z.object({
  name: z.string().min(1, { message: '이름은 필수 입력 항목입니다.' }),
  managerId: z.string().min(4, { message: 'ID는 4자 이상이어야 합니다.' }),
  password: z.string().min(8, { message: '비밀번호는 8자리 이상이어야 합니다.' }).optional(),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  phoneNumber: z.string().min(1, { message: '연락처는 필수 입력 항목입니다.' }),
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
  onComplete, 
  onCancel 
}: BrokerCompanyManagerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { addManager, updateManager } = useBrokerCompanyManagerStore();
  
  // 폼 설정
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      name: manager?.name || '',
      managerId: manager?.managerId || '',
      password: '', // 수정 시 비밀번호는 비워두고 변경할 때만 입력
      email: manager?.email || '',
      phoneNumber: manager?.phoneNumber || '',
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
  const handleSubmit = async (data: ManagerFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // 수정 모드인 경우
      if (manager) {
        // 비밀번호가 입력되지 않은 경우 기존 비밀번호 유지
        const updatedManager: IBrokerCompanyManager = {
          ...manager,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          department: data.department,
          position: data.position,
          rank: data.rank,
          status: data.status,
          roles: data.roles,
        };
        
        // 비밀번호가 입력된 경우에만 업데이트
        if (data.password) {
          updatedManager.password = data.password;
        }
        
        await updateManager(updatedManager);
      } 
      // 신규 등록 모드인 경우
      else {
        const newManager = {
          managerId: data.managerId,
          password: data.password || 'password123', // 기본 비밀번호 설정
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          department: data.department,
          position: data.position,
          rank: data.rank,
          status: data.status,
          roles: data.roles,
          companyId: companyId
        };
        
        await addManager(newManager);
      }
      
      onComplete();
    } catch (error) {
      // 에러 메시지 설정
      const errorMessage = error instanceof Error 
        ? error.message 
        : '담당자 등록/수정 중 오류가 발생했습니다.';
      
      setFormError(errorMessage);
      console.error('담당자 등록/수정 중 오류가 발생했습니다.', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 이름 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름 *</FormLabel>
                <FormControl>
                  <Input placeholder="이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 로그인 ID */}
          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>로그인 ID *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="로그인 시 사용할 ID" 
                    {...field} 
                    disabled={!!manager} // 수정 모드에서는 ID 변경 불가
                  />
                </FormControl>
                {manager && (
                  <FormDescription>ID는 변경할 수 없습니다.</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* 비밀번호 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{manager ? '새 비밀번호' : '비밀번호 *'}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder={manager ? "변경 시에만 입력하세요" : "비밀번호를 입력하세요"} 
                    type={showPassword ? "text" : "password"}
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                {manager 
                  ? '비밀번호를 변경하지 않으려면 비워두세요.' 
                  : '8자 이상의 비밀번호가 필요합니다.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 이메일 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일 *</FormLabel>
                <FormControl>
                  <Input placeholder="이메일 주소" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 전화번호 */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연락처 *</FormLabel>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 부서 */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>부서</FormLabel>
                <FormControl>
                  <Input placeholder="부서명" {...field} />
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
                <FormLabel>직책</FormLabel>
                <FormControl>
                  <Input placeholder="직책" {...field} />
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
                <FormLabel>직급</FormLabel>
                <FormControl>
                  <Input placeholder="직급" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* 역할 선택 */}
        <FormField
          control={form.control}
          name="roles"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel>역할 *</FormLabel>
                <FormDescription>
                  담당자의 역할을 하나 이상 선택하세요
                </FormDescription>
              </div>
              <div className="flex flex-wrap gap-4">
                {MANAGER_ROLES.map((role) => (
                  <FormField
                    key={role}
                    control={form.control}
                    name="roles"
                    render={({ field }) => {
                      return (
                        <FormItem key={role} className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(role)}
                              onCheckedChange={(checked) => {
                                const updatedRoles = checked
                                  ? [...field.value, role]
                                  : field.value?.filter((value) => value !== role);
                                field.onChange(updatedRoles);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {role}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
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
        
        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {manager ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 