"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Truck, Home, Phone, Building2, Building, Factory, Calendar, User, MapPinHouse, Map } from "lucide-react";

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
    <>
    <Card className="h-full bg-muted/20 hover:ring-2 hover:ring-primary/20 transition-all duration-150">
      <CardHeader >
        <CardTitle className="text-sm md:text-base flex items-center">
          {isDeparture ? (
            <Map className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <Map className="h-4 w-4 mr-2 text-green-500" />
          )}
          <div className="font-medium text-shadow-xs text-md text-neutral-500 truncate">{title}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-md">

        <div className="flex">
          <div className="flex-1">
            <div className="flex items-center">
              <Factory className="inline h-4 w-4 mr-1 text-muted-foreground" />
              <div className="text-shadow-xs font-medium">{company}</div>
            </div>
          </div>          
        </div>       

        <div className="flex">          
          <div className="flex-1">
            <div className="flex items-center">
              <MapPinHouse className="inline h-4 w-4 mr-1 text-muted-foreground text-shadow-regal-blue" />
              {address && (
                <div className="text-md font-medium">{address}</div>
              )}
            </div>
            {detailedAddress && (
              <div className="text-xs text-muted-foreground mt-1 ml-5">{detailedAddress}</div>
            )}
          </div>
        </div>

        
        <div className="flex">
          {/* <div className="w-20 text-muted-foreground">담당자</div> */}
          <div className="flex-1 font-medium ">
            <User className="inline h-4 w-4 mr-1 text-muted-foreground" />
            {name}
            <Phone className="inline h-4 w-4 ml-3 mr-1 text-muted-foreground" />
            <span className="text-xs">{contact}</span>
          </div>
        </div>
        
        
        
        <div className="flex">
          {/* <div className="w-20 text-muted-foreground">
            {isDeparture ? "출발시간" : "도착시간"}
          </div> */}
          <div className="flex-1 font-medium flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>{date} {time}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    
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

export function OrderInfoCard({ departure, destination, className }: OrderInfoCardProps) {
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