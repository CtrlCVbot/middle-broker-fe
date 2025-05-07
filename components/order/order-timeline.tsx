"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Users, Circle } from "lucide-react";
import Image from "next/image";

interface TimelineItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  additionalInfo?: string;
  fileLink?: string;
  userImages?: string[];
}

interface TimelineProps {
    items: TimelineItemProps[];
  }
  
  export function Timeline({ items }: TimelineProps) {
    return (
      <div className="p-4 max-w-md space-y-4">
        {items.map((item, index) => (
          <TimelineItem key={index} {...item} />
        ))}
      </div>
    );
  }
  

function TimelineItem({
  icon,
  title,
  description,
  time,
  additionalInfo,
  fileLink,
  userImages,
}: TimelineItemProps) {
  return (
    <div className="relative flex items-start space-x-3">
        {/* 타임라인 점과 수직선 */}
        <div className="flex flex-col items-center">
            {/* 수직선 */}
            <div className="absolute top-0 left-2 w-px h-full bg-gray-300 z-0"></div>

            {/* 마커 */}
            <div className="relative flex items-center justify-center w-4 h-4 rounded-full bg-white border-2 border-gray-300 z-10">
                {icon}
            </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-800">{title}</h4>
                <span className="text-xs text-gray-500">{time}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{description}</p>

            {/* 파일 링크 */}
            {fileLink && (
                <div className="mt-1">
                <Badge variant="outline" className="flex items-center space-x-1">
                    <FileText className="h-4 w-4 mr-1" />
                    <a href={fileLink} className="underline text-blue-500">invoices.pdf</a>
                </Badge>
                </div>
            )}

            {/* 추가 정보 */}
            {additionalInfo && (
                <p className="text-xs text-gray-500 mt-1">{additionalInfo}</p>
            )}

            {/* 유저 이미지 목록 */}
            {userImages && (
                <div className="flex space-x-1 mt-1">
                {userImages.map((src, index) => (
                    <div key={index} className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                    <Image src={src} alt="User" width={24} height={24} />
                    </div>
                ))}
                {userImages.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 text-xs flex items-center justify-center text-gray-600">
                    +{userImages.length - 3}
                    </div>
                )}
                </div>
            )}
        </div>
    </div>
  );
}
