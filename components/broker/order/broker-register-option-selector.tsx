import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { IBrokerTransportOption } from "@/types/broker-order";

interface BrokerRegisterOptionSelectorProps {
  options: IBrokerTransportOption[];
  selectedOptions: string[];
  onChange: (value: string[]) => void;
}

export function BrokerRegisterOptionSelector({
  options,
  selectedOptions,
  onChange,
}: BrokerRegisterOptionSelectorProps) {
  // 옵션 선택/해제 처리
  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      // 옵션 추가
      onChange([...selectedOptions, optionId]);
    } else {
      // 옵션 제거
      onChange(selectedOptions.filter((id) => id !== optionId));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {options.map((option) => (
        <div
          key={option.id}
          className="flex items-start space-x-2 border rounded-md p-3 hover:bg-secondary/20 transition-colors"
        >
          <Checkbox
            id={option.id}
            checked={selectedOptions.includes(option.id)}
            onCheckedChange={(checked) =>
              handleOptionChange(option.id, checked as boolean)
            }
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={option.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {option.label}
            </label>
            {option.description && (
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 