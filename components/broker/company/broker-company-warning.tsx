"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

// 고유 ID 생성 함수 (uuid 대신 사용)
const generateId = () => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

interface IBrokerCompanyWarning {
  id: string;
  text: string;
}

interface BrokerCompanyWarningProps {
  warnings: IBrokerCompanyWarning[];
  onWarningSave: (warnings: IBrokerCompanyWarning[]) => void;
}

export function BrokerCompanyWarning({ warnings, onWarningSave }: BrokerCompanyWarningProps) {
  const [newWarning, setNewWarning] = useState('');

  const handleAddWarning = () => {
    if (newWarning.trim()) {
      const warning = {
        id: generateId(),
        text: newWarning.trim()
      };
      
      onWarningSave([...warnings, warning]);
      setNewWarning('');
    }
  };

  const handleDeleteWarning = (id: string) => {
    onWarningSave(warnings.filter(warning => warning.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          value={newWarning}
          onChange={(e) => setNewWarning(e.target.value)}
          placeholder="주의사항을 입력하세요"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddWarning();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={handleAddWarning}
          variant="secondary"
        >
          추가
        </Button>
      </div>
      
      {warnings.length > 0 ? (
        <div className="space-y-2 mt-4">
          {warnings.map((warning) => (
            <div 
              key={warning.id} 
              className="flex items-center p-2 rounded border border-gray-200 bg-gray-50"
            >
              <span className="flex-1">{warning.text}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteWarning(warning.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          등록된 주의사항이 없습니다. 주의사항을 추가해주세요.
        </div>
      )}
    </div>
  );
} 