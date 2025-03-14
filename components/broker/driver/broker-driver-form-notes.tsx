"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ISpecialNotesFormProps {
  notes: string[];
  onUpdate: (notes: string[]) => void;
}

export function BrokerDriverSpecialNotesForm({
  notes,
  onUpdate,
}: ISpecialNotesFormProps) {
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState("");
  
  // 특이사항 추가 핸들러
  const handleAddNote = () => {
    if (!newNote.trim()) {
      setError("특이사항을 입력해주세요.");
      return;
    }
    
    if (newNote.length > 500) {
      setError("특이사항은 최대 500자까지 입력 가능합니다.");
      return;
    }
    
    // 특이사항 추가
    const updatedNotes = [...notes, newNote.trim()];
    onUpdate(updatedNotes);
    
    // 입력 폼 초기화
    setNewNote("");
    setError("");
  };
  
  // 특이사항 삭제 핸들러
  const handleRemoveNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    onUpdate(updatedNotes);
  };
  
  // 특이사항 수정 핸들러
  const handleUpdateNote = (index: number, value: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = value;
    onUpdate(updatedNotes);
  };
  
  // 자주 사용하는 특이사항 추천 목록
  const recommendedNotes = [
    "운행 시간이 야간에만 가능함",
    "비가 올 경우 운행 불가",
    "주말 운행 불가",
    "장거리 운행 선호",
    "신규 차량으로 상태 양호",
    "제한 중량 초과 불가",
  ];
  
  // 추천 특이사항 선택 핸들러
  const handleSelectRecommendedNote = (note: string) => {
    if (notes.includes(note)) {
      setError("이미 추가된 특이사항입니다.");
      return;
    }
    
    const updatedNotes = [...notes, note];
    onUpdate(updatedNotes);
    setError("");
  };
  
  return (
    <div className="space-y-6">
      {/* 특이사항 입력 폼 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">특이사항 추가</h3>
          <p className="text-sm text-muted-foreground">
            차주의 특이사항을 기록합니다. (최대 500자)
          </p>
        </div>
        
        <div className="flex items-start gap-2">
          <Textarea
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              if (error && e.target.value.trim()) {
                setError("");
              }
            }}
            placeholder="차주의 특이사항을 입력해주세요."
            className="flex-1 min-h-[80px]"
            maxLength={500}
          />
          <Button
            type="button"
            onClick={handleAddNote}
            className="mt-1"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            추가
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-right text-muted-foreground">
          {newNote.length}/500 자
        </div>
      </div>
      
      {/* 추천 특이사항 */}
      <div>
        <h3 className="text-sm font-medium mb-2">추천 특이사항</h3>
        <div className="flex flex-wrap gap-2">
          {recommendedNotes.map((note, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => handleSelectRecommendedNote(note)}
            >
              {note}
            </Badge>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* 특이사항 목록 */}
      <div>
        <h3 className="text-sm font-medium mb-2">추가된 특이사항 ({notes.length})</h3>
        
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                추가된 특이사항이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4 space-y-4">
              {notes.map((note, index) => (
                <Card key={index} className="bg-accent/20">
                  <CardContent className="p-3 flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="text-sm">{note}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 rounded-full"
                      onClick={() => handleRemoveNote(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
} 