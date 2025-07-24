import { MessageDrawer } from '@/components/sms/message-drawer';

interface ISmsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function SmsPage({ params }: ISmsPageProps) {
  const { orderId } = await params;
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">문자 메시지 발송</h1>
        <p className="text-gray-600">화물 ID: {orderId}</p>
      </div>
      
      <MessageDrawer orderId={orderId} />
    </div>
  );
} 