import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form';
import { ORDER_VEHICLE_TYPES, ORDER_VEHICLE_WEIGHTS } from '@/types/order-ver01';

export interface IRegisterCargoInfoCardProps {
  vehicleType: string;
  weightType: string;
  cargoType: string;
  remark?: string;
  onChange: (fields: Partial<Omit<IRegisterCargoInfoCardProps, 'onChange'>>) => void;
  disabled?: boolean;
}

export function RegisterCargoInfoCard({ vehicleType, weightType, cargoType, remark, onChange, disabled }: IRegisterCargoInfoCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel>차량 종류</FormLabel>
          <Select
            value={vehicleType}
            onValueChange={v => onChange({ vehicleType: v })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="차량 종류 선택" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_VEHICLE_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FormLabel>중량</FormLabel>
          <Select
            value={weightType}
            onValueChange={v => onChange({ weightType: v })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="중량 선택" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_VEHICLE_WEIGHTS.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <FormLabel>화물 품목</FormLabel>
        <Input
          placeholder="화물 품목을 입력하세요 (최대 38자)"
          maxLength={38}
          value={cargoType}
          onChange={e => onChange({ cargoType: e.target.value })}
          disabled={disabled}
        />
        <p className="text-xs text-right text-muted-foreground mt-1">{cargoType.length}/38자</p>
      </div>
      <div>
        <FormLabel>비고</FormLabel>
        <Textarea
          placeholder="비고 (선택사항)"
          value={remark || ''}
          onChange={e => onChange({ remark: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
} 