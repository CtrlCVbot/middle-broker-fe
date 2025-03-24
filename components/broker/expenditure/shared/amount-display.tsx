import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

interface IAmountDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
  className?: string;
}

export const AmountDisplay = ({ 
  amount, 
  size = 'md', 
  showSign = false,
  className 
}: IAmountDisplayProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  return (
    <span className={cn(
      "tabular-nums text-right",
      sizeClasses[size],
      className
    )}>
      {showSign && amount > 0 ? '+' : ''}
      ￦{formatNumber(amount)}
    </span>
  );
}; 