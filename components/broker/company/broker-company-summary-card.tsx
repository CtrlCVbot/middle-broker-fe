import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IBrokerCompany } from "@/types/broker-company";
import { ArrowUpRight, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { formatDate, formatPhoneNumber } from "@/utils/format";
import { useToast } from "@/components/ui/use-toast";

interface BrokerCompanySummaryCardProps {
  company: IBrokerCompany;
}

export default function BrokerCompanySummaryCard({ company }: BrokerCompanySummaryCardProps) {
  const { toast } = useToast();

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "활성":
      case "active":
        return "success";
      case "비활성":
      case "inactive":
        return "destructive";
      case "보류":
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleViewDetails = () => {
    // 상세 정보 보기 기능은 아직 구현되지 않았으므로 토스트만 표시
    toast({
      title: "회사 상세 정보",
      description: `${company.name} 회사의 상세 정보를 불러왔습니다.`,
    });
    // TODO: 상세 페이지로 이동 또는 모달 표시
  };

  return (
    <Card className="w-full h-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-gray-200 text-gray-800">
                {company.name?.substring(0, 2) || "CO"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-medium">{company.name}</CardTitle>
              <CardDescription className="text-xs">
                {company.businessNumber 
                  ? `사업자등록번호: ${company.businessNumber}` 
                  : "사업자등록번호 미등록"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getBadgeVariant(company.status as string) as any}>
            {company.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          {/* 주소 정보는 IBrokerCompany 타입에 없으므로 제거 */}
          {company.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{formatPhoneNumber(company.phoneNumber)}</span>
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{company.email}</span>
            </div>
          )}
          {company.type && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{company.type}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
        <span>등록일: {formatDate(company.registeredDate)}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs"
          onClick={handleViewDetails}
        >
          상세보기
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
} 