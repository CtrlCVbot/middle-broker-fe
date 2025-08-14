"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { DriverFormValues } from "@/types/driver-form-schema";

interface IBrokerDriverNotesSectionProps {
  form: UseFormReturn<DriverFormValues>;
}

export function BrokerDriverNotesSection({ form }: IBrokerDriverNotesSectionProps) {
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // 폼에서 특이사항 목록 가져오기
  const notes = form.watch("notes") || [];

  // 특이사항 추가 핸들러
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const newNoteItem = {
      id: uuidv4(),
      content: newNote.trim(),
      date: new Date(),
    };

    const updatedNotes = [...notes, newNoteItem];
    form.setValue("notes", updatedNotes, { 
      shouldValidate: true,
      shouldDirty: true,
    });

    setNewNote("");
    toast.success("특이사항이 추가되었습니다.");
  };

  // 특이사항 삭제 핸들러
  const handleRemoveNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    form.setValue("notes", updatedNotes, { 
      shouldValidate: true,
      shouldDirty: true,
    });
    toast.success("특이사항이 삭제되었습니다.");
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
  const handleSaveEditedNote = () => {
    if (!editContent.trim() || !editingNoteId) return;

    const updatedNotes = notes.map(note => 
      note.id === editingNoteId
        ? { ...note, content: editContent.trim(), date: new Date() }
        : note
    );

    form.setValue("notes", updatedNotes, { 
      shouldValidate: true,
      shouldDirty: true,
    });

    setEditingNoteId(null);
    setEditContent("");
    toast.success("특이사항이 수정되었습니다.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">특이사항</CardTitle>
        <CardDescription>차주에 대한 특이사항이 있다면 기록해주세요. (선택)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 특이사항 추가 */}
        <div className="flex flex-col gap-2">
          <FormLabel>특이사항 추가</FormLabel>
          <div className="flex gap-2">
            <Textarea
              placeholder="특이사항을 입력하세요"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-1 resize-none"
              rows={2}
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

        {/* 특이사항 목록 */}
        <div className="space-y-2">
          <FormLabel>특이사항 목록</FormLabel>
          {notes.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground border rounded-lg">
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
                        rows={2}
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

        {/* 숨겨진 폼 필드 */}
        <FormField
          control={form.control}
          name="notes"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
} 