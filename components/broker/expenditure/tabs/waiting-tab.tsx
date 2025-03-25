import { InvoiceFilter } from "../invoice/invoice-filter";
import { InvoiceTable } from "../invoice/invoice-table";
import { InvoiceMatchingSheet } from "../invoice/invoice-matching-sheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useInvoiceStore } from "@/store/expenditure/invoice-store";

export const WaitingTab = () => {
  const { setMatchingSheetOpen, setMode } = useInvoiceStore();

  const handleCreateInvoice = () => {
    setMode('CREATE');
    setMatchingSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <InvoiceFilter />
        <Button onClick={handleCreateInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          세금계산서 생성
        </Button>
      </div>
      <InvoiceTable />
      <InvoiceMatchingSheet />
    </div>
  );
}; 