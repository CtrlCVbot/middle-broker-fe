"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrokerOrderRegisterForm } from "@/components/broker/order/broker-register-form";
import { BrokerEditConfirmDialog } from "@/components/broker/order/broker-edit-confirm-dialog";
import { useBrokerOrderEditStore } from "@/store/broker-order-edit-store";
import { updateBrokerOrder } from "@/utils/mockdata/mock-broker-order-edit";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBrokerOrderDetailById } from "@/utils/mockdata/mock-broker-orders-detail";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function BrokerOrderEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'cancel' | 'edit' | 'unsaved'>('cancel');
  const [isMounted, setIsMounted] = useState(false);
  const [orderId, setOrderIdLocal] = useState<string | null>(null);
  
  // 상태를 스토어에서 가져옵니다
  const {
    originalData,
    isLoading,
    isSaving,
    hasChanged,
    setSaving,
    setOrderId,
    setOriginalData,
    setLoading,
    setError,
    resetState,
    registerData
  } = useBrokerOrderEditStore();
  
  // URL 파라미터에서 ID를 추출합니다
  useEffect(() => {
    setIsMounted(true);
    if (params && 'id' in params) {
      const id = params.id as string;
      setOrderIdLocal(id);
      setOrderId(id);
    }
    
    return () => {
      // 언마운트 시 상태 초기화
      resetState();
    };
  }, [params, setOrderId, resetState]);
  
  // TanStack Query를 사용하여 화물 상세 정보 조회
  const { 
    data: orderData, 
    isLoading: isDataLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["brokerOrderDetail", orderId],
    queryFn: () => orderId ? getBrokerOrderDetailById(orderId) : Promise.reject("중개 화물 ID가 없습니다."),
    enabled: isMounted && !!orderId,
    staleTime: 1000 * 60 * 5, // 5분
  });
  
  // 데이터 로드 후 상태 업데이트
  useEffect(() => {
    setLoading(isDataLoading);
    
    if (isError && error instanceof Error) {
      setError(error.message);
      toast({
        title: "데이터 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } else if (orderData) {
      // 먼저 원본 데이터 설정
      setOriginalData(orderData);
      
      // 로딩 중 상태가 완료되었음을 표시
      setError(null);
      
      // 콘솔에 로그 출력 (디버깅용)
      console.log("원본 데이터 로드 완료:", orderData);
    }
  }, [orderData, isDataLoading, isError, error, setLoading, setOriginalData, setError, toast]);
  
  // 수정 완료 처리
  const handleEditComplete = async () => {
    // 아직 데이터가 로드되지 않았거나 ID가 없으면 처리하지 않음
    if (!originalData || !orderId) return;
    
    try {
      setSaving(true);
      
      // 목업 API를 사용하여 화물 정보 업데이트
      //const updatedData = await updateBrokerOrder(orderId, registerData);
      
      // 성공 메시지 표시
      toast({
        title: "중개 화물 수정 완료",
        description: `중개 화물 번호 ${orderId}의 정보가 성공적으로 수정되었습니다.`,
        variant: "default",
      });
      
      // 상세 정보 화면으로 이동
      router.push(`/broker/order/list`);
    } catch (error) {
      toast({
        title: "중개 화물 수정 실패",
        description: error instanceof Error ? error.message : "중개 화물 정보 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // 수정 취소 처리
  const handleCancelEdit = () => {
    setDialogOpen(false);
    resetState();
    router.push(`/broker/order/list`);
  };
  
  // 뒤로가기 처리
  // const handleGoBack = () => {
  //   if (hasChanged) {
  //     setDialogMode('unsaved');
  //     setDialogOpen(true);
  //   } else {
  //     router.push(`/broker/order/list`);
  //   }
  // };
  
  // 대화상자 확인 처리
  const handleDialogConfirm = () => {
    setDialogOpen(false);
    
    if (dialogMode === 'cancel' || dialogMode === 'unsaved') {
      handleCancelEdit();
    }
    // 다른 모드는 필요에 따라 추가
  };
  
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4 mr-1" />
                홈
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/broker">운송 중개</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbLink href="/broker/order/list">화물 관리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>화물 수정</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {originalData && (
          <span className="ml-2 text-sm font-medium">#{originalData.orderNumber}</span>
        )}
      </header>

      <main className="flex flex-1 flex-col p-4 pt-0">
        <div className="container">
          <div className="flex flex-col space-y-4">
            {/* 로딩 상태 표시 */}
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4 py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <div className="text-lg font-medium">중개 화물 정보를 불러오는 중...</div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* 화물 등록 폼 재사용 (editMode=true) */
              <BrokerOrderRegisterForm 
                onSubmit={handleEditComplete} 
                editMode={true}
                orderNumber={originalData?.orderNumber}
              />
            )}
            
            {/* 하단 버튼 영역 */}
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDialogMode('cancel');
                  setDialogOpen(true);
                }}
              >
                취소
              </Button>
              
              <Button 
                onClick={handleEditComplete}
                disabled={isSaving || !hasChanged || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "수정 완료"
                )}
              </Button>
            </div>
          </div>
          
          {/* 확인 대화상자 */}
          <BrokerEditConfirmDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onConfirm={handleDialogConfirm}
            mode={dialogMode}
            orderNumber={originalData?.orderNumber}
          />
        </div>
      </main>
    </>
  );
} 