'use client';

import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmountDisplay } from "../shared/amount-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ICargo } from "@/types/broker/expenditure";
import { useEffect, useState } from "react";
import { generateMockCargos } from "@/utils/mockdata/mock-invoices";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { AlertTriangle, Check, Plus, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface InvoiceFormValues {
  businessNumber: string;
  supplierName: string;
  representative: string;
  issueDate: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  bankName: string;
  accountNumber: string;
  issueType: 'ELECTRONIC' | 'MANUAL' | 'POSTAL';
  memo: string;
}

export const InvoiceMatchingSheet = () => {
  const {
    selectedInvoice,
    isMatchingSheetOpen,
    setMatchingSheetOpen,
    matchedCargos,
    setMatchedCargos,
    getTotalMatchedAmount,
    getAmountDifference
  } = useInvoiceStore();

  const [cargoFilter, setCargoFilter] = useState("");
  
  // 목업 데이터 - 실제로는 API에서 가져올 것
  const [availableCargos, setAvailableCargos] = useState<ICargo[]>([]);
  
  // React Hook Form 설정
  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      businessNumber: "",
      supplierName: "",
      representative: "",
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      supplyAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      bankName: "",
      accountNumber: "",
      issueType: 'MANUAL',
      memo: ""
    }
  });

  // 세액 자동 계산
  useEffect(() => {
    const supplyAmount = form.watch('supplyAmount') || 0;
    const calculatedTax = Math.floor(supplyAmount * 0.1);
    form.setValue('taxAmount', calculatedTax);
    form.setValue('totalAmount', supplyAmount + calculatedTax);
  }, [form.watch('supplyAmount')]);

  // 컴포넌트 마운트 시 목업 데이터 로드
  useEffect(() => {
    setAvailableCargos(generateMockCargos(20));
  }, []);
  
  // 세금계산서가 변경될 때 해당 사업자번호에 맞는 화물 자동 매칭
  useEffect(() => {
    if (selectedInvoice && matchedCargos.length === 0) {
      // 선택된 세금계산서와 사업자번호가 일치하는 화물을 최대 3개까지 자동 매칭
      const autoMatchCargos = availableCargos
        .filter(cargo => cargo.businessNumber === selectedInvoice.businessNumber)
        .slice(0, 3);
      
      if (autoMatchCargos.length > 0) {
        setMatchedCargos(autoMatchCargos);
      }
    }
  }, [selectedInvoice, availableCargos, matchedCargos.length, setMatchedCargos]);

  const filteredCargos = availableCargos.filter(cargo => {
    // 세금계산서 생성 모드에서는 현재 입력된 사업자번호로 필터링
    const businessNumber = selectedInvoice ? 
      selectedInvoice.businessNumber : 
      form.watch('businessNumber');
      
    return (!businessNumber || cargo.businessNumber === businessNumber) &&
      !matchedCargos.some(matched => matched.id === cargo.id) &&
      (cargoFilter ? 
        cargo.carNumber.includes(cargoFilter) || 
        cargo.id.includes(cargoFilter)
        : true
      );
  });

  const handleCargoSelect = (cargo: ICargo) => {
    setMatchedCargos([...matchedCargos, cargo]);
  };

  const handleCargoRemove = (cargoId: string) => {
    setMatchedCargos(matchedCargos.filter(c => c.id !== cargoId));
  };

  const amountDifference = getAmountDifference();
  const hasAmountMismatch = amountDifference !== 0;

  // 시트가 닫힐 때 필터 초기화
  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setCargoFilter("");
      form.reset();
    }
    setMatchingSheetOpen(open);
  };

  // 폼 제출 처리
  const onSubmit = (values: InvoiceFormValues) => {
    console.log(values);
    // TODO: 세금계산서 생성 및 저장 로직
    setMatchingSheetOpen(false);
  };

  const handleTransferToMatching = () => {
    // TODO: 정산 대사로 전환 로직 구현
    setMatchingSheetOpen(false);
  };

  return (
    <Sheet open={isMatchingSheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="p-4 w-full sm:max-w-[720px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">{selectedInvoice ? '세금계산서 매칭' : '세금계산서 수기 등록'}</SheetTitle>
          <SheetDescription>
            {selectedInvoice 
              ? '화물을 매칭하여 정산 대사로 전환합니다.' 
              : '세금계산서 정보를 입력하고 화물을 매칭합니다.'}
          </SheetDescription>
        </SheetHeader>

        
        {/* 세금계산서 정보 요약 (선택된 세금계산서가 있을 경우) */}
        {selectedInvoice && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <Label className="text-muted-foreground text-sm">운송사명</Label>
                  <div className="font-medium">{selectedInvoice.supplierName}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">사업자번호</Label>
                  <div className="font-medium">{selectedInvoice.businessNumber}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">세금계산서 번호</Label>
                  <div className="font-medium">{selectedInvoice.taxId}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">작성일</Label>
                  <div className="font-medium">{selectedInvoice.issueDate}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">공급가액</Label>
                  <div className="font-medium"><AmountDisplay amount={selectedInvoice.supplyAmount || 0} /></div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">세액</Label>
                  <div className="font-medium"><AmountDisplay amount={selectedInvoice.taxAmount || 0} /></div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground text-sm">합계금액</Label>
                  <div className="font-medium text-lg"><AmountDisplay amount={selectedInvoice.totalAmount || 0} size="lg" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 세금계산서 정보 입력 (신규 생성 시) */}
        {!selectedInvoice && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessNumber"
                  rules={{ 
                    required: "사업자번호를 입력하세요",
                    pattern: {
                      value: /^\d{3}-\d{2}-\d{5}$|^\d{10}$/,
                      message: "유효한 사업자번호 형식이 아닙니다"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사업자번호</FormLabel>
                      <FormControl>
                        <Input placeholder="000-00-00000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supplierName"
                  rules={{ required: "운송사명을 입력하세요" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>운송사명</FormLabel>
                      <FormControl>
                        <Input placeholder="운송사명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="representative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대표자</FormLabel>
                      <FormControl>
                        <Input placeholder="대표자명 입력" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="issueDate"
                  rules={{ required: "작성일을 선택하세요" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>작성일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supplyAmount"
                  rules={{ required: "공급가액을 입력하세요" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>공급가액</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>세액</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>공급가액의 10%로 자동 계산됩니다</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>은행명</FormLabel>
                        <FormControl>
                          <Input placeholder="은행명 입력" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem className="flex-[2]">
                        <FormLabel>계좌번호</FormLabel>
                        <FormControl>
                          <Input placeholder="계좌번호 입력" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="issueType"
                  rules={{ required: "발행유형을 선택하세요" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>발행유형</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="발행유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ELECTRONIC">전자</SelectItem>
                          <SelectItem value="MANUAL">수기</SelectItem>
                          <SelectItem value="POSTAL">우편</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>합계금액</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>공급가액 + 세액</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>메모</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="추가 정보를 입력하세요"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="hidden">
                <Button type="submit">세금계산서 생성</Button>
              </div>
            </form>
          </Form>
        )}
        
        <Separator className="my-6" />

        {/* 금액 불일치 경고 */}
        {selectedInvoice && hasAmountMismatch && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription className="flex items-center justify-between">
              <span>세금계산서 금액과 매칭된 화물의 총액이 일치하지 않습니다.</span>
              <Badge variant="outline" className="ml-2 font-semibold">
                차액: <AmountDisplay amount={amountDifference} showSign />
              </Badge>
            </AlertDescription>
          </Alert>
        )}

        {/* 화물 검색 */}
        <div className="mb-4">
          <h3 className="text-base font-semibold mb-2">화물 매칭</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="차량번호 또는 화물번호로 검색"
              className="pl-10"
              value={cargoFilter}
              onChange={(e) => setCargoFilter(e.target.value)}
            />
          </div>
        </div>

        {/* 매칭 가능한 화물 목록 */}
        <div className="mb-6 border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[30%]">화물번호</TableHead>
                <TableHead className="w-[30%]">차량번호</TableHead>
                <TableHead className="w-[25%] text-right">배차금</TableHead>
                <TableHead className="w-[15%] text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCargos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    매칭 가능한 화물이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredCargos.map((cargo) => (
                  <TableRow key={cargo.id}>
                    <TableCell className="font-medium">{cargo.id}</TableCell>
                    <TableCell>{cargo.carNumber}</TableCell>
                    <TableCell className="text-right">
                      <AmountDisplay amount={cargo.dispatchAmount} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCargoSelect(cargo)}
                        className="h-8 px-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        추가
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 매칭된 화물 목록 */}
        {matchedCargos.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold">매칭된 화물</h3>
              <Badge variant="outline">
                총 {matchedCargos.length}건
              </Badge>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[30%]">화물번호</TableHead>
                    <TableHead className="w-[30%]">차량번호</TableHead>
                    <TableHead className="w-[25%] text-right">배차금</TableHead>
                    <TableHead className="w-[15%] text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchedCargos.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell className="font-medium">{cargo.id}</TableCell>
                      <TableCell>{cargo.carNumber}</TableCell>
                      <TableCell className="text-right">
                        <AmountDisplay amount={cargo.dispatchAmount} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCargoRemove(cargo.id)}
                          className="h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          제거
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 합계 및 액션 버튼 */}
        <div className="space-y-4">
          {matchedCargos.length > 0 && (
            <Card className="bg-muted/50 border">
              <CardContent className="py-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">매칭 총액</div>
                  <div className="text-lg font-semibold">
                    <AmountDisplay amount={getTotalMatchedAmount()} size="lg" />
                  </div>
                </div>
                
                {selectedInvoice && !hasAmountMismatch && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-green-100 text-green-800 p-1.5 rounded-full">
                          <Check className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>금액이 일치합니다</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMatchingSheetOpen(false)}>
              취소
            </Button>
            
            {selectedInvoice ? (
              <Button 
                disabled={matchedCargos.length === 0}
                onClick={handleTransferToMatching}
              >
                정산 대사로 전환
              </Button>
            ) : (
              <Button 
                disabled={matchedCargos.length === 0}
                onClick={form.handleSubmit(onSubmit)}
              >
                세금계산서 생성
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}; 