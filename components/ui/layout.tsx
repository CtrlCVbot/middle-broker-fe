import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {children}
    </div>
  );
}

export function LayoutHeader({
  children,
  className,
}: LayoutProps) {
  return (
    <header className={cn("py-4 px-4 md:px-6 flex items-center", className)}>
      {children}
    </header>
  );
}

export function LayoutBody({
  children,
  className,
}: LayoutProps) {
  return (
    <main className={cn("flex-1 px-4 md:px-6 py-4", className)}>
      {children}
    </main>
  );
}

export function LayoutFooter({
  children,
  className,
}: LayoutProps) {
  return (
    <footer className={cn("py-4 px-4 md:px-6 border-t", className)}>
      {children}
    </footer>
  );
} 