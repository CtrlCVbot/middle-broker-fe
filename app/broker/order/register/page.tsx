"use client";

import { useState } from "react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList,
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

import { BrokerOrderRegisterForm } from "@/components/broker/order/broker-register-form";
import { BrokerOrderRegisterSummary } from "@/components/broker/order/broker-register-summary";

import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function BrokerOrderRegisterPage() {
  const [openSummary, setOpenSummary] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // 등록 완료 후 처리
  const handleRegisterSuccess = () => {
    toast({
      title: "중개 화물 등록 완료",
      description: "중개 화물이 성공적으로 등록되었습니다.",
      variant: "default",
    });
    
    // 화물 리스트 페이지로 이동
    router.push("/broker/order/list");
  };
  
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">                  
                  홈
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/broker">                  
                  운송 중개
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>화물 등록</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main className="flex flex-1 flex-col p-4 pt-0">
        <div className="container">
          <div className="flex flex-col space-y-4">
            {/* 화물 등록 타이틀 */}
            {/*
            <Card className="w-full">
              <CardHeader>
                <CardTitle>중개 화물 등록</CardTitle>
                <CardDescription>
                  중개할 화물 정보를 입력하고 등록해주세요.
                </CardDescription>
              </CardHeader>
            </Card>
            */}
            <BrokerOrderRegisterForm onSubmit={() => setOpenSummary(true)} />
          </div>
        </div>
        
        {/* 최종 확인 모달 */}
        <BrokerOrderRegisterSummary 
          open={openSummary}
          onOpenChange={setOpenSummary}
          onConfirm={handleRegisterSuccess}
        />
      </main>
    </>
  );
} 