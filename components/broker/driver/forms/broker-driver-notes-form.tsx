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
}

export function BrokerDriverNotesForm({
  form,
  onComplete,
}: IBrokerDriverNotesFormProps) {
  const [newNote, setNewNote] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  // 현재 특이사항 목록
  const notes = form.watch("notes.notes") || []
  
  // 폼 상태 변화 감지
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.includes("notes")) {
        onComplete?.();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onComplete]);
  
  // 특이사항 추가
  const addNote = () => {
    if (!newNote.trim()) return;
    
    const updatedNotes = [
      ...notes,
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
    
    setNewNote("");
  };
  
  // 특이사항 삭제
  const removeNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    form.setValue("notes.notes", updatedNotes, { 
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // 특이사항 편집 모드 시작
  const startEditingNote = (note: { id: string; content: string }) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  // 특이사항 편집 취소
  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  // 특이사항 편집 저장
  const saveEditedNote = () => {
    if (!editContent.trim() || !editingNoteId) return;

    const updatedNotes = notes.map(note => 
      note.id === editingNoteId
        ? { ...note, content: editContent.trim(), date: new Date() }
        : note
    );

    form.setValue("notes.notes", updatedNotes, { 
      shouldValidate: true,
      shouldDirty: true,
    });

    setEditingNoteId(null);
    setEditContent("");
  };
  
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
            onClick={addNote}
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
                            onClick={saveEditedNote}
                            className="h-8 w-8 text-primary"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditingNote}
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
                            onClick={() => startEditingNote(note)}
                            className="h-8 w-8 text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNote(note.id)}
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