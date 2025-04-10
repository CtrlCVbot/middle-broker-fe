"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IAddress } from "@/types/address";

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
  onConfirm,
}: IAddressDeleteModalProps) {
  // 선택된 주소가 없거나 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen || addresses.length === 0) return null;

  const renderTitle = () => {
    return addresses.length === 1
      ? "주소 삭제"
      : `주소 일괄 삭제 (${addresses.length}개)`;
  };

  const renderDescription = () => {
    return addresses.length === 1
      ? `'${addresses[0].name}' 주소를 정말 삭제하시겠습니까?`
      : `선택한 ${addresses.length}개의 주소를 모두 삭제하시겠습니까?`;
  };

  const getAddressDisplay = (address: IAddress) => {
    return `${address.name} (${address.roadAddress}${address.detailAddress ? `, ${address.detailAddress}` : ''})`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{renderTitle()}</DialogTitle>
          <DialogDescription>{renderDescription()}</DialogDescription>
        </DialogHeader>

        {addresses.length > 1 && (
          <div className="max-h-[200px] overflow-y-auto text-sm">
            <p className="font-bold mb-2">삭제할 주소 목록:</p>
            <ul className="pl-4 space-y-1">
              {addresses.map((address) => (
                <li key={address.id}>• {getAddressDisplay(address)}</li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}