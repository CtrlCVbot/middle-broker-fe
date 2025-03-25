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
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "../shared/status-badge";
import { AmountDisplay } from "../shared/amount-display";
import { IInvoice } from "@/types/broker/expenditure";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export const InvoiceTable = () => {
  const { 
    invoices, 
    selectedInvoice,
    currentPage,
    totalPages,
    selectInvoice,
    setMatchingSheetOpen,
    setPage
  } = useInvoiceStore();

  const handleRowClick = (invoice: IInvoice) => {
    selectInvoice(invoice);
    setMatchingSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">선택</TableHead>
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
                <TableCell>
                  <Checkbox
                    checked={selectedInvoice?.id === invoice.id}
                    onCheckedChange={() => selectInvoice(invoice)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>{invoice.taxId}</TableCell>
                <TableCell>{invoice.supplierName}</TableCell>
                <TableCell>{invoice.businessNumber}</TableCell>
                <TableCell>{invoice.issueDate}</TableCell>
                <TableCell>
                  <AmountDisplay amount={invoice.supplyAmount} />
                </TableCell>
                <TableCell>
                  <AmountDisplay amount={invoice.taxAmount} />
                </TableCell>
                <TableCell>
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