import AddressClientPage from "@/components/address/address-client-page";

/**
 * 주소록 관리 페이지
 * - 클라이언트 컴포넌트를 사용하여 주소록 관리 기능 구현
 */
export default function AddressPage() {
  return <AddressClientPage />;
}

export const metadata = {
  title: "주소록 관리",
  description: "상/하차지 주소록을 관리합니다.",
};