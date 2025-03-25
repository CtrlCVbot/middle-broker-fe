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
import { AlertTriangle, Check, Plus, Trash2, Search, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CargoSearchDialog } from "./cargo-search-dialog";

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

interface CargoFilter {
  startDate: string;
  endDate: string;
  businessNumber: string;
  driverName: string;
}

type SheetMode = 'CREATE' | 'MATCH';

export const InvoiceMatchingSheet = () => {
  const {
    selectedInvoice,
    isMatchingSheetOpen,
    setMatchingSheetOpen,
    matchedCargos,
    setMatchedCargos,
    getTotalMatchedAmount,
    getAmountDifference,
    mode,
    setMode
  } = useInvoiceStore();

  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [availableCargos, setAvailableCargos] = useState<ICargo[]>([]);
  const [cargoFilter, setCargoFilter] = useState<CargoFilter>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    businessNumber: '',
    driverName: ''
  });
  
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
  
  // mode 변경 확인용 useEffect
  useEffect(() => {
    console.log('Current mode:', mode);
  }, [mode]);
  
  // 세금계산서가 변경될 때 해당 사업자번호에 맞는 화물 자동 매칭
  useEffect(() => {
    if (selectedInvoice && matchedCargos.length === 0) {
      const autoMatchCargos = availableCargos
        .filter(cargo => cargo.businessNumber === selectedInvoice.businessNumber)
        .slice(0, 3);
      
      if (autoMatchCargos.length > 0) {
        setMatchedCargos(autoMatchCargos);
      }
    }
  }, [selectedInvoice, availableCargos, matchedCargos.length, setMatchedCargos]);

  const handleFilterChange = (key: keyof CargoFilter, value: string) => {
    setCargoFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // TODO: API 호출로 변경
    const filtered = availableCargos.filter(cargo => {
      const matchesBusinessNumber = !cargoFilter.businessNumber || 
        cargo.businessNumber.includes(cargoFilter.businessNumber);
      const matchesDriverName = !cargoFilter.driverName || 
        cargo.carNumber.includes(cargoFilter.driverName);
      // TODO: 날짜 필터링 추가
      return matchesBusinessNumber && matchesDriverName;
    });
    setAvailableCargos(filtered);
  };

  const filteredCargos = availableCargos.filter(cargo => {
    const businessNumber = selectedInvoice ? 
      selectedInvoice.businessNumber : 
      form.watch('businessNumber');
      
    return (!businessNumber || cargo.businessNumber === businessNumber) &&
      !matchedCargos.some(matched => matched.id === cargo.id);
  });

  const handleCargoSelect = (cargo: ICargo) => {
    setMatchedCargos([...matchedCargos, cargo]);
  };

  const handleCargoRemove = (cargoId: string) => {
    setMatchedCargos(matchedCargos.filter(c => c.id !== cargoId));
  };

  const amountDifference = getAmountDifference();
  const hasAmountMismatch = amountDifference !== 0;

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setCargoFilter({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        businessNumber: '',
        driverName: ''
      });
      form.reset();
      setMatchedCargos([]);
    }
    setMatchingSheetOpen(open);
  };

  const handleModeChange = (newMode: SheetMode) => {
    setMode(newMode);
    if (newMode === 'CREATE') {
      setMatchedCargos([]);
      form.reset();
    }
  };

  const onSubmit = (values: InvoiceFormValues) => {
    console.log(values);
    // TODO: 세금계산서 생성 및 저장 로직
    setMode('MATCH');
  };

  const handleTransferToMatching = () => {
    // TODO: 정산 대사로 전환 로직 구현
    setMatchingSheetOpen(false);
  };

  const handleSearchDialogSelect = (selectedCargos: ICargo[]) => {
    const newCargos = [...matchedCargos, ...selectedCargos];
    setMatchedCargos(newCargos);
  };

  return (
    <>
      <Sheet open={isMatchingSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="p-4 w-full sm:max-w-[720px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl">
              {mode === 'CREATE' ? '세금계산서 수기 등록' : '세금계산서 매칭'}
            </SheetTitle>
            <SheetDescription>
              {mode === 'CREATE'
                ? '세금계산서 정보를 입력하고 매칭할 화물을 선택하세요.'
                : '선택한 세금계산서와 매칭할 화물을 선택하세요.'}
            </SheetDescription>
          </SheetHeader>

          {/* 현재 모드 디버그 표시 (개발 중에만 사용) - 주석없애지 말자! */}
          {/*{process.env.NODE_ENV === 'development' && (
            <div className="bg-muted p-2 mb-4 rounded text-sm">
              <p>Debug - Current Mode: <strong>{mode}</strong></p>
            </div>
          )}*/}

          {/* 세금계산서 정보 요약 (선택된 세금계산서가 있을 경우) */}
          {selectedInvoice && mode === 'MATCH' && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-muted-foreground text-sm">운송사명</Label>
                        <div className="font-medium">{selectedInvoice.supplierName}</div>
                      </div>
                      <div className="text-right">
                        <Label className="text-muted-foreground text-sm">사업자번호</Label>
                        <div className="font-medium">{selectedInvoice.businessNumber}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">세금계산서 번호</Label>
                    <div className="font-medium truncate" title={selectedInvoice.taxId}>{selectedInvoice.taxId}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">작성일</Label>
                    <div className="font-medium">{selectedInvoice.issueDate}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 세금계산서 정보 입력 폼 (신규 생성 시) */}
          {mode === 'CREATE' && (
            <div className="mb-4 border-2 border-primary/10 rounded-md p-4 bg-primary/5">
              <h3 className="text-base font-semibold mb-4">세금계산서 정보 입력</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                </form>
              </Form>
            </div>
          )}
          
          <Separator className="my-4" />

          

          {/* 화물 매칭 섹션 */}
          <div className="mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">화물 매칭</h3>
               {matchedCargos.length > 0 && (
                  <Badge variant="outline">
                    총 {matchedCargos.length}건
                  </Badge>
               )}
              <Button onClick={() => setIsSearchDialogOpen(true)}>
                <Search className="h-4 w-4 mr-2" />
                화물 검색
              </Button>
            </div>

            {/* 매칭된 화물 목록 */}
            {matchedCargos.length > 0 && (
              <div>                
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
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
              </div>
            )}
          </div>

          {/* 하단 금액 정보 및 액션 버튼 */}
          <div className="sticky bottom-0 bg-background pt-4 border-t">
            {matchedCargos.length > 0 && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/50 border">
                  <CardContent className="py-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">공급가액</div>
                        <div className="font-medium">
                          <AmountDisplay amount={selectedInvoice?.supplyAmount || 0} />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">매칭된 화물</div>
                        <div className="font-medium">
                          <AmountDisplay amount={getTotalMatchedAmount()} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "border",
                  hasAmountMismatch ? "bg-destructive/10 border-destructive/50" : "bg-success/10 border-success/50"
                )}>
                  <CardContent className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">차액</div>
                        <div className="font-medium">
                          <AmountDisplay amount={amountDifference} showSign />
                        </div>
                      </div>
                      {!hasAmountMismatch && (
                        <div className="bg-success/20 text-success p-1.5 rounded-full">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                      {hasAmountMismatch && (
                        <div className="bg-destructive/20 text-destructive p-1.5 rounded-full">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              {mode === 'CREATE' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setMatchingSheetOpen(false)}
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    저장
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setMatchingSheetOpen(false)}
                  >
                    취소
                  </Button>
                  <Button 
                    disabled={matchedCargos.length === 0 || hasAmountMismatch}
                    onClick={handleTransferToMatching}
                  >
                    정산 대사로 전환
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CargoSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onSelect={handleSearchDialogSelect}
        excludeCargoIds={matchedCargos.map(cargo => cargo.id)}
      />
    </>
  );
}; 