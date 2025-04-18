"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IAddress } from "@/types/address";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IAddressTableProps {
  addresses: IAddress[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDeleteSelected: (addresses: IAddress[]) => void;
  onDeleteSingle: (address: IAddress) => void;
  onEdit?: (address?: IAddress) => void;
  onToggleFrequent?: (address: IAddress) => void;
  selectedAddresses?: IAddress[];
  onSelectAddresses?: (addresses: IAddress[]) => void;
  hidePagenation?: boolean;
}

export function AddressTable({
  addresses,
  totalPages,
  currentPage,
  onPageChange,
  onDeleteSelected,
  onDeleteSingle,
  onEdit,
  onToggleFrequent,
  selectedAddresses: externalSelectedAddresses,
  onSelectAddresses,
  hidePagenation = false,
}: IAddressTableProps) {
  const [internalSelectedAddresses, setInternalSelectedAddresses] = useState<IAddress[]>([]);
  
  // 선택된 주소 상태 - 내부 또는 외부에서 관리
  const selectedAddresses = externalSelectedAddresses || internalSelectedAddresses;
  
  // 선택 상태 변경 핸들러
  const setSelectedAddresses = (addresses: IAddress[]) => {
    if (onSelectAddresses) {
      onSelectAddresses(addresses);
    } else {
      setInternalSelectedAddresses(addresses);
    }
  };

  const handleSelectAll = () => {
    if (selectedAddresses.length === addresses.length) {
      setSelectedAddresses([]);
    } else {
      setSelectedAddresses([...addresses]);
    }
  };

  const handleSelect = (address: IAddress) => {
    if (selectedAddresses.find((a) => a.id === address.id)) {
      setSelectedAddresses(selectedAddresses.filter((a) => a.id !== address.id));
    } else {
      setSelectedAddresses([...selectedAddresses, address]);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'load':
        return '상차지';
      case 'drop':
        return '하차지';
      case 'any':
        return '상/하차지';
      default:
        return type;
    }
  };

  // 자주 사용하는 주소 토글 핸들러
  const handleToggleFrequent = (address: IAddress) => {
    if (onToggleFrequent) {
      onToggleFrequent(address);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAddresses.length === addresses.length && addresses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>유형</TableHead>
              <TableHead>상/하차지명</TableHead>
              <TableHead>도로명 주소</TableHead>
              {/*<TableHead>지번 주소</TableHead>*/}
              <TableHead>상세 주소</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>자주 사용</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.map((address) => (
              <TableRow key={address.id}>                
                <TableCell>
                  <Checkbox
                    checked={selectedAddresses.some((a) => a.id === address.id)}
                    onCheckedChange={() => handleSelect(address)}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={address.type === 'load' ? 'default' : 'secondary'}>
                    {getTypeLabel(address.type)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {address.name}
                </TableCell>
                <TableCell>{address.roadAddress}</TableCell>
                {/*<TableCell>{address.jibunAddress}</TableCell>*/}
                <TableCell>{address.detailAddress}</TableCell>
                <TableCell>{address.contactName}</TableCell>
                <TableCell>{address.contactPhone}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleToggleFrequent(address)}
                        >
                          {address.isFrequent ? (
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {address.isFrequent ? '자주 사용 해제하기' : '자주 사용 등록하기'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    className="h-8 w-8 mr-4"
                    onClick={() => onEdit?.(address)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="default"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => onDeleteSingle(address)}
                  >
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="destructive"
          onClick={() => onDeleteSelected(selectedAddresses)}
          disabled={selectedAddresses.length === 0}
        >
          {selectedAddresses.length > 0
            ? `선택 삭제 (${selectedAddresses.length})`
            : "선택 삭제"}
        </Button>

        {!hidePagenation && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)}
                  isActive={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(currentPage + 1)}
                  isActive={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}