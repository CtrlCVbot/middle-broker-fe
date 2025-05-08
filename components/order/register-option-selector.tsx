"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ITransportOption } from "@/types/order-ver01";

interface OptionSelectorProps {
  options: ITransportOption[];
  selectedOptions: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export function OptionSelector({ 
  options, 
  selectedOptions, 
  onToggle,
  disabled = false,
  onDisabledClick 
}: OptionSelectorProps) {
  // 옵션 토글 핸들러
  const handleToggle = (optionId: string) => {
    if (disabled && onDisabledClick) {
      onDisabledClick();
      return;
    }
    
    if (!disabled) {
      onToggle(optionId);
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option) => (
        <div key={option.id} className="flex items-start space-x-2">
          <Checkbox
            id={`option-${option.id}`}
            checked={selectedOptions.includes(option.id)}
            onCheckedChange={() => handleToggle(option.id)}
            disabled={disabled}
            className={disabled ? 'data-[state=checked]:bg-muted-foreground' : ''}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor={`option-${option.id}`}
              className={`font-medium ${disabled ? 'text-muted-foreground' : ''}`}
            >
              {option.label}
            </Label>
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