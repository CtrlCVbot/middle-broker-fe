"use client"

import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  
  FormField,
  FormItem,
  FormLabel,
  
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardHeader,
  
  CardDescription,
  CardContent,
  
} from "@/components/ui/card"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useBrokerDriverStore } from "@/store/broker-driver-store"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

// 특이사항 스키마
const noteSchema = z.object({
  notes: z.array(
    z.object({
      id: z.string(),
      content: z.string().min(1, "특이사항 내용은 필수입니다"),
      date: z.date(),
    })
  ).default([]),
})

// 전체 폼 스키마에서 특이사항 타입 추출
type DriverFormValues = {
  basicInfo: any;
  vehicleInfo: any;
  accountInfo: any;
  notes: z.infer<typeof noteSchema>;
}

interface IBrokerDriverNotesFormProps {
  form: UseFormReturn<DriverFormValues>;
  onComplete?: () => void;
  driverId?: string; // 차주 ID 프롭 추가
}

export function BrokerDriverNotesForm({
  form,
  onComplete,
  driverId,
}: IBrokerDriverNotesFormProps) {
  const [newNote, setNewNote] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  
  // 차주 ID가 없는 경우 (신규 등록) 폼에서 직접 관리
  const isNewDriver = !driverId;

  // Zustand 스토어에서 특이사항 관련 상태 및 액션 가져오기
  const {
    driverNotes,
    isLoadingNotes,
    notesError,
    fetchDriverNotes,
    addDriverNote: addNote,
    updateDriverNote: updateNote,
    deleteDriverNote: deleteNote,
  } = useBrokerDriverStore();

  // 특이사항 목록 조회 (기존 차주인 경우)
  const { data: notesData, isLoading, error, refetch } = useQuery({
    queryKey: ['driverNotes', driverId],
    queryFn: () => driverId ? fetchDriverNotes(driverId) : Promise.resolve([]),
    enabled: !!driverId, // 차주 ID가 있는 경우에만 쿼리 활성화
    staleTime: 1000 * 60, // 1분
  });

  // 현재 차주의 특이사항 목록
  const apiNotes = driverId ? (driverNotes[driverId] || []) : [];
  
  // 폼 값 특이사항 목록 (신규 차주)
  const formNotes = form.watch("notes.notes") || [];
  
  // 실제 사용할 특이사항 목록 (기존 차주: API 데이터, 신규 차주: 폼 데이터)
  const notes = isNewDriver ? formNotes : apiNotes;

  // 기존 차주인 경우 API에서 특이사항 목록 가져오기
  useEffect(() => {
    if (driverId && !isNewDriver) {
      fetchDriverNotes(driverId).then((fetchedNotes) => {
        // 폼 값에도 API에서 가져온 특이사항 설정 (선택 사항)
        form.setValue("notes.notes", fetchedNotes, { 
          shouldValidate: true,
          shouldDirty: false, // API에서 가져온 데이터는 dirty 상태로 표시하지 않음
        });
      });
    }
  }, [driverId, fetchDriverNotes, form, isNewDriver]);
  
  // 폼 상태 변화 감지
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes("notes")) {
        onComplete?.();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onComplete]);
  
  // 특이사항 추가 핸들러
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      if (isNewDriver) {
        // 신규 차주: 폼 상태로 관리
        const updatedNotes = [
          ...formNotes,
          {
            id: uuidv4(),
            content: newNote.trim(),
            date: new Date(),
          },
        ];
        
        form.setValue("notes.notes", updatedNotes, { 
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        // 기존 차주: API 호출
        await addNote(driverId!, newNote.trim());
        
        // 폼 값도 업데이트 (선택적)
        refetch();
      }
      
      setNewNote("");
    } catch (error) {
      console.error('특이사항 추가 실패:', error);
    }
  };
  
  // 특이사항 삭제 핸들러
  const handleRemoveNote = async (id: string) => {
    try {
      if (isNewDriver) {
        // 신규 차주: 폼 상태로 관리
        const updatedNotes = formNotes.filter((note) => note.id !== id);
        form.setValue("notes.notes", updatedNotes, { 
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        // 기존 차주: API 호출
        await deleteNote(id, driverId!);
        
        // 폼 값도 업데이트 (선택적)
        refetch();
      }
    } catch (error) {
      console.error('특이사항 삭제 실패:', error);
    }
  };

  // 특이사항 편집 모드 시작
  const handleStartEditingNote = (note: { id: string; content: string }) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  // 특이사항 편집 취소
  const handleCancelEditingNote = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  // 특이사항 편집 저장
  const handleSaveEditedNote = async () => {
    if (!editContent.trim() || !editingNoteId) return;

    try {
      if (isNewDriver) {
        // 신규 차주: 폼 상태로 관리
        const updatedNotes = formNotes.map(note => 
          note.id === editingNoteId
            ? { ...note, content: editContent.trim(), date: new Date() }
            : note
        );

        form.setValue("notes.notes", updatedNotes, { 
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        // 기존 차주: API 호출
        await updateNote(editingNoteId, editContent.trim(), driverId!);
        
        // 폼 값도 업데이트 (선택적)
        refetch();
      }

      setEditingNoteId(null);
      setEditContent("");
    } catch (error) {
      console.error('특이사항 수정 실패:', error);
    }
  };
  
  // 로딩 상태 표시
  if (isLoading && !isNewDriver) {
    return <div className="py-4 text-center text-muted-foreground">특이사항을 불러오는 중...</div>;
  }
  
  // 에러 상태 표시
  if (error && !isNewDriver) {
    return <div className="py-4 text-center text-destructive">특이사항을 불러오는 중 오류가 발생했습니다.</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <FormLabel>특이사항 추가</FormLabel>
        <div className="flex gap-2">
          <Textarea
            placeholder="특이사항을 입력하세요"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 resize-none"
          />
          <Button 
            type="button" 
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="self-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            추가
          </Button>
        </div>
        <FormDescription>
          차주에 대한 특이사항이 있다면 추가하세요.
        </FormDescription>
      </div>
      
      <div className="space-y-2">
        <FormLabel>특이사항 목록</FormLabel>
        {notes.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            등록된 특이사항이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <Card key={note.id} className="border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex justify-between items-center">
                    <CardDescription>
                      {format(
                        typeof note.date === 'string' 
                          ? new Date(note.date) 
                          : note.date, 
                        "yyyy년 MM월 dd일 HH:mm", 
                        { locale: ko }
                      )}
                    </CardDescription>
                    <div className="flex gap-1">
                      {editingNoteId === note.id ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveEditedNote}
                            className="h-8 w-8 text-primary"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEditingNote}
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEditingNote(note)}
                            className="h-8 w-8 text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveNote(note.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  {editingNoteId === note.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="resize-none"
                      placeholder="특이사항 내용"
                    />
                  ) : (
                    <p className="text-sm">{note.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <FormField
        control={form.control}
        name="notes.notes"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 