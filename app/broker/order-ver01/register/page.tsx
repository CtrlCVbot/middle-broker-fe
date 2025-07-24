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

import { OrderRegisterForm } from "@/components/broker/order/register-form-ver01";
//import { OrderRegisterForm } from "@/components/order/register-form";
import { OrderRegisterSummary } from "@/components/order/register-summary";

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
    // 화물 리스트 페이지로 이동
    router.push("/order/list");
  };
  
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
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
                <BreadcrumbPage>운송 요청</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <main >
        <OrderRegisterForm onSubmit={() => setOpenSummary(true)} />
        
        
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