import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
//import MainLayout from "@/app/main-layout";

export const metadata: Metadata = {
  title: "대시보드 - Middle Shipper",
  description: "Middle Shipper 대시보드",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 