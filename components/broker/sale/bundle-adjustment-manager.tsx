"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react";
import { toast } from "sonner";

// 타입
import { 
  ISalesBundleAdjustment,
  ICreateBundleAdjustmentInput,
  IUpdateBundleAdjustmentInput,
  BundleAdjType
} from "@/types/broker-charge";

// 스토어
import { useBrokerChargeStore } from "@/store/broker-charge-store";

// 유틸
import { formatCurrency } from "@/lib/utils";

interface IBundleAdjustmentManagerProps {
  bundleId?: string;
  isEditMode?: boolean;
}

interface IAdjustmentFormData {
  type: BundleAdjType;
  description: string;
  amount: string;
  taxAmount: string;
}

const initialFormData: IAdjustmentFormData = {
  type: 'surcharge',
  description: '',
  amount: '',
  taxAmount: ''
};

export function BundleAdjustmentManager({
  bundleId,
  isEditMode = false
}: IBundleAdjustmentManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IAdjustmentFormData>(initialFormData);
  
  const {
    bundleAdjustments,
    adjustmentsLoading,
    adjustmentsError,
    fetchBundleAdjustments,
    addBundleAdjustment,
    editBundleAdjustment,
    removeBundleAdjustment
  } = useBrokerChargeStore();

  // 정산 대사 모드에서 통합 추가금 로딩
  useEffect(() => {
    if (isEditMode && bundleId) {
      fetchBundleAdjustments(bundleId);
    }
  }, [isEditMode, bundleId, fetchBundleAdjustments]);

  const handleOpenDialog = (adjustment?: ISalesBundleAdjustment) => {
    if (adjustment) {
      setEditingId(adjustment.id);
      setFormData({
        type: adjustment.type,
        description: adjustment.description || '',
        amount: adjustment.amount.toString(),
        taxAmount: adjustment.taxAmount.toString()
      });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!bundleId) {
      toast.error('정산 ID가 필요합니다.');
      return;
    }

    const amount = parseFloat(formData.amount);
    const taxAmount = parseFloat(formData.taxAmount) || 0;

    if (isNaN(amount) || amount <= 0) {
      toast.error('유효한 금액을 입력해주세요.');
      return;
    }

    try {
      if (editingId) {
        // 수정
        const updateData: IUpdateBundleAdjustmentInput = {
          type: formData.type,
          description: formData.description || undefined,
          amount,
          taxAmount
        };
        
        const success = await editBundleAdjustment(bundleId, editingId, updateData);
        if (success) {
          toast.success('통합 추가금이 수정되었습니다.');
          handleCloseDialog();
        } else {
          toast.error('통합 추가금 수정에 실패했습니다.');
        }
      } else {
        // 생성
        const createData: ICreateBundleAdjustmentInput = {
          type: formData.type,
          description: formData.description || undefined,
          amount,
          taxAmount
        };
        
        const success = await addBundleAdjustment(bundleId, createData);
        if (success) {
          toast.success('통합 추가금이 추가되었습니다.');
          handleCloseDialog();
        } else {
          toast.error('통합 추가금 추가에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('통합 추가금 처리 중 오류:', error);
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (adjustmentId: string) => {
    if (!bundleId) return;
    
    if (confirm('정말로 이 추가금을 삭제하시겠습니까?')) {
      try {
        const success = await removeBundleAdjustment(bundleId, adjustmentId);
        if (success) {
          toast.success('통합 추가금이 삭제되었습니다.');
        } else {
          toast.error('통합 추가금 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('통합 추가금 삭제 중 오류:', error);
        toast.error('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 정산 대기 모드에서는 표시하지 않음
  if (!isEditMode) {
    return null;
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md mt-4">
        <div className="flex items-center justify-between p-2 bg-muted/50">
          <h3 className="text-sm font-semibold">통합 정산 추가금 ({bundleAdjustments.length}개)</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              <span className="sr-only">토글 추가금 목록</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <ScrollArea className="h-36 rounded-b-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-xs">번호</TableHead>
                  <TableHead className="text-xs">구분</TableHead>
                  <TableHead className="text-xs">설명</TableHead>
                  <TableHead className="text-right text-xs">금액</TableHead>
                  <TableHead className="text-right text-xs">세금</TableHead>
                  <TableHead className="text-center text-xs">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center text-xs">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : bundleAdjustments.length > 0 ? (
                  bundleAdjustments.map((adjustment, index) => (
                    <TableRow key={adjustment.id}>
                      <TableCell className="text-xs">{index + 1}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={adjustment.type === 'surcharge' ? 'default' : 'secondary'}>
                          {adjustment.type === 'surcharge' ? '추가' : '할인'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{adjustment.description || '-'}</TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(adjustment.amount)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(adjustment.taxAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(adjustment);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(adjustment.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center text-xs">
                      추가금이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog();
            }}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <Plus className="h-3 w-3" />
              <span>추가</span>
            </div>
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? '통합 추가금 수정' : '통합 추가금 추가'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">구분</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: BundleAdjType) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="구분 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surcharge">추가 요금</SelectItem>
                      <SelectItem value="discount">할인</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Input
                    id="description"
                    placeholder="추가금 설명 (선택사항)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">세금</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    placeholder="0"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseDialog();
                  }}
                >
                  취소
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit();
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? '수정' : '추가'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
} 