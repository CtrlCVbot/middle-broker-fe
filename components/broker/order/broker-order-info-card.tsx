import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

interface LocationInfo {
  address: string;
  name?: string;
  contact?: string;
  dateTime: string;
}

interface BrokerOrderInfoCardProps {
  departure: LocationInfo;
  destination: LocationInfo;
}

export function BrokerOrderInfoCard({ departure, destination }: BrokerOrderInfoCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          {/* 출발지 정보 */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" />
              <h4 className="font-medium">출발지</h4>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">{departure.address}</p>
              
              {departure.name && (
                <div className="text-sm text-muted-foreground">
                  담당자: {departure.name}
                  {departure.contact && ` (${departure.contact})`}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{departure.dateTime}</span>
              </div>
            </div>
          </div>
          
          {/* 도착지 정보 */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" />
              <h4 className="font-medium">도착지</h4>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">{destination.address}</p>
              
              {destination.name && (
                <div className="text-sm text-muted-foreground">
                  담당자: {destination.name}
                  {destination.contact && ` (${destination.contact})`}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{destination.dateTime}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 화살표 표시 (모바일에서만) */}
        <div className="md:hidden flex justify-center py-2 bg-muted/30">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
} 