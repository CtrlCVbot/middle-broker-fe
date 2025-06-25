import React from 'react';
import { OptionSelector } from '@/components/order/register-option-selector';
import { TRANSPORT_OPTIONS } from '@/types/order-ver01';

export interface IRegisterTransportOptionCardProps {
  selectedOptions: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
}

export function RegisterTransportOptionCard({ selectedOptions, onToggle, disabled }: IRegisterTransportOptionCardProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold">운송 옵션</div>
      <OptionSelector
        options={TRANSPORT_OPTIONS}
        selectedOptions={selectedOptions}
        onToggle={onToggle}
        disabled={disabled}
      />
    </div>
  );
} 