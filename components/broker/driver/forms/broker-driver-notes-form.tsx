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
  // accountInfo: any;
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
  
  // 디버깅을 위한 로그 상태
  const [logMessages, setLogMessages] = useState<string[]>([])
  
  // 로그 추가 함수
  const addLog = (message: string) => {
    console.log(`[NoteForm] ${message}`)
    setLogMessages(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }
  
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
  
  // 초기 마운트 시와 isNewDriver 변경 시에만 로그 기록
  useEffect(() => {
    addLog(`컴포넌트 마운트 - driverId: ${driverId || 'undefined'}`)
    addLog(`isNewDriver: ${isNewDriver}`)
  }, [driverId, isNewDriver]);

  // 특이사항 목록 조회 (기존 차주인 경우)
  const { data: notesData, isLoading, error, refetch } = useQuery({
    queryKey: ['driverNotes', driverId],
    queryFn: async () => {
      if (!driverId) return [];
      addLog(`API 호출 시작: fetchDriverNotes(${driverId})`)
      
      try {
        const notes = await fetchDriverNotes(driverId);
        addLog(`API 응답 완료: ${notes.length}개 항목 (상세: ${JSON.stringify(notes)})`)
        return notes;
      } catch (error) {
        addLog(`API 호출 오류: ${error instanceof Error ? error.message : String(error)}`)
        throw error;
      }
    },
    enabled: !!driverId && !isNewDriver, // 차주 ID가 있고 기존 차주인 경우에만 쿼리 활성화
    staleTime: 1000 * 30, // 30초
    refetchOnWindowFocus: false,
  });

  // 현재 차주의 특이사항 목록
  const apiNotes = driverId ? (driverNotes[driverId] || []) : [];
  
  // 폼 값 특이사항 목록 (신규 차주)
  const formNotes = form.watch("notes.notes") || [];
  
  // 실제 사용할 특이사항 목록 (기존 차주: API 데이터, 신규 차주: 폼 데이터)
  const notes = isNewDriver ? formNotes : apiNotes;
  
  // 디버깅: 특이사항 목록 상태 - 의존성 배열에 모든 관련 변수 포함
  useEffect(() => {
    addLog(`apiNotes 갱신: ${apiNotes.length}개 (${JSON.stringify(apiNotes)})`)
    addLog(`formNotes 갱신: ${formNotes.length}개`)
    addLog(`notes 사용: ${notes.length}개 (${isNewDriver ? 'formNotes' : 'apiNotes'})`)
  }, [apiNotes, formNotes, notes, isNewDriver])

  // 기존 차주인 경우 API에서 특이사항 목록 가져오기
  // React Query를 사용하므로 이 useEffect는 제거
  // useEffect(() => {
  //   if (driverId && !isNewDriver) {
  //     addLog(`useEffect에서 fetchDriverNotes 호출: ${driverId}`)
  //     fetchDriverNotes(driverId).then((fetchedNotes) => {
  //       addLog(`fetchDriverNotes 응답: ${fetchedNotes.length}개 항목`)
  //       
  //       // 폼 값에도 API에서 가져온 특이사항 설정
  //       form.setValue("notes.notes", fetchedNotes, { 
  //         shouldValidate: true,
  //         shouldDirty: false, // API에서 가져온 데이터는 dirty 상태로 표시하지 않음
  //       });
  //       
  //       addLog(`폼 업데이트 완료: notes.notes를 ${fetchedNotes.length}개 항목으로 설정`)
  //     }).catch(err => {
  //       addLog(`fetchDriverNotes 오류: ${err.message}`)
  //     });
  //   }
  // }, [driverId, fetchDriverNotes, form, isNewDriver]);
  
  // React Query 응답에 따라 폼 값 설정
  useEffect(() => {
    if (notesData && driverId && !isNewDriver) {
      addLog(`React Query 응답에 따라 폼 값 설정: ${notesData.length}개 항목`)
      
      // 폼 값에 API에서 가져온 특이사항 설정
      form.setValue("notes.notes", notesData, { 
        shouldValidate: true,
        shouldDirty: false,
      });
      
      addLog(`폼 업데이트 완료: notes.notes를 ${notesData.length}개 항목으로 설정`)
    }
  }, [notesData, driverId, isNewDriver, form]);
  
  // 특이사항 목록이 없을 때 강제로 데이터 다시 불러오기
  useEffect(() => {
    if (driverId && !isNewDriver && !isLoading && !error && notes.length === 0 && apiNotes.length === 0) {
      addLog('특이사항 데이터가 없어 강제로 다시 불러오기 시도')
      refetch().then(() => {
        addLog('강제 refetch 완료')
      });
    }
  }, [driverId, isNewDriver, isLoading, error, notes.length, apiNotes.length, refetch]);
  
  // 폼 상태 변화 감지
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes("notes")) {
        addLog(`폼 값 변경 감지: ${name}`)
        onComplete?.();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onComplete]);
  
  // 특이사항 추가 핸들러
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      addLog(`특이사항 추가 시작: ${newNote.slice(0, 20)}${newNote.length > 20 ? '...' : ''}`)
      
      if (isNewDriver) {
        // 신규 차주: 폼 상태로 관리
        addLog('신규 차주 모드: 폼 상태에 추가')
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
        
        addLog(`폼 상태 업데이트: ${updatedNotes.length}개 항목`)
      } else {
        // 기존 차주: API 호출
        addLog(`기존 차주 모드: API 호출(driverId: ${driverId})`)
        const addedNote = await addNote(driverId!, newNote.trim());
        addLog(`API 응답: ${JSON.stringify(addedNote)}`)
        
        // 화면 즉시 갱신을 위해 현재 상태에 추가
        const currentNotes = [...apiNotes]; // 현재 apiNotes의 복사본
        currentNotes.unshift({
          id: addedNote.id,
          content: addedNote.content,
          date: new Date(addedNote.date)
        });
        
        // 폼 상태도 동기화
        form.setValue("notes.notes", currentNotes, {
          shouldValidate: true,
          shouldDirty: false,
        });
        
        addLog(`특이사항 추가 후 갱신된 목록: ${currentNotes.length}개 항목`)
        
        // API 데이터 다시 가져오기
        await refetch();
        addLog('refetch 완료')
      }
      
      setNewNote("");
      addLog('특이사항 추가 완료')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`특이사항 추가 실패: ${errorMessage}`)
      console.error('특이사항 추가 실패:', error);
      toast.error('특이사항 추가 실패', {
        description: errorMessage
      });
    }
  };
  
  // 특이사항 삭제 핸들러
  const handleRemoveNote = async (id: string) => {
    try {
      addLog(`특이사항 삭제 시작: ${id}`)
      
      if (isNewDriver) {
        // 신규 차주: 폼 상태로 관리
        addLog('신규 차주 모드: 폼 상태에서 삭제')
        const updatedNotes = formNotes.filter((note) => note.id !== id);
        form.setValue("notes.notes", updatedNotes, { 
          shouldValidate: true,
          shouldDirty: true,
        });
        addLog(`폼 상태 업데이트: ${updatedNotes.length}개 항목`)
      } else {
        // 기존 차주: API 호출
        addLog(`기존 차주 모드: API 호출(noteId: ${id}, driverId: ${driverId})`)
        
        // 화면 즉시 갱신을 위해 현재 상태에서 제거
        const updatedNotes = apiNotes.filter(note => note.id !== id);
        
        // 폼 상태도 동기화
        form.setValue("notes.notes", updatedNotes, {
          shouldValidate: true,
          shouldDirty: false,
        });
        
        addLog(`특이사항 삭제 전 UI 갱신: ${updatedNotes.length}개 항목`)
        
        // 실제 API 호출
        await deleteNote(id, driverId!);
        addLog('API 삭제 완료')
        
        // API 데이터 다시 가져오기
        await refetch();
        addLog('refetch 완료')
      }
      
      addLog('특이사항 삭제 완료')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`특이사항 삭제 실패: ${errorMessage}`)
      console.error('특이사항 삭제 실패:', error);
      toast.error('특이사항 삭제 실패', {
        description: errorMessage
      });
    }
  };

  // 특이사항 편집 모드 시작
  const handleStartEditingNote = (note: { id: string; content: string }) => {
    addLog(`편집 모드 시작: ${note.id}`)
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  // 특이사항 편집 취소
  const handleCancelEditingNote = () => {
    addLog('편집 취소')
    setEditingNoteId(null);
    setEditContent("");
  };

  // 특이사항 편집 저장
  const handleSaveEditedNote = async () => {
    if (!editContent.trim() || !editingNoteId) return;

    try {
      addLog(`특이사항 수정 시작: ${editingNoteId}`)
      
      if (isNewDriver) {
        // 신규 차주: 폼 상태로 관리
        addLog('신규 차주 모드: 폼 상태에서 수정')
        const updatedNotes = formNotes.map(note => 
          note.id === editingNoteId
            ? { ...note, content: editContent.trim(), date: new Date() }
            : note
        );

        form.setValue("notes.notes", updatedNotes, { 
          shouldValidate: true,
          shouldDirty: true,
        });
        
        addLog(`폼 상태 업데이트: ${updatedNotes.length}개 항목`)
      } else {
        // 기존 차주: API 호출
        addLog(`기존 차주 모드: API 호출(noteId: ${editingNoteId}, driverId: ${driverId})`)
        
        // 화면 즉시 갱신을 위해 현재 상태 업데이트
        const updatedNotes = apiNotes.map(note => 
          note.id === editingNoteId
            ? { ...note, content: editContent.trim(), date: new Date() }
            : note
        );
        
        // 폼 상태도 동기화
        form.setValue("notes.notes", updatedNotes, {
          shouldValidate: true,
          shouldDirty: false,
        });
        
        addLog(`특이사항 수정 전 UI 갱신: ${updatedNotes.length}개 항목`)
        
        // 실제 API 호출
        await updateNote(editingNoteId, editContent.trim(), driverId!);
        addLog('API 수정 완료')
        
        // API 데이터 다시 가져오기
        await refetch();
        addLog('refetch 완료')
      }

      setEditingNoteId(null);
      setEditContent("");
      
      addLog('특이사항 수정 완료')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`특이사항 수정 실패: ${errorMessage}`)
      console.error('특이사항 수정 실패:', error);
      toast.error('특이사항 수정 실패', {
        description: errorMessage
      });
    }
  };
  
  // 로딩 상태 표시
  if (isLoading && !isNewDriver) {
    return <div className="py-4 text-center text-muted-foreground">특이사항을 불러오는 중...</div>;
  }
  
  // 에러 상태 표시
  if (error && !isNewDriver) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return (
      <div className="py-4 text-center text-destructive">
        특이사항을 불러오는 중 오류가 발생했습니다: {errorMessage}
      </div>
    );
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
      
      {/* 디버깅 정보 (개발 중에만 사용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border border-amber-300 bg-amber-50 p-2 mb-4 rounded text-xs">
          <p className="font-bold mb-1">디버깅 정보</p>
          <p>driverId: {driverId || 'undefined'}</p>
          <p>isNewDriver: {isNewDriver ? 'true' : 'false'}</p>
          <p>notes 길이: {notes.length}</p>
          <p>apiNotes 길이: {apiNotes.length}</p>
          <p>formNotes 길이: {formNotes.length}</p>
          <p>isLoading: {isLoading ? 'true' : 'false'}</p>
          <p>notesError: {notesError || '없음'}</p>
          <button 
            onClick={() => refetch()} 
            className="text-xs mt-1 bg-blue-500 text-white px-2 py-1 rounded"
          >
            데이터 강제 새로고침
          </button>
          <details>
            <summary>최근 로그 ({logMessages.length}개)</summary>
            <pre className="mt-2 p-1 bg-gray-100 max-h-40 overflow-y-auto">
              {logMessages.map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </pre>
          </details>
        </div>
      )}
      
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