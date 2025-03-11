import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface EditConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  mode: 'cancel' | 'edit' | 'unsaved';
  orderNumber?: string;
}

export function EditConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  orderNumber = ''
}: EditConfirmDialogProps) {
  // 모드별 컨텐츠 렌더링
  const renderContent = () => {
    switch (mode) {
      case 'edit':
        return {
          title: '화물 수정',
          icon: null,
          description: `화물 번호 ${orderNumber}를 수정하시겠습니까? 배차 상태에 따라 일부 필드만 수정이 가능할 수 있습니다.`,
          confirmText: '수정하기',
          cancelText: '취소',
          iconClass: '',
        };
      
      case 'cancel':
        return {
          title: '수정 취소',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />,
          description: '화물 수정을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.',
          confirmText: '수정 취소',
          cancelText: '계속 수정',
          iconClass: 'text-amber-500',
        };
      
      case 'unsaved':
        return {
          title: '저장되지 않은 변경 사항',
          icon: <AlertTriangle className="h-5 w-5 text-destructive mr-2" />,
          description: '변경 사항이 저장되지 않습니다. 계속하시겠습니까?',
          confirmText: '계속 진행',
          cancelText: '돌아가기',
          iconClass: 'text-destructive',
        };
      
      default:
        return {
          title: '확인',
          icon: null,
          description: '계속 진행하시겠습니까?',
          confirmText: '확인',
          cancelText: '취소',
          iconClass: '',
        };
    }
  };
  
  const { title, icon, description, confirmText, cancelText, iconClass } = renderContent();
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            {icon}
            <span className={iconClass}>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 