import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckIcon } from "lucide-react";

interface BrokerOrderAcceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  orderCount: number;
}

export function BrokerOrderAcceptModal({
  isOpen,
  onClose,
  onAccept,
  orderCount
}: BrokerOrderAcceptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>운송 수락 확인</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Alert>
            <CheckIcon className="h-4 w-4" />
            <AlertDescription>
              선택한 {orderCount}개의 화물에 대해 운송 수락을 진행하시겠습니까?
            </AlertDescription>
          </Alert>

          <div className="mt-4 text-sm text-muted-foreground">
            확인을 클릭하면 선택된 화물에 대한 운송 수락 처리가 진행됩니다.
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          <Button type="button" onClick={onAccept}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 