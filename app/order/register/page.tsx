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
import { Home } from "lucide-react";
import { OrderRegisterForm } from "@/components/order/register-form";
import { OrderRegisterSummary } from "@/components/order/register-summary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function OrderRegisterPage() {
  const [openSummary, setOpenSummary] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // 등록 완료 후 처리
  const handleRegisterSuccess = () => {
    toast({
      title: "화물 등록 완료",
      description: "화물이 성공적으로 등록되었습니다.",
      variant: "default",
    });
    
    // 화물 리스트 페이지로 이동
    router.push("/order/list");
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
                <CardTitle>화물 등록</CardTitle>
                <CardDescription>
                  운송할 화물 정보를 입력하고 등록해주세요.
                </CardDescription>
              </CardHeader>
            </Card>
            */}
            <OrderRegisterForm onSubmit={() => setOpenSummary(true)} />
          </div>
        </div>
        
        {/* 최종 확인 모달 */}
        <OrderRegisterSummary 
          open={openSummary}
          onOpenChange={setOpenSummary}
          onConfirm={handleRegisterSuccess}
        />
      </main>
    </>
  );
} 