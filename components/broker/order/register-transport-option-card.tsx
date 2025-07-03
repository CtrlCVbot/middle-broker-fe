import React from 'react';
import { OptionSelector } from '@/components/order/register-option-selector';
import { TRANSPORT_OPTIONS } from '@/types/order';

export interface IRegisterTransportOptionCardProps {
  selectedOptions: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
}

export function RegisterTransportOptionCard({ selectedOptions, onToggle, disabled }: IRegisterTransportOptionCardProps) {
  return (
    <div className="space-y-2">
      
      <OptionSelector
        options={TRANSPORT_OPTIONS}
        selectedOptions={selectedOptions}
        onToggle={onToggle}
        disabled={disabled}
      />
    </div>
  );
} 