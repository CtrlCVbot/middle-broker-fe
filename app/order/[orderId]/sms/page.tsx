import { MessageDrawer } from '@/components/sms/message-drawer';

interface ISmsPageProps {
  params: {
    orderId: string;
  };
}

export default function SmsPage({ params }: ISmsPageProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">문자 메시지 발송</h1>
        <p className="text-gray-600">화물 ID: {params.orderId}</p>
      </div>
      
      <MessageDrawer orderId={params.orderId} />
    </div>
  );
} 