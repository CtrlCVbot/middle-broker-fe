'use client';

import { useInvoiceStore } from "@/store/expenditure/invoice-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const InvoiceFilter = () => {
  const { filter, updateFilter } = useInvoiceStore();

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="사업자번호"
          value={filter.businessNumber || ''}
          onChange={(e) => updateFilter({ businessNumber: e.target.value })}
        />
        <Input
          placeholder="운송사명"
          value={filter.supplierName || ''}
          onChange={(e) => updateFilter({ supplierName: e.target.value })}
        />
        <Input
          placeholder="세금계산서 번호"
          value={filter.taxId || ''}
          onChange={(e) => updateFilter({ taxId: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <Input
            type="date"
            value={filter.dateRange?.start || ''}
            onChange={(e) => updateFilter({
              dateRange: {
                ...filter.dateRange,
                start: e.target.value
              }
            })}
          />
          <Input
            type="date"
            value={filter.dateRange?.end || ''}
            onChange={(e) => updateFilter({
              dateRange: {
                ...filter.dateRange,
                end: e.target.value
              }
            })}
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="최소 금액"
            value={filter.amountRange?.min || ''}
            onChange={(e) => updateFilter({
              amountRange: {
                ...filter.amountRange,
                min: e.target.value ? Number(e.target.value) : undefined
              }
            })}
          />
          <Input
            type="number"
            placeholder="최대 금액"
            value={filter.amountRange?.max || ''}
            onChange={(e) => updateFilter({
              amountRange: {
                ...filter.amountRange,
                max: e.target.value ? Number(e.target.value) : undefined
              }
            })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => updateFilter({})}
        >
          필터 초기화
        </Button>
      </div>
    </Card>
  );
}; 