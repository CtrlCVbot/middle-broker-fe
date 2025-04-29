import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon, MapPin, Building, Loader2, Star } from 'lucide-react';
import { IAddress } from "@/types/address";
import useAddressStore from "@/store/address-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ISearchAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (address: IAddress) => void;
}

export function SearchAddressDialog({ open, onOpenChange, onSelect }: ISearchAddressDialogProps) {
  // Zustand 스토어에서 주소 관련 상태 및 액션 가져오기
  const {
    addresses,
    frequentAddresses,
    isLoading,
    isLoadingFrequent,
    fetchAddresses,
    fetchFrequentAddresses,
  } = useAddressStore();

  // 로컬 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filteredAddresses, setFilteredAddresses] = useState<IAddress[]>([]);

  // 컴포넌트 마운트 시 주소 데이터 로드
  useEffect(() => {
    if (open) {
      fetchAddresses();
      fetchFrequentAddresses();
    }
  }, [open, fetchAddresses, fetchFrequentAddresses]);

  // 검색 결과 필터링
  useEffect(() => {
    if (activeTab === "all") {
      if (searchQuery.trim() === '') {
        setFilteredAddresses(addresses);
      } else {
        const filtered = addresses.filter(address => 
          address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.addressName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.detailAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.contact?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredAddresses(filtered);
      }
    } else {
      // 자주 사용 탭에서는 frequentAddresses 사용
      if (searchQuery.trim() === '') {
        setFilteredAddresses(frequentAddresses);
      } else {
        const filtered = frequentAddresses.filter(address => 
          address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.addressName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.detailAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.contact?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredAddresses(filtered);
      }
    }
  }, [searchQuery, addresses, frequentAddresses, activeTab]);

  // 검색 처리
  const handleSearch = useCallback(() => {
    setSearching(true);
    setSearchError(null);
    
    try {
      // 검색 쿼리가 비어있으면 모든 주소 표시
      if (searchQuery.trim() === '') {
        setFilteredAddresses(activeTab === "all" ? addresses : frequentAddresses);
      } else {
        // 아니면 필터링 적용 (이미 useEffect에서 처리됨)
      }
      
      if (filteredAddresses.length === 0) {
        setSearchError('검색 결과가 없습니다.');
      }
    } catch (error) {
      setSearchError('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, addresses, frequentAddresses, activeTab, filteredAddresses.length]);

  // 주소 선택 처리
  const handleSelect = (address: IAddress) => {
    onSelect(address);
    onOpenChange(false);
  };

  // 탭 변경 처리
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery('');
    
    if (tab === "frequent") {
      setFilteredAddresses(frequentAddresses);
    } else {
      setFilteredAddresses(addresses);
    }
  };

  // 로딩 중 표시
  const renderLoading = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // 에러 또는 빈 결과 표시
  const renderNoResults = (message: string = "등록된 주소가 없습니다") => (
    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
      <p>{message}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>주소록에서 선택</DialogTitle>
          <DialogDescription>
            등록된 주소록에서 주소를 검색하고 선택하세요
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 my-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="주소명, 주소, 상세주소 검색"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <SearchIcon className="h-4 w-4 mr-2" />}
            {searching ? '검색 중' : '검색'}
          </Button>
        </div>
        
        {searchError && (
          <div className="text-sm text-red-500 p-2 rounded-md bg-red-50 mb-2">{searchError}</div>
        )}
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-2">
            <TabsTrigger value="all">
              전체 주소
              <Badge className="ml-2" variant="outline">
                {addresses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="frequent">
              자주 사용
              <Badge className="ml-2" variant="outline">
                {frequentAddresses.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            {isLoading ? renderLoading() : (
              filteredAddresses.length === 0 ? renderNoResults("등록된 주소가 없습니다") : (
                <ScrollArea className="h-[350px] rounded-md border border-input p-1">
                  <div className="space-y-1">
                    {filteredAddresses.map((address) => (
                      <DialogClose key={address.id} asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left p-3 h-auto"
                          onClick={() => handleSelect(address)}
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-start">
                              <Building className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-primary" />
                              <span className="font-medium">{address.name}</span>
                              {address.isFrequent && (
                                <Star className="h-4 w-4 ml-1 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex items-start text-sm text-muted-foreground pl-6">
                              <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                              <span>{address.addressName}</span>
                            </div>
                            {address.detailAddress && (
                              <div className="text-sm text-muted-foreground pl-6">
                                상세주소: {address.detailAddress}
                              </div>
                            )}
                            {address.contact && (
                              <div className="text-sm text-muted-foreground pl-6">
                                연락처: {address.contact}
                              </div>
                            )}
                          </div>
                        </Button>
                      </DialogClose>
                    ))}
                  </div>
                </ScrollArea>
              )
            )}
          </TabsContent>

          <TabsContent value="frequent" className="m-0">
            {isLoadingFrequent ? renderLoading() : (
              filteredAddresses.length === 0 ? renderNoResults("자주 사용하는 주소가 없습니다") : (
                <ScrollArea className="h-[350px] rounded-md border border-input p-1">
                  <div className="space-y-1">
                    {filteredAddresses.map((address) => (
                      <DialogClose key={address.id} asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left p-3 h-auto"
                          onClick={() => handleSelect(address)}
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-start">
                              <Building className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-primary" />
                              <span className="font-medium">{address.name}</span>
                              <Star className="h-4 w-4 ml-1 text-yellow-500" />
                            </div>
                            <div className="flex items-start text-sm text-muted-foreground pl-6">
                              <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                              <span>{address.addressName}</span>
                            </div>
                            {address.detailAddress && (
                              <div className="text-sm text-muted-foreground pl-6">
                                상세주소: {address.detailAddress}
                              </div>
                            )}
                            {address.contact && (
                              <div className="text-sm text-muted-foreground pl-6">
                                연락처: {address.contact}
                              </div>
                            )}
                          </div>
                        </Button>
                      </DialogClose>
                    ))}
                  </div>
                </ScrollArea>
              )
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
