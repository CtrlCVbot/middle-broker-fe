"use client";

import React, { useState } from "react";
import { BrokerDriverRegisterSheetNew } from "@/components/broker/driver/broker-driver-register-sheet-new";
import { BrokerDriverRegisterForm } from "@/components/broker/driver/broker-driver-register-form";
import { IBrokerDriver } from "@/types/broker-driver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function DriverRegisterNewTestPage() {
  const [registeredDrivers, setRegisteredDrivers] = useState<IBrokerDriver[]>([]);
  const [updatedDrivers, setUpdatedDrivers] = useState<IBrokerDriver[]>([]);

  const handleRegisterSuccess = (driver: IBrokerDriver) => {
    setRegisteredDrivers(prev => [driver, ...prev]);
    toast.success("차주 등록 성공!", {
      description: `${driver.name} 차주가 등록되었습니다.`
    });
  };

  const handleUpdateSuccess = (driver: IBrokerDriver) => {
    setUpdatedDrivers(prev => [driver, ...prev]);
    toast.success("차주 수정 성공!", {
      description: `${driver.name} 차주 정보가 수정되었습니다.`
    });
  };

  // 테스트용 차주 데이터
  const testDriver: IBrokerDriver = {
    id: "test-001",
    name: "홍길동",
    phoneNumber: "010-1234-5678",
    vehicleNumber: "12가-3456",
    vehicleType: "카고",
    tonnage: "5톤",
    businessNumber: "123-45-67890",
    status: "활성",
    address: "서울시 강남구",
    bankCode: "004",
    bankAccountNumber: "123456-01-123456",
    bankAccountHolder: "홍길동",
    cargoBox: {
      type: "일반",
      length: "4.5"
    },
    manufactureYear: "2020",
    notes: [
      {
        id: "note-001",
        content: "신뢰할 수 있는 차주입니다.",
        date: new Date()
      }
    ]
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">새로운 차주 등록 폼 테스트</h1>
        <p className="text-muted-foreground">
          PRD와 UX 디자인 개선 문서를 기반으로 구현된 새로운 차주 등록 폼을 테스트합니다.
        </p>
      </div>

      <Separator />

      {/* Sheet 형태 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Sheet 형태 테스트</CardTitle>
          <CardDescription>
            우측에서 슬라이드되는 Sheet 형태로 차주 등록/수정을 테스트합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <BrokerDriverRegisterSheetNew
              onRegisterSuccess={handleRegisterSuccess}
              onUpdateSuccess={handleUpdateSuccess}
            />
            <BrokerDriverRegisterSheetNew
              mode="edit"
              driver={testDriver}
              onRegisterSuccess={handleRegisterSuccess}
              onUpdateSuccess={handleUpdateSuccess}
              trigger={
                <Button variant="outline">
                  테스트 차주 수정
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 직접 폼 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>직접 폼 테스트</CardTitle>
          <CardDescription>
            페이지에 직접 렌더링되는 폼을 테스트합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrokerDriverRegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onUpdateSuccess={handleUpdateSuccess}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* 결과 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 등록된 차주 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>등록된 차주 목록</CardTitle>
            <CardDescription>
              Sheet를 통해 등록된 차주들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registeredDrivers.length === 0 ? (
              <p className="text-muted-foreground">등록된 차주가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {registeredDrivers.map((driver, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{driver.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {driver.phoneNumber} • {driver.vehicleNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {driver.vehicleType} • {driver.tonnage}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 수정된 차주 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>수정된 차주 목록</CardTitle>
            <CardDescription>
              Sheet를 통해 수정된 차주들입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {updatedDrivers.length === 0 ? (
              <p className="text-muted-foreground">수정된 차주가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {updatedDrivers.map((driver, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{driver.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {driver.phoneNumber} • {driver.vehicleNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {driver.vehicleType} • {driver.tonnage}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 기능 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>구현된 기능</CardTitle>
          <CardDescription>
            새로운 차주 등록 폼에 구현된 주요 기능들입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">✅ 구현 완료</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 단일 화면 입력 구조 (탭 제거)</li>
                <li>• 필수 필드만으로 등록 가능</li>
                <li>• 반응형 2열 레이아웃 (PC/모바일)</li>
                <li>• 자동 포맷팅 (전화번호, 차량번호, 사업자번호)</li>
                <li>• 실시간 필수 필드 검증</li>
                <li>• 등록 버튼 활성화/비활성화</li>
                <li>• 특이사항 추가/수정/삭제</li>
                <li>• 기존 API 서비스 연동</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 UX 개선사항</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 필수 정보만 입력해도 등록 가능</li>
                <li>• 추가 정보는 선택 입력으로 분리</li>
                <li>• 등록 후 추가 정보 보완 가능</li>
                <li>• 모바일 친화적 인터페이스</li>
                <li>• 직관적인 시각적 피드백</li>
                <li>• 빠른 등록 프로세스</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 