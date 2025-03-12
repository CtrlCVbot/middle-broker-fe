import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrokerRegisterLocationFormProps {
  control: Control<any>;
  prefix: "departure" | "destination";
  label: string;
}

export function BrokerRegisterLocationForm({
  control,
  prefix,
  label,
}: BrokerRegisterLocationFormProps) {
  // 시간 옵션 생성 (30분 간격)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <div className="space-y-4">
      {/* 주소 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <FormField
            control={control}
            name={`${prefix}.address`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>주소</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="주소 입력" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      // 주소 검색 기능 (실제 구현 시 Daum 주소 API 등 사용)
                      alert("주소 검색 기능은 실제 구현 시 추가됩니다.");
                    }}
                  >
                    검색
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* 상세 주소 */}
        <div className="md:col-span-1">
          <FormField
            control={control}
            name={`${prefix}.detailedAddress`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 주소</FormLabel>
                <FormControl>
                  <Input placeholder="상세 주소" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* 담당자 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 담당자명 */}
        <FormField
          control={control}
          name={`${prefix}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>담당자명</FormLabel>
              <FormControl>
                <Input placeholder="담당자명 입력" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 업체명 */}
        <FormField
          control={control}
          name={`${prefix}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>업체명</FormLabel>
              <FormControl>
                <Input placeholder="업체명 입력" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 연락처 */}
        <FormField
          control={control}
          name={`${prefix}.contact`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>연락처</FormLabel>
              <FormControl>
                <Input placeholder="연락처 입력" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 날짜 및 시간 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 날짜 */}
        <FormField
          control={control}
          name={`${prefix}.date`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{label === "출발지" ? "상차" : "하차"} 날짜</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP", { locale: ko })
                      ) : (
                        <span>날짜 선택</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(
                        date ? format(date, "yyyy-MM-dd") : undefined
                      )
                    }
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 시간 */}
        <FormField
          control={control}
          name={`${prefix}.time`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label === "출발지" ? "상차" : "하차"} 시간</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="시간 선택" />
                    <Clock className="h-4 w-4 opacity-50" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
} 