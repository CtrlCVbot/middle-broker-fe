"use client";

//react
import React, { useState, useEffect, useRef } from 'react';

//ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Pencil, Save, X, GripVertical } from 'lucide-react';

//services
import {
  fetchWarnings,
  addWarning,
  updateWarning,
  deleteWarning,
  updateWarningSort
} from '@/services/broker-company-warning-service';

//types
import { ICompanyWarning, ICompanyWarningSortRequest } from '@/types/company-warning';

//dnd-kit
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 드래그 가능한 주의사항 항목 컴포넌트
const SortableWarningItem = ({
  warning,
  onEdit,
  onDelete,
  onEditCancel,
  onEditSave,
  editingId,
  editText,
  setEditText
}: {
  warning: ICompanyWarning;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: warning.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const isEditing = editingId === warning.id;
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 rounded border border-gray-200 bg-gray-50 group"
    >
      <div 
        className="cursor-grab mr-2 opacity-40 group-hover:opacity-100" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      {isEditing ? (
        <div className="flex-1 flex items-center space-x-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onEditSave();
              } else if (e.key === 'Escape') {
                onEditCancel();
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditSave}
            aria-label="주의사항 저장"
          >
            <Save className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditCancel}
            aria-label="편집 취소"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1">{warning.text}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(warning.id)}
            aria-label="주의사항 편집"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(warning.id)}
            aria-label="주의사항 삭제"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </>
      )}
    </div>
  );
};

interface BrokerCompanyWarningProps {
  companyId: string;
}

export function BrokerCompanyWarning({ companyId }: BrokerCompanyWarningProps) {
  const [warnings, setWarnings] = useState<ICompanyWarning[]>([]);
  const [newWarning, setNewWarning] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // DnD Kit 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // 주의사항 목록 불러오기
  const loadWarnings = async () => {
    console.log('loadWarnings', companyId);
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const data = await fetchWarnings(companyId);
      console.log('data', data);
      setWarnings(data);
    } catch (error) {
      toast({
        title: '주의사항 목록 조회 실패',
        description: '주의사항을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 주의사항 목록 로드
  useEffect(() => {
    if (companyId) {
      loadWarnings();
    }
  }, [companyId]);
  
  // 중복 주의사항 체크
  const isDuplicateWarning = (text: string): boolean => {
    return warnings.some(warning => 
      warning.text.toLowerCase().trim() === text.toLowerCase().trim()
    );
  };

  // 주의사항 추가
  const handleAddWarning = async () => {
    if (!newWarning.trim()) {
      toast({
        title: '주의사항 내용을 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }
    
    if (isDuplicateWarning(newWarning)) {
      toast({
        title: '이미 등록된 주의사항입니다.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await addWarning(companyId, { text: newWarning.trim() });
      await loadWarnings();
      setNewWarning('');
      inputRef.current?.focus();
      toast({
        title: '주의사항이 추가되었습니다.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: '주의사항 추가 실패',
        description: '주의사항을 추가하는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 주의사항 삭제
  const handleDeleteWarning = async (id: string) => {
    setIsLoading(true);
    console.log('handleDeleteWarning', id);
    console.log('companyId', companyId);
    try {
      await deleteWarning(companyId, id);
      await loadWarnings();
      toast({
        title: '주의사항이 삭제되었습니다.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: '주의사항 삭제 실패',
        description: '주의사항을 삭제하는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 주의사항 편집 시작
  const handleEditStart = (id: string) => {
    const warning = warnings.find(w => w.id === id);
    if (warning) {
      setEditingId(id);
      setEditText(warning.text);
    }
  };
  
  // 주의사항 편집 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };
  
  // 주의사항 편집 저장
  const handleEditSave = async () => {
    if (!editingId) return;
    
    if (!editText.trim()) {
      toast({
        title: '주의사항 내용을 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }
    
    // 다른 항목과 중복 체크 (현재 편집 중인 항목 제외)
    const isDuplicate = warnings.some(warning => 
      warning.id !== editingId && 
      warning.text.toLowerCase().trim() === editText.toLowerCase().trim()
    );
    
    if (isDuplicate) {
      toast({
        title: '이미 등록된 주의사항입니다.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await updateWarning(companyId, editingId, { text: editText.trim() });
      await loadWarnings();
      setEditingId(null);
      setEditText('');
      toast({
        title: '주의사항이 수정되었습니다.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: '주의사항 수정 실패',
        description: '주의사항을 수정하는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 정렬 순서 변경 처리
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // 배열 내 요소 위치 변경
    const oldIndex = warnings.findIndex(warning => warning.id === active.id);
    const newIndex = warnings.findIndex(warning => warning.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newWarnings = arrayMove(warnings, oldIndex, newIndex);
    setWarnings(newWarnings);
    
    // 새로운 정렬 순서 배열 생성
    const sortData: ICompanyWarningSortRequest = {
      orders: newWarnings.map((warning, index) => ({
        id: warning.id,
        sortOrder: index
      }))
    };
    
    try {
      await updateWarningSort(companyId, sortData);
      toast({
        title: '주의사항 순서가 변경되었습니다.',
        variant: 'default'
      });
    } catch (error) {
      // 저장 실패 시 원래 순서로 복원
      setWarnings(warnings);
      toast({
        title: '주의사항 순서 변경 실패',
        description: '주의사항 순서를 변경하는 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          value={newWarning}
          onChange={(e) => setNewWarning(e.target.value)}
          placeholder="ex. 결제 지연 업체"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddWarning();
            }
          }}
          disabled={isLoading}
        />
        <Button 
          type="button" 
          onClick={handleAddWarning}
          variant="secondary"
          disabled={isLoading || !newWarning.trim()}
        >
          추가
        </Button>
      </div>
      
      {isLoading && warnings.length === 0 ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">주의사항을 불러오는 중...</p>
        </div>
      ) : warnings.length > 0 ? (
        <div className="space-y-2 mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={warnings.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {warnings.map((warning) => (
                <SortableWarningItem 
                  key={warning.id}
                  warning={warning}
                  onEdit={handleEditStart}
                  onDelete={handleDeleteWarning}
                  onEditCancel={handleEditCancel}
                  onEditSave={handleEditSave}
                  editingId={editingId}
                  editText={editText}
                  setEditText={setEditText}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          등록된 주의사항이 없습니다. 주의사항을 추가해주세요.
        </div>
      )}
    </div>
  );
} 