import { ISmsDispatchRequest, ISmsDispatchResponse, ISmsTemplate, ISmsHistoryItem, ISmsRecommendedRecipient } from '@/types/sms';

/**
 * 문자 발송 서비스
 */
export const sendSms = async (
  payload: ISmsDispatchRequest
): Promise<ISmsDispatchResponse> => {
  const res = await fetch('/api/sms/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '문자 발송에 실패했습니다');
  }

  return res.json();
};

/**
 * 추천 수신자 조회
 */
export const fetchRecommendedRecipients = async (orderId: string): Promise<ISmsRecommendedRecipient[]> => {
  const res = await fetch(`/api/sms/recommend/${orderId}`);
  
  if (!res.ok) {
    throw new Error('추천 수신자 조회에 실패했습니다');
  }
  
  return res.json();
};

/**
 * 템플릿 목록 조회
 */
export const fetchTemplates = async (
  roleType?: string,
  messageType?: string
): Promise<ISmsTemplate[]> => {
  const params = new URLSearchParams();
  if (roleType) params.append('roleType', roleType);
  if (messageType) params.append('messageType', messageType);
  
  const res = await fetch(`/api/sms/templates?${params.toString()}`);
  
  if (!res.ok) {
    throw new Error('템플릿 조회에 실패했습니다');
  }
  
  return res.json();
};

/**
 * 문자 발송 이력 조회
 */
export const fetchSmsHistory = async (orderId: string): Promise<ISmsHistoryItem[]> => {
  const res = await fetch(`/api/sms/history/${orderId}`);
  
  if (!res.ok) {
    throw new Error('문자 이력 조회에 실패했습니다');
  }
  
  return res.json();
}; 