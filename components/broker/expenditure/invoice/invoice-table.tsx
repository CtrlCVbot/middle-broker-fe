'use client';

import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "../shared/status-badge";
import { AmountDisplay } from "../shared/amount-display";
import { IInvoice } from "@/types/broker/expenditure";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from "lucide-react";

interface InvoiceTableProps {
  isCardView?: boolean;
}

export const InvoiceTable = ({ isCardView = false }: InvoiceTableProps) => {
  const { 
    invoices, 
    currentPage,
    totalPages,
    selectInvoice,
    setMatchingSheetOpen,
    setPage
  } = useInvoiceStore();

  // 세금계산서 선택 및 매칭 시트 열기
  const handleRowClick = (invoice: IInvoice) => {
    selectInvoice(invoice);
    setMatchingSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      {isCardView ? (
        // 카드 뷰
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRowClick(invoice)}
            >
              <CardContent className="pt-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium">{invoice.supplierName}</div>
                    <div className="text-sm text-muted-foreground">{invoice.businessNumber}</div>
                  </div>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">세금계산서 번호</span>
                    <span className="text-sm">{invoice.taxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">작성일</span>
                    <span className="text-sm">{invoice.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">공급가액</span>
                    <span className="text-sm"><AmountDisplay amount={invoice.supplyAmount} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">세액</span>
                    <span className="text-sm"><AmountDisplay amount={invoice.taxAmount} /></span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between border-t">
                <div className="text-sm text-muted-foreground">합계</div>
                <div className="font-semibold"><AmountDisplay amount={invoice.totalAmount} size="lg" /></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // 테이블 뷰
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>세금계산서 번호</TableHead>
                <TableHead>운송사명</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead className="text-right">공급가액</TableHead>
                <TableHead className="text-right">세액</TableHead>
                <TableHead className="text-right">합계금액</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(invoice)}
                >
                  <TableCell>{invoice.taxId}</TableCell>
                  <TableCell>{invoice.supplierName}</TableCell>
                  <TableCell>{invoice.businessNumber}</TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell className="text-right">
                    <AmountDisplay amount={invoice.supplyAmount} />
                  </TableCell>
                  <TableCell className="text-right">
                    <AmountDisplay amount={invoice.taxAmount} />
                  </TableCell>
                  <TableCell className="text-right">
                    <AmountDisplay amount={invoice.totalAmount} size="lg" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 페이징 UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              페이지 {currentPage} / {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}; 