import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BrokerOrderAcceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: {
    agreedFreightCost: number;
    assignedVehicleType: string;
    assignedVehicleWeight: string;
    memo?: string;
  }) => void;
  orderCount: number;
  vehicleTypes: string[];
  vehicleWeights: string[];
}

export function BrokerOrderAcceptModal({
  isOpen,
  onClose,
  onAccept,
  orderCount,
  vehicleTypes,
  vehicleWeights
}: BrokerOrderAcceptModalProps) {
  const [agreedFreightCost, setAgreedFreightCost] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  const [vehicleWeight, setVehicleWeight] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAccept({
      agreedFreightCost: parseFloat(agreedFreightCost) || 0,
      assignedVehicleType: vehicleType,
      assignedVehicleWeight: vehicleWeight,
      memo: memo
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>운송 수락 - {orderCount}개 화물</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agreedFreightCost">합의 운송비</Label>
            <Input
              id="agreedFreightCost"
              type="number"
              value={agreedFreightCost}
              onChange={(e) => setAgreedFreightCost(e.target.value)}
              placeholder="합의 운송비를 입력하세요"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">차량 유형</Label>
              <Select 
                value={vehicleType} 
                onValueChange={setVehicleType}
                required
              >
                <SelectTrigger id="vehicleType">
                  <SelectValue placeholder="차량 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleWeight">차량 중량</Label>
              <Select 
                value={vehicleWeight} 
                onValueChange={setVehicleWeight}
                required
              >
                <SelectTrigger id="vehicleWeight">
                  <SelectValue placeholder="차량 중량 선택" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleWeights.map((weight) => (
                    <SelectItem key={weight} value={weight}>{weight}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="운송 관련 메모를 입력하세요"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit">수락</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 