"use client";

import { RegisterCargoInfoForm } from "@/components/order/register-cargoInfo-form";
import { useState } from "react";
import { ICargo } from "@/types/order";

export default function CargoInfoTestPage() {
  const [selectedCargo, setSelectedCargo] = useState<ICargo | null>(null);
  const [weightType, setWeightType] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [remark, setRemark] = useState('');

  const handleCargoSelect = (cargo: ICargo) => {
    setSelectedCargo(cargo);
    console.log('선택된 화물:', cargo);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">최근 화물 사용 기능 테스트</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 테스트 컴포넌트 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">RegisterCargoInfoForm</h2>
          <RegisterCargoInfoForm
            companyId="test-company-id"
            compact={true}
            enabled={true}
            onCargoSelect={handleCargoSelect}
            weightType={weightType}
            vehicleType={vehicleType}
            cargoType={cargoType}
            remark={remark}
            onWeightTypeChange={setWeightType}
            onVehicleTypeChange={setVehicleType}
            onCargoTypeChange={setCargoType}
            onRemarkChange={setRemark}
          />
        </div>

        {/* 결과 표시 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">선택된 화물 정보</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">현재 폼 데이터:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>중량:</strong> {weightType || '미선택'}</div>
                <div><strong>차량 종류:</strong> {vehicleType || '미선택'}</div>
                <div><strong>화물 품목:</strong> {cargoType || '미입력'}</div>
                <div><strong>비고:</strong> {remark || '미입력'}</div>
              </div>
            </div>

            {selectedCargo && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-medium mb-2">선택된 최근 화물:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {selectedCargo.id}</div>
                  <div><strong>화물명:</strong> {selectedCargo.cargoName}</div>
                  <div><strong>중량:</strong> {selectedCargo.requestedVehicleWeight}</div>
                  <div><strong>차량 종류:</strong> {selectedCargo.requestedVehicleType}</div>
                  <div><strong>비고:</strong> {selectedCargo.memo || '없음'}</div>
                  <div><strong>수정일:</strong> {new Date(selectedCargo.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 