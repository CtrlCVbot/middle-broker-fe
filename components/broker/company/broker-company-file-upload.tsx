"use client";

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, FileIcon, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// 고유 ID 생성 함수 (uuid 대신 사용)
const generateId = () => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

interface IFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface BrokerCompanyFileUploadProps {
  files: IFile[];
  onFileChange: (files: IFile[]) => void;
  maxFiles?: number;
  maxSizeInMb?: number;
  allowedTypes?: string[];
}

export function BrokerCompanyFileUpload({ 
  files, 
  onFileChange, 
  maxFiles = 5, 
  maxSizeInMb = 5,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'] 
}: BrokerCompanyFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  // 허용된 파일 형식인지 확인
  const isFileTypeAllowed = (file: File) => {
    return allowedTypes.includes(file.type);
  };

  // 파일 크기 확인
  const isFileSizeAllowed = (file: File) => {
    return file.size <= maxSizeInMb * 1024 * 1024;
  };

  // 파일 개수 제한 확인
  const canAddMoreFiles = () => {
    return files.length < maxFiles;
  };

  // 파일 처리 함수
  const processFile = (file: File) => {
    if (!isFileTypeAllowed(file)) {
      toast.error(`지원하지 않는 파일 형식입니다. (${file.type})`);
      return;
    }

    if (!isFileSizeAllowed(file)) {
      toast.error(`파일 크기는 ${maxSizeInMb}MB 이하여야 합니다.`);
      return;
    }

    if (!canAddMoreFiles()) {
      toast.error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 URL 생성 (실제 구현에서는 API 호출로 대체)
    const fileUrl = URL.createObjectURL(file);
    const newFile: IFile = {
      id: generateId(),
      name: file.name,
      url: fileUrl,
      type: file.type
    };

    onFileChange([...files, newFile]);
  };

  // 파일 선택 이벤트 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(processFile);
    }
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.target.value = '';
  };

  // 파일 삭제 핸들러
  const handleDeleteFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    onFileChange(updatedFiles);
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      Array.from(droppedFiles).forEach(processFile);
    }
  }, [files]);

  // 파일 아이콘 선택 함수
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          multiple={files.length < maxFiles}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <PlusCircle className="h-10 w-10 text-muted-foreground mb-2" />
          <span className="text-sm font-medium">파일 선택 또는 여기로 드래그하세요</span>
          <span className="text-xs text-muted-foreground mt-1">
            최대 {maxFiles}개 파일, 개별 파일 {maxSizeInMb}MB 이하
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            지원 형식: PDF, JPG, PNG
          </span>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center p-3 rounded border border-gray-200 bg-gray-50"
            >
              {getFileIcon(file.type)}
              <span className="flex-1 ml-2 text-sm truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteFile(file.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 