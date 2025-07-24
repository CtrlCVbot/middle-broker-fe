"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LogOut,
  LogIn,
  Factory,
  MapPinHouse,
  User,
  Phone,
  Calendar,
  Clock,  
  Info,
  ChevronDown,
  MapPin,
  ChevronUp,
  Warehouse,
} from "lucide-react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button";
import { OptionSelector } from "./register-option-selector";
import { TRANSPORT_OPTIONS } from "@/utils/mockdata/constants";
import { ko } from "date-fns/locale";
import { format } from "date-fns";

interface LocationInfoProps {
  title: string;
  address: string;
  detailedAddress?: string;
  name: string;
  company: string;
  contact: string;
  time: string;
  date: string;
  isDeparture?: boolean;
}

function LocationInfo({
  title,
  address,
  detailedAddress,
  name,
  company,
  contact,
  time,
  date,
  isDeparture = false,
}: LocationInfoProps) {

  const [showDetail, setShowDetail] = useState<boolean>(false);
  
  return (
    <> 
    <div className="h-full bg-white shadow-md rounded-md hover:ring-2 hover:ring-primary/20 transition-all duration-150">
      {/* 상단 알림 */}
      <div className={cn("bg-"+ (isDeparture ? "green-100" : "blue-100") + " text-" + (isDeparture ? "text-green-700" : "text-blue-700") + " text-sm p-2 rounded-t-md flex items-center")}>
        {/* <Badge variant="default" className="mr-2 bg-blue-700 text-white"> */}
          {isDeparture ? (
            <Badge variant="default" className="mr-2 bg-green-700 text-white">
            <LogOut className="inline h-4 w-4" />
            </Badge>
          ) : (
            <Badge variant="default" className="mr-2 bg-blue-700 text-white">
            <LogIn className="inline h-4 w-4" />
            </Badge>
          )}
        
        <span className="text-sm text-gray-700">{format(date, "MM.dd (E) ", { locale: ko })} {time.slice(0, 5)}</span>
      </div>

      

      <CardHeader className="p-3 flex justify-between items-center">
          
        <CardTitle className="text-md font-semibold flex items-center">
        
          <Warehouse className="h-4 w-4 mr-2 text-gray-500" />
          {company}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowDetail((prev) => !prev)}
          >
            {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 border-t border-gray-200">            

        {/* 배달 주소 */}
        <div className="text-md font-medium mt-2">
          주소
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" />              
          {address && (
              <div className="text-sm font-medium text-gray-600">{address}</div>
            )}
        </div>

        {showDetail && (
          <>
              {/* 주소 정보 */}
              <div className="flex items-center space-x-1">
              {detailedAddress && (
                <div className="text-xs text-muted-foreground ml-5">
                  {detailedAddress}
                </div>
              )}
            </div>    

            <Separator className="my-2 border-gray-800" />

            {/* 담당자 정보 */}
            <div className="flex items-center space-x-1">
              <User className="inline h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">{name}</span>
              {contact && (
                <div className="text-sm text-muted-foreground ml-3">
                  {contact}
                </div>
              )}
            </div>
          </>
        )}        
        
      </CardContent>
    </div>
    </>
  );
}

interface OrderInfoCardProps {
  departure: {
    address: string;
    detailedAddress?: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  destination: {
    address: string;
    detailedAddress?: string;
    name: string;
    company: string;
    contact: string;
    time: string;
    date: string;
  };
  className?: string;
}

export function OrderInfoCardVer01({
  departure,
  destination,
  className,
}: OrderInfoCardProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      <LocationInfo
        title="상차지 정보"
        address={departure.address}
        detailedAddress={departure.detailedAddress}
        name={departure.name}
        company={departure.company}
        contact={departure.contact}
        time={departure.time}
        date={departure.date}
        isDeparture={true}
      />
      <LocationInfo
        title="도착지 정보"
        address={destination.address}
        detailedAddress={destination.detailedAddress}
        name={destination.name}
        company={destination.company}
        contact={destination.contact}
        time={destination.time}
        date={destination.date}
      />
    </div>
  );
}
