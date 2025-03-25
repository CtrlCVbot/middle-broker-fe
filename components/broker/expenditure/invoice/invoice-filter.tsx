'use client';

import { useState } from "react";
import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Filter, Search } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

export const InvoiceFilter = () => {
  const { filter, updateFilter } = useInvoiceStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      startDate: filter.dateRange?.start || "",
      endDate: filter.dateRange?.end || "",
      status: filter.status || "WAITING"
    }
  });

  const handleSearch = () => {
    // 통합 검색: 세금계산서 번호, 사업자번호, 운송사명, 공급가액 중 하나에 포함된 경우 검색
    updateFilter({
      searchTerm
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterSubmit = (data: any) => {
    updateFilter({
      dateRange: {
        start: data.startDate || undefined,
        end: data.endDate || undefined,
      },
      status: data.status
    });
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between space-x-2 mb-4">
      <div className="flex items-center space-x-2 w-full max-w-sm">
        <Input
          placeholder="세금계산서번호, 사업자번호, 운송사명, 공급가액 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="max-w-xs"
        />
        <Button variant="outline" size="icon" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFilterSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>시작일</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>종료일</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상태</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WAITING">정산 대기</SelectItem>
                        <SelectItem value="MATCHING">정산 대사</SelectItem>
                        <SelectItem value="COMPLETED">정산 완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset({
                      startDate: "",
                      endDate: "",
                      status: "WAITING"
                    });
                    updateFilter({
                      dateRange: undefined,
                      status: "WAITING"
                    });
                    setOpen(false);
                  }}
                >
                  초기화
                </Button>
                <Button type="submit">적용</Button>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 