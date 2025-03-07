"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Truck, Home, Phone, Building2, Calendar } from "lucide-react";

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
  isDeparture = false
}: LocationInfoProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base flex items-center">
          {isDeparture ? (
            <Truck className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <Home className="h-4 w-4 mr-2 text-green-500" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-sm">
        <div className="flex">
          <div className="w-20 text-muted-foreground">주소</div>
          <div className="flex-1 font-medium">
            {address}
            {detailedAddress && (
              <div className="text-xs text-muted-foreground mt-1">{detailedAddress}</div>
            )}
          </div>
        </div>
        
        <div className="flex">
          <div className="w-20 text-muted-foreground">담당자</div>
          <div className="flex-1 font-medium flex items-center">
            {name}
            <Phone className="h-3 w-3 ml-3 mr-1 text-muted-foreground" />
            <span className="text-xs">{contact}</span>
          </div>
        </div>
        
        <div className="flex">
          <div className="w-20 text-muted-foreground">회사</div>
          <div className="flex-1 font-medium flex items-center">
            <Building2 className="h-3 w-3 mr-1 text-muted-foreground" />
            {company}
          </div>
        </div>
        
        <div className="flex">
          <div className="w-20 text-muted-foreground">
            {isDeparture ? "출발시간" : "도착시간"}
          </div>
          <div className="flex-1 font-medium flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{date} {time}</span>
          </div>
        </div>
      </CardContent>
    </Card>
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

export function OrderInfoCard({ departure, destination, className }: OrderInfoCardProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      <LocationInfo
        title="출발지 정보"
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