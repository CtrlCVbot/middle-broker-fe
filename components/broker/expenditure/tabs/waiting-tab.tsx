import { InvoiceFilter } from "../invoice/invoice-filter";
import { InvoiceTable } from "../invoice/invoice-table";
import { InvoiceMatchingSheet } from "../invoice/invoice-matching-sheet";

export const WaitingTab = () => {
  return (
    <div className="space-y-4">
      <InvoiceFilter />
      <InvoiceTable />
      <InvoiceMatchingSheet />
    </div>
  );
}; 