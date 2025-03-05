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

interface IAddressTableProps {
  addresses: IAddress[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDeleteSelected: (addresses: IAddress[]) => void;
  onDeleteSingle: (address: IAddress) => void;
}

export function AddressTable({
  addresses,
  totalPages,
  currentPage,
  onPageChange,
  onDeleteSelected,
  onDeleteSingle,
}: IAddressTableProps) {
  const [selectedAddresses, setSelectedAddresses] = useState<IAddress[]>([]);

  // 체크박스 선택 처리
  const handleCheckboxChange = (checked: boolean | "indeterminate", address: IAddress) => {
    if (checked) {
      setSelectedAddresses((prev) => [...prev, address]);
    } else {
      setSelectedAddresses((prev) =>
        prev.filter((item) => item.id !== address.id)
      );
    }
  };

  // 전체 선택 처리
  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedAddresses(addresses);
    } else {
      setSelectedAddresses([]);
    }
  };

  // 선택된 주소 삭제
  const handleDeleteSelected = () => {
    if (selectedAddresses.length > 0) {
      onDeleteSelected(selectedAddresses);
    }
  };

  // 주소 목록이 비어있는 경우
  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-md">
        <p className="text-gray-500 mb-4">등록된 주소가 없습니다.</p>
        <Button variant="outline">주소 추가하기</Button>
      </div>
    );
  }

  // 페이지 렌더링
  const renderPagination = () => {
    const pagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => onPageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(currentPage - 1)} />
            </PaginationItem>
          )}
          
          {pages}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          {selectedAddresses.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected}>
              선택 삭제 ({selectedAddresses.length}개)
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    addresses.length > 0 && selectedAddresses.length === addresses.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="전체 선택"
                />
              </TableHead>
              <TableHead className="w-[200px]">상/하차지명</TableHead>
              <TableHead>주소</TableHead>
              <TableHead className="w-[150px]">연락처</TableHead>
              <TableHead className="w-[100px]">담당자</TableHead>
              <TableHead className="w-[100px]">유형</TableHead>
              <TableHead className="w-[80px]">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.map((address) => (
              <TableRow key={address.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedAddresses.some((a) => a.id === address.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(checked, address)
                    }
                    aria-label={`선택 ${address.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{address.name}</TableCell>
                <TableCell>{address.address}</TableCell>
                <TableCell>{address.contact}</TableCell>
                <TableCell>{address.manager}</TableCell>
                <TableCell>{address.type}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
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

      {renderPagination()}
    </div>
  );
}