import { create } from 'zustand';
import { ISmsRecipient, SmsMessageType } from '@/types/sms';

interface ISmsState {
  // 상태
  recipients: ISmsRecipient[];
  message: string;
  messageType: SmsMessageType;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  setRecipients: (list: ISmsRecipient[]) => void;
  addRecipient: (item: ISmsRecipient) => void;
  removeRecipient: (phone: string) => void;
  setMessage: (msg: string) => void;
  setMessageType: (type: SmsMessageType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSmsStore = create<ISmsState>((set, get) => ({
  // 초기 상태
  recipients: [],
  message: '',
  messageType: 'complete',
  isLoading: false,
  error: null,

  // 액션들
  setRecipients: (list) => set({ recipients: list }),
  
  addRecipient: (item) => {
    const { recipients } = get();
    // 중복 체크
    const isDuplicate = recipients.some(
      (recipient) => recipient.phone === item.phone
    );
    
    if (isDuplicate) {
      set({ error: '이미 추가된 수신자입니다' });
      return;
    }
    
    set((state) => ({ 
      recipients: [...state.recipients, item],
      error: null 
    }));
  },
  
  removeRecipient: (phone) =>
    set((state) => ({ 
      recipients: state.recipients.filter((r) => r.phone !== phone) 
    })),
  
  setMessage: (msg) => set({ message: msg }),
  
  setMessageType: (type) => set({ messageType: type }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    recipients: [],
    message: '',
    messageType: 'complete',
    isLoading: false,
    error: null,
  }),
})); 