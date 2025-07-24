export type SmsMessageType = 'complete' | 'update' | 'cancel' | 'custom';

export type SmsRequestStatus = 'pending' | 'dispatched' | 'failed';

export type SmsDeliveryStatus = 'pending' | 'success' | 'failed' | 'invalid_number';

export type SmsRoleType = 'requester' | 'shipper' | 'load' | 'unload' | 'broker' | 'driver';

export interface ISmsRecipient {
  name: string;
  phone: string;
  role: SmsRoleType;
  id?: string; // order_participant_id optional
}

export interface ISmsDispatchRequest {
  orderId: string;
  senderId?: string;
  messageType: SmsMessageType;
  messageBody: string;
  recipients: ISmsRecipient[];
}

export interface ISmsDispatchResponse {
  messageId: string;
  status: SmsRequestStatus;
  successCount: number;
  failureCount: number;
  results: Array<{
    phone: string;
    status: SmsDeliveryStatus;
    errorMessage?: string;
    apiMessageId?: string;
  }>;
}

export interface ISmsTemplate {
  id: string;
  roleType: SmsRoleType;
  messageType: SmsMessageType;
  templateBody: string;
  isActive: boolean;
}

export interface ISmsHistoryItem {
  messageId: string;
  createdAt: string;
  messageType: SmsMessageType;
  messageBody: string;
  requestStatus: SmsRequestStatus;
  recipients: Array<{
    name: string;
    phone: string;
    role: SmsRoleType;
    status: SmsDeliveryStatus;
    errorMessage?: string;
  }>;
}

export interface ISmsRecommendedRecipient {
  name: string;
  phone: string;
  roleType: SmsRoleType;
} 