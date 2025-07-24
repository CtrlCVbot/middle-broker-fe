import { MessageDrawer } from '@/components/sms/message-drawer';

export default function TestSmsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SMS 기능 테스트</h1>
        <p className="text-gray-600">문자 메시지 발송 기능을 테스트할 수 있습니다.</p>
      </div>
      
      <MessageDrawer orderId="test-order-123" />
    </div>
  );
} 