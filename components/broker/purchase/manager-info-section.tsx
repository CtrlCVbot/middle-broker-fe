import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Search, CheckCircle, Phone, Mail } from 'lucide-react';

export interface IManagerInfoSectionProps {
  form: any;
  managerSearchTerm: string;
  setManagerSearchTerm: (v: string) => void;
  managers: any[];
  onSelectManager: (manager: any) => void;
  selectedManagerId: string | null;
  onReset: () => void;
  onManagerSearch: () => void;
  isEditMode?: boolean;
  loading?: boolean;
  isLoadingManagers?: boolean;
  companySelected: boolean;
}

export function ManagerInfoSection({
  form,
  managerSearchTerm,
  setManagerSearchTerm,
  managers,
  onSelectManager,
  selectedManagerId,
  onReset,
  onManagerSearch,
  isEditMode,
  loading,
  isLoadingManagers,
  companySelected
}: IManagerInfoSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">담당자 정보</h3>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={loading}>초기화</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {companySelected && managers.filter((m: any) => m.status === '활성').map((manager) => (
          <Badge
            key={manager.id}
            variant="outline"
            className="cursor-pointer hover:bg-secondary px-2 py-1 text-xs"
            onClick={() => onSelectManager(manager)}
          >
            {manager.name}
          </Badge>
        ))}
        {/* {!companySelected && (
          <div className="text-xs text-muted-foreground py-1">
            {isEditMode ? '회사 정보가 설정되지 않았습니다' : '먼저 회사를 선택해주세요'}
          </div>
        )} */}
      </div>
      {(!form.watch('manager') || form.watch('manager') === '김중개') ? (
        <div className="flex flex-col items-center justify-center py-4 border-5 border-dashed rounded-md bg-muted/30 mb-2">
          <User className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            {!companySelected ? '먼저 회사를 선택해주세요' : '담당자 정보를 입력해주세요'}
          </p>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" disabled={!companySelected}>
                  <Search className="h-4 w-4 mr-2" /> 담당자 조회
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="border-b p-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="담당자명 검색"
                      className="h-8"
                      type="search"
                      value={managerSearchTerm}
                      onChange={e => setManagerSearchTerm(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          onManagerSearch();
                        }
                      }}
                    />
                    <Button size="sm" className="h-8 px-2" onClick={onManagerSearch}>검색</Button>
                  </div>
                </div>
                <ScrollArea className="h-60">
                  <div className="p-2">
                    {isLoadingManagers ? (
                      <div className="text-xs text-muted-foreground p-2">검색 중...</div>
                    ) : managers.filter((m: any) => m.status === '활성').length > 0 ? (
                      managers.filter((m: any) => m.status === '활성').map((manager) => (
                        <div
                          key={manager.id}
                          className="flex items-center justify-between px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer"
                          onClick={() => onSelectManager(manager)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{manager.name}</span>
                            <span className="text-xs text-muted-foreground">{manager.phoneNumber}</span>
                            <span className="text-xs text-muted-foreground">{manager.roles?.join(', ')}</span>
                          </div>
                          {manager.id === selectedManagerId && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground p-2">담당자가 없습니다.</div>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between border p-4 rounded-md bg-background bg-muted/30">
            <div className="grid gap-2 grid-cols-1 w-full">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="담당자 이름을 입력해주세요."
                    className="h-9 pl-10"
                    value={form.watch('manager') || ''}
                    onChange={e => form.setValue('manager', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="010-0000-0000"
                    className="h-9 pl-10"
                    value={form.watch('managerContact') || ''}
                    onChange={e => form.setValue('managerContact', e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="example@email.com"
                    className="h-9 pl-10"
                    value={form.watch('managerEmail') || ''}
                    onChange={e => form.setValue('managerEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 