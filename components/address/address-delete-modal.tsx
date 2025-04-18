"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { IAddress } from '@/types/address';
import { AlertTriangle, Trash2, LoaderCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface IAddressDeleteModalProps {
  isOpen: boolean;
  addresses: IAddress[];
  onClose: () => void;
  onConfirm: () => void;
}

export function AddressDeleteModal({
  isOpen,
  addresses,
  onClose,
  onConfirm
}: IAddressDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // 주소가 없거나 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen || addresses.length === 0) {
    return null;
  }

  // 주소 개수에 따라 제목 생성
  const getTitle = () => {
    return addresses.length > 1
      ? `${addresses.length}개 주소 삭제`
      : '주소 삭제';
  };

  // 주소 개수에 따라 설명 생성
  const getDescription = () => {
    return addresses.length > 1
      ? '선택한 주소를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      : `'${addresses[0].name}' 주소를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`;
  };

  // 주소 유형에 따른 레이블 생성
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'load':
        return '상차지';
      case 'drop':
        return '하차지';
      case 'any':
        return '상/하차지';
      default:
        return type;
    }
  };

  // 확인 클릭 핸들러
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {addresses.length > 1 && (
          <div className="py-2">
            <p className="text-sm font-medium mb-2">삭제할 주소 목록</p>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {addresses.map((address) => (
                  <div key={address.id} className="p-3 border rounded-md text-sm flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{address.name}</span>
                      <Badge variant={address.type === 'load' ? 'default' : 'secondary'}>
                        {getTypeLabel(address.type)}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs truncate">{address.roadAddress}</span>
                    {address.contactName && (
                      <span className="text-xs">담당자: {address.contactName}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className={cn("gap-2", isDeleting && "opacity-70")}
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {addresses.length > 1 ? `${addresses.length}개 삭제` : '삭제'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}