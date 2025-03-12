import MainLayout from "../main-layout";

export default function SettlementLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
} 