//react
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

//ui
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface RegisterSuccessDialogProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  redirectTimeout?: number; // 자동 리디렉션 시간 (ms)
}

export function RegisterSuccessDialog({ 
  isOpen, 
  orderId, 
  onClose, 
  redirectTimeout = 5000 // 기본 5초 후 리디렉션
}: RegisterSuccessDialogProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(Math.floor(redirectTimeout / 1000));
  
  // 리디렉션 카운트다운 처리
  useEffect(() => {
    if (!isOpen) return;
    
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    
    // 카운트다운 타이머
    countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // 리디렉션 타이머
    timer = setTimeout(() => {
      handleGoToList();
    }, redirectTimeout);
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [isOpen, redirectTimeout]);
  
  // 목록으로 이동
  const handleGoToList = () => {
    console.log('handleGoToList');
    router.push('/broker/order-ver01/list');
    onClose();
  };
  
  // 상세 화면으로 이동
  // const handleViewDetail = () => {
  //   router.push(`/order/${orderId}`);
  //   onClose();
  // };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            화물 등록 완료
          </DialogTitle>
          <DialogDescription className="text-center">
            화물이 성공적으로 등록되었습니다.
            <br />
            <span className="font-medium">{countdown}초</span> 후 상세 화면으로 이동합니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4">
          <div className="bg-muted px-4 py-2 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">
              등록된 화물 ID
            </div>
            <div className="font-mono text-primary">
              {orderId}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoToList}
          >
            목록으로
          </Button>
          {/* <Button
            type="button"
            onClick={handleViewDetail}
          >
            상세 보기
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 