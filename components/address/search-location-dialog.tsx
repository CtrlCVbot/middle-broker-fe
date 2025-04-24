import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon, MapPin, Building, Loader2 } from 'lucide-react';

// 카카오 주소 검색 결과 인터페이스
export interface IKakaoAddressResult {
  place_name: string;
  distance: string;
  place_url: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  id: string;
  phone: string;
  category_group_code: string;
  category_group_name: string;
  x: string;
  y: string;
}

interface ISearchLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: IKakaoAddressResult) => void;
}

export function SearchLocationDialog({ open, onOpenChange, onSelect }: ISearchLocationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IKakaoAddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`/api/external/kakao/local/search-address?query=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error('주소 검색 중 오류가 발생했습니다.');
      const data = await response.json();
      if (data.documents && Array.isArray(data.documents)) {
        setSearchResults(data.documents);
      } else {
        setSearchResults([]);
        setSearchError('검색 결과가 없습니다.');
      }
    } catch (error) {
      setSearchError('주소 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (result: IKakaoAddressResult) => {
    onSelect(result);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>주소 검색</DialogTitle>
          <DialogDescription>
            찾으시는 주소의 도로명, 지번, 건물명을 입력하세요
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 my-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="예: 강남구 역삼동, 테헤란로 152"
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
        {searchResults.length > 0 && (
          <ScrollArea className="h-[350px] rounded-md border border-input p-1">
            <div className="space-y-1">
              {searchResults.map((result) => (
                <DialogClose key={result.id} asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 h-auto"
                    onClick={() => handleSelect(result)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-primary" />
                        <span className="font-medium">{result.place_name || result.address_name}</span>
                      </div>
                      {result.road_address_name && (
                        <div className="flex items-start text-sm text-muted-foreground pl-6">
                          <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                          <span>{result.road_address_name}</span>
                        </div>
                      )}
                      {result.address_name && result.road_address_name !== result.address_name && (
                        <div className="flex items-start text-sm text-muted-foreground pl-6">
                          <MapPin className="h-3.5 w-3.5 mr-2 shrink-0 mt-0.5" />
                          <span>{result.address_name}</span>
                        </div>
                      )}
                      {result.phone && (
                        <div className="text-sm text-muted-foreground pl-6">
                          연락처: {result.phone}
                        </div>
                      )}
                    </div>
                  </Button>
                </DialogClose>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
