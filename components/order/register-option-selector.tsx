"use client";

import React from "react";
import { ITransportOption } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OptionSelectorProps {
  options: ITransportOption[];
  selectedOptions: string[];
  onToggle: (optionId: string) => void;
}

export function OptionSelector({ options, selectedOptions, onToggle }: OptionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <Tooltip key={option.id}>
              <TooltipTrigger asChild>
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm transition-all",
                    isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                  )}
                  onClick={() => onToggle(option.id)}
                >
                  {option.label}
                </Badge>
              </TooltipTrigger>
              {option.description && (
                <TooltipContent>
                  <p>{option.description}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
} 